type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorContext {
  componentStack?: string;
  userId?: string;
  action?: string;
  additionalData?: Record<string, unknown>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  timestamp: number;
  context: ErrorContext;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private readonly maxRetries = 3;
  private readonly errorQueue: ErrorReport[] = [];
  private isProcessing = false;

  private constructor() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  public captureError(error: Error, severity: ErrorSeverity = 'medium', context: ErrorContext = {}): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      severity,
      timestamp: Date.now(),
      context
    };

    this.errorQueue.push(errorReport);
    this.processErrorQueue();
  }

  public captureMessage(message: string, severity: ErrorSeverity = 'low', context: ErrorContext = {}): void {
    const errorReport: ErrorReport = {
      message,
      severity,
      timestamp: Date.now(),
      context
    };

    this.errorQueue.push(errorReport);
    this.processErrorQueue();
  }

  private async processErrorQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) return;

    this.isProcessing = true;
    let retries = 0;

    while (this.errorQueue.length > 0 && retries < this.maxRetries) {
      try {
        const error = this.errorQueue[0];
        await this.sendErrorToServer(error);
        this.errorQueue.shift();
        retries = 0;
      } catch (e) {
        retries++;
        if (retries === this.maxRetries) {
          console.error('Failed to send error reports after maximum retries');
          this.errorQueue.shift(); // Remove failed error report
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    this.isProcessing = false;
  }

  private async sendErrorToServer(error: ErrorReport): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Report');
      console.log('Severity:', error.severity);
      console.log('Message:', error.message);
      console.log('Stack:', error.stack);
      console.log('Context:', error.context);
      console.log('Timestamp:', new Date(error.timestamp).toISOString());
      console.groupEnd();
    }
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    this.captureError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      'high',
      { action: 'unhandled_rejection' }
    );
  };
}

export const errorTracker = ErrorTracker.getInstance();

// Error boundary helper
export const logErrorToService = (error: Error, componentStack: string): void => {
  errorTracker.captureError(error, 'high', { componentStack });
}; 