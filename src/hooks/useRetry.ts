import { useCallback, useState } from 'react';
import { errorTracker } from '@/utils/errorTracking';

interface UseRetryOptions {
  maxRetries?: number;
  onMaxRetriesReached?: () => void;
  actionName: string;
}

interface UseRetryResult {
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
  remainingAttempts: number;
  handleRetry: (action: () => Promise<void>) => Promise<void>;
  resetRetryCount: () => void;
}

export const useRetry = ({
  maxRetries = 3,
  onMaxRetriesReached,
  actionName,
}: UseRetryOptions): UseRetryResult => {
  const [retryCount, setRetryCount] = useState(0);

  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
  }, []);

  const handleRetry = useCallback(async (action: () => Promise<void>) => {
    if (retryCount >= maxRetries) {
      errorTracker.captureMessage(
        'Max retries reached',
        'medium',
        {
          action: `${actionName}_max_retries`,
          additionalData: { maxRetries, retryCount }
        }
      );
      onMaxRetriesReached?.();
      return;
    }

    try {
      setRetryCount(count => count + 1);
      await action();
      // Reset count on success
      resetRetryCount();
    } catch (error) {
      if (error instanceof Error) {
        errorTracker.captureError(error, 'high', {
          action: `${actionName}_retry_error`,
          additionalData: {
            retryCount,
            maxRetries
          }
        });
      }

      // If still have retries left, throw the error to trigger another retry
      if (retryCount < maxRetries) {
        throw error;
      }
    }
  }, [maxRetries, onMaxRetriesReached, actionName, resetRetryCount, retryCount]);

  return {
    retryCount,
    maxRetries,
    canRetry: retryCount < maxRetries,
    remainingAttempts: maxRetries - retryCount,
    handleRetry,
    resetRetryCount,
  };
}; 