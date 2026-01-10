import { Module } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '../auth/auth.module';
import { AlertsService } from './alerts.service';
import { AlertRulesEngine } from './rules-engine.service';
import { NotificationService } from './notification.service';
import { AlertsGateway } from './alerts.gateway';
import { AlertsScheduler } from './alerts.scheduler';
import { AlertsAnalyticsService } from './analytics.service';
import { EmailTemplates } from './templates/email-templates.service';
import { AlertRulesController } from './controllers/alert-rules.controller';
import { AlertsController } from './controllers/alerts.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { PeerOfflineEvaluator } from './evaluators/peer-offline.evaluator';
import { PeerFlappingEvaluator } from './evaluators/peer-flapping.evaluator';
import { GroupHealthEvaluator } from './evaluators/group-health.evaluator';
import { NewPeerEvaluator } from './evaluators/new-peer.evaluator';
import { PeerInactivityEvaluator } from './evaluators/peer-inactivity.evaluator';
import { NetworkChangeEvaluator } from './evaluators/network-change.evaluator';
import { BaseAlertEvaluator } from './evaluators/base-alert.evaluator';
import { Alert } from '../../../entities/alert.entity';
import { AlertRule } from '../../../entities/alert-rule.entity';
import { AlertNotification } from '../../../entities/alert-notification.entity';
import { NotificationChannel } from '../../../entities/notification-channel.entity';
import { PlatformUser } from '../../../entities/platform-user.entity';
import { NbPeer } from '../../../entities/nb-peer.entity';
import { NbGroup } from '../../../entities/nb-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Alert,
      AlertRule,
      AlertNotification,
      NotificationChannel,
      PlatformUser,
      NbPeer,
      NbGroup,
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [
    AlertRulesController,
    AlertsController,
    NotificationsController,
  ],
  providers: [
    AlertsService,
    AlertRulesEngine,
    NotificationService,
    AlertsGateway,
    AlertsScheduler,
    AlertsAnalyticsService,
    EmailTemplates,

    PeerOfflineEvaluator,
    PeerFlappingEvaluator,
    GroupHealthEvaluator,
    NewPeerEvaluator,
    PeerInactivityEvaluator,
    NetworkChangeEvaluator,
  ],
  exports: [
    AlertsService,
    AlertRulesEngine,
    NotificationService,
    AlertsGateway,
    AlertsAnalyticsService,
  ],
})
export class AlertsModule {}