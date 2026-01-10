import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { peersApi } from '@/lib/api/peers';
import { usePeersStore } from '../stores/use-peers-store';
import { PeerFilters, PaginationState } from '../types/peers.types';
import { useEffect } from 'react';

export const usePeers = () => {
  const { 
    filters, 
    pagination, 
    setPeers, 
    setPagination, 
    setLoading,
    setError 
  } = usePeersStore();

  const query = useQuery({
    queryKey: ['peers', filters, pagination.page, pagination.pageSize],
    queryFn: async () => {
      setLoading(true);
      try {
        const result = await peersApi.getPeers(filters, pagination);
        setPeers(result.data);
        setPagination({ ...pagination, total: result.total });
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch peers');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return query;
};

export const usePeer = (peerId: string) => {
  return useQuery({
    queryKey: ['peer', peerId],
    queryFn: () => peersApi.getPeer(peerId),
    enabled: !!peerId,
  });
};

export const usePeerActions = () => {
  const queryClient = useQueryClient();

  const restartPeer = useMutation({
    mutationFn: peersApi.restartPeer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peers'] });
    },
  });

  const deletePeer = useMutation({
    mutationFn: peersApi.deletePeer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peers'] });
    },
  });

  return { restartPeer, deletePeer };
};
