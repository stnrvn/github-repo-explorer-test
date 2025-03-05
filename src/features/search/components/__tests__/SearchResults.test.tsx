import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SearchResults } from '../SearchResults';
import searchReducer from '../../searchSlice';
import { mockUser } from '@/test/mocks/handlers';
import { SearchState } from '@/types/github';

const createMockStore = (initialState: Partial<SearchState> = {}) => {
  const defaultState: SearchState = {
    query: '',
    users: [],
    selectedUser: null,
    status: 'idle',
    error: null,
  };

  return configureStore({
    reducer: {
      search: searchReducer,
    },
    preloadedState: {
      search: {
        ...defaultState,
        ...initialState,
      },
    },
  });
};

const renderWithProvider = (ui: React.ReactElement, initialState: Partial<SearchState> = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
};

describe('SearchResults', () => {
  it('renders loading skeletons when status is loading', () => {
    renderWithProvider(<SearchResults />, {
      status: 'loading',
    });
    
    // Should find 3 skeleton elements
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('renders nothing when users array is empty', () => {
    const { container } = renderWithProvider(<SearchResults />, {
      users: [],
      status: 'succeeded',
    });
    
    // The component should return null, so the container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('renders user list correctly', () => {
    renderWithProvider(<SearchResults />, {
      users: [mockUser],
      status: 'succeeded',
    });
    
    // Check if user login is displayed
    expect(screen.getByText(mockUser.login)).toBeInTheDocument();
    
    // Check if "View repositories" text is present
    expect(screen.getByText('View repositories')).toBeInTheDocument();
    
    // Check if avatar is present
    const avatar = screen.getByAltText(`${mockUser.login}'s avatar`);
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', mockUser.avatar_url);
  });

  it('handles user selection correctly', () => {
    const { store } = renderWithProvider(<SearchResults />, {
      users: [mockUser],
      status: 'succeeded',
    });
    
    // Click on the user
    const userButton = screen.getByText(mockUser.login).closest('button');
    if (userButton) {
      fireEvent.click(userButton);
    }
    
    // Check if the selected user is updated in the store
    expect(store.getState().search.selectedUser).toEqual(mockUser);
  });

  it('highlights selected user', () => {
    renderWithProvider(<SearchResults />, {
      users: [mockUser],
      selectedUser: mockUser,
      status: 'succeeded',
    });
    
    // The user button should have specific background when selected
    const userButton = screen.getByText(mockUser.login).closest('button');
    expect(userButton).toHaveClass('bg-gray-800');
  });
}); 