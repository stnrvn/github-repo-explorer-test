export const debounce = <T extends (...args: readonly unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

export const throttle = <T extends (...args: readonly unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export const measurePerformance = async <T>(
  operation: () => Promise<T> | T,
  operationName: string
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await operation();
    const end = performance.now();
    const duration = end - start;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${operationName} took ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`${operationName} failed after ${duration.toFixed(2)}ms`, error);
    }
    
    throw error;
  }
};

export const memoizeWithTTL = <T extends (...args: readonly unknown[]) => unknown>(
  func: T,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): ((...args: Parameters<T>) => ReturnType<T>) => {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  return (...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      return cached.value;
    }

    const result = func(...args) as ReturnType<T>;
    cache.set(key, { value: result, timestamp: now });
    return result;
  };
};

export const abortablePromise = <T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
}; 