import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsNumber } from 'class-validator';
import { AlertStatus, AlertSeverity, AlertSourceType } from '../../../entities/alert.entity';

export class AcknowledgeAlertDto {
  @IsString()
  @IsOptional()
  message?: string;
}

export class ResolveAlertDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class SuppressAlertDto {
  @IsDateString()
  until: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class GetAlertsDto {
  @IsEnum(AlertStatus)
  @IsOptional()
  status?: AlertStatus;

  @IsEnum(AlertSeverity)
  @IsOptional()
  severity?: AlertSeverity;

  @IsEnum(AlertSourceType)
  @IsOptional()
  sourceType?: AlertSourceType;

  @IsString()
  @IsOptional()
  sourceId?: string;

  @IsString()
  @IsOptional()
  ruleId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  createdById?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  offset?: number;
}