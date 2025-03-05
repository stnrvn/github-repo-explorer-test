import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock Redux store
jest.mock('../store', () => ({
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
    dispatch: jest.fn()
  }
}));

// Mock components
jest.mock('../features/search/components/SearchInput', () => ({
  SearchInput: () => <div data-testid="search-input-mock">Search Input</div>
}));

jest.mock('../features/search/components/SearchResults', () => ({
  SearchResults: () => <div data-testid="search-results-mock">Search Results</div>
}));

jest.mock('../features/repositories/components/RepositoryList', () => ({
  RepositoryList: () => <div data-testid="repository-list-mock">Repository List</div>
}));

jest.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary-mock">{children}</div>
}));

// Mock the selectors
const mockSelectSelectedUser = jest.fn();
jest.mock('../features/search/selectors', () => ({
  selectSelectedUser: () => mockSelectSelectedUser()
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the application title', () => {
    mockSelectSelectedUser.mockReturnValue(null);
    render(<App />);
    expect(screen.getByText('GitHub Repositories Explorer')).toBeInTheDocument();
  });

  test('renders SearchInput and SearchResults when no user is selected', () => {
    // Mock the selector to return null (no selected user)
    mockSelectSelectedUser.mockReturnValue(null);
    
    render(<App />);
    
    expect(screen.getByTestId('search-input-mock')).toBeInTheDocument();
    expect(screen.getByTestId('search-results-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('repository-list-mock')).not.toBeInTheDocument();
  });

  test('renders RepositoryList when a user is selected', () => {
    // Mock the selector to return a selected user
    mockSelectSelectedUser.mockReturnValue({ id: 1, login: 'testuser' });
    
    render(<App />);
    
    expect(screen.getByTestId('search-input-mock')).toBeInTheDocument();
    expect(screen.getByTestId('search-results-mock')).toBeInTheDocument();
    expect(screen.getByTestId('repository-list-mock')).toBeInTheDocument();
  });
});