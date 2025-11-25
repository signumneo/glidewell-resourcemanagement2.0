import { useEffect, useRef } from 'react';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

interface BPMNViewerProps {
  xml: string;
  height?: string;
}

export const BPMNViewer = ({ xml, height = '600px' }: BPMNViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BpmnViewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize BPMN Viewer
    const viewer = new BpmnViewer({
      container: containerRef.current,
      width: '100%',
      height,
    });

    viewerRef.current = viewer;

    // Import XML
    viewer.importXML(xml).catch((err: Error) => {
      console.error('Error rendering BPMN diagram:', err);
    });

    return () => {
      viewer.destroy();
    };
  }, [xml, height]);

  return <div ref={containerRef} style={{ width: '100%', height }} />;
};
