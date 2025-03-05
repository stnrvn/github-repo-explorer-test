import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select, takeLatest, SagaReturnType } from 'redux-saga/effects';
import { githubApi } from '@/api/github';
import { errorTracker } from '@/utils/errorTracking';
import { measurePerformance, abortablePromise } from '@/utils/performance';
import {
  fetchRepositoriesStart,
  fetchRepositoriesSuccess,
  fetchRepositoriesFailure,
  setPage,
  clearRepositories,
} from './repositoriesSlice';
import { RootState } from '@/store';
import { GitHubUser } from '@/types/github';
import { selectSelectedUser } from '../search/selectors';

// Selectors
const selectCurrentPage = (state: RootState) => state.repositories.currentPage;
const selectPerPage = (state: RootState) => state.repositories.perPage;

function* handleFetchRepositories(action: PayloadAction<any>): Generator<any, void, any> {
  const abortController = new AbortController();

  try {
    // Clear existing repositories when a new user is selected
    if (action.type === 'search/selectUser') {
      yield put(clearRepositories());
    }

    const currentPage: number = yield select(selectCurrentPage);
    const perPage: number = yield select(selectPerPage);
    const selectedUser: GitHubUser | null = yield select(selectSelectedUser);

    if (!selectedUser) {
      throw new Error('No user selected');
    }

    yield put(fetchRepositoriesStart());

    const result: SagaReturnType<typeof githubApi.getUserRepositories> = 
      yield call(function* (): Generator<any, any, any> {
        return yield call(
          measurePerformance,
          () => abortablePromise(
            githubApi.getUserRepositories(
              selectedUser.login,
              currentPage,
              perPage,
              { signal: abortController.signal }
            ),
            5000 // 5 second timeout
          ),
          `fetchRepositories_${selectedUser.login}_page${currentPage}`
        );
      });

    yield put(
      fetchRepositoriesSuccess({
        repositories: result.repositories,
        total: result.total,
        page: currentPage,
      })
    );
  } catch (error: any) {
    if (error.name === 'AbortError') {
      errorTracker.captureMessage(
        'Repository fetch request aborted',
        'low',
        { action: 'fetch_repositories_abort' }
      );
      return;
    }

    const errorMessage = error.message || 'Failed to fetch repositories';
    errorTracker.captureError(
      error instanceof Error ? error : new Error(errorMessage),
      'high',
      {
        action: 'fetch_repositories_error',
        additionalData: {
          currentPage: yield select(selectCurrentPage),
          selectedUser: (yield select(selectSelectedUser))?.login
        }
      }
    );

    yield put(fetchRepositoriesFailure(errorMessage));
  } finally {
    abortController.abort();
  }
}

export function* repositoriesSaga(): Generator {
  yield takeLatest([setPage.type, 'search/selectUser'], handleFetchRepositories);
} 