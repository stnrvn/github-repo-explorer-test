import { SearchState, GitHubRepository } from '@/types/github';

export interface RepositoriesState {
  items: GitHubRepository[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentPage: number;
  perPage: number;
  total: number;
}

export interface RootState {
  search: SearchState;
  repositories: RepositoriesState;
} 