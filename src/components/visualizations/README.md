# Activity Framework Visualizations

Professional D3.js-based visualizations for manufacturing resource management with minimal, classy design.

## Available Visualizations

### 1. **ActivityResourceGraph**
Bipartite force-directed graph showing relationships between activities and resources.

**Features:**
- Interactive drag and drop nodes
- Zoom and pan support
- Hover tooltips with efficiency data
- Minimal gray color scheme

**Usage:**
```tsx
import { ActivityResourceGraph } from '@/components/visualizations';

<ActivityResourceGraph 
  nodes={[
    { id: 'ACT001', label: 'Design', type: 'activity', group: 'activities' },
    { id: 'RES001', label: 'Station 1', type: 'resource', group: 'resources' }
  ]}
  links={[
    { source: 'ACT001', target: 'RES001', efficiency: 85 }
  ]}
  width={1200}
  height={600}
/>
```

---

### 2. **ActivityFlowDiagram**
Process flow visualization with start, activities, and end nodes.

**Features:**
- Force-directed layout
- Color-coded node types (start: green, activity: gray, end: red)
- Draggable nodes
- Directional arrows showing flow
- Legend

**Usage:**
```tsx
import { ActivityFlowDiagram } from '@/components/visualizations';

<ActivityFlowDiagram 
  nodes={[
    { id: 'start', name: 'Start', duration: 0, type: 'start' },
    { id: 'ACT001', name: 'Design', duration: 120, type: 'activity' },
    { id: 'end', name: 'End', duration: 0, type: 'end' }
  ]}
  links={[
    { source: 'start', target: 'ACT001', frequency: 10 },
    { source: 'ACT001', target: 'end', frequency: 8 }
  ]}
  width={900}
  height={600}
/>
```

---

### 3. **ActivityTimeline**
Gantt-style timeline showing activity scheduling across resources.

**Features:**
- Time-based horizontal bars
- Status color coding (completed, in-progress, scheduled)
- Current time indicator
- Resource swimlanes
- Grid background

**Usage:**
```tsx
import { ActivityTimeline } from '@/components/visualizations';

<ActivityTimeline 
  activities={[
    {
      id: 'ACT001',
      name: 'Design',
      resourceId: 'RES001',
      resourceName: 'Station 1',
      startTime: new Date('2025-01-15T08:00:00'),
      endTime: new Date('2025-01-15T10:00:00'),
      status: 'completed'
    }
  ]}
  width={1000}
  height={500}
/>
```

---

### 4. **CompatibilityMatrix**
Heatmap showing activity-resource compatibility.

**Features:**
- Grid layout with activities on Y-axis, resources on X-axis
- Color-coded cells (compatible: dark gray, incompatible: light gray)
- Hover tooltips with efficiency percentages
- Rotated X-axis labels

**Usage:**
```tsx
import { CompatibilityMatrix } from '@/components/visualizations';

<CompatibilityMatrix 
  data={[
    { activity: 'Design', resource: 'Station 1', compatible: true, efficiency: 95 },
    { activity: 'Milling', resource: 'Station 1', compatible: false }
  ]}
  width={800}
  height={600}
/>
```

---

### 5. **ResourceUtilizationChart**
Horizontal bar chart showing resource utilization percentages.

**Features:**
- Color-coded by utilization level (0-50%, 50-75%, 75-90%, 90%+)
- Reference lines at key thresholds
- Percentage labels
- Hover tooltips with capacity and active jobs

**Usage:**
```tsx
import { ResourceUtilizationChart } from '@/components/visualizations';

<ResourceUtilizationChart 
  data={[
    {
      resourceId: 'RES001',
      resourceName: 'Station 1',
      utilization: 85,
      capacity: 1,
      activeJobs: 2
    }
  ]}
  width={800}
  height={500}
/>
```

---

### 6. **BottleneckAnalysis**
Bubble chart analyzing bottlenecks by delay and frequency.

**Features:**
- X-axis: Average delay (minutes)
- Y-axis: Frequency of occurrence
- Bubble size: Impact (delay × frequency)
- Color-coded severity (low, medium, high, critical)
- Grid lines for reference
- Legend

**Usage:**
```tsx
import { BottleneckAnalysis } from '@/components/visualizations';

<BottleneckAnalysis 
  data={[
    {
      resourceId: 'RES001',
      resourceName: 'Station 1',
      activityId: 'ACT001',
      activityName: 'Design',
      delayMinutes: 45,
      frequency: 12,
      severity: 'high'
    }
  ]}
  width={800}
  height={600}
/>
```

---

## Design System

### Color Palette
All visualizations follow a minimal, neutral color scheme:

- **Primary Grays:**
  - `#212529` - Critical/High importance
  - `#495057` - Default/Medium importance
  - `#6c757d` - Secondary elements
  - `#adb5bd` - Low importance/disabled
  - `#dee2e6` - Borders
  - `#e9ecef` - Light borders
  - `#f8f9fa` - Background

- **Status Colors:**
  - `#10b981` - Success/Start (green)
  - `#ef4444` - Error/End (red)

### Typography
- Font Family: Inter (from Google Fonts)
- Titles: 16px, weight 600
- Labels: 10-12px, weight 500
- Values: 11-12px, weight 600

### Interactions
- Hover effects: Border highlight, opacity changes
- Tooltips: Dark background (#212529), white text, rounded corners
- Cursor: Pointer on interactive elements
- Drag & drop: Supported on force-directed graphs

---

## Integration

### Activity View Page
Located at `/dashboard/activities`, includes:
- Table View (default)
- Activity-Resource Graph
- Flow Diagram
- Compatibility Matrix
- Timeline

### Resource View Page
Located at `/dashboard/resources`, includes:
- Stations Table (default)
- Utilization Chart
- Bottleneck Analysis
- Personnel (coming soon)
- Equipment (coming soon)

---

## Technical Details

### Dependencies
- D3.js v7
- React 18
- TypeScript
- Ant Design (for tabs and layout)

### Performance
- SVG-based rendering
- Efficient force simulations with alpha decay
- Responsive to window resize (manual width/height props)

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

## Future Enhancements

- [ ] Real-time data updates
- [ ] Export to PNG/SVG
- [ ] Custom color themes
- [ ] Time range filtering for timeline
- [ ] Drill-down interactions
- [ ] Comparison views
- [ ] Performance metrics overlay
