import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { AlertsService } from '../alerts.service';
import { AcknowledgeAlertDto, ResolveAlertDto, SuppressAlertDto, GetAlertsDto } from '../dto/alerts.dto';
import { AlertStatistics } from '../interfaces/alert-statistics.interface';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get alerts with optional filters' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  async getAlerts(@Query() filters: GetAlertsDto) {
    return this.alertsService.getAlerts(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async getAlert(@Param('id') id: string) {
    return this.alertsService.getAlert(id);
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged successfully' })
  @ApiResponse({ status: 400, description: 'Cannot acknowledge this alert' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @HttpCode(HttpStatus.OK)
  async acknowledgeAlert(
    @Param('id') id: string,
    @Body() acknowledgeDto: AcknowledgeAlertDto,
    @Request() req,
  ) {
    return this.alertsService.acknowledgeAlert(
      id,
      req.user.id,
      acknowledgeDto.message,
    );
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve an alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert resolved successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @HttpCode(HttpStatus.OK)
  async resolveAlert(
    @Param('id') id: string,
    @Body() resolveDto: ResolveAlertDto,
    @Request() req,
  ) {
    return this.alertsService.resolveAlert(
      id,
      req.user.id,
      resolveDto.reason,
    );
  }

  @Post(':id/suppress')
  @ApiOperation({ summary: 'Suppress an alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert suppressed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot suppress this alert' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @HttpCode(HttpStatus.OK)
  async suppressAlert(
    @Param('id') id: string,
    @Body() suppressDto: SuppressAlertDto,
    @Request() req,
  ) {
    return this.alertsService.suppressAlert(
      id,
      new Date(suppressDto.until),
      req.user.id,
      suppressDto.reason,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert deleted successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @HttpCode(HttpStatus.OK)
  async deleteAlert(@Param('id') id: string) {
    await this.alertsService.deleteAlert(id);
    return { message: 'Alert deleted successfully' };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get alert statistics' })
  @ApiResponse({ status: 200, description: 'Alert statistics retrieved successfully' })
  async getAlertStatistics(): Promise<AlertStatistics> {
    return this.alertsService.getAlertStatistics();
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Cleanup old resolved alerts' })
  @ApiQuery({ name: 'daysToKeep', required: false, description: 'Number of days to keep alerts' })
  @ApiResponse({ status: 200, description: 'Alerts cleaned up successfully' })
  @HttpCode(HttpStatus.OK)
  async cleanupOldAlerts(@Query('daysToKeep') daysToKeep?: number) {
    const deletedCount = await this.alertsService.getAlertStatistics();
    return { 
      message: 'Alert cleanup completed',
      deletedCount 
    };
  }
}