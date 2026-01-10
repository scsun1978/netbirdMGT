export interface Alert {
  id: string;
  ruleId: string;
  status: 'open' | 'acknowledged' | 'resolved';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  condition: AlertCondition;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: NotificationSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  type: 'peer_count' | 'peer_offline' | 'network_event' | 'custom_metric';
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
  value: number | string;
  timeWindow?: number;
}

export interface NotificationSettings {
  email: boolean;
  webhook?: string;
  slack?: string;
  cooldown: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
