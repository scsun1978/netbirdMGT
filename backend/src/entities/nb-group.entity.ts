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

@Entity('nb_groups')
@Index(['accountId'])
export class NbGroup {
  @PrimaryColumn()
  id: string;

  @Column()
  accountId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  peersCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', default: '{}' })
  meta: Record<string, any>;

  @ManyToOne(() => NbAccount, (account) => account.groups)
  account: NbAccount;
}