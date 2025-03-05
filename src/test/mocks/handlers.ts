import { http, HttpResponse } from 'msw'
import { GitHubUser, GitHubRepository } from '@/types/github';

const BASE_URL = 'https://api.github.com';

export const mockUser: GitHubUser = {
  id: 1,
  login: 'testuser',
  avatar_url: 'https://avatars.githubusercontent.com/u/1',
  html_url: 'https://github.com/testuser',
};

export const mockRepo: GitHubRepository = {
  id: 1,
  name: 'test-repo',
  full_name: 'testuser/test-repo',
  description: 'Test repository',
  html_url: 'https://github.com/testuser/test-repo',
  stargazers_count: 10,
  language: 'TypeScript',
  updated_at: '2024-03-19T12:00:00Z',
  owner: {
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/u/1',
  },
};

export const handlers = [
  // Search users
  http.get(`${BASE_URL}/search/users`, () => {
    return HttpResponse.json({
      items: [mockUser],
    });
  }),

  // Get user repositories
  http.get(`${BASE_URL}/users/:username/repos`, () => {
    return HttpResponse.json([mockRepo]);
  }),
]; 