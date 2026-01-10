import React from 'react';
import { useReactFlow } from 'reactflow';
import { Maximize, Minus, Plus, RefreshCw, LayoutGrid, Network, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTopologyStore } from '../store';
import { LayoutAlgorithm } from '../types';

export function TopologyControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { layout, setLayout } = useTopologyStore();

  const handleLayoutChange = (newLayout: LayoutAlgorithm) => {
    setLayout(newLayout);
    setTimeout(() => fitView({ duration: 800 }), 100);
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
      <div className="flex flex-col gap-1 border-b pb-2 mb-1">
        <Button variant="ghost" size="icon" onClick={() => zoomIn()} title="Zoom In">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => zoomOut()} title="Zoom Out">
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => fitView()} title="Fit View">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative group">
         <Button variant="ghost" size="icon" title="Change Layout">
            <LayoutGrid className="h-4 w-4" />
         </Button>
         <div className="absolute left-full bottom-0 ml-2 p-1 bg-popover border rounded-md shadow-md hidden group-hover:flex flex-col gap-1 min-w-[140px] bg-background">
            <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs font-normal" 
                onClick={() => handleLayoutChange('dagre')}
            >
                <Network className="mr-2 h-3 w-3" />
                Hierarchical
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs font-normal opacity-50 cursor-not-allowed" 
                disabled
            >
                <RefreshCw className="mr-2 h-3 w-3" />
                Force Directed
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs font-normal opacity-50 cursor-not-allowed" 
                disabled
            >
                <Circle className="mr-2 h-3 w-3" />
                Circular
            </Button>
         </div>
      </div>
    </div>
  );
}
