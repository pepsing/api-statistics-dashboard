import React from 'react';
import { Table, Tag, Tooltip, Typography } from 'antd';
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

  // 将内部 asc/desc 转换为 antd 的 ascend/descend
  const toAntdSortOrder = (field: string) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? 'ascend' : 'descend';
  };

  // 创建排序标题渲染函数
  const renderSortableTitle = (title: string, field: string) => {
    const isActive = sortConfig.field === field;
    const direction = sortConfig.direction;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>{title}</span>
        {isActive && (
          direction === 'asc' ? 
            <SortAscendingOutlined style={{ color: '#1890ff' }} /> : 
            <SortDescendingOutlined style={{ color: '#1890ff' }} />
        )}
      </div>
    );
  };

  // 受控分页：处理 pageSize 选择不生效的问题
  const [pageSize, setPageSize] = React.useState<number>(isMobile ? 5 : 10);
  React.useEffect(() => {
    setPageSize((prev) => {
      const target = isMobile ? 5 : 10;
      if (isMobile && prev > 5) return prev;
      if (!isMobile && prev !== prev) return target; // no-op 占位
      return prev === target ? prev : target;
    });
  }, [isMobile]);

  const columns: ColumnsType<ProcessedApiKeyData> = [
    {
      title: renderSortableTitle('密钥名称', 'name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 150,
      sorter: true,
      sortOrder: toAntdSortOrder('name'),
      render: (name: string) => (
        <Text strong>{name}</Text>
      ),
    },
    {
      title: renderSortableTitle('状态', 'status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      sorter: true,
      sortOrder: toAntdSortOrder('status'),
      filters: [
        { text: '活跃', value: 'active' },
        { text: '非活跃', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: 'active' | 'inactive') => (
        <Tag
          icon={status === 'active' ? <CheckCircleOutlined /> : <StopOutlined />}
          color={status === 'active' ? 'success' : 'default'}
        >
          {status === 'active' ? '活跃' : '非活跃'}
        </Tag>
      ),
    },
    {
      title: renderSortableTitle('最后使用', 'lastUsed'),
      dataIndex: 'lastUsed',
      key: 'lastUsed',
      width: 120,
      sorter: true,
      sortOrder: toAntdSortOrder('lastUsed'),
    },
    {
      title: '今日使用',
      children: [
        {
          title: renderSortableTitle('请求数', 'daily.requests'),
          dataIndex: ['daily', 'requests'],
          key: 'daily.requests',
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('daily.requests'),
          render: (value: number) => (
            <Text type={value > 0 ? undefined : 'secondary'}>
              {DataTransformer.formatNumber(value)}
            </Text>
          ),
        },
        {
          title: renderSortableTitle('令牌数', 'daily.tokens'),
          dataIndex: ['daily', 'tokens'],
          key: 'daily.tokens',
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('daily.tokens'),
          render: (value: number) => (
            <Text type={value > 0 ? undefined : 'secondary'}>
              {DataTransformer.formatNumber(value)}
            </Text>
          ),
        },
        {
          title: renderSortableTitle('成本', 'daily.cost'),
          dataIndex: ['daily', 'cost'],
          key: 'daily.cost',
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('daily.cost'),
          render: (value: number) => (
            <Text type={value > 0 ? undefined : 'secondary'} style={{ color: value > 0 ? '#fa8c16' : undefined }}>
              {DataTransformer.formatCost(value)}
            </Text>
          ),
        },
      ],
    },
    {
      title: '本周使用',
      children: [
        {
          title: renderSortableTitle('请求数', 'weekly.requests'),
          dataIndex: ['weekly', 'requests'],
          key: 'weekly.requests',
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('weekly.requests'),
          render: (value: number) => (
            <Tooltip title="基于日数据估算">
              <Text type={value > 0 ? undefined : 'secondary'}>
                {DataTransformer.formatNumber(value)}
              </Text>
            </Tooltip>
          ),
        },
        {
          title: renderSortableTitle('令牌数', 'weekly.tokens'),
          dataIndex: ['weekly', 'tokens'],
          key: 'weekly.tokens',
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('weekly.tokens'),
          render: (value: number) => (
            <Tooltip title="基于日数据估算">
              <Text type={value > 0 ? undefined : 'secondary'}>
                {DataTransformer.formatNumber(value)}
              </Text>
            </Tooltip>
          ),
        },
        {
          title: renderSortableTitle('成本', 'weekly.cost'),
          dataIndex: ['weekly', 'cost'],
          key: 'weekly.cost',
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('weekly.cost'),
          render: (value: number) => (
            <Tooltip title="基于日数据估算">
              <Text type={value > 0 ? undefined : 'secondary'} style={{ color: value > 0 ? '#fa8c16' : undefined }}>
                {DataTransformer.formatCost(value)}
              </Text>
            </Tooltip>
          ),
        },
      ],
    },
    {
      title: '本月使用',
      children: [
        {
          title: renderSortableTitle('请求数', 'monthly.requests'),
          dataIndex: ['monthly', 'requests'],
          key: 'monthly.requests',
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('monthly.requests'),
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
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('monthly.tokens'),
          render: (value: number) => (
            <Text type={value > 0 ? undefined : 'secondary'}>
              {DataTransformer.formatNumber(value)}
            </Text>
          ),
        },
        {
          title: renderSortableTitle('成本', 'monthly.cost'),
          dataIndex: ['monthly', 'cost'],
          key: 'monthly.cost',
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('monthly.cost'),
          render: (value: number) => (
            <Text type={value > 0 ? undefined : 'secondary'} style={{ color: value > 0 ? '#fa8c16' : undefined }}>
              {DataTransformer.formatCost(value)}
            </Text>
          ),
        },
      ],
    },
    {
      title: '总计使用',
      children: [
        {
          title: renderSortableTitle('请求数', 'total.requests'),
          dataIndex: ['total', 'requests'],
          key: 'total.requests',
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('total.requests'),
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
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('total.tokens'),
          render: (value: number) => (
            <Text strong type={value > 0 ? undefined : 'secondary'}>
              {DataTransformer.formatNumber(value)}
            </Text>
          ),
        },
        {
          title: renderSortableTitle('成本', 'total.cost'),
          dataIndex: ['total', 'cost'],
          key: 'total.cost',
          width: 100,
          sorter: true,
          sortOrder: toAntdSortOrder('total.cost'),
          render: (value: number) => (
            <Text strong type={value > 0 ? undefined : 'secondary'} style={{ color: value > 0 ? '#fa8c16' : undefined }}>
              {DataTransformer.formatCost(value)}
            </Text>
          ),
        },
      ],
    },
  ];

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    // 控制排序：antd 在嵌套 dataIndex (['daily','requests']) 时，sorter.field 可能是数组
    if (sorter) {
      let fieldKey: string | undefined;
      if (sorter.columnKey) {
        fieldKey = String(sorter.columnKey); // 我们的列 key 已设置为 'daily.requests' 形式
      } else if (Array.isArray(sorter.field)) {
        fieldKey = sorter.field.join('.');
      } else if (typeof sorter.field === 'string') {
        fieldKey = sorter.field;
      }
      if (fieldKey) {
        onSort(fieldKey);
      }
    }
    // 同步分页条数变更
    if (pagination && typeof pagination.pageSize === 'number') {
      setPageSize((prev) => (prev !== pagination.pageSize ? pagination.pageSize : prev));
    }
  };

  return (
    <Table<ProcessedApiKeyData>
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      onChange={handleTableChange}
      scroll={{ x: isMobile ? 800 : 1200 }}
      pagination={{
        pageSize,
        pageSizeOptions: isMobile ? [5, 10, 20] : [10, 20, 50, 100],
        showSizeChanger: !isMobile,
        showQuickJumper: !isSmallScreen,
        showTotal: (total, range) => (
          <span>
            第 {range[0]}-{range[1]} 条 / 共 {total} 条
          </span>
        ),
      }}
    />
  );
};