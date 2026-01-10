import { Injectable } from '@nestjs/common';
import { BaseAlertEvaluator } from './base-alert.evaluator';
import { AlertRule } from '../../../entities/alert-rule.entity';
import { AlertStatus, AlertSourceType } from '../../../entities/alert.entity';
import { PeerStatus } from '../../../entities/nb-peer.entity';
import { EvaluationContext } from '../interfaces';

@Injectable()
export class NewPeerEvaluator extends BaseAlertEvaluator {
  getRuleType(): string {
    return 'new_peer';
  }

  async evaluate(rule: AlertRule, context: EvaluationContext): Promise<any[]> {
    const alerts: any[] = [];
    const thresholdMinutes = rule.conditions.thresholdMinutes || 60;
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - thresholdMinutes);

    const newPeers = context.peers.filter(peer => {
      const createdAt = new Date(peer.createdAt);
      return createdAt >= cutoffTime;
    });

    for (const peer of newPeers) {
      const title = `New peer detected: ${peer.name}`;
      const description = `New peer ${peer.name} (${peer.ip}) has joined the network. OS: ${peer.os || 'Unknown'}, Version: ${peer.version || 'Unknown'}. Location: ${peer.locationCity || 'Unknown'}, ${peer.locationCountry || 'Unknown'}. Status: ${peer.status}. This alert helps monitor for unauthorized access to your network.`;

      const alert = await this.createAlert(
        rule,
        {
          peerId: peer.id,
          peerName: peer.name,
          peerIp: peer.ip,
          os: peer.os,
          version: peer.version,
          status: peer.status,
          desktop: peer.desktop,
          sshEnabled: peer.sshEnabled,
          dnsEnabled: peer.dnsEnabled,
          firewallEnabled: peer.firewallEnabled,
          locationCountry: peer.locationCountry,
          locationCity: peer.locationCity,
          firstSeenAt: peer.firstSeenAt,
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
}