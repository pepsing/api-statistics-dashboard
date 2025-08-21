import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message = '加载中...',
  fullScreen = false,
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 24 : 16 }} spin />;

  const content = (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '16px' 
    }}>
      <Spin indicator={antIcon} size={size} />
      {message && (
        <Text type="secondary" style={{ fontSize: '14px' }}>
          {message}
        </Text>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 20px',
    }}>
      {content}
    </div>
  );
};