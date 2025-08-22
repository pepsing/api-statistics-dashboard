import React from 'react';
import { Table, Tag, Typography, Checkbox, Space, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  CheckCircleOutlined, 
  StopOutlined, 
  SortAscendingOutlined, 
  SortDescendingOutlined 
} from '@ant-design/icons';
import { type ProcessedApiKeyData, type SortConfig } from '../../types';
import { DataTransformer } from '../../services/dataTransformer';
import { useResponsive } from '../../hooks';

const { Text } = Typography;

interface DataTableProps {
  data: ProcessedApiKeyData[];
  sortConfig: SortConfig;
  onSort: (field: string) => void;
  loading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  sortConfig,
  onSort,
  loading = false,
}) => {
  const { isMobile, isSmallScreen } = useResponsive();

  // 列组显示控制
  const [visibleGroups, setVisibleGroups] = React.useState({
    today: true,
    sevenDays: true,
    monthly: true,
    total: true,
    daily: false, // 默认隐藏日均参考
  });


  // 创建排序标题渲染函数
  const renderSortableTitle = (title: string, field: string) => {
    const isActive = sortConfig.field === field;
    const direction = sortConfig.direction;
    
    // 判断排序状态
    let sortIcon;
    let sortTitle;
    
    if (isActive && direction === 'asc') {
      sortIcon = <SortAscendingOutlined style={{ color: '#1890ff' }} />;
      sortTitle = "正序排列，点击取消排序";
    } else if (isActive && direction === 'desc') {
      sortIcon = <SortDescendingOutlined style={{ color: '#1890ff' }} />;
      sortTitle = "倒序排列，点击切换为正序";
    } else {
      sortIcon = <span style={{ opacity: 0.3, fontSize: '12px' }}>⇅</span>;
      sortTitle = "点击排序";
    }
    
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 4, 
          cursor: 'pointer',
          fontWeight: isActive && direction ? 'bold' : 'normal',
          color: isActive && direction ? '#1890ff' : 'inherit'
        }}
        title={sortTitle}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSort(field);
        }}
      >
        <span>{title}</span>
        {sortIcon}
      </div>
    );
  };

  // 受控分页：处理 pageSize 选择不生效的问题
  const [pageSize, setPageSize] = React.useState<number>(isMobile ? 10 : 100);
  React.useEffect(() => {
    setPageSize((prev) => {
      const target = isMobile ? 10 : 100;
      if (isMobile && prev > 10) return prev;
      if (!isMobile && prev !== prev) return target; // no-op 占位
      return prev === target ? prev : target;
    });
  }, [isMobile]);

  // 根据可见组生成列配置
  const buildColumns = (): ColumnsType<ProcessedApiKeyData> => {
    const columns: ColumnsType<ProcessedApiKeyData> = [
      {
        title: renderSortableTitle('密钥名称', 'name'),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 150,
        render: (name: string) => (
          <Text strong>{name}</Text>
        ),
      },
    ];

    // 今日数据
    if (visibleGroups.today) {
      columns.push({
        title: '今日数据',
        children: [
          {
            title: renderSortableTitle('请求数', 'today.requests'),
            dataIndex: ['today', 'requests'],
            key: 'today.requests',
            width: 90,
            render: (value: number) => (
              <Text type={value > 0 ? undefined : 'secondary'}>
                {DataTransformer.formatNumber(value)}
              </Text>
            ),
          },
          {
            title: renderSortableTitle('令牌数', 'today.tokens'),
            dataIndex: ['today', 'tokens'],
            key: 'today.tokens',
            width: 90,
            render: (value: number) => (
              <Text type={value > 0 ? undefined : 'secondary'}>
                {DataTransformer.formatTokens(value)}
              </Text>
            ),
          },
          {
            title: renderSortableTitle('成本', 'today.cost'),
            dataIndex: ['today', 'cost'],
            key: 'today.cost',
            width: 90,
            render: (value: number) => (
              <Text type={value > 0 ? undefined : 'secondary'} style={{ color: value > 0 ? '#fa8c16' : undefined }}>
                {DataTransformer.formatCost(value)}
              </Text>
            ),
          },
        ],
      });
    }

    // 7天数据
    if (visibleGroups.sevenDays) {
      columns.push({
        title: '7天数据',
        children: [
          {
            title: renderSortableTitle('请求数', 'sevenDays.requests'),
            dataIndex: ['sevenDays', 'requests'],
            key: 'sevenDays.requests',
            width: 90,
            render: (value: number) => (
              <Text type={value > 0 ? undefined : 'secondary'}>
                {DataTransformer.formatNumber(value)}
              </Text>
            ),
          },
          {
            title: renderSortableTitle('令牌数', 'sevenDays.tokens'),
            dataIndex: ['sevenDays', 'tokens'],
            key: 'sevenDays.tokens',
            width: 90,
            render: (value: number) => (
              <Text type={value > 0 ? undefined : 'secondary'}>
                {DataTransformer.formatTokens(value)}
              </Text>
            ),
          },
          {
            title: renderSortableTitle('成本', 'sevenDays.cost'),
            dataIndex: ['sevenDays', 'cost'],
            key: 'sevenDays.cost',
            width: 90,
            render: (value: number) => (
              <Text type={value > 0 ? undefined : 'secondary'} style={{ color: value > 0 ? '#fa8c16' : undefined }}>
                {DataTransformer.formatCost(value)}
              </Text>
            ),
          },
        ],
      });
    }

    // 月度数据
    if (visibleGroups.monthly) {
      columns.push({
        title: '月度数据',
        children: [
          {
            title: renderSortableTitle('请求数', 'monthly.requests'),
            dataIndex: ['monthly', 'requests'],
            key: 'monthly.requests',
            width: 90,
            render: (value: number) => (
              <Text type={value > 0 ? undefined : 'secondary'}>
                {DataTransformer.formatNumber(value)}
              </Text>
            ),
          },
          {
            title: renderSortableTitle('令牌数', 'monthly.tokens'),
            dataIndex: ['monthly', 'tokens'],
            key: 'monthly.tokens',
            width: 90,
            render: (value: number) => (
              <Text type={value > 0 ? undefined : 'secondary'}>
                {DataTransformer.formatTokens(value)}
              </Text>
            ),
          },
          {
            title: renderSortableTitle('成本', 'monthly.cost'),
            dataIndex: ['monthly', 'cost'],
            key: 'monthly.cost',
            width: 90,
            render: (value: number) => (
              <Text type={value > 0 ? undefined : 'secondary'} style={{ color: value > 0 ? '#fa8c16' : undefined }}>
                {DataTransformer.formatCost(value)}
              </Text>
            ),
          },
        ],
      });
    }

    // 总计数据
    if (visibleGroups.total) {
      columns.push({
        title: '总计数据',
        children: [
          {
            title: renderSortableTitle('请求数', 'total.requests'),
            dataIndex: ['total', 'requests'],
            key: 'total.requests',
            width: 90,
            render: (value: number) => (
              <Text strong type={value > 0 ? undefined : 'secondary'}>
                {DataTransformer.formatNumber(value)}
              </Text>
            ),
          },
          {
            title: renderSortableTitle('令牌数', 'total.tokens'),
            dataIndex: ['total', 'tokens'],
            key: 'total.tokens',
            width: 90,
            render: (value: number) => (
              <Text strong type={value > 0 ? undefined : 'secondary'}>
                {DataTransformer.formatTokens(value)}
              </Text>
            ),
          },
          {
            title: renderSortableTitle('成本', 'total.cost'),
            dataIndex: ['total', 'cost'],
            key: 'total.cost',
            width: 90,
            render: (value: number) => (
              <Text strong type={value > 0 ? undefined : 'secondary'} style={{ color: value > 0 ? '#fa8c16' : undefined }}>
                {DataTransformer.formatCost(value)}
              </Text>
            ),
          },
        ],
      });
    }

    // 日均参考
    if (visibleGroups.daily) {
      columns.push({
        title: '日均参考',
        children: [
          {
            title: renderSortableTitle('请求数', 'daily.requests'),
            dataIndex: ['daily', 'requests'],
            key: 'daily.requests',
            width: 80,
            render: (value: number) => (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {DataTransformer.formatNumber(value)}
              </Text>
            ),
          },
          {
            title: renderSortableTitle('令牌数', 'daily.tokens'),
            dataIndex: ['daily', 'tokens'],
            key: 'daily.tokens',
            width: 80,
            render: (value: number) => (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {DataTransformer.formatTokens(value)}
              </Text>
            ),
          },
        ],
      });
    }

    // 基础信息（始终显示）
    columns.push({
      title: '基础信息',
      children: [
        {
          title: renderSortableTitle('状态', 'status'),
          dataIndex: 'status',
          key: 'status',
          width: 80,
          filters: [
            { text: '活跃', value: 'active' },
            { text: '非活跃', value: 'inactive' },
          ],
          onFilter: (value, record) => record.status === value,
          render: (status: 'active' | 'inactive') => (
            <Tag
              icon={status === 'active' ? <CheckCircleOutlined /> : <StopOutlined />}
              color={status === 'active' ? 'success' : 'default'}
              style={{ fontSize: '11px' }}
            >
              {status === 'active' ? '活跃' : '非活跃'}
            </Tag>
          ),
        },
        {
          title: renderSortableTitle('创建时间', 'createdAt'),
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 100,
          render: (text: string) => (
            <Text style={{ fontSize: '12px' }}>{text}</Text>
          ),
        },
        {
          title: renderSortableTitle('最后使用', 'lastUsed'),
          dataIndex: 'lastUsed',
          key: 'lastUsed',
          width: 100,
          render: (text: string) => (
            <Text style={{ fontSize: '12px' }}>{text}</Text>
          ),
        },
      ],
    });

    return columns;
  };

  const columns = buildColumns();

  const handleTableChange = (pagination: unknown, _filters: unknown, _sorter: unknown) => {
    // 只处理分页变更，排序由我们的自定义点击处理
    if (pagination && typeof pagination === 'object' && pagination !== null) {
      const paginationObj = pagination as { pageSize?: number };
      if (typeof paginationObj.pageSize === 'number') {
        setPageSize((prev) => (prev !== paginationObj.pageSize ? paginationObj.pageSize! : prev));
      }
    }
  };

  // 切换列组显示状态
  const handleGroupToggle = (group: keyof typeof visibleGroups) => {
    setVisibleGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <div style={{ width: '100%', overflow: 'auto' }}>
      {/* 列组切换控制 */}
      <Card 
        size="small" 
        style={{ marginBottom: 16, borderRadius: 6 }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text strong style={{ marginRight: 8, color: '#666' }}>显示列组:</Text>
          <Space wrap>
            <Checkbox
              checked={visibleGroups.today}
              onChange={() => handleGroupToggle('today')}
            >
              今日数据
            </Checkbox>
            <Checkbox
              checked={visibleGroups.sevenDays}
              onChange={() => handleGroupToggle('sevenDays')}
            >
              7天数据
            </Checkbox>
            <Checkbox
              checked={visibleGroups.monthly}
              onChange={() => handleGroupToggle('monthly')}
            >
              月度数据
            </Checkbox>
            <Checkbox
              checked={visibleGroups.total}
              onChange={() => handleGroupToggle('total')}
            >
              总计数据
            </Checkbox>
            <Checkbox
              checked={visibleGroups.daily}
              onChange={() => handleGroupToggle('daily')}
            >
              日均参考
            </Checkbox>
          </Space>
        </div>
      </Card>

      <Table<ProcessedApiKeyData>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        size="middle"
        pagination={{
          pageSize,
          pageSizeOptions: isMobile ? [10, 20, 50] : [50, 100, 200, 500],
          showSizeChanger: !isMobile,
          showQuickJumper: !isSmallScreen,
          showTotal: (total, range) => (
            <span>
              第 {range[0]}-{range[1]} 条 / 共 {total} 条
            </span>
          ),
        }}
      />
    </div>
  );
};