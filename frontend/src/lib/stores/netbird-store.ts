import { create } from 'zustand';

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

interface NetBirdState {
  peers: Peer[];
  networks: Network[];
  isLoading: boolean;
  lastUpdated: Date | null;
  setPeers: (peers: Peer[]) => void;
  setNetworks: (networks: Network[]) => void;
  setLoading: (loading: boolean) => void;
  updatePeerStatus: (peerId: string, status: 'online' | 'offline') => void;
}

export const useNetBirdStore = create<NetBirdState>(set => ({
  peers: [],
  networks: [],
  isLoading: false,
  lastUpdated: null,
  setPeers: peers => set({ peers, lastUpdated: new Date() }),
  setNetworks: networks => set({ networks }),
  setLoading: isLoading => set({ isLoading }),
  updatePeerStatus: (peerId, status) =>
    set(state => ({
      peers: state.peers.map(peer =>
        peer.id === peerId ? { ...peer, status } : peer
      ),
    })),
}));
