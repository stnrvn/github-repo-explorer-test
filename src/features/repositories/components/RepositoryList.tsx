import { useSelector } from 'react-redux';
import { RepositoryItem } from './RepositoryItem';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { errorTracker } from '@/utils/errorTracking';
import { measurePerformance } from '@/utils/performance';
import { GitHubRepository } from '@/types/github';
import {
  selectAllRepositories,
  selectRepositoriesError,
  selectRepositoriesStatus,
  selectPagination,
} from '../selectors';
import { selectSelectedUser } from '../../search/selectors';

const RepositorySkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <div className="flex space-x-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);

export const RepositoryList = () => {
  const repositories = useSelector(selectAllRepositories);
  const status = useSelector(selectRepositoriesStatus);
  const error = useSelector(selectRepositoriesError);
  const { currentPage, totalPages } = useSelector(selectPagination);
  const selectedUser = useSelector(selectSelectedUser);

  const handleLoadMore = async () => {
    try {
      await measurePerformance(
        async () => {
          // Load more repositories logic
        },
        'loadMoreRepositories'
      );
    } catch (error) {
      if (error instanceof Error) {
        errorTracker.captureError(error, 'medium', {
          action: 'load_more_repositories',
          additionalData: { currentPage, totalPages }
        });
      }
    }
  };

  if (!selectedUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Select a user to view their repositories</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-lg shadow-sm p-4"
            aria-hidden="true"
          >
            <RepositorySkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    errorTracker.captureError(new Error(error), 'high', {
      action: 'repository_list_error',
      additionalData: { selectedUser: selectedUser.login }
    });
    
    return (
      <div
        className="bg-red-900 border border-red-700 rounded-md p-4 text-red-200"
        role="alert"
      >
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No repositories found for this user</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {repositories.map((repository: GitHubRepository) => (
          <RepositoryItem key={repository.id} repository={repository} />
        ))}
        {currentPage < totalPages && (
          <div className="flex justify-center pt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleLoadMore}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}; 