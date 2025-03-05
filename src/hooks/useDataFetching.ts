import { useState, useEffect, useCallback, useRef } from 'react';
import { errorTracker } from '@/utils/errorTracking';
import { abortablePromise, memoizeWithTTL } from '@/utils/performance';

interface FetchOptions {
  timeout?: number;
  cacheTTL?: number;
  retries?: number;
  retryDelay?: number;
}

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isCached: boolean;
}

const DEFAULT_OPTIONS: FetchOptions = {
  timeout: 5000,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  retries: 2,
  retryDelay: 1000,
};

export function useDataFetching<T, Deps extends readonly unknown[] = []>(
  fetchFn: () => Promise<T>,
  dependencies: Deps = [] as unknown as Deps,
  options: FetchOptions = {}
): [FetchState<T>, () => Promise<void>] {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
    isCached: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { timeout, cacheTTL, retries, retryDelay } = { ...DEFAULT_OPTIONS, ...options };

  // Memoize the fetch function with TTL caching
  const memoizedFetch = useCallback(
    memoizeWithTTL(
      async () => {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const result = await abortablePromise(
            fetchFn(),
            timeout!
          );

          setState(prev => ({
            ...prev,
            data: result,
            error: null,
            isLoading: false,
            isCached: false,
          }));

          return result;
        } catch (error) {
          if (error instanceof Error) {
            errorTracker.captureError(error, 'medium', {
              action: 'data_fetching',
              additionalData: { dependencies }
            });
          }
          throw error;
        }
      },
      cacheTTL!
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies]
  );

  const fetchWithRetry = useCallback(async (retriesLeft: number): Promise<void> => {
    try {
      await memoizedFetch();
    } catch (error) {
      if (retriesLeft > 0 && !(error instanceof DOMException && error.name === 'AbortError')) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        await fetchWithRetry(retriesLeft - 1);
      } else {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error : new Error(String(error)),
          isLoading: false,
        }));
      }
    }
  }, [memoizedFetch, retryDelay]);

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    await fetchWithRetry(retries!);
  }, [fetchWithRetry, retries]);

  useEffect(() => {
    fetchWithRetry(retries!);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchWithRetry, retries]);

  return [state, refetch];
} 