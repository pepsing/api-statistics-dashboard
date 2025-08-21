import React from 'react';
import { Alert, Button, Space } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { ErrorType, type AppError } from '../../types';

interface RetryableErrorProps {
  error: string | AppError;
  errorType?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
}

export const RetryableError: React.FC<RetryableErrorProps> = ({
  error,
  errorType,
  onRetry,
  onDismiss,
  showRetry = true,
}) => {
  const resolvedType: ErrorType = (typeof error === 'object' && error && 'type' in error)
    ? (error as AppError).type
    : (errorType ?? ErrorType.API_ERROR);

  const messageText = typeof error === 'string' ? error : error?.message;

  const getErrorConfig = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
        return {
          type: 'error' as const,
          message: '网络连接失败',
          description: messageText || '请检查您的网络连接，然后重试。',
          icon: <ExclamationCircleOutlined />,
        };
      case ErrorType.AUTH_ERROR:
        return {
          type: 'warning' as const,
          message: '认证失败',
          description: messageText || '您的登录状态已过期，请重新登录。',
          icon: <ExclamationCircleOutlined />,
        };
      case ErrorType.API_ERROR:
        return {
          type: 'error' as const,
          message: 'API调用失败',
          description: messageText || '服务器响应异常，请稍后重试。',
          icon: <ExclamationCircleOutlined />,
        };
      case ErrorType.DATA_ERROR:
        return {
          type: 'warning' as const,
          message: '数据处理错误',
          description: messageText || '数据格式异常，请联系管理员。',
          icon: <ExclamationCircleOutlined />,
        };
      default:
        return {
          type: 'error' as const,
          message: '未知错误',
          description: messageText || '发生了未知错误，请重试。',
          icon: <ExclamationCircleOutlined />,
        };
    }
  };

  const config = getErrorConfig(resolvedType);

  const actions = [];
  
  if (showRetry && onRetry) {
    actions.push(
      <Button 
        key="retry"
        type="primary" 
        size="small" 
        icon={<ReloadOutlined />}
        onClick={onRetry}
      >
        重试
      </Button>
    );
  }

  if (onDismiss) {
    actions.push(
      <Button 
        key="dismiss"
        size="small" 
        onClick={onDismiss}
      >
        关闭
      </Button>
    );
  }

  return (
    <Alert
      message={config.message}
      description={config.description}
      type={config.type}
      showIcon
      icon={config.icon}
      action={
        actions.length > 0 ? (
          <Space size="small">
            {actions}
          </Space>
        ) : undefined
      }
      style={{ marginBottom: '16px' }}
    />
  );
};