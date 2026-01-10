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

@Entity('nb_policies')
@Index(['accountId'])
@Index(['enabled'])
export class NbPolicy {
  @PrimaryColumn()
  id: string;

  @Column()
  accountId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  rules: Record<string, any>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', default: '{}' })
  meta: Record<string, any>;

  @ManyToOne(() => NbAccount, (account) => account.policies)
  account: NbAccount;
}