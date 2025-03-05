import React from 'react';
import { ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.logError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private logError(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-700">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-red-200 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 p-4 bg-gray-800 rounded text-red-200 text-sm overflow-auto">
              {this.state.error?.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
} 