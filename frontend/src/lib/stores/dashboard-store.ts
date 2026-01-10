import { create } from 'zustand';
import { NetworkMetrics, TimeRange, ActivityEvent } from '@/types/dashboard.types';

interface DashboardStore {
  metrics: NetworkMetrics | null;
  timeRange: TimeRange;
  autoRefresh: boolean;
  activities: ActivityEvent[];
  isLoading: boolean;
  error: string | null;

  setMetrics: (metrics: NetworkMetrics) => void;
  setTimeRange: (range: TimeRange) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setActivities: (activities: ActivityEvent[]) => void;
  addActivity: (activity: ActivityEvent) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  metrics: null,
  timeRange: '24h',
  autoRefresh: true,
  activities: [],
  isLoading: false,
  error: null,

  setMetrics: (metrics) => set({ metrics }),
  setTimeRange: (timeRange) => set({ timeRange }),
  setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) => set((state) => ({ activities: [activity, ...state.activities].slice(0, 100) })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
