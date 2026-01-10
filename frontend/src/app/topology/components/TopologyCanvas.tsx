import React, { useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useTopologyStore } from '../store';
import { PeerNode, RouterNode } from './CustomNodes';
import { ConnectionEdge } from './CustomEdges';
import { TopologyControls } from './TopologyControls';
import { TopologyNode } from '../types';

const nodeTypes: NodeTypes = {
  peer: PeerNode,
  router: RouterNode,
};

const edgeTypes: EdgeTypes = {
  default: ConnectionEdge,
};

function TopologyCanvasContent() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    setSelectedNode,
    updateLayout 
  } = useTopologyStore();

  useEffect(() => {
    updateLayout();
  }, [updateLayout]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: TopologyNode) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="w-full h-[800px] border rounded-lg bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        attributionPosition="bottom-right"
        className="bg-background"
      >
        <Background gap={16} size={1} />
        <TopologyControls />
        <MiniMap 
          className="!bottom-4 !right-4 rounded-lg overflow-hidden border shadow-lg"
          nodeColor={(n) => {
            if (n.type === 'router') return 'hsl(var(--primary))';
            if (n.type === 'peer') return 'hsl(var(--muted-foreground))';
            return '#eee';
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function TopologyCanvas() {
  return (
    <ReactFlowProvider>
      <TopologyCanvasContent />
    </ReactFlowProvider>
  );
}
