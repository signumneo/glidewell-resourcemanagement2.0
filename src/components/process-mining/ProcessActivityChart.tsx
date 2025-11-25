import { Card, Typography } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const { Title } = Typography;

interface ActivityData {
  name: string;
  count: number;
  avgDuration: number;
}

interface ProcessActivityChartProps {
  data: ActivityData[];
}

export const ProcessActivityChart = ({ data }: ProcessActivityChartProps) => {
  return (
    <Card className="shadow-md rounded-xl">
      <Title level={4}>Activity Frequency & Duration</Title>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="#1890ff" />
          <YAxis yAxisId="right" orientation="right" stroke="#52c41a" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="count" fill="#1890ff" name="Frequency" />
          <Bar yAxisId="right" dataKey="avgDuration" fill="#52c41a" name="Avg Duration (hrs)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
