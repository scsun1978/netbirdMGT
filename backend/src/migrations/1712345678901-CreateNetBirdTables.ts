import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateNetBirdTables1712345678901 implements MigrationInterface {
  name = 'CreateNetBirdTables1712345678901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'nb_accounts',
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
            name: 'domain',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'api_token_encrypted',
            type: 'text',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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
        name: 'nb_peers',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '255',
            isPrimary: true,
          },
          {
            name: 'account_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'ip',
            type: 'varchar',
            length: '45',
          },
          {
            name: 'connection_ip',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'os',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'last_seen',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['connected', 'disconnected', 'error'],
            default: "'disconnected'",
          },
          {
            name: 'location_country',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'location_city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'desktop',
            type: 'boolean',
            default: false,
          },
          {
            name: 'ssh_enabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'dns_enabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'firewall_enabled',
            type: 'boolean',
            default: false,
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
            name: 'first_seen_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
          {
            name: 'total_uptime_minutes',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'last_disconnect_reason',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'meta',
            type: 'jsonb',
            default: "'{}'",
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'nb_groups',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '255',
            isPrimary: true,
          },
          {
            name: 'account_id',
            type: 'uuid',
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
            name: 'peers_count',
            type: 'integer',
            default: 0,
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
            name: 'meta',
            type: 'jsonb',
            default: "'{}'",
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'nb_policies',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '255',
            isPrimary: true,
          },
          {
            name: 'account_id',
            type: 'uuid',
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
            name: 'enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'rules',
            type: 'jsonb',
            default: "'[]'",
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
            name: 'meta',
            type: 'jsonb',
            default: "'{}'",
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'nb_setup_keys',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '255',
            isPrimary: true,
          },
          {
            name: 'account_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'key_type',
            type: 'enum',
            enum: ['one-off', 'reusable'],
          },
          {
            name: 'usage_limit',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'usage_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'expires_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'valid',
            type: 'boolean',
            default: true,
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
            name: 'meta',
            type: 'jsonb',
            default: "'{}'",
          },
        ],
      }),
      true,
    );

    const indexes = [
      { table: 'nb_accounts', columns: ['user_id'] },
      { table: 'nb_accounts', columns: ['domain'] },
      { table: 'nb_peers', columns: ['status'] },
      { table: 'nb_peers', columns: ['last_seen'] },
      { table: 'nb_peers', columns: ['location_country', 'location_city'] },
      { table: 'nb_peers', columns: ['name'] },
      { table: 'nb_peers', columns: ['account_id'] },
      { table: 'nb_groups', columns: ['account_id'] },
      { table: 'nb_policies', columns: ['account_id'] },
      { table: 'nb_policies', columns: ['enabled'] },
      { table: 'nb_setup_keys', columns: ['account_id'] },
      { table: 'nb_setup_keys', columns: ['key_type'] },
      { table: 'nb_setup_keys', columns: ['valid'] },
      { table: 'nb_setup_keys', columns: ['expires_at'] },
    ];

    for (const index of indexes) {
      await queryRunner.createIndex(
        index.table,
        new Index(`idx_${index.table}_${index.columns.join('_')}`, index.columns),
      );
    }

    await queryRunner.query(`
      CREATE TRIGGER update_nb_accounts_updated_at 
        BEFORE UPDATE ON nb_accounts 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_nb_peers_updated_at 
        BEFORE UPDATE ON nb_peers 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_nb_groups_updated_at 
        BEFORE UPDATE ON nb_groups 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_nb_policies_updated_at 
        BEFORE UPDATE ON nb_policies 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_nb_setup_keys_updated_at 
        BEFORE UPDATE ON nb_setup_keys 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('nb_setup_keys');
    await queryRunner.dropTable('nb_policies');
    await queryRunner.dropTable('nb_groups');
    await queryRunner.dropTable('nb_peers');
    await queryRunner.dropTable('nb_accounts');
  }
}