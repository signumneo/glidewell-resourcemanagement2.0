// Complex multi-process manufacturing workflow data

export interface ProcessCategory {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
}

export const processCategories: ProcessCategory[] = [
  { id: 'design', name: 'Design & Engineering', color: '#3B82F6', enabled: true },
  { id: 'manufacturing', name: 'Manufacturing', color: '#10B981', enabled: true },
  { id: 'quality', name: 'Quality Control', color: '#F59E0B', enabled: true },
  { id: 'finishing', name: 'Finishing & Polish', color: '#8B5CF6', enabled: true },
  { id: 'assembly', name: 'Assembly', color: '#EC4899', enabled: true },
  { id: 'packaging', name: 'Packaging & Shipping', color: '#6366F1', enabled: true },
];

export const complexActivityNodes = [
  // Design & Engineering
  { id: 'ACT001', label: 'Requirements Analysis', type: 'activity', process: 'design', count: 450, duration: 180, status: 'active' },
  { id: 'ACT002', label: 'CAD Modeling', type: 'activity', process: 'design', count: 420, duration: 240, status: 'active' },
  { id: 'ACT003', label: 'Design Review', type: 'activity', process: 'design', count: 380, duration: 90, status: 'active' },
  { id: 'ACT004', label: 'CAM Programming', type: 'activity', process: 'design', count: 395, duration: 150, status: 'active' },
  
  // Manufacturing
  { id: 'ACT005', label: 'Material Preparation', type: 'activity', process: 'manufacturing', count: 620, duration: 45, status: 'active' },
  { id: 'ACT006', label: 'CNC Milling', type: 'activity', process: 'manufacturing', count: 580, duration: 120, status: 'active' },
  { id: 'ACT007', label: 'CNC Turning', type: 'activity', process: 'manufacturing', count: 490, duration: 90, status: 'active' },
  { id: 'ACT008', label: 'Wire EDM', type: 'activity', process: 'manufacturing', count: 340, duration: 180, status: 'active' },
  { id: 'ACT009', label: 'Laser Cutting', type: 'activity', process: 'manufacturing', count: 410, duration: 60, status: 'active' },
  { id: 'ACT010', label: 'Heat Treatment', type: 'activity', process: 'manufacturing', count: 280, duration: 300, status: 'active' },
  
  // Quality Control
  { id: 'ACT011', label: 'Dimensional Inspection', type: 'activity', process: 'quality', count: 520, duration: 45, status: 'active' },
  { id: 'ACT012', label: 'CMM Measurement', type: 'activity', process: 'quality', count: 380, duration: 75, status: 'active' },
  { id: 'ACT013', label: 'Surface Analysis', type: 'activity', process: 'quality', count: 290, duration: 30, status: 'active' },
  { id: 'ACT014', label: 'Material Testing', type: 'activity', process: 'quality', count: 180, duration: 120, status: 'active' },
  
  // Finishing & Polish
  { id: 'ACT015', label: 'Deburring', type: 'activity', process: 'finishing', count: 550, duration: 30, status: 'active' },
  { id: 'ACT016', label: 'Surface Grinding', type: 'activity', process: 'finishing', count: 420, duration: 60, status: 'active' },
  { id: 'ACT017', label: 'Polishing', type: 'activity', process: 'finishing', count: 380, duration: 45, status: 'active' },
  { id: 'ACT018', label: 'Coating Application', type: 'activity', process: 'finishing', count: 310, duration: 90, status: 'active' },
  { id: 'ACT019', label: 'Anodizing', type: 'activity', process: 'finishing', count: 250, duration: 120, status: 'active' },
  
  // Assembly
  { id: 'ACT020', label: 'Component Sorting', type: 'activity', process: 'assembly', count: 680, duration: 20, status: 'active' },
  { id: 'ACT021', label: 'Sub-Assembly', type: 'activity', process: 'assembly', count: 520, duration: 90, status: 'active' },
  { id: 'ACT022', label: 'Final Assembly', type: 'activity', process: 'assembly', count: 480, duration: 150, status: 'active' },
  { id: 'ACT023', label: 'Torque Testing', type: 'activity', process: 'assembly', count: 450, duration: 30, status: 'active' },
  { id: 'ACT024', label: 'Leak Testing', type: 'activity', process: 'assembly', count: 420, duration: 45, status: 'active' },
  
  // Packaging & Shipping
  { id: 'ACT025', label: 'Final Inspection', type: 'activity', process: 'packaging', count: 510, duration: 25, status: 'active' },
  { id: 'ACT026', label: 'Packaging', type: 'activity', process: 'packaging', count: 500, duration: 35, status: 'active' },
  { id: 'ACT027', label: 'Labeling', type: 'activity', process: 'packaging', count: 490, duration: 15, status: 'active' },
  { id: 'ACT028', label: 'Shipping Preparation', type: 'activity', process: 'packaging', count: 480, duration: 40, status: 'active' },
];

export const complexResourceNodes = [
  // Design Resources
  { id: 'RES001', label: 'CAD Workstation Pro', type: 'resource', process: 'design', count: 320, duration: 180, status: 'active' },
  { id: 'RES002', label: 'CAM System', type: 'resource', process: 'design', count: 280, duration: 150, status: 'active' },
  { id: 'RES003', label: 'Design Engineer', type: 'resource', process: 'design', count: 450, duration: 200, status: 'active' },
  
  // Manufacturing Resources
  { id: 'RES004', label: 'CNC Mill 5-Axis', type: 'resource', process: 'manufacturing', count: 420, duration: 120, status: 'active' },
  { id: 'RES005', label: 'CNC Lathe', type: 'resource', process: 'manufacturing', count: 380, duration: 90, status: 'active' },
  { id: 'RES006', label: 'EDM Machine', type: 'resource', process: 'manufacturing', count: 240, duration: 180, status: 'active' },
  { id: 'RES007', label: 'Laser Cutter', type: 'resource', process: 'manufacturing', count: 350, duration: 60, status: 'active' },
  { id: 'RES008', label: 'Heat Treatment Oven', type: 'resource', process: 'manufacturing', count: 180, duration: 300, status: 'active' },
  { id: 'RES009', label: 'CNC Operator', type: 'resource', process: 'manufacturing', count: 520, duration: 120, status: 'active' },
  
  // Quality Resources
  { id: 'RES010', label: 'CMM System', type: 'resource', process: 'quality', count: 280, duration: 75, status: 'active' },
  { id: 'RES011', label: 'Surface Tester', type: 'resource', process: 'quality', count: 220, duration: 30, status: 'active' },
  { id: 'RES012', label: 'QC Inspector', type: 'resource', process: 'quality', count: 410, duration: 60, status: 'active' },
  { id: 'RES013', label: 'Materials Lab', type: 'resource', process: 'quality', count: 150, duration: 120, status: 'active' },
  
  // Finishing Resources
  { id: 'RES014', label: 'Grinding Station', type: 'resource', process: 'finishing', count: 320, duration: 60, status: 'active' },
  { id: 'RES015', label: 'Polishing Machine', type: 'resource', process: 'finishing', count: 290, duration: 45, status: 'active' },
  { id: 'RES016', label: 'Coating Booth', type: 'resource', process: 'finishing', count: 210, duration: 90, status: 'active' },
  { id: 'RES017', label: 'Anodizing Tank', type: 'resource', process: 'finishing', count: 180, duration: 120, status: 'active' },
  { id: 'RES018', label: 'Finishing Technician', type: 'resource', process: 'finishing', count: 380, duration: 70, status: 'active' },
  
  // Assembly Resources
  { id: 'RES019', label: 'Assembly Station A', type: 'resource', process: 'assembly', count: 420, duration: 90, status: 'active' },
  { id: 'RES020', label: 'Assembly Station B', type: 'resource', process: 'assembly', count: 390, duration: 150, status: 'active' },
  { id: 'RES021', label: 'Torque Tester', type: 'resource', process: 'assembly', count: 310, duration: 30, status: 'active' },
  { id: 'RES022', label: 'Leak Test Equipment', type: 'resource', process: 'assembly', count: 280, duration: 45, status: 'active' },
  { id: 'RES023', label: 'Assembly Technician', type: 'resource', process: 'assembly', count: 480, duration: 100, status: 'active' },
  
  // Packaging Resources
  { id: 'RES024', label: 'Packaging Station', type: 'resource', process: 'packaging', count: 390, duration: 35, status: 'active' },
  { id: 'RES025', label: 'Label Printer', type: 'resource', process: 'packaging', count: 420, duration: 15, status: 'active' },
  { id: 'RES026', label: 'Shipping Clerk', type: 'resource', process: 'packaging', count: 380, duration: 40, status: 'active' },
];

// Complex interconnected links representing real manufacturing workflow
export const complexLinks = [
  // Design phase connections
  { source: 'ACT001', target: 'RES003', efficiency: 94, volume: 450 },
  { source: 'ACT002', target: 'RES001', efficiency: 92, volume: 420 },
  { source: 'ACT002', target: 'RES003', efficiency: 91, volume: 420 },
  { source: 'ACT003', target: 'RES003', efficiency: 96, volume: 380 },
  { source: 'ACT004', target: 'RES002', efficiency: 90, volume: 395 },
  { source: 'ACT004', target: 'RES003', efficiency: 89, volume: 395 },
  
  // Manufacturing phase connections
  { source: 'ACT005', target: 'RES009', efficiency: 88, volume: 620 },
  { source: 'ACT006', target: 'RES004', efficiency: 91, volume: 580 },
  { source: 'ACT006', target: 'RES009', efficiency: 90, volume: 580 },
  { source: 'ACT007', target: 'RES005', efficiency: 93, volume: 490 },
  { source: 'ACT007', target: 'RES009', efficiency: 92, volume: 490 },
  { source: 'ACT008', target: 'RES006', efficiency: 87, volume: 340 },
  { source: 'ACT009', target: 'RES007', efficiency: 95, volume: 410 },
  { source: 'ACT010', target: 'RES008', efficiency: 85, volume: 280 },
  
  // Quality Control connections
  { source: 'ACT011', target: 'RES012', efficiency: 97, volume: 520 },
  { source: 'ACT012', target: 'RES010', efficiency: 94, volume: 380 },
  { source: 'ACT012', target: 'RES012', efficiency: 93, volume: 380 },
  { source: 'ACT013', target: 'RES011', efficiency: 96, volume: 290 },
  { source: 'ACT013', target: 'RES012', efficiency: 95, volume: 290 },
  { source: 'ACT014', target: 'RES013', efficiency: 91, volume: 180 },
  
  // Finishing phase connections
  { source: 'ACT015', target: 'RES018', efficiency: 89, volume: 550 },
  { source: 'ACT016', target: 'RES014', efficiency: 92, volume: 420 },
  { source: 'ACT016', target: 'RES018', efficiency: 91, volume: 420 },
  { source: 'ACT017', target: 'RES015', efficiency: 94, volume: 380 },
  { source: 'ACT017', target: 'RES018', efficiency: 93, volume: 380 },
  { source: 'ACT018', target: 'RES016', efficiency: 88, volume: 310 },
  { source: 'ACT018', target: 'RES018', efficiency: 87, volume: 310 },
  { source: 'ACT019', target: 'RES017', efficiency: 86, volume: 250 },
  
  // Assembly phase connections
  { source: 'ACT020', target: 'RES023', efficiency: 96, volume: 680 },
  { source: 'ACT021', target: 'RES019', efficiency: 93, volume: 520 },
  { source: 'ACT021', target: 'RES023', efficiency: 92, volume: 520 },
  { source: 'ACT022', target: 'RES020', efficiency: 91, volume: 480 },
  { source: 'ACT022', target: 'RES023', efficiency: 90, volume: 480 },
  { source: 'ACT023', target: 'RES021', efficiency: 95, volume: 450 },
  { source: 'ACT024', target: 'RES022', efficiency: 94, volume: 420 },
  
  // Packaging phase connections
  { source: 'ACT025', target: 'RES012', efficiency: 97, volume: 510 },
  { source: 'ACT026', target: 'RES024', efficiency: 93, volume: 500 },
  { source: 'ACT026', target: 'RES026', efficiency: 92, volume: 500 },
  { source: 'ACT027', target: 'RES025', efficiency: 98, volume: 490 },
  { source: 'ACT028', target: 'RES026', efficiency: 94, volume: 480 },
];
