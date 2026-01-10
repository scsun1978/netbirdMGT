'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useNetBirdStore } from '@/lib/stores/netbird-store';

interface Peer {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  location?: string;
  groups: string[];
}

interface Network {
  id: string;
  name: string;
  description?: string;
  peers: string[];
}

export function useNetBird() {
  const { setPeers, setNetworks, updatePeerStatus, setLoading } =
    useNetBirdStore();
  const queryClient = useQueryClient();

  const {
    data: peers = [],
    isLoading: peersLoading,
    error: peersError,
  } = useQuery({
    queryKey: ['netbird-peers'],
    queryFn: () => apiClient.get<Peer[]>('/netbird/peers'),
    refetchInterval: 30000,
  });

  const {
    data: networks = [],
    isLoading: networksLoading,
    error: networksError,
  } = useQuery({
    queryKey: ['netbird-networks'],
    queryFn: () => apiClient.get<Network[]>('/netbird/networks'),
    refetchInterval: 60000,
  });

  const isLoading = peersLoading || networksLoading;

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    setPeers(peers);
  }, [peers, setPeers]);

  useEffect(() => {
    setNetworks(networks);
  }, [networks, setNetworks]);

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['netbird-peers'] });
    queryClient.invalidateQueries({ queryKey: ['netbird-networks'] });
  };

  return {
    peers,
    networks,
    isLoading,
    peersError,
    networksError,
    updatePeerStatus,
    invalidateQueries,
  };
}
