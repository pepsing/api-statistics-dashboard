import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 检查本地存储的token
  useEffect(() => {
    const checkSavedToken = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const savedToken = localStorage.getItem('api-dashboard-token');
        if (savedToken) {
          // 验证保存的token是否仍然有效
          const isValid = await apiService.validateToken(savedToken);
          if (isValid) {
            setToken(savedToken);
            setIsAuthenticated(true);
          } else {
            // Token无效，清除本地存储
            localStorage.removeItem('api-dashboard-token');
          }
        }
      } catch (err) {
        console.error('Token validation failed:', err);
        localStorage.removeItem('api-dashboard-token');
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedToken();
  }, []);

  const login = async (newToken: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const isValid = await apiService.validateToken(newToken);
      if (isValid) {
        setToken(newToken);
        setIsAuthenticated(true);
        localStorage.setItem('api-dashboard-token', newToken);
        return true;
      } else {
        setError('令牌无效，请检查后重试');
        return false;
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || '登录失败，请重试');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem('api-dashboard-token');
    apiService.setAuthToken('');
  };

  return {
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
};