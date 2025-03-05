import { ChangeEvent, useCallback, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@/components/ui/Input';
import { setSearchQuery, clearUsers } from '../searchSlice';
import { selectSearchError, selectSearchStatus, selectSearchQuery } from '../selectors';
import { debounce } from '@/utils/performance';
import { errorTracker } from '@/utils/errorTracking';
import { useRetry } from '@/hooks/useRetry';

export const SearchInput = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectSearchStatus);
  const error = useSelector(selectSearchError);
  const reduxQuery = useSelector(selectSearchQuery);
  const [value, setValue] = useState(reduxQuery);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debouncedSearchRef = useRef<ReturnType<typeof debounce>>();

  const {
    canRetry,
    remainingAttempts,
    handleRetry,
    resetRetryCount
  } = useRetry({
    actionName: 'search_query',
    maxRetries: 3,
  });

  // Sync local state with Redux state when it changes externally
  useEffect(() => {
    setValue(reduxQuery);
  }, [reduxQuery]);

  // Cleanup function to abort any pending requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const executeSearch = useCallback(async (query: string) => {
    try {
      cleanup(); // Cancel any pending request
      
      if (!query.trim()) {
        return;
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      dispatch(setSearchQuery({ 
        query,
        signal: abortControllerRef.current.signal 
      }));
      
      resetRetryCount();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorTracker.captureMessage('Search request aborted', 'low', {
            action: 'search_abort',
            additionalData: { query }
          });
          return;
        }

        errorTracker.captureError(error, 'medium', {
          action: 'search_query',
          additionalData: { query }
        });
        throw error; // Re-throw to trigger retry
      }
    }
  }, [cleanup, dispatch, resetRetryCount]);

  // Initialize debounced search function
  useEffect(() => {
    debouncedSearchRef.current = debounce((query: unknown) => {
      executeSearch(query as string);
    }, 500); // Increased debounce time to 500ms

    return () => {
      if (debouncedSearchRef.current) {
        // @ts-ignore - TypeScript doesn't know about the internal timeout
        clearTimeout(debouncedSearchRef.current.timeout);
      }
    };
  }, [executeSearch]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      
      if (!newValue.trim()) {
        dispatch(clearUsers());
        return;
      }
      
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current(newValue);
      }
    },
    [dispatch, debouncedSearchRef]
  );

  const retryLastSearch = useCallback(() => {
    if (value) {
      handleRetry(() => {
        dispatch(setSearchQuery({ query: value }));
        return new Promise((resolve) => {
          const checkStatus = () => {
            if (status === 'succeeded' || status === 'failed') {
              resolve();
            } else {
              setTimeout(checkStatus, 100);
            }
          };
          checkStatus();
        });
      });
    }
  }, [value, handleRetry, dispatch, status]);

  return (
    <div className="relative">
      <Input
        id="search-input"
        type="search"
        placeholder="Search GitHub users..."
        value={value}
        onChange={handleChange}
        error={error || undefined}
        aria-label="Search GitHub users"
        className="max-w-md mx-auto"
      />
      {error && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 pr-3">
          <button
            onClick={retryLastSearch}
            disabled={!canRetry}
            className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:hover:text-gray-500"
          >
            {!canRetry ? 'Max retries reached' : 'Retry'}
          </button>
          {remainingAttempts > 0 && (
            <span className="text-xs text-gray-500">
              ({remainingAttempts} attempts left)
            </span>
          )}
        </div>
      )}
    </div>
  );
}; 