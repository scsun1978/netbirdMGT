import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.checkDatabaseConnection();
    await this.createExtensionsIfNotExists();
  }

  private async checkDatabaseConnection(): Promise<void> {
    try {
      await this.dataSource.query('SELECT 1');
      console.log('✅ Database connection established successfully');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  private async createExtensionsIfNotExists(): Promise<void> {
    const extensions = ['uuid-ossp', 'pg_stat_statements', 'pg_trgm'];
    
    for (const extension of extensions) {
      try {
        await this.dataSource.query(`CREATE EXTENSION IF NOT EXISTS "${extension}"`);
        console.log(`✅ Extension ${extension} is available`);
      } catch (error) {
        console.warn(`⚠️  Warning: Could not enable extension ${extension}:`, error.message);
      }
    }
  }

  async runMigrations(): Promise<void> {
    try {
      const migrations = await this.dataSource.runMigrations();
      console.log(`✅ ${migrations.length} migrations executed successfully`);
      migrations.forEach(migration => {
        console.log(`   - ${migration.name}`);
      });
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async getDatabaseInfo(): Promise<any> {
    try {
      const version = await this.dataSource.query('SELECT version()');
      const size = await this.dataSource.query(`
        SELECT pg_size_pretty(pg_database_size('${process.env.POSTGRES_DB || 'netbird_mgt'}')) as size
      `);
      const connections = await this.dataSource.query(`
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `);

      return {
        version: version[0].version,
        size: size[0].size,
        activeConnections: parseInt(connections[0].active_connections),
        isHealthy: true,
      };
    } catch (error) {
      console.error('❌ Failed to get database info:', error);
      return {
        isHealthy: false,
        error: error.message,
      };
    }
  }

  async checkPartitionHealth(): Promise<any> {
    try {
      const auditPartitions = await this.dataSource.query(`
        SELECT table_name, table_size 
        FROM (
          SELECT 
            schemaname||'.'||tablename as table_name,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
          FROM pg_tables 
          WHERE tablename LIKE 'audit_logs_%'
          ORDER BY tablename DESC
        ) as subquery
        LIMIT 5
      `);

      const metricPartitions = await this.dataSource.query(`
        SELECT table_name, table_size 
        FROM (
          SELECT 
            schemaname||'.'||tablename as table_name,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
          FROM pg_tables 
          WHERE tablename LIKE 'system_metrics_%'
          ORDER BY tablename DESC
        ) as subquery
        LIMIT 5
      `);

      return {
        auditPartitions,
        metricPartitions,
        isHealthy: true,
      };
    } catch (error) {
      return {
        isHealthy: false,
        error: error.message,
      };
    }
  }

  async createQueryRunner(): Promise<QueryRunner> {
    return this.dataSource.createQueryRunner();
  }

  async executeRawQuery(query: string, parameters?: any[]): Promise<any> {
    return this.dataSource.query(query, parameters);
  }

  async getTableStats(tableName: string): Promise<any> {
    try {
      const stats = await this.dataSource.query(`
        SELECT 
          schemaname,
          tablename,
          attname as column_name,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE tablename = $1
        ORDER BY attname
      `, [tableName]);

      const rowCounts = await this.dataSource.query(`
        SELECT 
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables 
        WHERE tablename = $1
      `, [tableName]);

      return {
        columnStats: stats,
        tableStats: rowCounts[0] || null,
      };
    } catch (error) {
      console.error(`❌ Failed to get stats for table ${tableName}:`, error);
      return null;
    }
  }

  async optimizeTable(tableName: string): Promise<void> {
    try {
      await this.dataSource.query(`ANALYZE ${tableName}`);
      await this.dataSource.query(`VACUUM ANALYZE ${tableName}`);
      console.log(`✅ Optimized table: ${tableName}`);
    } catch (error) {
      console.error(`❌ Failed to optimize table ${tableName}:`, error);
      throw error;
    }
  }

  async getSlowQueries(thresholdMs: number = 1000): Promise<any[]> {
    try {
      const queries = await this.dataSource.query(`
        SELECT 
          query,
          calls,
          total_exec_time,
          mean_exec_time,
          rows
        FROM pg_stat_statements 
        WHERE mean_exec_time > $1
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `, [thresholdMs]);

      return queries;
    } catch (error) {
      console.error('❌ Failed to get slow queries:', error);
      return [];
    }
  }

  async cleanupOldSessions(): Promise<number> {
    try {
      const result = await this.dataSource.query(`
        DELETE FROM user_sessions 
        WHERE expires_at < NOW() 
        OR (last_accessed_at < NOW() - INTERVAL '7 days' AND is_active = false)
        RETURNING id
      `);

      const cleanedCount = result.length;
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup old sessions:', error);
      return 0;
    }
  }
}