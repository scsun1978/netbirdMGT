import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseHealthService } from '../common/database-health.service';

async function checkDatabaseHealth() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const healthService = app.get(DatabaseHealthService);

  console.log('🏥 Database Health Check\n');

  try {
    const health = await healthService.performHealthCheck();

    console.log(`📊 Overall Status: ${health.status.toUpperCase()}`);
    console.log(`🕐 Last Checked: ${health.timestamp.toISOString()}`);
    console.log(`💾 Database Size: ${health.size}\n`);

    console.log('🔗 Connection Status:');
    console.log(`   Database: ${health.connection ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   Migrations: ${health.migrations ? '✅ Up to date' : '❌ Pending'}`);
    console.log(`   Partitions: ${health.partitions ? '✅ Active' : '❌ Issues'}\n`);

    console.log('🔧 Extensions:');
    health.extensions.forEach(ext => {
      const status = ext.available ? '✅' : '❌';
      const version = ext.version ? ` (${ext.version})` : '';
      console.log(`   ${ext.name}: ${status}${version}`);
    });

    console.log('\n📈 Performance:');
    console.log(`   Slow queries (>1s): ${health.performance.slowQueries}`);
    console.log(`   Connection pool: ${JSON.stringify(health.performance.connectionPool)}`);

    if (health.performance.tableOptimization.length > 0) {
      console.log('\n🧹 Table Optimization Status:');
      health.performance.tableOptimization.forEach(table => {
        const status = table.needsOptimization ? '⚠️  Needs optimization' : '✅ Optimized';
        console.log(`   ${table.table}: ${status}`);
      });
    }

    if (health.status !== 'healthy') {
      console.log('\n🔧 Performing maintenance...');
      const maintenance = await healthService.performMaintenance();
      
      if (maintenance.success) {
        console.log('✅ Maintenance completed successfully');
        maintenance.actions.forEach(action => {
          console.log(`   - ${action}`);
        });
      } else {
        console.log('❌ Maintenance failed');
        maintenance.actions.forEach(action => {
          console.log(`   - ${action}`);
        });
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Database Health: ${health.status.toUpperCase()}`);
    
    if (health.status === 'healthy') {
      console.log('✅ All systems operational');
      process.exit(0);
    } else if (health.status === 'degraded') {
      console.log('⚠️  Some issues detected but system is functional');
      process.exit(0);
    } else {
      console.log('❌ Critical issues require immediate attention');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

checkDatabaseHealth().catch(console.error);