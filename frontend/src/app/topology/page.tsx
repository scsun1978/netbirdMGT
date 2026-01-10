'use client';

import React from 'react';
import { Layout } from '@/components/layout/layout';
import { TopologyCanvas } from './components/TopologyCanvas';
import { NodeDetails } from './components/NodeDetails';
import { useTopologyData } from './hooks/useTopologyData';
import { Loader2 } from 'lucide-react';

export default function TopologyPage() {
  const { loading } = useTopologyData();

  return (
    <Layout>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex-none">
          <h1 className="text-3xl font-bold">Network Topology</h1>
          <p className="text-muted-foreground">
            Visualize your NetBird network connections and infrastructure
          </p>
        </div>

        <div className="flex-1 relative min-h-[600px] border rounded-lg bg-card shadow-sm overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading topology...</p>
              </div>
            </div>
          ) : null}
          
          <TopologyCanvas />
          <NodeDetails />
        </div>
      </div>
    </Layout>
  );
}
