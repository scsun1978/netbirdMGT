export interface Peer {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  location?: string;
  groups: string[];
  os?: string;
  version?: string;
}

export interface Network {
  id: string;
  name: string;
  description?: string;
  peers: string[];
  createdAt: Date;
  settings: NetworkSettings;
}

export interface NetworkSettings {
  enabled: boolean;
  routing: 'direct' | 'peer';
  dnsEnabled: boolean;
  dnsServers: string[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  peers: string[];
  createdAt: Date;
}

export interface SetupKey {
  id: string;
  name: string;
  key: string;
  uses: number;
  maxUses: number;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}

export interface Token {
  id: string;
  name: string;
  token: string;
  expiresAt?: Date;
  lastUsed?: Date;
  permissions: string[];
  createdAt: Date;
  createdBy: string;
}
