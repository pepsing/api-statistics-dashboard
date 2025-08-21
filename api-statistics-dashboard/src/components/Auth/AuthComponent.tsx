import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Alert, Typography } from 'antd';
import { KeyOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface AuthComponentProps {
  onAuthSuccess: (token: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export const AuthComponent: React.FC<AuthComponentProps> = ({
  onAuthSuccess,
  isLoading,
  error,
}) => {
  const [form] = Form.useForm();
  const [token, setToken] = useState('');

  // 组件挂载时尝试从localStorage获取保存的token
  useEffect(() => {
    const savedToken = localStorage.getItem('api-dashboard-token');
    if (savedToken) {
      setToken(savedToken);
      form.setFieldsValue({ token: savedToken });
    }
  }, [form]);

  const handleSubmit = async (values: { token: string }) => {
    const trimmedToken = values.token.trim();
    
    // 保存token到localStorage
    localStorage.setItem('api-dashboard-token', trimmedToken);
    
    // 调用父组件的认证成功回调
    onAuthSuccess(trimmedToken);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const clearSavedToken = () => {
    localStorage.removeItem('api-dashboard-token');
    setToken('');
    form.resetFields();
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
        styles={{ body: { padding: '32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <KeyOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            API统计仪表板
          </Title>
          <Text type="secondary">
            请输入您的授权令牌以访问统计数据
          </Text>
        </div>

        {!!error && (
          <Alert
            message="认证失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
            action={
              <Button size="small" onClick={clearSavedToken}>
                清除保存的令牌
              </Button>
            }
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="token"
            label="授权令牌 (Bearer Token)"
            rules={[
              { required: true, message: '请输入授权令牌' },
              { min: 10, message: '令牌长度至少为10个字符' },
              {
                pattern: /^[a-zA-Z0-9]+$/,
                message: '令牌只能包含字母和数字'
              }
            ]}
          >
            <Input.Password
              placeholder="请输入您的Bearer令牌"
              value={token}
              onChange={handleTokenChange}
              size="large"
              prefix={<KeyOutlined />}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              size="large"
              icon={<LoginOutlined />}
            >
              {isLoading ? '验证中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            令牌将安全保存在本地，用于后续访问
          </Text>
        </div>
      </Card>
    </div>
  );
};