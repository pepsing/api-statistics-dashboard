import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Button, Space, Typography, message } from 'antd';
import { 
  ReloadOutlined, 
  LogoutOutlined, 
  DashboardOutlined,
  DownloadOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { SummaryCards } from './SummaryCards';
import { DataTable } from '../DataTable';
import { LoadingSpinner, EmptyState, RetryableError } from '../common';
import { apiService } from '../../services/apiService';
import { DataTransformer } from '../../services/dataTransformer';
import { useSorting } from '../../hooks';
import { type ApiKeyData, ErrorType, type AppError, type ProcessedApiKeyData } from '../../types';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

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
      const response = await apiService.fetchCompleteApiKeys();
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

  const handleRefresh = () => {
    fetchData();
  };

  const handleLogout = () => {
    onLogout();
  };

  // 导出页面截图
  const handleScreenshot = async () => {
    if (!dashboardRef.current || isExporting) {
      return;
    }

    setIsExporting(true);
    const hideMessage = message.loading('正在生成截图，请稍候...', 0);

    try {
      // 添加截图模式类名以优化样式
      const layoutElement = document.querySelector('.ant-layout');
      layoutElement?.classList.add('screenshot-mode');

      // 等待样式应用
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#f0f2f5',
        scale: window.devicePixelRatio || 1,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: dashboardRef.current.scrollWidth,
        height: dashboardRef.current.scrollHeight,
        onclone: (clonedDoc: Document) => {
          // 在克隆的文档中也应用截图样式
          const clonedLayout = clonedDoc.querySelector('.ant-layout');
          clonedLayout?.classList.add('screenshot-mode');
        }
      } as any);

      // 移除截图模式类名
      layoutElement?.classList.remove('screenshot-mode');

      const ts = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const filename = `api-dashboard-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.png`;

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success('截图已保存到下载文件夹');
        } else {
          message.error('生成截图失败');
        }
      }, 'image/png', 0.9);
    } catch (error) {
      console.error('Screenshot failed:', error);
      message.error('生成截图失败，请重试');
      // 确保移除截图模式类名
      const layoutElement = document.querySelector('.ant-layout');
      layoutElement?.classList.remove('screenshot-mode');
    } finally {
      hideMessage();
      setIsExporting(false);
    }
  };

  // 导出为 Excel（CSV）
  const handleExport = () => {
    const rows: Array<Record<string, string | number>> = [];

    const makeRow = (item: ProcessedApiKeyData) => ({
      名称: item.name,
      '今日-请求数': item.today.requests,
      '今日-令牌数': item.today.tokens,
      '今日-成本($)': Number(item.today.cost.toFixed(2)),
      '7天-请求数': item.sevenDays.requests,
      '7天-令牌数': item.sevenDays.tokens,
      '7天-成本($)': Number(item.sevenDays.cost.toFixed(2)),
      '月度-请求数': item.monthly.requests,
      '月度-令牌数': item.monthly.tokens,
      '月度-成本($)': Number(item.monthly.cost.toFixed(2)),
      '总计-请求数': item.total.requests,
      '总计-令牌数': item.total.tokens,
      '总计-成本($)': Number(item.total.cost.toFixed(2)),
      '日均-请求数': item.daily.requests,
      '日均-令牌数': item.daily.tokens,
      状态: item.status === 'active' ? '活跃' : '非活跃',
      创建时间: item.createdAt,
      最后使用: item.lastUsed,
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
    <Layout style={{ minHeight: '100vh', width: '100%' }}>
      <Header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1, 
        background: '#fff', 
        boxShadow: '0 2px 8px #f0f1f2',
        width: '100%',
        padding: '0 24px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 'none'
        }}>
          <Space>
            <DashboardOutlined style={{ fontSize: 24 }} />
            <Title level={4} style={{ margin: 0 }}>API统计仪表板</Title>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>刷新</Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={sortedData.length === 0}>导出 Excel</Button>
            <Button 
              icon={<CameraOutlined />} 
              onClick={handleScreenshot} 
              disabled={sortedData.length === 0 || isExporting}
              loading={isExporting}
            >
              导出图片
            </Button>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
          </Space>
        </div>
      </Header>

      <Content 
        ref={dashboardRef}
        style={{ 
          padding: '24px', 
          width: '100%',
          maxWidth: 'none',
          overflow: 'hidden'
        }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {lastUpdated && (
            <div style={{ textAlign: 'right', marginBottom: '8px' }}>
              <Text type="secondary">上次更新时间：{lastUpdated.toLocaleString()}</Text>
            </div>
          )}

          {error ? (
            <RetryableError error={error} onRetry={handleRefresh} />
          ) : isLoading ? (
            <LoadingSpinner />
          ) : data.length === 0 ? (
            <EmptyState title="暂无数据" description="请检查您的认证令牌或稍后重试。" />
          ) : (
            <>
              <SummaryCards data={data} />
              <Card style={{ width: '100%', overflow: 'auto' }}>
                <DataTable data={sortedData} sortConfig={sortConfig} onSort={handleSort} loading={isLoading} />
              </Card>
            </>
          )}
        </Space>
      </Content>
    </Layout>
  );
};