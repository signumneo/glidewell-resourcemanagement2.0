import { useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { GlobalActivity } from '../types/globalActivity';

interface ActivityViewGraphData {
  nodes: Node[];
  edges: Edge[];
}

export function useActivityViewGraph(
  activities: GlobalActivity[],
  selectedCategories: string[]
): ActivityViewGraphData {
  return useMemo(() => {
    // Filter activities by selected categories
    const filteredActivities = activities.filter((activity) =>
      selectedCategories.includes(activity.category)
    );

    // Collect unique resource types from filtered activities
    const resourceTypeMap = new Map<string, {
      id: string;
      name: string;
      category: string;
      activityCount: number;
      activities: string[];
    }>();

    filteredActivities.forEach((activity) => {
      activity.resourceTypes.forEach((rt) => {
        if (resourceTypeMap.has(rt.resourceTypeId)) {
          const existing = resourceTypeMap.get(rt.resourceTypeId)!;
          existing.activityCount += 1;
          existing.activities.push(activity.id);
        } else {
          resourceTypeMap.set(rt.resourceTypeId, {
            id: rt.resourceTypeId,
            name: rt.resourceTypeName,
            category: rt.resourceCategory,
            activityCount: 1,
            activities: [activity.id],
          });
        }
      });
    });

    // Sort resources by activityCount (most shared resources)
    const sortedResources = Array.from(resourceTypeMap.values()).sort(
      (a, b) => b.activityCount - a.activityCount
    );

    // Group resources into tiers based on usage
    const highUsage = sortedResources.filter(r => r.activityCount >= 6);
    const mediumUsage = sortedResources.filter(r => r.activityCount >= 3 && r.activityCount < 6);
    const lowUsage = sortedResources.filter(r => r.activityCount < 3);

    // Create activity nodes (top row) - spread out horizontally
    const activityNodes: Node[] = filteredActivities.map((activity, index) => ({
      id: activity.id,
      type: 'activityNode',
      data: {
        label: activity.name,
        activityId: activity.id,
        category: activity.category,
        duration: activity.estimatedDuration,
        resourceCount: activity.resourceTypes.length,
      },
      position: { x: index * 250 + 100, y: 100 },
    }));

    // Create resource type nodes in rows below - arranged by usage tier
    const resourceTypeNodes: Node[] = [];
    let yOffset = 400; // Start below activities

    // High usage resources (6+) - first row
    highUsage.forEach((rt, index) => {
      resourceTypeNodes.push({
        id: rt.id,
        type: 'resourceTypeNode',
        data: {
          label: rt.name,
          category: rt.category,
          activityCount: rt.activityCount,
        },
        position: { 
          x: index * 280 + 100, 
          y: yOffset 
        },
      });
    });

    yOffset += 200;

    // Medium usage resources (3-5) - second row
    mediumUsage.forEach((rt, index) => {
      resourceTypeNodes.push({
        id: rt.id,
        type: 'resourceTypeNode',
        data: {
          label: rt.name,
          category: rt.category,
          activityCount: rt.activityCount,
        },
        position: { 
          x: index * 260 + 100, 
          y: yOffset 
        },
      });
    });

    yOffset += 200;

    // Low usage resources (<3) - third row
    lowUsage.forEach((rt, index) => {
      resourceTypeNodes.push({
        id: rt.id,
        type: 'resourceTypeNode',
        data: {
          label: rt.name,
          category: rt.category,
          activityCount: rt.activityCount,
        },
        position: { 
          x: index * 260 + 100, 
          y: yOffset 
        },
      });
    });

    // Create edges from activities to resource types with path offsets
    const edges: Edge[] = [];
    
    // Group edges by target resource to calculate offsets
    const edgesByTarget = new Map<string, Array<{
      source: string;
      index: number;
      data: any;
    }>>();

    filteredActivities.forEach((activity) => {
      activity.resourceTypes.forEach((rt, index) => {
        if (!edgesByTarget.has(rt.resourceTypeId)) {
          edgesByTarget.set(rt.resourceTypeId, []);
        }
        edgesByTarget.get(rt.resourceTypeId)!.push({
          source: activity.id,
          index,
          data: {
            activityName: activity.name,
            resourceTypeName: rt.resourceTypeName,
            isRequired: rt.isRequired,
            quantity: rt.quantity,
            resourceTypeId: rt.resourceTypeId,
          },
        });
      });
    });

    // Create edges with sourceHandle positions to spread connections
    filteredActivities.forEach((activity) => {
      activity.resourceTypes.forEach((rt, index) => {
        const isShared = resourceTypeMap.get(rt.resourceTypeId)!.activityCount > 1;
        const isRequired = rt.isRequired;
        const resourceUsage = resourceTypeMap.get(rt.resourceTypeId)!.activityCount;
        
        // Calculate offset for this connection to spread lines
        const targetConnections = edgesByTarget.get(rt.resourceTypeId)!;
        const connectionIndex = targetConnections.findIndex(e => e.source === activity.id && e.index === index);
        const totalConnections = targetConnections.length;
        
        // Color coding based on resource status
        let strokeColor = '#9ca3af';
        let strokeWidth = 1.5;
        
        if (resourceUsage >= 6 && isRequired) {
          strokeColor = '#dc2626';
          strokeWidth = 3;
        } else if (resourceUsage >= 6) {
          strokeColor = '#ef4444';
          strokeWidth = 2.5;
        } else if (isShared && isRequired) {
          strokeColor = '#f59e0b';
          strokeWidth = 2.5;
        } else if (isShared) {
          strokeColor = '#fbbf24';
          strokeWidth = 2;
        } else if (isRequired) {
          strokeColor = '#3b82f6';
          strokeWidth = 2;
        } else {
          strokeColor = '#94a3b8';
          strokeWidth = 1;
        }

        // Calculate source and target handles to spread connections
        const sourceHandleId = `source-${index}`;
        const targetHandleId = `target-${connectionIndex}`;

        edges.push({
          id: `${activity.id}-${rt.resourceTypeId}-${index}`,
          source: activity.id,
          target: rt.resourceTypeId,
          sourceHandle: sourceHandleId,
          targetHandle: targetHandleId,
          type: 'default',
          animated: resourceUsage >= 6 && isRequired,
          style: {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
          },
          data: {
            activityName: activity.name,
            resourceTypeName: rt.resourceTypeName,
            isRequired: rt.isRequired,
            quantity: rt.quantity,
            isShared,
            usageCount: resourceUsage,
            offset: totalConnections > 1 ? (connectionIndex - totalConnections / 2) * 15 : 0,
          },
        });
      });
    });

    return {
      nodes: [...activityNodes, ...resourceTypeNodes],
      edges,
    };
  }, [activities, selectedCategories]);
}
