export interface NetworkMetrics {
  totalPeers: number;
  onlinePeers: number;
  offlinePeers: number;
  networkUptime: number;
  avgLatency: number;
  totalBandwidth: number;
  alertCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export type TimeRange = '1h' | '24h' | '7d' | '30d' | 'custom';

export type ActivityType = 'peer_join' | 'peer_leave' | 'alert_triggered' | 'alert_resolved' | 'system_event';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: ActivityType;
  title: string;
  description: string;
  severity: Severity;
  metadata?: Record<string, unknown>;
}

export interface PeerLocation {
  country: string;
  city: string;
  lat: number;
  lng: number;
  count: number;
  status: 'online' | 'offline';
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  category?: string;
}

export interface AlertTrendData {
  timestamp: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}
