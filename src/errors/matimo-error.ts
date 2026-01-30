/**
 * Error codes and custom error class for Matimo
 */

export enum ErrorCode {
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  EXECUTION_FAILED = 'EXECUTION_FAILED',
  AUTH_FAILED = 'AUTH_FAILED',
  TOOL_NOT_FOUND = 'TOOL_NOT_FOUND',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for Matimo
 */
export class MatimoError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MatimoError';
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Create a validation error with context
 */
export function createValidationError(
  message: string,
  details?: Record<string, unknown>
): MatimoError {
  return new MatimoError(message, ErrorCode.VALIDATION_FAILED, details);
}

/**
 * Create an execution error with context
 */
export function createExecutionError(
  message: string,
  details?: Record<string, unknown>
): MatimoError {
  return new MatimoError(message, ErrorCode.EXECUTION_FAILED, details);
}
