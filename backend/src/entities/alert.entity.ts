import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { AlertRule, AlertSeverity } from './alert-rule.entity';
import { PlatformUser } from './platform-user.entity';
import { AlertNotification } from './alert-notification.entity';

export enum AlertStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed',
}

export enum AlertSourceType {
  PEER = 'peer',
  GROUP = 'group',
  NETWORK = 'network',
  SYSTEM = 'system',
}

@Entity('alerts')
@Index(['status'])
@Index(['severity'])
@Index(['triggeredAt'])
@Index(['sourceType', 'sourceId'])
@Index(['ruleId'])
@Index(['createdById'])
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ruleId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.MEDIUM,
  })
  severity: AlertSeverity;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.OPEN,
  })
  status: AlertStatus;

  @Column({
    type: 'enum',
    enum: AlertSourceType,
  })
  sourceType: AlertSourceType;

  @Column()
  sourceId: string;

  @Column({ type: 'jsonb', default: '{}' })
  sourceData: Record<string, any>;

  @CreateDateColumn()
  triggeredAt: Date;

  @Column({ nullable: true })
  acknowledgedAt: Date;

  @Column({ nullable: true })
  acknowledgedById: string;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  resolvedById: string;

  @Column({ nullable: true })
  suppressedUntil: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => AlertRule, (rule) => rule.alerts)
  rule: AlertRule;

  @ManyToOne(() => PlatformUser)
  acknowledgedBy: PlatformUser;

  @ManyToOne(() => PlatformUser)
  resolvedBy: PlatformUser;

  @ManyToOne(() => PlatformUser, (user) => user.auditLogs)
  createdBy: PlatformUser;

  @OneToMany(() => AlertNotification, (notification) => notification.alert)
  notifications: AlertNotification[];
}