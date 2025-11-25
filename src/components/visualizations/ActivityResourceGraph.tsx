import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ActivityNode } from './nodes/ActivityNode';
import { ResourceNode } from './nodes/ResourceNode';
import { CustomEdge } from './edges/CustomEdge';

interface ActivityResourceNode {
  id: string;
  label: string;
  type: 'activity' | 'resource';
  group: string;
  count?: number;
  duration?: number;
  status?: string;
}

interface ActivityResourceLink {
  source: string;
  target: string;
  efficiency?: number;
  volume?: number;
}

interface ActivityResourceGraphProps {
  nodes: ActivityResourceNode[];
  links: ActivityResourceLink[];
  width?: number;
}

const nodeTypes = {
  activity: ActivityNode,
  resource: ResourceNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export const ActivityResourceGraph = ({
  nodes: inputNodes,
  links: inputLinks,
}: ActivityResourceGraphProps) => {
  // Transform data to React Flow format
  const { nodes, edges } = useMemo(() => {
    const activityNodes = inputNodes.filter(n => n.type === 'activity');
    const resourceNodes = inputNodes.filter(n => n.type === 'resource');

    // Position nodes in clean columns
    const leftX = 100;
    const rightX = 800;
    const verticalSpacing = 180;

    const flowNodes: Node[] = [
      ...activityNodes.map((node, i) => ({
        id: node.id,
        type: 'activity',
        position: { x: leftX, y: 100 + i * verticalSpacing },
        data: {
          label: node.label,
          count: node.count,
          duration: node.duration,
          status: node.status,
        },
      })),
      ...resourceNodes.map((node, i) => ({
        id: node.id,
        type: 'resource',
        position: { x: rightX, y: 100 + i * verticalSpacing },
        data: {
          label: node.label,
          count: node.count,
          duration: node.duration,
          status: node.status,
        },
      })),
    ];

    const flowEdges: Edge[] = inputLinks.map((link, i) => ({
      id: `edge-${i}`,
      source: link.source,
      target: link.target,
      type: 'custom',
      animated: false,
      style: {
        stroke: '#D1D5DB',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: '#D1D5DB',
      },
      data: {
        volume: link.volume,
        efficiency: link.efficiency,
      },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [inputNodes, inputLinks]);

  const [reactFlowNodes, , onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, , onEdgesChange] = useEdgesState(edges);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#FAFAFA', position: 'relative' }}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.2}
        maxZoom={2.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
        className="react-flow-custom"
      >
        <Background 
          color="#E5E7EB" 
          gap={24} 
          size={1}
          style={{ backgroundColor: '#FAFAFA' }}
        />
        <MiniMap
          nodeColor={(node) => {
            return node.type === 'activity' ? '#3B82F6' : '#8B5CF6';
          }}
          className="!bg-white !border !border-gray-200 !rounded-xl !shadow-sm"
          maskColor="rgba(0, 0, 0, 0.05)"
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
