import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Space, Typography } from 'antd';
import { 
  ReloadOutlined, 
  LogoutOutlined, 
  DashboardOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { SummaryCards } from './SummaryCards';
import { TimeRangeSelector } from './TimeRangeSelector';
import { DataTable } from '../DataTable';
import { LoadingSpinner, EmptyState, RetryableError } from '../common';
import { apiService } from '../../services/apiService';
import { DataTransformer } from '../../services/dataTransformer';
import { useSorting } from '../../hooks';
import { type ApiKeyData, type TimeRange, ErrorType, type AppError, type ProcessedApiKeyData } from '../../types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface DashboardComponentProps {
  token: string;
  onLogout: () => void;
}

export const DashboardComponent: React.FC<DashboardComponentProps> = ({
  token,
  onLogout,
}) => {
  const [data, setData] = useState<ApiKeyData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('total');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 处理表格数据
  const processedData = React.useMemo(() => {
    return DataTransformer.processTableData(data);
  }, [data]);

  // 使用排序Hook
  const { sortedData, sortConfig, handleSort } = useSorting(processedData);

  // 获取数据
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      apiService.setAuthToken(token);
      const response = await apiService.fetchApiKeys();
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      
      if (err.type === ErrorType.AUTH_ERROR) {
        setError(err);
        // 延迟执行登出，给用户时间看到错误信息
        setTimeout(() => {
          onLogout();
        }, 3000);
      } else {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchData();
  }, [token]);

  // 自动刷新（每5分钟）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoading, token]);

  const handleTimeRangeChange = (value: TimeRange) => {
    setTimeRange(value);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleLogout = () => {
    onLogout();
  };

  // 导出为 Excel（CSV）
  const handleExport = () => {
    const rows: Array<Record<string, string | number>> = [];

    const makeRow = (item: ProcessedApiKeyData) => ({
      名称: item.name,
      状态: item.status === 'active' ? '活跃' : '非活跃',
      最后使用: item.lastUsed,
      '今日-请求数': item.daily.requests,
      '今日-令牌数': item.daily.tokens,
      '今日-成本($)': Number(item.daily.cost.toFixed(2)),
      '本周-请求数': item.weekly.requests,
      '本周-令牌数': item.weekly.tokens,
      '本周-成本($)': Number(item.weekly.cost.toFixed(2)),
      '本月-请求数': item.monthly.requests,
      '本月-令牌数': item.monthly.tokens,
      '本月-成本($)': Number(item.monthly.cost.toFixed(2)),
      '总计-请求数': item.total.requests,
      '总计-令牌数': item.total.tokens,
      '总计-成本($)': Number(item.total.cost.toFixed(2)),
    });

    sortedData.forEach((item) => rows.push(makeRow(item)));

    const headers = Object.keys(rows[0] || {});

    const escapeCsv = (val: string | number) => {
      const s = String(val ?? '');
      // 如果包含逗号、双引号或换行，需用双引号包裹并转义内部引号
      if (/[",\n\r]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const csvLines = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(',')),
    ];

    const csvContent = '\ufeff' + csvLines.join('\n'); // 添加 BOM，防止中文在 Excel 中乱码
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const ts = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const filename = `api-keys-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff', boxShadow: '0 2px 8px #f0f1f2' }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <DashboardOutlined style={{ fontSize: 24 }} />
            <Title level={4} style={{ margin: 0 }}>API统计仪表板</Title>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>刷新</Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={sortedData.length === 0}>导出 Excel</Button>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
          </Space>
        </Space>
      </Header>

      <Content style={{ margin: '24px' }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card>
            <Space align="center" size={16} style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <ClockCircleOutlined />
                <Text>时间范围：</Text>
                <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
              </Space>
              {lastUpdated && (
                <Text type="secondary">上次更新时间：{lastUpdated.toLocaleString()}</Text>
              )}
            </Space>
          </Card>

          {error ? (
            <RetryableError error={error} onRetry={handleRefresh} />
          ) : isLoading ? (
            <LoadingSpinner />
          ) : data.length === 0 ? (
            <EmptyState title="暂无数据" description="请检查您的认证令牌或稍后重试。" />
          ) : (
            <>
              <SummaryCards data={data} timeRange={timeRange} />
              <Card>
                <DataTable data={sortedData} sortConfig={sortConfig} onSort={handleSort} loading={isLoading} />
              </Card>
            </>
          )}
        </Space>
      </Content>
    </Layout>
  );
};