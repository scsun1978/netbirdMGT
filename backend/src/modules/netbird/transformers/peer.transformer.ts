import { NetBirdPeer, PlatformPeer } from '../interfaces/netbird.interface';

export class PeerTransformer {
  static toPlatformPeer(netbirdPeer: NetBirdPeer): PlatformPeer {
    return {
      ...netbirdPeer,
      ipAddress: netbirdPeer.ip,
      connectionIp: netbirdPeer.connection_ip,
      operatingSystem: netbirdPeer.os,
      lastSeen: new Date(netbirdPeer.last_seen),
      connectionStatus: this.mapConnectionStatus(netbirdPeer.status),
      locationDisplay: this.formatLocation(netbirdPeer.location),
      groupsExpanded: [],
    };
  }

  static toPlatformPeers(netbirdPeers: NetBirdPeer[]): PlatformPeer[] {
    return netbirdPeers.map(peer => this.toPlatformPeer(peer));
  }

  private static mapConnectionStatus(status: string): 'online' | 'offline' | 'expired' {
    switch (status) {
      case 'connected':
        return 'online';
      case 'disconnected':
        return 'offline';
      default:
        return 'offline';
    }
  }

  private static formatLocation(location?: any): string | undefined {
    if (!location || !location.city || !location.country) {
      return undefined;
    }
    return `${location.city}, ${location.country}`;
  }
}