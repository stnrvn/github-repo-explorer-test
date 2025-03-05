import { combineReducers } from '@reduxjs/toolkit';
import searchReducer from '@/features/search/searchSlice';

export const rootReducer = combineReducers({
  search: searchReducer,
}); 