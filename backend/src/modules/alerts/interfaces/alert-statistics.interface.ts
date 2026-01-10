import { AlertStatus } from '../../entities/alert.entity';

export interface AlertStatistics {
  totalAlerts: number;
  openAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  suppressedAlerts: number;
  alertsBySeverity: Record<string, number>;
  alertsByType: Record<string, number>;
}

export interface AlertMetrics {
  totalAlerts: number;
  openAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  suppressedAlerts: number;
  alertsBySeverity: Record<string, number>;
  alertsByType: Record<string, number>;
  alertsBySource: Record<string, number>;
}

export interface AlertTrend {
  date: string;
  total: number;
  open: number;
  resolved: number;
  bySeverity: Record<string, number>;
}

export interface AlertSource {
  sourceType: string;
  sourceId: string;
  sourceName: string;
  alertCount: number;
  lastAlertAt: Date;
}

export interface RuleEffectiveness {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  totalEvaluations: number;
  totalTriggers: number;
  triggerRate: number;
  averageAlertsPerEvaluation: number;
  lastTriggeredAt: Date;
}

export interface ChannelStats {
  channelId: string;
  channelType: string;
  totalSent: number;
  totalFailed: number;
  successRate: number;
  averageDeliveryTime: number;
  lastUsedAt: Date;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}