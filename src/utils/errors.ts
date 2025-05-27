import { AxiosError } from 'axios';

/**
 * Base class for all Autotask API errors
 */
export abstract class AutotaskError extends Error {
  public readonly isAutotaskError = true;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly endpoint?: string;
  public readonly method?: string;

  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: Error,
    requestDetails?: {
      endpoint?: string;
      method?: string;
      requestId?: string;
    }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.endpoint = requestDetails?.endpoint;
    this.method = requestDetails?.method;
    this.requestId = requestDetails?.requestId;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      endpoint: this.endpoint,
      method: this.method,
      requestId: this.requestId,
      stack: this.stack,
    };
  }
}

/**
 * Authentication and authorization errors (401, 403)
 */
export class AuthError extends AutotaskError {
  constructor(
    message: string,
    statusCode?: number,
    originalError?: Error,
    requestDetails?: {
      endpoint?: string;
      method?: string;
      requestId?: string;
    }
  ) {
    super(message, statusCode, originalError, requestDetails);
  }
}

/**
 * Validation and bad request errors (400, 422)
 */
export class ValidationError extends AutotaskError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
    statusCode?: number,
    originalError?: Error,
    requestDetails?: {
      endpoint?: string;
      method?: string;
      requestId?: string;
    }
  ) {
    super(message, statusCode, originalError, requestDetails);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      validationErrors: this.validationErrors,
    };
  }
}

/**
 * Rate limiting errors (429)
 */
export class RateLimitError extends AutotaskError {
  constructor(
    message: string,
    public readonly retryAfter?: number,
    statusCode?: number,
    originalError?: Error,
    requestDetails?: {
      endpoint?: string;
      method?: string;
      requestId?: string;
    }
  ) {
    super(message, statusCode, originalError, requestDetails);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Resource not found errors (404)
 */
export class NotFoundError extends AutotaskError {
  constructor(
    message: string,
    public readonly resourceType?: string,
    public readonly resourceId?: string | number,
    statusCode?: number,
    originalError?: Error,
    requestDetails?: {
      endpoint?: string;
      method?: string;
      requestId?: string;
    }
  ) {
    super(message, statusCode, originalError, requestDetails);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resourceType: this.resourceType,
      resourceId: this.resourceId,
    };
  }
}

/**
 * Server errors (500, 502, 503, 504)
 */
export class ServerError extends AutotaskError {
  constructor(
    message: string,
    statusCode?: number,
    originalError?: Error,
    requestDetails?: {
      endpoint?: string;
      method?: string;
      requestId?: string;
    }
  ) {
    super(message, statusCode, originalError, requestDetails);
  }
}

/**
 * Network and timeout errors
 */
export class NetworkError extends AutotaskError {
  constructor(
    message: string,
    public readonly timeout?: boolean,
    originalError?: Error,
    requestDetails?: {
      endpoint?: string;
      method?: string;
      requestId?: string;
    }
  ) {
    super(message, undefined, originalError, requestDetails);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      timeout: this.timeout,
    };
  }
}

/**
 * Configuration and setup errors
 */
export class ConfigurationError extends AutotaskError {
  constructor(
    message: string,
    public readonly configField?: string,
    originalError?: Error
  ) {
    super(message, undefined, originalError);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      configField: this.configField,
    };
  }
}

/**
 * Utility function to classify and create appropriate error from axios error
 */
export function createAutotaskError(
  error: AxiosError,
  requestDetails?: {
    endpoint?: string;
    method?: string;
    requestId?: string;
  }
): AutotaskError {
  const status = error.response?.status;
  const statusText = error.response?.statusText;
  const responseData = error.response?.data as any;
  const message = responseData?.message || responseData?.error || error.message || 'Unknown error occurred';

  // Extract additional error details from response
  const validationErrors = responseData?.errors || responseData?.validationErrors;
  const retryAfter = error.response?.headers['retry-after'] 
    ? parseInt(error.response.headers['retry-after'], 10) 
    : undefined;

  switch (status) {
    case 400:
      return new ValidationError(
        `Bad Request: ${message}`,
        validationErrors,
        status,
        error,
        requestDetails
      );

    case 401:
      return new AuthError(
        `Authentication failed: ${message}`,
        status,
        error,
        requestDetails
      );

    case 403:
      return new AuthError(
        `Access forbidden: ${message}`,
        status,
        error,
        requestDetails
      );

    case 404:
      return new NotFoundError(
        `Resource not found: ${message}`,
        requestDetails?.endpoint?.split('/')[1], // Extract resource type from endpoint
        undefined,
        status,
        error,
        requestDetails
      );

    case 422:
      return new ValidationError(
        `Validation failed: ${message}`,
        validationErrors,
        status,
        error,
        requestDetails
      );

    case 429:
      return new RateLimitError(
        `Rate limit exceeded: ${message}`,
        retryAfter,
        status,
        error,
        requestDetails
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(
        `Server error (${status}): ${message}`,
        status,
        error,
        requestDetails
      );

    default:
      // Handle network errors (no response)
      if (!error.response) {
        const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
        return new NetworkError(
          `Network error: ${error.message}`,
          isTimeout,
          error,
          requestDetails
        );
      }

      // Fallback for unknown status codes - use ServerError for unknown HTTP errors
      return new ServerError(
        `HTTP ${status || 'Unknown'}: ${message}`,
        status,
        error,
        requestDetails
      );
  }
}

/**
 * Utility function to determine if an error is retryable
 */
export function isRetryableError(error: AutotaskError): boolean {
  // Network errors are retryable
  if (error instanceof NetworkError) {
    return true;
  }

  // Server errors are retryable
  if (error instanceof ServerError) {
    return true;
  }

  // Rate limit errors are retryable (with backoff)
  if (error instanceof RateLimitError) {
    return true;
  }

  // Specific status codes that are retryable
  if (error.statusCode) {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.statusCode);
  }

  return false;
}

/**
 * Utility function to get retry delay for rate limit errors
 */
export function getRetryDelay(error: AutotaskError, attempt: number, baseDelay: number = 1000): number {
  // For rate limit errors, use the retry-after header if available
  if (error instanceof RateLimitError && error.retryAfter) {
    return error.retryAfter * 1000; // Convert to milliseconds
  }

  // For server errors, use exponential backoff with jitter
  if (error instanceof ServerError || error instanceof NetworkError) {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }

  // Default exponential backoff
  return Math.min(baseDelay * Math.pow(2, attempt - 1), 30000);
} 