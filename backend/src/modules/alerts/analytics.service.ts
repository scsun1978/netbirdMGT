import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Alert, AlertStatus } from '../../../entities/alert.entity';
import { AlertSeverity } from '../../../entities/alert-rule.entity';
import { AlertRule } from '../../entities/alert-rule.entity';
import { AlertNotification, NotificationStatus, NotificationChannelType } from '../../entities/alert-notification.entity';
import { 
  AlertMetrics, 
  AlertTrend, 
  AlertSource, 
  RuleEffectiveness, 
  ChannelStats,
  TimeRange 
} from '../interfaces';

@Injectable()
export class AlertsAnalyticsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(AlertRule)
    private readonly alertRuleRepository: Repository<AlertRule>,
    @InjectRepository(AlertNotification)
    private readonly notificationRepository: Repository<AlertNotification>,
  ) {}

  async getAlertMetrics(timeRange: TimeRange): Promise<AlertMetrics> {
    const [
      totalAlerts,
      openAlerts,
      acknowledgedAlerts,
      resolvedAlerts,
      suppressedAlerts,
    ] = await Promise.all([
      this.alertRepository.count({
        where: {
          triggeredAt: Between(timeRange.startDate, timeRange.endDate),
        },
      }),
      this.alertRepository.count({
        where: {
          status: AlertStatus.OPEN,
          triggeredAt: Between(timeRange.startDate, timeRange.endDate),
        },
      }),
      this.alertRepository.count({
        where: {
          status: AlertStatus.ACKNOWLEDGED,
          triggeredAt: Between(timeRange.startDate, timeRange.endDate),
        },
      }),
      this.alertRepository.count({
        where: {
          status: AlertStatus.RESOLVED,
          triggeredAt: Between(timeRange.startDate, timeRange.endDate),
        },
      }),
      this.alertRepository.count({
        where: {
          status: AlertStatus.SUPPRESSED,
          triggeredAt: Between(timeRange.startDate, timeRange.endDate),
        },
      }),
    ]);

    const alertsBySeverity = await this.alertRepository
      .createQueryBuilder('alert')
      .select('alert.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .where('alert.triggeredAt BETWEEN :startDate AND :endDate', {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      })
      .groupBy('alert.severity')
      .getRawMany()
      .then(results => 
        results.reduce((acc, row) => {
          acc[row.severity] = parseInt(row.count);
          return acc;
        }, {})
      );

    const alertsByType = await this.alertRepository
      .createQueryBuilder('alert')
      .leftJoin('alert.rule', 'rule')
      .select('rule.ruleType', 'ruleType')
      .addSelect('COUNT(*)', 'count')
      .where('alert.triggeredAt BETWEEN :startDate AND :endDate', {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      })
      .groupBy('rule.ruleType')
      .getRawMany()
      .then(results => 
        results.reduce((acc, row) => {
          acc[row.ruleType] = parseInt(row.count);
          return acc;
        }, {})
      );

    const alertsBySource = await this.alertRepository
      .createQueryBuilder('alert')
      .select('alert.sourceType', 'sourceType')
      .addSelect('COUNT(*)', 'count')
      .where('alert.triggeredAt BETWEEN :startDate AND :endDate', {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      })
      .groupBy('alert.sourceType')
      .getRawMany()
      .then(results => 
        results.reduce((acc, row) => {
          acc[row.sourceType] = parseInt(row.count);
          return acc;
        }, {})
      );

    return {
      totalAlerts,
      openAlerts,
      acknowledgedAlerts,
      resolvedAlerts,
      suppressedAlerts,
      alertsBySeverity,
      alertsByType,
      alertsBySource,
    };
  }

  async getAlertTrends(timeRange: TimeRange): Promise<AlertTrend[]> {
    const dayMs = 24 * 60 * 60 * 1000;
    const trends: AlertTrend[] = [];

    for (let date = new Date(timeRange.startDate); date <= timeRange.endDate; date = new Date(date.getTime() + dayMs)) {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const [total, open, resolved, bySeverity] = await Promise.all([
        this.alertRepository.count({
          where: { triggeredAt: Between(dayStart, dayEnd) },
        }),
        this.alertRepository.count({
          where: { 
            status: AlertStatus.OPEN,
            triggeredAt: Between(dayStart, dayEnd),
          },
        }),
        this.alertRepository.count({
          where: { 
            status: AlertStatus.RESOLVED,
            triggeredAt: Between(dayStart, dayEnd),
          },
        }),
        this.alertRepository
          .createQueryBuilder('alert')
          .select('alert.severity', 'severity')
          .addSelect('COUNT(*)', 'count')
          .where('alert.triggeredAt BETWEEN :startDate AND :endDate', {
            startDate: dayStart,
            endDate: dayEnd,
          })
          .groupBy('alert.severity')
          .getRawMany()
          .then(results => 
            results.reduce((acc, row) => {
              acc[row.severity] = parseInt(row.count);
              return acc;
            }, {})
          ),
      ]);

      trends.push({
        date: dayStart.toISOString().split('T')[0],
        total,
        open,
        resolved,
        bySeverity,
      });
    }

    return trends;
  }

  async getTopAlertSources(limit: number = 10): Promise<AlertSource[]> {
    const sources = await this.alertRepository
      .createQueryBuilder('alert')
      .select('alert.sourceType', 'sourceType')
      .addSelect('alert.sourceId', 'sourceId')
      .addSelect('COUNT(*)', 'alertCount')
      .addSelect('MAX(alert.triggeredAt)', 'lastAlertAt')
      .groupBy('alert.sourceType, alert.sourceId')
      .orderBy('alertCount', 'DESC')
      .limit(limit)
      .getRawMany();

    return sources.map(source => ({
      sourceType: source.sourceType,
      sourceId: source.sourceId,
      sourceName: `${source.sourceType}:${source.sourceId}`,
      alertCount: parseInt(source.alertCount),
      lastAlertAt: source.lastAlertAt,
    }));
  }

  async getRuleEffectiveness(): Promise<RuleEffectiveness[]> {
    const rules = await this.alertRuleRepository
      .createQueryBuilder('rule')
      .leftJoin('rule.alerts', 'alert')
      .select([
        'rule.id',
        'rule.name',
        'rule.ruleType',
        'rule.evaluationCount',
        'rule.triggerCount',
        'rule.lastEvaluatedAt',
      ])
      .addSelect('COUNT(alert.id)', 'totalTriggers')
      .groupBy('rule.id')
      .getRawMany();

    return rules.map(rule => ({
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      totalEvaluations: rule.evaluationCount || 0,
      totalTriggers: parseInt(rule.totalTriggers) || 0,
      triggerRate: rule.evaluationCount > 0 ? (parseInt(rule.totalTriggers) || 0) / rule.evaluationCount : 0,
      averageAlertsPerEvaluation: rule.evaluationCount > 0 ? (parseInt(rule.totalTriggers) || 0) / rule.evaluationCount : 0,
      lastTriggeredAt: rule.lastEvaluatedAt,
    }));
  }

  async getNotificationChannelStats(): Promise<ChannelStats[]> {
    const channels = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.channelType', 'channelType')
      .addSelect('COUNT(CASE WHEN notification.status = :sent THEN 1 END)', 'totalSent')
      .addSelect('COUNT(CASE WHEN notification.status = :failed THEN 1 END)', 'totalFailed')
      .addSelect('AVG(EXTRACT(EPOCH FROM (notification.sentAt - notification.createdAt)))', 'averageDeliveryTime')
      .addSelect('MAX(notification.createdAt)', 'lastUsedAt')
      .where('notification.createdAt >= :startDate', {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
      .setParameter('sent', NotificationStatus.SENT)
      .setParameter('failed', NotificationStatus.FAILED)
      .groupBy('notification.channelType')
      .getRawMany();

    return channels.map(channel => ({
      channelId: channel.channelType,
      channelType: channel.channelType,
      totalSent: parseInt(channel.totalSent) || 0,
      totalFailed: parseInt(channel.totalFailed) || 0,
      successRate: (parseInt(channel.totalSent) || 0) / ((parseInt(channel.totalSent) || 0) + (parseInt(channel.totalFailed) || 0)),
      averageDeliveryTime: parseFloat(channel.averageDeliveryTime) || 0,
      lastUsedAt: channel.lastUsedAt,
    }));
  }

  async getMeanTimeToResolution(timeRange: TimeRange): Promise<number> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .select('AVG(EXTRACT(EPOCH FROM (alert.resolvedAt - alert.triggeredAt)))', 'avgResolutionTime')
      .where('alert.status = :resolved', { resolved: AlertStatus.RESOLVED })
      .andWhere('alert.triggeredAt BETWEEN :startDate AND :endDate', {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      })
      .andWhere('alert.resolvedAt IS NOT NULL')
      .getRawOne();

    return parseFloat(result?.avgResolutionTime) || 0;
  }

  async getAlertFrequencyByHour(timeRange: TimeRange): Promise<Record<string, number>> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .select('EXTRACT(HOUR FROM alert.triggeredAt)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('alert.triggeredAt BETWEEN :startDate AND :endDate', {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      })
      .groupBy('EXTRACT(HOUR FROM alert.triggeredAt)')
      .orderBy('hour')
      .getRawMany();

    return result.reduce((acc, row) => {
      acc[row.hour.toString()] = parseInt(row.count);
      return acc;
    }, {});
  }
}