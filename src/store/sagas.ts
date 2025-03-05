import { all, fork } from 'redux-saga/effects';
import { searchSaga } from '@/features/search/searchSaga';
import { repositoriesSaga } from '@/features/repositories/repositoriesSaga';

// Import feature sagas here
// import { searchSaga } from '@/features/search/searchSaga';
// import { repositoriesSaga } from '@/features/repositories/repositoriesSaga';

export function* rootSaga() {
  yield all([
    fork(searchSaga),
    fork(repositoriesSaga),
    // Add sagas here
    // searchSaga(),
    // repositoriesSaga(),
  ]);
} 