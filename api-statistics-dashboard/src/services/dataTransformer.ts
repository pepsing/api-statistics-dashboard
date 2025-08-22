import { type
  ApiKeyData, 
  type ProcessedApiKeyData, 
  type SummaryData 
} from '../types';

export class DataTransformer {
  /**
   * 获取默认的空使用统计数据
   */
  private static getEmptyUsageStats(): any {
    return {
      requests: 0,
      tokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      cacheCreateTokens: 0,
      cacheReadTokens: 0,
      allTokens: 0,
      cost: 0,
      formattedCost: '$0.000000'
    };
  }

  /**
   * 基于token数计算成本（粗略估算）
   * Claude API cost: ~$0.0008 per 1K input tokens, ~$0.0024 per 1K output tokens
   */
  private static estimateCostFromTokens(usage: any): number {
    if (!usage) return 0;
    
    const inputTokens = usage.inputTokens || 0;
    const outputTokens = usage.outputTokens || 0;
    const cacheCreateTokens = usage.cacheCreateTokens || 0;
    const cacheReadTokens = usage.cacheReadTokens || 0;
    
    // 粗略的成本估算
    const inputCost = inputTokens * 0.0008 / 1000;
    const outputCost = outputTokens * 0.0024 / 1000; 
    const cacheCost = (cacheCreateTokens + cacheReadTokens) * 0.0001 / 1000; // 假设缓存成本更低
    
    return inputCost + outputCost + cacheCost;
  }

  /**
   * 解析或计算成本数值 - 优先使用 cost，否则从 formattedCost 解析，最后基于token估算
   */
  private static parseCost(usage: { cost?: number; formattedCost?: string; inputTokens?: number; outputTokens?: number; cacheCreateTokens?: number; cacheReadTokens?: number } | undefined | null): number {
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
        if (!isNaN(parsed)) return parsed;
      }
    }
    
    // 如果都没有，基于token数估算成本
    return this.estimateCostFromTokens(usage);
  }


  /**
   * 计算汇总数据（四个时间维度）
   */
  static calculateSummary(data: ApiKeyData[]): SummaryData {
    let todayRequests = 0, todayTokens = 0, todayCost = 0;
    let sevenDaysRequests = 0, sevenDaysTokens = 0, sevenDaysCost = 0;
    let monthlyRequests = 0, monthlyTokens = 0, monthlyCost = 0;
    let totalRequests = 0, totalTokens = 0, totalCost = 0;
    let activeKeys = 0;

    data.forEach((apiKey) => {
      if (apiKey.isActive) {
        activeKeys++;
      }

      // 今日数据
      const todayData = apiKey.usage.today || this.getEmptyUsageStats();
      todayRequests += todayData.requests || 0;
      todayTokens += todayData.tokens || 0;
      todayCost += this.parseCost(todayData);

      // 7天数据
      const sevenDaysData = apiKey.usage.sevenDays || this.getEmptyUsageStats();
      sevenDaysRequests += sevenDaysData.requests || 0;
      sevenDaysTokens += sevenDaysData.tokens || 0;
      sevenDaysCost += this.parseCost(sevenDaysData);

      // 月度数据
      const monthlyData = apiKey.usage.monthly || this.getEmptyUsageStats();
      monthlyRequests += monthlyData.requests || 0;
      monthlyTokens += monthlyData.tokens || 0;
      monthlyCost += this.parseCost(monthlyData);

      // 总计数据
      const totalData = apiKey.usage.total || this.getEmptyUsageStats();
      totalRequests += totalData.requests || 0;
      totalTokens += totalData.tokens || 0;
      totalCost += this.parseCost(totalData);
    });

    return {
      today: {
        totalRequests: todayRequests,
        totalTokens: todayTokens,
        totalCost: todayCost,
      },
      sevenDays: {
        totalRequests: sevenDaysRequests,
        totalTokens: sevenDaysTokens,
        totalCost: sevenDaysCost,
      },
      monthly: {
        totalRequests: monthlyRequests,
        totalTokens: monthlyTokens,
        totalCost: monthlyCost,
      },
      total: {
        totalRequests: totalRequests,
        totalTokens: totalTokens,
        totalCost: totalCost,
      },
      activeKeys,
    };
  }

  /**
   * 处理表格数据
   */
  static processTableData(data: ApiKeyData[]): ProcessedApiKeyData[] {
    return data.map((apiKey) => {
      // 安全地获取数据，如果字段不存在则使用默认值
      const todayData = apiKey.usage.today || this.getEmptyUsageStats();
      const sevenDaysData = apiKey.usage.sevenDays || this.getEmptyUsageStats();
      const monthlyData = apiKey.usage.monthly || this.getEmptyUsageStats();
      const totalData = apiKey.usage.total || this.getEmptyUsageStats();
      const dailyData = apiKey.usage.daily || this.getEmptyUsageStats();
      
      const todayCost = this.parseCost(todayData);
      const sevenDaysCost = this.parseCost(sevenDaysData);
      const monthlyCost = this.parseCost(monthlyData);
      const totalCost = this.parseCost(totalData);
      const dailyCost = this.parseCost(dailyData);
      
      return {
        id: apiKey.id,
        name: apiKey.name,
        status: apiKey.isActive ? 'active' : 'inactive',
        createdAt: this.formatDate(apiKey.createdAt),
        lastUsed: this.formatDate(apiKey.lastUsedAt),
        today: {
          requests: todayData.requests || 0,
          tokens: todayData.tokens || 0,
          cost: todayCost,
          formattedCost: todayData.formattedCost || `$${todayCost.toFixed(2)}`,
        },
        sevenDays: {
          requests: sevenDaysData.requests || 0,
          tokens: sevenDaysData.tokens || 0,
          cost: sevenDaysCost,
          formattedCost: sevenDaysData.formattedCost || `$${sevenDaysCost.toFixed(2)}`,
        },
        monthly: {
          requests: monthlyData.requests || 0,
          tokens: monthlyData.tokens || 0,
          cost: monthlyCost,
          formattedCost: monthlyData.formattedCost || `$${monthlyCost.toFixed(2)}`,
        },
        total: {
          requests: totalData.requests || 0,
          tokens: totalData.tokens || 0,
          cost: totalCost,
          formattedCost: totalData.formattedCost || `$${totalCost.toFixed(2)}`,
        },
        daily: {
          requests: dailyData.requests || 0,
          tokens: dailyData.tokens || 0,
          cost: dailyCost,
          formattedCost: dailyData.formattedCost || `$${dailyCost.toFixed(2)}`,
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
    } catch {
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
   * 格式化令牌数为 K/M 格式
   */
  static formatTokens(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
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