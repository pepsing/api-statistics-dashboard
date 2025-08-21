// 处理后的数据模型
export interface ProcessedApiKeyData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  lastUsed: string;
  daily: UsageMetrics;
  weekly: UsageMetrics;
  monthly: UsageMetrics;
  total: UsageMetrics;
}

export interface UsageMetrics {
  requests: number;
  tokens: number;
  cost: number;
  formattedCost: string;
}

export interface SummaryData {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  activeKeys: number;
}

export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'total';

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}