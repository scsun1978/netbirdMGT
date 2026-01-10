import { Injectable } from '@nestjs/common';
import { AlertRule } from '../../../entities/alert-rule.entity';
import { Alert, AlertStatus, AlertSourceType } from '../../../entities/alert.entity';

export interface EvaluationContext {
  peers: any[];
  groups: any[];
  timestamp: Date;
}

@Injectable()
export abstract class BaseAlertEvaluator {
  evaluate(rule: AlertRule, context: EvaluationContext): Promise<Alert[]>;
  abstract getRuleType(): string;

  protected async createAlert(
    rule: AlertRule,
    sourceData: any,
    title: string,
    description: string,
    sourceType: AlertSourceType,
    sourceId: string,
  ): Promise<Alert> {
    const alert = {
      ruleId: rule.id,
      title,
      description,
      severity: rule.severity,
      status: AlertStatus.OPEN,
      sourceType,
      sourceId,
      sourceData,
      triggeredAt: new Date(),
      createdById: rule.createdById,
      metadata: {
        ruleType: rule.ruleType,
        ruleName: rule.name,
        evaluatedAt: new Date(),
      },
      tags: this.generateTags(rule, sourceData),
    };

    return alert;
  }

  protected generateTags(rule: AlertRule, sourceData: any): string[] {
    const tags = [rule.ruleType, rule.severity];
    
    if (sourceData?.accountId) {
      tags.push(`account:${sourceData.accountId}`);
    }
    
    if (sourceData?.locationCountry) {
      tags.push(`country:${sourceData.locationCountry}`);
    }

    return tags;
  }

  protected isAlertAlreadyOpen(existingAlerts: Alert[], sourceId: string): boolean {
    return existingAlerts.some(alert => 
      alert.sourceId === sourceId && 
      alert.status === AlertStatus.OPEN
    );
  }

  protected calculateThreshold(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'gte':
        return value >= threshold;
      case 'lt':
        return value < threshold;
      case 'lte':
        return value <= threshold;
      case 'eq':
        return value === threshold;
      default:
        return false;
    }
  }

  protected isWithinTimePeriod(timestamp: Date, periodMinutes: number): boolean {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    return diffMinutes <= periodMinutes;
  }

  protected countStateChangesInPeriod(
    peer: any,
    periodMinutes: number,
  ): number {
    if (!peer.meta?.stateHistory) {
      return 0;
    }

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - periodMinutes);

    return peer.meta.stateHistory
      .filter((entry: any) => new Date(entry.timestamp) >= cutoffTime)
      .length;
  }

  protected getPeerGroupMembership(peers: any[], groups: any[]): Map<string, string[]> {
    const peerGroups = new Map<string, string[]>();

    groups.forEach(group => {
      if (group.meta?.peerIds) {
        group.meta.peerIds.forEach((peerId: string) => {
          if (!peerGroups.has(peerId)) {
            peerGroups.set(peerId, []);
          }
          peerGroups.get(peerId)?.push(group.id);
        });
      }
    });

    return peerGroups;
  }
}