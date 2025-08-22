// 处理后的数据模型
export interface ProcessedApiKeyData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastUsed: string;
  today: UsageMetrics;
  sevenDays: UsageMetrics;
  monthly: UsageMetrics;
  total: UsageMetrics;
  daily: UsageMetrics; // 日均数据作为参考
}

export interface UsageMetrics {
  requests: number;
  tokens: number;
  cost: number;
  formattedCost: string;
}

export interface SummaryData {
  today: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
  };
  sevenDays: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
  };
  monthly: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
  };
  total: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
  };
  activeKeys: number;
}

export type TimeRange = 'today' | '7days' | 'monthly' | 'all';

export interface SortConfig {
  field: string | null;
  direction: 'asc' | 'desc' | null;
}