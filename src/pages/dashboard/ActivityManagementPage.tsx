import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Table,
  Modal,
  Space,
  Tag,
  Typography,
  Card,
  InputNumber,
} from 'antd';
import { Plus, Edit2, Trash2, Activity, Filter, Network, GitBranch } from 'lucide-react';
import type { GlobalActivity, ResourceTypeAssociation } from '../../types/globalActivity';
import { globalActivities as initialActivities, resourceTypes } from '../../data/globalActivityData';
import { FilterPanel } from '../../components/ui/FilterPanel';
import ActivityViewGraph from '../../components/visualizations/ActivityViewGraph';
import { NetworkTopologyView } from '../../components/visualizations/NetworkTopologyView';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ActivityManagementPage: React.FC = () => {
  const [activities, setActivities] = useState<GlobalActivity[]>(initialActivities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<GlobalActivity | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'graph' | 'topology'>('table');
  const [form] = Form.useForm();

  const categories = ['design', 'manufacturing', 'quality', 'finishing', 'assembly', 'packaging'];
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);

  const categoryOptions = [
    { value: 'design', label: 'Design' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'quality', label: 'Quality' },
    { value: 'finishing', label: 'Finishing' },
    { value: 'assembly', label: 'Assembly' },
    { value: 'packaging', label: 'Packaging' },
  ];

  const resourceTypeOptions = resourceTypes.map((rt) => ({
    value: rt.id,
    label: `${rt.name} (${rt.category})`,
    category: rt.category,
    name: rt.name,
  }));

  const handleAddActivity = () => {
    setEditingActivity(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity: GlobalActivity) => {
    setEditingActivity(activity);
    form.setFieldsValue({
      id: activity.id,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      estimatedDuration: activity.estimatedDuration,
      resourceTypes: activity.resourceTypes.map((rt) => rt.resourceTypeId),
    });
    setIsModalOpen(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    Modal.confirm({
      title: 'Delete Activity',
      content: 'Are you sure you want to delete this activity?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setActivities(activities.filter((a) => a.id !== activityId));
      },
    });
  };

  const handleSaveActivity = () => {
    form.validateFields().then((values) => {
      const selectedResourceTypes: ResourceTypeAssociation[] = values.resourceTypes.map(
        (rtId: string) => {
          const rt = resourceTypes.find((r) => r.id === rtId);
          return {
            resourceTypeId: rtId,
            resourceTypeName: rt?.name || '',
            resourceCategory: rt?.category || 'station',
            isRequired: true,
            quantity: 1,
          };
        }
      );

      const now = new Date();
      if (editingActivity) {
        // Update existing activity
        setActivities(
          activities.map((a) =>
            a.id === editingActivity.id
              ? {
                  ...a,
                  name: values.name,
                  description: values.description,
                  category: values.category,
                  estimatedDuration: values.estimatedDuration,
                  resourceTypes: selectedResourceTypes,
                  updatedAt: now,
                }
              : a
          )
        );
      } else {
        // Create new activity
        const newActivity: GlobalActivity = {
          id: values.id,
          name: values.name,
          description: values.description,
          category: values.category,
          estimatedDuration: values.estimatedDuration,
          resourceTypes: selectedResourceTypes,
          createdAt: now,
          updatedAt: now,
        };
        setActivities([...activities, newActivity]);
      }

      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const columns = [
    {
      title: 'Activity ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => <Text strong>{id}</Text>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (category: string) => (
        <Tag color="blue">{category.charAt(0).toUpperCase() + category.slice(1)}</Tag>
      ),
    },
    {
      title: 'Duration (min)',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      width: 120,
      align: 'center' as const,
    },
    {
      title: 'Resource Types',
      dataIndex: 'resourceTypes',
      key: 'resourceTypes',
      render: (resourceTypes: ResourceTypeAssociation[]) => (
        <Space size={[0, 4]} wrap>
          {resourceTypes.map((rt) => (
            <Tag key={rt.resourceTypeId} className="text-xs">
              {rt.resourceTypeName}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: GlobalActivity) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<Edit2 size={16} />}
            onClick={() => handleEditActivity(record)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          />
          <Button
            type="text"
            size="small"
            icon={<Trash2 size={16} />}
            onClick={() => handleDeleteActivity(record.id)}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
          />
        </Space>
      ),
    },
  ];

  // Filter activities by selected categories
  const filteredActivities = activities.filter((activity) =>
    selectedCategories.includes(activity.category)
  );

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    setSelectedCategories(categories);
  };

  const handleSelectNone = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="h-full overflow-auto bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Activity size={32} className="text-gray-700" />
            <div>
              <Title level={2} className="!mb-0">
                Activity Management
              </Title>
              <Text type="secondary" className="text-sm">
                Define and manage global activities with resource type associations
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="large"
              icon={<Filter size={18} />}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="border-gray-300 hover:bg-gray-50 focus:outline-none"
            >
              Filters
            </Button>
            <Button
              size="large"
              icon={<Network size={18} />}
              onClick={() => setViewMode(viewMode === 'graph' ? 'table' : 'graph')}
              className={`border-gray-300 hover:bg-gray-50 focus:outline-none ${viewMode === 'graph' ? 'bg-gray-100' : ''}`}
            >
              Graph View
            </Button>
            <Button
              size="large"
              icon={<GitBranch size={18} />}
              onClick={() => setViewMode(viewMode === 'topology' ? 'table' : 'topology')}
              className={`border-gray-300 hover:bg-gray-50 focus:outline-none ${viewMode === 'topology' ? 'bg-gray-100' : ''}`}
            >
              Topology View
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={18} />}
              onClick={handleAddActivity}
              className="bg-gray-800 hover:bg-gray-900 border-0 shadow-none"
            >
              Add Activity
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter Panel */}
          {isFilterOpen && viewMode === 'table' && (
            <div className="flex-shrink-0">
              <FilterPanel
                title="Category Filters"
                filters={categories}
                selectedFilters={selectedCategories}
                onFilterToggle={handleCategoryToggle}
                onSelectAll={handleSelectAll}
                onSelectNone={handleSelectNone}
                onClose={() => setIsFilterOpen(false)}
                isCollapsible={true}
                formatLabel={(filter) => filter.charAt(0).toUpperCase() + filter.slice(1)}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {viewMode === 'topology' ? (
              <div style={{ height: 'calc(100vh - 200px)' }}>
                <NetworkTopologyView />
              </div>
            ) : viewMode === 'graph' ? (
              <div style={{ height: 'calc(100vh - 200px)' }}>
                <ActivityViewGraph />
              </div>
            ) : (
              <Card className="shadow-sm border-gray-200">
                <Table
                  columns={columns}
                  dataSource={filteredActivities}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} activities`,
                  }}
                  className="activities-table"
                />
              </Card>
            )}
          </div>
        </div>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <Activity size={20} />
              <span>{editingActivity ? 'Edit Activity' : 'Add New Activity'}</span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          onOk={handleSaveActivity}
          width={700}
          okText={editingActivity ? 'Update' : 'Create'}
          okButtonProps={{
            className: 'bg-gray-800 hover:bg-gray-900 border-0',
          }}
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              name="id"
              label="Activity ID"
              rules={[
                { required: true, message: 'Please enter an activity ID' },
                {
                  pattern: /^GA-\d{3,}$/,
                  message: 'ID must follow format: GA-001, GA-002, etc.',
                },
              ]}
            >
              <Input
                placeholder="GA-001"
                disabled={!!editingActivity}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="Activity Name"
              rules={[{ required: true, message: 'Please enter activity name' }]}
            >
              <Input placeholder="e.g., CNC Machining" className="rounded-lg" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea
                rows={3}
                placeholder="Brief description of the activity..."
                className="rounded-lg"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select
                  placeholder="Select category"
                  options={categoryOptions}
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="estimatedDuration"
                label="Estimated Duration (minutes)"
              >
                <InputNumber
                  min={1}
                  max={1440}
                  placeholder="60"
                  className="w-full rounded-lg"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="resourceTypes"
              label="Resource Types"
              rules={[
                { required: true, message: 'Please select at least one resource type' },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select resource types"
                options={resourceTypeOptions}
                optionFilterProp="label"
                className="rounded-lg"
                maxTagCount="responsive"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>

      <style>{`
        .activities-table .ant-table-thead > tr > th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        .activities-table .ant-table-tbody > tr:hover > td {
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default ActivityManagementPage;
