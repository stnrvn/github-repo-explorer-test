import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { UserList } from '../UserList';
import * as searchSlice from '../../searchSlice';
import * as errorTracking from '../../../../utils/errorTracking';
import * as performance from '../../../../utils/performance';
import { GitHubUser } from '../../../../types/github';

// Mock the dependencies
jest.mock('../../searchSlice', () => ({
  selectUser: jest.fn(() => ({ type: 'search/selectUser' })),
}));

jest.mock('../../../../utils/errorTracking', () => ({
  errorTracker: {
    captureError: jest.fn(),
  },
}));

jest.mock('../../../../utils/performance', () => ({
  measurePerformance: jest.fn((fn) => fn()),
}));

jest.mock('../../../../hooks/useRetry', () => ({
  useRetry: () => ({
    canRetry: true,
    remainingAttempts: 2,
    handleRetry: jest.fn((fn) => fn()),
    resetRetryCount: jest.fn(),
  }),
}));

// Mock component to avoid testing ErrorBoundary
jest.mock('../../../../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

describe('UserList', () => {
  const mockUsers: GitHubUser[] = [
    { id: 1, login: 'user1', avatar_url: 'https://example.com/avatar1.jpg', html_url: 'https://github.com/user1' },
    { id: 2, login: 'user2', avatar_url: 'https://example.com/avatar2.jpg', html_url: 'https://github.com/user2' },
  ];

  const createMockStore = (initialState: any) => {
    return configureStore({
      reducer: {
        search: (state = initialState, _action) => state,
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading skeletons when status is loading', () => {
    const mockStore = createMockStore({
      users: [],
      status: 'loading',
      error: null,
      selectedUser: null,
    });

    render(
      <Provider store={mockStore}>
        <UserList />
      </Provider>
    );

    // Should render 3 skeletons
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  test('renders error message when there is an error', () => {
    const errorMessage = 'Failed to fetch users';
    const mockStore = createMockStore({
      users: [],
      status: 'failed',
      error: errorMessage,
      selectedUser: null,
    });

    render(
      <Provider store={mockStore}>
        <UserList />
      </Provider>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('(2 attempts left)')).toBeInTheDocument();
    
    // Verify error tracking was called
    expect(errorTracking.errorTracker.captureError).toHaveBeenCalled();
  });

  test('renders empty state when no users are found', () => {
    const mockStore = createMockStore({
      users: [],
      status: 'succeeded',
      error: null,
      selectedUser: null,
    });

    render(
      <Provider store={mockStore}>
        <UserList />
      </Provider>
    );

    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  test('renders user list when users are available', () => {
    const mockStore = createMockStore({
      users: mockUsers,
      status: 'succeeded',
      error: null,
      selectedUser: null,
    });

    render(
      <Provider store={mockStore}>
        <UserList />
      </Provider>
    );

    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getAllByText('View repositories').length).toBe(2);
  });

  test('highlights selected user', () => {
    const selectedUser = mockUsers[0];
    const mockStore = createMockStore({
      users: mockUsers,
      status: 'succeeded',
      error: null,
      selectedUser,
    });

    render(
      <Provider store={mockStore}>
        <UserList />
      </Provider>
    );

    const userButtons = screen.getAllByRole('button');
    // First user should have the selected class (without hover)
    expect(userButtons[0].className).toContain('bg-gray-800');
    expect(userButtons[0].className).not.toContain('hover:bg-gray-800');
    
    // Second user should have the hover class but not be selected
    expect(userButtons[1].className).toContain('hover:bg-gray-800');
    expect(userButtons[1].className).not.toContain('bg-gray-800 ');
  });

  test('dispatches selectUser action when a user is clicked', () => {
    const mockStore = createMockStore({
      users: mockUsers,
      status: 'succeeded',
      error: null,
      selectedUser: null,
    });

    render(
      <Provider store={mockStore}>
        <UserList />
      </Provider>
    );

    const userButtons = screen.getAllByRole('button');
    fireEvent.click(userButtons[0]);

    expect(performance.measurePerformance).toHaveBeenCalled();
    expect(searchSlice.selectUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('retry button is disabled when max retries reached', () => {
    // Override the useRetry mock for this test only
    jest.spyOn(require('../../../../hooks/useRetry'), 'useRetry').mockReturnValue({
      canRetry: false,
      remainingAttempts: 0,
      handleRetry: jest.fn(),
      resetRetryCount: jest.fn(),
    });

    const errorMessage = 'Failed to fetch users';
    const mockStore = createMockStore({
      users: [],
      status: 'failed',
      error: errorMessage,
      selectedUser: null,
    });

    render(
      <Provider store={mockStore}>
        <UserList />
      </Provider>
    );

    const retryButton = screen.getByText('Max retries reached');
    expect(retryButton).toBeDisabled();
  });
}); 