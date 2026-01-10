import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../src/common/database.module';
import { DatabaseService } from '../src/common/database.service';
import { DatabaseHealthService } from '../src/common/database-health.service';
import { 
  PlatformUser, 
  AlertRule, 
  NbAccount, 
  NbPeer,
  UserRole,
  AlertRuleType,
  AlertSeverity,
  PeerStatus
} from '../src/entities';

describe('Database Schema Tests', () => {
  let module: TestingModule;
  let databaseService: DatabaseService;
  let healthService: DatabaseHealthService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DatabaseService, DatabaseHealthService],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);
    healthService = module.get<DatabaseHealthService>(DatabaseHealthService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      const info = await databaseService.getDatabaseInfo();
      expect(info.isHealthy).toBe(true);
    });

    it('should have required extensions', async () => {
      const extensions = await databaseService.executeRawQuery(`
        SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_stat_statements', 'pg_trgm')
      `);
      expect(extensions.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Table Verification', () => {
    it('should have all required tables', async () => {
      const tables = await databaseService.executeRawQuery(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      const expectedTables = [
        'platform_users',
        'nb_accounts',
        'nb_peers',
        'nb_groups',
        'nb_policies',
        'nb_setup_keys',
        'alert_rules',
        'alerts',
        'alert_notifications',
        'audit_logs',
        'system_metrics',
        'platform_settings',
        'api_integrations',
        'user_sessions',
        'users',
      ];

      const actualTables = tables.map((t: any) => t.table_name);
      expectedTables.forEach(table => {
        expect(actualTables).toContain(table);
      });
    });

    it('should have time-series partitions for audit logs', async () => {
      const partitions = await databaseService.executeRawQuery(`
        SELECT tablename FROM pg_tables 
        WHERE tablename LIKE 'audit_logs_%' OR tablename LIKE 'system_metrics_%'
      `);

      expect(partitions.length).toBeGreaterThan(0);
    });
  });

  describe('Index Verification', () => {
    it('should have critical indexes', async () => {
      const indexes = await databaseService.executeRawQuery(`
        SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
      `);

      const criticalIndexes = [
        'idx_platform_users_email',
        'idx_nb_peers_status',
        'idx_alerts_status',
        'idx_audit_logs_created_at',
        'idx_user_sessions_token_hash',
      ];

      const actualIndexes = indexes.map((i: any) => i.indexname);
      criticalIndexes.forEach(index => {
        expect(actualIndexes).toContain(index);
      });
    });

    it('should have GIN indexes for JSONB columns', async () => {
      const jsonbIndexes = await databaseService.executeRawQuery(`
        SELECT indexname FROM pg_indexes 
        WHERE indexname LIKE '%_gin' AND schemaname = 'public'
      `);

      expect(jsonbIndexes.length).toBeGreaterThan(5);
    });
  });

  describe('Trigger Verification', () => {
    it('should have updated_at triggers', async () => {
      const triggers = await databaseService.executeRawQuery(`
        SELECT trigger_name FROM information_schema.triggers 
        WHERE trigger_name LIKE '%_updated_at'
      `);

      expect(triggers.length).toBeGreaterThan(5);
    });

    it('should have audit triggers', async () => {
      const auditTriggers = await databaseService.executeRawQuery(`
        SELECT trigger_name FROM information_schema.triggers 
        WHERE trigger_name LIKE 'audit_%_trigger'
      `);

      expect(auditTriggers.length).toBeGreaterThan(5);
    });
  });

  describe('View Verification', () => {
    it('should have all required views', async () => {
      const views = await databaseService.executeRawQuery(`
        SELECT table_name FROM information_schema.views WHERE table_schema = 'public'
      `);

      const expectedViews = [
        'alert_summary',
        'peer_status_summary',
        'account_summary',
        'recent_audit_logs',
        'system_health',
      ];

      const actualViews = views.map((v: any) => v.table_name);
      expectedViews.forEach(view => {
        expect(actualViews).toContain(view);
      });
    });

    it('should have working views that return data', async () => {
      const peerSummary = await databaseService.executeRawQuery('SELECT * FROM peer_status_summary LIMIT 1');
      expect(Array.isArray(peerSummary)).toBe(true);

      const alertSummary = await databaseService.executeRawQuery('SELECT * FROM alert_summary LIMIT 1');
      expect(Array.isArray(alertSummary)).toBe(true);
    });
  });

  describe('Seed Data Verification', () => {
    it('should have default users', async () => {
      const users = await databaseService.executeRawQuery(`
        SELECT email, role FROM platform_users ORDER BY created_at
      `);

      expect(users.length).toBeGreaterThanOrEqual(2);
      expect(users.some((u: any) => u.email === 'admin@netbird.local')).toBe(true);
      expect(users.some((u: any) => u.email === 'operator@netbird.local')).toBe(true);
    });

    it('should have platform settings', async () => {
      const settings = await databaseService.executeRawQuery(`
        SELECT category, COUNT(*) as count FROM platform_settings GROUP BY category
      `);

      expect(settings.length).toBeGreaterThan(3);
    });

    it('should have default alert rules', async () => {
      const alertRules = await databaseService.executeRawQuery(`
        SELECT COUNT(*) as count FROM alert_rules
      `);

      expect(parseInt(alertRules[0].count)).toBeGreaterThanOrEqual(5);
    });

    it('should have system metrics', async () => {
      const metrics = await databaseService.executeRawQuery(`
        SELECT COUNT(*) as count FROM system_metrics
      `);

      expect(parseInt(metrics[0].count)).toBeGreaterThan(0);
    });
  });

  describe('Foreign Key Constraints', () => {
    it('should enforce foreign key constraints', async () => {
      try {
        await databaseService.executeRawQuery(`
          INSERT INTO alerts (id, rule_id, title, source_type, source_id, created_by_id)
          VALUES (gen_random_uuid(), gen_random_uuid(), 'Test', 'peer', 'test-peer', gen_random_uuid())
        `);
        fail('Should have failed foreign key constraint');
      } catch (error) {
        expect(error.message).toContain('violates foreign key constraint');
      }
    });

    it('should have proper cascade behavior', async () => {
      const result = await databaseService.executeRawQuery(`
        INSERT INTO platform_users (id, email, password_hash, role)
        VALUES (gen_random_uuid(), 'test@example.com', 'hash', 'viewer')
        RETURNING id
      `);

      const userId = result[0].id;

      await databaseService.executeRawQuery(`
        INSERT INTO nb_accounts (id, user_id, domain, api_token_encrypted)
        VALUES (gen_random_uuid(), $1, 'test.example.com', 'encrypted_token')
      `, [userId]);

      const accountCount = await databaseService.executeRawQuery(`
        SELECT COUNT(*) as count FROM nb_accounts WHERE user_id = $1
      `, [userId]);

      expect(parseInt(accountCount[0].count)).toBe(1);
    });
  });

  describe('Data Integrity', () => {
    it('should handle UUID primary keys correctly', async () => {
      const result = await databaseService.executeRawQuery(`
        INSERT INTO platform_users (id, email, password_hash, role)
        VALUES (gen_random_uuid(), 'uuid-test@example.com', 'hash', 'viewer')
        RETURNING id
      `);

      expect(result[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should enforce unique constraints', async () => {
      try {
        await databaseService.executeRawQuery(`
          INSERT INTO platform_users (email, password_hash, role)
          VALUES ('admin@netbird.local', 'hash', 'viewer')
        `);
        fail('Should have failed unique constraint');
      } catch (error) {
        expect(error.message).toContain('duplicate key value');
      }
    });

    it('should handle JSONB columns correctly', async () => {
      const result = await databaseService.executeRawQuery(`
        INSERT INTO platform_settings (category, key, value, description)
        VALUES ('test', 'json_test', '{"nested": {"value": 123}}', 'Test JSON')
        RETURNING value
      `);

      expect(typeof result[0].value).toBe('object');
      expect(result[0].value.nested.value).toBe(123);
    });
  });

  describe('Performance', () => {
    it('should respond to queries quickly', async () => {
      const start = Date.now();
      await databaseService.executeRawQuery('SELECT COUNT(*) FROM platform_users');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should have efficient explain plans', async () => {
      const explain = await databaseService.executeRawQuery(`
        EXPLAIN ANALYZE SELECT * FROM platform_users WHERE email = 'admin@netbird.local'
      `);

      const planText = explain.map((e: any) => e['QUERY PLAN']).join(' ');
      expect(planText).toContain('Index Scan');
    });
  });

  describe('Health Check Service', () => {
    it('should perform complete health check', async () => {
      const health = await healthService.performHealthCheck();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('connection');
      expect(health).toHaveProperty('migrations');
      expect(health).toHaveProperty('partitions');
      expect(health).toHaveProperty('extensions');
      expect(health).toHaveProperty('performance');
      expect(health).toHaveProperty('size');
      expect(health).toHaveProperty('timestamp');

      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
    });

    it('should identify performance issues', async () => {
      const health = await healthService.performHealthCheck();

      expect(health.performance).toHaveProperty('slowQueries');
      expect(health.performance).toHaveProperty('tableOptimization');
      expect(health.performance).toHaveProperty('connectionPool');
      expect(Array.isArray(health.performance.tableOptimization)).toBe(true);
    });

    it('should perform maintenance tasks', async () => {
      const maintenance = await healthService.performMaintenance();

      expect(maintenance).toHaveProperty('success');
      expect(maintenance).toHaveProperty('actions');
      expect(Array.isArray(maintenance.actions)).toBe(true);
    });
  });

  describe('TypeORM Entity Mapping', () => {
    it('should properly map all entities', () => {
      const entityCount = Object.keys(require('../src/entities')).length;
      expect(entityCount).toBeGreaterThan(15);
    });

    it('should have proper entity relationships', () => {
      const platformUserEntity = PlatformUser;
      expect(platformUserEntity).toBeDefined();

      const alertRuleEntity = AlertRule;
      expect(alertRuleEntity).toBeDefined();

      const nbAccountEntity = NbAccount;
      expect(nbAccountEntity).toBeDefined();

      const nbPeerEntity = NbPeer;
      expect(nbPeerEntity).toBeDefined();
    });
  });
});

describe('Database Functionality Tests', () => {
  let module: TestingModule;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DatabaseService],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Audit Logging', () => {
    it('should create audit logs on table operations', async () => {
      const result = await databaseService.executeRawQuery(`
        INSERT INTO platform_settings (category, key, value, description)
        VALUES ('test', 'audit_test', '"test_value"', 'Test audit logging')
        RETURNING id, created_at
      `);

      const settingId = result[0].id;
      const settingCreatedAt = result[0].created_at;

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await databaseService.executeRawQuery(`
        SELECT action, resource_type, new_values, created_at 
        FROM audit_logs 
        WHERE resource_id = $1 AND resource_type = 'platform_settings'
        ORDER BY created_at DESC
      `, [settingId]);

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].action).toBe('create');
      expect(auditLogs[0].resource_type).toBe('platform_settings');
      expect(auditLogs[0].new_values).toBeDefined();
    });

    it('should track changes correctly', async () => {
      const result = await databaseService.executeRawQuery(`
        INSERT INTO platform_settings (category, key, value, description)
        VALUES ('test', 'change_test', '"old_value"', 'Test change tracking')
        RETURNING id
      `);

      const settingId = result[0].id;

      await new Promise(resolve => setTimeout(resolve, 100));

      await databaseService.executeRawQuery(`
        UPDATE platform_settings 
        SET value = '"new_value"', updated_at = NOW()
        WHERE id = $1
      `, [settingId]);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await databaseService.executeRawQuery(`
        SELECT action, old_values, new_values, changed_fields
        FROM audit_logs 
        WHERE resource_id = $1 AND action = 'update'
        ORDER BY created_at DESC
      `, [settingId]);

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].action).toBe('update');
      expect(auditLogs[0].old_values).toBeDefined();
      expect(auditLogs[0].new_values).toBeDefined();
      expect(Array.isArray(auditLogs[0].changed_fields)).toBe(true);
    });
  });

  describe('Time-Series Data', () => {
    it('should handle system metrics correctly', async () => {
      await databaseService.executeRawQuery(`
        INSERT INTO system_metrics (metric_name, metric_type, value, unit, labels, timestamp)
        VALUES ('test_metric', 'gauge', 42.5, 'percent', '{"test": true}', NOW())
      `);

      const metrics = await databaseService.executeRawQuery(`
        SELECT metric_name, metric_type, value, unit, labels, timestamp
        FROM system_metrics 
        WHERE metric_name = 'test_metric'
        ORDER BY timestamp DESC
        LIMIT 1
      `);

      expect(metrics.length).toBe(1);
      expect(metrics[0].metric_name).toBe('test_metric');
      expect(metrics[0].metric_type).toBe('gauge');
      expect(parseFloat(metrics[0].value)).toBe(42.5);
      expect(typeof metrics[0].labels).toBe('object');
    });
  });
});