import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GitHubUser, SearchState } from '@/types/github';

interface SetSearchQueryPayload {
  query: string;
  signal?: AbortSignal;
}

const initialState: SearchState = {
  query: '',
  users: [],
  selectedUser: null,
  status: 'idle',
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<SetSearchQueryPayload>) => {
      state.query = action.payload.query;
      state.status = 'loading';
      state.error = null;
    },
    searchUsersSuccess: (state, action: PayloadAction<GitHubUser[]>) => {
      state.users = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    searchUsersFailure: (state, action: PayloadAction<string>) => {
      state.users = [];
      state.status = 'failed';
      state.error = action.payload;
    },
    selectUser: (state, action: PayloadAction<GitHubUser>) => {
      state.selectedUser = action.payload;
    },
    clearUsers: (state) => {
      state.users = [];
      state.status = 'idle';
      state.error = null;
    },
    clearSearch: () => {
      return initialState;
    },
  },
});

export const {
  setSearchQuery,
  searchUsersSuccess,
  searchUsersFailure,
  selectUser,
  clearSearch,
  clearUsers,
} = searchSlice.actions;

export default searchSlice.reducer; 