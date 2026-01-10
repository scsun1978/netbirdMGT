import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreatePlatformUsersTable1712345678900 implements MigrationInterface {
  name = 'CreatePlatformUsersTable1712345678900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'platform_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'operator', 'viewer'],
            default: "'viewer'",
          },
          {
            name: 'netbird_user_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'last_login_at',
            type: 'timestamp with time zone',
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

    await queryRunner.createIndex(
      'platform_users',
      new Index('idx_platform_users_email', ['email']),
    );

    await queryRunner.createIndex(
      'platform_users',
      new Index('idx_platform_users_netbird_user_id', ['netbird_user_id']),
    );

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_platform_users_updated_at 
        BEFORE UPDATE ON platform_users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('platform_users');
    await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column');
  }
}