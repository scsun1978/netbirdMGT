import { IsString, IsEnum, IsObject, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { NotificationChannelType } from '../../../entities/alert-notification.entity';
import { PartialType } from '../utils/partial-type.util';

export class CreateNotificationChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(NotificationChannelType)
  type: NotificationChannelType;

  @IsObject()
  config: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean = true;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateNotificationChannelDto extends PartialType(CreateNotificationChannelDto) {}

export class GetNotificationHistoryDto {
  @IsEnum(NotificationChannelType)
  @IsOptional()
  channelType?: NotificationChannelType;

  @IsString()
  @IsOptional()
  alertId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}