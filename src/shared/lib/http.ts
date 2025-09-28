/**
 * HTTP Utility with Error Handling
 * 
 * This file provides a centralized HTTP client that returns Result types
 * instead of throwing exceptions for network errors.
 */

import { err, ok, Result } from './result';
import { createAppError, type AppError } from './errors';

export interface HttpOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * HTTP client that returns Result types
 */
export async function http<T>(
  input: RequestInfo,
  init?: HttpOptions
): Promise<Result<T>> {
  const controller = new AbortController();
  const timeoutMs = init?.timeoutMs ?? 15_000;
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, {
      ...init,
      signal: controller.signal
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let body: unknown;
    try {
      body = isJson
        ? await res.json().catch(() => undefined)
        : await res.text();
    } catch {
      // If we can't parse the body, continue with undefined
      body = undefined;
    }

    if (!res.ok) {
      const error = mapHttpError(res.status, body);
      return err(error);
    }

    return ok((body as T) ?? (undefined as unknown as T));
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') {
      const error = createAppError('Timeout', 'Request timed out', {
        cause,
        details: { timeoutMs }
      });
      return err(error);
    }

    const error = createAppError('Network', 'Network error occurred', { cause });
    return err(error);
  } finally {
    clearTimeout(id);
  }
}

/**
 * Map HTTP status codes to AppError
 */
function mapHttpError(status: number, body: unknown): AppError {
  const message = extractErrorMessage(body) || getDefaultMessage(status);

  if (status === 401) {
    return createAppError('Unauthorized', message, { status, details: body });
  }

  if (status === 403) {
    return createAppError('Forbidden', 'You do not have access to this resource', { status, details: body });
  }

  if (status === 404) {
    return createAppError('NotFound', 'The requested resource was not found', { status, details: body });
  }

  if (status === 429) {
    return createAppError('RateLimited', 'Too many requests. Please try again later', { status, details: body });
  }

  if (status >= 500) {
    return createAppError('Server', 'Server error occurred. Please try again later', { status, details: body });
  }

  if (status >= 400) {
    return createAppError('Validation', message, { status, details: body });
  }

  return createAppError('Unknown', 'Request failed', { status, details: body });
}

/**
 * Extract error message from response body
 */
function extractErrorMessage(body: unknown): string | null {
  if (typeof body === 'string') {
    return body;
  }

  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;

    // Common error message fields
    const messageFields = ['message', 'error', 'detail', 'description'];
    for (const field of messageFields) {
      if (typeof obj[field] === 'string') {
        return obj[field] as string;
      }
    }

    // Check for nested error object
    if (obj.error && typeof obj.error === 'object') {
      const errorObj = obj.error as Record<string, unknown>;
      for (const field of messageFields) {
        if (typeof errorObj[field] === 'string') {
          return errorObj[field] as string;
        }
      }
    }
  }

  return null;
}

/**
 * Get default error message for status code
 */
function getDefaultMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Bad request',
    401: 'Please sign in to continue',
    403: 'You do not have access to this resource',
    404: 'The requested resource was not found',
    409: 'Conflict occurred',
    422: 'Validation failed',
    429: 'Too many requests. Please try again later',
    500: 'Internal server error',
    502: 'Bad gateway',
    503: 'Service unavailable',
    504: 'Gateway timeout',
  };

  return messages[status] || 'Request failed';
}

/**
 * Convenience methods for common HTTP methods
 */
export const httpClient = {
  get: <T>(url: string, options?: HttpOptions) =>
    http<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, data?: unknown, options?: HttpOptions) =>
    http<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(url: string, data?: unknown, options?: HttpOptions) =>
    http<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(url: string, options?: HttpOptions) =>
    http<T>(url, { ...options, method: 'DELETE' }),
};
