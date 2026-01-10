import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDatabaseViews1712345678905 implements MigrationInterface {
  name = 'CreateDatabaseViews1712345678905';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE VIEW alert_summary AS
      SELECT 
        ar.id as rule_id,
        ar.name as rule_name,
        COUNT(a.id) as total_alerts,
        COUNT(CASE WHEN a.status = 'open' THEN 1 END) as open_alerts,
        COUNT(CASE WHEN a.status = 'acknowledged' THEN 1 END) as acknowledged_alerts,
        COUNT(CASE WHEN a.status = 'resolved' THEN 1 END) as resolved_alerts,
        COUNT(CASE WHEN a.status = 'suppressed' THEN 1 END) as suppressed_alerts,
        MAX(a.triggered_at) as last_alert_at,
        ar.severity as rule_severity,
        ar.is_enabled
      FROM alert_rules ar
      LEFT JOIN alerts a ON ar.id = a.rule_id
      WHERE ar.is_enabled = true
      GROUP BY ar.id, ar.name, ar.severity, ar.is_enabled;
    `);

    await queryRunner.query(`
      CREATE VIEW peer_status_summary AS
      SELECT 
        COUNT(*) as total_peers,
        COUNT(CASE WHEN status = 'connected' THEN 1 END) as connected_peers,
        COUNT(CASE WHEN status = 'disconnected' THEN 1 END) as disconnected_peers,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error_peers,
        COUNT(CASE WHEN last_seen > NOW() - interval '24 hours' THEN 1 END) as active_today,
        COUNT(CASE WHEN last_seen > NOW() - interval '7 days' THEN 1 END) as active_week,
        COUNT(CASE WHEN last_seen > NOW() - interval '30 days' THEN 1 END) as active_month,
        COUNT(CASE WHEN location_country IS NOT NULL THEN 1 END) as peers_with_location,
        COUNT(CASE WHEN desktop = true THEN 1 END) as desktop_peers,
        COUNT(CASE WHEN ssh_enabled = true THEN 1 END) as ssh_enabled_peers,
        COUNT(CASE WHEN dns_enabled = true THEN 1 END) as dns_enabled_peers,
        COUNT(CASE WHEN firewall_enabled = true THEN 1 END) as firewall_enabled_peers
      FROM nb_peers;
    `);

    await queryRunner.query(`
      CREATE VIEW account_summary AS
      SELECT 
        a.id as account_id,
        a.domain,
        a.is_active,
        a.created_at as account_created,
        u.email as owner_email,
        u.first_name || ' ' || u.last_name as owner_name,
        COUNT(DISTINCT p.id) as peer_count,
        COUNT(DISTINCT g.id) as group_count,
        COUNT(DISTINCT pol.id) as policy_count,
        COUNT(DISTINCT sk.id) as setup_key_count,
        COUNT(DISTINCT CASE WHEN p.status = 'connected' THEN p.id END) as active_peers,
        MAX(p.last_seen) as last_peer_activity
      FROM nb_accounts a
      LEFT JOIN platform_users u ON a.user_id = u.id
      LEFT JOIN nb_peers p ON a.id = p.account_id
      LEFT JOIN nb_groups g ON a.id = g.account_id
      LEFT JOIN nb_policies pol ON a.id = pol.account_id
      LEFT JOIN nb_setup_keys sk ON a.id = sk.account_id
      GROUP BY a.id, a.domain, a.is_active, a.created_at, u.email, u.first_name, u.last_name;
    `);

    await queryRunner.query(`
      CREATE VIEW recent_audit_logs AS
      SELECT 
        al.id,
        al.action,
        al.resource_type,
        al.resource_id,
        al.user_email,
        al.created_at,
        al.success,
        al.description,
        CASE 
          WHEN al.resource_type = 'user' THEN u.email
          WHEN al.resource_type = 'peer' THEN p.name
          WHEN al.resource_type = 'group' THEN g.name
          WHEN al.resource_type = 'policy' THEN pol.name
          WHEN al.resource_type = 'setup_key' THEN sk.name
          ELSE al.resource_id
        END as resource_name,
        CASE
          WHEN al.resource_type = 'nb_account' THEN acc.domain
          ELSE NULL
        END as additional_context
      FROM audit_logs al
      LEFT JOIN platform_users u ON al.resource_type = 'user' AND al.resource_id = u.id::text
      LEFT JOIN nb_peers p ON al.resource_type = 'peer' AND al.resource_id = p.id
      LEFT JOIN nb_groups g ON al.resource_type = 'group' AND al.resource_id = g.id
      LEFT JOIN nb_policies pol ON al.resource_type = 'policy' AND al.resource_id = pol.id
      LEFT JOIN nb_setup_keys sk ON al.resource_type = 'setup_key' AND al.resource_id = sk.id
      LEFT JOIN nb_accounts acc ON al.resource_type = 'nb_account' AND al.resource_id = acc.id::text
      ORDER BY al.created_at DESC;
    `);

    await queryRunner.query(`
      CREATE VIEW system_health AS
      WITH recent_metrics AS (
        SELECT 
          metric_name,
          value,
          timestamp
        FROM system_metrics 
        WHERE timestamp > NOW() - interval '1 hour'
      ),
        latest_metrics AS (
          SELECT DISTINCT ON (metric_name) 
            metric_name,
            value,
            timestamp
          FROM recent_metrics
          ORDER BY metric_name, timestamp DESC
        )
      SELECT 
        (SELECT COUNT(*) FROM platform_users WHERE is_active = true) as active_users,
        (SELECT COUNT(*) FROM nb_accounts WHERE is_active = true) as active_accounts,
        (SELECT COUNT(*) FROM nb_peers WHERE status = 'connected') as connected_peers,
        (SELECT COUNT(*) FROM alerts WHERE status = 'open') as open_alerts,
        (SELECT COUNT(*) FROM alerts WHERE triggered_at > NOW() - interval '24 hours') as alerts_today,
        (SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - interval '24 hours') as audit_events_today,
        (SELECT value FROM latest_metrics WHERE metric_name = 'cpu_usage') as cpu_usage,
        (SELECT value FROM latest_metrics WHERE metric_name = 'memory_usage') as memory_usage,
        (SELECT value FROM latest_metrics WHERE metric_name = 'disk_usage') as disk_usage,
        NOW() as last_updated;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS system_health');
    await queryRunner.query('DROP VIEW IF EXISTS recent_audit_logs');
    await queryRunner.query('DROP VIEW IF EXISTS account_summary');
    await queryRunner.query('DROP VIEW IF EXISTS peer_status_summary');
    await queryRunner.query('DROP VIEW IF EXISTS alert_summary');
  }
}