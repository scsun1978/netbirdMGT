import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';

export interface DatabaseHealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  connection: boolean;
  migrations: boolean;
  partitions: boolean;
  extensions: any[];
  performance: {
    slowQueries: number;
    tableOptimization: any[];
    connectionPool: any;
  };
  size: string;
  timestamp: Date;
}

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async performHealthCheck(): Promise<DatabaseHealthCheck> {
    const timestamp = new Date();
    
    try {
      const connectionCheck = await this.checkConnection();
      const migrationCheck = await this.checkMigrations();
      const partitionCheck = await this.checkPartitions();
      const extensionCheck = await this.checkExtensions();
      const performanceCheck = await this.checkPerformance();
      const sizeInfo = await this.getDatabaseSize();

      const overallStatus = this.determineOverallStatus([
        connectionCheck,
        migrationCheck,
        partitionCheck,
      ]);

      return {
        status: overallStatus,
        connection: connectionCheck,
        migrations: migrationCheck,
        partitions: partitionCheck,
        extensions: extensionCheck,
        performance: performanceCheck,
        size: sizeInfo,
        timestamp,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        connection: false,
        migrations: false,
        partitions: false,
        extensions: [],
        performance: {
          slowQueries: -1,
          tableOptimization: [],
          connectionPool: {},
        },
        size: 'Unknown',
        timestamp,
      };
    }
  }

  private async checkConnection(): Promise<boolean> {
    try {
      await this.databaseService.executeRawQuery('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database connection check failed:', error);
      return false;
    }
  }

  private async checkMigrations(): Promise<boolean> {
    try {
      const info = await this.databaseService.getDatabaseInfo();
      return info.isHealthy;
    } catch (error) {
      this.logger.error('Migration check failed:', error);
      return false;
    }
  }

  private async checkPartitions(): Promise<boolean> {
    try {
      const partitionHealth = await this.databaseService.checkPartitionHealth();
      return partitionHealth.isHealthy;
    } catch (error) {
      this.logger.error('Partition check failed:', error);
      return false;
    }
  }

  private async checkExtensions(): Promise<any[]> {
    const requiredExtensions = ['uuid-ossp', 'pg_stat_statements', 'pg_trgm'];
    const extensionStatus = [];

    for (const extension of requiredExtensions) {
      try {
        const result = await this.databaseService.executeRawQuery(`
          SELECT extname, extversion 
          FROM pg_extension 
          WHERE extname = $1
        `, [extension]);

        extensionStatus.push({
          name: extension,
          available: result.length > 0,
          version: result.length > 0 ? result[0].extversion : null,
        });
      } catch (error) {
        extensionStatus.push({
          name: extension,
          available: false,
          version: null,
          error: error.message,
        });
      }
    }

    return extensionStatus;
  }

  private async checkPerformance(): Promise<{
    slowQueries: number;
    tableOptimization: any[];
    connectionPool: any;
  }> {
    try {
      const slowQueries = await this.databaseService.getSlowQueries();
      const tableOptimization = await this.checkTableOptimization();
      const connectionPool = await this.checkConnectionPool();

      return {
        slowQueries: slowQueries.length,
        tableOptimization,
        connectionPool,
      };
    } catch (error) {
      this.logger.error('Performance check failed:', error);
      return {
        slowQueries: -1,
        tableOptimization: [],
        connectionPool: {},
      };
    }
  }

  private async checkTableOptimization(): Promise<any[]> {
    const criticalTables = [
      'platform_users',
      'alerts',
      'audit_logs',
      'nb_peers',
    ];

    const optimizationStatus = [];

    for (const table of criticalTables) {
      try {
        const stats = await this.databaseService.getTableStats(table);
        optimizationStatus.push({
          table,
          analyzed: stats?.tableStats?.last_analyze || null,
          vacuumed: stats?.tableStats?.last_vacuum || null,
          liveTuples: stats?.tableStats?.live_tuples || 0,
          deadTuples: stats?.tableStats?.dead_tuples || 0,
          needsOptimization: 
            (stats?.tableStats?.dead_tuples || 0) > (stats?.tableStats?.live_tuples || 0) * 0.2 ||
            !stats?.tableStats?.last_analyze ||
            new Date(stats.tableStats.last_analyze) < new Date(Date.now() - 24 * 60 * 60 * 1000),
        });
      } catch (error) {
        optimizationStatus.push({
          table,
          error: error.message,
          needsOptimization: true,
        });
      }
    }

    return optimizationStatus;
  }

  private async checkConnectionPool(): Promise<any> {
    try {
      const poolStats = await this.databaseService.executeRawQuery(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);

      return poolStats[0] || {};
    } catch (error) {
      return { error: error.message };
    }
  }

  private async getDatabaseSize(): Promise<string> {
    try {
      const info = await this.databaseService.getDatabaseInfo();
      return info.size || 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  private determineOverallStatus(checks: boolean[]): 'healthy' | 'unhealthy' | 'degraded' {
    const healthyCount = checks.filter(Boolean).length;
    const totalChecks = checks.length;

    if (healthyCount === totalChecks) {
      return 'healthy';
    } else if (healthyCount === 0) {
      return 'unhealthy';
    } else {
      return 'degraded';
    }
  }

  async performMaintenance(): Promise<{ success: boolean; actions: string[] }> {
    const actions: string[] = [];

    try {
      const cleanedSessions = await this.databaseService.cleanupOldSessions();
      if (cleanedSessions > 0) {
        actions.push(`Cleaned up ${cleanedSessions} expired sessions`);
      }

      const optimizationCheck = await this.checkTableOptimization();
      for (const table of optimizationCheck) {
        if (table.needsOptimization && !table.error) {
          await this.databaseService.optimizeTable(table.table);
          actions.push(`Optimized table: ${table.table}`);
        }
      }

      return { success: true, actions };
    } catch (error) {
      this.logger.error('Database maintenance failed:', error);
      return { success: false, actions: [...actions, 'Maintenance failed: ' + error.message] };
    }
  }
}