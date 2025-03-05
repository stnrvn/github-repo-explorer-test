import { githubApi } from '@/api/github';
import { GitHubUser } from '@/types/github';

export const searchUsers = async (query: string, signal?: AbortSignal): Promise<GitHubUser[]> => {
  if (!query) return [];
  
  try {
    const users = await githubApi.searchUsers(query, { signal });
    return users.map((user) => ({
      id: user.id,
      login: user.login,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
    }));
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw error;
    }
    throw new Error(error.message || 'Failed to fetch users');
  }
}; 