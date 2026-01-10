import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { NbAccount } from './nb-account.entity';

export enum SetupKeyType {
  ONE_OFF = 'one-off',
  REUSABLE = 'reusable',
}

@Entity('nb_setup_keys')
@Index(['accountId'])
@Index(['keyType'])
@Index(['valid'])
@Index(['expiresAt'])
export class NbSetupKey {
  @PrimaryColumn()
  id: string;

  @Column()
  accountId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: SetupKeyType,
  })
  keyType: SetupKeyType;

  @Column({ nullable: true })
  usageLimit: number;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: true })
  valid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', default: '{}' })
  meta: Record<string, any>;

  @ManyToOne(() => NbAccount, (account) => account.setupKeys)
  account: NbAccount;
}