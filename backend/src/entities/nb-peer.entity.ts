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

export enum PeerStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

@Entity('nb_peers')
@Index(['status'])
@Index(['lastSeen'])
@Index(['locationCountry', 'locationCity'])
@Index(['name'])
@Index(['accountId'])
export class NbPeer {
  @PrimaryColumn()
  id: string;

  @Column()
  accountId: string;

  @Column()
  name: string;

  @Column()
  ip: string;

  @Column({ nullable: true })
  connectionIp: string;

  @Column({ nullable: true })
  os: string;

  @Column({ nullable: true })
  version: string;

  @Column({ nullable: true })
  lastSeen: Date;

  @Column({
    type: 'enum',
    enum: PeerStatus,
    default: PeerStatus.DISCONNECTED,
  })
  status: PeerStatus;

  @Column({ nullable: true, length: 2 })
  locationCountry: string;

  @Column({ nullable: true })
  locationCity: string;

  @Column({ default: false })
  desktop: boolean;

  @Column({ default: false })
  sshEnabled: boolean;

  @Column({ default: false })
  dnsEnabled: boolean;

  @Column({ default: false })
  firewallEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  firstSeenAt: Date;

  @Column({ default: 0 })
  totalUptimeMinutes: number;

  @Column({ nullable: true })
  lastDisconnectReason: string;

  @Column({ type: 'jsonb', default: '{}' })
  meta: Record<string, any>;

  @ManyToOne(() => NbAccount, (account) => account.peers)
  account: NbAccount;
}