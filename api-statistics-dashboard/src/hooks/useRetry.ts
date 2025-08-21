import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export const useRetry = (options: UseRetryOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      let currentRetry = 0;
      let currentDelay = retryDelay;

      while (currentRetry <= maxRetries) {
        try {
          setRetryCount(currentRetry);
          
          if (currentRetry > 0) {
            setIsRetrying(true);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
          }

          const result = await operation();
          
          // 成功后重置状态
          setRetryCount(0);
          setIsRetrying(false);
          
          return result;
        } catch (error) {
          currentRetry++;
          
          if (currentRetry > maxRetries) {
            setIsRetrying(false);
            throw error;
          }
          
          // 指数退避
          currentDelay *= backoffMultiplier;
          
          console.warn(`Operation failed, retrying (${currentRetry}/${maxRetries})...`, error);
        }
      }

      throw new Error('Max retries exceeded');
    },
    [maxRetries, retryDelay, backoffMultiplier]
  );

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    reset,
    canRetry: retryCount < maxRetries,
  };
};