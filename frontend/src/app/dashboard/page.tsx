"use client";

import React, { useMemo } from 'react';
import { Layout } from '@/components/layout/layout';
import { useDashboardData } from '@/lib/hooks/use-dashboard-data';
import { useDashboardStore } from '@/lib/stores/dashboard-store';
import { KPICard } from './components/kpi-cards/kpi-card';
import { ConnectionTimeline } from './components/charts/connection-timeline';
import { GeoDistribution } from './components/charts/geo-distribution';
import { AlertTrends } from './components/charts/alert-trends';
import { SystemMetrics } from './components/charts/system-metrics';
import { ActivityTimeline } from './components/activity-feed/activity-timeline';
import { SystemHealth } from './components/health-panel/system-health';
import { TimeRangeSelector } from './components/layout/time-range-selector';
import { Activity, Users, Globe, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  useDashboardData();
  
  const { metrics, activities, timeRange, setTimeRange, isLoading, autoRefresh, setAutoRefresh } = useDashboardStore();

  const connectionData = useMemo(() => {
    const data = [];
    const now = new Date();
    const points = 24;
    for (let i = points; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: t.toISOString(),
        online: 100 + Math.floor(Math.random() * 50),
        total: 160 + Math.floor(Math.random() * 10),
      });
    }
    return data;
  }, []);

  const geoData = useMemo(() => [
    { country: 'United States', count: 45 },
    { country: 'Germany', count: 32 },
    { country: 'United Kingdom', count: 28 },
    { country: 'Brazil', count: 15 },
    { country: 'Japan', count: 12 },
    { country: 'Australia', count: 8 },
  ], []);

  const alertData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        timestamp: t.toISOString(),
        critical: Math.floor(Math.random() * 3),
        high: Math.floor(Math.random() * 5),
        medium: Math.floor(Math.random() * 8),
        low: Math.floor(Math.random() * 10),
      });
    }
    return data;
  }, []);

  const systemMetrics = {
    cpu: 45,
    memory: 62,
    disk: 28
  };

  const displayMetrics = metrics || {
    totalPeers: 0,
    onlinePeers: 0,
    offlinePeers: 0,
    networkUptime: 0,
    avgLatency: 0,
    totalBandwidth: 0,
    alertCounts: { critical: 0, high: 0, medium: 0, low: 0 }
  };

  const activeAlerts = displayMetrics.alertCounts.critical + displayMetrics.alertCounts.high + displayMetrics.alertCounts.medium + displayMetrics.alertCounts.low;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">NetBird Dashboard</h1>
            <p className="text-muted-foreground">Network overview and real-time insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground hidden md:inline">Auto-refresh</span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "text-primary border-primary" : ""}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Peers"
            value={displayMetrics.totalPeers}
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 12, direction: 'up', label: "vs last month" }}
          />
          <KPICard
            title="Online Peers"
            value={`${displayMetrics.onlinePeers}`}
            icon={<Globe className="h-4 w-4" />}
            trend={{ value: 4, direction: 'up', label: "vs last hour" }}
          />
          <KPICard
            title="Active Alerts"
            value={activeAlerts}
            icon={<AlertCircle className="h-4 w-4" />}
            trend={{ value: 2, direction: 'down', label: "vs yesterday" }}
            className={activeAlerts > 10 ? "border-red-500/50" : ""}
          />
          <KPICard
            title="Network Health"
            value={`${displayMetrics.networkUptime}%`}
            icon={<Activity className="h-4 w-4" />}
            trend={{ value: 0.02, direction: 'up', label: "uptime" }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ConnectionTimeline data={connectionData} />
          <AlertTrends data={alertData} />
          <GeoDistribution data={geoData} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ActivityTimeline activities={activities} />
          <SystemHealth />
          <SystemMetrics metrics={systemMetrics} />
        </div>
      </div>
    </Layout>
  );
}
