import React from 'react';
import { Radio, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import { type TimeRange } from '../../types';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  const options = [
    {
      label: (
        <Space>
          <ClockCircleOutlined />
          今日
        </Space>
      ),
      value: 'daily' as TimeRange,
    },
    {
      label: (
        <Space>
          <CalendarOutlined />
          本周
        </Space>
      ),
      value: 'weekly' as TimeRange,
    },
    {
      label: (
        <Space>
          <CalendarOutlined />
          本月
        </Space>
      ),
      value: 'monthly' as TimeRange,
    },
    {
      label: (
        <Space>
          <BarChartOutlined />
          总计
        </Space>
      ),
      value: 'total' as TimeRange,
    },
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <Radio.Group
        value={value}
        onChange={(e) => onChange(e.target.value)}
        buttonStyle="solid"
        size="large"
        style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        {options.map((option) => (
          <Radio.Button 
            key={option.value} 
            value={option.value}
            style={{ 
              flex: '1',
              textAlign: 'center',
              minWidth: '80px'
            }}
          >
            {option.label}
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  );
}