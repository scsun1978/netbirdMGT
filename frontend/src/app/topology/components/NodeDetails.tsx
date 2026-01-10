import React from 'react';
import { X, Server, Activity, Calendar, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTopologyStore } from '../store';
import { cn } from '@/lib/utils';

export function NodeDetails() {
  const { selectedNode, setSelectedNode } = useTopologyStore();

  if (!selectedNode) return null;

  const { data } = selectedNode;

  return (
    <div className={cn(
      "absolute top-4 right-4 bottom-4 w-80 bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl z-20 flex flex-col transition-all duration-300",
      selectedNode ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          {data.type === 'router' ? <Globe className="w-5 h-5" /> : <Server className="w-5 h-5" />}
          {data.label}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</h3>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full",
                data.status === 'online' ? "bg-green-500" : 
                data.status === 'error' ? "bg-red-500" : "bg-gray-400"
              )} />
              <span className="capitalize font-medium">{data.status || 'Unknown'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Information</h3>
            
            <div className="grid grid-cols-[24px_1fr] gap-y-3">
              <Activity className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">IP Address</div>
                <div className="font-mono text-sm">{data.ip || 'N/A'}</div>
              </div>

              <Server className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">OS / Version</div>
                <div className="text-sm">{data.os} {data.version && `(${data.version})`}</div>
              </div>

              {data.groupName && (
                <>
                  <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Group</div>
                    <div className="text-sm">{data.groupName}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {data.type === 'router' && (
             <div className="p-3 bg-muted rounded-md text-sm">
               This node acts as a router for the network, managing traffic between {data.connectionCount || 0} peers.
             </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t bg-muted/20">
        <Button className="w-full" variant="outline" onClick={() => {}}>
          View Full Details
        </Button>
      </div>
    </div>
  );
}
