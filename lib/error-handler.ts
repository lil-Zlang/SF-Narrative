/**
 * Centralized error handling utilities
 */

/**
 * Error messages for consistent error responses
 */
const ERROR_MESSAGES = {
  API_REQUEST_FAILED: 'Failed to complete API request',
} as const;

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Error codes for consistent error handling
 */
export const ERROR_CODES = {
  // API Errors
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  API_RATE_LIMITED: 'API_RATE_LIMITED',
  API_INVALID_RESPONSE: 'API_INVALID_RESPONSE',
  
  // Validation Errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Database Errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  
  // Authentication Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // General Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  code: string = ERROR_CODES.INTERNAL_ERROR,
  statusCode: number = 500,
  details?: any
): AppError {
  return new AppError(message, code, statusCode, details);
}

/**
 * Handle API errors with proper logging and response formatting
 */
export function handleApiError(error: unknown, context: string = 'API'): AppError {
  console.error(`[${context}] Error occurred:`, error);

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('fetch')) {
      return createErrorResponse(
        ERROR_MESSAGES.API_REQUEST_FAILED,
        ERROR_CODES.NETWORK_ERROR,
        503,
        { originalError: error.message }
      );
    }

    if (error.message.includes('timeout')) {
      return createErrorResponse(
        'Request timeout',
        ERROR_CODES.TIMEOUT_ERROR,
        408,
        { originalError: error.message }
      );
    }

    if (error.message.includes('rate limit')) {
      return createErrorResponse(
        'Rate limit exceeded',
        ERROR_CODES.API_RATE_LIMITED,
        429,
        { originalError: error.message }
      );
    }

    return createErrorResponse(
      error.message,
      ERROR_CODES.INTERNAL_ERROR,
      500,
      { originalError: error.message }
    );
  }

  return createErrorResponse(
    'An unexpected error occurred',
    ERROR_CODES.INTERNAL_ERROR,
    500,
    { originalError: String(error) }
  );
}

/**
 * Handle validation errors
 */
export function handleValidationError(
  field: string,
  value: any,
  rule: string
): AppError {
  const message = `Validation failed for field '${field}': ${rule}`;
  return createErrorResponse(
    message,
    ERROR_CODES.VALIDATION_FAILED,
    400,
    { field, value, rule }
  );
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: unknown, operation: string): AppError {
  console.error(`[DATABASE] Error during ${operation}:`, error);

  if (error instanceof Error) {
    if (error.message.includes('unique constraint')) {
      return createErrorResponse(
        'Record already exists',
        ERROR_CODES.DUPLICATE_RECORD,
        409,
        { operation, originalError: error.message }
      );
    }

    if (error.message.includes('not found')) {
      return createErrorResponse(
        'Record not found',
        ERROR_CODES.RECORD_NOT_FOUND,
        404,
        { operation, originalError: error.message }
      );
    }

    return createErrorResponse(
      `Database error during ${operation}`,
      ERROR_CODES.DATABASE_ERROR,
      500,
      { operation, originalError: error.message }
    );
  }

  return createErrorResponse(
    `Database error during ${operation}`,
    ERROR_CODES.DATABASE_ERROR,
    500,
    { operation }
  );
}

/**
 * Handle external API errors
 */
export function handleExternalApiError(
  error: unknown,
  apiName: string,
  statusCode?: number
): AppError {
  console.error(`[${apiName}] External API error:`, error);

  if (error instanceof Error) {
    if (statusCode === 401) {
      return createErrorResponse(
        `${apiName} API key is invalid or missing`,
        ERROR_CODES.API_KEY_MISSING,
        401,
        { apiName, originalError: error.message }
      );
    }

    if (statusCode === 429) {
      return createErrorResponse(
        `${apiName} API rate limit exceeded`,
        ERROR_CODES.API_RATE_LIMITED,
        429,
        { apiName, originalError: error.message }
      );
    }

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return createErrorResponse(
        `${apiName} API client error`,
        ERROR_CODES.API_REQUEST_FAILED,
        statusCode,
        { apiName, originalError: error.message }
      );
    }

    if (statusCode && statusCode >= 500) {
      return createErrorResponse(
        `${apiName} API server error`,
        ERROR_CODES.API_REQUEST_FAILED,
        502,
        { apiName, originalError: error.message }
      );
    }

    return createErrorResponse(
      `${apiName} API request failed`,
      ERROR_CODES.API_REQUEST_FAILED,
      502,
      { apiName, originalError: error.message }
    );
  }

  return createErrorResponse(
    `${apiName} API request failed`,
    ERROR_CODES.API_REQUEST_FAILED,
    502,
    { apiName }
  );
}

/**
 * Log error with context
 */
export function logError(error: AppError, context: string = 'APPLICATION'): void {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    details: error.details,
    stack: error.stack,
  };

  if (error.statusCode >= 500) {
    console.error(`[${context}] Server Error:`, logData);
  } else {
    console.warn(`[${context}] Client Error:`, logData);
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  const retryableCodes = [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.TIMEOUT_ERROR,
    ERROR_CODES.API_RATE_LIMITED,
  ];

  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];

  return (
    retryableCodes.includes(error.code as any) ||
    retryableStatusCodes.includes(error.statusCode)
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  const userFriendlyMessages: Record<string, string> = {
    [ERROR_CODES.API_KEY_MISSING]: 'Service configuration error. Please try again later.',
    [ERROR_CODES.API_RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
    [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
    [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
    [ERROR_CODES.VALIDATION_FAILED]: 'Please check your input and try again.',
    [ERROR_CODES.RECORD_NOT_FOUND]: 'The requested item was not found.',
    [ERROR_CODES.DUPLICATE_RECORD]: 'This item already exists.',
    [ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action.',
    [ERROR_CODES.FORBIDDEN]: 'Access denied.',
  };

  return userFriendlyMessages[error.code] || 'An unexpected error occurred. Please try again.';
}
