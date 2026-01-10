import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsObject, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { AlertRuleType, AlertSeverity } from '../../../entities/alert-rule.entity';
import { PartialType } from '../utils/partial-type.util';

export class CreateAlertRuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AlertRuleType)
  ruleType: AlertRuleType;

  @IsObject()
  conditions: Record<string, any>;

  @IsEnum(AlertSeverity)
  @IsOptional()
  severity?: AlertSeverity = AlertSeverity.MEDIUM;

  @IsNumber()
  @IsOptional()
  thresholdValue?: number;

  @IsNumber()
  @IsOptional()
  thresholdPeriod?: number;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean = true;

  @IsArray()
  @IsOptional()
  notificationChannels?: string[];
}

export class UpdateAlertRuleDto extends PartialType(CreateAlertRuleDto) {}

export class GetAlertRulesDto {
  @IsEnum(AlertRuleType)
  @IsOptional()
  ruleType?: AlertRuleType;

  @IsEnum(AlertSeverity)
  @IsOptional()
  severity?: AlertSeverity;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsString()
  @IsOptional()
  createdById?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  offset?: number;
}