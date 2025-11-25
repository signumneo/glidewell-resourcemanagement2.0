import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface CompatibilityData {
  activity: string;
  resource: string;
  compatible: boolean;
  efficiency?: number;
}

interface CompatibilityMatrixProps {
  data: CompatibilityData[];
  width?: number;
  height?: number;
}

export const CompatibilityMatrix = ({
  data,
  width = 800,
  height = 600,
}: CompatibilityMatrixProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 100, right: 100, bottom: 60, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const activities = Array.from(new Set(data.map(d => d.activity)));
    const resources = Array.from(new Set(data.map(d => d.resource)));

    const xScale = d3.scaleBand()
      .domain(resources)
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(activities)
      .range([0, innerHeight])
      .padding(0.05);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', '600')
      .attr('fill', '#212529')
      .text('Activity-Resource Compatibility Matrix');

    // Draw cells
    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => xScale(d.resource) || 0)
      .attr('y', d => yScale(d.activity) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.compatible ? '#495057' : '#f8f9fa')
      .attr('stroke', '#e9ecef')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#495057')
          .attr('stroke-width', 2);

        // Tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip');

        tooltip.append('rect')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 60)
          .attr('width', 180)
          .attr('height', 50)
          .attr('fill', '#212529')
          .attr('rx', 8)
          .attr('opacity', 0.95);

        tooltip.append('text')
          .attr('x', (event.pageX % width) + 90)
          .attr('y', (event.pageY % height) - 40)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .text(`${d.activity} → ${d.resource}`);

        tooltip.append('text')
          .attr('x', (event.pageX % width) + 90)
          .attr('y', (event.pageY % height) - 25)
          .attr('text-anchor', 'middle')
          .attr('fill', d.compatible ? '#10b981' : '#ef4444')
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .text(d.compatible ? `✓ Compatible (${d.efficiency || 100}%)` : '✗ Not Compatible');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#e9ecef')
          .attr('stroke-width', 1);
        svg.selectAll('.tooltip').remove();
      });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('font-size', '11px')
      .attr('fill', '#6c757d');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('fill', '#6c757d');

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#495057')
      .text('Resources');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#495057')
      .text('Activities');

  }, [data, width, height]);

  return (
    <svg
      ref={svgRef}
      className="border border-gray-200 rounded-lg bg-white"
      style={{ borderColor: '#e9ecef' }}
    />
  );
};
