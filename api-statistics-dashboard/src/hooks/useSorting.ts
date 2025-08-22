import { useState, useMemo } from 'react';
import { type ProcessedApiKeyData, type SortConfig } from '../types';
import { DataTransformer } from '../services/dataTransformer';

export const useSorting = (data: ProcessedApiKeyData[]) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'total.cost',
    direction: 'desc',
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return data; // 返回原始数据，不排序
    }
    return DataTransformer.sortData(data, sortConfig.field, sortConfig.direction);
  }, [data, sortConfig]);

  const handleSort = (field: string) => {
    setSortConfig((prevConfig) => {
      // 如果点击的是同一个字段，在三种状态间切换
      if (prevConfig.field === field) {
        if (prevConfig.direction === 'desc') {
          return { field, direction: 'asc' };
        } else if (prevConfig.direction === 'asc') {
          return { field: null, direction: null }; // 取消排序
        } else {
          return { field, direction: 'desc' }; // 从取消状态回到降序
        }
      }
      
      // 如果是新字段，默认使用降序（对于数值字段更有意义）
      const isNumericField = field.includes('cost') || 
                            field.includes('requests') || 
                            field.includes('tokens');
      
      return {
        field,
        direction: isNumericField ? 'desc' : 'asc',
      };
    });
  };

  return {
    sortedData,
    sortConfig,
    handleSort,
  };
};