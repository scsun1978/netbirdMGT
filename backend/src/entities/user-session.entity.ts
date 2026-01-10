import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { PlatformUser } from './platform-user.entity';

@Entity('user_sessions')
@Index(['userId'])
@Index(['tokenHash'])
@Index(['expiresAt'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  tokenHash: string;

  @Column({ nullable: true })
  refreshTokenHash: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  lastAccessedAt: Date;

  @ManyToOne(() => PlatformUser, (user) => user.sessions)
  user: PlatformUser;
}