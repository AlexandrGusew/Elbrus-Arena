import { useState, useEffect, useCallback } from 'react';

/**
 * Универсальный хук для асинхронных операций
 * Управляет состояниями loading, error, data
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string>('');

  // Выполнить асинхронную функцию
  const execute = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await asyncFunction();
      setData(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Произошла ошибка';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  // Выполнить при монтировании если immediate = true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    setData,
  };
}
