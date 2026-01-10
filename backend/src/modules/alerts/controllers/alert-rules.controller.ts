import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { AlertRulesEngine } from '../rules-engine.service';
import { CreateAlertRuleDto, UpdateAlertRuleDto, GetAlertRulesDto } from '../dto/alert-rules.dto';
import { AlertEvaluationResult } from '../interfaces';

@ApiTags('Alert Rules')
@Controller('alert-rules')
@UseGuards(JwtAuthGuard)
export class AlertRulesController {
  constructor(private readonly alertRulesEngine: AlertRulesEngine) {}

  @Get()
  @ApiOperation({ summary: 'Get all alert rules' })
  @ApiResponse({ status: 200, description: 'Alert rules retrieved successfully' })
  async getAlertRules(@Query() filters: GetAlertRulesDto) {
    return this.alertRulesEngine.getEnabledRules();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific alert rule' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiResponse({ status: 200, description: 'Alert rule retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  async getAlertRule(@Param('id') id: string) {
    const rule = await this.alertRulesEngine.testRule(id, { 
      context: { peers: [], groups: [], timestamp: new Date() } 
    });
    return rule;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new alert rule' })
  @ApiResponse({ status: 201, description: 'Alert rule created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createAlertRule(@Body() createAlertRuleDto: CreateAlertRuleDto) {
    return this.alertRulesEngine.addRule(createAlertRuleDto, 'system-user');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing alert rule' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiResponse({ status: 200, description: 'Alert rule updated successfully' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  async updateAlertRule(
    @Param('id') id: string,
    @Body() updateAlertRuleDto: UpdateAlertRuleDto,
  ) {
    return this.alertRulesEngine.updateRule(id, updateAlertRuleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert rule' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiResponse({ status: 200, description: 'Alert rule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  @HttpCode(HttpStatus.OK)
  async deleteAlertRule(@Param('id') id: string) {
    await this.alertRulesEngine.deleteRule(id);
    return { message: 'Alert rule deleted successfully' };
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test an alert rule' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiResponse({ status: 200, description: 'Alert rule test completed' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  async testAlertRule(
    @Param('id') id: string,
    @Body() testData?: any,
  ): Promise<AlertEvaluationResult> {
    return this.alertRulesEngine.testRule(id, testData);
  }

  @Post(':id/enable')
  @ApiOperation({ summary: 'Enable an alert rule' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiResponse({ status: 200, description: 'Alert rule enabled successfully' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  @HttpCode(HttpStatus.OK)
  async enableAlertRule(@Param('id') id: string) {
    await this.alertRulesEngine.enableRule(id);
    return { message: 'Alert rule enabled successfully' };
  }

  @Post(':id/disable')
  @ApiOperation({ summary: 'Disable an alert rule' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiResponse({ status: 200, description: 'Alert rule disabled successfully' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  @HttpCode(HttpStatus.OK)
  async disableAlertRule(@Param('id') id: string) {
    await this.alertRulesEngine.disableRule(id);
    return { message: 'Alert rule disabled successfully' };
  }
}