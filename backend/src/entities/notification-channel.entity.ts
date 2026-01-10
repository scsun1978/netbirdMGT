import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { PlatformUser } from './platform-user.entity';
import { NotificationChannelType } from './alert-notification.entity';

@Entity('notification_channels')
@Index(['type'])
@Index(['isEnabled'])
@Index(['createdById'])
export class NotificationChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: NotificationChannelType,
  })
  type: NotificationChannelType;

  @Column({ type: 'jsonb' })
  config: Record<string, any>;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ default: 0 })
  successCount: number;

  @Column({ default: 0 })
  failureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailureAt: Date;

  @Column({ type: 'text', nullable: true })
  lastError: string;

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PlatformUser)
  createdBy: PlatformUser;
}