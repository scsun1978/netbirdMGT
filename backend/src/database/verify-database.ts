import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseService } from '../common/database.service';
import { DatabaseHealthService } from '../common/database-health.service';

async function verifyDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const databaseService = app.get(DatabaseService);
  const healthService = app.get(DatabaseHealthService);

  console.log('🔍 Verifying Database Setup...\n');

  try {
    console.log('📊 Checking database info...');
    const dbInfo = await databaseService.getDatabaseInfo();
    
    if (dbInfo.isHealthy) {
      console.log('✅ Database connection: OK');
      console.log(`📏 Database size: ${dbInfo.size}`);
      console.log(`🔗 Active connections: ${dbInfo.activeConnections}`);
    } else {
      console.log('❌ Database connection: FAILED');
      process.exit(1);
    }

    console.log('\n🏗️ Verifying tables...');
    const tables = await databaseService.executeRawQuery(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
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
    const missingTables = expectedTables.filter(table => !actualTables.includes(table));
    const extraTables = actualTables.filter(table => !expectedTables.includes(table));

    if (missingTables.length === 0 && extraTables.length === 0) {
      console.log('✅ All required tables present');
    } else {
      if (missingTables.length > 0) {
        console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
      }
      if (extraTables.length > 0) {
        console.log(`⚠️  Extra tables: ${extraTables.join(', ')}`);
      }
    }

    console.log('\n📇 Verifying indexes...');
    const indexes = await databaseService.executeRawQuery(`
      SELECT schemaname, tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname
    `);

    const criticalIndexes = [
      'idx_platform_users_email',
      'idx_nb_peers_status',
      'idx_alerts_status',
      'idx_audit_logs_created_at',
      'idx_user_sessions_token_hash',
    ];

    const missingIndexes = criticalIndexes.filter(index => 
      !indexes.some((i: any) => i.indexname === index)
    );

    if (missingIndexes.length === 0) {
      console.log('✅ Critical indexes present');
    } else {
      console.log(`❌ Missing critical indexes: ${missingIndexes.join(', ')}`);
    }

    console.log('\n🔧 Verifying triggers...');
    const triggers = await databaseService.executeRawQuery(`
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public' 
      ORDER BY trigger_name
    `);

    const expectedTriggers = [
      'update_platform_users_updated_at',
      'update_nb_peers_updated_at',
      'update_alerts_updated_at',
      'audit_platform_users_trigger',
      'audit_alert_rules_trigger',
    ];

    const missingTriggers = expectedTriggers.filter(trigger =>
      !triggers.some((t: any) => t.trigger_name === trigger)
    );

    if (missingTriggers.length === 0) {
      console.log('✅ Required triggers present');
    } else {
      console.log(`❌ Missing triggers: ${missingTriggers.join(', ')}`);
    }

    console.log('\n👁️ Verifying views...');
    const views = await databaseService.executeRawQuery(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const expectedViews = [
      'alert_summary',
      'peer_status_summary',
      'account_summary',
      'recent_audit_logs',
      'system_health',
    ];

    const missingViews = expectedViews.filter(view =>
      !views.some((v: any) => v.table_name === view)
    );

    if (missingViews.length === 0) {
      console.log('✅ All views present');
    } else {
      console.log(`❌ Missing views: ${missingViews.join(', ')}`);
    }

    console.log('\n🔍 Verifying partitions...');
    const partitions = await databaseService.executeRawQuery(`
      SELECT tablename 
      FROM pg_tables 
      WHERE tablename LIKE 'audit_logs_%' OR tablename LIKE 'system_metrics_%'
      ORDER BY tablename DESC
      LIMIT 5
    `);

    if (partitions.length > 0) {
      console.log(`✅ Time-series partitions created (${partitions.length} partitions found)`);
    } else {
      console.log('⚠️  No time-series partitions found');
    }

    console.log('\n🌱 Verifying seed data...');
    const userCount = await databaseService.executeRawQuery('SELECT COUNT(*) as count FROM platform_users');
    const settingsCount = await databaseService.executeRawQuery('SELECT COUNT(*) as count FROM platform_settings');
    const alertRulesCount = await databaseService.executeRawQuery('SELECT COUNT(*) as count FROM alert_rules');

    console.log(`👥 Platform users: ${userCount[0].count}`);
    console.log(`⚙️  Platform settings: ${settingsCount[0].count}`);
    console.log(`🚨 Alert rules: ${alertRulesCount[0].count}`);

    if (parseInt(userCount[0].count) > 0 && parseInt(settingsCount[0].count) > 0) {
      console.log('✅ Seed data present');
    } else {
      console.log('⚠️  Some seed data missing');
    }

    console.log('\n🏥 Performing health check...');
    const healthCheck = await healthService.performHealthCheck();
    
    console.log(`📊 Overall status: ${healthCheck.status}`);
    console.log(`🔗 Connection: ${healthCheck.connection ? 'OK' : 'FAILED'}`);
    console.log(`📈 Migrations: ${healthCheck.migrations ? 'OK' : 'FAILED'}`);
    console.log(`📂 Partitions: ${healthCheck.partitions ? 'OK' : 'FAILED'}`);
    console.log(`🐌 Slow queries: ${healthCheck.performance.slowQueries}`);

    console.log('\n🎉 Database verification completed!');
    
    if (healthCheck.status === 'healthy') {
      console.log('✅ Database is ready for production use');
      process.exit(0);
    } else if (healthCheck.status === 'degraded') {
      console.log('⚠️  Database is functional but has some issues');
      process.exit(0);
    } else {
      console.log('❌ Database has serious issues and needs attention');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

verifyDatabase().catch(console.error);