import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ActivityFlowNode {
  id: string;
  name: string;
  duration: number; // in minutes
  type: 'start' | 'activity' | 'end';
}

interface ActivityFlowLink {
  source: string;
  target: string;
  frequency: number;
  avgDuration?: number;
}

interface ActivityFlowDiagramProps {
  nodes: ActivityFlowNode[];
  links: ActivityFlowLink[];
  width?: number;
  height?: number;
}

export const ActivityFlowDiagram = ({
  nodes,
  links,
  width = 900,
  height = 600,
}: ActivityFlowDiagramProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 60, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', '600')
      .attr('fill', '#212529')
      .text('Activity Flow Diagram');

    // Color mapping
    const nodeColors: Record<string, string> = {
      start: '#10b981',
      activity: '#495057',
      end: '#ef4444',
    };

    // Create simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links as any)
        .id((d: any) => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Arrow markers for links
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 38)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#adb5bd');

    // Draw links
    const link = g.selectAll('.link')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', '#adb5bd')
      .attr('stroke-width', (d: ActivityFlowLink) => Math.sqrt(d.frequency))
      .attr('marker-end', 'url(#arrowhead)')
      .attr('opacity', 0.6);

    // Draw nodes
    const node = g.selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append('rect')
      .attr('width', 70)
      .attr('height', 50)
      .attr('x', -35)
      .attr('y', -25)
      .attr('fill', (d: ActivityFlowNode) => nodeColors[d.type])
      .attr('stroke', '#dee2e6')
      .attr('stroke-width', 2)
      .attr('rx', 8)
      .on('mouseover', function(event, d: ActivityFlowNode) {
        d3.select(this)
          .attr('stroke', '#495057')
          .attr('stroke-width', 3);

        // Tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip');

        tooltip.append('rect')
          .attr('x', (event.pageX % width) - 80)
          .attr('y', (event.pageY % height) - 80)
          .attr('width', 160)
          .attr('height', 60)
          .attr('fill', '#212529')
          .attr('rx', 8)
          .attr('opacity', 0.95);

        tooltip.append('text')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 60)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text(d.name);

        tooltip.append('text')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 43)
          .attr('text-anchor', 'middle')
          .attr('fill', '#adb5bd')
          .attr('font-size', '10px')
          .text(`Duration: ${d.duration} min`);

        tooltip.append('text')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 30)
          .attr('text-anchor', 'middle')
          .attr('fill', '#adb5bd')
          .attr('font-size', '10px')
          .text(`Type: ${d.type}`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#dee2e6')
          .attr('stroke-width', 2);
        svg.selectAll('.tooltip').remove();
      });

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', 'white')
      .text((d: ActivityFlowNode) => {
        const maxLength = 10;
        return d.name.length > maxLength ? d.name.substring(0, maxLength) + '...' : d.name;
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 150}, ${height - 80})`);

    const legendData = [
      { type: 'start', label: 'Start', color: '#10b981' },
      { type: 'activity', label: 'Activity', color: '#495057' },
      { type: 'end', label: 'End', color: '#ef4444' },
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 22})`);

      legendRow.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('rx', 3)
        .attr('fill', item.color)
        .attr('stroke', '#dee2e6');

      legendRow.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .attr('font-size', '11px')
        .attr('fill', '#495057')
        .text(item.label);
    });

  }, [nodes, links, width, height]);

  return (
    <svg
      ref={svgRef}
      className="border border-gray-200 rounded-lg bg-white"
      style={{ borderColor: '#e9ecef' }}
    />
  );
};
