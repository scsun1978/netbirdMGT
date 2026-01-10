import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import databaseConfig from '../config/database.config';
import * as entities from '../entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: async (configService) => ({
        ...configService.get('database'),
        entities: Object.values(entities),
      }),
      inject: [databaseConfig.KEY],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}