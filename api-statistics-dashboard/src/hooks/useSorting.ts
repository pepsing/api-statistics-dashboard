import { useState, useMemo } from 'react';
import { type ProcessedApiKeyData, type SortConfig } from '../types';
import { DataTransformer } from '../services/dataTransformer';

export const useSorting = (data: ProcessedApiKeyData[]) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'total.cost',
    direction: 'desc',
  });

  const sortedData = useMemo(() => {
    return DataTransformer.sortData(data, sortConfig.field, sortConfig.direction);
  }, [data, sortConfig]);

  const handleSort = (field: string) => {
    setSortConfig((prevConfig) => {
      // 如果点击的是同一个字段，切换排序方向
      if (prevConfig.field === field) {
        return {
          field,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
        };
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