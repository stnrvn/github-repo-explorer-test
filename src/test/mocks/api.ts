import { GitHubUser } from '@/types/github';

export const searchUsers = jest.fn();
export const getUserRepositories = jest.fn();

// Setup default mock implementations
searchUsers.mockImplementation(async (): Promise<GitHubUser[]> => {
  return [
    {
      id: 1,
      login: 'testuser',
      avatar_url: 'https://avatars.githubusercontent.com/u/1',
      html_url: 'https://github.com/testuser',
    }
  ];
}); 