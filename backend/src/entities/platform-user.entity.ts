import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserRole } from './user.entity';
import { NbAccount } from './nb-account.entity';
import { AlertRule } from './alert-rule.entity';
import { UserSession } from './user-session.entity';
import { AuditLog } from './audit-log.entity';

@Entity('platform_users')
@Index(['email'])
@Index(['netbirdUserId'])
export class PlatformUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({ nullable: true })
  netbirdUserId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NbAccount, (account) => account.user)
  nbAccounts: NbAccount[];

  @OneToMany(() => AlertRule, (alertRule) => alertRule.createdBy)
  createdAlertRules: AlertRule[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];
}