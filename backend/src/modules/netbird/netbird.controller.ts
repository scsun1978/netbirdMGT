import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NetBirdService } from './netbird.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('NetBird')
@Controller('netbird')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NetBirdController {
  constructor(private readonly netbirdService: NetBirdService) {}

  @ApiOperation({ summary: 'Get all peers' })
  @Get('peers')
  async getPeers() {
    return this.netbirdService.getPeers();
  }

  @ApiOperation({ summary: 'Get all users' })
  @Get('users')
  async getUsers() {
    return this.netbirdService.getUsers();
  }

  @ApiOperation({ summary: 'Get all groups' })
  @Get('groups')
  async getGroups() {
    return this.netbirdService.getGroups();
  }

  @ApiOperation({ summary: 'Get all policies' })
  @Get('policies')
  async getPolicies() {
    return this.netbirdService.getPolicies();
  }

  @ApiOperation({ summary: 'Get all setup keys' })
  @Get('setup-keys')
  async getSetupKeys() {
    return this.netbirdService.getSetupKeys();
  }

  @ApiOperation({ summary: 'Get all events' })
  @Get('events')
  async getEvents(@Query('limit') limit?: number) {
    return this.netbirdService.getEvents();
  }
}