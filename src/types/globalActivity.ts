// Global Activity Framework Types

export interface GlobalActivity {
  id: string;
  name: string;
  description?: string;
  category: 'design' | 'manufacturing' | 'quality' | 'finishing' | 'assembly' | 'packaging';
  estimatedDuration?: number; // in minutes
  resourceTypes: ResourceTypeAssociation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceTypeAssociation {
  resourceTypeId: string;
  resourceTypeName: string;
  resourceCategory: 'station' | 'personnel' | 'equipment' | 'tool';
  isRequired: boolean;
  quantity?: number;
}

export interface ResourceType {
  id: string;
  name: string;
  category: 'station' | 'personnel' | 'equipment' | 'tool';
  department?: string;
  capacity?: number;
  availableActivities: string[]; // Activity IDs that can run on this resource
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityResourceMapping {
  activityId: string;
  activityName: string;
  resourceTypeId: string;
  resourceTypeName: string;
  volume?: number;
  efficiency?: number;
}
