import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Bottleneck {
  resourceId: string;
  resourceName: string;
  activityId: string;
  activityName: string;
  delayMinutes: number;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface BottleneckAnalysisProps {
  data: Bottleneck[];
  width?: number;
  height?: number;
}

export const BottleneckAnalysis = ({
  data,
  width = 800,
  height = 600,
}: BottleneckAnalysisProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 60, right: 200, bottom: 80, left: 80 };
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
      .text('Bottleneck Analysis');

    // Severity colors
    const severityColors: Record<string, string> = {
      low: '#adb5bd',
      medium: '#6c757d',
      high: '#495057',
      critical: '#212529',
    };

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.delayMinutes) || 100])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency) || 50])
      .range([innerHeight, 0])
      .nice();

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.delayMinutes * d.frequency) || 1000])
      .range([5, 40]);

    // Draw bubbles
    g.selectAll('.bubble')
      .data(data)
      .join('circle')
      .attr('class', 'bubble')
      .attr('cx', d => xScale(d.delayMinutes))
      .attr('cy', d => yScale(d.frequency))
      .attr('r', d => sizeScale(d.delayMinutes * d.frequency))
      .attr('fill', d => severityColors[d.severity])
      .attr('stroke', '#e9ecef')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#495057')
          .attr('stroke-width', 3)
          .attr('opacity', 1);

        // Tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip');

        tooltip.append('rect')
          .attr('x', (event.pageX % width) - 100)
          .attr('y', (event.pageY % height) - 100)
          .attr('width', 200)
          .attr('height', 90)
          .attr('fill', '#212529')
          .attr('rx', 8)
          .attr('opacity', 0.95);

        tooltip.append('text')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 80)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text(d.activityName);

        tooltip.append('text')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 62)
          .attr('text-anchor', 'middle')
          .attr('fill', '#adb5bd')
          .attr('font-size', '10px')
          .text(`Resource: ${d.resourceName}`);

        tooltip.append('text')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 47)
          .attr('text-anchor', 'middle')
          .attr('fill', '#adb5bd')
          .attr('font-size', '10px')
          .text(`Delay: ${d.delayMinutes} min`);

        tooltip.append('text')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 32)
          .attr('text-anchor', 'middle')
          .attr('fill', '#adb5bd')
          .attr('font-size', '10px')
          .text(`Frequency: ${d.frequency} times`);

        tooltip.append('text')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 17)
          .attr('text-anchor', 'middle')
          .attr('fill', severityColors[d.severity])
          .attr('font-size', '10px')
          .attr('font-weight', '600')
          .text(`Severity: ${d.severity.toUpperCase()}`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#e9ecef')
          .attr('stroke-width', 2)
          .attr('opacity', 0.7);
        svg.selectAll('.tooltip').remove();
      });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', '#6c757d');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', '#6c757d');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => ''));

    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => ''));

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#495057')
      .text('Average Delay (minutes)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#495057')
      .text('Frequency');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 180}, ${margin.top})`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#495057')
      .text('Severity Level');

    const legendData = [
      { severity: 'critical', label: 'Critical', color: '#212529' },
      { severity: 'high', label: 'High', color: '#495057' },
      { severity: 'medium', label: 'Medium', color: '#6c757d' },
      { severity: 'low', label: 'Low', color: '#adb5bd' },
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 24 + 20})`);

      legendRow.append('circle')
        .attr('cx', 9)
        .attr('cy', 9)
        .attr('r', 8)
        .attr('fill', item.color)
        .attr('stroke', '#dee2e6')
        .attr('opacity', 0.7);

      legendRow.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .attr('font-size', '10px')
        .attr('fill', '#495057')
        .text(item.label);
    });

    // Size legend
    const sizeLegend = svg.append('g')
      .attr('transform', `translate(${width - 180}, ${margin.top + 130})`);

    sizeLegend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#495057')
      .text('Impact (size)');

    sizeLegend.append('text')
      .attr('x', 0)
      .attr('y', 18)
      .attr('font-size', '9px')
      .attr('fill', '#6c757d')
      .text('Delay × Frequency');

  }, [data, width, height]);

  return (
    <svg
      ref={svgRef}
      className="border border-gray-200 rounded-lg bg-white"
      style={{ borderColor: '#e9ecef' }}
    />
  );
};
