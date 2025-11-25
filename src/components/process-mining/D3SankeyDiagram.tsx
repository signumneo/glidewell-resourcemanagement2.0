import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

interface ProcessStep {
  name: string;
  count: number;
}

interface ProcessFlow {
  source: number;
  target: number;
  value: number;
}

interface D3SankeyProps {
  nodes: ProcessStep[];
  links: ProcessFlow[];
  width?: number;
  height?: number;
}

export const D3SankeyDiagram = ({
  nodes,
  links,
  width = 1200,
  height = 600,
}: D3SankeyProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const sankeyGenerator = sankey<ProcessStep, ProcessFlow>()
      .nodeWidth(20)
      .nodePadding(20)
      .extent([[50, 50], [width - 50, height - 50]]);

    const {nodes: sankeyNodes, links: sankeyLinks} = sankeyGenerator({
      nodes: nodes.map(d => ({...d})),
      links: links.map(d => ({...d})),
    });

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw links
    svg.append('g')
      .selectAll('path')
      .data(sankeyLinks)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d: any) => {
        const sourceNode = d.source;
        return color(sourceNode.name || '');
      })
      .attr('stroke-width', (d: any) => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.5);
      })
      .append('title')
      .text((d: any) => {
        const sourceNode = d.source;
        const targetNode = d.target;
        return `${sourceNode.name} → ${targetNode.name}\n${d.value} cases`;
      });

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(sankeyNodes)
      .join('g');

    node.append('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('fill', (d: any) => color(d.name || ''))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .append('title')
      .text((d: any) => `${d.name}\n${d.value} cases`);

    // Add labels
    node.append('text')
      .attr('x', (d: any) => (d.x0 + d.x1) / 2)
      .attr('y', (d: any) => d.y0 - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text((d: any) => d.name);

    node.append('text')
      .attr('x', (d: any) => (d.x0 + d.x1) / 2)
      .attr('y', (d: any) => (d.y0 + d.y1) / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#fff')
      .text((d: any) => d.value);

  }, [nodes, links, width, height]);

  return (
    <svg
      ref={svgRef}
      className="border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white shadow-sm"
    />
  );
};
