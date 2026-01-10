'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { usePeers } from './hooks/use-peers';
import { usePeersStore } from './stores/use-peers-store';
import { PeersTable } from './components/peers-table';
import { FiltersPanel } from './components/filters-panel';
import { PeerDetails } from './components/peer-details';
import { Peer } from './types/peers.types';
import { Activity, Server, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PeersPage() {
  const {
    filters,
    pagination,
    selectedPeers,
    realtimeUpdates,
    setFilters,
    setSelectedPeers,
    setPagination,
    updatePeer
  } = usePeersStore();

  const { data, isLoading, refetch } = usePeers();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPeerForDetails, setSelectedPeerForDetails] = useState<Peer | null>(null);

  useEffect(() => {
    if (!realtimeUpdates || !data?.data) return;

    const interval = setInterval(() => {
      const randomPeerIndex = Math.floor(Math.random() * data.data.length);
      const peer = data.data[randomPeerIndex];
      
      if (peer) {
        if (Math.random() > 0.7) {
            const newLatency = Math.max(5, Math.min(200, (peer.metrics?.latency || 20) + (Math.random() * 20 - 10)));
             updatePeer(peer.id, {
                metrics: {
                    ...peer.metrics!,
                    latency: Math.floor(newLatency),
                    lastUpdated: new Date().toISOString()
                }
             });
        }
        
        if (Math.random() > 0.95) {
            const newStatus = peer.status === 'online' ? 'offline' : 'online';
            updatePeer(peer.id, { 
                status: newStatus,
                lastSeen: new Date().toISOString()
            });
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [realtimeUpdates, data, updatePeer]);


  const handleViewDetails = (peer: Peer) => {
    setSelectedPeerForDetails(peer);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setTimeout(() => setSelectedPeerForDetails(null), 300);
  };

  const stats = {
    total: data?.total || 0,
    online: data?.data?.filter(p => p.status === 'online').length || 0,
    offline: data?.data?.filter(p => p.status === 'offline').length || 0,
    alerts: data?.data?.filter(p => p.status === 'error' || p.alerts.length > 0).length || 0,
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-foreground font-medium">Peers</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Peers Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your network peers in real-time.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Peers</h3>
              <Server className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Online Now</h3>
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.online}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              +2 since last hour
            </div>
          </div>
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Offline</h3>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.offline}</div>
          </div>
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Active Alerts</h3>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.alerts}
            </div>
             <div className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
              Action required
            </div>
          </div>
        </div>

        <FiltersPanel 
            filters={filters} 
            onFilterChange={setFilters} 
            onRefresh={() => refetch()}
            onExport={() => alert('Export functionality simulated')}
            onAddPeer={() => alert('Add peer modal simulated')}
        />

        <PeersTable 
            peers={data?.data || []}
            loading={isLoading}
            selectedPeers={selectedPeers}
            onSelectPeer={(id) => {
                if (selectedPeers.includes(id)) {
                    setSelectedPeers(selectedPeers.filter(p => p !== id));
                } else {
                    setSelectedPeers([...selectedPeers, id]);
                }
            }}
            onSelectAll={(checked) => {
                if (checked && data?.data) {
                    setSelectedPeers(data.data.map(p => p.id));
                } else {
                    setSelectedPeers([]);
                }
            }}
            onViewDetails={handleViewDetails}
            onAction={(action, peer) => {
                if (action === 'menu') {
                    handleViewDetails(peer);
                }
            }}
        />
        
        <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
                Showing {data?.data?.length || 0} of {data?.total || 0} peers
            </div>
            <div className="flex gap-2">
                <button 
                    className="px-3 py-1 border rounded text-sm hover:bg-accent disabled:opacity-50"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                >
                    Previous
                </button>
                <button 
                    className="px-3 py-1 border rounded text-sm hover:bg-accent disabled:opacity-50"
                    disabled={true} 
                >
                    Next
                </button>
            </div>
        </div>

        <PeerDetails 
            peer={selectedPeerForDetails} 
            isOpen={detailsOpen} 
            onClose={handleCloseDetails} 
        />
      </div>
    </Layout>
  );
}
