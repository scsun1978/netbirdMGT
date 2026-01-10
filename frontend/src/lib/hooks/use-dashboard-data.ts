import { useEffect } from 'react';
import { useDashboardStore } from '@/lib/stores/dashboard-store';
import { NetworkMetrics, ActivityEvent } from '@/types/dashboard.types';

const MOCK_METRICS: NetworkMetrics = {
  totalPeers: 142,
  onlinePeers: 118,
  offlinePeers: 24,
  networkUptime: 99.98,
  avgLatency: 45,
  totalBandwidth: 1250,
  alertCounts: {
    critical: 2,
    high: 5,
    medium: 12,
    low: 8,
  },
};

const MOCK_ACTIVITIES: ActivityEvent[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    type: 'peer_join',
    title: 'New Peer Joined',
    description: 'host-worker-01 connected from Frankfurt',
    severity: 'low',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    type: 'alert_triggered',
    title: 'High Latency Detected',
    description: 'Latency > 200ms on us-east-1-gateway',
    severity: 'high',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: 'system_event',
    title: 'Backup Completed',
    description: 'Daily database backup finished successfully',
    severity: 'low',
  },
];

export function useDashboardData() {
  const { 
    setMetrics, 
    setActivities, 
    setLoading, 
    autoRefresh 
  } = useDashboardStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setMetrics(MOCK_METRICS);
        setActivities(MOCK_ACTIVITIES);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, setMetrics, setActivities, setLoading]);
}
