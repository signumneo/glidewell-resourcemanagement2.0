export interface ProcessNode {
  id: string;
  label: string;
  type: 'start' | 'task' | 'gateway' | 'end';
  frequency?: number;
  avgDuration?: number;
}

export interface ProcessEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  frequency?: number;
  percentage?: number;
}

export interface ProcessData {
  nodes: ProcessNode[];
  edges: ProcessEdge[];
}

export interface ProcessMetrics {
  totalCases: number;
  avgDuration: number;
  bottlenecks: string[];
  efficiency: number;
}

export interface ProcessActivity {
  id: string;
  name: string;
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
}
