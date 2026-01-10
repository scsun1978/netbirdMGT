import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Alert } from './alert.entity';

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  RETRY = 'retry',
}

export enum NotificationChannelType {
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  SLACK = 'slack',
  IN_APP = 'in_app',
}

@Entity('alert_notifications')
@Index(['alertId'])
@Index(['channelType'])
@Index(['status'])
@Index(['nextRetryAt'])
export class AlertNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  alertId: string;

  @Column({
    type: 'enum',
    enum: NotificationChannelType,
  })
  channelType: NotificationChannelType;

  @Column({ type: 'jsonb' })
  channelConfig: Record<string, any>;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ type: 'jsonb', default: '{}' })
  responseData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ default: 3 })
  maxRetries: number;

  @Column({ nullable: true })
  nextRetryAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Alert, (alert) => alert.notifications)
  alert: Alert;
}