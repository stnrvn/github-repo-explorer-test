import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export const selectSearchState = (state: RootState) => state.search;

export const selectSearchQuery = createSelector(
  selectSearchState,
  (state) => state.query
);

export const selectSearchUsers = createSelector(
  selectSearchState,
  (state) => state.users
);

export const selectSearchStatus = createSelector(
  selectSearchState,
  (state) => state.status
);

export const selectSearchError = createSelector(
  selectSearchState,
  (state) => state.error
);

export const selectSelectedUser = createSelector(
  selectSearchState,
  (state) => state.selectedUser
); 