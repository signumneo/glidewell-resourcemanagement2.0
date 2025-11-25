// Hierarchical Process Data Structure
// Main Processes → Subprocesses → Global Resources

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
        id: 'DES-001',
        name: 'Requirement Analysis',
        description: 'Analyze customer requirements and specifications',
        duration: 60,
        resourceTypes: ['rt-11', 'rt-12'],
      },
      {
        id: 'DES-002',
        name: 'Concept Design',
        description: 'Create initial design concepts',
        duration: 120,
        resourceTypes: ['rt-11', 'rt-3'],
      },
      {
        id: 'DES-003',
        name: 'CAD Modeling',
        description: 'Develop detailed 3D CAD models',
        duration: 180,
        resourceTypes: ['rt-11', 'rt-3'],
      },
      {
        id: 'DES-004',
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
        id: 'MFG-001',
        name: 'Material Preparation',
        description: 'Prepare raw materials for machining',
        duration: 45,
        resourceTypes: ['rt-9', 'rt-17'],
      },
      {
        id: 'MFG-002',
        name: 'CNC Milling',
        description: 'Machine parts using CNC mill',
        duration: 120,
        resourceTypes: ['rt-1', 'rt-9'],
      },
      {
        id: 'MFG-003',
        name: 'CNC Turning',
        description: 'Turn parts using CNC lathe',
        duration: 90,
        resourceTypes: ['rt-2', 'rt-9'],
      },
      {
        id: 'MFG-004',
        name: 'Laser Cutting',
        description: 'Cut parts using laser cutter',
        duration: 60,
        resourceTypes: ['rt-4', 'rt-9'],
      },
      {
        id: 'MFG-005',
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
        id: 'QC-001',
        name: 'Dimensional Inspection',
        description: 'Verify part dimensions',
        duration: 30,
        resourceTypes: ['rt-5', 'rt-10', 'rt-16'],
      },
      {
        id: 'QC-002',
        name: 'Surface Inspection',
        description: 'Check surface finish quality',
        duration: 20,
        resourceTypes: ['rt-10', 'rt-16'],
      },
      {
        id: 'QC-003',
        name: 'Functional Testing',
        description: 'Test part functionality',
        duration: 45,
        resourceTypes: ['rt-10', 'rt-16'],
      },
      {
        id: 'QC-004',
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
        id: 'FIN-001',
        name: 'Deburring',
        description: 'Remove burrs and sharp edges',
        duration: 30,
        resourceTypes: ['rt-9', 'rt-6'],
      },
      {
        id: 'FIN-002',
        name: 'Surface Grinding',
        description: 'Grind surfaces to spec',
        duration: 45,
        resourceTypes: ['rt-6', 'rt-9'],
      },
      {
        id: 'FIN-003',
        name: 'Polishing',
        description: 'Polish parts to desired finish',
        duration: 40,
        resourceTypes: ['rt-9'],
      },
      {
        id: 'FIN-004',
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
        id: 'ASM-001',
        name: 'Component Preparation',
        description: 'Prepare components for assembly',
        duration: 20,
        resourceTypes: ['rt-13', 'rt-8'],
      },
      {
        id: 'ASM-002',
        name: 'Sub-Assembly',
        description: 'Assemble sub-components',
        duration: 45,
        resourceTypes: ['rt-13', 'rt-8'],
      },
      {
        id: 'ASM-003',
        name: 'Final Assembly',
        description: 'Complete final product assembly',
        duration: 60,
        resourceTypes: ['rt-13', 'rt-8'],
      },
      {
        id: 'ASM-004',
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
        id: 'PKG-001',
        name: 'Product Wrapping',
        description: 'Wrap finished products',
        duration: 15,
        resourceTypes: ['rt-14'],
      },
      {
        id: 'PKG-002',
        name: 'Boxing',
        description: 'Box products with documentation',
        duration: 20,
        resourceTypes: ['rt-14'],
      },
      {
        id: 'PKG-003',
        name: 'Labeling',
        description: 'Apply labels and barcodes',
        duration: 10,
        resourceTypes: ['rt-14'],
      },
      {
        id: 'PKG-004',
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
