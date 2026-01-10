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
import { PlatformUser } from './platform-user.entity';
import { Alert } from './alert.entity';
import { AlertNotification } from './alert-notification.entity';

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertRuleType {
  PEER_OFFLINE = 'peer_offline',
  PEER_FLAPPING = 'peer_flapping',
  GROUP_HEALTH = 'group_health',
  NEW_PEER = 'new_peer',
  PEER_INACTIVITY = 'peer_inactivity',
  NETWORK_CHANGE = 'network_change',
}

@Entity('alert_rules')
@Index(['ruleType'])
@Index(['severity'])
@Index(['isEnabled'])
@Index(['createdById'])
export class AlertRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AlertRuleType,
  })
  ruleType: AlertRuleType;

  @Column({ type: 'jsonb' })
  conditions: Record<string, any>;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.MEDIUM,
  })
  severity: AlertSeverity;

  @Column({ nullable: true })
  thresholdValue: number;

  @Column({ nullable: true })
  thresholdPeriod: number;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  notificationChannels: Record<string, any>[];

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastEvaluatedAt: Date;

  @Column({ default: 0 })
  evaluationCount: number;

  @Column({ default: 0 })
  triggerCount: number;

  @ManyToOne(() => PlatformUser, (user) => user.createdAlertRules)
  createdBy: PlatformUser;

  @OneToMany(() => Alert, (alert) => alert.rule)
  alerts: Alert[];
}