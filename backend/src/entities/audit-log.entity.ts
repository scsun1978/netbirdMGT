import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { PlatformUser } from './platform-user.entity';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
}

export enum ResourceType {
  USER = 'user',
  PEER = 'peer',
  GROUP = 'group',
  POLICY = 'policy',
  ALERT = 'alert',
  SETUP_KEY = 'setup_key',
  NB_ACCOUNT = 'nb_account',
  SYSTEM = 'system',
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['resourceType', 'resourceId'])
@Index(['action'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  resourceType: ResourceType;

  @Column({ nullable: true })
  resourceId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ nullable: true })
  userIp: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', default: '{}' })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  newValues: Record<string, any>;

  @Column({ type: 'jsonb', default: '[]' })
  changedFields: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Column({ default: true })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => PlatformUser, (user) => user.auditLogs)
  user: PlatformUser;
}