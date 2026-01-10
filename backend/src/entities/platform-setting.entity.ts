import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  Unique,
} from 'typeorm';
import { PlatformUser } from './platform-user.entity';

export enum SettingCategory {
  GENERAL = 'general',
  ALERTS = 'alerts',
  NOTIFICATIONS = 'notifications',
  UI = 'ui',
  SECURITY = 'security',
  INTEGRATIONS = 'integrations',
}

@Entity('platform_settings')
@Unique(['category', 'key'])
@Index(['category'])
@Index(['isPublic'])
export class PlatformSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SettingCategory,
  })
  category: SettingCategory;

  @Column()
  key: string;

  @Column({ type: 'jsonb' })
  value: any;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true })
  updatedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PlatformUser)
  updatedBy: PlatformUser;
}