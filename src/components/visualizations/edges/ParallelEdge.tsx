import React from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

/**
 * Custom edge that renders parallel lines for shared connections
 * Uses offset rendering to show multiple flows between the same nodes
 */
export const ParallelEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) => {
  const GAP = 12; // Pixels between parallel lines
  
  // Get offset data from edge data (with type assertions)
  const offsetIndex = (data?.offsetIndex as number) ?? 0;
  const totalParallel = (data?.totalParallel as number) ?? 1;
  
  // Calculate offset from center line
  const centerOffset = ((totalParallel - 1) * GAP) / 2;
  const currentOffset = (offsetIndex * GAP) - centerOffset;
  
  // Apply offset perpendicular to the flow direction
  // For vertical flow (top->bottom), offset X coordinates
  // For horizontal flow (left->right), offset Y coordinates
  const isVertical = Math.abs(targetY - sourceY) > Math.abs(targetX - sourceX);
  
  let offsetSourceX = sourceX;
  let offsetSourceY = sourceY;
  let offsetTargetX = targetX;
  let offsetTargetY = targetY;
  
  if (isVertical) {
    // Vertical flow - offset horizontally
    offsetSourceX += currentOffset;
    offsetTargetX += currentOffset;
  } else {
    // Horizontal flow - offset vertically
    offsetSourceY += currentOffset;
    offsetTargetY += currentOffset;
  }
  
  // Use getBezierPath for smooth curves with the offset coordinates
  const [edgePath] = getBezierPath({
    sourceX: offsetSourceX,
    sourceY: offsetSourceY,
    sourcePosition,
    targetX: offsetTargetX,
    targetY: offsetTargetY,
    targetPosition,
  });
  
  return (
    <BaseEdge 
      id={id} 
      path={edgePath}
      style={style}
    />
  );
};

export default ParallelEdge;
