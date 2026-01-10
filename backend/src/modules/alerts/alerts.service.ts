import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Alert, AlertStatus } from '../../entities/alert.entity';
import { PlatformUser } from '../../entities/platform-user.entity';
import { NotificationService } from './notification.service';
import { AlertsGateway } from './alerts.gateway';
import { AcknowledgeAlertDto, ResolveAlertDto, SuppressAlertDto, GetAlertsDto } from './dto/alerts.dto';
import { AlertStatistics } from './interfaces/alert-statistics.interface';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(PlatformUser)
    private readonly userRepository: Repository<PlatformUser>,
    private readonly notificationService: NotificationService,
    private readonly alertsGateway: AlertsGateway,
  ) {}

  async createAlert(alertData: any): Promise<Alert> {
    const alert = this.alertRepository.create(alertData);
    const savedAlert = await this.alertRepository.save(alert);

    await this.notificationService.sendNotification(alertData, alertData.notificationChannels || []);

    this.alertsGateway.sendNewAlert(alertData);

    this.logger.log(`Created new alert: ${alertData.id} for rule: ${alertData.ruleId}`);
    return savedAlert;
  }

  async acknowledgeAlert(alertId: string, userId: string, message?: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
      relations: ['acknowledgedBy'],
    });

    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    if (alert.status !== AlertStatus.OPEN) {
      throw new Error(`Alert must be in OPEN status to be acknowledged. Current status: ${alert.status}`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedById = userId;
    
    if (message) {
      alert.metadata = {
        ...alert.metadata,
        acknowledgmentMessage: message,
      };
    }

    const updatedAlert = await this.alertRepository.save(alert);

    await this.alertsGateway.sendAlertUpdate(updatedAlert);

    this.logger.log(`Alert ${alertId} acknowledged by user ${userId}`);
    return updatedAlert;
  }

  async resolveAlert(alertId: string, userId: string, reason?: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
      relations: ['resolvedBy'],
    });

    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    alert.resolvedById = userId;
    
    if (reason) {
      alert.metadata = {
        ...alert.metadata,
        resolutionReason: reason,
      };
    }

    const updatedAlert = await this.alertRepository.save(alert);

    await this.alertsGateway.sendAlertResolved(alertId);

    this.logger.log(`Alert ${alertId} resolved by user ${userId}`);
    return updatedAlert;
  }

  async suppressAlert(alertId: string, until: Date, userId: string, reason?: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
    });

    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    if (alert.status !== AlertStatus.OPEN) {
      throw new Error(`Alert must be in OPEN status to be suppressed. Current status: ${alert.status}`);
    }

    alert.status = AlertStatus.SUPPRESSED;
    alert.suppressedUntil = until;
    
    if (reason) {
      alert.metadata = {
        ...alert.metadata,
        suppressionReason: reason,
        suppressedBy: userId,
      };
    }

    const updatedAlert = await this.alertRepository.save(alert);

    await this.alertsGateway.sendAlertUpdate(updatedAlert);

    this.logger.log(`Alert ${alertId} suppressed until ${until.toISOString()}`);
    return updatedAlert;
  }

  async getAlerts(filters: GetAlertsDto): Promise<Alert[]> {
    const queryBuilder = this.alertRepository.createQueryBuilder('alert')
      .leftJoinAndSelect('alert.rule', 'rule')
      .leftJoinAndSelect('alert.acknowledgedBy', 'acknowledgedBy')
      .leftJoinAndSelect('alert.resolvedBy', 'resolvedBy')
      .leftJoinAndSelect('alert.createdBy', 'createdBy');

    if (filters.status) {
      queryBuilder.andWhere('alert.status = :status', { status: filters.status });
    }

    if (filters.severity) {
      queryBuilder.andWhere('alert.severity = :severity', { severity: filters.severity });
    }

    if (filters.sourceType) {
      queryBuilder.andWhere('alert.sourceType = :sourceType', { sourceType: filters.sourceType });
    }

    if (filters.sourceId) {
      queryBuilder.andWhere('alert.sourceId = :sourceId', { sourceId: filters.sourceId });
    }

    if (filters.ruleId) {
      queryBuilder.andWhere('alert.ruleId = :ruleId', { ruleId: filters.ruleId });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('alert.triggeredAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('alert.triggeredAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters.createdById) {
      queryBuilder.andWhere('alert.createdById = :createdById', { createdById: filters.createdById });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('alert.tags @> :tags', { tags: JSON.stringify(filters.tags) });
    }

    queryBuilder.orderBy('alert.triggeredAt', 'DESC');

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    return queryBuilder.getMany();
  }

  async getAlert(alertId: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
      relations: ['rule', 'acknowledgedBy', 'resolvedBy', 'createdBy', 'notifications'],
    });

    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    return alert;
  }

  async deleteAlert(alertId: string): Promise<void> {
    const alert = await this.alertRepository.findOne({ where: { id: alertId } });
    
    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    await this.alertRepository.delete(alertId);

    this.logger.log(`Alert ${alertId} deleted`);
  }

  async getAlertStatistics(): Promise<AlertStatistics> {
    const [
      totalAlerts,
      openAlerts,
      acknowledgedAlerts,
      resolvedAlerts,
      suppressedAlerts,
    ] = await Promise.all([
      this.alertRepository.count(),
      this.alertRepository.count({ where: { status: AlertStatus.OPEN } }),
      this.alertRepository.count({ where: { status: AlertStatus.ACKNOWLEDGED } }),
      this.alertRepository.count({ where: { status: AlertStatus.RESOLVED } }),
      this.alertRepository.count({ where: { status: AlertStatus.SUPPRESSED } }),
    ]);

    const alertsBySeverity = await this.alertRepository
      .createQueryBuilder('alert')
      .select('alert.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
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
      .groupBy('rule.ruleType')
      .getRawMany()
      .then(results => 
        results.reduce((acc, row) => {
          acc[row.ruleType] = parseInt(row.count);
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
    };
  }

  async autoResolveAlertsForSource(sourceType: string, sourceId: string): Promise<number> {
    const result =     await this.alertRepository.update(
      {
        sourceType: sourceType as any,
        sourceId,
        status: AlertStatus.RESOLVED,
      },
      {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
      }
    );

    const resolvedCount = result.affected || 0;

    if (resolvedCount > 0) {
      this.logger.log(`Auto-resolved ${resolvedCount} alerts for ${sourceType}:${sourceId}`);
    }

    return resolvedCount;
  }

  async unsuppressExpiredAlerts(): Promise<number> {
    const result = await this.alertRepository.update(
      {
        status: AlertStatus.SUPPRESSED,
      },
      {
        status: AlertStatus.OPEN,
        suppressedUntil: null,
      }
    );

    return result.affected || 0;
  }
}