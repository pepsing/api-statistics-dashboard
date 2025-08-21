import { type
  ApiKeyData, 
  type ProcessedApiKeyData, 
  type SummaryData, 
  type UsageMetrics, 
  type TimeRange 
} from '../types';

export class DataTransformer {
  /**
   * 解析成本数值 - 优先使用 cost，否则从 formattedCost 解析
   */
  private static parseCost(usage: { cost?: number; formattedCost?: string } | undefined | null): number {
    if (!usage) return 0;
    // 优先使用 cost 字段
    if (typeof usage.cost === 'number') {
      return usage.cost;
    }
    
    // 尝试从 formattedCost 解析
    if (usage.formattedCost) {
      const match = usage.formattedCost.match(/[\d.]+/);
      if (match) {
        const parsed = parseFloat(match[0]);
        return isNaN(parsed) ? 0 : parsed;
      }
    }
    
    return 0;
  }

  /**
   * 计算周数据（基于日和月数据推算）
   * 由于API没有直接提供周数据，我们使用以下逻辑：
   * - 如果有日数据，周数据 = 日数据 * 7（简化估算）
   * - 如果没有日数据但有月数据，周数据 = 月数据 / 4（简化估算）
   */
  static calculateWeeklyData(apiKeyData: ApiKeyData): UsageMetrics {
    const { daily, monthly } = apiKeyData.usage;
    
    let weeklyRequests = 0;
    let weeklyTokens = 0;
    let weeklyCost = 0;

    if (daily.requests > 0) {
      // 基于日数据估算周数据
      weeklyRequests = daily.requests * 7;
      weeklyTokens = daily.tokens * 7;
      weeklyCost = this.parseCost(daily) * 7;
    } else if (monthly.requests > 0) {
      // 基于月数据估算周数据
      weeklyRequests = Math.round(monthly.requests / 4);
      weeklyTokens = Math.round(monthly.tokens / 4);
      weeklyCost = this.parseCost(monthly) / 4;
    }

    return {
      requests: weeklyRequests,
      tokens: weeklyTokens,
      cost: weeklyCost,
      formattedCost: `$${weeklyCost.toFixed(2)}`,
    };
  }

  /**
   * 计算汇总数据
   */
  static calculateSummary(data: ApiKeyData[], timeRange: TimeRange): SummaryData {
    let totalRequests = 0;
    let totalTokens = 0;
    let totalCost = 0;
    let activeKeys = 0;

    data.forEach((apiKey) => {
      if (apiKey.isActive) {
        activeKeys++;
      }

      if (timeRange === 'daily') {
        totalRequests += apiKey.usage.daily.requests || 0;
        totalTokens += apiKey.usage.daily.tokens || 0;
        totalCost += this.parseCost(apiKey.usage.daily);
      } else if (timeRange === 'weekly') {
        const weekly = this.calculateWeeklyData(apiKey);
        totalRequests += weekly.requests || 0;
        totalTokens += weekly.tokens || 0;
        totalCost += weekly.cost || 0;
      } else if (timeRange === 'monthly') {
        totalRequests += apiKey.usage.monthly.requests || 0;
        totalTokens += apiKey.usage.monthly.tokens || 0;
        totalCost += this.parseCost(apiKey.usage.monthly);
      } else {
        totalRequests += apiKey.usage.total.requests || 0;
        totalTokens += apiKey.usage.total.tokens || 0;
        totalCost += this.parseCost(apiKey.usage.total);
      }
    });

    return {
      totalRequests,
      totalTokens,
      totalCost,
      activeKeys,
    };
  }

  /**
   * 处理表格数据
   */
  static processTableData(data: ApiKeyData[]): ProcessedApiKeyData[] {
    return data.map((apiKey) => {
      const weekly = this.calculateWeeklyData(apiKey);
      
      const dailyCost = this.parseCost(apiKey.usage.daily);
      const monthlyCost = this.parseCost(apiKey.usage.monthly);
      const totalCost = this.parseCost(apiKey.usage.total);
      
      return {
        id: apiKey.id,
        name: apiKey.name,
        status: apiKey.isActive ? 'active' : 'inactive',
        lastUsed: this.formatDate(apiKey.lastUsedAt),
        daily: {
          requests: apiKey.usage.daily.requests,
          tokens: apiKey.usage.daily.tokens,
          cost: dailyCost,
          formattedCost: apiKey.usage.daily.formattedCost || `$${dailyCost.toFixed(2)}`,
        },
        weekly,
        monthly: {
          requests: apiKey.usage.monthly.requests,
          tokens: apiKey.usage.monthly.tokens,
          cost: monthlyCost,
          formattedCost: apiKey.usage.monthly.formattedCost || `$${monthlyCost.toFixed(2)}`,
        },
        total: {
          requests: apiKey.usage.total.requests,
          tokens: apiKey.usage.total.tokens,
          cost: totalCost,
          formattedCost: apiKey.usage.total.formattedCost || `$${totalCost.toFixed(2)}`,
        },
      };
    });
  }

  /**
   * 格式化日期
   */
  private static formatDate(dateString: string): string {
    if (!dateString) return '从未使用';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return date.toLocaleDateString('zh-CN');
      }
    } catch (error) {
      return '日期格式错误';
    }
  }

  /**
   * 格式化数字（添加千分位分隔符）
   */
  static formatNumber(num: number): string {
    return num.toLocaleString('zh-CN');
  }

  /**
   * 格式化成本
   */
  static formatCost(cost: number): string {
    return `$${cost.toFixed(2)}`;
  }

  /**
   * 按指定字段排序数据
   */
  static sortData(
    data: ProcessedApiKeyData[], 
    field: string, 
    direction: 'asc' | 'desc'
  ): ProcessedApiKeyData[] {
    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // 处理嵌套字段（如 daily.cost）
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        aValue = (a as any)[parent]?.[child];
        bValue = (b as any)[parent]?.[child];
      } else {
        aValue = (a as any)[field];
        bValue = (b as any)[field];
      }

      // 处理数字类型
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // 处理字符串类型
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      
      if (direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }
}