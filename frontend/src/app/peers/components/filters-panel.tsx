import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PeerFilters } from '../types/peers.types';
import { Search, Filter, RefreshCw, Download, Plus } from 'lucide-react';

interface FiltersPanelProps {
  filters: PeerFilters;
  onFilterChange: (filters: PeerFilters) => void;
  onRefresh: () => void;
  onExport: () => void;
  onAddPeer: () => void;
}

export function FiltersPanel({
  filters,
  onFilterChange,
  onRefresh,
  onExport,
  onAddPeer,
}: FiltersPanelProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 bg-card border rounded-lg shadow-sm">
      <div className="flex flex-1 items-center gap-2 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, IP, or tag..."
            className="pl-9"
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ ...filters, status: e.target.value as any })
            }
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="error">Error</option>
          </select>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hidden sm:block"
            value={filters.location}
            onChange={(e) =>
              onFilterChange({ ...filters, location: e.target.value })
            }
          >
            <option value="all">All Locations</option>
            <option value="Germany">Germany</option>
            <option value="United States">United States</option>
            <option value="Singapore">Singapore</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onExport} title="Export">
          <Download className="h-4 w-4" />
        </Button>
        <Button onClick={onAddPeer}>
          <Plus className="mr-2 h-4 w-4" />
          Add Peer
        </Button>
      </div>
    </div>
  );
}
