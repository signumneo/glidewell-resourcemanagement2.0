import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  ControlButton,
  Handle,
  Position,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SubprocessNode } from './nodes/SubprocessNode';
import { ResourceNode } from './nodes/ResourceNode';
import { AuthService } from '../../services/authService';
import { IoTService } from '../../services/iotService';
import { Filter, X, Lock, Unlock } from 'lucide-react';

const ENV_CONFIG = {
  'burmes-dev': {
    baseUrl: 'https://burmes-service.unsdev.glidewellengineering.com',
    clientId: '6l2ch9ogih7g34dpdqn8h105t6',
    mesType: 'BurMES',
  },
  'fmmmes-dev': {
    baseUrl: 'https://fmmmes-service.unsdev.glidewellengineering.com',
    clientId: '5o44pb3bp05kejsbd6lro327bl',
    mesType: 'FmmMES',
  },
  '3dpmes-dev': {
    baseUrl: 'https://3dpmes-service.unsdev.glidewellengineering.com',
    clientId: '6j3rjurdv7hf2028ho83ssntkk',
    mesType: '3dpMES',
  },
} as const;

type EnvKey = keyof typeof ENV_CONFIG;

interface ProcessDefinition {
  PartNumber: string;
  Version: string;
  Description: string;
  Quantity: string;
}

interface ProcessDetail {
  ProcessId: number;
  OperatorId: number;
  TimeStamp: string;
  NumberOfData: number;
  Description: string;
  Data: any[];
}

// Custom node for subprocess visualization
const CustomSubprocessNode = ({ data }: { data: any }) => {
  const detailLevel = data.viewLevel || 'condensed';
  
  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      {detailLevel === 'condensed' ? (
        <div className="px-4 py-3 rounded-lg border-2 border-green-600 bg-white shadow-sm hover:shadow-md transition-all w-[200px]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">
              {data.processId}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-800 line-clamp-2">{data.description}</div>
        </div>
      ) : detailLevel === 'medium' ? (
        <div className="px-4 py-3 rounded-lg border-2 border-green-600 bg-white shadow-md hover:shadow-lg transition-all w-[240px]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700">
              Process {data.processId}
            </span>
            <span className="text-xs text-gray-400">{data.dataCount} steps</span>
          </div>
          <div className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">{data.description}</div>
        </div>
      ) : (
        <div className="px-5 py-4 rounded-lg border-2 border-green-600 bg-white shadow-lg hover:shadow-xl transition-all w-[280px]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-bold px-2.5 py-1 rounded bg-green-100 text-green-700">
              Process {data.processId}
            </span>
            <span className="text-xs text-gray-400">{data.dataCount} steps</span>
          </div>
          <div className="text-sm font-medium text-gray-800 mb-2">{data.description}</div>
          <div className="flex items-center justify-between text-xs border-t border-gray-200 pt-2">
            <span className="text-gray-500">Operator:</span>
            <span className="font-medium text-gray-700">{data.operatorId}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  subprocessNode: SubprocessNode,
  resourceNode: ResourceNode,
  customSubprocessNode: CustomSubprocessNode,
};

const ActivityViewGraph: React.FC = () => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvKey>('burmes-dev');
  const [availableParts, setAvailableParts] = useState<ProcessDefinition[]>([]);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [loadedProcesses, setLoadedProcesses] = useState<Map<string, Record<string, ProcessDetail>>>(new Map());
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [viewLevel, setViewLevel] = useState<'condensed' | 'medium' | 'full'>('condensed');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<any>(null);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use React Flow state management for draggable nodes
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as any);

  // Initialize auth and IoT service
  const authService = React.useMemo(() => {
    return new AuthService();
  }, []);

  const iotService = React.useMemo(() => {
    const config = ENV_CONFIG[selectedEnvironment];
    return new IoTService(config.baseUrl, authService);
  }, [selectedEnvironment, authService]);

  // Load available parts on mount and environment change
  useEffect(() => {
    const loadParts = async () => {
      setIsLoading(true);
      try {
        const token = authService.getToken();
        
        if (!token) {
          console.error('No authentication token found');
          setIsLoading(false);
          return;
        }

        // Fetch process definitions
        const response = await iotService.fetchProcessDefinitions();
        const parts = Array.isArray(response.Data) ? response.Data : [];
        setAvailableParts(parts);
        
        // Select first part by default and load its processes
        if (parts.length > 0) {
          const firstPart = parts[0].PartNumber;
          setSelectedParts([firstPart]);
          await loadProcessForPart(firstPart);
        }
      } catch (error) {
        console.error('Error loading parts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadParts();
  }, [selectedEnvironment]);

  // Load process steps for a specific part
  const loadProcessForPart = async (partNumber: string) => {
    try {
      const response = await iotService.fetchProcessSteps(parseInt(partNumber), 1);
      const processSteps = iotService.parseProcessSteps(response);
      
      setLoadedProcesses(prev => {
        const updated = new Map(prev);
        updated.set(partNumber, processSteps);
        return updated;
      });
    } catch (error) {
      console.error(`Error loading process for part ${partNumber}:`, error);
    }
  };

  // Handle part selection toggle
  const handlePartToggle = async (partNumber: string) => {
    const isCurrentlySelected = selectedParts.includes(partNumber);
    
    if (isCurrentlySelected) {
      // Deselect part
      setSelectedParts(prev => prev.filter(p => p !== partNumber));
    } else {
      // Select part and load its processes if not already loaded
      setSelectedParts(prev => [...prev, partNumber]);
      
      if (!loadedProcesses.has(partNumber)) {
        await loadProcessForPart(partNumber);
      }
    }
  };

  // Generate graph nodes and edges from loaded processes
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    let columnIndex = 0;
    const columnWidth = viewLevel === 'full' ? 320 : viewLevel === 'medium' ? 280 : 240;
    const verticalSpacing = 180;
    const startY = 100;

    selectedParts.forEach(partNumber => {
      const processes = loadedProcesses.get(partNumber);
      if (!processes) return;

      const processEntries = Object.entries(processes);
      const xPosition = columnIndex * columnWidth + 100;

      // Add part number label node at the top
      const partInfo = availableParts.find(p => p.PartNumber === partNumber);
      
      const labelContent = viewLevel === 'condensed' ? (
        <div className="font-semibold text-sm text-gray-800">
          Part {partNumber}
        </div>
      ) : viewLevel === 'medium' ? (
        <div>
          <div className="font-semibold text-base text-gray-800">Part {partNumber}</div>
          {partInfo && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-1">{partInfo.Description}</div>
          )}
        </div>
      ) : (
        <div>
          <div className="font-bold text-lg text-gray-900">Part {partNumber}</div>
          {partInfo && (
            <div className="text-sm text-gray-600 mt-1">{partInfo.Description}</div>
          )}
          {partInfo && (
            <div className="text-xs text-gray-500 mt-1">Version {partInfo.Version}</div>
          )}
        </div>
      );
      
      newNodes.push({
        id: `label-${partNumber}`,
        type: 'default',
        position: { x: xPosition, y: 20 },
        data: { 
          label: labelContent
        },
        draggable: false,
        selectable: false,
      });

      processEntries.forEach(([processId, processDetail], rowIndex) => {
        const nodeId = `${partNumber}-${processId}`;
        const yPosition = startY + (rowIndex * verticalSpacing);

        // Create process node
        newNodes.push({
          id: nodeId,
          type: 'customSubprocessNode',
          position: { x: xPosition, y: yPosition },
          data: {
            processId,
            description: processDetail.Description,
            dataCount: processDetail.NumberOfData,
            operatorId: processDetail.OperatorId,
            timeStamp: processDetail.TimeStamp,
            partNumber,
            viewLevel,
          },
        });

        // Create edge to next process in sequence (vertical flow)
        if (rowIndex < processEntries.length - 1) {
          const nextProcessId = processEntries[rowIndex + 1][0];
          const nextNodeId = `${partNumber}-${nextProcessId}`;
          
          newEdges.push({
            id: `edge-${nodeId}-to-${nextNodeId}`,
            source: nodeId,
            target: nextNodeId,
            type: 'default',
            animated: true,
            style: { stroke: '#10b981', strokeWidth: 2 },
            markerEnd: {
              type: 'arrowclosed',
              width: 20,
              height: 20,
              color: '#10b981',
            },
          });
        }
      });

      columnIndex++;
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [selectedParts, loadedProcesses, viewLevel, availableParts, setNodes, setEdges]);

  // Get connected nodes for hover highlighting
  const getConnectedElements = useCallback((nodeId: string) => {
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
  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: any) => {
    setHoveredNode(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  // Handle node double-click to show info panel
  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNodeInfo(node);
    setIsInfoPanelOpen(true);
  }, []);

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
    <div className="w-full h-full flex bg-gray-50 relative">
      {/* Collapsed Filter Button */}
      {!isFilterOpen && (
        <button
          onClick={() => setIsFilterOpen(true)}
          className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-3 hover:bg-gray-50 transition-all"
          title="Show Filters"
        >
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Side Filter Panel - Conditionally visible */}
      {isFilterOpen && (
        <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-sm">
          {/* Header with close button */}
          <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            </div>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="p-1 hover:bg-gray-200 rounded transition-all"
              title="Close Filters"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* All/None Buttons */}
          <div className="px-3 py-2 border-b border-gray-200 flex gap-2">
            <button
              onClick={() => setSelectedParts(availableParts.map(p => p.PartNumber))}
              className="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-all"
            >
              All
            </button>
            <button
              onClick={() => setSelectedParts([])}
              className="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-all"
            >
              None
            </button>
          </div>

          {/* Layout Type */}
          <div className="px-3 py-3 border-b border-gray-200" style={{ display: 'none' }}>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block text-center">Layout</label>
          <div className="flex gap-1 bg-gray-100 rounded-md p-1">
            <button className="flex-1 px-2 py-1 text-xs font-medium rounded transition-all bg-white text-gray-900 shadow-sm">
              Grid
            </button>
            </div>
          </div>

        {/* Edge Style */}
        <div className="px-3 py-3 border-b border-gray-200" style={{ display: 'none' }}>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block text-center">Connections</label>
          <div className="flex gap-1 bg-gray-100 rounded-md p-1">
            <button className="flex-1 px-2 py-1 text-xs font-medium rounded transition-all bg-white text-gray-900 shadow-sm">
              Straight
            </button>
          </div>
        </div>

        {/* Detail Level Slider */}
        <div className="px-3 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Overview</span>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={getSliderValue()}
              onChange={(e) => handleViewLevelChange(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700"
            />
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Detail</span>
          </div>
        </div>
        
        {/* Filter list - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="text-center py-4 text-sm text-gray-500">Loading parts...</div>
          ) : availableParts.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">No parts available</div>
          ) : (
            availableParts.map((part) => (
              <label 
                key={part.PartNumber} 
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
              >
                <input 
                  type="checkbox" 
                  checked={selectedParts.includes(part.PartNumber)} 
                  onChange={() => handlePartToggle(part.PartNumber)} 
                  className="w-4 h-4 rounded border border-gray-300 text-gray-600 focus:ring-0 focus:ring-offset-0" 
                />
                <div className="flex-1">
                  <div className={selectedParts.includes(part.PartNumber) ? 'text-sm text-gray-700 font-medium' : 'text-sm text-gray-400'}>
                    Part {part.PartNumber}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-1">{part.Description}</div>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
      )}

      {/* React Flow Graph Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.3 }}
          panOnDrag={!isLocked}
          zoomOnScroll={!isLocked}
          zoomOnPinch={!isLocked}
          zoomOnDoubleClick={!isLocked}
        >
          <Background color="#e5e7eb" gap={16} />
          <Controls showInteractive={false}>
            <ControlButton onClick={() => setIsLocked(!isLocked)} title={isLocked ? "Unlock" : "Lock"}>
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </ControlButton>
          </Controls>
        </ReactFlow>
      </div>

      {/* Info Panel - Right Side */}
      {isInfoPanelOpen && selectedNodeInfo && (
        <div className="w-96 h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Process Details</h3>
            <button
              onClick={() => setIsInfoPanelOpen(false)}
              className="p-1 hover:bg-gray-200 rounded transition-all"
              title="Close Details"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Process ID Badge */}
              <div>
                <span className="inline-block text-sm font-bold px-3 py-1 rounded bg-green-100 text-green-700">
                  Process {selectedNodeInfo.data.processId}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {selectedNodeInfo.data.description}
                </h4>
              </div>

              {/* Main Details */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Part Number</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedNodeInfo.data.partNumber}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data Points</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedNodeInfo.data.dataCount}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Operator ID</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedNodeInfo.data.operatorId}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-3 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Timestamp</h5>
                <div className="text-sm text-gray-600">
                  {selectedNodeInfo.data.timeStamp}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ActivityViewGraphWrapper: React.FC = () => (
  <ReactFlowProvider>
    <ActivityViewGraph />
  </ReactFlowProvider>
);

export default ActivityViewGraphWrapper;
