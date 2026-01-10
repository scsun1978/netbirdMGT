import { Node, Edge } from 'reactflow';

export type NodeType = 'peer' | 'router' | 'group' | 'resource';

export interface TopologyNodeData {
  label: string;
  status?: 'online' | 'offline' | 'error';
  ip?: string;
  os?: string;
  version?: string;
  groupName?: string;
  peerId?: string;
  groupId?: string;
  type: NodeType;
  connectionCount?: number;
}

export type TopologyNode = Node<TopologyNodeData>;
export type TopologyEdge = Edge;

export type LayoutAlgorithm = 'force' | 'dagre' | 'grid' | 'circle';

export interface TopologyState {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  selectedNode: TopologyNode | null;
  layout: LayoutAlgorithm;
  
  setNodes: (nodes: TopologyNode[]) => void;
  setEdges: (edges: TopologyEdge[]) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  setSelectedNode: (node: TopologyNode | null) => void;
  setLayout: (layout: LayoutAlgorithm) => void;
  updateLayout: () => void;
}
