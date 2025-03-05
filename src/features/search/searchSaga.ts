import { 
  call, 
  put, 
  takeLatest, 
  delay, 
  CallEffect, 
  PutEffect 
} from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { setSearchQuery, searchUsersSuccess, searchUsersFailure } from './searchSlice';
import { searchUsers } from './api';
import { GitHubUser } from '@/types/github';
import { GitHubApiError } from '@/api/github';

type SearchSagaEffect = 
  | CallEffect<GitHubUser[]> 
  | PutEffect<ReturnType<typeof searchUsersSuccess>>
  | PutEffect<ReturnType<typeof searchUsersFailure>>;

function* handleSearchQuery(action: PayloadAction<{ query: string; signal?: AbortSignal }>): Generator<SearchSagaEffect | ReturnType<typeof delay>, void, GitHubUser[]> {
  const { query, signal } = action.payload;

  if (!query) {
    yield put(searchUsersSuccess([]));
    return;
  }

  try {
    yield delay(300); // Debounce
    const users = yield call(searchUsers, query, signal);
    yield put(searchUsersSuccess(users));
  } catch (error) {
    if (error instanceof GitHubApiError) {
      yield put(searchUsersFailure(error.message));
    } else if (error instanceof Error) {
      yield put(searchUsersFailure(error.message || 'An unknown error occurred'));
    } else {
      yield put(searchUsersFailure('An unexpected error occurred'));
    }
  }
}

export function* searchSaga(): Generator<ReturnType<typeof takeLatest>, void, void> {
  yield takeLatest(setSearchQuery.type, handleSearchQuery);
} 