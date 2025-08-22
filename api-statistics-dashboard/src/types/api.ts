// API响应数据模型
export interface ApiResponse {
  success: boolean;
  data: ApiKeyData[];
}

export interface ApiKeyData {
  id: string;
  name: string;
  description: string;
  tokenLimit: number;
  concurrencyLimit: number;
  rateLimitWindow: number;
  rateLimitRequests: number;
  isActive: boolean;
  claudeAccountId: string;
  claudeConsoleAccountId: string;
  geminiAccountId: string;
  openaiAccountId: string;
  permissions: string;
  enableModelRestriction: boolean;
  restrictedModels: string[];
  enableClientRestriction: boolean;
  allowedClients: string[];
  dailyCostLimit: number;
  tags: string[];
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  createdBy: string;
  usage: {
    total: UsageStats;
    daily: UsageStats;
    monthly: UsageStats;
    today: UsageStats;
    sevenDays: UsageStats;
    averages: AverageStats;
  };
  currentConcurrency: number;
  dailyCost: number;
  currentWindowRequests: number;
  currentWindowTokens: number;
  windowStartTime: string | null;
  windowEndTime: string | null;
  windowRemainingSeconds: number | null;
}

export interface UsageStats {
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheCreateTokens: number;
  cacheReadTokens: number;
  allTokens: number;
  requests: number;
  cost?: number;
  formattedCost?: string;
}

export interface AverageStats {
  rpm: number;
  tpm: number;
  dailyRequests: number;
  dailyTokens: number;
}