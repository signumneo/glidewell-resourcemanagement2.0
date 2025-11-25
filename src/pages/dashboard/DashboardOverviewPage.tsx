import { Card, Row, Col, Typography, Statistic, Progress } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  TeamOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const { Title, Text } = Typography;

// Sample data
const processData = [
  { month: 'Jan', cases: 320, efficiency: 82 },
  { month: 'Feb', cases: 380, efficiency: 85 },
  { month: 'Mar', cases: 420, efficiency: 88 },
  { month: 'Apr', cases: 390, efficiency: 86 },
  { month: 'May', cases: 450, efficiency: 90 },
  { month: 'Jun', cases: 480, efficiency: 92 },
];

export const DashboardOverviewPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <Title level={2}>Dashboard Overview</Title>
        <Text type="secondary">Welcome back! Here's what's happening with your processes today.</Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md rounded-xl card-hover">
            <Statistic
              title="Active Processes"
              value={42}
              prefix={<ProjectOutlined />}
              suffix={<ArrowUpOutlined style={{ color: '#52c41a', fontSize: '14px' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" className="text-xs">+12% from last month</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md rounded-xl card-hover">
            <Statistic
              title="Total Resources"
              value={156}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary" className="text-xs">Across all departments</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md rounded-xl card-hover">
            <Statistic
              title="Avg Cycle Time"
              value={3.2}
              suffix="days"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary" className="text-xs">
              <ArrowDownOutlined style={{ color: '#52c41a' }} /> -8% improvement
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md rounded-xl card-hover">
            <div>
              <Text type="secondary">Process Efficiency</Text>
              <div className="mt-2">
                <Progress
                  percent={89}
                  strokeColor={{
                    '0%': '#1890ff',
                    '100%': '#52c41a',
                  }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="shadow-md rounded-xl" title="Process Cases Trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cases"
                  stroke="#1890ff"
                  fill="#1890ff"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="shadow-md rounded-xl" title="Efficiency Score">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#52c41a"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Card className="shadow-md rounded-xl" title="Recent Process Activities">
        <div className="space-y-4">
          {[
            { title: 'Purchase Order #1247 completed', time: '5 minutes ago', status: 'success' },
            { title: 'New resource allocated to Project Alpha', time: '1 hour ago', status: 'info' },
            { title: 'Bottleneck detected in approval process', time: '2 hours ago', status: 'warning' },
            { title: 'Process optimization applied', time: '3 hours ago', status: 'success' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <Text strong>{activity.title}</Text>
                <br />
                <Text type="secondary" className="text-xs">{activity.time}</Text>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
