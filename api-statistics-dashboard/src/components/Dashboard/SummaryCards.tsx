import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { 
  ApiOutlined, 
  ThunderboltOutlined, 
  DollarOutlined, 
  KeyOutlined 
} from '@ant-design/icons';
import { type ApiKeyData, type TimeRange } from '../../types';
import { DataTransformer } from '../../services/dataTransformer';

interface SummaryCardsProps {
  data: ApiKeyData[];
  timeRange: TimeRange;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data, timeRange }) => {
  const summary = DataTransformer.calculateSummary(data, timeRange);

  const getTimeRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case 'daily':
        return '今日';
      case 'weekly':
        return '本周';
      case 'monthly':
        return '本月';
      case 'total':
      default:
        return '总计';
    }
  };

  const timeLabel = getTimeRangeLabel(timeRange);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={`${timeLabel}请求数`}
            value={summary.totalRequests}
            formatter={(value) => DataTransformer.formatNumber(Number(value))}
            prefix={<ApiOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={`${timeLabel}令牌数`}
            value={summary.totalTokens}
            formatter={(value) => DataTransformer.formatNumber(Number(value))}
            prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={`${timeLabel}成本`}
            value={summary.totalCost}
            formatter={(value) => DataTransformer.formatCost(Number(value))}
            prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="活跃密钥"
            value={summary.activeKeys}
            suffix={`/ ${data.length}`}
            prefix={<KeyOutlined style={{ color: '#722ed1' }} />}
          />
        </Card>
      </Col>
    </Row>
  );
};