/**
 * Comprehensive error handling system for the Autotask SDK
 * 
 * Provides a robust error hierarchy with specific error types,
 * detailed context, and proper error serialization capabilities.
 */

/**
 * Base error class for all Autotask SDK errors
 */
export class AutotaskError extends Error {
  public readonly timestamp: Date;
  public readonly correlationId?: string;
  public readonly context?: Record<string, any>;
  public readonly code: string;
  public readonly retryable: boolean;
  
  constructor(
    message: string,
    code: string = 'AUTOTASK_ERROR',
    retryable: boolean = false,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AutotaskError';
    this.code = code;
    this.timestamp = new Date();
    this.retryable = retryable;
    this.context = context;
    
    // Maintain proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    // Set correlation ID if provided in context
    if (context?.correlationId) {
      this.correlationId = context.correlationId;
    }
  }
  
  /**
   * Serialize error to JSON-safe object
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
      retryable: this.retryable,
      context: this.sanitizeContext(this.context),
      stack: this.stack
    };
  }
  
  /**
   * Sanitize context to remove sensitive information
   */
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;
    
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value as Record<string, any>);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

/**
 * API-related errors
 */
export class ApiError extends AutotaskError {
  public readonly statusCode?: number;
  public readonly response?: any;
  public readonly request?: any;
  
  constructor(
    message: string,
    statusCode?: number,
    response?: any,
    request?: any,
    context?: Record<string, any>
  ) {
    const retryable = statusCode ? [408, 429, 500, 502, 503, 504].includes(statusCode) : false;
    super(message, 'API_ERROR', retryable, context);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
    this.request = request;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      response: this.response,
      request: this.sanitizeRequest(this.request)
    };
  }
  
  private sanitizeRequest(request?: any): any {
    if (!request) return undefined;
    
    // Remove sensitive headers
    if (request.headers) {
      const sanitizedHeaders = { ...request.headers };
      const sensitiveHeaders = ['authorization', 'x-api-key', 'x-api-secret'];
      
      for (const header of sensitiveHeaders) {
        if (sanitizedHeaders[header]) {
          sanitizedHeaders[header] = '[REDACTED]';
        }
      }
      
      return {
        ...request,
        headers: sanitizedHeaders
      };
    }
    
    return request;
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, 401, undefined, undefined, context);
    this.name = 'AuthenticationError';
    this.code = 'AUTHENTICATION_ERROR';
    this.retryable = false;
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Authorization failed', context?: Record<string, any>) {
    super(message, 403, undefined, undefined, context);
    this.name = 'AuthorizationError';
    this.code = 'AUTHORIZATION_ERROR';
    this.retryable = false;
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends ApiError {
  public readonly retryAfter?: number;
  public readonly limit?: number;
  public readonly remaining?: number;
  public readonly reset?: Date;
  
  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    limit?: number,
    remaining?: number,
    reset?: Date,
    context?: Record<string, any>
  ) {
    super(message, 429, undefined, undefined, context);
    this.name = 'RateLimitError';
    this.code = 'RATE_LIMIT_ERROR';
    this.retryable = true;
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
    this.reset = reset;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
      limit: this.limit,
      remaining: this.remaining,
      reset: this.reset?.toISOString()
    };
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AutotaskError {
  public readonly errors: Array<{
    field: string;
    message: string;
    code?: string;
    value?: any;
  }>;
  
  constructor(
    message: string = 'Validation failed',
    errors: Array<{ field: string; message: string; code?: string; value?: any }> = [],
    context?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', false, context);
    this.name = 'ValidationError';
    this.errors = errors;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      errors: this.errors.map(error => ({
        ...error,
        value: error.value === undefined ? undefined : '[VALUE]'
      }))
    };
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AutotaskError {
  public readonly originalError?: Error;
  
  constructor(
    message: string = 'Network error occurred',
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, 'NETWORK_ERROR', true, context);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    };
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends NetworkError {
  public readonly timeout: number;
  
  constructor(
    timeout: number,
    operation?: string,
    context?: Record<string, any>
  ) {
    const message = operation 
      ? `Operation '${operation}' timed out after ${timeout}ms`
      : `Request timed out after ${timeout}ms`;
    
    super(message, undefined, context);
    this.name = 'TimeoutError';
    this.code = 'TIMEOUT_ERROR';
    this.timeout = timeout;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      timeout: this.timeout
    };
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends AutotaskError {
  public readonly missingFields?: string[];
  public readonly invalidFields?: string[];
  
  constructor(
    message: string = 'Configuration error',
    missingFields?: string[],
    invalidFields?: string[],
    context?: Record<string, any>
  ) {
    super(message, 'CONFIGURATION_ERROR', false, context);
    this.name = 'ConfigurationError';
    this.missingFields = missingFields;
    this.invalidFields = invalidFields;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      missingFields: this.missingFields,
      invalidFields: this.invalidFields
    };
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends ApiError {
  public readonly resourceType?: string;
  public readonly resourceId?: string | number;
  
  constructor(
    resourceType?: string,
    resourceId?: string | number,
    context?: Record<string, any>
  ) {
    const message = resourceType && resourceId
      ? `${resourceType} with ID ${resourceId} not found`
      : 'Resource not found';
    
    super(message, 404, undefined, undefined, context);
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND_ERROR';
    this.retryable = false;
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      resourceType: this.resourceType,
      resourceId: this.resourceId
    };
  }
}

/**
 * Business logic errors
 */
export class BusinessLogicError extends AutotaskError {
  public readonly rule?: string;
  public readonly entityType?: string;
  public readonly entityId?: string | number;
  
  constructor(
    message: string,
    rule?: string,
    entityType?: string,
    entityId?: string | number,
    context?: Record<string, any>
  ) {
    super(message, 'BUSINESS_LOGIC_ERROR', false, context);
    this.name = 'BusinessLogicError';
    this.rule = rule;
    this.entityType = entityType;
    this.entityId = entityId;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      rule: this.rule,
      entityType: this.entityType,
      entityId: this.entityId
    };
  }
}

/**
 * Data integrity errors
 */
export class DataIntegrityError extends AutotaskError {
  public readonly constraint?: string;
  public readonly conflictingEntities?: Array<{ type: string; id: string | number }>;
  
  constructor(
    message: string,
    constraint?: string,
    conflictingEntities?: Array<{ type: string; id: string | number }>,
    context?: Record<string, any>
  ) {
    super(message, 'DATA_INTEGRITY_ERROR', false, context);
    this.name = 'DataIntegrityError';
    this.constraint = constraint;
    this.conflictingEntities = conflictingEntities;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      constraint: this.constraint,
      conflictingEntities: this.conflictingEntities
    };
  }
}

/**
 * Circuit breaker error
 */
export class CircuitBreakerError extends AutotaskError {
  public readonly service: string;
  public readonly state: 'open' | 'half-open';
  public readonly failureCount: number;
  public readonly lastFailure?: Date;
  public readonly nextRetry?: Date;
  
  constructor(
    service: string,
    state: 'open' | 'half-open',
    failureCount: number,
    lastFailure?: Date,
    nextRetry?: Date,
    context?: Record<string, any>
  ) {
    const message = `Circuit breaker is ${state} for service '${service}'`;
    super(message, 'CIRCUIT_BREAKER_ERROR', false, context);
    this.name = 'CircuitBreakerError';
    this.service = service;
    this.state = state;
    this.failureCount = failureCount;
    this.lastFailure = lastFailure;
    this.nextRetry = nextRetry;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      service: this.service,
      state: this.state,
      failureCount: this.failureCount,
      lastFailure: this.lastFailure?.toISOString(),
      nextRetry: this.nextRetry?.toISOString()
    };
  }
}

/**
 * Batch operation error
 */
export class BatchOperationError extends AutotaskError {
  public readonly succeeded: number;
  public readonly failed: number;
  public readonly errors: Array<{ index: number; error: Error }>;
  
  constructor(
    message: string,
    succeeded: number,
    failed: number,
    errors: Array<{ index: number; error: Error }>,
    context?: Record<string, any>
  ) {
    super(message, 'BATCH_OPERATION_ERROR', false, context);
    this.name = 'BatchOperationError';
    this.succeeded = succeeded;
    this.failed = failed;
    this.errors = errors;
  }
  
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      succeeded: this.succeeded,
      failed: this.failed,
      errors: this.errors.map(({ index, error }) => ({
        index,
        error: error instanceof AutotaskError 
          ? error.toJSON() 
          : {
              name: error.name,
              message: error.message,
              stack: error.stack
            }
      }))
    };
  }
}

/**
 * Error factory for creating appropriate error types
 */
export class ErrorFactory {
  static fromApiResponse(response: any, request?: any): ApiError {
    const statusCode = response?.status || response?.statusCode;
    const message = response?.data?.message || response?.message || 'API request failed';
    
    switch (statusCode) {
      case 400:
        return new ValidationError(message, response?.data?.errors);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError();
      case 429:
        return new RateLimitError(
          message,
          response?.headers?.['retry-after'],
          response?.headers?.['x-ratelimit-limit'],
          response?.headers?.['x-ratelimit-remaining'],
          response?.headers?.['x-ratelimit-reset'] 
            ? new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000)
            : undefined
        );
      default:
        return new ApiError(message, statusCode, response, request);
    }
  }
  
  static isRetryable(error: Error): boolean {
    if (error instanceof AutotaskError) {
      return error.retryable;
    }
    
    // Check for common retryable error patterns
    const message = error.message.toLowerCase();
    return message.includes('timeout') || 
           message.includes('econnreset') ||
           message.includes('econnrefused') ||
           message.includes('socket hang up');
  }
}