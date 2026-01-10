import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlertRulesEngine } from './rules-engine.service';
import { AlertsService } from './alerts.service';
import { NotificationService } from './notification.service';

@Injectable()
export class AlertsScheduler {
  private readonly logger = new Logger(AlertsScheduler.name);

  constructor(
    private readonly rulesEngine: AlertRulesEngine,
    private readonly alertsService: AlertsService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron('*/1 * * * *')
  async evaluateHighFrequencyRules(): Promise<void> {
    this.logger.debug('Starting high-frequency rule evaluation');
    
    try {
      const alerts = await this.rulesEngine.evaluateRules();
      
      for (const alert of alerts) {
        await this.alertsService.createAlert(alert);
      }

      if (alerts.length > 0) {
        this.logger.log(`High-frequency evaluation completed: ${alerts.length} alerts generated`);
      }
    } catch (error) {
      this.logger.error(`High-frequency rule evaluation failed: ${error.message}`);
    }
  }

  @Cron('*/5 * * * *')
  async evaluateMediumFrequencyRules(): Promise<void> {
    this.logger.debug('Starting medium-frequency rule evaluation');
    
    try {
      await this.rulesEngine.cleanupOldAlerts(7);
      await this.alertsService.unsuppressExpiredAlerts();
      await this.notificationService.retryFailedNotifications();

      this.logger.debug('Medium-frequency evaluation completed');
    } catch (error) {
      this.logger.error(`Medium-frequency evaluation failed: ${error.message}`);
    }
  }

  @Cron('0 */15 * * *')
  async evaluateLowFrequencyRules(): Promise<void> {
    this.logger.debug('Starting low-frequency rule evaluation');
    
    try {
      await this.rulesEngine.cleanupOldAlerts(30);
      
      this.logger.debug('Low-frequency evaluation completed');
    } catch (error) {
      this.logger.error(`Low-frequency evaluation failed: ${error.message}`);
    }
  }

  @Cron('0 0 * * * *')
  async generateDailyReport(): Promise<void> {
    this.logger.log('Generating daily alert report');
    
    try {
      const stats = await this.alertsService.getAlertStatistics();
      
      this.logger.log(`Daily report generated: ${stats.totalAlerts} total alerts, ${stats.openAlerts} open`);
    } catch (error) {
      this.logger.error(`Daily report generation failed: ${error.message}`);
    }
  }

  @Cron('0 */30 * * * *')
  async cleanupOldAlerts(): Promise<void> {
    this.logger.debug('Starting old alerts cleanup');
    
    try {
      const deletedCount = await this.rulesEngine.cleanupOldAlerts(90);
      
      if (deletedCount > 0) {
        this.logger.log(`Cleaned up ${deletedCount} old alerts`);
      }
    } catch (error) {
      this.logger.error(`Alert cleanup failed: ${error.message}`);
    }
  }
}