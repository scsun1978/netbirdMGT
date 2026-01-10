import { Injectable } from '@nestjs/common';
import { BaseAlertEvaluator } from './base-alert.evaluator';
import { AlertRule } from '../../../entities/alert-rule.entity';
import { AlertStatus, AlertSourceType } from '../../../entities/alert.entity';
import { EvaluationContext } from '../interfaces';

interface NetworkSnapshot {
  timestamp: Date;
  totalPeers: number;
  totalGroups: number;
  connectedPeers: number;
  disconnectedPeers: number;
  accountId: string;
}

@Injectable()
export class NetworkChangeEvaluator extends BaseAlertEvaluator {
  getRuleType(): string {
    return 'network_change';
  }

  async evaluate(rule: AlertRule, context: EvaluationContext): Promise<any[]> {
    const alerts: any[] = [];
    const changeThreshold = rule.conditions.changeThreshold || 0.2;
    const snapshotWindow = rule.conditions.snapshotWindow || 60;

    const networkSnapshots = await this.getNetworkSnapshots(snapshotWindow);
    
    if (networkSnapshots.length === 0) {
      return alerts;
    }

    const currentSnapshot = this.createCurrentSnapshot(context);
    const previousSnapshot = networkSnapshots[0];

    const peerCountChange = this.calculatePercentageChange(
      previousSnapshot.totalPeers,
      currentSnapshot.totalPeers
    );

    const groupCountChange = this.calculatePercentageChange(
      previousSnapshot.totalGroups,
      currentSnapshot.totalGroups
    );

    const connectivityChange = this.calculatePercentageChange(
      previousSnapshot.connectedPeers,
      currentSnapshot.connectedPeers
    );

    if (Math.abs(peerCountChange) >= changeThreshold) {
      const title = `Significant peer count change detected`;
      const changeDirection = peerCountChange > 0 ? 'increased' : 'decreased';
      const description = `Peer count has ${changeDirection} by ${Math.abs(Math.round(peerCountChange * 100))}% (${previousSnapshot.totalPeers} → ${currentSnapshot.totalPeers}). This may indicate network expansion, device removal, or potential misconfiguration.`;

      const alert = await this.createAlert(
        rule,
        {
          metric: 'peer_count',
          previousValue: previousSnapshot.totalPeers,
          currentValue: currentSnapshot.totalPeers,
          changePercentage: Math.round(peerCountChange * 100),
          threshold: Math.round(changeThreshold * 100),
          accountId: currentSnapshot.accountId,
        },
        title,
        description,
        AlertSourceType.NETWORK,
        'network-peer-count',
      );

      alerts.push(alert);
    }

    if (Math.abs(groupCountChange) >= changeThreshold) {
      const title = `Significant group count change detected`;
      const changeDirection = groupCountChange > 0 ? 'increased' : 'decreased';
      const description = `Group count has ${changeDirection} by ${Math.abs(Math.round(groupCountChange * 100))}% (${previousSnapshot.totalGroups} → ${currentSnapshot.totalGroups}). This may indicate organizational changes or network restructuring.`;

      const alert = await this.createAlert(
        rule,
        {
          metric: 'group_count',
          previousValue: previousSnapshot.totalGroups,
          currentValue: currentSnapshot.totalGroups,
          changePercentage: Math.round(groupCountChange * 100),
          threshold: Math.round(changeThreshold * 100),
          accountId: currentSnapshot.accountId,
        },
        title,
        description,
        AlertSourceType.NETWORK,
        'network-group-count',
      );

      alerts.push(alert);
    }

    if (Math.abs(connectivityChange) >= changeThreshold) {
      const title = `Significant connectivity change detected`;
      const changeDirection = connectivityChange > 0 ? 'improved' : 'degraded';
      const description = `Connected peer count has ${changeDirection} by ${Math.abs(Math.round(connectivityChange * 100))}% (${previousSnapshot.connectedPeers} → ${currentSnapshot.connectedPeers}). This may indicate network issues or infrastructure changes.`;

      const alert = await this.createAlert(
        rule,
        {
          metric: 'connectivity',
          previousValue: previousSnapshot.connectedPeers,
          currentValue: currentSnapshot.connectedPeers,
          changePercentage: Math.round(connectivityChange * 100),
          threshold: Math.round(changeThreshold * 100),
          accountId: currentSnapshot.accountId,
        },
        title,
        description,
        AlertSourceType.NETWORK,
        'network-connectivity',
      );

      alerts.push(alert);
    }

    return alerts;
  }

  private createCurrentSnapshot(context: EvaluationContext): NetworkSnapshot {
    const connectedPeers = context.peers.filter(peer => peer.status === 'connected').length;
    const disconnectedPeers = context.peers.filter(peer => peer.status === 'disconnected').length;
    
    const accountId = context.peers.length > 0 
      ? context.peers[0].accountId 
      : context.groups.length > 0 
        ? context.groups[0].accountId 
        : 'unknown';

    return {
      timestamp: new Date(),
      totalPeers: context.peers.length,
      totalGroups: context.groups.length,
      connectedPeers,
      disconnectedPeers,
      accountId,
    };
  }

  private async getNetworkSnapshots(minutesWindow: number): Promise<NetworkSnapshot[]> {
    return [];
  }

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) {
      return current > 0 ? 1 : 0;
    }
    return (current - previous) / previous;
  }
}