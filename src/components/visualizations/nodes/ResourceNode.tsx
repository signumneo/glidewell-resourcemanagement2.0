import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface ResourceNodeProps {
  data: {
    id: string;
    name: string;
    category: string;
    type: 'equipment' | 'personnel' | 'facility';
    quantity: number;
    usageCount: number;
    viewLevel?: 'condensed' | 'medium' | 'full';
  };
}

export const ResourceNode: React.FC<ResourceNodeProps> = ({ data }) => {
  const detailLevel = data.viewLevel || 'medium';
  
  const getTypeIcon = () => {
    switch (data.type) {
      case 'equipment':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'personnel':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'facility':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

  const getCategoryColor = () => {
    switch (data.type) {
      case 'equipment':
        return '#3b82f6';
      case 'personnel':
        return '#10b981';
      case 'facility':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const color = getCategoryColor();

  return (
    <div className="relative group">
      {/* Connection handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ backgroundColor: color }}
      />

      {detailLevel === 'condensed' ? (
        /* Condensed line view - minimal card with key stats */
        <div
          className="px-3 py-1.5 rounded border-l-4 bg-white shadow-sm hover:shadow-md transition-all min-w-[120px]"
          style={{ borderLeftColor: color }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-900 truncate">{data.name}</span>
            <span className="text-xs text-gray-500">×{data.quantity}</span>
          </div>
        </div>
      ) : detailLevel === 'medium' ? (
        /* Medium detail - more info but compact */
        <div
          className="px-3 py-2 rounded-lg border-2 bg-white shadow-md hover:shadow-lg transition-all min-w-[140px]"
          style={{ borderColor: color }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="p-1 rounded"
              style={{ backgroundColor: `${color}20`, color: color }}
            >
              {getTypeIcon()}
            </div>
            <span className="text-xs font-medium text-gray-500 capitalize">
              {data.type}
            </span>
          </div>
          <div className="font-semibold text-xs text-gray-900 mb-1">{data.name}</div>
          <div className="text-xs text-gray-600">Qty: {data.quantity}</div>
        </div>
      ) : (
        /* Full card view - zoomed in */
        <div
          className="px-4 py-3 rounded-lg border-2 bg-white shadow-md hover:shadow-lg transition-all min-w-[180px]"
          style={{ borderColor: color }}
        >
        {/* Resource type icon */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="p-1.5 rounded"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            {getTypeIcon()}
          </div>
          <span className="text-xs font-medium text-gray-500 capitalize">
            {data.type}
          </span>
        </div>

        {/* Resource name */}
        <div className="font-semibold text-sm text-gray-900 mb-2">{data.name}</div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Qty: {data.quantity}</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded font-medium">
            {data.usageCount} uses
          </span>
        </div>
        </div>
      )}
    </div>
  );
};
