import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NetworksService } from './networks.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Networks')
@Controller('networks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @ApiOperation({ summary: 'Get all networks' })
  @Get()
  async findAll() {
    return this.networksService.findAll();
  }
}