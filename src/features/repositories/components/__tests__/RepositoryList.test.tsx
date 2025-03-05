import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RepositoryList } from '../RepositoryList';
import repositoriesReducer from '../../repositoriesSlice';
import searchReducer from '@/features/search/searchSlice';
import { mockRepo, mockUser } from '@/test/mocks/handlers';
import { RepositoriesState } from '@/store/types';
import { SearchState } from '@/types/github';

// Create mock store for testing
const createMockStore = (
  repositoriesState: Partial<RepositoriesState> = {},
  searchState: Partial<SearchState> = {}
) => {
  const defaultRepositoriesState: RepositoriesState = {
    items: [],
    status: 'idle',
    error: null,
    currentPage: 1,
    perPage: 10,
    total: 0,
  };

  const defaultSearchState: SearchState = {
    query: '',
    users: [],
    selectedUser: null,
    status: 'idle',
    error: null,
  };

  return configureStore({
    reducer: {
      repositories: repositoriesReducer,
      search: searchReducer,
    },
    preloadedState: {
      repositories: {
        ...defaultRepositoriesState,
        ...repositoriesState,
      },
      search: {
        ...defaultSearchState,
        ...searchState,
      },
    },
  });
};

const renderWithProvider = (
  ui: React.ReactElement,
  repositoriesState: Partial<RepositoriesState> = {},
  searchState: Partial<SearchState> = {}
) => {
  const store = createMockStore(repositoriesState, searchState);
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
};

describe('RepositoryList', () => {
  it('displays message when no user is selected', () => {
    renderWithProvider(<RepositoryList />);
    
    expect(screen.getByText('Select a user to view their repositories')).toBeInTheDocument();
  });

  it('displays loading skeletons when status is loading', () => {
    renderWithProvider(
      <RepositoryList />,
      { status: 'loading' },
      { selectedUser: mockUser }
    );
    
    // Should find at least 3 skeleton elements
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('displays error message when there is an error', () => {
    const errorMessage = 'Failed to fetch repositories';
    renderWithProvider(
      <RepositoryList />,
      { status: 'failed', error: errorMessage },
      { selectedUser: mockUser }
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('displays empty message when there are no repositories', () => {
    renderWithProvider(
      <RepositoryList />,
      { status: 'succeeded', items: [] },
      { selectedUser: mockUser }
    );
    
    expect(screen.getByText('No repositories found for this user')).toBeInTheDocument();
  });

  it('renders repositories correctly', () => {
    renderWithProvider(
      <RepositoryList />,
      { 
        status: 'succeeded', 
        items: [mockRepo],
        currentPage: 1,
        total: 1
      },
      { selectedUser: mockUser }
    );
    
    // Check if repository name is displayed
    expect(screen.getByText(mockRepo.name)).toBeInTheDocument();
    
    // Load more button should not be visible when there are no more pages
    expect(screen.queryByText('Load more')).not.toBeInTheDocument();
  });

  it('shows load more button when there are more pages', () => {
    renderWithProvider(
      <RepositoryList />,
      { 
        status: 'succeeded', 
        items: [mockRepo],
        currentPage: 1,
        total: 20,
        perPage: 10
      },
      { selectedUser: mockUser }
    );
    
    // Load more button should be visible
    expect(screen.getByText('Load more')).toBeInTheDocument();
  });
}); 