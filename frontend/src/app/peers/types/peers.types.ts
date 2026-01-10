export type PeerStatus = 'online' | 'offline' | 'error';

export interface PeerMetrics {
  latency: number;
  bandwidth: number;
  connectionQuality: number; // 0-100
  lastUpdated: string;
}

export interface PeerSystemInfo {
  os: string;
  osVersion: string;
  hostname: string;
  cpu: string;
  memory: string;
  disk: string;
  uptime: number; // seconds
}

export interface PeerNetworkInfo {
  routes: string[];
  dns: string[];
  firewall: boolean;
  sshEnabled: boolean;
  interfaceIp: string;
  macAddress: string;
}

export interface PeerLocation {
  country: string;
  city: string;
  countryCode: string; // ISO 2-letter code
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PeerAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  active: boolean;
}

export interface Peer {
  id: string;
  name: string;
  ip: string; // NetBird IP
  connectionIp: string; // Real IP
  status: PeerStatus;
  lastSeen: string; // ISO date string
  connectedSince?: string; // ISO date string
  version: string; // NetBird client version
  
  // Group membership
  groups: string[];
  
  // Detailed info sections
  system: PeerSystemInfo;
  network: PeerNetworkInfo;
  location: PeerLocation;
  
  // Dynamic data
  metrics?: PeerMetrics;
  alerts: PeerAlert[];
  
  // Metadata
  tags: string[];
}

export interface PeerFilters {
  search: string;
  status: PeerStatus | 'all';
  location: string | 'all';
  groupId: string | 'all';
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
