import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ResourceUtilization {
  resourceId: string;
  resourceName: string;
  utilization: number; // 0-100
  capacity: number;
  activeJobs: number;
}

interface ResourceUtilizationChartProps {
  data: ResourceUtilization[];
  width?: number;
  height?: number;
}

export const ResourceUtilizationChart = ({
  data,
  width = 800,
  height = 500,
}: ResourceUtilizationChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 60, right: 40, bottom: 80, left: 120 };
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
      .text('Resource Utilization Overview');

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.resourceName))
      .range([0, innerHeight])
      .padding(0.3);

    // Color scale
    const colorScale = d3.scaleThreshold<number, string>()
      .domain([50, 75, 90])
      .range(['#adb5bd', '#6c757d', '#495057', '#212529']);

    // Draw bars
    g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.resourceName) || 0)
      .attr('width', d => xScale(d.utilization))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.utilization))
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.8);

        // Tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip');

        tooltip.append('rect')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 80)
          .attr('width', 200)
          .attr('height', 70)
          .attr('fill', '#212529')
          .attr('rx', 8)
          .attr('opacity', 0.95);

        tooltip.append('text')
          .attr('x', (event.pageX % width) + 100)
          .attr('y', (event.pageY % height) - 60)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text(d.resourceName);

        tooltip.append('text')
          .attr('x', (event.pageX % width) + 100)
          .attr('y', (event.pageY % height) - 43)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '11px')
          .text(`Utilization: ${d.utilization}%`);

        tooltip.append('text')
          .attr('x', (event.pageX % width) + 100)
          .attr('y', (event.pageY % height) - 28)
          .attr('text-anchor', 'middle')
          .attr('fill', '#adb5bd')
          .attr('font-size', '10px')
          .text(`Capacity: ${d.capacity} | Active: ${d.activeJobs}`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        svg.selectAll('.tooltip').remove();
      });

    // Draw percentage labels
    g.selectAll('.label')
      .data(data)
      .join('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.utilization) + 8)
      .attr('y', d => (yScale(d.resourceName) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#495057')
      .text(d => `${d.utilization}%`);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d => `${d}%`))
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', '#6c757d');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('fill', '#495057')
      .attr('font-weight', '500');

    // Reference lines
    const refLines = [50, 75, 90];
    refLines.forEach(value => {
      g.append('line')
        .attr('x1', xScale(value))
        .attr('x2', xScale(value))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#dee2e6')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.5);
    });

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#495057')
      .text('Utilization (%)');

  }, [data, width, height]);

  return (
    <svg
      ref={svgRef}
      className="border border-gray-200 rounded-lg bg-white"
      style={{ borderColor: '#e9ecef' }}
    />
  );
};
