import React from 'react';
import { cn } from '@/lib/utils';
import { PeerStatus } from '../types/peers.types';

interface StatusIndicatorProps {
  status: PeerStatus;
  lastSeen?: string;
  showText?: boolean;
  className?: string;
  pulse?: boolean;
}

export function StatusIndicator({
  status,
  lastSeen,
  showText = true,
  className,
  pulse = true,
}: StatusIndicatorProps) {
  const getStatusColor = (status: PeerStatus) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'offline':
        return 'bg-slate-400 dark:bg-slate-600';
      case 'error':
        return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      default:
        return 'bg-slate-400';
    }
  };

  const getStatusText = (status: PeerStatus) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Issue Detected';
      default:
        return status;
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex h-2.5 w-2.5">
        {pulse && status === 'online' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5 transition-colors duration-300',
            getStatusColor(status)
          )}
        ></span>
      </div>
      {showText && (
        <span className="text-sm font-medium text-foreground">
          {getStatusText(status)}
        </span>
      )}
    </div>
  );
}
