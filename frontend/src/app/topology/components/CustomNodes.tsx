import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Laptop, Server, Globe, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopologyNodeData } from '../types';

const StatusIcon = ({ status }: { status?: string }) => {
  switch (status) {
    case 'online':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'offline':
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Activity className="w-4 h-4 text-blue-500" />;
  }
};

const OSIcon = ({ os }: { os?: string }) => {
  if (!os) return <Laptop className="w-4 h-4" />;
  const lower = os.toLowerCase();
  if (lower.includes('linux')) return <Server className="w-4 h-4" />;
  if (lower.includes('darwin') || lower.includes('mac')) return <Laptop className="w-4 h-4" />;
  if (lower.includes('windows')) return <Laptop className="w-4 h-4" />;
  return <Laptop className="w-4 h-4" />;
};

export const PeerNode = memo(({ data, selected }: NodeProps<TopologyNodeData>) => {
  return (
    <div
      className={cn(
        "px-4 py-3 shadow-md rounded-md bg-card border min-w-[180px] transition-all duration-200",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border",
        data.status === 'offline' && "opacity-75"
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full bg-muted",
          data.status === 'online' && "bg-green-100 dark:bg-green-900/20",
          data.status === 'error' && "bg-red-100 dark:bg-red-900/20"
        )}>
          <OSIcon os={data.os} />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm truncate" title={data.label}>
              {data.label}
            </h3>
            <StatusIcon status={data.status} />
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {data.ip || 'No IP'}
          </div>
        </div>
      </div>

      {data.groupName && (
        <div className="mt-2 pt-2 border-t border-border flex items-center gap-1">
          <Globe className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground truncate">
            {data.groupName}
          </span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </div>
  );
});

PeerNode.displayName = 'PeerNode';

export const RouterNode = memo(({ data, selected }: NodeProps<TopologyNodeData>) => {
  return (
    <div
      className={cn(
        "w-12 h-12 rotate-45 flex items-center justify-center shadow-md bg-primary text-primary-foreground border-2 border-primary transition-all",
        selected && "ring-4 ring-primary/20 scale-110",
      )}
    >
      <div className="-rotate-45">
        <Globe className="w-6 h-6" />
      </div>
      
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
      
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 text-center -rotate-45 pointer-events-none">
        <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-sm border truncate">
          {data.label}
        </div>
      </div>
    </div>
  );
});

RouterNode.displayName = 'RouterNode';
