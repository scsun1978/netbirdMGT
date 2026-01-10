import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedInitialData1712345678907 implements MigrationInterface {
  name = 'SeedInitialData1712345678907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordHash = await bcrypt.hash('admin123', 10);

    await queryRunner.query(`
      INSERT INTO platform_users (id, email, password_hash, first_name, last_name, role, is_active)
      VALUES (
        gen_random_uuid(),
        'admin@netbird.local',
        '${passwordHash}',
        'System',
        'Administrator',
        'admin',
        true
      )
      ON CONFLICT (email) DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO platform_users (id, email, password_hash, first_name, last_name, role, is_active)
      VALUES (
        gen_random_uuid(),
        'operator@netbird.local',
        '${passwordHash}',
        'System',
        'Operator',
        'operator',
        true
      )
      ON CONFLICT (email) DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO platform_settings (category, key, value, description, is_public)
      VALUES 
        ('general', 'site_name', '"NetBird Management Platform"', 'Platform display name', true),
        ('general', 'timezone', '"UTC"', 'Default timezone for the platform', true),
        ('general', 'date_format', '"YYYY-MM-DD"', 'Default date format', true),
        ('general', 'time_format', '"24h"', 'Time format: 12h or 24h', true),
        ('alerts', 'default_severity', '"medium"', 'Default alert severity level', false),
        ('alerts', 'auto_resolve_hours', '24', 'Auto-resolve alerts after X hours', false),
        ('alerts', 'max_alerts_per_rule', '100', 'Maximum alerts per rule before auto-suppression', false),
        ('notifications', 'email_enabled', 'true', 'Enable email notifications', false),
        ('notifications', 'webhook_enabled', 'false', 'Enable webhook notifications', false),
        ('notifications', 'retry_attempts', '3', 'Number of retry attempts for failed notifications', false),
        ('ui', 'theme', '"light"', 'Default UI theme', true),
        ('ui', 'language', '"en"', 'Default language', true),
        ('ui', 'items_per_page', '25', 'Default number of items per page in tables', true),
        ('security', 'session_timeout', '3600', 'Session timeout in seconds', false),
        ('security', 'max_login_attempts', '5', 'Maximum login attempts before lockout', false),
        ('security', 'password_min_length', '8', 'Minimum password length', false),
        ('integrations', 'netbird_sync_interval', '300', 'NetBird data sync interval in seconds', false),
        ('integrations', 'metrics_retention_days', '90', 'Number of days to retain system metrics', false)
      ON CONFLICT (category, key) DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO alert_rules (id, name, description, rule_type, conditions, severity, threshold_value, threshold_period, is_enabled, notification_channels, created_by_id)
      VALUES 
        (
          gen_random_uuid(),
          'Peer Offline Alert',
          'Alert when a peer goes offline for more than 5 minutes',
          'peer_offline',
          '{"duration": 300}',
          'high',
          5,
          5,
          true,
          '[]',
          (SELECT id FROM platform_users WHERE email = 'admin@netbird.local' LIMIT 1)
        ),
        (
          gen_random_uuid(),
          'High Peer Flapping',
          'Alert when a peer connects/disconnects more than 10 times in 30 minutes',
          'peer_flapping',
          '{"count": 10, "period": 1800}',
          'medium',
          10,
          30,
          true,
          '[]',
          (SELECT id FROM platform_users WHERE email = 'admin@netbird.local' LIMIT 1)
        ),
        (
          gen_random_uuid(),
          'Group Health Monitor',
          'Alert when more than 50% of peers in a group are offline',
          'group_health',
          '{"offline_percentage": 50}',
          'critical',
          50,
          10,
          true,
          '[]',
          (SELECT id FROM platform_users WHERE email = 'admin@netbird.local' LIMIT 1)
        ),
        (
          gen_random_uuid(),
          'Network Status Monitor',
          'Alert when total network connectivity drops below 75%',
          'network_status',
          '{"connectivity_threshold": 75}',
          'high',
          75,
          15,
          true,
          '[]',
          (SELECT id FROM platform_users WHERE email = 'admin@netbird.local' LIMIT 1)
        ),
        (
          gen_random_uuid(),
          'System Error Monitor',
          'Alert on any system-level errors or exceptions',
          'system_error',
          '{"error_types": ["database", "api", "authentication"]}',
          'critical',
          1,
          1,
          true,
          '[]',
          (SELECT id FROM platform_users WHERE email = 'admin@netbird.local' LIMIT 1)
        )
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO api_integrations (id, name, type, config, is_enabled, created_by_id)
      VALUES 
        (
          gen_random_uuid(),
          'Default Email Integration',
          'email',
          '{"smtp_host": "localhost", "smtp_port": 587, "smtp_secure": false, "from_email": "alerts@netbird.local", "from_name": "NetBird Alerts"}',
          false,
          (SELECT id FROM platform_users WHERE email = 'admin@netbird.local' LIMIT 1)
        ),
        (
          gen_random_uuid(),
          'Default Webhook Integration',
          'webhook',
          '{"url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL", "method": "POST", "headers": {"Content-Type": "application/json"}}',
          false,
          (SELECT id FROM platform_users WHERE email = 'admin@netbird.local' LIMIT 1)
        )
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO system_metrics (metric_name, metric_type, value, unit, labels, timestamp)
      VALUES 
        ('system_startup', 'counter', 1, 'count', '{"event": "initialization"}', NOW()),
        ('total_users', 'gauge', (SELECT COUNT(*) FROM platform_users), 'users', '{"type": "platform"}', NOW()),
        ('total_accounts', 'gauge', 0, 'accounts', '{"type": "netbird"}', NOW()),
        ('cpu_usage', 'gauge', 5.2, 'percent', '{"component": "system"}', NOW()),
        ('memory_usage', 'gauge', 45.8, 'percent', '{"component": "system"}', NOW()),
        ('disk_usage', 'gauge', 23.1, 'percent', '{"component": "system"}', NOW()),
        ('active_alert_rules', 'gauge', (SELECT COUNT(*) FROM alert_rules WHERE is_enabled = true), 'rules', '{"type": "alerting"}', NOW()),
        ('open_alerts', 'gauge', 0, 'alerts', '{"status": "open"}', NOW())
      ON CONFLICT DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM system_metrics WHERE metric_name IN (\'system_startup\', \'total_users\', \'total_accounts\', \'cpu_usage\', \'memory_usage\', \'disk_usage\', \'active_alert_rules\', \'open_alerts\')');
    await queryRunner.query('DELETE FROM api_integrations WHERE name IN (\'Default Email Integration\', \'Default Webhook Integration\')');
    await queryRunner.query('DELETE FROM alert_rules WHERE name IN (\'Peer Offline Alert\', \'High Peer Flapping\', \'Group Health Monitor\', \'Network Status Monitor\', \'System Error Monitor\')');
    await queryRunner.query('DELETE FROM platform_settings WHERE key IN (\'site_name\', \'timezone\', \'date_format\', \'time_format\', \'default_severity\', \'auto_resolve_hours\', \'max_alerts_per_rule\', \'email_enabled\', \'webhook_enabled\', \'retry_attempts\', \'theme\', \'language\', \'items_per_page\', \'session_timeout\', \'max_login_attempts\', \'password_min_length\', \'netbird_sync_interval\', \'metrics_retention_days\')');
    await queryRunner.query('DELETE FROM platform_users WHERE email IN (\'admin@netbird.local\', \'operator@netbird.local\')');
  }
}