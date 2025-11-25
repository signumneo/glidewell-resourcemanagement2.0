import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('Login successful!');
      navigate('/dashboard');
    } catch {
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-12">
          <Title level={2} className="mb-2" style={{ fontWeight: 600, color: '#212529' }}>
            Resource Management
          </Title>
          <Text type="secondary" className="text-base">
            Manufacturing Activity Framework
          </Text>
        </div>

        <Card className="shadow-medium rounded-xl" bordered={false} style={{ borderRadius: '12px' }}>
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="username"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter email"
                type="email"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter password"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '24px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ 
                  height: '48px', 
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '15px'
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center text-sm text-gray-500 mt-4">
            <Text type="secondary">Use your Glidewell email and password</Text>
          </div>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <Text type="secondary">
            © 2025 Resource Management System
          </Text>
        </div>
      </div>
    </div>
  );
};
