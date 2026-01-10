import { Injectable } from '@nestjs/common';
import { BaseAlertEvaluator } from './base-alert.evaluator';
import { AlertRule } from '../../../entities/alert-rule.entity';
import { AlertStatus, AlertSourceType } from '../../../entities/alert.entity';
import { EvaluationContext } from '../interfaces';

@Injectable()
export class PeerInactivityEvaluator extends BaseAlertEvaluator {
  getRuleType(): string {
    return 'peer_inactivity';
  }

  async evaluate(rule: AlertRule, context: EvaluationContext): Promise<any[]> {
    const alerts: any[] = [];
    const thresholdDays = rule.conditions.thresholdDays || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

    for (const peer of context.peers) {
      const lastSeen = peer.lastSeen ? new Date(peer.lastSeen) : peer.firstSeenAt;
      
      if (lastSeen < cutoffDate) {
        const daysInactive = Math.floor((Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
        const title = `Peer ${peer.name} is inactive`;
        const description = `Peer ${peer.name} (${peer.ip}) has not been seen for ${daysInactive} days (threshold: ${thresholdDays} days). Last seen: ${lastSeen.toISOString().split('T')[0]}. Location: ${peer.locationCity || 'Unknown'}, ${peer.locationCountry || 'Unknown'}. Consider removing this stale peer or checking if it's still needed.`;

        const alert = await this.createAlert(
          rule,
          {
            peerId: peer.id,
            peerName: peer.name,
            peerIp: peer.ip,
            lastSeen: peer.lastSeen,
            daysInactive,
            thresholdDays,
            locationCountry: peer.locationCountry,
            locationCity: peer.locationCity,
            totalUptimeMinutes: peer.totalUptimeMinutes,
            accountId: peer.accountId,
          },
          title,
          description,
          AlertSourceType.PEER,
          peer.id,
        );

        alerts.push(alert);
      }
    }

    return alerts;
  }
}