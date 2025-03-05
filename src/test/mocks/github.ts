import { GitHubUser, GetRepositoriesResponse } from '@/types/github';
import { mockUser, mockRepo } from './handlers';

export class GitHubApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export const githubApi = {
  searchUsers: jest.fn().mockImplementation(
    async (query: string): Promise<GitHubUser[]> => {
      if (!query) return [];
      return [mockUser];
    }
  ),
  
  getUserRepositories: jest.fn().mockImplementation(
    async (_username: string): Promise<GetRepositoriesResponse> => {
      return {
        repositories: [mockRepo],
        total: 1
      };
    }
  )
}; 