import searchReducer, {
  setSearchQuery,
  searchUsersSuccess,
  searchUsersFailure,
  selectUser,
  clearSearch,
} from '../searchSlice';
import { mockUser } from '@/test/mocks/handlers';
import { SearchState } from '@/types/github';

describe('search reducer', () => {
  const initialState: SearchState = {
    query: '',
    status: 'idle',
    error: null,
    users: [],
    selectedUser: null,
  };

  const loadingState: SearchState = {
    ...initialState,
    query: 'test',
    status: 'loading',
  };

  const populatedState: SearchState = {
    ...initialState,
    query: 'test',
    users: [mockUser],
    selectedUser: mockUser,
    status: 'succeeded',
  };

  it('should handle initial state', () => {
    expect(searchReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setSearchQuery', () => {
    const query = 'test';
    const actual = searchReducer(initialState, setSearchQuery({ query }));

    expect(actual.query).toEqual(query);
    expect(actual.status).toEqual('loading');
  });

  it('should handle searchUsersSuccess', () => {
    const users = [mockUser];
    const actual = searchReducer(loadingState, searchUsersSuccess(users));

    expect(actual.users).toEqual(users);
    expect(actual.status).toEqual('succeeded');
  });

  it('should handle searchUsersFailure', () => {
    const error = 'Failed to fetch users';
    const actual = searchReducer(loadingState, searchUsersFailure(error));

    expect(actual.error).toEqual(error);
    expect(actual.status).toEqual('failed');
  });

  it('should handle selectUser', () => {
    const actual = searchReducer(initialState, selectUser(mockUser));

    expect(actual.selectedUser).toEqual(mockUser);
  });

  it('should handle clearSearch', () => {
    const actual = searchReducer(populatedState, clearSearch());

    expect(actual).toEqual(initialState);
  });
}); 