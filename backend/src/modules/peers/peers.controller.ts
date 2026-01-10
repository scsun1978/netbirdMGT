import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PeersService } from './peers.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Peers')
@Controller('peers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PeersController {
  constructor(private readonly peersService: PeersService) {}

  @ApiOperation({ summary: 'Get all peers' })
  @Get()
  async findAll() {
    return this.peersService.findAll();
  }

  @ApiOperation({ summary: 'Get peer by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.peersService.findOne(id);
  }

  @ApiOperation({ summary: 'Create peer' })
  @Post()
  async create(@Body() createPeerDto: any) {
    return this.peersService.create(createPeerDto);
  }

  @ApiOperation({ summary: 'Update peer' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePeerDto: any) {
    return this.peersService.update(id, updatePeerDto);
  }

  @ApiOperation({ summary: 'Delete peer' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.peersService.remove(id);
  }
}