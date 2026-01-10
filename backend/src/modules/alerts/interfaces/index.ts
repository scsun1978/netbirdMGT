export interface EvaluationContext {
  peers: any[];
  groups: any[];
  timestamp: Date;
}

export interface AlertEvaluationResult {
  ruleId: string;
  ruleType: string;
  success: boolean;
  alertsGenerated: number;
  alerts: any[];
  evaluatedAt: Date;
  context: EvaluationContext;
  error?: string;
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

export interface EmailNotification {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  template?: string;
  templateData?: Record<string, any>;
}

export interface WebhookNotification {
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  payload: Record<string, any>;
  timeout?: number;
  retryCount?: number;
}

export interface SlackNotification {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
  blocks?: any[];
  text?: string;
  attachments?: any[];
}

export interface InAppNotification {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface TestResult {
  success: boolean;
  response?: any;
  error?: string;
  duration: number;
}