import { useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { GlobalActivity, ResourceType } from '../types/globalActivity';

interface ResourceTypeViewGraphData {
  nodes: Node[];
  edges: Edge[];
}

export function useResourceTypeViewGraph(
  activities: GlobalActivity[],
  resourceTypes: ResourceType[],
  selectedResourceCategories: string[]
): ResourceTypeViewGraphData {
  return useMemo(() => {
    // Filter resource types by selected categories
    const filteredResourceTypes = resourceTypes.filter((rt) =>
      selectedResourceCategories.includes(rt.category)
    );

    // Create resource type nodes (left side)
    const resourceTypeNodes: Node[] = filteredResourceTypes.map((rt, index) => {
      // Count activities that use this resource type
      const activityCount = activities.filter((activity) =>
        activity.resourceTypes.some((assoc) => assoc.resourceTypeId === rt.id)
      ).length;

      return {
        id: rt.id,
        type: 'resourceTypeLeftNode',
        data: {
          label: rt.name,
          category: rt.category,
          department: rt.department,
          capacity: rt.capacity,
          activityCount,
        },
        position: { x: 50, y: index * 120 + 50 },
      };
    });

    // Collect unique activities that use the filtered resource types
    const activityMap = new Map<string, {
      id: string;
      name: string;
      category: string;
      resourceTypeCount: number;
    }>();

    filteredResourceTypes.forEach((rt) => {
      activities.forEach((activity) => {
        const usesResource = activity.resourceTypes.some(
          (assoc) => assoc.resourceTypeId === rt.id
        );
        if (usesResource) {
          if (activityMap.has(activity.id)) {
            const existing = activityMap.get(activity.id)!;
            existing.resourceTypeCount += 1;
          } else {
            activityMap.set(activity.id, {
              id: activity.id,
              name: activity.name,
              category: activity.category,
              resourceTypeCount: 1,
            });
          }
        }
      });
    });

    // Create activity nodes (right side)
    const activityNodes: Node[] = Array.from(activityMap.values()).map(
      (activity, index) => ({
        id: activity.id,
        type: 'activityRightNode',
        data: {
          label: activity.name,
          activityId: activity.id,
          category: activity.category,
          resourceTypeCount: activity.resourceTypeCount,
        },
        position: { x: 600, y: index * 140 + 50 },
      })
    );

    // Create edges from resource types to activities
    const edges: Edge[] = [];
    filteredResourceTypes.forEach((rt) => {
      activities.forEach((activity) => {
        const association = activity.resourceTypes.find(
          (assoc) => assoc.resourceTypeId === rt.id
        );
        if (association) {
          edges.push({
            id: `${rt.id}-${activity.id}`,
            source: rt.id,
            target: activity.id,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: '#9ca3af',
              strokeWidth: 1.5,
            },
            data: {
              resourceTypeName: rt.name,
              activityName: activity.name,
              isRequired: association.isRequired,
              quantity: association.quantity,
            },
          });
        }
      });
    });

    return {
      nodes: [...resourceTypeNodes, ...activityNodes],
      edges,
    };
  }, [activities, resourceTypes, selectedResourceCategories]);
}
