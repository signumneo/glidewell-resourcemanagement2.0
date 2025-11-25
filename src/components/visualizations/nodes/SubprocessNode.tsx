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
          className="px-3 py-1.5 rounded border-l-4 bg-white shadow-sm hover:shadow-md transition-all min-w-[140px]"
          style={{ borderLeftColor: color }}
        >
          <div className="flex items-center justify-between gap-2">
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
          className="px-3 py-2 rounded-lg border-2 bg-white shadow-md hover:shadow-lg transition-all min-w-[160px]"
          style={{ borderColor: color }}
        >
          <div className="flex items-center justify-between mb-1.5">
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
          <div className="font-semibold text-xs text-gray-900 mb-1">{data.name}</div>
          <div className="text-xs text-gray-500">{data.resourceCount} resources</div>
        </div>
      ) : (
        /* Full card view - zoomed in */
        <div
          className="px-4 py-3 rounded-lg border-2 bg-white shadow-md hover:shadow-lg transition-all min-w-[200px]"
          style={{ borderColor: color }}
        >
          {/* Header with Activity ID */}
          <div className="flex items-center justify-between mb-2">
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

          {/* Subprocess name */}
          <div className="font-semibold text-sm text-gray-900 mb-1">{data.name}</div>

          {/* Main process label */}
          <div className="text-xs text-gray-500">{data.mainProcessName}</div>

          {/* Resource count badge */}
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span>{data.resourceCount} resources</span>
          </div>
        </div>
      )}
    </div>
  );
};
