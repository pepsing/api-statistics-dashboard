import React, { Component, type ReactNode } from 'react';
import { Result, Button } from 'antd';
import { BugOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          padding: '20px'
        }}>
          <Result
            icon={<BugOutlined />}
            status="error"
            title="应用程序出现错误"
            subTitle={
              <div>
                <p>抱歉，应用程序遇到了意外错误。</p>
                {this.state.error && (
                  <details style={{ marginTop: '16px', textAlign: 'left' }}>
                    <summary style={{ cursor: 'pointer', color: '#666' }}>
                      查看错误详情
                    </summary>
                    <pre style={{ 
                      marginTop: '8px', 
                      padding: '12px', 
                      background: '#f5f5f5', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      overflow: 'auto'
                    }}>
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            }
            extra={[
              <Button type="primary" key="reload" onClick={this.handleReload}>
                重新加载页面
              </Button>,
              <Button key="report" onClick={() => {
                // 这里可以添加错误报告逻辑
                console.log('Report error:', this.state.error);
              }}>
                报告问题
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}