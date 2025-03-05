import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export const selectRepositoriesState = (state: RootState) => state.repositories;

export const selectAllRepositories = createSelector(
  selectRepositoriesState,
  (state) => state.items || []
);

export const selectRepositoriesStatus = createSelector(
  selectRepositoriesState,
  (state) => state.status
);

export const selectRepositoriesError = createSelector(
  selectRepositoriesState,
  (state) => state.error
);

export const selectPagination = createSelector(
  selectRepositoriesState,
  (state) => ({
    currentPage: state.currentPage,
    totalPages: Math.ceil(state.total / state.perPage),
    perPage: state.perPage,
  })
); 