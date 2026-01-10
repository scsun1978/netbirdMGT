import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateAlertTables1712345678902 implements MigrationInterface {
  name = 'CreateAlertTables1712345678902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'alert_rules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'rule_type',
            type: 'enum',
            enum: ['peer_offline', 'peer_flapping', 'group_health', 'network_status', 'system_error'],
          },
          {
            name: 'conditions',
            type: 'jsonb',
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'critical'],
            default: "'medium'",
          },
          {
            name: 'threshold_value',
            type: 'numeric',
            isNullable: true,
          },
          {
            name: 'threshold_period',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'is_enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notification_channels',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'created_by_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
          {
            name: 'last_evaluated_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'evaluation_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'trigger_count',
            type: 'integer',
            default: 0,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'alerts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'rule_id',
            type: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'critical'],
            default: "'medium'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['open', 'acknowledged', 'resolved', 'suppressed'],
            default: "'open'",
          },
          {
            name: 'source_type',
            type: 'enum',
            enum: ['peer', 'group', 'network', 'system'],
          },
          {
            name: 'source_id',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'source_data',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'triggered_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
          {
            name: 'acknowledged_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'acknowledged_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'resolved_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'resolved_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'suppressed_until',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'tags',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'created_by_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'alert_notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'alert_id',
            type: 'uuid',
          },
          {
            name: 'channel_type',
            type: 'enum',
            enum: ['email', 'webhook', 'slack'],
          },
          {
            name: 'channel_config',
            type: 'jsonb',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'sent', 'failed', 'retry'],
            default: "'pending'",
          },
          {
            name: 'sent_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'response_data',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'retry_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'max_retries',
            type: 'integer',
            default: 3,
          },
          {
            name: 'next_retry_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    const indexes = [
      { table: 'alert_rules', columns: ['rule_type'] },
      { table: 'alert_rules', columns: ['severity'] },
      { table: 'alert_rules', columns: ['is_enabled'] },
      { table: 'alert_rules', columns: ['created_by_id'] },
      { table: 'alerts', columns: ['status'] },
      { table: 'alerts', columns: ['severity'] },
      { table: 'alerts', columns: ['triggered_at'] },
      { table: 'alerts', columns: ['source_type', 'source_id'] },
      { table: 'alerts', columns: ['rule_id'] },
      { table: 'alerts', columns: ['created_by_id'] },
      { table: 'alert_notifications', columns: ['alert_id'] },
      { table: 'alert_notifications', columns: ['channel_type'] },
      { table: 'alert_notifications', columns: ['status'] },
      { table: 'alert_notifications', columns: ['next_retry_at'] },
    ];

    for (const index of indexes) {
      await queryRunner.createIndex(
        index.table,
        new Index(`idx_${index.table}_${index.columns.join('_')}`, index.columns),
      );
    }

    await queryRunner.query(`
      CREATE TRIGGER update_alert_rules_updated_at 
        BEFORE UPDATE ON alert_rules 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_alerts_updated_at 
        BEFORE UPDATE ON alerts 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.createForeignKey(
      'alerts',
      {
        columnNames: ['rule_id'],
        referencedTableName: 'alert_rules',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      },
    );

    await queryRunner.createForeignKey(
      'alert_notifications',
      {
        columnNames: ['alert_id'],
        referencedTableName: 'alerts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      },
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('alert_notifications');
    await queryRunner.dropTable('alerts');
    await queryRunner.dropTable('alert_rules');
  }
}