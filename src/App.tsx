import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ActivityViewPage } from './pages/dashboard/ActivityViewPage';
import { DepartmentViewPage } from './pages/dashboard/DepartmentViewPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './styles/index.css';

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#495057',
          colorBgContainer: '#ffffff',
          colorBorder: '#dee2e6',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          colorText: '#212529',
          colorTextSecondary: '#6c757d',
          colorBgLayout: '#f8f9fa',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        },
        components: {
          Card: {
            boxShadowTertiary: '0 2px 8px rgba(0, 0, 0, 0.04)',
          },
          Button: {
            primaryShadow: 'none',
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ActivityViewPage />} />
            <Route path="dept-config" element={<DepartmentViewPage />} />
            <Route path="onboarding" element={<div className="p-8">Resource Onboarding - Coming Soon</div>} />
            <Route path="process-config" element={<div className="p-8">Process Config - Coming Soon</div>} />
            <Route path="instance-config" element={<div className="p-8">Instance Config - Coming Soon</div>} />
            <Route path="analytics" element={<div className="p-8">Analytics - Coming Soon</div>} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

