import { memo, useState } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export const CustomEdge = memo((props: EdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd } = props;
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const volume = (data as any)?.volume || 0;
  const efficiency = (data as any)?.efficiency || 0;
  
  // Minimal stroke width - slightly thicker
  const strokeWidth = isHovered ? 2.5 : 1.5;
  
  // Minimal neutral colors
  const getStrokeColor = () => {
    if (isHovered) return '#6B7280'; // Dark gray on hover
    return '#D1D5DB'; // Light gray default
  };

  return (
    <>
      {/* Main edge path - minimal */}
      <BaseEdge
        id={id as string}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth,
          stroke: getStrokeColor(),
          transition: 'all 0.2s ease',
        }}
      />
      
      {/* Invisible wider path for easier hover */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'default' }}
      />

      {/* Minimal animated indicator on hover */}
      {isHovered && (
        <g>
          <circle r="3" fill="#6B7280" opacity="0.6">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
        </g>
      )}

      {/* Minimal edge label */}
      {isHovered && volume > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
          >
            <div className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200 text-xs text-gray-600">
              {volume.toLocaleString()}
              {efficiency > 0 && ` · ${efficiency}%`}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
