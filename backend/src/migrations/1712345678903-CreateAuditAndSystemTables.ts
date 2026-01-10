import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateAuditAndSystemTables1712345678903 implements MigrationInterface {
  name = 'CreateAuditAndSystemTables1712345678903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'action',
            type: 'enum',
            enum: ['create', 'update', 'delete', 'login', 'logout', 'view', 'export', 'import'],
          },
          {
            name: 'resource_type',
            type: 'enum',
            enum: ['user', 'peer', 'group', 'policy', 'alert', 'setup_key', 'nb_account', 'system'],
          },
          {
            name: 'resource_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'user_ip',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'old_values',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'new_values',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'changed_fields',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'success',
            type: 'boolean',
            default: true,
          },
          {
            name: 'error_message',
            type: 'text',
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

    await queryRunner.createTable(
      new Table({
        name: 'system_metrics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'metric_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'metric_type',
            type: 'enum',
            enum: ['counter', 'gauge', 'histogram'],
          },
          {
            name: 'value',
            type: 'numeric',
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'labels',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'timestamp',
            type: 'timestamp with time zone',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'platform_settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'category',
            type: 'enum',
            enum: ['general', 'alerts', 'notifications', 'ui', 'security', 'integrations'],
          },
          {
            name: 'key',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'value',
            type: 'jsonb',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
          },
          {
            name: 'updated_by_id',
            type: 'uuid',
            isNullable: true,
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
        name: 'api_integrations',
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
            length: '100',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['webhook', 'slack', 'email', 'custom'],
          },
          {
            name: 'config',
            type: 'jsonb',
          },
          {
            name: 'is_enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'last_test_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'last_success_at',
            type: 'timestamp with time zone',
            isNullable: true,
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
        name: 'user_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'token_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'refresh_token_hash',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp with time zone',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
          {
            name: 'last_accessed_at',
            type: 'timestamp with time zone',
          },
        ],
      }),
      true,
    );

    const indexes = [
      { table: 'audit_logs', columns: ['user_id'] },
      { table: 'audit_logs', columns: ['resource_type', 'resource_id'] },
      { table: 'audit_logs', columns: ['action'] },
      { table: 'audit_logs', columns: ['created_at'] },
      { table: 'system_metrics', columns: ['metric_name'] },
      { table: 'system_metrics', columns: ['timestamp'] },
      { table: 'system_metrics', columns: ['metric_name', 'timestamp'] },
      { table: 'platform_settings', columns: ['category'] },
      { table: 'platform_settings', columns: ['is_public'] },
      { table: 'api_integrations', columns: ['type'] },
      { table: 'api_integrations', columns: ['is_enabled'] },
      { table: 'api_integrations', columns: ['created_by_id'] },
      { table: 'user_sessions', columns: ['user_id'] },
      { table: 'user_sessions', columns: ['token_hash'] },
      { table: 'user_sessions', columns: ['expires_at'] },
    ];

    for (const index of indexes) {
      await queryRunner.createIndex(
        index.table,
        new Index(`idx_${index.table}_${index.columns.join('_')}`, index.columns),
      );
    }

    await queryRunner.query(`
      CREATE TRIGGER update_platform_settings_updated_at 
        BEFORE UPDATE ON platform_settings 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_api_integrations_updated_at 
        BEFORE UPDATE ON api_integrations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.createForeignKey(
      'platform_settings',
      {
        columnNames: ['updated_by_id'],
        referencedTableName: 'platform_users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      },
    );

    await queryRunner.createForeignKey(
      'api_integrations',
      {
        columnNames: ['created_by_id'],
        referencedTableName: 'platform_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      },
    );

    await queryRunner.createForeignKey(
      'user_sessions',
      {
        columnNames: ['user_id'],
        referencedTableName: 'platform_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      },
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_sessions');
    await queryRunner.dropTable('api_integrations');
    await queryRunner.dropTable('platform_settings');
    await queryRunner.dropTable('system_metrics');
    await queryRunner.dropTable('audit_logs');
  }
}