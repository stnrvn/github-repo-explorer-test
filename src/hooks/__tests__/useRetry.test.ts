import { renderHook, act } from '@testing-library/react';
import { useRetry } from '../useRetry';

describe('useRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useRetry({ actionName: 'test' }));
    expect(result.current.retryCount).toBe(0);
    expect(result.current.canRetry).toBe(true);
    expect(typeof result.current.handleRetry).toBe('function');
  });

  it('should handle retry failures up to max retries', async () => {
    const { result } = renderHook(() => useRetry({ actionName: 'test', maxRetries: 3 }));
    const error = new Error('Test error');
    const action = jest.fn().mockRejectedValue(error);

    // First attempt
    await act(async () => {
      try {
        await result.current.handleRetry(action);
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    // Second attempt
    await act(async () => {
      try {
        await result.current.handleRetry(action);
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    // Third attempt
    await act(async () => {
      try {
        await result.current.handleRetry(action);
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    expect(result.current.retryCount).toBe(3);
    expect(result.current.canRetry).toBe(false);
  });

  it('should call onMaxRetriesReached when max retries is reached', async () => {
    const onMaxRetriesReached = jest.fn();
    const { result } = renderHook(() => 
      useRetry({ actionName: 'test', maxRetries: 2, onMaxRetriesReached })
    );
    const error = new Error('Test error');
    const action = jest.fn().mockRejectedValue(error);

    // First attempt
    await act(async () => {
      try {
        await result.current.handleRetry(action);
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    // Second attempt
    await act(async () => {
      try {
        await result.current.handleRetry(action);
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    // Third attempt (should trigger onMaxRetriesReached)
    await act(async () => {
      try {
        await result.current.handleRetry(action);
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    expect(onMaxRetriesReached).toHaveBeenCalledTimes(1);
    expect(result.current.canRetry).toBe(false);
  });

  it('should reset retry count on successful action', async () => {
    const { result } = renderHook(() => useRetry({ actionName: 'test' }));
    const action = jest.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.handleRetry(action);
    });

    expect(result.current.retryCount).toBe(0);
    expect(result.current.canRetry).toBe(true);
  });
}); 