import React, { useMemo } from 'react';
import { Card, Progress, Statistic } from 'antd';
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Target,
  Network,
  Activity,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
} from 'recharts';
import type { GlobalActivity, ResourceType } from '../../types/globalActivity';

interface ResourceInsightsProps {
  activities: GlobalActivity[];
  resourceTypes: ResourceType[];
}

export const ResourceInsights: React.FC<ResourceInsightsProps> = ({
  activities,
  resourceTypes,
}) => {
  const insights = useMemo(() => {
    // Calculate resource utilization
    const resourceUtilization = new Map<string, {
      resource: ResourceType;
      activitiesCount: number;
      requiredCount: number;
      optionalCount: number;
      totalQuantityNeeded: number;
    }>();

    resourceTypes.forEach((rt) => {
      resourceUtilization.set(rt.id, {
        resource: rt,
        activitiesCount: 0,
        requiredCount: 0,
        optionalCount: 0,
        totalQuantityNeeded: 0,
      });
    });

    activities.forEach((activity) => {
      activity.resourceTypes.forEach((assoc) => {
        const util = resourceUtilization.get(assoc.resourceTypeId);
        if (util) {
          util.activitiesCount++;
          if (assoc.isRequired) {
            util.requiredCount++;
          } else {
            util.optionalCount++;
          }
          util.totalQuantityNeeded += assoc.quantity || 1;
        }
      });
    });

    // Find shared resources (used by multiple activities)
    const sharedResources = Array.from(resourceUtilization.values())
      .filter((util) => util.activitiesCount > 1)
      .sort((a, b) => b.activitiesCount - a.activitiesCount);

    // Find bottleneck resources (high demand vs capacity)
    const bottleneckResources = Array.from(resourceUtilization.values())
      .filter((util) => util.resource.capacity && util.totalQuantityNeeded > util.resource.capacity!)
      .sort((a, b) => {
        const ratioA = a.totalQuantityNeeded / (a.resource.capacity || 1);
        const ratioB = b.totalQuantityNeeded / (b.resource.capacity || 1);
        return ratioB - ratioA;
      });

    // Find underutilized resources
    const underutilizedResources = Array.from(resourceUtilization.values())
      .filter((util) => util.activitiesCount < 2)
      .sort((a, b) => a.activitiesCount - b.activitiesCount);

    // Resource category distribution
    const categoryDistribution = new Map<string, number>();
    resourceTypes.forEach((rt) => {
      categoryDistribution.set(rt.category, (categoryDistribution.get(rt.category) || 0) + 1);
    });

    const categoryData = Array.from(categoryDistribution.entries()).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
    }));

    // Activity category distribution
    const activityCategoryDist = new Map<string, number>();
    activities.forEach((act) => {
      activityCategoryDist.set(act.category, (activityCategoryDist.get(act.category) || 0) + 1);
    });

    const activityCategoryData = Array.from(activityCategoryDist.entries()).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
    }));

    // Top shared resources for bar chart
    const topSharedData = sharedResources.slice(0, 10).map((util) => ({
      name: util.resource.name.length > 20 ? util.resource.name.substring(0, 18) + '...' : util.resource.name,
      activities: util.activitiesCount,
      required: util.requiredCount,
      optional: util.optionalCount,
      capacity: util.resource.capacity || 0,
      needed: util.totalQuantityNeeded,
    }));

    // Department resource distribution
    const departmentDist = new Map<string, number>();
    resourceTypes.forEach((rt) => {
      if (rt.department) {
        departmentDist.set(rt.department, (departmentDist.get(rt.department) || 0) + 1);
      }
    });

    const departmentData = Array.from(departmentDist.entries()).map(([dept, count]) => ({
      name: dept,
      value: count,
    }));

    // Resource type utilization radar
    const utilizationByCategory = new Map<string, { total: number; used: number }>();
    resourceTypes.forEach((rt) => {
      const util = resourceUtilization.get(rt.id);
      const current = utilizationByCategory.get(rt.category) || { total: 0, used: 0 };
      current.total++;
      if (util && util.activitiesCount > 0) {
        current.used++;
      }
      utilizationByCategory.set(rt.category, current);
    });

    const radarData = Array.from(utilizationByCategory.entries()).map(([category, stats]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      utilization: ((stats.used / stats.total) * 100).toFixed(0),
    }));

    // Treemap data for resource hierarchy
    const treemapData = Array.from(departmentDist.entries()).map(([dept, count]) => ({
      name: dept,
      size: count,
      children: resourceTypes
        .filter((rt) => rt.department === dept)
        .slice(0, 5)
        .map((rt) => {
          const util = resourceUtilization.get(rt.id);
          return {
            name: rt.name,
            size: util?.activitiesCount || 1,
          };
        }),
    }));

    // Total stats
    const totalResourceTypes = resourceTypes.length;
    const totalActivities = activities.length;
    const avgResourcesPerActivity = activities.reduce((sum, act) => sum + act.resourceTypes.length, 0) / activities.length;
    const totalSharedResources = sharedResources.length;

    return {
      resourceUtilization,
      sharedResources,
      bottleneckResources,
      underutilizedResources,
      totalResourceTypes,
      totalActivities,
      avgResourcesPerActivity,
      totalSharedResources,
      categoryData,
      activityCategoryData,
      topSharedData,
      departmentData,
      radarData,
      treemapData,
    };
  }, [activities, resourceTypes]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card size="small">
          <Statistic
            title="Total Resource Types"
            value={insights.totalResourceTypes}
            prefix={<Package className="w-4 h-4" />}
            valueStyle={{ fontSize: '24px' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Total Activities"
            value={insights.totalActivities}
            prefix={<Activity className="w-4 h-4" />}
            valueStyle={{ fontSize: '24px' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Shared Resources"
            value={insights.totalSharedResources}
            prefix={<Users className="w-4 h-4" />}
            valueStyle={{ fontSize: '24px', color: '#f59e0b' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Avg Resources/Activity"
            value={insights.avgResourcesPerActivity.toFixed(1)}
            prefix={<TrendingUp className="w-4 h-4" />}
            valueStyle={{ fontSize: '24px' }}
          />
        </Card>
      </div>

      {/* Top Shared Resources - Bar Chart */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span>Top Shared Resources</span>
          </div>
        }
        size="small"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={insights.topSharedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '12px' }} />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            />
            <Legend />
            <Bar dataKey="activities" name="Activities Using" fill="#3b82f6" />
            <Bar dataKey="required" name="Required Usage" fill="#10b981" />
            <Bar dataKey="optional" name="Optional Usage" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Resource Category Distribution - Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          title={
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-green-500" />
              <span>Resource Category Distribution</span>
            </div>
          }
          size="small"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={insights.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {insights.categoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card
          title={
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-500" />
              <span>Activity Category Distribution</span>
            </div>
          }
          size="small"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={insights.activityCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {insights.activityCategoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Department Distribution - Treemap */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-500" />
            <span>Resource Distribution by Department</span>
          </div>
        }
        size="small"
      >
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={insights.treemapData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#3b82f6"
            content={<CustomizedContent colors={COLORS} />}
          >
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            />
          </Treemap>
        </ResponsiveContainer>
      </Card>

      {/* Category Utilization - Radar Chart */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            <span>Resource Type Utilization by Category</span>
          </div>
        }
        size="small"
      >
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={insights.radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="category" style={{ fontSize: '12px' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Utilization %" dataKey="utilization" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Bottleneck Resources Alert */}
      {insights.bottleneckResources.length > 0 && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Bottleneck Resources</span>
            </div>
          }
          size="small"
        >
          <div className="space-y-3">
            {insights.bottleneckResources.slice(0, 5).map((util) => {
              const ratio = util.totalQuantityNeeded / (util.resource.capacity || 1);
              const percentage = Math.min(ratio * 100, 200);
              return (
                <div key={util.resource.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{util.resource.name}</span>
                    <span className="text-xs text-gray-500">
                      {util.totalQuantityNeeded} needed / {util.resource.capacity} capacity
                    </span>
                  </div>
                  <Progress
                    percent={percentage}
                    status={ratio > 1.5 ? 'exception' : 'normal'}
                    strokeColor={ratio > 1.5 ? '#ef4444' : '#f59e0b'}
                    size="small"
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

// Custom Treemap Content Component
const CustomizedContent: React.FC<any> = (props) => {
  const { depth, x, y, width, height, index, colors, name } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[index % colors.length] : colors[(index + 1) % colors.length],
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 && width > 60 && height > 30 ? (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
          {name}
        </text>
      ) : null}
    </g>
  );
};
