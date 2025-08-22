import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { 
  ApiOutlined, 
  ThunderboltOutlined, 
  DollarOutlined 
} from '@ant-design/icons';
import { type ApiKeyData } from '../../types';
import { DataTransformer } from '../../services/dataTransformer';

interface SummaryCardsProps {
  data: ApiKeyData[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  const summary = DataTransformer.calculateSummary(data);

  // 格式化令牌数为 K/M 格式
  const formatTokens = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <Row gutter={[16, 16]}>
      {/* 请求数统计卡片 */}
      <Col xs={24} sm={24} lg={8}>
        <Card>
          <Statistic
            title="请求数统计"
            value={summary.total.totalRequests}
            formatter={(value) => DataTransformer.formatNumber(Number(value))}
            prefix={<ApiOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
          />
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>今日：</span>
              <span style={{ color: '#1890ff' }}>{DataTransformer.formatNumber(summary.today.totalRequests)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>7天：</span>
              <span style={{ color: '#096dd9' }}>{DataTransformer.formatNumber(summary.sevenDays.totalRequests)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>当月：</span>
              <span style={{ color: '#0050b3' }}>{DataTransformer.formatNumber(summary.monthly.totalRequests)}</span>
            </div>
          </div>
        </Card>
      </Col>

      {/* 令牌数统计卡片 */}
      <Col xs={24} sm={24} lg={8}>
        <Card>
          <Statistic
            title="令牌数统计"
            value={formatTokens(summary.total.totalTokens)}
            prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
          />
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>今日：</span>
              <span style={{ color: '#52c41a' }}>{formatTokens(summary.today.totalTokens)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>7天：</span>
              <span style={{ color: '#389e0d' }}>{formatTokens(summary.sevenDays.totalTokens)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>当月：</span>
              <span style={{ color: '#237804' }}>{formatTokens(summary.monthly.totalTokens)}</span>
            </div>
          </div>
        </Card>
      </Col>

      {/* 成本统计卡片 */}
      <Col xs={24} sm={24} lg={8}>
        <Card>
          <Statistic
            title="成本统计"
            value={summary.total.totalCost}
            formatter={(value) => DataTransformer.formatCost(Number(value))}
            prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
            valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: 'bold' }}
          />
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>今日：</span>
              <span style={{ color: '#fa8c16' }}>{DataTransformer.formatCost(summary.today.totalCost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>7天：</span>
              <span style={{ color: '#d46b08' }}>{DataTransformer.formatCost(summary.sevenDays.totalCost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>当月：</span>
              <span style={{ color: '#ad4e00' }}>{DataTransformer.formatCost(summary.monthly.totalCost)}</span>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};