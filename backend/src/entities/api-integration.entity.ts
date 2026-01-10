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

export enum IntegrationType {
  WEBHOOK = 'webhook',
  SLACK = 'slack',
  EMAIL = 'email',
  CUSTOM = 'custom',
}

@Entity('api_integrations')
@Index(['type'])
@Index(['isEnabled'])
@Index(['createdById'])
export class ApiIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: IntegrationType,
  })
  type: IntegrationType;

  @Column({ type: 'jsonb' })
  config: Record<string, any>;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ nullable: true })
  lastTestAt: Date;

  @Column({ nullable: true })
  lastSuccessAt: Date;

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PlatformUser)
  createdBy: PlatformUser;
}