import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { type ApiResponse, ErrorType, type AppError } from '../types';

export class ApiService {
  private client: AxiosInstance;
  private token: string = '';

  constructor(baseUrl?: string) {
    const env = (import.meta as any)?.env ?? {};
    const isDev = !!env?.DEV;
    const envBaseUrl = env?.VITE_API_BASE_URL as string | undefined;
    // 开发环境优先使用同源相对路径，借助 Vite 代理规避浏览器 CORS
    const resolvedBaseUrl = (baseUrl ?? (isDev ? '' : envBaseUrl) ?? envBaseUrl ?? '') as string;

    this.client = axios.create({
      baseURL: resolvedBaseUrl || undefined,
      timeout: 10000,
      headers: {
        // GET 请求无需主动设置 Content-Type，避免触发预检
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
      },
    });

    // 请求拦截器 - 添加认证token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // 响应拦截器 - 统一错误处理
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * 设置认证token
   */
  setAuthToken(token: string): void {
    this.token = token;
  }

  /**
   * 获取API密钥统计数据
   */
  async fetchApiKeys(timeRange: string = 'all'): Promise<ApiResponse> {
    try {
      const response = await this.client.get<ApiResponse>('/admin/api-keys', {
        params: { timeRange },
      });
      
      if (!response.data.success) {
        throw new Error('API返回失败状态');
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 获取完整的API密钥统计数据（合并四个时间范围的数据）
   */
  async fetchCompleteApiKeys(): Promise<ApiResponse> {
    try {
      // 并发请求四个时间范围的数据
      const [todayResponse, sevenDaysResponse, monthlyResponse, allResponse] = await Promise.all([
        this.fetchApiKeys('today'),
        this.fetchApiKeys('7days'),
        this.fetchApiKeys('monthly'),
        this.fetchApiKeys('all')
      ]);

      // 合并数据
      const mergedData = this.mergeAllTimeRangeData(
        todayResponse.data,
        sevenDaysResponse.data,
        monthlyResponse.data,
        allResponse.data
      );

      return {
        success: true,
        data: mergedData
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 合并四个时间范围的API密钥数据
   */
  private mergeAllTimeRangeData(
    todayData: any[],
    sevenDaysData: any[],
    monthlyData: any[],
    allData: any[]
  ): any[] {
    // 创建映射以便快速查找
    const todayMap = new Map(todayData.map(item => [item.id, item]));
    const sevenDaysMap = new Map(sevenDaysData.map(item => [item.id, item]));
    const monthlyMap = new Map(monthlyData.map(item => [item.id, item]));
    
    return allData.map(allItem => {
      const todayItem = todayMap.get(allItem.id);
      const sevenDaysItem = sevenDaysMap.get(allItem.id);
      const monthlyItem = monthlyMap.get(allItem.id);
      
      return {
        ...allItem,
        usage: {
          // 从each时间范围的total字段获取对应数据
          today: todayItem?.usage?.total || this.getEmptyUsageStats(),
          sevenDays: sevenDaysItem?.usage?.total || this.getEmptyUsageStats(),
          monthly: monthlyItem?.usage?.total || this.getEmptyUsageStats(),
          total: allItem.usage?.total || this.getEmptyUsageStats(),
          // 保留日均数据作为参考
          daily: allItem.usage?.daily || this.getEmptyUsageStats(),
          // 保留其他可能有用的字段
          averages: allItem.usage?.averages
        }
      };
    });
  }

  /**
   * 获取空的使用统计数据
   */
  private getEmptyUsageStats(): any {
    return {
      requests: 0,
      tokens: 0,
      allTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      cacheCreateTokens: 0,
      cacheReadTokens: 0,
      cost: 0,
      formattedCost: '$0.000000'
    };
  }

  /**
   * 验证token是否有效
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      this.setAuthToken(token);
      await this.fetchApiKeys();
      return true;
    } catch (error: any) {
      this.setAuthToken('');
      // 仅当确认为认证错误（401/403）时返回 false，其它错误上抛以便 UI 提示网络/服务器异常
      if (error && typeof error === 'object' && 'type' in error && error.type === ErrorType.AUTH_ERROR) {
        return false;
      }
      throw error;
    }
  }

  /**
   * 统一错误处理
   */
  private handleError(error: any): AppError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // 网络错误
      if (!axiosError.response) {
        return {
          type: ErrorType.NETWORK_ERROR,
          message: '网络连接失败，请检查网络连接',
          details: axiosError.message,
        };
      }

      // HTTP状态码错误
      const status = axiosError.response.status;
      switch (status) {
        case 401:
        case 403:
          return {
            type: ErrorType.AUTH_ERROR,
            message: '认证失败，请检查token是否正确',
            details: axiosError.response.data,
          };
        case 404:
          return {
            type: ErrorType.API_ERROR,
            message: 'API接口不存在',
            details: axiosError.response.data,
          };
        case 500:
          return {
            type: ErrorType.API_ERROR,
            message: '服务器内部错误',
            details: axiosError.response.data,
          };
        default:
          return {
            type: ErrorType.API_ERROR,
            message: `请求失败 (${status})`,
            details: axiosError.response.data,
          };
      }
    }

    // 其他类型错误
    return {
      type: ErrorType.DATA_ERROR,
      message: error?.message || '未知错误',
      details: error,
    };
  }
}

// 创建默认实例
export const apiService = new ApiService();