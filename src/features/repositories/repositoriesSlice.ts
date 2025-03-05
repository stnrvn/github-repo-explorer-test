import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RepositoriesState } from '@/store/types';
import { GitHubRepository } from '@/types/github';

const initialState: RepositoriesState = {
  items: [],
  status: 'idle',
  error: null,
  currentPage: 1,
  perPage: 10,
  total: 0,
};

const repositoriesSlice = createSlice({
  name: 'repositories',
  initialState,
  reducers: {
    fetchRepositoriesStart: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    fetchRepositoriesSuccess: (state, action: PayloadAction<{ repositories: GitHubRepository[]; total: number; page: number }>) => {
      state.status = 'succeeded';
      state.items = action.payload.repositories;
      state.total = action.payload.total;
      state.currentPage = action.payload.page;
      state.error = null;
    },
    fetchRepositoriesFailure: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearRepositories: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      state.currentPage = 1;
      state.total = 0;
    },
  },
});

export const {
  fetchRepositoriesStart,
  fetchRepositoriesSuccess,
  fetchRepositoriesFailure,
  setPage,
  clearRepositories,
} = repositoriesSlice.actions;

export default repositoriesSlice.reducer; 