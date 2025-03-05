import { expectSaga } from 'redux-saga-test-plan';
import { throwError } from 'redux-saga-test-plan/providers';
import { call, delay } from 'redux-saga/effects';
import { searchSaga } from '../searchSaga';
import { setSearchQuery, searchUsersSuccess, searchUsersFailure } from '../searchSlice';
import { mockUser } from '@/test/mocks/handlers';
import { rootReducer } from '@/store/rootReducer';
import { searchUsers } from '../api';

jest.mock('../api', () => ({
  searchUsers: jest.fn(),
}));

describe('searchSaga', () => {
  const initialState = rootReducer(undefined, { type: '@@INIT' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful search', async () => {
    const query = 'test';
    const signal = new AbortController().signal;
    const mockResult = [mockUser];
    (searchUsers as jest.Mock).mockResolvedValueOnce(mockResult);

    return expectSaga(searchSaga)
      .withReducer(rootReducer, initialState)
      .provide([
        [delay(300), null],
        [call(searchUsers, query, signal), mockResult]
      ])
      .dispatch(setSearchQuery({ query, signal }))
      .put(searchUsersSuccess(mockResult))
      .run(2000);
  });

  it('should handle search failure', async () => {
    const query = 'test';
    const signal = new AbortController().signal;
    const error = new Error('API Error');
    (searchUsers as jest.Mock).mockRejectedValueOnce(error);

    return expectSaga(searchSaga)
      .withReducer(rootReducer, initialState)
      .provide([
        [delay(300), null],
        [call(searchUsers, query, signal), throwError(error)]
      ])
      .dispatch(setSearchQuery({ query, signal }))
      .put(searchUsersFailure('API Error'))
      .run(2000);
  });

  it('should handle empty query', async () => {
    const query = '';
    const signal = new AbortController().signal;
    (searchUsers as jest.Mock).mockResolvedValueOnce([]);

    return expectSaga(searchSaga)
      .withReducer(rootReducer, initialState)
      .dispatch(setSearchQuery({ query, signal }))
      .put(searchUsersSuccess([]))
      .run(2000);
  });

  it('should debounce search requests', async () => {
    const signal = new AbortController().signal;
    const mockResult = [mockUser];
    (searchUsers as jest.Mock).mockResolvedValueOnce(mockResult);

    return expectSaga(searchSaga)
      .withReducer(rootReducer, initialState)
      .provide([
        [delay(300), null],
        [call(searchUsers, 'final', signal), mockResult]
      ])
      .dispatch(setSearchQuery({ query: 'test1', signal }))
      .dispatch(setSearchQuery({ query: 'test2', signal }))
      .dispatch(setSearchQuery({ query: 'final', signal }))
      .put(searchUsersSuccess(mockResult))
      .run(2000);
  });
}); 