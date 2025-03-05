import { combineReducers } from '@reduxjs/toolkit';
import searchReducer from '@/features/search/searchSlice';
import repositoriesReducer from '@/features/repositories/repositoriesSlice';

// Import feature reducers here
// import { searchReducer } from '@/features/search/searchSlice';
// import { repositoriesReducer } from '@/features/repositories/repositoriesSlice';

export const rootReducer = combineReducers({
  search: searchReducer,
  repositories: repositoriesReducer,
  // Add reducers here
  // search: searchReducer,
  // repositories: repositoriesReducer,
}); 