import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ProcessNode {
  id: string;
  label: string;
  type: 'start' | 'activity' | 'gateway' | 'end';
  count: number;
  avgDuration: number;
  x?: number;
  y?: number;
}

interface ProcessLink {
  source: string | ProcessNode;
  target: string | ProcessNode;
  frequency: number;
  percentage: number;
}

interface D3ProcessMapProps {
  nodes: ProcessNode[];
  links: ProcessLink[];
  width?: number;
  height?: number;
}

export const D3ProcessMap = ({ 
  nodes, 
  links, 
  width = 1200, 
  height = 700 
}: D3ProcessMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<ProcessNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Add zoom behavior
    const g = svg.append('g');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(200))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Create arrow markers for directed edges
    const defs = g.append('defs');
    
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create gradient for links based on frequency
    const maxFreq = d3.max(links, d => d.frequency) || 1;
    
    links.forEach((link, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#1890ff')
        .attr('stop-opacity', link.frequency / maxFreq);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#52c41a')
        .attr('stop-opacity', link.frequency / maxFreq);
    });

    // Draw links
    const link = g.append('g')
      .selectAll('g')
      .data(links)
      .join('g');

    link.append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', (d, i) => `url(#gradient-${i})`)
      .attr('stroke-width', d => Math.max(2, Math.sqrt(d.frequency / maxFreq) * 10))
      .attr('marker-end', 'url(#arrowhead)')
      .attr('opacity', 0.6);

    // Add link labels
    link.append('text')
      .attr('class', 'link-label')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .text(d => `${d.percentage}% (${d.frequency})`);

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag<any, ProcessNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Node circles/shapes
    node.append('circle')
      .attr('r', d => {
        const maxCount = d3.max(nodes, n => n.count) || 1;
        return 20 + (d.count / maxCount) * 30;
      })
      .attr('fill', d => {
        switch (d.type) {
          case 'start': return '#52c41a';
          case 'end': return '#f5222d';
          case 'gateway': return '#faad14';
          default: return '#1890ff';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d: ProcessNode) => {
            const maxCount = d3.max(nodes, n => n.count) || 1;
            return 25 + (d.count / maxCount) * 35;
          })
          .attr('stroke-width', 5);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d: ProcessNode) => {
            const maxCount = d3.max(nodes, n => n.count) || 1;
            return 20 + (d.count / maxCount) * 30;
          })
          .attr('stroke-width', 3);
      })
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // Node labels
    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text(d => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label);

    // Node statistics below
    node.append('text')
      .attr('dy', 50)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .attr('pointer-events', 'none')
      .text(d => `${d.count} cases`);

    node.append('text')
      .attr('dy', 62)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .attr('pointer-events', 'none')
      .text(d => `${d.avgDuration}h avg`);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link.select('path')
        .attr('d', (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });

      link.select('text')
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 5);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="border border-gray-200 rounded-lg bg-white shadow-sm"
      />
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <h4 className="font-bold text-lg mb-2">{selectedNode.label}</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">Type:</span> {selectedNode.type}</p>
            <p><span className="font-semibold">Cases:</span> {selectedNode.count}</p>
            <p><span className="font-semibold">Avg Duration:</span> {selectedNode.avgDuration}h</p>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
