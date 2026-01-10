import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AlertRule, AlertRuleType } from '../../entities/alert-rule.entity';
import { Alert, AlertStatus } from '../../entities/alert.entity';
import { PlatformUser } from '../../entities/platform-user.entity';
import { NbPeer, PeerStatus } from '../../entities/nb-peer.entity';
import { NbGroup } from '../../entities/nb-group.entity';
import { BaseAlertEvaluator } from './evaluators/base-alert.evaluator';
import { PeerOfflineEvaluator } from './evaluators/peer-offline.evaluator';
import { PeerFlappingEvaluator } from './evaluators/peer-flapping.evaluator';
import { GroupHealthEvaluator } from './evaluators/group-health.evaluator';
import { NewPeerEvaluator } from './evaluators/new-peer.evaluator';
import { PeerInactivityEvaluator } from './evaluators/peer-inactivity.evaluator';
import { NetworkChangeEvaluator } from './evaluators/network-change.evaluator';
import { CreateAlertRuleDto, UpdateAlertRuleDto } from './dto/alert-rules.dto';
import { AlertEvaluationResult, EvaluationContext } from './interfaces';

export interface EvaluationContext {
  peers: NbPeer[];
  groups: NbGroup[];
  timestamp: Date;
}

@Injectable()
export class AlertRulesEngine {
  private readonly logger = new Logger(AlertRulesEngine.name);
  private readonly evaluators: Map<string, BaseAlertEvaluator>;

  constructor(
    @InjectRepository(AlertRule)
    private readonly alertRuleRepository: Repository<AlertRule>,
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(NbPeer)
    private readonly peerRepository: Repository<NbPeer>,
    @InjectRepository(NbGroup)
    private readonly groupRepository: Repository<NbGroup>,
  ) {
    this.evaluators = new Map([
      [AlertRuleType.PEER_OFFLINE, new PeerOfflineEvaluator()],
      [AlertRuleType.PEER_FLAPPING, new PeerFlappingEvaluator()],
      [AlertRuleType.GROUP_HEALTH, new GroupHealthEvaluator()],
      [AlertRuleType.NEW_PEER, new NewPeerEvaluator()],
      [AlertRuleType.PEER_INACTIVITY, new PeerInactivityEvaluator()],
      [AlertRuleType.NETWORK_CHANGE, new NetworkChangeEvaluator()],
    ]);
  }

  async evaluateRules(): Promise<Alert[]> {
    this.logger.log('Starting evaluation of all enabled alert rules');
    
    const enabledRules = await this.alertRuleRepository.find({
      where: { isEnabled: true },
    });

    const context = await this.buildEvaluationContext();
    const allAlerts: Alert[] = [];

    for (const rule of enabledRules) {
      try {
        const alerts = await this.evaluateRuleInternal(rule, context);
        allAlerts.push(...alerts);
        
        rule.lastEvaluatedAt = new Date();
        rule.evaluationCount += 1;
        await this.alertRuleRepository.save(rule);
      } catch (error) {
        this.logger.error(`Error evaluating rule ${rule.id}: ${error.message}`);
      }
    }

    this.logger.log(`Evaluation complete. Generated ${allAlerts.length} alerts`);
    return allAlerts;
  }

  async evaluateRule(ruleId: string, context?: EvaluationContext): Promise<Alert[]> {
    const rule = await this.alertRuleRepository.findOne({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new Error(`Alert rule with ID ${ruleId} not found`);
    }

    if (!rule.isEnabled) {
      return [];
    }

    const evaluationContext = context || await this.buildEvaluationContext();
    return this.evaluateRuleInternal(rule, evaluationContext);
  }

  private async evaluateRuleInternal(rule: AlertRule, context: EvaluationContext): Promise<Alert[]> {
    const evaluator = this.evaluators.get(rule.ruleType);
    if (!evaluator) {
      throw new Error(`No evaluator found for rule type: ${rule.ruleType}`);
    }

    return evaluator.evaluate(rule, context);
  }

  async addRule(createRuleDto: CreateAlertRuleDto, userId: string): Promise<AlertRule> {
    const rule = this.alertRuleRepository.create({
      ...createRuleDto,
      createdById: userId,
    });

    return this.alertRuleRepository.save(rule);
  }

  async updateRule(ruleId: string, updates: UpdateAlertRuleDto): Promise<AlertRule> {
    await this.alertRuleRepository.update(ruleId, updates);
    const rule = await this.alertRuleRepository.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new Error(`Alert rule with ID ${ruleId} not found`);
    }
    return rule;
  }

  async deleteRule(ruleId: string): Promise<void> {
    await this.alertRepository.update(
      { ruleId, status: AlertStatus.OPEN },
      { status: AlertStatus.RESOLVED }
    );

    await this.alertRuleRepository.delete(ruleId);
  }

  async enableRule(ruleId: string): Promise<void> {
    await this.alertRuleRepository.update(ruleId, { isEnabled: true });
  }

  async disableRule(ruleId: string): Promise<void> {
    await this.alertRuleRepository.update(ruleId, { isEnabled: false });
  }

  async testRule(ruleId: string, testData?: any): Promise<AlertEvaluationResult> {
    const rule = await this.alertRuleRepository.findOne({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new Error(`Alert rule with ID ${ruleId} not found`);
    }

    const context = testData?.context || await this.buildEvaluationContext();
    const evaluator = this.evaluators.get(rule.ruleType);

    if (!evaluator) {
      throw new Error(`No evaluator found for rule type: ${rule.ruleType}`);
    }

    try {
      const alerts = await evaluator.evaluate(rule, context);
      
      return {
        ruleId,
        ruleType: rule.ruleType,
        success: true,
        alertsGenerated: alerts.length,
        alerts,
        evaluatedAt: new Date(),
        context,
      };
    } catch (error) {
      return {
        ruleId,
        ruleType: rule.ruleType,
        success: false,
        error: error.message,
        alertsGenerated: 0,
        alerts: [],
        evaluatedAt: new Date(),
        context,
      };
    }
  }

  private async buildEvaluationContext(): Promise<EvaluationContext> {
    const [peers, groups] = await Promise.all([
      this.peerRepository.find({
        relations: ['account'],
      }),
      this.groupRepository.find({
        relations: ['account'],
      }),
    ]);

    return {
      peers,
      groups,
      timestamp: new Date(),
    };
  }

  async getRulesByType(ruleType: AlertRuleType): Promise<AlertRule[]> {
    return this.alertRuleRepository.find({
      where: { ruleType, isEnabled: true },
    });
  }

  async getEnabledRules(): Promise<AlertRule[]> {
    return this.alertRuleRepository.find({
      where: { isEnabled: true },
      order: { severity: 'DESC' },
    });
  }

  async cleanupOldAlerts(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.alertRepository.delete({
      status: AlertStatus.RESOLVED,
      updatedAt: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }
}