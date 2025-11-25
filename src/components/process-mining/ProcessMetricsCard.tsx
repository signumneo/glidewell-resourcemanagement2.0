import { Card, Statistic, Row, Col } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RiseOutlined,
} from '@ant-design/icons';

interface MetricsCardProps {
  totalCases: number;
  avgDuration: string;
  efficiency: number;
  bottlenecks: number;
}

export const ProcessMetricsCard = ({
  totalCases,
  avgDuration,
  efficiency,
  bottlenecks,
}: MetricsCardProps) => {
  return (
    <Card className="shadow-md rounded-xl">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-blue-50 border-blue-200">
            <Statistic
              title="Total Cases"
              value={totalCases}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-green-50 border-green-200">
            <Statistic
              title="Avg Duration"
              value={avgDuration}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-purple-50 border-purple-200">
            <Statistic
              title="Efficiency"
              value={efficiency}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-orange-50 border-orange-200">
            <Statistic
              title="Bottlenecks"
              value={bottlenecks}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};
