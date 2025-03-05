import { errorTracker } from '../errorTracking';

describe('errorTracker', () => {
  let consoleGroupSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
    consoleGroupSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });

  it('should capture error with context', () => {
    const error = new Error('Test error');
    const context = { userId: '123' };

    errorTracker.captureError(error, 'high', context);

    expect(consoleGroupSpy).toHaveBeenCalledWith('Error Report');
    expect(consoleLogSpy).toHaveBeenCalledWith('Severity:', 'high');
    expect(consoleLogSpy).toHaveBeenCalledWith('Message:', error.message);
    expect(consoleLogSpy).toHaveBeenCalledWith('Stack:', error.stack);
    expect(consoleLogSpy).toHaveBeenCalledWith('Context:', context);
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });

  it('should capture message with context', () => {
    const message = 'Test message';
    const context = { userId: '123' };

    errorTracker.captureMessage(message, 'low', context);

    expect(consoleGroupSpy).toHaveBeenCalledWith('Error Report');
    expect(consoleLogSpy).toHaveBeenCalledWith('Severity:', 'low');
    expect(consoleLogSpy).toHaveBeenCalledWith('Message:', message);
    expect(consoleLogSpy).toHaveBeenCalledWith('Context:', context);
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });

  it('should handle unhandled rejections', () => {
    const error = new Error('Unhandled rejection');
    const event = {
      reason: error,
      promise: Promise.reject(error).catch(() => {}), // Prevent unhandled rejection warning
      preventDefault: jest.fn()
    };

    errorTracker['handleUnhandledRejection'](event as any);

    expect(consoleGroupSpy).toHaveBeenCalledWith('Error Report');
    expect(consoleLogSpy).toHaveBeenCalledWith('Severity:', 'high');
    expect(consoleLogSpy).toHaveBeenCalledWith('Message:', error.message);
    expect(consoleLogSpy).toHaveBeenCalledWith('Stack:', error.stack);
    expect(consoleLogSpy).toHaveBeenCalledWith('Context:', { action: 'unhandled_rejection' });
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });

  it('should process error queue', async () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');

    errorTracker.captureError(error1, 'high');
    errorTracker.captureError(error2, 'high');

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(consoleGroupSpy).toHaveBeenCalledWith('Error Report');
    expect(consoleLogSpy).toHaveBeenCalledWith('Message:', error1.message);
    expect(consoleLogSpy).toHaveBeenCalledWith('Message:', error2.message);
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });

  it('should retry sending errors', async () => {
    const error = new Error('Test error');
    const sendErrorToServerSpy = jest.spyOn(errorTracker as any, 'sendErrorToServer')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined);

    errorTracker.captureError(error, 'high');

    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(sendErrorToServerSpy).toHaveBeenCalledTimes(2);
    sendErrorToServerSpy.mockRestore();
  });
}); 