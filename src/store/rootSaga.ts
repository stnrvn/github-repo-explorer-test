import { all } from 'redux-saga/effects';
import { searchSaga } from '@/features/search/searchSaga';

export function* rootSaga() {
  yield all([
    searchSaga(),
  ]);
} 