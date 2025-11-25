import React, { useState } from 'react';
import { Table, Button, Input, Modal, Form, Select, InputNumber, Tag, Space } from 'antd';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { mainProcesses, globalResources, type Subprocess } from '../../data/hierarchicalProcessData';

export const ActivityTableView: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedMainProcess, setSelectedMainProcess] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubprocess, setEditingSubprocess] = useState<Subprocess | null>(null);
  const [pageSize, setPageSize] = useState(20);
  const [form] = Form.useForm();

  // Flatten all subprocesses with their main process info
  const allSubprocesses = mainProcesses.flatMap(mp =>
    mp.subprocesses.map(sp => ({
      ...sp,
      mainProcessId: mp.id,
      mainProcessName: mp.name,
      mainProcessColor: mp.color,
    }))
  );

  // Filter subprocesses
  const filteredData = allSubprocesses.filter(sp => {
    const matchesSearch = sp.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         sp.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesProcess = selectedMainProcess === 'all' || sp.mainProcessId === selectedMainProcess;
    return matchesSearch && matchesProcess;
  });

  const handleAdd = () => {
    setEditingSubprocess(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: typeof allSubprocesses[0]) => {
    setEditingSubprocess(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      duration: record.duration,
      mainProcessId: record.mainProcessId,
      resourceTypes: record.resourceTypes,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (record: typeof allSubprocesses[0]) => {
    Modal.confirm({
      title: 'Delete Subprocess',
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        // TODO: Implement delete logic
        console.log('Delete:', record.id);
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingSubprocess) {
        // TODO: Implement update logic
        console.log('Update:', editingSubprocess.id, values);
      } else {
        // TODO: Implement create logic
        console.log('Create:', values);
      }
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text: string, record: typeof allSubprocesses[0]) => (
        <Tag
          style={{
            backgroundColor: `${record.mainProcessColor}20`,
            color: record.mainProcessColor,
            border: 'none',
            fontWeight: 600,
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Subprocess Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: 'Main Process',
      dataIndex: 'mainProcessName',
      key: 'mainProcessName',
      width: 150,
      render: (text: string, record: typeof allSubprocesses[0]) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: record.mainProcessColor }}
          />
          <span className="text-gray-700">{text}</span>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: number) => <span className="text-gray-600">{duration} min</span>,
    },
    {
      title: 'Resources',
      dataIndex: 'resourceTypes',
      key: 'resourceTypes',
      width: 300,
      render: (resources: string[]) => (
        <div className="flex flex-wrap gap-1">
          {resources.slice(0, 3).map(resourceId => {
            const resource = globalResources.find(r => r.id === resourceId);
            return resource ? (
              <Tag key={resourceId} className="text-xs">
                {resource.name}
              </Tag>
            ) : null;
          })}
          {resources.length > 3 && (
            <Tag className="text-xs text-gray-500">+{resources.length - 3} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <span className="text-gray-600 text-sm">{text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: typeof allSubprocesses[0]) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        {/* Filters */}
        <div className="flex gap-3">
          <Input
            placeholder="Search by name or ID..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs"
            allowClear
          />
          <Select
            value={selectedMainProcess}
            onChange={setSelectedMainProcess}
            className="w-48"
          >
            <Select.Option value="all">All Processes</Select.Option>
            {mainProcesses.map(mp => (
              <Select.Option key={mp.id} value={mp.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: mp.color }}
                  />
                  {mp.name}
                </div>
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAdd}
          >
            Add Subprocess
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: pageSize,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} subprocesses`,
            onShowSizeChange: (_, size) => setPageSize(size),
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1200 }}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={editingSubprocess ? 'Edit Subprocess' : 'Add Subprocess'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Subprocess Name"
            rules={[{ required: true, message: 'Please enter subprocess name' }]}
          >
            <Input placeholder="e.g., CAD Modeling" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Describe the subprocess..."
            />
          </Form.Item>

          <Form.Item
            name="mainProcessId"
            label="Main Process"
            rules={[{ required: true, message: 'Please select main process' }]}
          >
            <Select placeholder="Select main process">
              {mainProcesses.map(mp => (
                <Select.Option key={mp.id} value={mp.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: mp.color }}
                    />
                    {mp.name}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="resourceTypes"
            label="Resources"
            rules={[{ required: true, message: 'Please select at least one resource' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select resources"
              optionFilterProp="children"
            >
              {globalResources.map(resource => (
                <Select.Option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
