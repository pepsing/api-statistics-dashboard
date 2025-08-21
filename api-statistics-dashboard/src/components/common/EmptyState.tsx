import React from 'react';
import { Empty, Button } from 'antd';
import { InboxOutlined, ReloadOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
  image?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = '当前没有可显示的数据',
  showRefresh = false,
  onRefresh,
  image,
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '60px 20px' 
    }}>
      <Empty
        image={image || <InboxOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
        styles={{
          image: {
            height: 80,
          },
        }}
        description={
          <div>
            <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
              {title}
            </div>
            <div style={{ color: '#999', fontSize: '14px' }}>
              {description}
            </div>
          </div>
        }
      >
        {showRefresh && onRefresh && (
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={onRefresh}
          >
            刷新数据
          </Button>
        )}
      </Empty>
    </div>
  );
};