import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type AsyncFunction<T> = (...args: any[]) => Promise<T>;

export function useAsync<T>(asyncFunction: AsyncFunction<T>, immediate = false) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await asyncFunction(...args);
        setState({ data: response, loading: false, error: null });
        return response;
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error });
        throw error;
      }
    },
    [asyncFunction]
  );

  // Executar imediatamente se solicitado
  useState(() => {
    if (immediate) {
      execute();
    }
  });

  return {
    execute,
    ...state,
    // Helpers
    isIdle: !state.loading && !state.error && !state.data,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !!state.data && !state.error,
  };
} 