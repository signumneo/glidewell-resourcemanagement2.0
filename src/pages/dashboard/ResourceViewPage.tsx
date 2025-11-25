import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, Typography, Tabs } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { Station } from '../../types/activity';
import { ResourceUtilizationChart } from '../../components/visualizations/ResourceUtilizationChart';
import { BottleneckAnalysis } from '../../components/visualizations/BottleneckAnalysis';

const { Title, Text } = Typography;

// Mock data
const mockStations: Station[] = [
  {
    id: 'STATION-MILL-01',
    name: 'CNC Mill #1',
    category: 'station',
    department: 'Machining',
    location: 'Floor 2, Bay A',
    capacity: 1,
    status: 'available',
    activities: ['ACT002', 'ACT004'],
    specifications: { axes: 5, maxRPM: 24000, workEnvelope: '500x500x500mm' },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'STATION-MILL-02',
    name: 'CNC Mill #2',
    category: 'station',
    department: 'Machining',
    location: 'Floor 2, Bay B',
    capacity: 1,
    status: 'occupied',
    activities: ['ACT002'],
    specifications: { axes: 3, maxRPM: 15000, workEnvelope: '400x400x300mm' },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'STATION-QC-01',
    name: 'Quality Station #1',
    category: 'station',
    department: 'Quality Control',
    location: 'Floor 1, QC Lab',
    capacity: 1,
    status: 'available',
    activities: ['ACT003'],
    specifications: { cmm: true, microscope: true },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'STATION-CAD-01',
    name: 'CAD Workstation #1',
    category: 'station',
    department: 'Engineering',
    location: 'Floor 3, Design Room',
    capacity: 1,
    status: 'available',
    activities: ['ACT001'],
    specifications: { software: ['SolidWorks', 'Fusion360'], gpu: 'NVIDIA RTX 4090' },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'STATION-ASSEMBLY-01',
    name: 'Assembly Station #1',
    category: 'station',
    department: 'Assembly',
    location: 'Floor 1, Assembly Line',
    capacity: 2,
    status: 'available',
    activities: ['ACT005'],
    specifications: { tools: ['pneumatic', 'torque-wrench'] },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

const getStatusColor = (status: Station['status']) => {
  const colors = {
    available: 'success',
    occupied: 'processing',
    maintenance: 'warning',
    offline: 'error',
  };
  return colors[status];
};

export const ResourceViewPage = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Mock data for visualizations
  const utilizationData = mockStations.map(station => ({
    resourceId: station.id,
    resourceName: station.name,
    utilization: station.status === 'occupied' ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 20,
    capacity: station.capacity || 1,
    activeJobs: station.status === 'occupied' ? Math.floor(Math.random() * 3) + 1 : 0,
  }));

  const bottleneckData = mockStations.filter(s => s.status === 'occupied').map(station => {
    const severity = Math.random();
    return {
      resourceId: station.id,
      resourceName: station.name,
      activityId: station.activities[0],
      activityName: station.activities[0],
      delayMinutes: Math.floor(Math.random() * 60) + 10,
      frequency: Math.floor(Math.random() * 30) + 5,
      severity: (severity > 0.75 ? 'critical' : severity > 0.5 ? 'high' : severity > 0.25 ? 'medium' : 'low') as 'low' | 'medium' | 'high' | 'critical',
    };
  });

  const columns = [
    {
      title: 'Station ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text: string) => (
        <Text strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Station Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Station) => (
        <div>
          <Text strong>{text}</Text>
          {record.location && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <EnvironmentOutlined /> {record.location}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 140,
      render: (dept: string) => <Tag>{dept}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: Station['status']) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Compatible Activities',
      dataIndex: 'activities',
      key: 'activities',
      render: (activities: string[]) => (
        <Space size={[0, 4]} wrap>
          {activities.map((actId) => (
            <Tag key={actId} color="processing">
              {actId}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: () => (
        <Space size="small">
          <Button type="link" size="small">
            Edit
          </Button>
          <Button type="link" size="small">
            View
          </Button>
        </Space>
      ),
    },
  ];

  const filteredData = mockStations.filter((station) => {
    const matchesSearch =
      station.name.toLowerCase().includes(searchText.toLowerCase()) ||
      station.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesDept =
      selectedDepartment === 'all' || station.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Resource Type View
          </Title>
          <Text type="secondary">
            Stations and their compatible activities
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          New Station
        </Button>
      </div>

      <Card bordered={false} className="shadow-soft">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space size="middle">
            <Input
              placeholder="Search stations..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              size="large"
            />
            <Select
              defaultValue="all"
              style={{ width: 200 }}
              size="large"
              onChange={setSelectedDepartment}
              options={[
                { value: 'all', label: 'All Departments' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Machining', label: 'Machining' },
                { value: 'Quality Control', label: 'Quality Control' },
                { value: 'Assembly', label: 'Assembly' },
              ]}
            />
            <Button icon={<FilterOutlined />} size="large">
              Filters
            </Button>
          </Space>

          <Tabs
            items={[
              {
                key: 'stations',
                label: 'Stations',
                children: (
                  <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} stations`,
                    }}
                    size="middle"
                  />
                ),
              },
              {
                key: 'utilization',
                label: 'Utilization',
                children: (
                  <div className="flex justify-center py-6">
                    <ResourceUtilizationChart data={utilizationData} />
                  </div>
                ),
              },
              {
                key: 'bottlenecks',
                label: 'Bottleneck Analysis',
                children: (
                  <div className="flex justify-center py-6">
                    <BottleneckAnalysis data={bottleneckData} />
                  </div>
                ),
              },
              {
                key: 'personnel',
                label: 'Personnel',
                children: <div className="p-8 text-center text-gray-500">Coming soon</div>,
              },
              {
                key: 'equipment',
                label: 'Equipment',
                children: <div className="p-8 text-center text-gray-500">Coming soon</div>,
              },
            ]}
          />
        </Space>
      </Card>
    </div>
  );
};
