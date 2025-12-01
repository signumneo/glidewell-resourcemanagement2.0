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
import { ParallelEdge } from './edges/ParallelEdge';
import { AuthService } from '../../services/authService';
import { IoTService } from '../../services/iotService';
import { Filter, X, Lock, Unlock } from 'lucide-react';

// Subway/Tube Line Colors - Distinct colors for each part/flow
const LINE_COLORS = [
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#ef4444', // Red
  '#06b6d4', // Cyan
];

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

interface ActivityNode {
  activityId: string;
  activityName: string;
  partNumber: string;
  processId: string;
  nodeId: string;
  resources: string[];
}

// Subway/Tube Station Node - Minimal dot with external label
const SubwayNode = ({ data }: { data: any }) => {
  const lineColor = data.lineColor || '#10b981';
  const detailLevel = data.viewLevel || 'condensed';
  const isShared = data.partNumber === 'Shared';
  const sharedLineColors = data.sharedLineColors || []; // Array of colors for shared nodes
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Invisible handles for connections */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target-top" 
        style={{ 
          top: 0, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '1px', 
          height: '1px', 
          background: 'transparent',
          border: 'none',
          opacity: 0,
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom" 
        style={{ 
          bottom: 0, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '1px', 
          height: '1px', 
          background: 'transparent',
          border: 'none',
          opacity: 0,
        }} 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="target-left" 
        style={{ 
          left: 0, 
          top: '50%', 
          transform: 'translateY(-50%)', 
          width: '1px', 
          height: '1px', 
          background: 'transparent',
          border: 'none',
          opacity: 0,
        }} 
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="target-right" 
        style={{ 
          right: 0, 
          top: '50%', 
          transform: 'translateY(-50%)', 
          width: '1px', 
          height: '1px', 
          background: 'transparent',
          border: 'none',
          opacity: 0,
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="source-left" 
        style={{ 
          left: 0, 
          top: '50%', 
          transform: 'translateY(-50%)', 
          width: '1px', 
          height: '1px', 
          background: 'transparent',
          border: 'none',
          opacity: 0,
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source-right" 
        style={{ 
          right: 0, 
          top: '50%', 
          transform: 'translateY(-50%)', 
          width: '1px', 
          height: '1px', 
          background: 'transparent',
          border: 'none',
          opacity: 0,
        }} 
      />
      
      {/* Station Dot - Multiple circles for shared nodes */}
      {isShared && sharedLineColors.length > 0 ? (
        <div className="flex gap-0.5">
          {sharedLineColors.map((color, idx) => (
            <div 
              key={idx}
              className="rounded-full shadow-sm transition-all hover:scale-110"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: color,
                border: '2px solid white',
              }}
            />
          ))}
        </div>
      ) : (
        <div 
          className="rounded-full shadow-sm transition-all hover:scale-110"
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: lineColor,
          }}
        />
      )}
      
      {/* Label positioned to the right with gap */}
      <div 
        className="pointer-events-auto absolute whitespace-nowrap"
        style={{ 
          minWidth: '150px',
          left: isShared && sharedLineColors.length > 0 
            ? `${(sharedLineColors.length * 12) + (sharedLineColors.length * 2) + 20}px` 
            : detailLevel === 'condensed' ? '36px' : detailLevel === 'medium' ? '44px' : '52px'
        }}
      >
        {detailLevel === 'condensed' ? (
          <div className="px-2 py-1 bg-white rounded shadow-sm border" style={{ borderColor: lineColor }}>
            <div className="text-xs font-semibold" style={{ color: lineColor }}>
              {data.processId}
            </div>
          </div>
        ) : detailLevel === 'medium' ? (
          <div className="px-3 py-1.5 bg-white rounded-md shadow-md border-2" style={{ borderColor: lineColor }}>
            <div className="text-xs font-bold mb-0.5" style={{ color: lineColor }}>
              {data.processId}
            </div>
            <div className="text-xs text-gray-600 line-clamp-1">{data.description}</div>
          </div>
        ) : (
          <div className="px-3 py-2 bg-white rounded-md shadow-lg border-2" style={{ borderColor: lineColor }}>
            <div className="text-sm font-bold mb-1" style={{ color: lineColor }}>
              {data.processId}
            </div>
            <div className="text-xs text-gray-700 mb-1">{data.description}</div>
            {data.operatorId && (
              <div className="text-xs text-gray-500">
                Operator: {data.operatorId}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Legacy node for backward compatibility
const CustomSubprocessNode = SubwayNode;

// Shared resource/activity node
const SharedResourceNode = ({ data }: { data: any }) => {
  return (
    <div className="relative flex items-center gap-3">
      {/* Central connection point */}
      <div className="relative">
        <Handle type="target" position={Position.Top} id="target-top" style={{ top: -4, left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', background: '#9333ea', border: '2px solid white' }} />
        <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ bottom: -4, left: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', background: '#9333ea', border: '2px solid white' }} />
        <Handle type="target" position={Position.Left} id="target-left" style={{ left: -4, top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', background: '#9333ea', border: '2px solid white' }} />
        <Handle type="source" position={Position.Right} id="source-right" style={{ right: -4, top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', background: '#9333ea', border: '2px solid white' }} />
        
        {/* Connection circle */}
        <div className="w-4 h-4 rounded-full border-2 border-purple-600 bg-purple-100 shadow-sm" />
      </div>
      
      {/* Info card to the right */}
      <div className="pointer-events-auto px-3 py-2 rounded-lg border-2 border-purple-400 bg-purple-50 shadow-sm hover:shadow-md transition-all">
        <div className="text-xs font-bold text-purple-700 whitespace-nowrap">
          {data.name}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  subprocessNode: SubprocessNode,
  resourceNode: ResourceNode,
  customSubprocessNode: CustomSubprocessNode,
  subwayNode: SubwayNode,
  sharedResourceNode: SharedResourceNode,
};

const edgeTypes = {
  parallel: ParallelEdge,
};

const ActivityViewGraph: React.FC = () => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvKey>('fmmmes-dev');
  const [availableParts, setAvailableParts] = useState<ProcessDefinition[]>([]);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [loadedProcesses, setLoadedProcesses] = useState<Map<string, Record<string, ProcessDetail>>>(new Map());
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [viewLevel, setViewLevel] = useState<'condensed' | 'medium' | 'full'>('condensed');
  const [viewMode, setViewMode] = useState<'process' | 'activity' | 'resource'>('process');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
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

  // Available resource types for resource view
  const availableResourceTypes = React.useMemo(() => [
    { id: 'station-1', name: 'Station 1', category: 'station', isShared: false },
    { id: 'station-2', name: 'Station 2', category: 'station', isShared: true },
    { id: 'station-3', name: 'Station 3', category: 'station', isShared: true },
    { id: 'station-4', name: 'Station 4', category: 'station', isShared: false },
    { id: 'operator-1', name: 'Operator 1', category: 'operator', isShared: false },
    { id: 'operator-2', name: 'Operator 2', category: 'operator', isShared: true },
    { id: 'operator-3', name: 'Operator 3', category: 'operator', isShared: true },
    { id: 'operator-4', name: 'Operator 4', category: 'operator', isShared: false },
  ], []);

  // Load available parts on mount and environment change
  useEffect(() => {
    const loadParts = async () => {
      setIsLoading(true);
      try {
        // HARDCODED TEST DATA for development/testing
        const testParts: ProcessDefinition[] = [
          { PartNumber: '1001', Version: '1.0', Description: 'Dental Crown - Ceramic', Quantity: '50' },
          { PartNumber: '1002', Version: '1.0', Description: 'Dental Bridge - 3-Unit', Quantity: '30' },
          { PartNumber: '1003', Version: '1.2', Description: 'Implant Abutment - Titanium', Quantity: '100' },
          { PartNumber: '1004', Version: '2.0', Description: 'Orthodontic Bracket Set', Quantity: '200' },
          { PartNumber: '1005', Version: '1.5', Description: 'Veneer - Porcelain', Quantity: '75' },
          { PartNumber: '1006', Version: '1.0', Description: 'Dental Inlay - Composite', Quantity: '60' },
          { PartNumber: '1007', Version: '2.1', Description: 'Full Arch Bridge - Zirconia', Quantity: '15' },
          { PartNumber: '1008', Version: '1.8', Description: 'Temporary Crown - PMMA', Quantity: '120' },
          { PartNumber: '1009', Version: '1.0', Description: 'Denture Base - Acrylic', Quantity: '40' },
          { PartNumber: '1010', Version: '3.0', Description: 'Custom Tray - Impression', Quantity: '90' },
        ];

        // Create mock process data for each test part with complex flows (loops, rework, branches)
        // Parts take DIFFERENT paths to create parallel/branching flow
        const mockProcesses = new Map<string, Record<string, ProcessDetail>>();
        
        testParts.forEach((part) => {
          let processSteps: Record<string, ProcessDetail>;
          
          if (part.PartNumber === '1001') {
            // Part 1001: Takes rework path at Forming (skips step 3, uses 3.5)
            processSteps = {
              '1': {
                ProcessId: 1,
                OperatorId: 101,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 5,
                Description: `Initial Inspection - ${part.Description}`,
                Data: [],
              },
              '2': {
                ProcessId: 2,
                OperatorId: 102,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 8,
                Description: 'Material Preparation',
                Data: [],
              },
              '3.5': {
                ProcessId: 3.5,
                OperatorId: 103,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 8,
                Description: 'Forming Rework',
                Data: [],
              },
              '4': {
                ProcessId: 4,
                OperatorId: 104,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 10,
                Description: 'Heat Treatment',
                Data: [],
              },
              '5': {
                ProcessId: 5,
                OperatorId: 105,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 7,
                Description: `Surface Finishing - ${part.Description}`,
                Data: [],
              },
              '6': {
                ProcessId: 6,
                OperatorId: 106,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 6,
                Description: `Quality Control - ${part.Description}`,
                Data: [],
              },
              '7': {
                ProcessId: 7,
                OperatorId: 107,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 4,
                Description: `Final Packaging - ${part.Description}`,
                Data: [],
              },
            };
          } else if (part.PartNumber === '1002') {
            // Part 1002: Takes rework path at Surface (skips step 5, uses 5.5)
            processSteps = {
              '1': {
                ProcessId: 1,
                OperatorId: 101,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 5,
                Description: `Initial Inspection - ${part.Description}`,
                Data: [],
              },
              '2': {
                ProcessId: 2,
                OperatorId: 102,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 8,
                Description: 'Material Preparation',
                Data: [],
              },
              '3': {
                ProcessId: 3,
                OperatorId: 103,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 12,
                Description: 'Forming Process',
                Data: [],
              },
              '4': {
                ProcessId: 4,
                OperatorId: 104,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 10,
                Description: 'Heat Treatment',
                Data: [],
              },
              '5.5': {
                ProcessId: 5.5,
                OperatorId: 105,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 6,
                Description: 'Surface Rework',
                Data: [],
              },
              '6': {
                ProcessId: 6,
                OperatorId: 106,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 6,
                Description: `Quality Control - ${part.Description}`,
                Data: [],
              },
              '7': {
                ProcessId: 7,
                OperatorId: 107,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 4,
                Description: `Final Packaging - ${part.Description}`,
                Data: [],
              },
            };
          } else {
            // Other parts: Standard flow
            processSteps = {
              '1': {
                ProcessId: 1,
                OperatorId: 101,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 5,
                Description: `Initial Inspection - ${part.Description}`,
                Data: [],
              },
              '2': {
                ProcessId: 2,
                OperatorId: 102,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 8,
                Description: 'Material Preparation',
                Data: [],
              },
              '3': {
                ProcessId: 3,
                OperatorId: 103,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 12,
                Description: 'Forming Process',
                Data: [],
              },
              '4': {
                ProcessId: 4,
                OperatorId: 104,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 10,
                Description: 'Heat Treatment',
                Data: [],
              },
              '5': {
                ProcessId: 5,
                OperatorId: 105,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 7,
                Description: `Surface Finishing - ${part.Description}`,
                Data: [],
              },
              '6': {
                ProcessId: 6,
                OperatorId: 106,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 6,
                Description: `Quality Control - ${part.Description}`,
                Data: [],
              },
              '7': {
                ProcessId: 7,
                OperatorId: 107,
                TimeStamp: new Date().toISOString(),
                NumberOfData: 4,
                Description: `Final Packaging - ${part.Description}`,
                Data: [],
              },
            };
          }
          
          mockProcesses.set(part.PartNumber, processSteps);
        });

        setAvailableParts(testParts);
        setLoadedProcesses(mockProcesses);
        
        // Select first 3 parts by default for testing
        const partsToLoad = testParts.slice(0, 3).map(p => p.PartNumber);
        setSelectedParts(partsToLoad);

        // Select first 4 resources by default for resource view
        setSelectedResources(['station-1', 'station-2', 'station-3', 'operator-1']);

        /* REAL API IMPLEMENTATION (commented out for testing)
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
        
        // Select first 2 parts by default and load their processes
        if (parts.length > 0) {
          const partsToLoad = parts.slice(0, Math.min(2, parts.length)).map(p => p.PartNumber);
          setSelectedParts(partsToLoad);
          await Promise.all(partsToLoad.map(partNumber => loadProcessForPart(partNumber)));
        }
        */
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
      // Select part (processes are already loaded in mock data)
      setSelectedParts(prev => [...prev, partNumber]);
    }
  };

  // Generate graph nodes and edges from loaded processes
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    if (viewMode === 'process') {
      // PROCESS VIEW: Simple sequential flow
      let columnIndex = 0;
      const columnWidth = viewLevel === 'full' ? 320 : viewLevel === 'medium' ? 280 : 240;
      const verticalSpacing = 180;
      // More gap needed in detailed state as cards get bigger
      const startY = viewLevel === 'condensed' ? 120 : viewLevel === 'medium' ? 160 : 200;

      selectedParts.forEach(partNumber => {
        const processes = loadedProcesses.get(partNumber);
        if (!processes) return;

        const processEntries = Object.entries(processes);
        const xPosition = columnIndex * columnWidth + 100;

        // Add part number label
        const partInfo = availableParts.find(p => p.PartNumber === partNumber);
        const labelContent = viewLevel === 'condensed' ? (
          <div className="font-semibold text-sm text-gray-800">Part {partNumber}</div>
        ) : viewLevel === 'medium' ? (
          <div>
            <div className="font-semibold text-base text-gray-800">Part {partNumber}</div>
            {partInfo && <div className="text-xs text-gray-600 mt-1 line-clamp-1">{partInfo.Description}</div>}
          </div>
        ) : (
          <div>
            <div className="font-bold text-lg text-gray-900">Part {partNumber}</div>
            {partInfo && <div className="text-sm text-gray-600 mt-1">{partInfo.Description}</div>}
            {partInfo && <div className="text-xs text-gray-500 mt-1">Version {partInfo.Version}</div>}
          </div>
        );
        
        // Dynamic y position for label based on detail level to add gap between title and nodes
        // More gap needed in detailed state as cards get bigger
        const labelY = viewLevel === 'condensed' ? 20 : viewLevel === 'medium' ? 10 : 0;
        
        newNodes.push({
          id: `label-${partNumber}`,
          type: 'default',
          position: { x: xPosition, y: labelY },
          data: { label: labelContent },
          draggable: false,
          selectable: false,
        });

        processEntries.forEach(([processId, processDetail], rowIndex) => {
          const nodeId = `${partNumber}-${processId}`;
          const yPosition = startY + (rowIndex * verticalSpacing);

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

          // Sequential flow edges
          if (rowIndex < processEntries.length - 1) {
            const nextProcessId = processEntries[rowIndex + 1][0];
            const nextNodeId = `${partNumber}-${nextProcessId}`;
            
            newEdges.push({
              id: `edge-${nodeId}-to-${nextNodeId}`,
              source: nodeId,
              sourceHandle: 'source-bottom',
              target: nextNodeId,
              targetHandle: 'target-top',
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
    } else if (viewMode === 'activity') {
      // ACTIVITY VIEW: Unified nodes with parallel edges for shared connections
      const columnWidth = 450;
      const verticalSpacing = 120;
      // More gap needed in detailed state as cards get bigger
      const startY = viewLevel === 'condensed' ? 120 : viewLevel === 'medium' ? 160 : 200;

      // Define which rows should be shared (indices start at 0)
      // Row 0 is always unique (first activity)
      // Rows 1-3 are shared across parts
      // Rows 4+ are unique again for each part
      const SHARED_ROWS = [1, 2, 3];

      // Step 1: NODE UNIFICATION - Create unique nodes based on process description
      const getNodeKey = (description: string, rowIndex: number, partNumber: string) => {
        // If it's the first row or beyond shared rows, make it unique per part
        if (rowIndex === 0 || !SHARED_ROWS.includes(rowIndex)) {
          return `${partNumber}-${description.trim()}`;
        }
        // Otherwise, use shared key
        return `shared-${description.trim()}`;
      };

      const uniqueNodesMap = new Map<string, {
        nodeId: string;
        description: string;
        rowIndex: number;
        yPosition: number;
        isShared: boolean;
        partNumber?: string;
        sharedParts: string[]; // Track which parts pass through this node
      }>();

      // Build a map of part flows (ordered list of descriptions per part)
      const partFlowsMap = new Map<string, Array<{
        processId: string;
        description: string;
        detail: ProcessDetail;
        nodeKey: string;
      }>>();

      selectedParts.forEach(partNumber => {
        const processes = loadedProcesses.get(partNumber);
        if (!processes) return;

        const processEntries = Object.entries(processes);
        const flow = processEntries.map(([processId, detail], rowIndex) => {
          const nodeKey = getNodeKey(detail.Description, rowIndex, partNumber);
          return {
            processId,
            description: detail.Description,
            detail,
            nodeKey,
          };
        });
        
        partFlowsMap.set(partNumber, flow);

        // Create unified nodes and track which parts pass through them
        flow.forEach((step, rowIndex) => {
          if (!uniqueNodesMap.has(step.nodeKey)) {
            const isShared = SHARED_ROWS.includes(rowIndex);
            const nodeId = step.nodeKey.replace(/\s+/g, '-');
            const yPosition = startY + (rowIndex * verticalSpacing);
            
            uniqueNodesMap.set(step.nodeKey, {
              nodeId,
              description: step.description,
              rowIndex,
              yPosition,
              isShared,
              partNumber: isShared ? undefined : partNumber,
              sharedParts: [partNumber],
            });
          } else {
            // Add this part to the list of parts passing through this node
            const existingNode = uniqueNodesMap.get(step.nodeKey)!;
            if (!existingNode.sharedParts.includes(partNumber)) {
              existingNode.sharedParts.push(partNumber);
            }
          }
        });
      });

      // Calculate positions for nodes
      const centerX = ((selectedParts.length - 1) * columnWidth) / 2 + 100;

      // Create the unified nodes
      uniqueNodesMap.forEach((nodeInfo) => {
        // Position: shared nodes in center, unique nodes in their part's column
        let xPosition = centerX;
        let nodeColor = '#6b7280'; // Gray for shared (fallback)
        let sharedLineColors: string[] = [];
        
        if (nodeInfo.isShared) {
          // For shared nodes, collect all the line colors of parts passing through
          sharedLineColors = nodeInfo.sharedParts
            .map(partNum => {
              const partIdx = selectedParts.indexOf(partNum);
              return partIdx !== -1 ? LINE_COLORS[partIdx % LINE_COLORS.length] : null;
            })
            .filter((color): color is string => color !== null);
        } else if (nodeInfo.partNumber) {
          // Find which column this part is in
          const partIdx = selectedParts.indexOf(nodeInfo.partNumber);
          if (partIdx !== -1) {
            xPosition = partIdx * columnWidth + 100;
            nodeColor = LINE_COLORS[partIdx % LINE_COLORS.length];
          }
        }

        newNodes.push({
          id: nodeInfo.nodeId,
          type: 'subwayNode',
          position: { x: xPosition, y: nodeInfo.yPosition },
          data: {
            processId: nodeInfo.description, // Use description as the label
            description: nodeInfo.description,
            dataCount: 0,
            operatorId: 0,
            timeStamp: '',
            partNumber: nodeInfo.isShared ? 'Shared' : nodeInfo.partNumber,
            viewLevel,
            lineColor: nodeColor,
            sharedLineColors: sharedLineColors, // Pass the array of colors for shared nodes
          },
        });
      });

      // Add part labels
      selectedParts.forEach((partNumber, partIdx) => {
        const xPosition = partIdx * columnWidth + 100;
        const lineColor = LINE_COLORS[partIdx % LINE_COLORS.length];
        const partInfo = availableParts.find(p => p.PartNumber === partNumber);
        
        const labelContent = viewLevel === 'condensed' ? (
          <div className="font-semibold text-sm text-gray-800" style={{ color: lineColor }}>Part {partNumber}</div>
        ) : viewLevel === 'medium' ? (
          <div>
            <div className="font-semibold text-base text-gray-800" style={{ color: lineColor }}>Part {partNumber}</div>
            {partInfo && <div className="text-xs text-gray-600 mt-1 line-clamp-1">{partInfo.Description}</div>}
          </div>
        ) : (
          <div>
            <div className="font-bold text-lg text-gray-900" style={{ color: lineColor }}>Part {partNumber}</div>
            {partInfo && <div className="text-sm text-gray-600 mt-1">{partInfo.Description}</div>}
            {partInfo && <div className="text-xs text-gray-500 mt-1">Version {partInfo.Version}</div>}
          </div>
        );
        
        newNodes.push({
          id: `label-${partNumber}`,
          type: 'default',
          position: { x: xPosition, y: 20 },
          data: { label: labelContent },
          draggable: false,
          selectable: false,
        });
      });

      // Step 2: EDGE COUNTING - Count parallel edges between node pairs
      type EdgeKey = string;
      const edgeCounts = new Map<EdgeKey, { total: number; current: number }>();

      // First pass: Count all edges
      selectedParts.forEach(partNumber => {
        const flow = partFlowsMap.get(partNumber);
        if (!flow) return;

        for (let i = 0; i < flow.length - 1; i++) {
          const currentKey = flow[i].nodeKey;
          const nextKey = flow[i + 1].nodeKey;
          
          const currentNode = uniqueNodesMap.get(currentKey);
          const nextNode = uniqueNodesMap.get(nextKey);
          
          if (!currentNode || !nextNode) continue;

          const edgeKey = `${currentNode.nodeId}->${nextNode.nodeId}`;
          
          if (!edgeCounts.has(edgeKey)) {
            edgeCounts.set(edgeKey, { total: 0, current: 0 });
          }
          edgeCounts.get(edgeKey)!.total += 1;
        }
      });

      // Step 3: CREATE EDGES with offset information for parallel rendering
      selectedParts.forEach((partNumber, partIdx) => {
        const flow = partFlowsMap.get(partNumber);
        if (!flow) return;

        const lineColor = LINE_COLORS[partIdx % LINE_COLORS.length];

        for (let i = 0; i < flow.length - 1; i++) {
          const currentKey = flow[i].nodeKey;
          const nextKey = flow[i + 1].nodeKey;
          
          const currentNode = uniqueNodesMap.get(currentKey);
          const nextNode = uniqueNodesMap.get(nextKey);
          
          if (!currentNode || !nextNode) continue;

          const edgeKey = `${currentNode.nodeId}->${nextNode.nodeId}`;
          const tracker = edgeCounts.get(edgeKey)!;

          newEdges.push({
            id: `edge-${partNumber}-${i}`,
            source: currentNode.nodeId,
            sourceHandle: 'source-bottom',
            target: nextNode.nodeId,
            targetHandle: 'target-top',
            type: 'parallel',
            animated: false,
            style: {
              stroke: lineColor,
              strokeWidth: 3,
              strokeLinecap: 'round',
            },
            data: {
              offsetIndex: tracker.current,
              totalParallel: tracker.total,
              partNumber,
              lineColor,
            },
          });

          tracker.current += 1;
        }
      });

    } else {
      // RESOURCE VIEW: Subway map by selected resource types with unique instances per part
      if (selectedResources.length === 0) {
        // No resources selected, show empty state
        return;
      }

      const columnWidth = 450;
      const verticalSpacing = 120;
      // More gap needed in detailed state as cards get bigger
      const startY = viewLevel === 'condensed' ? 120 : viewLevel === 'medium' ? 160 : 200;

      // Map selected resources to process steps
      const getResourceForStep = (stepIndex: number, partNumber: string) => {
        const resourceId = selectedResources[stepIndex % selectedResources.length];
        const resourceTemplate = availableResourceTypes.find(r => r.id === resourceId);
        
        if (!resourceTemplate) {
          return { id: 'unknown', name: 'Unknown', category: 'station', isShared: false, partNumber };
        }

        // Create unique resource instance per part unless it's marked as shared
        const instanceId = resourceTemplate.isShared 
          ? resourceId 
          : `${resourceId}-${partNumber}`;
        
        const instanceName = resourceTemplate.isShared
          ? resourceTemplate.name
          : `${resourceTemplate.name} (Part ${partNumber})`;

        return {
          id: instanceId,
          name: instanceName,
          category: resourceTemplate.category,
          isShared: resourceTemplate.isShared,
          partNumber: resourceTemplate.isShared ? undefined : partNumber,
        };
      };

      // Step 1: NODE UNIFICATION - Create unique resource nodes
      const getResourceNodeKey = (resourceInfo: any) => {
        // Use the instance ID which already contains part-specific info for unique resources
        return resourceInfo.id;
      };

      const uniqueResourceNodesMap = new Map<string, {
        nodeId: string;
        resourceId: string;
        resourceName: string;
        stepIndex: number;
        yPosition: number;
        isShared: boolean;
        partNumber?: string;
        sharedParts: string[];
      }>();

      const partResourceFlowsMap = new Map<string, Array<{
        processId: string;
        resourceInfo: any;
        detail: ProcessDetail;
        nodeKey: string;
      }>>();

      selectedParts.forEach(partNumber => {
        const processes = loadedProcesses.get(partNumber);
        if (!processes) return;

        const processEntries = Object.entries(processes);
        
        // Only use as many steps as we have selected resources
        const stepsToUse = Math.min(processEntries.length, selectedResources.length);
        
        const flow = processEntries.slice(0, stepsToUse).map(([processId, detail], stepIndex) => {
          const resourceInfo = getResourceForStep(stepIndex, partNumber);
          const nodeKey = getResourceNodeKey(resourceInfo);
          return {
            processId,
            resourceInfo,
            detail,
            nodeKey,
          };
        });
        
        partResourceFlowsMap.set(partNumber, flow);

        // Create unified resource nodes
        flow.forEach((step, stepIndex) => {
          if (!uniqueResourceNodesMap.has(step.nodeKey)) {
            const nodeId = step.nodeKey.replace(/\s+/g, '-').replace(/[()]/g, '');
            const yPosition = startY + (stepIndex * verticalSpacing);
            
            uniqueResourceNodesMap.set(step.nodeKey, {
              nodeId,
              resourceId: step.resourceInfo.id,
              resourceName: step.resourceInfo.name,
              stepIndex,
              yPosition,
              isShared: step.resourceInfo.isShared,
              partNumber: step.resourceInfo.partNumber,
              sharedParts: [partNumber],
            });
          } else {
            // Only add to shared parts if this is actually a shared resource
            const existingNode = uniqueResourceNodesMap.get(step.nodeKey)!;
            if (existingNode.isShared && !existingNode.sharedParts.includes(partNumber)) {
              existingNode.sharedParts.push(partNumber);
            }
          }
        });
      });

      const centerX = ((selectedParts.length - 1) * columnWidth) / 2 + 100;

      // Create the unified resource nodes
      uniqueResourceNodesMap.forEach((nodeInfo) => {
        let xPosition = centerX;
        let nodeColor = '#6b7280';
        let sharedLineColors: string[] = [];
        
        if (nodeInfo.isShared) {
          sharedLineColors = nodeInfo.sharedParts
            .map(partNum => {
              const partIdx = selectedParts.indexOf(partNum);
              return partIdx !== -1 ? LINE_COLORS[partIdx % LINE_COLORS.length] : null;
            })
            .filter((color): color is string => color !== null);
        } else if (nodeInfo.partNumber) {
          const partIdx = selectedParts.indexOf(nodeInfo.partNumber);
          if (partIdx !== -1) {
            xPosition = partIdx * columnWidth + 100;
            nodeColor = LINE_COLORS[partIdx % LINE_COLORS.length];
          }
        }

        newNodes.push({
          id: nodeInfo.nodeId,
          type: 'subwayNode',
          position: { x: xPosition, y: nodeInfo.yPosition },
          data: {
            processId: nodeInfo.resourceName,
            description: nodeInfo.resourceName,
            dataCount: 0,
            operatorId: 0,
            timeStamp: '',
            partNumber: nodeInfo.isShared ? 'Shared' : nodeInfo.partNumber,
            viewLevel,
            lineColor: nodeColor,
            sharedLineColors: sharedLineColors,
          },
        });
      });

      // Add part labels
      selectedParts.forEach((partNumber, partIdx) => {
        const xPosition = partIdx * columnWidth + 100;
        const lineColor = LINE_COLORS[partIdx % LINE_COLORS.length];
        const partInfo = availableParts.find(p => p.PartNumber === partNumber);
        
        const labelContent = viewLevel === 'condensed' ? (
          <div className="font-semibold text-sm text-gray-800" style={{ color: lineColor }}>Part {partNumber}</div>
        ) : viewLevel === 'medium' ? (
          <div>
            <div className="font-semibold text-base text-gray-800" style={{ color: lineColor }}>Part {partNumber}</div>
            {partInfo && <div className="text-xs text-gray-600 mt-1 line-clamp-1">{partInfo.Description}</div>}
          </div>
        ) : (
          <div>
            <div className="font-bold text-lg text-gray-900" style={{ color: lineColor }}>Part {partNumber}</div>
            {partInfo && <div className="text-sm text-gray-600 mt-1">{partInfo.Description}</div>}
            {partInfo && <div className="text-xs text-gray-500 mt-1">Version {partInfo.Version}</div>}
          </div>
        );
        
        newNodes.push({
          id: `label-${partNumber}`,
          type: 'default',
          position: { x: xPosition, y: 20 },
          data: { label: labelContent },
          draggable: false,
          selectable: false,
        });
      });

      // Step 2: EDGE COUNTING
      type EdgeKey = string;
      const resourceEdgeCounts = new Map<EdgeKey, { total: number; current: number }>();

      selectedParts.forEach(partNumber => {
        const flow = partResourceFlowsMap.get(partNumber);
        if (!flow) return;

        for (let i = 0; i < flow.length - 1; i++) {
          const currentKey = flow[i].nodeKey;
          const nextKey = flow[i + 1].nodeKey;
          
          const currentNode = uniqueResourceNodesMap.get(currentKey);
          const nextNode = uniqueResourceNodesMap.get(nextKey);
          
          if (!currentNode || !nextNode) continue;

          const edgeKey = `${currentNode.nodeId}->${nextNode.nodeId}`;
          
          if (!resourceEdgeCounts.has(edgeKey)) {
            resourceEdgeCounts.set(edgeKey, { total: 0, current: 0 });
          }
          resourceEdgeCounts.get(edgeKey)!.total += 1;
        }
      });

      // Step 3: CREATE EDGES
      selectedParts.forEach((partNumber, partIdx) => {
        const flow = partResourceFlowsMap.get(partNumber);
        if (!flow) return;

        const lineColor = LINE_COLORS[partIdx % LINE_COLORS.length];

        for (let i = 0; i < flow.length - 1; i++) {
          const currentKey = flow[i].nodeKey;
          const nextKey = flow[i + 1].nodeKey;
          
          const currentNode = uniqueResourceNodesMap.get(currentKey);
          const nextNode = uniqueResourceNodesMap.get(nextKey);
          
          if (!currentNode || !nextNode) continue;

          const edgeKey = `${currentNode.nodeId}->${nextNode.nodeId}`;
          const tracker = resourceEdgeCounts.get(edgeKey)!;

          newEdges.push({
            id: `edge-resource-${partNumber}-${i}`,
            source: currentNode.nodeId,
            sourceHandle: 'source-bottom',
            target: nextNode.nodeId,
            targetHandle: 'target-top',
            type: 'parallel',
            animated: false,
            style: {
              stroke: lineColor,
              strokeWidth: 3,
              strokeLinecap: 'round',
            },
            data: {
              offsetIndex: tracker.current,
              totalParallel: tracker.total,
              partNumber,
              lineColor,
            },
          });

          tracker.current += 1;
        }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [selectedParts, loadedProcesses, viewLevel, viewMode, availableParts, selectedResources, availableResourceTypes, setNodes, setEdges]);

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
  const onNodeMouseEnter = useCallback((_event: React.MouseEvent, node: Node) => {
    setHoveredNode(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  // Handle node double-click to show info panel
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
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

          {/* View Mode Toggle */}
          <div className="px-3 py-3 border-b border-gray-200">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block text-center">View Mode</label>
            <div className="flex flex-col gap-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('process')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  viewMode === 'process'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Process Flow
              </button>
              <button
                onClick={() => setViewMode('activity')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  viewMode === 'activity'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Activity View
              </button>
              <button
                onClick={() => setViewMode('resource')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  viewMode === 'resource'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Resource View
              </button>
            </div>
          </div>

          {/* Resource Type Selection (only show in Resource View) */}
          {viewMode === 'resource' && (
            <div className="px-3 py-3 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-blue-900">Resources</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedResources(availableResourceTypes.map(r => r.id))}
                    className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-all"
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedResources([])}
                    className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-all"
                  >
                    None
                  </button>
                </div>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {availableResourceTypes.map((resource) => (
                  <label 
                    key={resource.id} 
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-blue-100 cursor-pointer transition-all group"
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedResources.includes(resource.id)} 
                      onChange={() => {
                        setSelectedResources(prev => 
                          prev.includes(resource.id)
                            ? prev.filter(id => id !== resource.id)
                            : [...prev, resource.id]
                        );
                      }}
                      className="w-3.5 h-3.5 rounded border border-blue-300 text-blue-600 focus:ring-0 focus:ring-offset-0" 
                    />
                    <div className="flex-1">
                      <div className={selectedResources.includes(resource.id) ? 'text-xs text-blue-900 font-medium' : 'text-xs text-blue-600'}>
                        {resource.name}
                        {resource.isShared && <span className="ml-1 text-[10px] text-purple-600">(Shared)</span>}
                      </div>
                      <div className="text-[10px] text-blue-500 capitalize">{resource.category}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

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
        
        {/* Filter list - Scrollable - Only show parts in non-resource views or when resources are selected */}
        {(viewMode !== 'resource' || selectedResources.length > 0) && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-2 px-2">
              <label className="text-xs font-medium text-gray-600">Parts</label>
            </div>
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
        )}

        {/* Empty state for resource view when no resources selected */}
        {viewMode === 'resource' && selectedResources.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">No resources selected</div>
              <div className="text-xs text-gray-400">Select resources above to view the flow</div>
            </div>
          </div>
        )}
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
          edgeTypes={edgeTypes}
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
