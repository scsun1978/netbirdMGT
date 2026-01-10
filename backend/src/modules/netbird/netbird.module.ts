import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NetBirdController } from './netbird.controller';
import { NetBirdService } from './netbird.service';

@Module({
  imports: [ConfigModule],
  controllers: [NetBirdController],
  providers: [NetBirdService],
  exports: [NetBirdService],
})
export class NetBirdModule {}