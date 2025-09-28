/**
 * Error Boundary Component
 *
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * This is specifically for render-time crashes, not API errors.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Call the onError prop if provided
    this.props.onError?.(error, errorInfo);

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      // Default fallback UI
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-900'>
          <div className='glass-effect rounded-2xl p-12 text-center max-w-md mx-auto'>
            <div className='w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6'>
              <svg
                className='w-8 h-8 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-white mb-3'>Something went wrong</h2>
            <p className='text-white/70 mb-6'>
              An unexpected error occurred. This usually indicates a bug in the application.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className='text-left bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6'>
                <h3 className='text-sm font-semibold text-red-400 mb-2'>
                  Error Details (Development):
                </h3>
                <pre className='text-xs text-red-300 whitespace-pre-wrap overflow-auto max-h-32'>
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className='flex gap-3 justify-center'>
              <button
                onClick={() => window.location.reload()}
                className='px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors'
              >
                Reload Page
              </button>
              <button
                onClick={this.resetError}
                className='px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-colors'
              >
                Try Again
              </button>
            </div>

            <div className='mt-6 text-xs text-white/50'>
              If this problem persists, please contact support.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of ErrorBoundary for functional components
 * Note: This is a simplified version. For production use, consider using a library like react-error-boundary
 */
export function useErrorHandler() {
  return (_error: Error, _errorInfo?: ErrorInfo) => {
    // In production, send to error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };
}
