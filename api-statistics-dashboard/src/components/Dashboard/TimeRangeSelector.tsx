import React from 'react';
import { Radio, Space } from 'antd';
import { ClockCircleOutlined, BarChartOutlined } from '@ant-design/icons';
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
      value: 'today' as TimeRange,
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