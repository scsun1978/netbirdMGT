import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePlatformUsersTable1712345678900 implements MigrationInterface {
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
            default: 'viewer',
          },
          {
            name: 'netbird_user_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
    await queryRunner.createIndex('idx_platform_users_email', 'platform_users', ['email']);
    await queryRunner.createIndex('idx_platform_users_role', 'platform_users', ['role']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('platform_users');
  }
}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('platform_users');
  }
}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('platform_users');
    await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column');
  }
}