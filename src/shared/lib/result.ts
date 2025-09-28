/**
 * Result Type for Error Handling
 * 
 * This file provides a Result type for handling success/failure cases
 * without throwing exceptions for expected errors.
 */

import type { AppError } from './errors';

export type Ok<T> = { 
  ok: true; 
  data: T;
};

export type Err<E = AppError> = { 
  ok: false; 
  error: E;
};

export type Result<T, E = AppError> = Ok<T> | Err<E>;

/**
 * Create a success result
 */
export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

/**
 * Create an error result
 */
export function err<E extends AppError>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Check if a result is successful
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true;
}

/**
 * Check if a result is an error
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false;
}

/**
 * Map over a successful result
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (isOk(result)) {
    return ok(fn(result.data));
  }
  return result;
}

/**
 * Map over an error result
 */
export function mapErr<T, E extends AppError, F extends AppError>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (isErr(result)) {
    return err(fn(result.error));
  }
  return result;
}

/**
 * Chain operations on results
 */
export function chain<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (isOk(result)) {
    return fn(result.data);
  }
  return result;
}

/**
 * Unwrap a result, throwing if it's an error
 * Use only when you're certain the result is successful
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isOk(result)) {
    return result.data;
  }
  throw new Error(`Attempted to unwrap error result: ${JSON.stringify(result.error)}`);
}

/**
 * Unwrap a result with a default value for errors
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isOk(result)) {
    return result.data;
  }
  return defaultValue;
}

/**
 * Unwrap a result with a function for errors
 */
export function unwrapOrElse<T, E>(result: Result<T, E>, fn: (error: E) => T): T {
  if (isOk(result)) {
    return result.data;
  }
  return fn(result.error);
}
