import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Add TextEncoder polyfill
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Add Response polyfill for MSW
const { Response, Headers, Request } = require('whatwg-fetch');
global.Response = Response;
global.Headers = Headers;
global.Request = Request;

// Mock GitHub API
jest.mock('../api/github', () => ({
  __esModule: true,
  GitHubApiError: class GitHubApiError extends Error {
    constructor(message: string, public status?: number, public code?: string) {
      super(message);
      this.name = 'GitHubApiError';
    }
  },
  githubApi: {
    searchUsers: jest.fn(),
    getUserRepositories: jest.fn()
  }
}));

// Add BroadcastChannel polyfill
class BroadcastChannel {
  private listeners: Set<(event: { data: unknown }) => void>;

  constructor(_channel: string) {
    this.listeners = new Set();
  }

  postMessage(message: unknown): void {
    this.listeners.forEach(listener => listener({ data: message }));
  }

  addEventListener(type: string, listener: (event: { data: unknown }) => void): void {
    if (type === 'message') {
      this.listeners.add(listener);
    }
  }

  removeEventListener(type: string, listener: (event: { data: unknown }) => void): void {
    if (type === 'message') {
      this.listeners.delete(listener);
    }
  }

  close(): void {
    this.listeners.clear();
  }
}

// @ts-ignore - Polyfill untuk test environment
global.BroadcastChannel = BroadcastChannel as unknown;

// Add PromiseRejectionEvent polyfill
class PromiseRejectionEvent extends Event {
  promise: Promise<unknown>;
  reason: unknown;

  constructor(type: string, options: { promise: Promise<unknown>; reason: unknown }) {
    super(type);
    this.promise = options.promise;
    this.reason = options.reason;
  }
}

// @ts-ignore - Polyfill untuk test environment
global.PromiseRejectionEvent = PromiseRejectionEvent as unknown;

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close()); 