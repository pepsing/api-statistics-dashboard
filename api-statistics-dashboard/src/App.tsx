import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthComponent } from './components/Auth';
import { DashboardComponent } from './components/Dashboard';
import { ErrorBoundary } from './components/common';
import { useAuth } from './hooks';
import './App.css';

function App() {
  const { token, isAuthenticated, isLoading, error, login, logout } = useAuth();

  // 应用初始化加载状态
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <div style={{ color: '#666' }}>正在初始化应用...</div>
      </div>
    );
  }

  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        algorithm: undefined, // 禁用暗黑主题，强制使用浅色主题
        token: {
          colorBgBase: '#ffffff',
          colorTextBase: '#000000',
        }
      }}
    >
      <ErrorBoundary>
        {isAuthenticated && token ? (
          <DashboardComponent
            token={token}
            onLogout={logout}
          />
        ) : (
          <AuthComponent
            onAuthSuccess={login}
            isLoading={isLoading}
            error={error}
          />
        )}
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
