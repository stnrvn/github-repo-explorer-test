import {
  debounce,
  throttle,
  measurePerformance,
  memoizeWithTTL,
  abortablePromise,
} from '../performance';

describe('performance utilities', () => {
  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle function calls', () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc();
      throttledFunc();
      throttledFunc();

      expect(func).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFunc();

      expect(func).toHaveBeenCalledTimes(2);
    });
  });

  describe('measurePerformance', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      jest.useRealTimers();
      process.env.NODE_ENV = 'test';
    });

    it('should measure successful operation', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const operation = jest.fn().mockResolvedValue('result');

      const result = await measurePerformance(operation, 'test');

      expect(result).toBe('result');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/test took \d+\.\d+ms/));

      consoleSpy.mockRestore();
    });

    it('should measure failed operation', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('test error');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(measurePerformance(operation, 'test')).rejects.toThrow(error);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/test failed after \d+\.\d+ms/),
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe('memoizeWithTTL', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should cache results for specified duration', () => {
      const func = jest.fn().mockReturnValue('result');
      const memoizedFunc = memoizeWithTTL(func, 1000);

      expect(memoizedFunc('test')).toBe('result');
      expect(memoizedFunc('test')).toBe('result');
      expect(func).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);

      expect(memoizedFunc('test')).toBe('result');
      expect(func).toHaveBeenCalledTimes(2);
    });
  });

  describe('abortablePromise', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve if promise completes before timeout', async () => {
      const promise = Promise.resolve('result');
      const result = await abortablePromise(promise, 1000);
      expect(result).toBe('result');
    });

    it('should reject if timeout occurs', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 2000));
      const abortPromise = abortablePromise(promise, 1000);

      jest.advanceTimersByTime(1000);

      await expect(abortPromise).rejects.toThrow('Operation timed out after 1000ms');
    });

    it('should clear timeout on resolution', async () => {
      const promise = Promise.resolve('result');
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      await abortablePromise(promise, 1000);

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
}); 