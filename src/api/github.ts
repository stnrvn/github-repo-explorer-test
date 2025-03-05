import { Octokit } from '@octokit/rest';
import type { Endpoints } from '@octokit/types';
import { GitHubUser, GitHubRepository, GetRepositoriesResponse, OctokitUserResponse } from '@/types/github';

// Use process.env in test environment, import.meta.env in development/production
function getGithubToken() {
  if (process.env.NODE_ENV === 'test') {
    return process.env.VITE_GITHUB_TOKEN || 'test-token';
  }

  if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
    return 'test-token';
  }
  // Using a try-catch to handle environments where import.meta is not available
  try {
    return import.meta.env.VITE_GITHUB_TOKEN;
  } catch (error) {
    return 'test-token';
  }
}

const createOctokit = (options: { signal?: AbortSignal } = {}) => new Octokit({
  auth: getGithubToken(),
  request: {
    signal: options.signal,
  },
});

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

interface OctokitError extends Error {
  status?: number;
  response?: {
    data?: {
      message?: string;
      documentation_url?: string;
    };
  };
}

type ListUserReposResponse = Endpoints['GET /users/{username}/repos']['response']['data'][0];

export const githubApi = {
  async searchUsers(query: string, options: { signal?: AbortSignal } = {}): Promise<GitHubUser[]> {
    try {
      const octokit = createOctokit(options);
      const response = await octokit.search.users({
        q: query,
        per_page: 5,
      });
      return response.data.items.map((item: OctokitUserResponse) => ({
        id: item.id,
        login: item.login,
        avatar_url: item.avatar_url,
        html_url: item.html_url,
      }));
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw error;
        }
        const octokitError = error as OctokitError;
        throw new GitHubApiError(
          octokitError.response?.data?.message || error.message || 'Failed to search users',
          octokitError.status,
          'SEARCH_USERS_ERROR'
        );
      }
      throw new GitHubApiError('An unexpected error occurred', undefined, 'UNKNOWN_ERROR');
    }
  },

  async getUserRepositories(
    username: string,
    page: number = 1,
    perPage: number = 10,
    options: { signal?: AbortSignal } = {}
  ): Promise<GetRepositoriesResponse> {
    try {
      const octokit = createOctokit(options);
      const response = await octokit.repos.listForUser({
        username,
        sort: 'updated',
        direction: 'desc',
        per_page: perPage,
        page,
      });
      
      const repositories: GitHubRepository[] = response.data.map((repo: ListUserReposResponse) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count || 0,
        language: repo.language || null,
        updated_at: repo.updated_at || new Date().toISOString(),
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
        },
      }));

      const totalCount = response.headers['x-total-count'];
      const total = totalCount ? parseInt(totalCount as string, 10) : response.data.length;

      return {
        repositories,
        total,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw error;
        }
        const octokitError = error as OctokitError;
        throw new GitHubApiError(
          octokitError.response?.data?.message || error.message || 'Failed to fetch repositories',
          octokitError.status,
          'GET_REPOSITORIES_ERROR'
        );
      }
      throw new GitHubApiError('An unexpected error occurred', undefined, 'UNKNOWN_ERROR');
    }
  },
}; 