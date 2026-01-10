import { Injectable } from '@nestjs/common';
import { BaseAlertEvaluator } from './base-alert.evaluator';
import { AlertRule } from '../../../entities/alert-rule.entity';
import { AlertStatus, AlertSourceType } from '../../../entities/alert.entity';
import { PeerStatus } from '../../../entities/nb-peer.entity';
import { EvaluationContext } from '../interfaces';

@Injectable()
export class PeerFlappingEvaluator extends BaseAlertEvaluator {
  getRuleType(): string {
    return 'peer_flapping';
  }

  async evaluate(rule: AlertRule, context: EvaluationContext): Promise<any[]> {
    const alerts: any[] = [];
    const stateChangeThreshold = rule.conditions.stateChangeThreshold || 3;
    const periodMinutes = rule.conditions.periodMinutes || 10;

    for (const peer of context.peers) {
      const stateChanges = this.countStateChangesInPeriod(peer, periodMinutes);

      if (stateChanges >= stateChangeThreshold) {
        const title = `Peer ${peer.name} is flapping`;
        const description = `Peer ${peer.name} (${peer.ip}) has changed state ${stateChanges} times in the last ${periodMinutes} minutes, indicating an unstable network connection. Current status: ${peer.status}. Location: ${peer.locationCity || 'Unknown'}, ${peer.locationCountry || 'Unknown'}`;

        const alert = await this.createAlert(
          rule,
          {
            peerId: peer.id,
            peerName: peer.name,
            peerIp: peer.ip,
            currentState: peer.status,
            stateChangeCount: stateChanges,
            periodMinutes,
            locationCountry: peer.locationCountry,
            locationCity: peer.locationCity,
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

  protected countStateChangesInPeriod(peer: any, periodMinutes: number): number {
    if (!peer.meta?.stateHistory || !Array.isArray(peer.meta.stateHistory)) {
      return 0;
    }

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - periodMinutes);

    const recentChanges = peer.meta.stateHistory
      .filter((entry: any) => {
        const entryTime = new Date(entry.timestamp);
        return entryTime >= cutoffTime;
      })
      .map((entry: any) => entry.status)
      .filter((status: string, index: number, arr: string[]) => {
        return index === 0 || status !== arr[index - 1];
      });

    return Math.max(0, recentChanges.length - 1);
  }
}