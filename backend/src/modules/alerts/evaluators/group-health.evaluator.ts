import { Injectable } from '@nestjs/common';
import { BaseAlertEvaluator } from './base-alert.evaluator';
import { AlertRule } from '../../../entities/alert-rule.entity';
import { AlertStatus, AlertSourceType } from '../../../entities/alert.entity';
import { PeerStatus } from '../../../entities/nb-peer.entity';
import { EvaluationContext } from '../interfaces';

@Injectable()
export class GroupHealthEvaluator extends BaseAlertEvaluator {
  getRuleType(): string {
    return 'group_health';
  }

  async evaluate(rule: AlertRule, context: EvaluationContext): Promise<any[]> {
    const alerts: any[] = [];
    const minOnlineRate = rule.conditions.minOnlineRate || 0.8;

    const peerGroups = this.getPeerGroupMembership(context.peers, context.groups);

    for (const group of context.groups) {
      const groupPeers = this.getGroupPeers(context.peers, group);
      
      if (groupPeers.length === 0) {
        continue;
      }

      const onlinePeers = groupPeers.filter(peer => peer.status === PeerStatus.CONNECTED);
      const onlineRate = onlinePeers.length / groupPeers.length;

      if (onlineRate < minOnlineRate) {
        const title = `Group ${group.name} health degraded`;
        const percentage = Math.round(onlineRate * 100);
        const description = `Group ${group.name} has ${percentage}% online peers (${onlinePeers.length}/${groupPeers.length}), which is below the ${Math.round(minOnlineRate * 100)}% threshold. This may indicate network issues or widespread connectivity problems.`;

        const alert = await this.createAlert(
          rule,
          {
            groupId: group.id,
            groupName: group.name,
            totalPeers: groupPeers.length,
            onlinePeers: onlinePeers.length,
            offlinePeers: groupPeers.length - onlinePeers.length,
            onlineRate: percentage,
            threshold: Math.round(minOnlineRate * 100),
            accountId: group.accountId,
          },
          title,
          description,
          AlertSourceType.GROUP,
          group.id,
        );

        alerts.push(alert);
      }
    }

    return alerts;
  }

  private getGroupPeers(peers: any[], group: any): any[] {
    if (!group.meta?.peerIds || !Array.isArray(group.meta.peerIds)) {
      return [];
    }

    return peers.filter(peer => group.meta.peerIds.includes(peer.id));
  }
}