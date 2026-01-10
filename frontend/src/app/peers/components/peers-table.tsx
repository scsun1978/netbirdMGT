import React from 'react';
import { Peer } from '../types/peers.types';
import { StatusIndicator } from './status-indicator';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Monitor,
  Globe,
  Clock,
  Server,
  ArrowUpDown,
  Laptop
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

interface PeersTableProps {
  peers: Peer[];
  loading: boolean;
  selectedPeers: string[];
  onSelectPeer: (peerId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onViewDetails: (peer: Peer) => void;
  onAction: (action: string, peer: Peer) => void;
}

export function PeersTable({
  peers,
  loading,
  selectedPeers,
  onSelectPeer,
  onSelectAll,
  onViewDetails,
  onAction,
}: PeersTableProps) {
  const allSelected = peers.length > 0 && selectedPeers.length === peers.length;

  if (loading && peers.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-muted-foreground">
        Loading peers...
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="h-12 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="h-12 px-4 cursor-pointer hover:text-foreground transition-colors">
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="h-12 px-4">Address</th>
              <th className="h-12 px-4">Status</th>
              <th className="h-12 px-4">Last Seen</th>
              <th className="h-12 px-4">System</th>
              <th className="h-12 px-4 hidden md:table-cell">Version</th>
              <th className="h-12 px-4 hidden lg:table-cell">Tags</th>
              <th className="h-12 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {peers.map((peer) => (
              <tr
                key={peer.id}
                className={cn(
                  "group hover:bg-muted/30 transition-colors cursor-pointer",
                  selectedPeers.includes(peer.id) && "bg-muted/50"
                )}
                onClick={() => onViewDetails(peer)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    checked={selectedPeers.includes(peer.id)}
                    onChange={() => onSelectPeer(peer.id)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{peer.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{peer.ip}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[120px]">
                      {peer.connectionIp}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <StatusIndicator status={peer.status} />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTimeAgo(peer.lastSeen)}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {peer.system.os === 'linux' && <Server className="h-4 w-4 text-slate-500" />}
                    {peer.system.os === 'darwin' && <Laptop className="h-4 w-4 text-slate-500" />}
                    {peer.system.os === 'windows' && <Monitor className="h-4 w-4 text-blue-500" />}
                    <span className="capitalize text-muted-foreground">{peer.system.os}</span>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    v{peer.version}
                  </span>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {peer.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {peer.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">+{peer.tags.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onAction('menu', peer)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {peers.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">
                  No peers found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
