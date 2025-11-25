import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HeatmapData {
  activity: string;
  hour: number;
  value: number;
}

interface ProcessHeatmapProps {
  data: HeatmapData[];
  width?: number;
  height?: number;
}

export const ProcessHeatmap = ({
  data,
  width = 1200,
  height = 400,
}: ProcessHeatmapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 80, right: 80, bottom: 60, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique activities and hours
    const activities = Array.from(new Set(data.map(d => d.activity)));
    const hours = Array.from(new Set(data.map(d => d.hour))).sort((a, b) => a - b);

    // Create scales
    const xScale = d3.scaleBand()
      .domain(hours.map(String))
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(activities)
      .range([0, innerHeight])
      .padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, d3.max(data, d => d.value) || 100]);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text('Process Activity Heatmap - Bottleneck Analysis');

    // Draw cells
    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => xScale(String(d.hour)) || 0)
      .attr('y', d => yScale(d.activity) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#000')
          .attr('stroke-width', 3);

        // Tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${event.pageX},${event.pageY})`);

        tooltip.append('rect')
          .attr('x', -60)
          .attr('y', -50)
          .attr('width', 120)
          .attr('height', 40)
          .attr('fill', 'rgba(0,0,0,0.8)')
          .attr('rx', 4);

        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -35)
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .text(`${d.activity}`);

        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -20)
          .attr('fill', 'white')
          .attr('font-size', '11px')
          .text(`Hour: ${d.hour}:00`);

        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -5)
          .attr('fill', '#ffd700')
          .attr('font-size', '13px')
          .attr('font-weight', 'bold')
          .text(`${d.value} cases`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
        svg.selectAll('.tooltip').remove();
      });

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('font-size', '11px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '11px');

    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .text('Hour of Day');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .text('Activity');

    // Add legend
    const legendWidth = 300;
    const legendHeight = 20;
    const legend = svg.append('g')
      .attr('transform', `translate(${width - legendWidth - 40}, 50)`);

    const legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d => `${d}`);

    // Legend gradient
    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
      .attr('id', 'legend-gradient');

    linearGradient.selectAll('stop')
      .data(d3.range(0, 1.1, 0.1))
      .join('stop')
      .attr('offset', d => `${d * 100}%`)
      .attr('stop-color', d => colorScale(legendScale.invert(d * legendWidth)));

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');

    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .select('.domain').remove();

  }, [data, width, height]);

  return (
    <svg
      ref={svgRef}
      className="border border-gray-200 rounded-lg bg-white shadow-sm"
    />
  );
};
