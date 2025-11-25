import React, { useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ResourceTypeLeftNode } from './nodes/ResourceTypeLeftNode';
import { ActivityRightNode } from './nodes/ActivityRightNode';
import { useResourceTypeViewGraph } from '../../hooks/useResourceTypeViewGraph';
import { globalActivities, resourceTypes } from '../../data/globalActivityData';
import { FilterPanel } from '../ui/FilterPanel';

const nodeTypes = {
  resourceTypeLeftNode: ResourceTypeLeftNode,
  activityRightNode: ActivityRightNode,
};

const ResourceTypeViewGraph: React.FC = () => {
  const resourceCategories = ['station', 'personnel', 'equipment', 'tool'];

  const [selectedResourceCategories, setSelectedResourceCategories] = useState<string[]>(
    resourceCategories
  );

  const { nodes, edges } = useResourceTypeViewGraph(
    globalActivities,
    resourceTypes,
    selectedResourceCategories
  );

  const handleCategoryToggle = (category: string) => {
    setSelectedResourceCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    setSelectedResourceCategories(resourceCategories);
  };

  const handleSelectNone = () => {
    setSelectedResourceCategories([]);
  };

  return (
    <div className="w-full h-full relative bg-gray-50">
      {/* Filter Panel */}
      <div className="absolute top-4 left-4 z-10 w-64">
        <FilterPanel
          title="Resource Type Filters"
          filters={resourceCategories}
          selectedFilters={selectedResourceCategories}
          onFilterToggle={handleCategoryToggle}
          onSelectAll={handleSelectAll}
          onSelectNone={handleSelectNone}
          formatLabel={(filter) => filter.charAt(0).toUpperCase() + filter.slice(1)}
        />
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md border border-gray-200 p-4 max-w-xs">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">View: Resource Types → Activities</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm border-2 border-gray-400 bg-blue-50" />
            <span className="text-gray-700">Resource Type (left)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm border-2 border-blue-500 bg-white" />
            <span className="text-gray-700">Activity (right)</span>
          </div>
        </div>
      </div>

      {/* React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'activityRightNode') return '#3b82f6';
            return '#9ca3af';
          }}
          maskColor="rgba(0, 0, 0, 0.05)"
        />
      </ReactFlow>
    </div>
  );
};

export const ResourceTypeViewGraphWrapper: React.FC = () => (
  <ReactFlowProvider>
    <ResourceTypeViewGraph />
  </ReactFlowProvider>
);

export default ResourceTypeViewGraphWrapper;
