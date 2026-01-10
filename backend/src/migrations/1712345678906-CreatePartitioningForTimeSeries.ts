import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePartitioningForTimeSeries1712345678906 implements MigrationInterface {
  name = 'CreatePartitioningForTimeSeries1712345678906';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS audit_logs CASCADE;
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(255),
        user_id UUID,
        user_email VARCHAR(255),
        user_ip VARCHAR(45),
        user_agent TEXT,
        old_values JSONB DEFAULT '{}'::jsonb,
        new_values JSONB DEFAULT '{}'::jsonb,
        changed_fields JSONB DEFAULT '[]'::jsonb,
        description TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        success BOOLEAN DEFAULT true,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      ) PARTITION BY RANGE (created_at);
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS system_metrics CASCADE;
      CREATE TABLE system_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_name VARCHAR(100) NOT NULL,
        metric_type VARCHAR(20) NOT NULL,
        value NUMERIC NOT NULL,
        unit VARCHAR(20),
        labels JSONB DEFAULT '{}'::jsonb,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      ) PARTITION BY RANGE (timestamp);
    `);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    for (let year = currentYear; year <= currentYear + 2; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const startDate = `${year}-${monthStr}-01`;
        const endDate = month === 12 ? `${year + 1}-01-01` : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

        if (year === currentYear && month >= currentMonth - 1) {
          await queryRunner.query(`
            CREATE TABLE audit_logs_y${year}m${monthStr} PARTITION OF audit_logs
              FOR VALUES FROM ('${startDate}') TO ('${endDate}');
          `);

          await queryRunner.query(`
            CREATE TABLE system_metrics_y${year}m${monthStr} PARTITION OF system_metrics
              FOR VALUES FROM ('${startDate}') TO ('${endDate}');
          `);
        }
      }
    }

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION create_monthly_partition(table_name TEXT, start_date DATE)
      RETURNS VOID AS $$
      DECLARE
        partition_name TEXT;
        end_date DATE;
      BEGIN
        partition_name := table_name || '_y' || to_char(start_date, 'YYYY') || 'm' || to_char(start_date, 'MM');
        end_date := start_date + interval '1 month';
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                       partition_name, table_name, start_date, end_date);
        
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (created_at DESC)',
                       'idx_' || partition_name || '_created_at', partition_name);
                       
        IF table_name = 'system_metrics' THEN
          EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (timestamp DESC)',
                         'idx_' || partition_name || '_timestamp', partition_name);
          EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (metric_name, timestamp)',
                         'idx_' || partition_name || '_metric_timestamp', partition_name);
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION auto_create_partitions()
      RETURNS void AS $$
      DECLARE
        current_month DATE;
        next_month DATE;
      BEGIN
        current_month := date_trunc('month', CURRENT_DATE);
        next_month := current_month + interval '1 month';
        
        PERFORM create_monthly_partition('audit_logs', current_month);
        PERFORM create_monthly_partition('audit_logs', next_month);
        PERFORM create_monthly_partition('system_metrics', current_month);
        PERFORM create_monthly_partition('system_metrics', next_month);
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION drop_old_partitions()
      RETURNS void AS $$
      DECLARE
        cutoff_date DATE;
        partition_record RECORD;
      BEGIN
        cutoff_date := CURRENT_DATE - interval '2 years';
        
        FOR partition_record IN 
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_name LIKE 'audit_logs_y%' 
            AND table_name < 'audit_logs_y' || to_char(cutoff_date, 'YYYY') || 'm' || to_char(cutoff_date, 'MM')
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || partition_record.table_name || ' CASCADE';
        END LOOP;
        
        FOR partition_record IN 
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_name LIKE 'system_metrics_y%' 
            AND table_name < 'system_metrics_y' || to_char(cutoff_date, 'YYYY') || 'm' || to_char(cutoff_date, 'MM')
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || partition_record.table_name || ' CASCADE';
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      SELECT cron.schedule('create-partitions', '0 0 1 * *', 'SELECT auto_create_partitions();');
    `);

    await queryRunner.query(`
      SELECT cron.schedule('drop-old-partitions', '0 2 1 * *', 'SELECT drop_old_partitions();');
    `);

    const indexes = [
      { table: 'audit_logs_y' + currentYear + 'm' + currentMonth.toString().padStart(2, '0'), columns: ['user_id'] },
      { table: 'audit_logs_y' + currentYear + 'm' + currentMonth.toString().padStart(2, '0'), columns: ['resource_type', 'resource_id'] },
      { table: 'audit_logs_y' + currentYear + 'm' + currentMonth.toString().padStart(2, '0'), columns: ['action'] },
      { table: 'system_metrics_y' + currentYear + 'm' + currentMonth.toString().padStart(2, '0'), columns: ['metric_name'] },
    ];

    for (const index of indexes) {
      await queryRunner.createIndex(
        index.table,
        new Index(`idx_${index.table}_${index.columns.join('_')}`, index.columns),
      );
    }

    await queryRunner.query(`
      CREATE TRIGGER audit_platform_users_trigger
        AFTER INSERT OR UPDATE OR DELETE ON platform_users
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER audit_alert_rules_trigger
        AFTER INSERT OR UPDATE OR DELETE ON alert_rules
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER audit_alerts_trigger
        AFTER INSERT OR UPDATE OR DELETE ON alerts
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER audit_nb_accounts_trigger
        AFTER INSERT OR UPDATE OR DELETE ON nb_accounts
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER audit_nb_groups_trigger
        AFTER INSERT OR UPDATE OR DELETE ON nb_groups
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER audit_nb_policies_trigger
        AFTER INSERT OR UPDATE OR DELETE ON nb_policies
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER audit_nb_setup_keys_trigger
        AFTER INSERT OR UPDATE OR DELETE ON nb_setup_keys
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER audit_platform_settings_trigger
        AFTER INSERT OR UPDATE OR DELETE ON platform_settings
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER audit_api_integrations_trigger
        AFTER INSERT OR UPDATE OR DELETE ON api_integrations
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SELECT cron.unschedule(\'create-partitions\');');
    await queryRunner.query('SELECT cron.unschedule(\'drop-old-partitions\');');
    await queryRunner.query('DROP FUNCTION IF EXISTS drop_old_partitions;');
    await queryRunner.query('DROP FUNCTION IF EXISTS auto_create_partitions;');
    await queryRunner.query('DROP FUNCTION IF EXISTS create_monthly_partition;');
    
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE 'audit_logs_%' OR table_name LIKE 'system_metrics_%'
    `);
    
    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS ${table.table_name} CASCADE;`);
    }
    
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS system_metrics CASCADE;`);
  }
}