import { memo, useState } from 'react';
import { Handle, Position, useStore } from '@xyflow/react';
import { Zap, TrendingUp, Clock, Users, BarChart3, Activity } from 'lucide-react';

export interface ActivityNodeData {
  label: string;
  count?: number;
  duration?: number;
  status?: string;
}

export const ActivityNode = memo(({ data }: { data: ActivityNodeData }) => {
  const [isHovered, setIsHovered] = useState(false);
  const zoom = useStore((state) => state.transform[2]);
  
  // Multi-level detail system based on zoom
  const isDotView = zoom < 0.4;      // Ultra zoomed out - just dots
  const isMinimal = zoom < 0.6;      // Minimal - small cards
  const isStandard = zoom < 1.2;     // Standard view
  const isDetailed = zoom >= 1.2;    // Full details
  
  // Dot view for extreme zoom out
  if (isDotView) {
    return (
      <div 
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ transition: 'all 0.3s ease' }}
      >
        {/* Simple dot with glow */}
        <div 
          className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg transition-all duration-300"
          style={{
            transform: isHovered ? 'scale(1.5)' : 'scale(1)',
            boxShadow: isHovered ? '0 0 20px rgba(59, 130, 246, 0.6)' : '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        {/* Tooltip on hover */}
        {isHovered && (
          <div className="absolute left-6 top-0 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in duration-150">
            {data.label}
            {data.count && ` • ${data.count.toLocaleString()}`}
          </div>
        )}
        <Handle type="source" position={Position.Right} className="!w-1 !h-1 !bg-blue-500 !border-0 !opacity-0" />
        <Handle type="target" position={Position.Left} className="!w-1 !h-1 !bg-blue-500 !border-0 !opacity-0" />
      </div>
    );
  }
  
  return (
    <div 
      className="relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Status indicator with pulse */}
      {data.status && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${
            data.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
          } ${data.status === 'active' && isHovered ? 'animate-pulse' : ''}`} />
          {isDetailed && (
            <span className="text-xs font-medium text-gray-600 capitalize">{data.status}</span>
          )}
        </div>
      )}
      
      {/* Left accent with gradient */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-l-xl" />
      
      {/* Content */}
      <div className={`px-5 py-4 pl-6 ${isMinimal ? 'py-3' : ''}`}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon with animation */}
          <div className={`flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center transition-all duration-300 ${
            isMinimal ? 'w-8 h-8' : 'w-10 h-10'
          } ${isHovered ? 'bg-blue-100' : ''}`}>
            <Zap className={`text-blue-600 transition-all duration-300 ${
              isMinimal ? 'w-4 h-4' : 'w-5 h-5'
            } ${isHovered ? 'scale-110' : ''}`} />
          </div>
          
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-gray-900 truncate transition-all ${
              isMinimal ? 'text-xs' : 'text-sm'
            }`}>
              {data.label}
            </h3>
            {!isMinimal && (
              <p className="text-xs text-gray-500 mt-0.5">Activity</p>
            )}
          </div>
        </div>
        
        {/* Metrics - only show if not too zoomed out */}
        {!isMinimal && (data.count || data.duration) && (
          <div className="space-y-2">
            {/* Primary metrics */}
            <div className="flex items-center gap-4 text-xs">
              {data.count && (
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold text-gray-900">{data.count.toLocaleString()}</span>
                  <span className="text-gray-500">cases</span>
                </div>
              )}
              {data.duration && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-semibold text-gray-900">{data.duration}m</span>
                </div>
              )}
            </div>
            
            {/* Additional stats on hover or high zoom */}
            {(isHovered || isDetailed) && (
              <div className="pt-2 border-t border-gray-100 flex items-center gap-4 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="font-medium text-gray-700">+12%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-purple-500" />
                  <span className="font-medium text-gray-700">5 resources</span>
                </div>
                {isDetailed && (
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-orange-500" />
                    <span className="font-medium text-gray-700">98% uptime</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Handles with hover effect */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:w-4 hover:h-4 hover:bg-blue-600"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:w-4 hover:h-4 hover:bg-blue-600"
      />
    </div>
  );
});

ActivityNode.displayName = 'ActivityNode';
