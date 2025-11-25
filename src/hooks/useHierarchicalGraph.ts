import { useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { mainProcesses, globalResources, getSubprocessesForResource, type MainProcess, type Subprocess } from '../data/hierarchicalProcessData';

interface UseHierarchicalGraphResult {
  nodes: Node[];
  edges: Edge[];
}

// Activity View: Show main processes as columns with subprocesses flowing top-to-bottom
export const useActivityViewGraph = (
  selectedProcesses: string[], 
  viewLevel: 'condensed' | 'medium' | 'full' = 'medium',
  layoutType: 'hierarchical' | 'network' | 'compact' = 'hierarchical',
  edgeType: 'straight' | 'smoothstep' | 'bezier' = 'straight'
): UseHierarchicalGraphResult => {
  return useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Filter main processes based on selection
    const filteredProcesses = mainProcesses.filter(mp => selectedProcesses.includes(mp.id));

    // Layout-specific spacing
    const spacing = layoutType === 'network' ? { x: 600, y: 200 } : 
                   layoutType === 'compact' ? { x: 250, y: 100 } : 
                   { x: 400, y: 150 };

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

        // Create flow edges to next subprocess within the same main process
        if (rowIndex < mainProcess.subprocesses.length - 1) {
          const nextSubprocess = mainProcess.subprocesses[rowIndex + 1];
          edges.push({
            id: `${subprocess.id}-${nextSubprocess.id}`,
            source: subprocess.id,
            target: nextSubprocess.id,
            sourceHandle: edgeType === 'straight' ? 'bottom' : undefined,
            targetHandle: edgeType === 'straight' ? 'top' : undefined,
            type: edgeType,
            animated: true,
            style: { stroke: mainProcess.color, strokeWidth: 2 },
          });
        }

        // Create edges from subprocesses to resources
        subprocess.resourceTypes.forEach((resourceId) => {
          edges.push({
            id: `${subprocess.id}-resource-${resourceId}`,
            source: subprocess.id,
            target: resourceId,
            type: edgeType === 'straight' ? 'smoothstep' : edgeType,
            animated: false,
            style: { stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5,5' },
          });
        });
      });
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
        nodes.push({
          id: resourceId,
          type: 'resourceNode',
          position: { x: resourceXPosition, y: index * 120 + 100 },
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
  }, [selectedProcesses, viewLevel, layoutType, edgeType]);
};

// Resource View: Show all resources, when selected show all subprocesses using that resource
export const useResourceViewGraph = (
  selectedResources: string[], 
  viewLevel: 'condensed' | 'medium' | 'full' = 'medium',
  layoutType: 'hierarchical' | 'network' | 'compact' = 'hierarchical',
  edgeType: 'straight' | 'smoothstep' | 'bezier' = 'straight'
): UseHierarchicalGraphResult => {
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
      nodes.push({
        id: resource.id,
        type: 'resourceNode',
        position: { x: 100, y: index * 120 + 100 },
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

        // Create flow edges between subprocesses in the same main process
        if (rowIndex < group.length - 1) {
          const nextSubprocess = group[rowIndex + 1].subprocess;
          edges.push({
            id: `${subprocess.id}-${nextSubprocess.id}`,
            source: subprocess.id,
            target: nextSubprocess.id,
            sourceHandle: edgeType === 'straight' ? 'bottom' : undefined,
            targetHandle: edgeType === 'straight' ? 'top' : undefined,
            type: edgeType,
            animated: true,
            style: { stroke: mainProcess.color, strokeWidth: 2 },
          });
        }

        // Create edges from resources to subprocesses
        subprocess.resourceTypes.forEach(resourceId => {
          if (selectedResources.includes(resourceId)) {
            edges.push({
              id: `${resourceId}-${subprocess.id}`,
              source: resourceId,
              target: subprocess.id,
              type: edgeType === 'straight' ? 'smoothstep' : edgeType,
              animated: false,
              style: { stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5,5' },
            });
          }
        });
      });
    });

    return { nodes, edges };
  }, [selectedResources, viewLevel, layoutType, edgeType]);
};
