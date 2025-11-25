import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TimelineActivity {
  id: string;
  name: string;
  resourceId: string;
  resourceName: string;
  startTime: Date;
  endTime: Date;
  status: 'completed' | 'in-progress' | 'scheduled';
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
  width?: number;
  height?: number;
}

export const ActivityTimeline = ({
  activities,
  width = 1000,
  height = 500,
}: ActivityTimelineProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || activities.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 60, right: 120, bottom: 60, left: 150 };
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
      .text('Activity Timeline');

    // Get unique resources
    const resources = Array.from(new Set(activities.map(a => a.resourceName)));

    // Time extent
    const timeExtent = d3.extent(activities.flatMap(a => [a.startTime, a.endTime])) as [Date, Date];

    // Scales
    const xScale = d3.scaleTime()
      .domain(timeExtent)
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleBand()
      .domain(resources)
      .range([0, innerHeight])
      .padding(0.2);

    // Status colors
    const statusColors: Record<string, string> = {
      completed: '#495057',
      'in-progress': '#6c757d',
      scheduled: '#adb5bd',
    };

    // Draw activity bars
    g.selectAll('.activity')
      .data(activities)
      .join('rect')
      .attr('class', 'activity')
      .attr('x', d => xScale(d.startTime))
      .attr('y', d => yScale(d.resourceName) || 0)
      .attr('width', d => xScale(d.endTime) - xScale(d.startTime))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => statusColors[d.status])
      .attr('rx', 4)
      .attr('stroke', '#e9ecef')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#495057')
          .attr('stroke-width', 2)
          .attr('opacity', 0.8);

        // Tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip');

        tooltip.append('rect')
          .attr('x', event.pageX % width)
          .attr('y', (event.pageY % height) - 90)
          .attr('width', 220)
          .attr('height', 80)
          .attr('fill', '#212529')
          .attr('rx', 8)
          .attr('opacity', 0.95);

        tooltip.append('text')
          .attr('x', (event.pageX % width) + 110)
          .attr('y', (event.pageY % height) - 70)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text(d.name);

        tooltip.append('text')
          .attr('x', (event.pageX % width) + 110)
          .attr('y', (event.pageY % height) - 52)
          .attr('text-anchor', 'middle')
          .attr('fill', '#adb5bd')
          .attr('font-size', '10px')
          .text(`Resource: ${d.resourceName}`);

        tooltip.append('text')
          .attr('x', (event.pageX % width) + 110)
          .attr('y', (event.pageY % height) - 37)
          .attr('text-anchor', 'middle')
          .attr('fill', '#adb5bd')
          .attr('font-size', '10px')
          .text(`${d3.timeFormat('%H:%M')(d.startTime)} - ${d3.timeFormat('%H:%M')(d.endTime)}`);

        tooltip.append('text')
          .attr('x', (event.pageX % width) + 110)
          .attr('y', (event.pageY % height) - 22)
          .attr('text-anchor', 'middle')
          .attr('fill', statusColors[d.status])
          .attr('font-size', '10px')
          .attr('font-weight', '600')
          .text(d.status.toUpperCase());
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#e9ecef')
          .attr('stroke-width', 1)
          .attr('opacity', 1);
        svg.selectAll('.tooltip').remove();
      });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(8)
        .tickFormat(d3.timeFormat('%H:%M') as any))
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

    // Current time line
    const now = new Date();
    if (now >= timeExtent[0] && now <= timeExtent[1]) {
      g.append('line')
        .attr('x1', xScale(now))
        .attr('x2', xScale(now))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.8);

      g.append('text')
        .attr('x', xScale(now) + 5)
        .attr('y', -5)
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', '#ef4444')
        .text('Now');
    }

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisBottom(xScale)
        .ticks(8)
        .tickSize(innerHeight)
        .tickFormat(() => ''));

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 110}, ${margin.top})`);

    const legendData = [
      { status: 'completed', label: 'Completed', color: '#495057' },
      { status: 'in-progress', label: 'In Progress', color: '#6c757d' },
      { status: 'scheduled', label: 'Scheduled', color: '#adb5bd' },
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
        .attr('font-size', '10px')
        .attr('fill', '#495057')
        .text(item.label);
    });

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#495057')
      .text('Time');

  }, [activities, width, height]);

  return (
    <svg
      ref={svgRef}
      className="border border-gray-200 rounded-lg bg-white"
      style={{ borderColor: '#e9ecef' }}
    />
  );
};
