import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface SubprocessNodeProps {
  data: {
    id: string;
    name: string;
    description: string;
    duration: number;
    mainProcessName: string;
    mainProcessColor: string;
    resourceCount: number;
    viewLevel?: 'condensed' | 'medium' | 'full';
  };
}

export const SubprocessNode: React.FC<SubprocessNodeProps> = ({ data }) => {
  const color = data.mainProcessColor;
  const detailLevel = data.viewLevel || 'medium';

  return (
    <div className="relative group">
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ backgroundColor: color }}
      />

      {detailLevel === 'condensed' ? (
        /* Condensed line view - minimal card with key stats */
        <div
          className="px-4 py-2.5 rounded border-l-4 bg-white shadow-sm hover:shadow-md transition-all w-[200px]"
          style={{ borderLeftColor: color }}
        >
          <div className="flex items-center justify-between gap-3">
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {data.id}
            </span>
            <span className="text-xs text-gray-600 truncate flex-1">{data.name}</span>
            <span className="text-xs text-gray-500">{data.duration}m</span>
          </div>
        </div>
      ) : detailLevel === 'medium' ? (
        /* Medium detail - more info but compact */
        <div
          className="px-4 py-3 rounded-lg border-2 bg-white shadow-md hover:shadow-lg transition-all w-[200px]"
          style={{ borderColor: color }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {data.id}
            </span>
            <span className="text-xs text-gray-500">{data.duration}min</span>
          </div>
          <div className="font-semibold text-xs text-gray-900 mb-2">{data.name}</div>
          <div className="text-xs text-gray-500">{data.resourceCount} resources</div>
        </div>
      ) : (
        /* Full card view - zoomed in with more details */
        <div
          className="px-5 py-4 rounded-lg border-2 bg-white shadow-md hover:shadow-lg transition-all w-[220px]"
          style={{ borderColor: color }}
        >
          {/* Header with Activity ID */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {data.id}
            </span>
            <span className="text-xs font-semibold text-gray-700">{data.duration}min</span>
          </div>

          {/* Subprocess name */}
          <div className="font-semibold text-sm text-gray-900 mb-3">{data.name}</div>

          {/* Resource count badge */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Inventory:</span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {data.resourceCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
