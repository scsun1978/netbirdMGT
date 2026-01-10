import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { PlatformUser } from './platform-user.entity';
import { NbPeer } from './nb-peer.entity';
import { NbGroup } from './nb-group.entity';
import { NbPolicy } from './nb-policy.entity';
import { NbSetupKey } from './nb-setup-key.entity';

@Entity('nb_accounts')
@Index(['userId'])
@Index(['domain'])
export class NbAccount {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  domain: string;

  @Column({ type: 'text' })
  apiTokenEncrypted: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PlatformUser, (user) => user.nbAccounts)
  user: PlatformUser;

  @OneToMany(() => NbPeer, (peer) => peer.account)
  peers: NbPeer[];

  @OneToMany(() => NbGroup, (group) => group.account)
  groups: NbGroup[];

  @OneToMany(() => NbPolicy, (policy) => policy.account)
  policies: NbPolicy[];

  @OneToMany(() => NbSetupKey, (setupKey) => setupKey.account)
  setupKeys: NbSetupKey[];
}