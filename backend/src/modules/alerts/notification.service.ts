import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Alert } from '../../entities/alert.entity';
import { AlertNotification, NotificationStatus, NotificationChannelType } from '../../entities/alert-notification.entity';
import { EmailNotification, WebhookNotification, SlackNotification, InAppNotification } from './interfaces';
import { NotificationChannel } from '../../../entities/notification-channel.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(AlertNotification)
    private readonly notificationRepository: Repository<AlertNotification>,
    @InjectRepository(NotificationChannel)
    private readonly channelRepository: Repository<NotificationChannel>,
    private readonly configService: ConfigService,
  ) {}

  async sendNotification(alert: Alert, channels: string[]): Promise<void> {
    const notificationChannels = await this.channelRepository.find({
      where: { id: { $in: channels }, isEnabled: true },
    });

    for (const channel of notificationChannels) {
      try {
        const notification = this.notificationRepository.create({
          alertId: alert.id,
          channelType: channel.type,
          channelConfig: channel.config,
          status: NotificationStatus.PENDING,
        });

        const savedNotification = await this.notificationRepository.save(notification);

        await this.processNotification(savedNotification, alert, channel);
      } catch (error) {
        this.logger.error(`Failed to create notification for alert ${alert.id} via ${channel.type}: ${error.message}`);
      }
    }
  }

  private async processNotification(
    notification: AlertNotification,
    alert: Alert,
    channel: NotificationChannel,
  ): Promise<void> {
    try {
      switch (channel.type) {
        case NotificationChannelType.EMAIL:
          await this.sendEmailNotification(notification, alert, channel.config);
          break;
        case NotificationChannelType.WEBHOOK:
          await this.sendWebhookNotification(notification, alert, channel.config);
          break;
        case NotificationChannelType.SLACK:
          await this.sendSlackNotification(notification, alert, channel.config);
          break;
        case NotificationChannelType.IN_APP:
          await this.sendInAppNotification(notification, alert, channel.config);
          break;
        default:
          throw new Error(`Unsupported notification channel type: ${channel.type}`);
      }

      await this.markNotificationSent(notification.id);
    } catch (error) {
      await this.markNotificationFailed(notification.id, error.message);
      throw error;
    }
  }

  private async sendEmailNotification(
    notification: AlertNotification,
    alert: Alert,
    config: any,
  ): Promise<void> {
    const emailContent = this.generateEmailContent(alert);
    
    const emailPayload: EmailNotification = {
      to: config.to || [],
      cc: config.cc,
      bcc: config.bcc,
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      htmlContent: emailContent.html,
      textContent: emailContent.text,
    };

    this.logger.log(`Sending email notification for alert ${alert.id} to ${emailPayload.to.join(', ')}`);
  }

  private async sendWebhookNotification(
    notification: AlertNotification,
    alert: Alert,
    config: any,
  ): Promise<void> {
    const payload = {
      alert: {
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        status: alert.status,
        sourceType: alert.sourceType,
        sourceId: alert.sourceId,
        triggeredAt: alert.triggeredAt,
        sourceData: alert.sourceData,
        metadata: alert.metadata,
        tags: alert.tags,
      },
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`Sending webhook notification for alert ${alert.id} to ${config.url}`);
  }

  private async sendSlackNotification(
    notification: AlertNotification,
    alert: Alert,
    config: any,
  ): Promise<void> {
    const color = this.getSlackColor(alert.severity);
    
    const slackPayload: SlackNotification = {
      webhookUrl: config.webhookUrl,
      channel: config.channel,
      username: config.username || 'NetBird Alerts',
      iconEmoji: config.iconEmoji || ':warning:',
      text: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Description',
              value: alert.description,
              short: false,
            },
            {
              title: 'Source',
              value: `${alert.sourceType}:${alert.sourceId}`,
              short: true,
            },
            {
              title: 'Triggered At',
              value: alert.triggeredAt.toISOString(),
              short: true,
            },
            {
              title: 'Severity',
              value: alert.severity,
              short: true,
            },
            {
              title: 'Status',
              value: alert.status,
              short: true,
            },
          ],
          footer: 'NetBird Management Platform',
          ts: Math.floor(alert.triggeredAt.getTime() / 1000),
        },
      ],
    };

    this.logger.log(`Sending Slack notification for alert ${alert.id}`);
  }

  private async sendInAppNotification(
    notification: AlertNotification,
    alert: Alert,
    config: any,
  ): Promise<void> {
    const inAppPayload: InAppNotification = {
      userId: config.userId,
      title: alert.title,
      message: alert.description,
      type: this.getInAppNotificationType(alert.severity),
      metadata: {
        alertId: alert.id,
        severity: alert.severity,
        sourceType: alert.sourceType,
        sourceId: alert.sourceId,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    this.logger.log(`Sending in-app notification for alert ${alert.id} to user ${inAppPayload.userId}`);
  }

  private generateEmailContent(alert: Alert): { html: string; text: string } {
    const severityColor = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>NetBird Alert: ${alert.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: ${severityColor[alert.severity]}; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${alert.title}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Severity: ${alert.severity.toUpperCase()}</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; border-top: none;">
          <h2 style="color: #495057; margin-top: 0;">Alert Details</h2>
          <p><strong>Description:</strong> ${alert.description}</p>
          <p><strong>Source:</strong> ${alert.sourceType}:${alert.sourceId}</p>
          <p><strong>Triggered At:</strong> ${alert.triggeredAt.toISOString()}</p>
          <p><strong>Status:</strong> ${alert.status}</p>
          ${alert.tags.length > 0 ? `<p><strong>Tags:</strong> ${alert.tags.join(', ')}</p>` : ''}
        </div>
        <div style="background-color: #e9ecef; padding: 15px; text-align: center; border-radius: 0 0 5px 5px;">
          <p style="margin: 0; font-size: 14px; color: #6c757d;">
            This alert was generated by the NetBird Management Platform.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
      NetBird Alert: ${alert.title}
      
      Severity: ${alert.severity.toUpperCase()}
      
      Description: ${alert.description}
      
      Source: ${alert.sourceType}:${alert.sourceId}
      Triggered At: ${alert.triggeredAt.toISOString()}
      Status: ${alert.status}
      ${alert.tags.length > 0 ? `Tags: ${alert.tags.join(', ')}` : ''}
      
      ---
      This alert was generated by the NetBird Management Platform.
    `;

    return { html, text };
  }

  private getSlackColor(severity: string): string {
    const colors = {
      low: 'good',
      medium: 'warning',
      high: 'danger',
      critical: 'danger',
    };
    return colors[severity as keyof typeof colors] || 'warning';
  }

  private getInAppNotificationType(severity: string): 'info' | 'warning' | 'error' | 'success' {
    const types = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'error',
    };
    return types[severity as keyof typeof types] || 'info';
  }

  private async markNotificationSent(notificationId: string): Promise<void> {
    await this.notificationRepository.update(notificationId, {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      responseData: { sentAt: new Date().toISOString() } as any,
    });
  }

  private async markNotificationFailed(notificationId: string, errorMessage: string): Promise<void> {
    await this.notificationRepository.update(notificationId, {
      status: NotificationStatus.FAILED,
      errorMessage,
      nextRetryAt: this.calculateNextRetryTime(1),
    });
  }

  private calculateNextRetryTime(retryCount: number): Date {
    const baseDelay = 5 * 60 * 1000;
    const maxDelay = 60 * 60 * 1000;
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay);
    
    return new Date(Date.now() + exponentialDelay);
  }

  async retryFailedNotifications(): Promise<number> {
    const failedNotifications = await this.notificationRepository.find({
      where: {
        status: NotificationStatus.FAILED,
        nextRetryAt: LessThan(new Date()),
        retryCount: 0,
      },
      take: 100,
    });

    let retryCount = 0;

    for (const notification of failedNotifications) {
      try {
        await this.retryNotification(notification);
        retryCount++;
      } catch (error) {
        this.logger.error(`Failed to retry notification ${notification.id}: ${error.message}`);
      }
    }

    return retryCount;
  }

  private async retryNotification(notification: AlertNotification): Promise<void> {
    const updatedNotification = await this.notificationRepository.preload({
      id: notification.id,
      retryCount: notification.retryCount + 1,
      status: NotificationStatus.PENDING,
    });

    if (updatedNotification && updatedNotification.retryCount > updatedNotification.maxRetries) {
      await this.notificationRepository.update(notification.id, {
        status: NotificationStatus.FAILED,
        errorMessage: 'Max retries exceeded',
      });
      return;
    }

    if (updatedNotification) {
      await this.notificationRepository.save(updatedNotification);
    }
  }

  async testChannel(channelId: string): Promise<boolean> {
    const channel = await this.channelRepository.findOne({ where: { id: channelId } });
    
    if (!channel) {
      throw new Error(`Notification channel with ID ${channelId} not found`);
    }

    try {
      const testAlert = {
        id: 'test-alert-id',
        title: 'Test Alert',
        description: 'This is a test alert to verify the notification channel configuration.',
        severity: 'low' as const,
        status: 'open' as const,
        sourceType: 'system' as const,
        sourceId: 'test-source',
        triggeredAt: new Date(),
        sourceData: { test: true },
        metadata: {},
        tags: ['test'],
      };

      const testNotification = this.notificationRepository.create({
        alertId: testAlert.id,
        channelType: channel.type,
        channelConfig: channel.config,
        status: NotificationStatus.PENDING,
      });

      await this.processNotification(testNotification, testAlert, channel);
      return true;
    } catch (error) {
      this.logger.error(`Test failed for channel ${channelId}: ${error.message}`);
      return false;
    }
  }
}