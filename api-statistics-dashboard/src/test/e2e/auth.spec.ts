import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // 在页面加载前清理 localStorage，避免初始化时触发 token 校验
    await page.addInitScript(() => {
      try { localStorage.clear(); } catch {}
    });
    await page.goto('/');
  });

  test('successful authentication flow', async ({ page }) => {
    // 模拟成功的 API 响应 - 必须在页面访问前设置
    await page.route('**/admin/api-keys', async (route) => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'test-id-1',
            name: 'test-key-1',
            isActive: true,
            lastUsedAt: '2025-01-20T10:00:00.000Z',
            usage: {
              total: { tokens: 10000, requests: 100, cost: 50.25 },
              daily: { tokens: 500, requests: 5, cost: 2.5 },
              monthly: { tokens: 8000, requests: 80, cost: 40.0 },
              averages: { rpm: 0.1, tpm: 10.5, dailyRequests: 5, dailyTokens: 500 }
            }
          }
        ]
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    // 访问首页，应显示登录表单
    await page.goto('/');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 验证登录表单存在
    await expect(page.getByText('API统计仪表板')).toBeVisible();
    await expect(page.getByText('请输入您的授权令牌以访问统计数据')).toBeVisible();
    
    // 输入有效token
    const tokenInput = page.getByPlaceholder('请输入您的Bearer令牌');
    await tokenInput.fill('valid-token-123');
    
    // 点击登录按钮
    const loginButton = page.getByRole('button', { name: '登录' });
    await loginButton.click();
    
    // 验证加载状态
    await expect(page.getByText('验证中...')).toBeVisible();
    
    // 等待跳转到仪表板 - 增加更长的等待时间
    await expect(page.locator('text=数据视图')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=统计概览')).toBeVisible({ timeout: 5000 });
    
    // 验证汇总卡片显示
    await expect(page.getByText('总计请求数')).toBeVisible();
    await expect(page.getByText('总计令牌数')).toBeVisible();
    await expect(page.getByText('总计成本')).toBeVisible();
    await expect(page.getByText('活跃密钥')).toBeVisible();
    
    // 验证时间维度选择器
    await expect(page.getByText('今日')).toBeVisible();
    await expect(page.getByText('本周')).toBeVisible();
    await expect(page.getByText('本月')).toBeVisible();
    await expect(page.getByText('总计')).toBeVisible();
    
    // 验证数据表格
    await expect(page.getByText('详细数据')).toBeVisible();
    await expect(page.getByText('共 1 个API密钥')).toBeVisible();
    
    // 验证退出按钮存在
    await expect(page.getByRole('button', { name: '退出' })).toBeVisible();
    
    // 验证token已保存到localStorage
    const savedToken = await page.evaluate(() => localStorage.getItem('api-dashboard-token'));
    expect(savedToken).toBe('valid-token-123');
  });

  test('invalid token authentication failure', async ({ page }) => {
    // 模拟401响应
    await page.route('**/admin/api-keys', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Invalid token' })
      });
    });

    await page.goto('/');
    
    // 输入无效token
    await page.getByPlaceholder('请输入您的Bearer令牌').fill('invalid-token');
    await page.getByRole('button', { name: '登录' }).click();
    
    // 验证错误提示出现
    await expect(page.getByText('认证失败')).toBeVisible();
    await expect(page.getByText('认证失败，请检查token是否正确')).toBeVisible();
    
    // 验证仍在登录页面
    await expect(page.getByText('请输入您的授权令牌以访问统计数据')).toBeVisible();
    
    // 验证清除token按钮存在且可用
    await expect(page.getByRole('button', { name: '清除保存的令牌' })).toBeVisible();
  });

  test('network error handling', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/admin/api-keys', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/');
    
    // 输入token并登录
    await page.getByPlaceholder('请输入您的Bearer令牌').fill('test-token');
    await page.getByRole('button', { name: '登录' }).click();
    
    // 验证网络错误提示
    await expect(page.getByText('认证失败')).toBeVisible();
    await expect(page.getByText('网络连接失败，请检查网络连接')).toBeVisible();
  });

  test('server error handling', async ({ page }) => {
    // 模拟500服务器错误
    await page.route('**/admin/api-keys', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Internal server error' })
      });
    });

    await page.goto('/');
    
    // 输入token并登录
    await page.getByPlaceholder('请输入您的Bearer令牌').fill('test-token');
    await page.getByRole('button', { name: '登录' }).click();
    
    // 验证服务器错误提示
    await expect(page.getByText('认证失败')).toBeVisible();
    await expect(page.getByText('服务器内部错误')).toBeVisible();
  });

  test('clear saved token functionality', async ({ page }) => {
    await page.goto('/');
    
    // 输入token
    await page.getByPlaceholder('请输入您的Bearer令牌').fill('test-token');
    
    // 验证token已输入
    await expect(page.getByPlaceholder('请输入您的Bearer令牌')).toHaveValue('test-token');
    
    // 模拟认证失败以显示清除按钮
    await page.route('**/admin/api-keys', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Invalid token' })
      });
    });
    
    await page.getByRole('button', { name: '登录' }).click();
    
    // 等待错误出现
    await expect(page.getByText('认证失败')).toBeVisible();
    
    // 点击清除保存的令牌
    await page.getByRole('button', { name: '清除保存的令牌' }).click();
    
    // 验证输入框已清空
    await expect(page.getByPlaceholder('请输入您的Bearer令牌')).toHaveValue('');
    
    // 验证localStorage已清空
    const savedToken = await page.evaluate(() => localStorage.getItem('api-dashboard-token'));
    expect(savedToken).toBeNull();
  });

  test('form validation', async ({ page }) => {
    await page.goto('/');
    
    // 尝试提交空表单
    await page.getByRole('button', { name: '登录' }).click();
    
    // 验证必填项错误提示
    await expect(page.getByText('请输入授权令牌')).toBeVisible();
    
    // 输入过短的token
    await page.getByPlaceholder('请输入您的Bearer令牌').fill('123');
    await page.getByRole('button', { name: '登录' }).click();
    
    // 验证长度错误提示
    await expect(page.getByText('令牌长度至少为10个字符')).toBeVisible();
    
    // 输入包含特殊字符的token
    await page.getByPlaceholder('请输入您的Bearer令牌').fill('invalid-token-!@#');
    await page.getByRole('button', { name: '登录' }).click();
    
    // 验证格式错误提示
    await expect(page.getByText('令牌只能包含字母和数字')).toBeVisible();
  });
});