import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { errorTracker } from '@/utils/errorTracking';
import { measurePerformance } from '@/utils/performance';
import { useRetry } from '@/hooks/useRetry';
import { selectUser } from '../searchSlice';
import {
  selectSearchUsers,
  selectSearchStatus,
  selectSearchError,
  selectSelectedUser,
} from '../selectors';
import { GitHubUser } from '@/types/github';

const UserSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  </div>
);

export const UserList = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectSearchUsers);
  const status = useSelector(selectSearchStatus);
  const error = useSelector(selectSearchError);
  const selectedUser = useSelector(selectSelectedUser);

  const {
    canRetry,
    remainingAttempts,
    handleRetry,
    resetRetryCount
  } = useRetry({
    actionName: 'select_user',
    maxRetries: 3,
  });

  const handleUserSelect = useCallback(async (user: GitHubUser) => {
    try {
      await measurePerformance(
        async () => {
          dispatch(selectUser(user));
          resetRetryCount();
        },
        'selectUser'
      );
    } catch (error) {
      if (error instanceof Error) {
        errorTracker.captureError(error, 'medium', {
          action: 'select_user',
          additionalData: { userId: user.id }
        });
        throw error; // Re-throw to trigger retry
      }
    }
  }, [dispatch, resetRetryCount]);

  const retryLastAction = useCallback(() => {
    if (selectedUser) {
      handleRetry(() => handleUserSelect(selectedUser));
    }
  }, [selectedUser, handleRetry, handleUserSelect]);

  if (status === 'loading') {
    return (
      <div className="space-y-4 bg-gray-900 rounded-lg p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-4">
            <UserSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    errorTracker.captureError(new Error(error), 'high', {
      action: 'user_list_error'
    });

    return (
      <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-200" role="alert">
        <p>{error}</p>
        <div className="mt-2 flex items-center space-x-2">
          <button
            onClick={retryLastAction}
            disabled={!canRetry}
            className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-red-900 disabled:text-gray-400"
          >
            {!canRetry ? 'Max retries reached' : 'Retry'}
          </button>
          {remainingAttempts > 0 && (
            <span className="text-xs text-red-400">
              ({remainingAttempts} attempts left)
            </span>
          )}
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-lg">
        <p className="text-gray-400">No users found</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-2 bg-gray-900 rounded-lg">
        {users.map((user: GitHubUser) => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user)}
            className={`w-full p-4 text-left transition-colors rounded-lg ${
              selectedUser?.id === user.id
                ? 'bg-gray-800'
                : 'bg-gray-800/50 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar_url}
                alt={`${user.login}'s avatar`}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-medium text-white">{user.login}</h3>
                <p className="text-sm text-gray-400">View repositories</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ErrorBoundary>
  );
}; 