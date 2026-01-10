import { create } from 'zustand';
import { Peer, PeerFilters, PaginationState } from '../types/peers.types';

interface PeersStore {
  peers: Peer[];
  selectedPeers: string[];
  filters: PeerFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  realtimeUpdates: boolean;

  setPeers: (peers: Peer[]) => void;
  updatePeer: (peerId: string, updates: Partial<Peer>) => void;
  addPeer: (peer: Peer) => void;
  removePeer: (peerId: string) => void;
  setSelectedPeers: (peerIds: string[]) => void;
  setFilters: (filters: PeerFilters) => void;
  setPagination: (pagination: PaginationState) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleRealtimeUpdates: () => void;
}

export const usePeersStore = create<PeersStore>((set) => ({
  peers: [],
  selectedPeers: [],
  filters: {
    search: '',
    status: 'all',
    location: 'all',
    groupId: 'all',
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  loading: false,
  error: null,
  realtimeUpdates: true,

  setPeers: (peers) => set({ peers }),
  updatePeer: (peerId, updates) =>
    set((state) => ({
      peers: state.peers.map((peer) =>
        peer.id === peerId ? { ...peer, ...updates } : peer
      ),
    })),
  addPeer: (peer) => set((state) => ({ peers: [peer, ...state.peers] })),
  removePeer: (peerId) =>
    set((state) => ({
      peers: state.peers.filter((peer) => peer.id !== peerId),
    })),
  setSelectedPeers: (selectedPeers) => set({ selectedPeers }),
  setFilters: (filters) => set({ filters }),
  setPagination: (pagination) => set({ pagination }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  toggleRealtimeUpdates: () =>
    set((state) => ({ realtimeUpdates: !state.realtimeUpdates })),
}));
