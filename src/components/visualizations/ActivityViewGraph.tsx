import React, { useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SubprocessNode } from './nodes/SubprocessNode';
import { ResourceNode } from './nodes/ResourceNode';
import { useActivityViewGraph, useResourceViewGraph } from '../../hooks/useHierarchicalGraph';
import { mainProcesses, globalResources } from '../../data/hierarchicalProcessData';
import { Filter, X } from 'lucide-react';

const nodeTypes = {
  subprocessNode: SubprocessNode,
  resourceNode: ResourceNode,
};

const ActivityViewGraph: React.FC = () => {
  // Get all main process IDs and resource IDs for filters
  const processFilters = mainProcesses.map(p => p.id);
  const resourceFilters = globalResources.map(r => r.id);

  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([processFilters[0]]);
  const [selectedResources, setSelectedResources] = useState<string[]>([resourceFilters[0]]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'activity' | 'resource'>('activity');
  const [viewLevel, setViewLevel] = useState<'condensed' | 'medium' | 'full'>('condensed');
  const [layoutType, setLayoutType] = useState<'hierarchical' | 'network' | 'compact'>('hierarchical');
  const [edgeType, setEdgeType] = useState<'straight' | 'smoothstep' | 'bezier'>('straight');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Use the appropriate hook based on view mode
  const activityGraph = useActivityViewGraph(selectedProcesses, viewLevel, layoutType, edgeType);
  const resourceGraph = useResourceViewGraph(selectedResources, viewLevel, layoutType, edgeType);
  
  const graphData = viewMode === 'activity' ? activityGraph : resourceGraph;
  
  // Use React Flow state management for draggable nodes
  const [nodes, setNodes, onNodesChange] = useNodesState(graphData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges);

  // Update nodes and edges when graph data changes
  React.useEffect(() => {
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
  }, [graphData.nodes, graphData.edges, setNodes, setEdges]);

  // Get connected nodes for hover highlighting
  const getConnectedElements = React.useCallback((nodeId: string) => {
    const connectedNodes = new Set<string>([nodeId]);
    const connectedEdges = new Set<string>();

    edges.forEach((edge) => {
      if (edge.source === nodeId) {
        connectedNodes.add(edge.target);
        connectedEdges.add(edge.id);
      }
      if (edge.target === nodeId) {
        connectedNodes.add(edge.source);
        connectedEdges.add(edge.id);
      }
    });

    return { connectedNodes, connectedEdges };
  }, [edges]);

  // Apply hover styling to nodes and edges
  const styledNodes = React.useMemo(() => {
    if (!hoveredNode) return nodes;

    const { connectedNodes } = getConnectedElements(hoveredNode);

    return nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        opacity: connectedNodes.has(node.id) ? 1 : 0.2,
        transition: 'opacity 0.2s ease',
      },
    }));
  }, [nodes, hoveredNode, getConnectedElements]);

  const styledEdges = React.useMemo(() => {
    if (!hoveredNode) return edges;

    const { connectedEdges } = getConnectedElements(hoveredNode);

    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: connectedEdges.has(edge.id) ? 1 : 0.15,
        transition: 'opacity 0.2s ease',
      },
      animated: connectedEdges.has(edge.id) ? edge.animated : false,
    }));
  }, [edges, hoveredNode, getConnectedElements]);

  // Handle node hover events
  const onNodeMouseEnter = React.useCallback((_: React.MouseEvent, node: any) => {
    setHoveredNode(node.id);
  }, []);

  const onNodeMouseLeave = React.useCallback(() => {
    setHoveredNode(null);
  }, []);

  // Get current filters based on view mode
  const currentFilters = viewMode === 'activity' ? processFilters : resourceFilters;
  const selectedFilters = viewMode === 'activity' ? selectedProcesses : selectedResources;
  const setSelectedFilters = viewMode === 'activity' ? setSelectedProcesses : setSelectedResources;

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const getFilterLabel = (filterId: string) => {
    if (viewMode === 'activity') {
      return mainProcesses.find(p => p.id === filterId)?.name || filterId;
    } else {
      return globalResources.find(r => r.id === filterId)?.name || filterId;
    }
  };

  const handleViewLevelChange = (value: number) => {
    if (value <= 1) setViewLevel('condensed');
    else if (value <= 2) setViewLevel('medium');
    else setViewLevel('full');
  };

  const getSliderValue = () => {
    if (viewLevel === 'condensed') return 1;
    if (viewLevel === 'medium') return 2;
    return 3;
  };

  return (
    <div className="w-full h-full relative bg-gray-50">
      {/* Filter Toggle Button - Shows when panel is collapsed */}
      {!isFilterOpen && (
        <button
          onClick={() => setIsFilterOpen(true)}
          className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md border border-gray-200 p-3 hover:bg-gray-50 transition-all"
          title="Show Filters"
        >
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="absolute top-4 left-4 z-10 w-80">
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 overflow-hidden">
            {/* Header with count and close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50">
              <span className="text-sm font-medium text-gray-700">
                {selectedFilters.length} / {currentFilters.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedFilters(currentFilters)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setSelectedFilters([])}
                  className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                >
                  None
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 hover:bg-gray-100/50 rounded transition-all ml-2"
                  title="Close Filters"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="px-3 py-3 border-b border-gray-200/50">
              <div className="flex gap-1 bg-gray-100/50 rounded-md p-1">
                <button
                  onClick={() => setViewMode('activity')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    viewMode === 'activity'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setViewMode('resource')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    viewMode === 'resource'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Resource
                </button>
              </div>
            </div>

            {/* Layout Type */}
            <div className="px-3 mb-3">
              <label className="text-xs font-medium text-gray-600 mb-1.5 block text-center">Layout</label>
              <div className="flex gap-1 bg-gray-100/50 rounded-md p-1">
                <button
                  onClick={() => setLayoutType('hierarchical')}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${
                    layoutType === 'hierarchical'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Organized columns with straight flows"
                >
                  Grid
                </button>
                <button
                  onClick={() => setLayoutType('network')}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${
                    layoutType === 'network'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Spread out network topology"
                >
                  Network
                </button>
                <button
                  onClick={() => setLayoutType('compact')}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${
                    layoutType === 'compact'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Tight clustering"
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Edge Style */}
            <div className="px-3 mb-3">
              <label className="text-xs font-medium text-gray-600 mb-1.5 block text-center">Connections</label>
              <div className="flex gap-1 bg-gray-100/50 rounded-md p-1">
                <button
                  onClick={() => setEdgeType('straight')}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${
                    edgeType === 'straight'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Straight
                </button>
                <button
                  onClick={() => setEdgeType('smoothstep')}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${
                    edgeType === 'smoothstep'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Step
                </button>
                <button
                  onClick={() => setEdgeType('bezier')}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${
                    edgeType === 'bezier'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Curved
                </button>
              </div>
            </div>
            
            {/* Filter list */}
            <div className="p-3 max-h-[400px] overflow-y-auto">
              {currentFilters.map((filterId) => (
                <label 
                  key={filterId} 
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100/50 cursor-pointer transition-all group"
                >
                  <input 
                    type="checkbox" 
                    checked={selectedFilters.includes(filterId)} 
                    onChange={() => handleFilterToggle(filterId)} 
                    className="w-4 h-4 rounded border border-gray-300 text-gray-600 focus:ring-0 focus:ring-offset-0" 
                  />
                  <span className={selectedFilters.includes(filterId) ? 'text-sm text-gray-700 font-medium' : 'text-sm text-gray-400'}>
                    {getFilterLabel(filterId)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Level Slider */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Overview</span>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={getSliderValue()}
              onChange={(e) => handleViewLevelChange(parseFloat(e.target.value))}
              className="w-48 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700"
            />
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Detail</span>
          </div>
        </div>
      </div>

      {/* React Flow */}
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.3 }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export const ActivityViewGraphWrapper: React.FC = () => (
  <ReactFlowProvider>
    <ActivityViewGraph />
  </ReactFlowProvider>
);

export default ActivityViewGraphWrapper;
