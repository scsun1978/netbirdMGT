import { useEffect, useState } from 'react';
import { useTopologyStore } from '../store';
import { TopologyNode, TopologyEdge } from '../types';

const MOCK_PEERS = [
  { id: '1', name: 'Workstation-01', ip: '10.0.0.1', status: 'online', os: 'Linux', group: 'Developers' },
  { id: '2', name: 'Laptop-MBP', ip: '10.0.0.2', status: 'online', os: 'Darwin', group: 'Developers' },
  { id: '3', name: 'DB-Server', ip: '10.0.0.3', status: 'online', os: 'Linux', group: 'Production' },
  { id: '4', name: 'API-Gateway', ip: '10.0.0.4', status: 'online', os: 'Linux', group: 'Production' },
  { id: '5', name: 'Legacy-Win', ip: '10.0.0.5', status: 'offline', os: 'Windows', group: 'Legacy' },
];

export function useTopologyData() {
  const { setNodes, setEdges, updateLayout } = useTopologyStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      const nodes: TopologyNode[] = [];
      const edges: TopologyEdge[] = [];

      const groups = Array.from(new Set(MOCK_PEERS.map(p => p.group)));
      
      groups.forEach((group, idx) => {
        const routerId = `router-${group}`;
        nodes.push({
          id: routerId,
          type: 'router',
          position: { x: 0, y: 0 },
          data: {
            label: `${group} Network`,
            type: 'router',
            status: 'online',
            connectionCount: MOCK_PEERS.filter(p => p.group === group).length
          }
        });

        groups.slice(idx + 1).forEach(otherGroup => {
           edges.push({
             id: `edge-${routerId}-router-${otherGroup}`,
             source: routerId,
             target: `router-${otherGroup}`,
             type: 'default',
             animated: true,
             style: { strokeDasharray: '5,5' },
             label: 'VPN Tunnel'
           });
        });
      });

      MOCK_PEERS.forEach(peer => {
        const peerId = `peer-${peer.id}`;
        nodes.push({
          id: peerId,
          type: 'peer',
          position: { x: 0, y: 0 },
          data: {
            label: peer.name,
            ip: peer.ip,
            status: peer.status as any,
            os: peer.os,
            type: 'peer',
            groupName: peer.group
          }
        });

        edges.push({
          id: `edge-${peerId}-router-${peer.group}`,
          source: `router-${peer.group}`,
          target: peerId,
          type: 'default',
        });
      });

      setNodes(nodes);
      setEdges(edges);
      updateLayout();
      setLoading(false);
    };

    loadData();
  }, [setNodes, setEdges, updateLayout]);

  return { loading };
}
