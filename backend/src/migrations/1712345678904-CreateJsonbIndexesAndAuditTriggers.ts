import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJsonbIndexesAndAuditTriggers1712345678904 implements MigrationInterface {
  name = 'CreateJsonbIndexesAndAuditTriggers1712345678904';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const jsonbIndexes = [
      { table: 'nb_peers', column: 'meta' },
      { table: 'alerts', column: 'metadata' },
      { table: 'audit_logs', column: 'new_values' },
      { table: 'audit_logs', column: 'old_values' },
      { table: 'alert_rules', column: 'conditions' },
      { table: 'alert_rules', column: 'notification_channels' },
      { table: 'alerts', column: 'source_data' },
      { table: 'alerts', column: 'tags' },
      { table: 'alert_notifications', column: 'channel_config' },
      { table: 'alert_notifications', column: 'response_data' },
      { table: 'nb_groups', column: 'meta' },
      { table: 'nb_policies', column: 'rules' },
      { table: 'nb_policies', column: 'meta' },
      { table: 'nb_setup_keys', column: 'meta' },
      { table: 'audit_logs', column: 'metadata' },
      { table: 'audit_logs', column: 'changed_fields' },
      { table: 'system_metrics', column: 'labels' },
      { table: 'api_integrations', column: 'config' },
    ];

    for (const index of jsonbIndexes) {
      await queryRunner.query(`
        CREATE INDEX idx_${index.table}_${index.column}_gin 
        ON ${index.table} USING GIN(${index.column});
      `);
    }

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION audit_trigger_function()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          INSERT INTO audit_logs (action, resource_type, resource_id, new_values, user_id, created_at)
          VALUES ('create', TG_TABLE_NAME, NEW.id::text, row_to_json(NEW), NULL, NOW());
          RETURN NEW;
        ELSIF TG_OP = 'UPDATE' THEN
          INSERT INTO audit_logs (action, resource_type, resource_id, old_values, new_values, changed_fields, user_id, created_at)
          VALUES ('update', TG_TABLE_NAME, NEW.id::text, row_to_json(OLD), row_to_json(NEW), 
                  array(SELECT jsonb_object_keys(row_to_json(NEW) - row_to_json(OLD))), 
                  NULL, NOW());
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          INSERT INTO audit_logs (action, resource_type, resource_id, old_values, user_id, created_at)
          VALUES ('delete', TG_TABLE_NAME, OLD.id::text, row_to_json(OLD), NULL, NOW());
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    const auditTriggers = [
      'platform_users',
      'alert_rules',
      'alerts',
      'nb_accounts',
      'nb_groups',
      'nb_policies',
      'nb_setup_keys',
      'platform_settings',
      'api_integrations',
    ];

    for (const table of auditTriggers) {
      await queryRunner.query(`
        CREATE TRIGGER audit_${table}_trigger
          AFTER INSERT OR UPDATE OR DELETE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const jsonbIndexes = [
      'idx_nb_peers_meta_gin',
      'idx_alerts_metadata_gin',
      'idx_audit_logs_new_values_gin',
      'idx_audit_logs_old_values_gin',
      'idx_alert_rules_conditions_gin',
      'idx_alert_rules_notification_channels_gin',
      'idx_alerts_source_data_gin',
      'idx_alerts_tags_gin',
      'idx_alert_notifications_channel_config_gin',
      'idx_alert_notifications_response_data_gin',
      'idx_nb_groups_meta_gin',
      'idx_nb_policies_rules_gin',
      'idx_nb_policies_meta_gin',
      'idx_nb_setup_keys_meta_gin',
      'idx_audit_logs_metadata_gin',
      'idx_audit_logs_changed_fields_gin',
      'idx_system_metrics_labels_gin',
      'idx_api_integrations_config_gin',
    ];

    for (const index of jsonbIndexes) {
      await queryRunner.query(`DROP INDEX IF EXISTS ${index}`);
    }

    const auditTriggers = [
      'audit_platform_users_trigger',
      'audit_alert_rules_trigger',
      'audit_alerts_trigger',
      'audit_nb_accounts_trigger',
      'audit_nb_groups_trigger',
      'audit_nb_policies_trigger',
      'audit_nb_setup_keys_trigger',
      'audit_platform_settings_trigger',
      'audit_api_integrations_trigger',
    ];

    for (const trigger of auditTriggers) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS ${trigger} ON ${trigger.replace('audit_', '').replace('_trigger', '')}`);
    }

    await queryRunner.query('DROP FUNCTION IF EXISTS audit_trigger_function');
  }
}