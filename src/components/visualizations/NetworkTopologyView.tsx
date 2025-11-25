import React, { useState, useMemo } from 'react';
import { Network, Info } from 'lucide-react';

interface ResourceNode {
  id: string;
  name: string;
  x: number;
  y: number;
  category: string;
  color: string;
}

interface ProductPath {
  id: string;
  name: string;
  color: string;
  steps: Array<{
    from: string;
    to: string;
    activityId: string;
    activityName: string;
  }>;
}

export const NetworkTopologyView: React.FC = () => {
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);

  // Define key resource nodes (positioned centrally)
  const resourceNodes: ResourceNode[] = useMemo(() => [
    { id: 'cnc', name: 'CNC Mill Station', x: 400, y: 300, category: 'station', color: '#3b82f6' },
    { id: 'oven', name: 'Heat Treatment Oven', x: 600, y: 150, category: 'equipment', color: '#f59e0b' },
    { id: 'paint', name: 'Paint Booth', x: 750, y: 300, category: 'station', color: '#8b5cf6' },
    { id: 'assembly', name: 'Assembly Bench', x: 600, y: 450, category: 'station', color: '#10b981' },
    { id: 'qa', name: 'QA Station', x: 850, y: 450, category: 'station', color: '#ef4444' },
    { id: 'polish', name: 'Polishing Station', x: 250, y: 450, category: 'station', color: '#06b6d4' },
  ], []);

  // Define product paths through the network
  const productPaths: ProductPath[] = useMemo(() => [
    {
      id: 'part-x',
      name: 'Part X',
      color: '#ef4444',
      steps: [
        { from: 'start-x', to: 'cnc', activityId: 'GA-002', activityName: 'CNC Machining' },
        { from: 'cnc', to: 'oven', activityId: 'GA-007', activityName: 'Heat Treatment' },
        { from: 'oven', to: 'paint', activityId: 'GA-008', activityName: 'Surface Coating' },
        { from: 'paint', to: 'qa', activityId: 'GA-004', activityName: 'Quality Inspection' },
      ],
    },
    {
      id: 'part-y',
      name: 'Part Y',
      color: '#10b981',
      steps: [
        { from: 'start-y', to: 'cnc', activityId: 'GA-002', activityName: 'CNC Machining' },
        { from: 'cnc', to: 'polish', activityId: 'GA-006', activityName: 'Polishing' },
        { from: 'polish', to: 'assembly', activityId: 'GA-009', activityName: 'Component Assembly' },
        { from: 'assembly', to: 'qa', activityId: 'GA-004', activityName: 'Quality Inspection' },
      ],
    },
    {
      id: 'part-z',
      name: 'Part Z',
      color: '#3b82f6',
      steps: [
        { from: 'start-z', to: 'cnc', activityId: 'GA-002', activityName: 'CNC Machining' },
        { from: 'cnc', to: 'assembly', activityId: 'GA-009', activityName: 'Component Assembly' },
        { from: 'assembly', to: 'paint', activityId: 'GA-008', activityName: 'Surface Coating' },
        { from: 'paint', to: 'qa', activityId: 'GA-004', activityName: 'Quality Inspection' },
      ],
    },
  ], []);

  // Starting positions for each product path
  const startPositions: Record<string, { x: number; y: number }> = {
    'start-x': { x: 100, y: 150 },
    'start-y': { x: 100, y: 300 },
    'start-z': { x: 100, y: 450 },
  };

  // Get position for a node (resource or start point)
  const getNodePosition = (nodeId: string): { x: number; y: number } => {
    const resource = resourceNodes.find(r => r.id === nodeId);
    if (resource) return { x: resource.x, y: resource.y };
    return startPositions[nodeId] || { x: 0, y: 0 };
  };

  // Generate curved path between two points
  const generateCurvePath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    offset: number = 0
  ): string => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Control points for bezier curve
    const cp1x = x1 + dx * 0.5 + offset * 30;
    const cp1y = y1 + dy * 0.3 + offset * 20;
    const cp2x = x1 + dx * 0.7 + offset * 30;
    const cp2y = y1 + dy * 0.7 + offset * 20;

    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  };

  // Check if a path is connected to hovered resource
  const isPathConnected = (path: ProductPath, resourceId: string): boolean => {
    if (!hoveredResource) return true;
    return path.steps.some(step => step.from === resourceId || step.to === resourceId);
  };

  // Calculate if resource is a hub (multiple paths converge)
  const getResourceConnectionCount = (resourceId: string): number => {
    return productPaths.filter(path =>
      path.steps.some(step => step.to === resourceId || step.from === resourceId)
    ).length;
  };

  return (
    <div className="h-full w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Network Topology View</h3>
              <p className="text-sm text-gray-500">Product flows through shared manufacturing resources</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {productPaths.map(path => (
              <div key={path.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-1 rounded"
                  style={{ backgroundColor: path.color }}
                />
                <span className="text-gray-700">{path.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-full">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 600"
          className="w-full h-full"
          style={{ minHeight: '600px' }}
        >
          {/* Background dimming when hovering */}
          {hoveredResource && (
            <rect
              x="0"
              y="0"
              width="1000"
              height="600"
              fill="rgba(0, 0, 0, 0.05)"
            />
          )}

          {/* Render Product Paths */}
          {productPaths.map((path, pathIndex) => {
            const isConnected = isPathConnected(path, hoveredResource || '');
            const opacity = hoveredResource && !isConnected ? 0.15 : 1;

            return (
              <g key={path.id}>
                {path.steps.map((step, stepIndex) => {
                  const fromPos = getNodePosition(step.from);
                  const toPos = getNodePosition(step.to);
                  
                  // Add slight offset for multiple paths to same resource
                  const offset = pathIndex - 1;
                  const pathData = generateCurvePath(
                    fromPos.x,
                    fromPos.y,
                    toPos.x,
                    toPos.y,
                    offset
                  );

                  // Calculate midpoint for activity label
                  const midX = (fromPos.x + toPos.x) / 2 + offset * 30;
                  const midY = (fromPos.y + toPos.y) / 2 + offset * 20;

                  return (
                    <g key={`${path.id}-${stepIndex}`}>
                      {/* Path line */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke={path.color}
                        strokeWidth={isConnected && hoveredResource ? 4 : 3}
                        strokeOpacity={opacity}
                        strokeLinecap="round"
                        style={{
                          transition: 'all 0.3s ease',
                          filter: isConnected && hoveredResource ? 'drop-shadow(0 0 4px currentColor)' : 'none',
                        }}
                      />

                      {/* Arrow marker */}
                      <path
                        d={`M ${toPos.x - 10} ${toPos.y - 5} L ${toPos.x} ${toPos.y} L ${toPos.x - 10} ${toPos.y + 5}`}
                        fill="none"
                        stroke={path.color}
                        strokeWidth={2}
                        strokeOpacity={opacity}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Activity ID label on path */}
                      {(!hoveredResource || isConnected) && (
                        <g>
                          <rect
                            x={midX - 30}
                            y={midY - 12}
                            width={60}
                            height={24}
                            rx={4}
                            fill="white"
                            stroke={path.color}
                            strokeWidth={2}
                            opacity={opacity}
                          />
                          <text
                            x={midX}
                            y={midY + 5}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill={path.color}
                            opacity={opacity}
                          >
                            {step.activityId}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Start point */}
                <circle
                  cx={startPositions[`start-${path.id.split('-')[1]}`].x}
                  cy={startPositions[`start-${path.id.split('-')[1]}`].y}
                  r={8}
                  fill={path.color}
                  opacity={opacity}
                />
              </g>
            );
          })}

          {/* Render Resource Nodes */}
          {resourceNodes.map((node) => {
            const connectionCount = getResourceConnectionCount(node.id);
            const isHub = connectionCount >= 3;
            const isHovered = hoveredResource === node.id;
            const isConnectedToHovered = hoveredResource
              ? productPaths.some(path =>
                  path.steps.some(step =>
                    (step.from === hoveredResource && step.to === node.id) ||
                    (step.to === hoveredResource && step.from === node.id)
                  )
                )
              : false;

            const nodeOpacity = hoveredResource && !isHovered && !isConnectedToHovered ? 0.3 : 1;
            const nodeSize = isHub ? 65 : 55;

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredResource(node.id)}
                onMouseLeave={() => setHoveredResource(null)}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                {/* Hub glow effect */}
                {isHub && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize + 8}
                    fill={node.color}
                    opacity={isHovered ? 0.3 : 0.15}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize / 2}
                  fill="white"
                  stroke={node.color}
                  strokeWidth={isHovered ? 4 : 3}
                  opacity={nodeOpacity}
                  style={{
                    transition: 'all 0.3s ease',
                    filter: isHovered ? `drop-shadow(0 0 12px ${node.color})` : 'none',
                  }}
                />

                {/* Hub indicator */}
                {isHub && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize / 2 - 6}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    opacity={nodeOpacity * 0.6}
                  />
                )}

                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + nodeSize / 2 + 20}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#374151"
                  opacity={nodeOpacity}
                >
                  {node.name}
                </text>

                {/* Connection count badge */}
                <g>
                  <circle
                    cx={node.x + nodeSize / 2 - 8}
                    cy={node.y - nodeSize / 2 + 8}
                    r={12}
                    fill={node.color}
                    opacity={nodeOpacity}
                  />
                  <text
                    x={node.x + nodeSize / 2 - 8}
                    y={node.y - nodeSize / 2 + 12}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="white"
                    opacity={nodeOpacity}
                  >
                    {connectionCount}
                  </text>
                </g>

                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={node.x + nodeSize / 2 + 15}
                      y={node.y - 35}
                      width={180}
                      height={70}
                      rx={6}
                      fill="white"
                      stroke={node.color}
                      strokeWidth={2}
                      filter="drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                    />
                    <text
                      x={node.x + nodeSize / 2 + 25}
                      y={node.y - 15}
                      fontSize="12"
                      fontWeight="600"
                      fill="#374151"
                    >
                      {node.name}
                    </text>
                    <text
                      x={node.x + nodeSize / 2 + 25}
                      y={node.y + 2}
                      fontSize="11"
                      fill="#6b7280"
                    >
                      Category: {node.category}
                    </text>
                    <text
                      x={node.x + nodeSize / 2 + 25}
                      y={node.y + 18}
                      fontSize="11"
                      fill="#6b7280"
                    >
                      Used by {connectionCount} product{connectionCount !== 1 ? 's' : ''}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">Legend</span>
          </div>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-3 border-blue-500 bg-white" />
              <span>Resource Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-3 border-purple-500 bg-white relative">
                <div className="absolute inset-1 rounded-full border border-purple-500 border-dashed" />
              </div>
              <span>Hub (3+ products)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-red-500 rounded" />
              <span>Product flow path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="border-2 border-blue-500 rounded px-2 py-0.5 text-blue-600 font-semibold">
                GA-XXX
              </div>
              <span>Activity ID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
