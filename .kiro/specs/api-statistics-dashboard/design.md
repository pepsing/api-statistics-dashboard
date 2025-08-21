# 设计文档

## 概述

API统计仪表板是一个纯前端单页面Web应用，用于可视化展示API密钥的使用统计数据。应用直接调用现有的后台API接口，采用现代前端技术栈，提供直观的数据展示和良好的用户交互体验。

## 架构

### 整体架构

```
┌─────────────────────────────────────┐
│           Browser Environment        │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     Dashboard Web App         │  │
│  │                               │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │    React Components     │  │  │
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │    API Client Layer     │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
│                │                    │
│                │ HTTPS Calls        │
│                ▼                    │
│     External API: /admin/api-keys   │
└─────────────────────────────────────┘
```

### 前端架构

```
┌─────────────────────────────────────┐
│            Presentation Layer        │
│  ┌─────────────┐  ┌─────────────┐   │
│  │Auth Component│  │Dashboard    │   │
│  │             │  │Component    │   │
│  └─────────────┘  └─────────────┘   │
├─────────────────────────────────────┤
│            Business Logic Layer     │
│  ┌─────────────┐  ┌─────────────┐   │
│  │API Service  │  │Data         │   │
│  │             │  │Transformer  │   │
│  └─────────────┘  └─────────────┘   │
├─────────────────────────────────────┤
│            Data Layer               │
│  ┌─────────────┐  ┌─────────────┐   │
│  │State Store  │  │Local        │   │
│  │             │  │Storage      │   │
│  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────┘
```

## 组件和接口

### 核心组件

#### 1. AuthComponent
**职责：** 处理用户认证和令牌管理
- 令牌输入表单
- 令牌验证
- 认证状态管理

**接口：**
```typescript
interface AuthComponentProps {
  onAuthSuccess: (token: string) => void;
  isLoading: boolean;
  error?: string;
}
```

#### 2. DashboardComponent
**职责：** 主仪表板容器组件
- 布局管理
- 数据获取协调
- 子组件状态管理

**接口：**
```typescript
interface DashboardComponentProps {
  token: string;
  onLogout: () => void;
}
```

#### 3. SummaryCards
**职责：** 展示汇总统计信息
- 总请求数卡片
- 总令牌数卡片
- 总成本卡片
- 活跃密钥数卡片

**接口：**
```typescript
interface SummaryCardsProps {
  data: ApiKeyData[];
  timeRange: 'daily' | 'weekly' | 'monthly' | 'total';
}
```

#### 4. TimeRangeSelector
**职责：** 时间维度选择器
- 日/周/月切换
- 当前选择状态显示

**接口：**
```typescript
interface TimeRangeSelectorProps {
  selected: 'daily' | 'weekly' | 'monthly';
  onChange: (range: 'daily' | 'weekly' | 'monthly') => void;
}
```

#### 5. DataTable
**职责：** 数据表格展示
- 多维度数据列展示
- 排序功能
- 响应式表格

**接口：**
```typescript
interface DataTableProps {
  data: ProcessedApiKeyData[];
  sortConfig: SortConfig;
  onSort: (field: string) => void;
}
```

### 服务层

#### ApiService
**职责：** 处理所有API调用
```typescript
class ApiService {
  private baseUrl: string;
  private token: string;

  async fetchApiKeys(timeRange: string): Promise<ApiResponse>;
  setAuthToken(token: string): void;
}
```

#### DataTransformer
**职责：** 数据转换和计算
```typescript
class DataTransformer {
  static calculateWeeklyData(data: ApiKeyData[]): UsageData;
  static calculateSummary(data: ApiKeyData[], timeRange: string): SummaryData;
  static processTableData(data: ApiKeyData[]): ProcessedApiKeyData[];
}
```

## 数据模型

### API响应数据模型
```typescript
interface ApiResponse {
  success: boolean;
  data: ApiKeyData[];
}

interface ApiKeyData {
  id: string;
  name: string;
  isActive: boolean;
  lastUsedAt: string;
  usage: {
    total: UsageStats;
    daily: UsageStats;
    monthly: UsageStats;
    averages: AverageStats;
  };
  dailyCost: number;
}

interface UsageStats {
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
```

### 处理后的数据模型
```typescript
interface ProcessedApiKeyData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  lastUsed: string;
  daily: UsageMetrics;
  weekly: UsageMetrics;
  monthly: UsageMetrics;
  total: UsageMetrics;
}

interface UsageMetrics {
  requests: number;
  tokens: number;
  cost: number;
  formattedCost: string;
}

interface SummaryData {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  activeKeys: number;
}
```

### 应用状态模型
```typescript
interface AppState {
  auth: {
    token: string | null;
    isAuthenticated: boolean;
  };
  dashboard: {
    data: ApiKeyData[];
    processedData: ProcessedApiKeyData[];
    summary: SummaryData;
    timeRange: 'daily' | 'weekly' | 'monthly';
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
  ui: {
    sortConfig: SortConfig;
  };
}
```

## 错误处理

### 错误类型定义
```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  API_ERROR = 'API_ERROR',
  DATA_ERROR = 'DATA_ERROR'
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}
```

### 错误处理策略
1. **网络错误：** 显示重试按钮，支持自动重试
2. **认证错误：** 清除令牌，返回登录界面
3. **API错误：** 显示具体错误信息，提供刷新选项
4. **数据错误：** 显示数据格式错误提示

## 测试策略

### 单元测试
- **组件测试：** 使用Jest + React Testing Library
- **服务测试：** 模拟API调用，测试数据处理逻辑
- **工具函数测试：** 测试数据转换和计算函数

### 集成测试
- **API集成：** 使用Mock Service Worker模拟API响应
- **用户流程：** 测试完整的用户操作流程
- **跨浏览器测试：** 确保在不同浏览器中的兼容性

### 测试覆盖目标
- 组件渲染测试：100%
- 业务逻辑测试：90%+
- API交互测试：100%

### 测试用例示例
```typescript
describe('DataTransformer', () => {
  test('should calculate weekly data correctly', () => {
    const mockData = [/* mock API data */];
    const result = DataTransformer.calculateWeeklyData(mockData);
    expect(result.requests).toBe(expectedRequests);
  });
});

describe('DataTable', () => {
  test('should sort data by cost descending', () => {
    render(<DataTable data={mockData} sortConfig={mockSort} onSort={mockOnSort} />);
    fireEvent.click(screen.getByText('成本'));
    expect(mockOnSort).toHaveBeenCalledWith('cost');
  });
});
```

## 技术栈选择

### 核心技术
- **React 18+** - 现代化的组件开发
- **TypeScript** - 类型安全和更好的开发体验
- **Vite** - 快速的构建工具和开发服务器

### UI和样式
- **Ant Design** - 提供丰富的表格、表单和布局组件
- **CSS Modules** 或 **Styled Components** - 组件级样式管理
- **响应式设计** - 支持移动端和桌面端

### 状态管理
- **React Hooks** (useState, useEffect, useContext) - 轻量级状态管理
- **Custom Hooks** - 业务逻辑复用

### HTTP客户端
- **Axios** 或 **Fetch API** - API调用
- **CORS处理** - 跨域请求支持

### 开发和构建
- **ESLint + Prettier** - 代码质量和格式化
- **Jest + Testing Library** - 测试框架
- **静态部署** - 支持Netlify、Vercel等平台部署

### 项目结构
```
src/
├── components/          # React组件
│   ├── Auth/           # 认证相关组件
│   ├── Dashboard/      # 仪表板组件
│   ├── DataTable/      # 数据表格组件
│   └── common/         # 通用组件
├── services/           # API服务和数据处理
├── hooks/              # 自定义Hooks
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── styles/             # 全局样式
└── App.tsx             # 应用入口
```