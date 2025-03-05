// API Types
export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

// API Response Types from Octokit
export interface OctokitUserResponse {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  [key: string]: unknown;
}

export interface OctokitRepoResponse {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number | undefined;
  language: string | null;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// State Types
export interface SearchState {
  query: string;
  users: GitHubUser[];
  selectedUser: GitHubUser | null;
  status: RequestStatus;
  error: string | null;
}

export interface RepositoriesState {
  items: GitHubRepository[];
  status: RequestStatus;
  error: string | null;
  currentPage: number;
  perPage: number;
  total: number;
}

// Common Types
export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// Action Types
export interface PaginationParams {
  page: number;
  per_page: number;
}

// API Response Types
export interface SearchUsersResponse {
  items: GitHubUser[];
  total_count: number;
}

export interface GetRepositoriesResponse {
  repositories: GitHubRepository[];
  total: number;
} 