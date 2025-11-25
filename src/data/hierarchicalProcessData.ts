// Hierarchical Process Data Structure
// Main Processes → Subprocesses → Global Resources

export interface InterProcessConnection {
  from: string; // Source subprocess ID
  to: string; // Target subprocess ID
  type: 'handoff' | 'dependency'; // Type of connection
}

export interface Subprocess {
  id: string; // Unique activity ID (e.g., DES-001, MFG-002)
  name: string;
  description: string;
  duration: number; // minutes
  resourceTypes: string[]; // References to global resource IDs
}

export interface MainProcess {
  id: string;
  name: string;
  color: string;
  subprocesses: Subprocess[];
}

export interface GlobalResource {
  id: string;
  name: string;
  category: string;
  type: 'equipment' | 'personnel' | 'facility';
  quantity: number;
}

// Global Resources - Shared across entire department
export const globalResources: GlobalResource[] = [
  // Equipment
  { id: 'rt-1', name: 'CNC Mill', category: 'equipment', type: 'equipment', quantity: 3 },
  { id: 'rt-2', name: 'CNC Lathe', category: 'equipment', type: 'equipment', quantity: 2 },
  { id: 'rt-3', name: '3D Printer', category: 'equipment', type: 'equipment', quantity: 4 },
  { id: 'rt-4', name: 'Laser Cutter', category: 'equipment', type: 'equipment', quantity: 2 },
  { id: 'rt-5', name: 'CMM Machine', category: 'equipment', type: 'equipment', quantity: 1 },
  { id: 'rt-6', name: 'Surface Grinder', category: 'equipment', type: 'equipment', quantity: 2 },
  { id: 'rt-7', name: 'Welding Station', category: 'equipment', type: 'equipment', quantity: 3 },
  { id: 'rt-8', name: 'Assembly Station', category: 'equipment', type: 'equipment', quantity: 5 },
  
  // Personnel
  { id: 'rt-9', name: 'CNC Operator', category: 'personnel', type: 'personnel', quantity: 4 },
  { id: 'rt-10', name: 'Quality Inspector', category: 'personnel', type: 'personnel', quantity: 2 },
  { id: 'rt-11', name: 'CAD Designer', category: 'personnel', type: 'personnel', quantity: 3 },
  { id: 'rt-12', name: 'Manufacturing Engineer', category: 'personnel', type: 'personnel', quantity: 2 },
  { id: 'rt-13', name: 'Assembly Technician', category: 'personnel', type: 'personnel', quantity: 4 },
  { id: 'rt-14', name: 'Packaging Specialist', category: 'personnel', type: 'personnel', quantity: 2 },
  
  // Facilities
  { id: 'rt-15', name: 'Clean Room', category: 'facility', type: 'facility', quantity: 1 },
  { id: 'rt-16', name: 'Testing Lab', category: 'facility', type: 'facility', quantity: 1 },
  { id: 'rt-17', name: 'Storage Area', category: 'facility', type: 'facility', quantity: 2 },
];

// Main Processes with their Subprocesses
export const mainProcesses: MainProcess[] = [
  {
    id: 'design',
    name: 'Design',
    color: '#3b82f6',
    subprocesses: [
      {
        id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        name: 'Requirement Analysis',
        description: 'Analyze customer requirements and specifications',
        duration: 60,
        resourceTypes: ['rt-11', 'rt-12'],
      },
      {
        id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
        name: 'Concept Design',
        description: 'Create initial design concepts',
        duration: 120,
        resourceTypes: ['rt-11', 'rt-3'],
      },
      {
        id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
        name: 'CAD Modeling',
        description: 'Develop detailed 3D CAD models',
        duration: 180,
        resourceTypes: ['rt-11', 'rt-3'],
      },
      {
        id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
        name: 'Design Review',
        description: 'Review and validate design',
        duration: 90,
        resourceTypes: ['rt-11', 'rt-12'],
      },
    ],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    color: '#ef4444',
    subprocesses: [
      {
        id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
        name: 'Material Preparation',
        description: 'Prepare raw materials for machining',
        duration: 45,
        resourceTypes: ['rt-9', 'rt-17'],
      },
      {
        id: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
        name: 'CNC Milling',
        description: 'Machine parts using CNC mill',
        duration: 120,
        resourceTypes: ['rt-1', 'rt-9'],
      },
      {
        id: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d',
        name: 'CNC Turning',
        description: 'Turn parts using CNC lathe',
        duration: 90,
        resourceTypes: ['rt-2', 'rt-9'],
      },
      {
        id: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e',
        name: 'Laser Cutting',
        description: 'Cut parts using laser cutter',
        duration: 60,
        resourceTypes: ['rt-4', 'rt-9'],
      },
      {
        id: 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f',
        name: 'Welding',
        description: 'Weld components together',
        duration: 75,
        resourceTypes: ['rt-7', 'rt-9'],
      },
    ],
  },
  {
    id: 'quality',
    name: 'Quality Control',
    color: '#10b981',
    subprocesses: [
      {
        id: 'd0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a',
        name: 'Dimensional Inspection',
        description: 'Verify part dimensions',
        duration: 30,
        resourceTypes: ['rt-5', 'rt-10', 'rt-16'],
      },
      {
        id: 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b',
        name: 'Surface Inspection',
        description: 'Check surface finish quality',
        duration: 20,
        resourceTypes: ['rt-10', 'rt-16'],
      },
      {
        id: 'f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c',
        name: 'Functional Testing',
        description: 'Test part functionality',
        duration: 45,
        resourceTypes: ['rt-10', 'rt-16'],
      },
      {
        id: 'a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d',
        name: 'Final Inspection',
        description: 'Final quality check before packaging',
        duration: 25,
        resourceTypes: ['rt-10', 'rt-16'],
      },
    ],
  },
  {
    id: 'finishing',
    name: 'Finishing',
    color: '#f59e0b',
    subprocesses: [
      {
        id: 'b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e',
        name: 'Deburring',
        description: 'Remove burrs and sharp edges',
        duration: 30,
        resourceTypes: ['rt-9', 'rt-6'],
      },
      {
        id: 'c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f',
        name: 'Surface Grinding',
        description: 'Grind surfaces to spec',
        duration: 45,
        resourceTypes: ['rt-6', 'rt-9'],
      },
      {
        id: 'd6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a',
        name: 'Polishing',
        description: 'Polish parts to desired finish',
        duration: 40,
        resourceTypes: ['rt-9'],
      },
      {
        id: 'e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9f0a1b',
        name: 'Coating',
        description: 'Apply protective coating',
        duration: 60,
        resourceTypes: ['rt-9', 'rt-15'],
      },
    ],
  },
  {
    id: 'assembly',
    name: 'Assembly',
    color: '#8b5cf6',
    subprocesses: [
      {
        id: 'f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c',
        name: 'Component Preparation',
        description: 'Prepare components for assembly',
        duration: 20,
        resourceTypes: ['rt-13', 'rt-8'],
      },
      {
        id: 'a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d',
        name: 'Sub-Assembly',
        description: 'Assemble sub-components',
        duration: 45,
        resourceTypes: ['rt-13', 'rt-8'],
      },
      {
        id: 'b0c1d2e3-f4a5-4b6c-7d8e-9f0a1b2c3d4e',
        name: 'Final Assembly',
        description: 'Complete final product assembly',
        duration: 60,
        resourceTypes: ['rt-13', 'rt-8'],
      },
      {
        id: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
        name: 'Testing',
        description: 'Test assembled product',
        duration: 30,
        resourceTypes: ['rt-13', 'rt-10', 'rt-16'],
      },
    ],
  },
  {
    id: 'packaging',
    name: 'Packaging',
    color: '#ec4899',
    subprocesses: [
      {
        id: 'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a',
        name: 'Product Wrapping',
        description: 'Wrap finished products',
        duration: 15,
        resourceTypes: ['rt-14'],
      },
      {
        id: 'e3f4a5b6-c7d8-4e9f-0a1b-2c3d4e5f6a7b',
        name: 'Boxing',
        description: 'Box products with documentation',
        duration: 20,
        resourceTypes: ['rt-14'],
      },
      {
        id: 'f4a5b6c7-d8e9-4f0a-1b2c-3d4e5f6a7b8c',
        name: 'Labeling',
        description: 'Apply labels and barcodes',
        duration: 10,
        resourceTypes: ['rt-14'],
      },
      {
        id: 'a5b6c7d8-e9f0-4a1b-2c3d-4e5f6a7b8c9d',
        name: 'Shipping Preparation',
        description: 'Prepare for shipping',
        duration: 25,
        resourceTypes: ['rt-14', 'rt-17'],
      },
    ],
  },
];

// Helper function to get all subprocesses that use a specific resource
export const getSubprocessesForResource = (resourceId: string): Subprocess[] => {
  const result: Subprocess[] = [];
  
  mainProcesses.forEach(mainProcess => {
    mainProcess.subprocesses.forEach(subprocess => {
      if (subprocess.resourceTypes.includes(resourceId)) {
        result.push(subprocess);
      }
    });
  });
  
  return result;
};

// Helper function to get resource usage count
export const getResourceUsageCount = (resourceId: string): number => {
  return getSubprocessesForResource(resourceId).length;
};

// Inter-process connections - connections between activities in different processes
export const interProcessConnections: InterProcessConnection[] = [
  // Design to Manufacturing handoffs
  { from: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', to: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', type: 'handoff' },
  
  // Manufacturing to Quality Control handoffs
  { from: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', to: 'd0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', type: 'handoff' },
  { from: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', to: 'd0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', type: 'handoff' },
  { from: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', to: 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', type: 'handoff' },
  { from: 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', to: 'd0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', type: 'handoff' },
  
  // Quality Control to Finishing handoffs
  { from: 'a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', to: 'b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', type: 'handoff' },
  
  // Finishing to Assembly handoffs
  { from: 'e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9f0a1b', to: 'f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c', type: 'handoff' },
  
  // Assembly to Packaging handoffs
  { from: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', to: 'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a', type: 'handoff' },
  
  // Cross-process dependencies
  { from: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', to: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', type: 'dependency' },
  { from: 'f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', to: 'a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d', type: 'dependency' },
];
