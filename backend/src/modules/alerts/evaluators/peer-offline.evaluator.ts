import { Injectable } from '@nestjs/common';
import { BaseAlertEvaluator } from './base-alert.evaluator';
import { AlertRule } from '../../../entities/alert-rule.entity';
import { AlertStatus, AlertSourceType } from '../../../entities/alert.entity';
import { PeerStatus } from '../../../entities/nb-peer.entity';
import { EvaluationContext } from '../interfaces';

@Injectable()
export class PeerOfflineEvaluator extends BaseAlertEvaluator {
  getRuleType(): string {
    return 'peer_offline';
  }

  async evaluate(rule: AlertRule, context: EvaluationContext): Promise<any[]> {
    const alerts: any[] = [];
    const thresholdMinutes = rule.conditions.thresholdMinutes || 5;
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - thresholdMinutes);

    const offlinePeers = context.peers.filter(peer => {
      if (peer.status !== PeerStatus.DISCONNECTED) {
        return false;
      }

      const lastSeen = peer.lastSeen ? new Date(peer.lastSeen) : peer.firstSeenAt;
      return lastSeen < cutoffTime;
    });

    for (const peer of offlinePeers) {
      const title = `Peer ${peer.name} is offline`;
      const timeSinceLastSeen = peer.lastSeen 
        ? this.formatDuration(Date.now() - new Date(peer.lastSeen).getTime())
        : 'never';

      const description = `Peer ${peer.name} (${peer.ip}) has been offline for more than ${thresholdMinutes} minutes. Last seen: ${timeSinceLastSeen}. Location: ${peer.locationCity || 'Unknown'}, ${peer.locationCountry || 'Unknown'}`;

      const alert = await this.createAlert(
        rule,
        {
          peerId: peer.id,
          peerName: peer.name,
          peerIp: peer.ip,
          lastSeen: peer.lastSeen,
          locationCountry: peer.locationCountry,
          locationCity: peer.locationCity,
          offlineDuration: timeSinceLastSeen,
          accountId: peer.accountId,
        },
        title,
        description,
        AlertSourceType.PEER,
        peer.id,
      );

      alerts.push(alert);
    }

    return alerts;
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours % 24} hour${(hours % 24) > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes % 60} minute${(minutes % 60) > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }
}