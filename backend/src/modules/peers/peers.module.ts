import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeersController } from './peers.controller';
import { PeersService } from './peers.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [PeersController],
  providers: [PeersService],
  exports: [PeersService],
})
export class PeersModule {}