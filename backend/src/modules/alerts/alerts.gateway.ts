import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Alert } from '../../entities/alert.entity';

interface ClientSubscription {
  userId?: string;
  filters?: Record<string, any>;
  subscribedAt: Date;
}

@WebSocketGateway({
  namespace: 'alerts',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class AlertsGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AlertsGateway.name);
  private readonly clientSubscriptions = new Map<string, ClientSubscription>();

  async sendAlertUpdate(alert: Alert): Promise<void> {
    this.logger.debug(`Broadcasting alert update: ${alert.id}`);
    
    this.server.emit('alert_update', {
      id: alert.id,
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      status: alert.status,
      sourceType: alert.sourceType,
      sourceId: alert.sourceId,
      triggeredAt: alert.triggeredAt,
      acknowledgedAt: alert.acknowledgedAt,
      resolvedAt: alert.resolvedAt,
      suppressedUntil: alert.suppressedUntil,
      metadata: alert.metadata,
      tags: alert.tags,
    });
  }

  async sendNewAlert(alert: Alert): Promise<void> {
    this.logger.debug(`Broadcasting new alert: ${alert.id}`);
    
    this.server.emit('new_alert', {
      id: alert.id,
      ruleId: alert.ruleId,
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
    });
  }

  async sendAlertResolved(alertId: string): Promise<void> {
    this.logger.debug(`Broadcasting alert resolved: ${alertId}`);
    
    this.server.emit('alert_resolved', {
      alertId,
      resolvedAt: new Date().toISOString(),
    });
  }

  async sendAlertAcknowledged(alertId: string, acknowledgedBy: string, message?: string): Promise<void> {
    this.logger.debug(`Broadcasting alert acknowledged: ${alertId}`);
    
    this.server.emit('alert_acknowledged', {
      alertId,
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString(),
      message,
    });
  }

  async sendAlertSuppressed(alertId: string, until: Date, reason?: string): Promise<void> {
    this.logger.debug(`Broadcasting alert suppressed: ${alertId}`);
    
    this.server.emit('alert_suppressed', {
      alertId,
      suppressedUntil: until.toISOString(),
      reason,
    });
  }

  async sendRuleEvaluationResult(ruleId: string, result: any): Promise<void> {
    this.logger.debug(`Broadcasting rule evaluation result: ${ruleId}`);
    
    this.server.emit('rule_evaluation', {
      ruleId,
      result,
      timestamp: new Date().toISOString(),
    });
  }

  async sendNotificationStatusUpdate(alertId: string, status: string): Promise<void> {
    this.logger.debug(`Broadcasting notification status update: ${alertId}`);
    
    this.server.emit('notification_status', {
      alertId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId?: string; filters?: Record<string, any> },
  ): Promise<void> {
    this.logger.debug(`Client ${client.id} subscribed to alerts`, data);

    this.clientSubscriptions.set(client.id, {
      userId: data.userId,
      filters: data.filters,
      subscribedAt: new Date(),
    });

    client.emit('subscribed', {
      message: 'Successfully subscribed to alert updates',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.debug(`Client ${client.id} unsubscribed from alerts`);

    this.clientSubscriptions.delete(client.id);

    client.emit('unsubscribed', {
      message: 'Successfully unsubscribed from alert updates',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('get_subscription_status')
  async handleGetSubscriptionStatus(@ConnectedSocket() client: Socket): Promise<void> {
    const subscription = this.clientSubscriptions.get(client.id);
    
    client.emit('subscription_status', {
      isSubscribed: !!subscription,
      subscription,
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket): Promise<void> {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    
    client.emit('connected', {
      message: 'Connected to alerts WebSocket',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    this.clientSubscriptions.delete(client.id);
  }

  getConnectedClientsCount(): number {
    return this.server.engine.clientsCount;
  }

  getSubscriptionInfo(): Array<{ clientId: string; subscription: ClientSubscription }> {
    return Array.from(this.clientSubscriptions.entries()).map(([clientId, subscription]) => ({
      clientId,
      subscription,
    }));
  }

  async broadcastToUser(userId: string, event: string, data: any): Promise<void> {
    const subscribedClients = Array.from(this.clientSubscriptions.entries())
      .filter(([, subscription]) => subscription.userId === userId)
      .map(([clientId]) => clientId);

    for (const clientId of subscribedClients) {
      this.server.to(clientId).emit(event, data);
    }
  }

  async broadcastWithFilter(filterFn: (subscription: ClientSubscription) => boolean, event: string, data: any): Promise<void> {
    const matchingClients = Array.from(this.clientSubscriptions.entries())
      .filter(([, subscription]) => filterFn(subscription))
      .map(([clientId]) => clientId);

    for (const clientId of matchingClients) {
      this.server.to(clientId).emit(event, data);
    }
  }
}