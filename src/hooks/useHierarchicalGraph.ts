import { useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { 
  globalResources, 
  getSubprocessesForResource, 
  interProcessConnections,
  type MainProcess, 
  type Subprocess 
} from '../data/hierarchicalProcessData';
import { useProcessStore } from '../store/processStore';

interface UseHierarchicalGraphResult {
  nodes: Node[];
  edges: Edge[];
}

// Activity View: Show main processes as columns with subprocesses flowing top-to-bottom
export const useActivityViewGraph = (
  selectedProcesses: string[], 
  viewLevel: 'condensed' | 'medium' | 'full' = 'medium',
  layoutType: 'hierarchical' | 'network' | 'compact' = 'hierarchical',
  edgeType: 'straight' | 'bezier' = 'straight'
): UseHierarchicalGraphResult => {
  const mainProcesses = useProcessStore((state) => state.mainProcesses);
  
  return useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Filter main processes based on selection
    const filteredProcesses = mainProcesses.filter(mp => selectedProcesses.includes(mp.id));

    // Layout-specific spacing with view level adjustments
    const baseSpacing = layoutType === 'network' ? { x: 600, y: 200 } : 
                       layoutType === 'compact' ? { x: 250, y: 100 } : 
                       { x: 400, y: 150 };
    
    // Increase vertical spacing for detailed view modes
    const spacing = {
      x: baseSpacing.x,
      y: viewLevel === 'full' ? baseSpacing.y + 100 : 
         viewLevel === 'medium' ? baseSpacing.y + 30 : 
         baseSpacing.y
    };

    // Create nodes for each main process column with subprocesses
    filteredProcesses.forEach((mainProcess, colIndex) => {
      const xPosition = colIndex * spacing.x + 100;

      // Create subprocess nodes flowing top-to-bottom
      mainProcess.subprocesses.forEach((subprocess, rowIndex) => {
        const yPosition = rowIndex * spacing.y + 100;

        nodes.push({
          id: subprocess.id,
          type: 'subprocessNode',
          position: { x: xPosition, y: yPosition },
          data: {
            id: subprocess.id,
            name: subprocess.name,
            description: subprocess.description,
            duration: subprocess.duration,
            mainProcessName: mainProcess.name,
            mainProcessColor: mainProcess.color,
            resourceCount: subprocess.resourceTypes.length,
            viewLevel,
          },
        });

        // Create flow edges to next subprocess within the same main process (INTRA-PROCESS)
        if (rowIndex < mainProcess.subprocesses.length - 1) {
          const nextSubprocess = mainProcess.subprocesses[rowIndex + 1];
          edges.push({
            id: `intra-${subprocess.id}-${nextSubprocess.id}`,
            source: subprocess.id,
            target: nextSubprocess.id,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'straight',
            animated: true,
            style: { 
              stroke: mainProcess.color, 
              strokeWidth: 2.5,
            },
            markerEnd: {
              type: 'arrowclosed',
              width: 12,
              height: 12,
              color: mainProcess.color,
            },
          });
        }

        // Create edges from subprocesses to resources (RESOURCE CONNECTIONS)
        subprocess.resourceTypes.forEach((resourceId) => {
          edges.push({
            id: `resource-${subprocess.id}-${resourceId}`,
            source: subprocess.id,
            target: resourceId,
            type: edgeType,
            animated: false,
            style: { 
              stroke: '#94a3b8', 
              strokeWidth: 1.5, 
              strokeDasharray: '6,4',
              opacity: 0.7,
            },
            markerEnd: {
              type: 'arrow',
              width: 8,
              height: 8,
              color: '#94a3b8',
            },
          });
        });
      });
    });

    // Create inter-process connections (INTER-PROCESS)
    const subprocessIds = new Set(nodes.map(n => n.id));
    interProcessConnections.forEach((connection) => {
      // Only add connection if both nodes are in the current view
      if (subprocessIds.has(connection.from) && subprocessIds.has(connection.to)) {
        const isHandoff = connection.type === 'handoff';
        edges.push({
          id: `inter-${connection.from}-${connection.to}`,
          source: connection.from,
          target: connection.to,
          type: edgeType,
          animated: isHandoff,
          style: { 
            stroke: isHandoff ? '#6366f1' : '#8b5cf6', 
            strokeWidth: isHandoff ? 2 : 2,
            strokeDasharray: isHandoff ? '3,3' : '8,5',
            opacity: 0.85,
          },
          markerEnd: {
            type: 'arrowclosed',
            width: 10,
            height: 10,
            color: isHandoff ? '#6366f1' : '#8b5cf6',
          },
          label: isHandoff ? 'handoff' : 'depends on',
          labelStyle: { 
            fontSize: 9, 
            fill: isHandoff ? '#6366f1' : '#8b5cf6',
            fontWeight: 600,
          },
          labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
        });
      }
    });

    // Create resource nodes on the right side
    const resourcesInUse = new Set<string>();
    filteredProcesses.forEach(mp => {
      mp.subprocesses.forEach(sp => {
        sp.resourceTypes.forEach(rt => resourcesInUse.add(rt));
      });
    });

    const resourcesArray = Array.from(resourcesInUse);
    const resourceXPosition = (filteredProcesses.length) * spacing.x + 200;

    resourcesArray.forEach((resourceId, index) => {
      const resource = globalResources.find(r => r.id === resourceId);
      if (resource) {
        const resourceSpacing = viewLevel === 'full' ? 180 : viewLevel === 'medium' ? 140 : 120;
        nodes.push({
          id: resourceId,
          type: 'resourceNode',
          position: { x: resourceXPosition, y: index * resourceSpacing + 100 },
          data: {
            id: resource.id,
            name: resource.name,
            category: resource.category,
            type: resource.type,
            quantity: resource.quantity,
            usageCount: getSubprocessesForResource(resourceId).length,
            viewLevel,
          },
        });
      }
    });

    return { nodes, edges };
  }, [selectedProcesses, viewLevel, layoutType, edgeType, mainProcesses]);
};

// Resource View: Show all resources, when selected show all subprocesses using that resource
export const useResourceViewGraph = (
  selectedResources: string[], 
  viewLevel: 'condensed' | 'medium' | 'full' = 'medium',
  layoutType: 'hierarchical' | 'network' | 'compact' = 'hierarchical',
  edgeType: 'straight' | 'bezier' = 'straight'
): UseHierarchicalGraphResult => {
  const mainProcesses = useProcessStore((state) => state.mainProcesses);
  
  return useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Filter resources based on selection
    const filteredResources = globalResources.filter(r => selectedResources.includes(r.id));

    // Layout-specific spacing
    const spacing = layoutType === 'network' ? { x: 600, y: 200 } : 
                   layoutType === 'compact' ? { x: 250, y: 100 } : 
                   { x: 500, y: 150 };

    // Create resource nodes on the left side
    filteredResources.forEach((resource, index) => {
      const resourceSpacing = viewLevel === 'full' ? 180 : viewLevel === 'medium' ? 140 : 120;
      nodes.push({
        id: resource.id,
        type: 'resourceNode',
        position: { x: 100, y: index * resourceSpacing + 100 },
        data: {
          id: resource.id,
          name: resource.name,
          category: resource.category,
          type: resource.type,
          quantity: resource.quantity,
          usageCount: getSubprocessesForResource(resource.id).length,
          viewLevel,
        },
      });
    });

    // For each selected resource, show all subprocesses that use it
    const subprocessesInUse = new Map<string, { subprocess: Subprocess; mainProcess: MainProcess }>();
    
    filteredResources.forEach(resource => {
      const subprocesses = getSubprocessesForResource(resource.id);
      
      subprocesses.forEach(subprocess => {
        // Find which main process this subprocess belongs to
        const mainProcess = mainProcesses.find(mp => 
          mp.subprocesses.some(sp => sp.id === subprocess.id)
        );
        
        if (mainProcess && !subprocessesInUse.has(subprocess.id)) {
          subprocessesInUse.set(subprocess.id, { subprocess, mainProcess });
        }
      });
    });

    // Create subprocess nodes on the right side, grouped by main process as columns
    const subprocessArray = Array.from(subprocessesInUse.values());
    const groupedByMainProcess = new Map<string, Array<{ subprocess: Subprocess; mainProcess: MainProcess }>>();
    
    subprocessArray.forEach(item => {
      if (!groupedByMainProcess.has(item.mainProcess.id)) {
        groupedByMainProcess.set(item.mainProcess.id, []);
      }
      groupedByMainProcess.get(item.mainProcess.id)!.push(item);
    });

    // Layout subprocess columns by main process
    const mainProcessGroups = Array.from(groupedByMainProcess.entries());
    
    mainProcessGroups.forEach(([_mainProcessId, group], colIndex) => {
      const xPosition = spacing.x + (colIndex * spacing.x);
      
      group.forEach(({ subprocess, mainProcess }, rowIndex) => {
        const yPosition = rowIndex * spacing.y + 100;
        
        nodes.push({
          id: subprocess.id,
          type: 'subprocessNode',
          position: { x: xPosition, y: yPosition },
          data: {
            id: subprocess.id,
            name: subprocess.name,
            description: subprocess.description,
            duration: subprocess.duration,
            mainProcessName: mainProcess.name,
            mainProcessColor: mainProcess.color,
            resourceCount: subprocess.resourceTypes.length,
            viewLevel,
          },
        });

        // Create flow edges between subprocesses in the same main process (INTRA-PROCESS)
        if (rowIndex < group.length - 1) {
          const nextSubprocess = group[rowIndex + 1].subprocess;
          edges.push({
            id: `intra-${subprocess.id}-${nextSubprocess.id}`,
            source: subprocess.id,
            target: nextSubprocess.id,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'straight',
            animated: true,
            style: { 
              stroke: mainProcess.color, 
              strokeWidth: 2.5,
            },
            markerEnd: {
              type: 'arrowclosed',
              width: 12,
              height: 12,
              color: mainProcess.color,
            },
          });
        }

        // Create edges from resources to subprocesses (RESOURCE CONNECTIONS)
        subprocess.resourceTypes.forEach(resourceId => {
          if (selectedResources.includes(resourceId)) {
            edges.push({
              id: `resource-${resourceId}-${subprocess.id}`,
              source: resourceId,
              target: subprocess.id,
              type: edgeType,
              animated: false,
              style: { 
                stroke: '#94a3b8', 
                strokeWidth: 1.5, 
                strokeDasharray: '6,4',
                opacity: 0.7,
              },
              markerEnd: {
                type: 'arrow',
                width: 8,
                height: 8,
                color: '#94a3b8',
              },
            });
          }
        });
      });
    });

    // Create inter-process connections (INTER-PROCESS)
    const subprocessIds = new Set(nodes.map(n => n.id));
    interProcessConnections.forEach((connection) => {
      // Only add connection if both nodes are in the current view
      if (subprocessIds.has(connection.from) && subprocessIds.has(connection.to)) {
        const isHandoff = connection.type === 'handoff';
        edges.push({
          id: `inter-${connection.from}-${connection.to}`,
          source: connection.from,
          target: connection.to,
          type: edgeType,
          animated: isHandoff,
          style: { 
            stroke: isHandoff ? '#6366f1' : '#8b5cf6', 
            strokeWidth: isHandoff ? 2 : 2,
            strokeDasharray: isHandoff ? '3,3' : '8,5',
            opacity: 0.85,
          },
          markerEnd: {
            type: 'arrowclosed',
            width: 10,
            height: 10,
            color: isHandoff ? '#6366f1' : '#8b5cf6',
          },
          label: isHandoff ? 'handoff' : 'depends on',
          labelStyle: { 
            fontSize: 9, 
            fill: isHandoff ? '#6366f1' : '#8b5cf6',
            fontWeight: 600,
          },
          labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
        });
      }
    });

    return { nodes, edges };
  }, [selectedResources, viewLevel, layoutType, edgeType, mainProcesses]);
};
