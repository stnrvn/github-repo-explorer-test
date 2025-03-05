import { GitHubRepository } from '@/types/github';

interface RepositoryItemProps {
  repository: GitHubRepository;
}

export const RepositoryItem = ({ repository }: RepositoryItemProps) => {
  return (
    <div className="bg-gray-800/50 hover:bg-gray-800 rounded-lg p-4 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 text-white"
            >
              {repository.name}
            </a>
          </h3>
          {repository.description && (
            <p className="mt-1 text-sm text-gray-300 line-clamp-2">
              {repository.description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-400 space-x-4">
        {repository.language && (
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <span>{repository.language}</span>
          </div>
        )}
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <span>{repository.stargazers_count}</span>
        </div>
        <div>
          Updated{' '}
          {new Date(repository.updated_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
}; 