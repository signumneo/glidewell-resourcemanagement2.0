// Global Activity Framework Types

export interface Activity {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  resourceTypes: string[]; // IDs of compatible resource types
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceType {
  id: string;
  name: string;
  category: 'station' | 'personnel' | 'equipment' | 'tool' | 'material';
  department?: string;
  activities: string[]; // IDs of activities this resource can perform
  specifications?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Station extends ResourceType {
  category: 'station';
  location?: string;
  capacity?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'offline';
}

export interface ActivityResourceMapping {
  activityId: string;
  resourceTypeId: string;
  efficiency?: number; // 0-100
  priority?: number; // 1-10
  constraints?: Record<string, any>;
}

export interface ManufacturingProcess {
  id: string;
  name: string;
  activities: Activity[];
  partTypes: string[];
}
