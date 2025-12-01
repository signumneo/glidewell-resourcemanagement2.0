import { useEffect, useState } from 'react';
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
import { AuthService } from '../../services/authService';
import { IoTService } from '../../services/iotService';
import { Filter, X, Lock, Unlock } from 'lucide-react';

const ENV_CONFIG = {
  'fmmmes-dev': {
    baseUrl: 'https://fmmmes-service.unsdev.glidewellengineering.com',
    clientId: '6l2ch9ogih7g34dpdqn8h105t6',
    mesType: 'FmmMES',
  }, 
  '3dpmes-dev': {
    baseUrl: 'https://3dpmes-service.unsdev.glidewellengineering.com',
    clientId: '6j3rjurdv7hf2028ho83ssntkk',
    mesType: '3dpMES',
  },
} as const;

type EnvKey = keyof typeof ENV_CONFIG;

interface PartNodeData {
  partNumber: string;
  description: string;
  version: string;
  quantity: string;
  viewLevel?: 'condensed' | 'medium' | 'full';
}

interface ProcessDefinition {
  PartNumber: string;
  Version: string;
  Description: string;
  Quantity: string;
}

const PartNode = ({ data }: { data: PartNodeData }) => {
  const detailLevel = data.viewLevel || 'condensed';
  
  return (
    <div className="relative group">
      <Handle type="source" position={Position.Right} />
      {detailLevel === 'condensed' ? (
        <div className="px-5 py-4 rounded-lg border-2 border-blue-600 bg-white shadow-sm hover:shadow-md transition-all w-[240px]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">
              Part {data.partNumber}
            </span>
            <span className="text-xs text-gray-400">v{data.version}</span>
          </div>
          <div className="text-sm text-gray-700 line-clamp-2">{data.description}</div>
        </div>
      ) : detailLevel === 'medium' ? (
        <div className="px-5 py-4 rounded-lg border-2 border-blue-600 bg-white shadow-md hover:shadow-lg transition-all w-[280px]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-base font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-700">
              Part {data.partNumber}
            </span>
            <span className="text-xs text-gray-400">Version {data.version}</span>
          </div>
          <div className="text-sm text-gray-700 mb-2 line-clamp-2">{data.description}</div>
          {data.quantity && (
            <div className="text-xs text-gray-500">Quantity: {data.quantity}</div>
          )}
        </div>
      ) : (
        <div className="px-6 py-5 rounded-lg border-2 border-blue-600 bg-white shadow-lg hover:shadow-xl transition-all w-[320px]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-base font-bold px-3 py-1.5 rounded bg-blue-100 text-blue-700">
              Part {data.partNumber}
            </span>
            <span className="text-xs text-gray-400">Version {data.version}</span>
          </div>
          <div className="text-sm text-gray-700 mb-3">{data.description}</div>
          {data.quantity && (
            <div className="flex items-center justify-between text-xs border-t border-gray-200 pt-2">
              <span className="text-gray-500">Quantity:</span>
              <span className="font-medium text-gray-700">{data.quantity}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface SubprocessNodeData {
  processName: string;
  processId: string;
  partNumber: string;
  viewLevel?: 'condensed' | 'medium' | 'full';
}

const SubprocessNode = ({ data }: { data: SubprocessNodeData }) => {
  const detailLevel = data.viewLevel || 'condensed';
  
  return (
    <div className="relative group">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      {detailLevel === 'condensed' ? (
        <div className="px-3 py-2 rounded-lg border-2 border-green-500 bg-white shadow-sm hover:shadow-md transition-all w-[180px]">
          <div className="text-xs text-green-600 font-semibold mb-1">Subprocess</div>
          <div className="text-sm font-bold text-gray-800 line-clamp-1">{data.processName}</div>
        </div>
      ) : detailLevel === 'medium' ? (
        <div className="px-4 py-3 rounded-lg border-2 border-green-500 bg-white shadow-md hover:shadow-lg transition-all w-[220px]">
          <div className="text-xs text-green-600 font-semibold mb-1">Subprocess</div>
          <div className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">{data.processName}</div>
          <div className="text-xs text-gray-500">ID: {data.processId}</div>
        </div>
      ) : (
        <div className="px-5 py-4 rounded-lg border-2 border-green-500 bg-white shadow-lg hover:shadow-xl transition-all w-[260px]">
          <div className="text-xs text-green-600 font-semibold mb-2">Subprocess</div>
          <div className="text-base font-bold text-gray-800 mb-2">{data.processName}</div>
          <div className="flex items-center justify-between text-xs border-t border-gray-200 pt-2">
            <span className="text-gray-500">Process ID:</span>
            <span className="font-medium text-gray-700">{data.processId}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-500">Part Number:</span>
            <span className="font-medium text-gray-700">{data.partNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  partNode: PartNode,
  subprocessNode: SubprocessNode,
};

const DepartmentViewGraphInner = ({ env = 'fmmmes-dev' as EnvKey }) => {
  const [allParts, setAllParts] = useState<ProcessDefinition[]>([]);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [viewLevel, setViewLevel] = useState<'condensed' | 'medium' | 'full'>('condensed');
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const [subprocessNodes, setSubprocessNodes] = useState<Node[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Fetch parts on mount
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const authService = new AuthService();
        const token = authService.getToken();
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const iotService = new IoTService(ENV_CONFIG[env].baseUrl, authService);
        const response = await iotService.fetchProcessDefinitions();
        
        const partList = Array.isArray(response.Data) ? response.Data : [];
        setAllParts(partList);
        
        // Select all parts by default
        const allPartNumbers = partList.map((p: ProcessDefinition) => p.PartNumber);
        setSelectedParts(allPartNumbers);
        
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load part numbers');
        setLoading(false);
      }
    };

    fetchParts();
  }, [env]);

  // Update nodes when selection changes
  useEffect(() => {
    // Skip if we have an expanded part (subprocess nodes are being managed manually)
    if (expandedPart) {
      return;
    }
    
    const filteredParts = allParts.filter((p) => selectedParts.includes(p.PartNumber));
    
    const processNodes: Node[] = filteredParts.map((part, idx) => ({
      id: String(part.PartNumber),
      type: 'partNode',
      data: {
        partNumber: part.PartNumber,
        description: part.Description,
        version: part.Version,
        quantity: part.Quantity,
        viewLevel,
      },
      position: { 
        x: 100, 
        y: 80 + idx * (viewLevel === 'condensed' ? 120 : viewLevel === 'medium' ? 150 : 180) 
      },
    }));

    setNodes(processNodes);
    setEdges([]);
  }, [allParts, selectedParts, viewLevel, expandedPart, setNodes, setEdges]);

  // Update subprocess nodes when view level changes
  useEffect(() => {
    if (!expandedPart || subprocessNodes.length === 0) {
      return;
    }
    
    // Update subprocess nodes with current viewLevel
    const updatedSubprocessNodes = subprocessNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        viewLevel,
      },
    }));
    
    // Get current part nodes
    const filteredParts = allParts.filter((p) => selectedParts.includes(p.PartNumber));
    const processNodes: Node[] = filteredParts.map((part, idx) => ({
      id: String(part.PartNumber),
      type: 'partNode',
      data: {
        partNumber: part.PartNumber,
        description: part.Description,
        version: part.Version,
        quantity: part.Quantity,
        viewLevel,
      },
      position: { 
        x: 100, 
        y: 80 + idx * (viewLevel === 'condensed' ? 120 : viewLevel === 'medium' ? 150 : 180) 
      },
    }));
    
    // Combine and update
    const allNodes = [...processNodes, ...updatedSubprocessNodes];
    setNodes(allNodes);
  }, [viewLevel, expandedPart, subprocessNodes, allParts, selectedParts, setNodes]);

  const handleFilterToggle = (partNumber: string) => {
    setSelectedParts((prev) =>
      prev.includes(partNumber)
        ? prev.filter((p) => p !== partNumber)
        : [...prev, partNumber]
    );
  };

  const handleSelectAll = () => {
    setSelectedParts(allParts.map((p) => p.PartNumber));
  };

  const handleSelectNone = () => {
    setSelectedParts([]);
  };

  const getSliderValue = () => {
    if (viewLevel === 'condensed') return 1;
    if (viewLevel === 'medium') return 2;
    return 3;
  };

  const handleViewLevelChange = (value: number) => {
    if (value === 1) setViewLevel('condensed');
    else if (value === 2) setViewLevel('medium');
    else setViewLevel('full');
  };

  const handleNodeDoubleClick = async (_event: React.MouseEvent, node: Node) => {
    if (node.type !== 'partNode') return;
    
    const partNumber = String(node.data.partNumber);
    
    // If already expanded, collapse it
    if (expandedPart === partNumber) {
      setExpandedPart(null);
      setSubprocessNodes([]);
      setEdges([]);
      return;
    }
    
    try {
      const authService = new AuthService();
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const iotService = new IoTService(ENV_CONFIG[env].baseUrl, authService);
      const response = await iotService.fetchProcessSteps(parseInt(partNumber), 1);
      
      const processSteps = iotService.parseProcessSteps(response);
      const subprocessList = Object.entries(processSteps);
      
      // Position subprocess nodes to the right of the clicked part node
      const startX = node.position.x + 400;
      const startY = node.position.y;
      
      const spacing = viewLevel === 'condensed' ? 70 : viewLevel === 'medium' ? 110 : 200;
      
      const newSubprocessNodes: Node[] = subprocessList.map(([processId, details], idx) => ({
        id: `subprocess-${partNumber}-${processId}`,
        type: 'subprocessNode',
        data: {
          processName: details.Description || processId,
          processId: processId,
          partNumber: partNumber,
          viewLevel,
        },
        position: {
          x: startX,
          y: startY + idx * spacing,
        },
      }));
      
      // Create edges connecting part to subprocesses and between subprocesses
      const newEdges: Edge[] = [];
      
      // Connect parent part node to first subprocess
      if (subprocessList.length > 0) {
        const firstEdge: Edge = {
          id: `edge-${partNumber}-to-${subprocessList[0][0]}`,
          source: String(partNumber),
          target: `subprocess-${partNumber}-${subprocessList[0][0]}`,
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2 },
        };
        newEdges.push(firstEdge);
      }
      
      // Connect subprocesses sequentially
      for (let i = 0; i < subprocessList.length - 1; i++) {
        const currentProcessId = subprocessList[i][0];
        const nextProcessId = subprocessList[i + 1][0];
        
        const sequentialEdge: Edge = {
          id: `edge-subprocess-${partNumber}-${currentProcessId}-to-${nextProcessId}`,
          source: `subprocess-${partNumber}-${currentProcessId}`,
          target: `subprocess-${partNumber}-${nextProcessId}`,
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2 },
        };
        newEdges.push(sequentialEdge);
    }
      
      setExpandedPart(partNumber);
      setSubprocessNodes(newSubprocessNodes);
      
      // Update both nodes and edges immediately
      const currentNodes = nodes;
      const updatedNodes = [...currentNodes, ...newSubprocessNodes];
      
      setNodes(updatedNodes);
      setEdges(newEdges);
    } catch (err) {
      console.error('Error fetching subprocesses:', err);
      alert('Failed to fetch subprocesses: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-lg text-gray-500">
        Loading department data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg text-red-500 mb-2">Error</div>
        <div className="text-sm text-gray-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Part Filters</h3>
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
              onClick={handleSelectAll}
              className="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-all"
            >
              All
            </button>
            <button
              onClick={handleSelectNone}
              className="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-all"
            >
              None
            </button>
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

          {/* Filter List */}
          <div className="flex-1 overflow-y-auto p-3">
            {allParts.map((part) => (
              <label
                key={part.PartNumber}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
              >
                <input
                  type="checkbox"
                  checked={selectedParts.includes(part.PartNumber)}
                  onChange={() => handleFilterToggle(part.PartNumber)}
                  className="w-4 h-4 rounded border border-gray-300 text-gray-600 focus:ring-0 focus:ring-offset-0"
                />
                <div className="flex-1 min-w-0">
                  <div className={selectedParts.includes(part.PartNumber) ? 'text-sm text-gray-700 font-medium' : 'text-sm text-gray-400'}>
                    Part {part.PartNumber}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{part.Description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Graph Area */}
      <div className="flex-1 relative">
        {!isFilterOpen && (
          <button
            onClick={() => setIsFilterOpen(true)}
            className="absolute top-4 left-4 z-10 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
            title="Open Filters"
          >
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDoubleClick={handleNodeDoubleClick}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
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
    </div>
  );
};

export const DepartmentViewGraph = (props: { env?: EnvKey }) => {
  return (
    <ReactFlowProvider>
      <DepartmentViewGraphInner {...props} />
    </ReactFlowProvider>
  );
};
