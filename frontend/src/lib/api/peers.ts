import { apiClient } from './client';
import { Peer, PeerFilters, PaginationState } from '@/app/peers/types/peers.types';

const BASE_URL = '/peers';

export const peersApi = {
  getPeers: async (filters: PeerFilters, pagination: PaginationState) => {
    // In a real app, we would pass filters and pagination to the backend
    // const params = new URLSearchParams({
    //   page: pagination.page.toString(),
    //   limit: pagination.pageSize.toString(),
    //   ...filters
    // });
    // return apiClient.get<{ data: Peer[], total: number }>(`${BASE_URL}?${params}`);

    // MOCK DATA GENERATOR for UI Development
    // This ensures we have rich data to display even if the backend is empty/basic
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency

    const mockPeers: Peer[] = Array.from({ length: pagination.pageSize }).map((_, i) => {
      const id = `peer-${pagination.page}-${i}`;
      const status = Math.random() > 0.2 ? 'online' : (Math.random() > 0.5 ? 'offline' : 'error');
      
      return {
        id,
        name: `hostname-${Math.floor(Math.random() * 1000)}`,
        ip: `100.64.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        connectionIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
        status: status as 'online' | 'offline' | 'error',
        lastSeen: new Date(Date.now() - Math.random() * 86400000 * 10).toISOString(),
        connectedSince: status === 'online' ? new Date(Date.now() - Math.random() * 3600000).toISOString() : undefined,
        version: '0.28.4',
        groups: ['All', Math.random() > 0.5 ? 'DevOps' : 'Developers'],
        system: {
          os: Math.random() > 0.5 ? 'linux' : (Math.random() > 0.5 ? 'darwin' : 'windows'),
          osVersion: 'Ubuntu 22.04 LTS',
          hostname: `host-${id}`,
          cpu: '4 cores',
          memory: '16 GB',
          disk: '512 GB',
          uptime: Math.floor(Math.random() * 1000000),
        },
        network: {
          routes: ['10.0.0.0/24'],
          dns: ['8.8.8.8'],
          firewall: true,
          sshEnabled: true,
          interfaceIp: '100.64.0.1',
          macAddress: '00:11:22:33:44:55',
        },
        location: {
          country: 'Germany',
          city: 'Berlin',
          countryCode: 'DE',
          latitude: 52.52,
          longitude: 13.405,
          timezone: 'Europe/Berlin',
        },
        alerts: status === 'error' ? [{
          id: `alert-${id}`,
          type: 'error',
          message: 'Connection unstable',
          timestamp: new Date().toISOString(),
          active: true
        }] : [],
        metrics: status === 'online' ? {
          latency: Math.floor(Math.random() * 100),
          bandwidth: Math.floor(Math.random() * 1000),
          connectionQuality: Math.floor(Math.random() * 100),
          lastUpdated: new Date().toISOString()
        } : undefined,
        tags: ['production', 'server']
      };
    });

    return {
      data: mockPeers,
      total: 145, // Mock total
    };
  },

  getPeer: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return a single mock peer
    return {
      id,
      name: 'worker-node-01',
      ip: '100.64.0.1',
      connectionIp: '1.2.3.4',
      status: 'online',
      lastSeen: new Date().toISOString(),
      version: '0.28.4',
      groups: ['All', 'Production'],
      system: {
        os: 'linux',
        osVersion: 'Ubuntu 22.04',
        hostname: 'worker-node-01',
        cpu: '8 cores',
        memory: '32 GB',
        disk: '1 TB',
        uptime: 123456,
      },
      network: {
        routes: ['10.0.0.0/8'],
        dns: ['1.1.1.1'],
        firewall: true,
        sshEnabled: true,
        interfaceIp: '100.64.0.1',
        macAddress: 'AA:BB:CC:DD:EE:FF',
      },
      location: {
        country: 'United States',
        city: 'New York',
        countryCode: 'US',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      },
      alerts: [],
      metrics: {
        latency: 45,
        bandwidth: 500,
        connectionQuality: 98,
        lastUpdated: new Date().toISOString()
      },
      tags: ['prod']
    } as Peer;
  },

  restartPeer: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },

  deletePeer: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }
};
