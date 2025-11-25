import React, { useState } from 'react';
import { Handle, Position, useStore } from '@xyflow/react';

interface ActivityRightNodeData {
  label: string;
  activityId: string;
  category: string;
  resourceTypeCount: number;
}

export const ActivityRightNode: React.FC<{ data: ActivityRightNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const zoom = useStore((state) => state.transform[2]);
  
  const isDotView = zoom < 0.4;
  const isMinimal = zoom < 0.6;
  const isDetailed = zoom >= 1.2;

  const categoryColors: Record<string, string> = {
    design: '#3b82f6',
    manufacturing: '#10b981',
    quality: '#f59e0b',
    finishing: '#8b5cf6',
    assembly: '#ec4899',
    packaging: '#06b6d4',
  };

  const categoryColor = categoryColors[data.category] || '#6b7280';

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
            backgroundColor: categoryColor,
            transform: isHovered ? 'scale(1.5)' : 'scale(1)',
            boxShadow: isHovered ? `0 0 20px ${categoryColor}80` : '0 2px 4px rgba(0,0,0,0.1)'
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
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-white transition-all"
        style={{ backgroundColor: categoryColor }}
      />
      <div 
        className="bg-white border-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        style={{ 
          borderColor: categoryColor,
          minWidth: isMinimal ? '140px' : '180px',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        <div className={isMinimal ? 'px-3 py-2' : 'px-4 py-3'}>
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: categoryColor }}
            />
            <span className={`font-medium text-gray-500 uppercase tracking-wide ${isMinimal ? 'text-[10px]' : 'text-xs'}`}>
              {data.category}
            </span>
          </div>
          <div className={`font-semibold text-gray-900 mb-2 ${isMinimal ? 'text-xs' : 'text-sm'}`}>
            {data.label}
          </div>
          {!isMinimal && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-gray-500">{data.activityId}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {data.resourceTypeCount} resource{data.resourceTypeCount !== 1 ? 's' : ''}
              </div>
            </>
          )}
          {isDetailed && isHovered && (
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
              View details →
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
