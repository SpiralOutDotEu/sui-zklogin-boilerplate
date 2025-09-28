/**
 * Unified Error Model for the Application
 * 
 * This file defines the error types and utilities used throughout the application
 * to handle errors in a consistent, type-safe manner.
 */

export type AppErrorKind =
  | 'Network'
  | 'Timeout'
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'RateLimited'
  | 'Validation'
  | 'Server'
  | 'Unknown'
  | 'ZkLogin'
  | 'OAuth'
  | 'SaltService'
  | 'JWT';

export type AppError = {
  kind: AppErrorKind;
  message: string;          // user-safe message
  status?: number;          // http status
  cause?: unknown;          // raw error for logging
  details?: unknown;        // field errors, etc.
};

/**
 * Create an AppError with consistent structure
 */
export function createAppError(
  kind: AppErrorKind,
  message: string,
  options?: {
    status?: number;
    cause?: unknown;
    details?: unknown;
  }
): AppError {
  return {
    kind,
    message,
    status: options?.status,
    cause: options?.cause,
    details: options?.details,
  };
}

/**
 * Check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'kind' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).kind === 'string' &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown, fallbackMessage = 'An unexpected error occurred'): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return createAppError('Unknown', error.message, { cause: error });
  }

  if (typeof error === 'string') {
    return createAppError('Unknown', error);
  }

  return createAppError('Unknown', fallbackMessage, { cause: error });
}
