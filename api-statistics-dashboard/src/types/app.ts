import type { ApiKeyData } from './api';
import type { ProcessedApiKeyData, SummaryData, SortConfig, TimeRange } from './dashboard';

// 应用状态模型
export interface AppState {
  auth: {
    token: string | null;
    isAuthenticated: boolean;
  };
  dashboard: {
    data: ApiKeyData[];
    processedData: ProcessedApiKeyData[];
    summary: SummaryData;
    timeRange: TimeRange;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
  ui: {
    sortConfig: SortConfig;
  };
}

// 错误处理类型 - 使用字符串常量替代枚举
export const ErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  API_ERROR: 'API_ERROR',
  DATA_ERROR: 'DATA_ERROR'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}