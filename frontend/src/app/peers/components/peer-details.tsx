import React from 'react';
import { Peer } from '../types/peers.types';
import { StatusIndicator } from './status-indicator';
import { Button } from '@/components/ui/button';
import {
  X,
  Server,
  Cpu,
  HardDrive,
  Activity,
  Globe,
  Shield,
  Terminal,
  Clock,
  MapPin,
  AlertTriangle,
  Wifi,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PeerDetailsProps {
  peer: Peer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PeerDetails({ peer, isOpen, onClose }: PeerDetailsProps) {
  if (!peer) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-card border-l shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-foreground">{peer.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">{peer.ip}</span>
              <span>•</span>
              <StatusIndicator status={peer.status} showText={true} pulse={false} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wifi className="h-4 w-4" />
                <span>Latency</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {peer.metrics?.latency || '-'} ms
              </div>
              <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${Math.min(100, (100 - (peer.metrics?.latency || 0)))}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Uptime</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {Math.floor(peer.system.uptime / 3600)}h
              </div>
              <div className="text-xs text-muted-foreground">
                Since {new Date(Date.now() - peer.system.uptime * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              System Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 rounded-md border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">OS & Version</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {peer.system.os} {peer.system.osVersion}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-md border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">CPU & Memory</div>
                    <div className="text-sm text-muted-foreground">
                      {peer.system.cpu} • {peer.system.memory}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Disk Usage</div>
                    <div className="text-sm text-muted-foreground">
                      {peer.system.disk}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Network Details
            </h3>
            <div className="rounded-lg border divide-y">
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Public IP</span>
                </div>
                <span className="font-mono text-sm">{peer.connectionIp}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Firewall</span>
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  peer.network.firewall ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700"
                )}>
                  {peer.network.firewall ? "Active" : "Disabled"}
                </span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                  <span>SSH Access</span>
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  peer.network.sshEnabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-700"
                )}>
                  {peer.network.sshEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Location
            </h3>
            <div className="relative h-32 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border">
              <div className="absolute inset-0 opacity-20">
                 <div className="w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>
              <div className="z-10 flex flex-col items-center gap-1">
                <MapPin className="h-6 w-6 text-primary animate-bounce" />
                <span className="text-sm font-medium">{peer.location.city}, {peer.location.country}</span>
                <span className="text-xs text-muted-foreground">{peer.location.timezone}</span>
              </div>
            </div>
          </div>

          {peer.alerts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Active Alerts
              </h3>
              <div className="space-y-2">
                {peer.alerts.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-md bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-rose-700 dark:text-rose-400">
                        {alert.message}
                      </div>
                      <div className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-muted/30 flex gap-3">
          <Button variant="outline" className="flex-1">Restart</Button>
          <Button variant="destructive" className="flex-1">Delete</Button>
        </div>
      </div>
    </>
  );
}
