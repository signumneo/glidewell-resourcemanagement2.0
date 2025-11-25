import React, { useState } from 'react';
import { Handle, Position, useStore } from '@xyflow/react';

interface ResourceTypeNodeData {
  label: string;
  category: 'station' | 'personnel' | 'equipment' | 'tool';
  activityCount: number;
}

export const ResourceTypeNode: React.FC<{ data: ResourceTypeNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const zoom = useStore((state) => state.transform[2]);
  
  const isDotView = zoom < 0.4;
  const isMinimal = zoom < 0.6;
  const isDetailed = zoom >= 1.2;

  const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    station: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
    personnel: { bg: '#f0fdf4', border: '#10b981', text: '#065f46' },
    equipment: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    tool: { bg: '#faf5ff', border: '#8b5cf6', text: '#5b21b6' },
  };

  const colors = categoryColors[data.category] || categoryColors.station;

  if (isDotView) {
    return (
      <div 
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Handle type="target" position={Position.Left} className="!w-1 !h-1 !opacity-0" />
        <div 
          className="w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-300"
          style={{
            backgroundColor: colors.border,
            transform: isHovered ? 'scale(1.5)' : 'scale(1)',
            boxShadow: isHovered ? `0 0 20px ${colors.border}80` : '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        {isHovered && (
          <div className="absolute left-6 top-0 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50 pointer-events-none">
            {data.label}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Multiple target handles for spreading connections - top position */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-0"
        className="!w-3 !h-3 !border-2 !border-white transition-all"
        style={{ backgroundColor: colors.border, left: '15%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-1"
        className="!w-3 !h-3 !border-2 !border-white transition-all"
        style={{ backgroundColor: colors.border, left: '25%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-2"
        className="!w-3 !h-3 !border-2 !border-white transition-all"
        style={{ backgroundColor: colors.border, left: '35%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-3"
        className="!w-3 !h-3 !border-2 !border-white transition-all"
        style={{ backgroundColor: colors.border, left: '45%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-4"
        className="!w-3 !h-3 !border-2 !border-white transition-all"
        style={{ backgroundColor: colors.border, left: '55%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-5"
        className="!w-3 !h-3 !border-2 !border-white transition-all"
        style={{ backgroundColor: colors.border, left: '65%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-6"
        className="!w-3 !h-3 !border-2 !border-white transition-all"
        style={{ backgroundColor: colors.border, left: '75%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-7"
        className="!w-3 !h-3 !border-2 !border-white transition-all"
        style={{ backgroundColor: colors.border, left: '85%' }}
      />
      <div 
        className="border-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        style={{ 
          backgroundColor: colors.bg,
          borderColor: colors.border,
          minWidth: isMinimal ? '140px' : '180px',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        <div className={isMinimal ? 'px-3 py-2' : 'px-4 py-3'}>
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.border }}
            />
            <span 
              className={`font-medium uppercase tracking-wide ${isMinimal ? 'text-[10px]' : 'text-xs'}`}
              style={{ color: colors.text }}
            >
              {data.category}
            </span>
          </div>
          <div className={`font-semibold text-gray-900 mb-2 ${isMinimal ? 'text-xs' : 'text-sm'}`}>
            {data.label}
          </div>
          {!isMinimal && (
            <div className="text-xs" style={{ color: colors.text }}>
              {data.activityCount} activit{data.activityCount !== 1 ? 'ies' : 'y'}
            </div>
          )}
          {isDetailed && isHovered && (
            <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: colors.border + '40', color: colors.text }}>
              View details →
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
