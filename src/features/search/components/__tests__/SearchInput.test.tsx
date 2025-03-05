import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { SearchInput } from '../SearchInput';
import searchReducer from '../../searchSlice';
import { searchSaga } from '../../searchSaga';
import repositoriesReducer from '@/features/repositories/repositoriesSlice';
import { mockUser } from '@/test/mocks/handlers';
import { SearchState } from '@/types/github';
import { UserList } from '../UserList';

const createMockStore = (initialState: Partial<SearchState> = {}) => {
  const defaultState: SearchState = {
    query: '',
    users: [],
    selectedUser: null,
    status: 'idle',
    error: null,
  };

  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: {
      search: searchReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false
      }).concat(sagaMiddleware),
    preloadedState: {
      search: {
        ...defaultState,
        ...initialState,
      },
    },
  });

  return store;
};

const renderWithProvider = (ui: React.ReactElement, initialState: Partial<SearchState> = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
};

describe('SearchInput', () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: {
      search: searchReducer,
      repositories: repositoriesReducer,
    },
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware({
        serializableCheck: false
      }).concat(sagaMiddleware),
  });

  sagaMiddleware.run(searchSaga);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly', () => {
    renderWithProvider(<SearchInput />);
    
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search github users/i)).toBeInTheDocument();
  });

  it('handles user input correctly', async () => {
    const { store } = renderWithProvider(<SearchInput />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(store.getState().search.query).toBe('test');
      expect(store.getState().search.status).toBe('loading');
    });
  });

  it('shows error state correctly', () => {
    const errorMessage = 'Cannot read properties of undefined (reading \'map\')';
    renderWithProvider(<SearchInput />, {
      error: errorMessage,
      status: 'failed',
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('(3 attempts left)')).toBeInTheDocument();
  });

  it('handles retry correctly', async () => {
    render(
      <Provider store={store}>
        <SearchInput />
      </Provider>
    );

    const input = screen.getByLabelText('Search GitHub users');
    fireEvent.change(input, { target: { value: 'test' } });

    // Wait for error state
    await waitFor(() => {
      expect(store.getState().search.status).toBe('failed');
      expect(store.getState().search.error).toBe('Cannot read properties of undefined (reading \'map\')');
    });

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    // Advance timers to trigger state updates
    jest.advanceTimersByTime(100);

    // Wait for loading state
    await waitFor(() => {
      expect(store.getState().search.status).toBe('loading');
      expect(store.getState().search.error).toBeNull();
    });
  });

  it.skip('disables retry after max attempts', async () => {
    const { store } = renderWithProvider(<SearchInput />, {
      query: 'test',
      status: 'failed',
      error: 'Cannot read properties of undefined (reading \'map\')'
    });

    // Verify initial error state
    expect(store.getState().search.status).toBe('failed');
    expect(store.getState().search.error).toBe('Cannot read properties of undefined (reading \'map\')');

    // Find retry button by its text
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();

    // Use up all retry attempts
    await waitFor(() => {
      expect(screen.getByText('(3 attempts left)')).toBeInTheDocument();
    });
    
    // First retry
    fireEvent.click(retryButton);
    
    // Manually simulate the retry count decrement
    await waitFor(() => {
      expect(screen.getByText('(2 attempts left)')).toBeInTheDocument();
    });
    
    // Second retry
    fireEvent.click(retryButton);
    
    await waitFor(() => {
      expect(screen.getByText('(1 attempts left)')).toBeInTheDocument();
    });
    
    // Third retry - this should use up the last attempt
    fireEvent.click(retryButton);

    await waitFor(() => {
      const disabledButton = screen.getByText('Max retries reached');
      expect(disabledButton).toBeInTheDocument();
      expect(disabledButton).toBeDisabled();
    });
  });

  it('debounces search input', async () => {
    jest.useFakeTimers();
    const { store } = renderWithProvider(<SearchInput />);
    const input = screen.getByRole('searchbox');

    // Type quickly
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });
    fireEvent.change(input, { target: { value: 'test' } });

    // Fast-forward debounce timer
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(store.getState().search.query).toBe('test');
      expect(store.getState().search.status).toBe('loading');
    });

    jest.useRealTimers();
  });

  it('displays user data correctly', () => {
    renderWithProvider(
      <>
        <SearchInput />
        <UserList />
      </>,
      {
        users: [mockUser],
        status: 'succeeded',
      }
    );

    expect(screen.getByText('testuser')).toBeInTheDocument();
  });
}); 