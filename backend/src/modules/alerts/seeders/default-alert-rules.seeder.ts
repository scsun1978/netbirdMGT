import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertRule, AlertRuleType, AlertSeverity } from '../../../entities/alert-rule.entity';

@Injectable()
export class DefaultAlertRulesSeeder {
  constructor(
    @InjectRepository(AlertRule)
    private readonly alertRuleRepository: Repository<AlertRule>,
  ) {}

  async seedDefaultRules(): Promise<void> {
    const defaultRules = [
      {
        name: 'Peer Offline > 5 minutes',
        description: 'Alert when a peer has been offline for more than 5 minutes',
        ruleType: AlertRuleType.PEER_OFFLINE,
        conditions: {
          thresholdMinutes: 5,
        },
        severity: AlertSeverity.HIGH,
        isEnabled: true,
      },
      {
        name: 'Peer Flapping Detection',
        description: 'Detect rapid online/offline state changes (3+ changes in 10 minutes)',
        ruleType: AlertRuleType.PEER_FLAPPING,
        conditions: {
          stateChangeThreshold: 3,
          periodMinutes: 10,
        },
        severity: AlertSeverity.MEDIUM,
        isEnabled: true,
      },
      {
        name: 'Group Online Rate < 80%',
        description: 'Alert when group online rate falls below 80%',
        ruleType: AlertRuleType.GROUP_HEALTH,
        conditions: {
          minOnlineRate: 0.8,
        },
        severity: AlertSeverity.MEDIUM,
        isEnabled: true,
      },
      {
        name: 'New Peer Detected',
        description: 'Notify when a new peer joins the network',
        ruleType: AlertRuleType.NEW_PEER,
        conditions: {
          thresholdMinutes: 60,
        },
        severity: AlertSeverity.LOW,
        isEnabled: true,
      },
      {
        name: 'Peer Inactive > 30 days',
        description: 'Alert when a peer hasn\'t been seen for more than 30 days',
        ruleType: AlertRuleType.PEER_INACTIVITY,
        conditions: {
          thresholdDays: 30,
        },
        severity: AlertSeverity.LOW,
        isEnabled: true,
      },
      {
        name: 'Network Resource Change > 20%',
        description: 'Monitor sudden changes in network resources (>20% change)',
        ruleType: AlertRuleType.NETWORK_CHANGE,
        conditions: {
          changeThreshold: 0.2,
          snapshotWindow: 60,
        },
        severity: AlertSeverity.MEDIUM,
        isEnabled: true,
      },
    ];

    for (const ruleData of defaultRules) {
      const existingRule = await this.alertRuleRepository.findOne({
        where: { name: ruleData.name },
      });

      if (!existingRule) {
        const rule = this.alertRuleRepository.create({
          ...ruleData,
          createdById: 'system-seeder',
        });

        await this.alertRuleRepository.save(rule);
        console.log(`Created default alert rule: ${ruleData.name}`);
      }
    }
  }
}