import { create } from 'zustand';
import { 
  EdgeChange, 
  NodeChange, 
  applyNodeChanges, 
  applyEdgeChanges,
  Position
} from 'reactflow';
import { TopologyState, TopologyNode, TopologyEdge } from './types';
import dagre from 'dagre';

const getLayoutedElements = (nodes: TopologyNode[], edges: TopologyEdge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - 180 / 2,
      y: nodeWithPosition.y - 100 / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};

export const useTopologyStore = create<TopologyState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  layout: 'dagre',

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  setLayout: (layout) => {
    set({ layout });
    get().updateLayout();
  },

  updateLayout: () => {
    const { nodes, edges, layout } = get();
    if (layout === 'dagre') {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        [...nodes],
        [...edges]
      );
      set({ nodes: layoutedNodes, edges: layoutedEdges });
    }
  },
}));
