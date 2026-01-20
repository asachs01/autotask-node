/**
 * Comprehensive error handling system for the Autotask SDK
 *
 * Provides a robust error hierarchy with specific error types,
 * detailed context, and proper error serialization capabilities.
 */
/**
 * Base error class for all Autotask SDK errors
 */
export declare class AutotaskError extends Error {
    readonly timestamp: Date;
    readonly correlationId?: string;
    readonly context?: Record<string, any>;
    readonly code: string;
    readonly retryable: boolean;
    constructor(message: string, code?: string, retryable?: boolean, context?: Record<string, any>);
    /**
     * Serialize error to JSON-safe object
     */
    toJSON(): Record<string, any>;
    /**
     * Sanitize context to remove sensitive information
     */
    private sanitizeContext;
}
/**
 * API-related errors
 */
export declare class ApiError extends AutotaskError {
    readonly statusCode?: number;
    readonly response?: any;
    readonly request?: any;
    constructor(message: string, statusCode?: number, response?: any, request?: any, context?: Record<string, any>);
    toJSON(): Record<string, any>;
    private sanitizeRequest;
}
/**
 * Authentication and authorization errors
 */
export declare class AuthenticationError extends ApiError {
    constructor(message?: string, context?: Record<string, any>);
}
export declare class AuthorizationError extends ApiError {
    constructor(message?: string, context?: Record<string, any>);
}
/**
 * Rate limiting errors
 */
export declare class RateLimitError extends ApiError {
    readonly retryAfter?: number;
    readonly limit?: number;
    readonly remaining?: number;
    readonly reset?: Date;
    constructor(message?: string, retryAfter?: number, limit?: number, remaining?: number, reset?: Date, context?: Record<string, any>);
    toJSON(): Record<string, any>;
}
/**
 * Validation errors
 */
export declare class ValidationError extends ApiError {
    readonly errors: Array<{
        field: string;
        message: string;
        code?: string;
        value?: any;
    }>;
    constructor(message?: string, errors?: Array<{
        field: string;
        message: string;
        code?: string;
        value?: any;
    }>, context?: Record<string, any>);
    toJSON(): Record<string, any>;
}
/**
 * Network-related errors
 */
export declare class NetworkError extends AutotaskError {
    readonly originalError?: Error;
    constructor(message?: string, originalError?: Error, context?: Record<string, any>);
    toJSON(): Record<string, any>;
}
/**
 * Timeout errors
 */
export declare class TimeoutError extends NetworkError {
    readonly timeout: number;
    constructor(timeout: number, operation?: string, context?: Record<string, any>);
    toJSON(): Record<string, any>;
}
/**
 * Configuration errors
 */
export declare class ConfigurationError extends AutotaskError {
    readonly missingFields?: string[];
    readonly invalidFields?: string[];
    constructor(message?: string, missingFields?: string[], invalidFields?: string[], context?: Record<string, any>);
    toJSON(): Record<string, any>;
}
/**
 * Resource not found error
 */
export declare class NotFoundError extends ApiError {
    readonly resourceType?: string;
    readonly resourceId?: string | number;
    constructor(resourceType?: string, resourceId?: string | number, context?: Record<string, any>);
    toJSON(): Record<string, any>;
}
/**
 * Business logic errors
 */
export declare class BusinessLogicError extends AutotaskError {
    readonly rule?: string;
    readonly entityType?: string;
    readonly entityId?: string | number;
    constructor(message: string, rule?: string, entityType?: string, entityId?: string | number, context?: Record<string, any>);
    toJSON(): Record<string, any>;
}
/**
 * Data integrity errors
 */
export declare class DataIntegrityError extends AutotaskError {
    readonly constraint?: string;
    readonly conflictingEntities?: Array<{
        type: string;
        id: string | number;
    }>;
    constructor(message: string, constraint?: string, conflictingEntities?: Array<{
        type: string;
        id: string | number;
    }>, context?: Record<string, any>);
    toJSON(): Record<string, any>;
}
/**
 * Circuit breaker error
 */
export declare class CircuitBreakerError extends AutotaskError {
    readonly service: string;
    readonly state: 'open' | 'half-open';
    readonly failureCount: number;
    readonly lastFailure?: Date;
    readonly nextRetry?: Date;
    constructor(service: string, state: 'open' | 'half-open', failureCount: number, lastFailure?: Date, nextRetry?: Date, context?: Record<string, any>);
    toJSON(): Record<string, any>;
}
/**
 * Batch operation error
 */
export declare class BatchOperationError extends AutotaskError {
    readonly succeeded: number;
    readonly failed: number;
    readonly errors: Array<{
        index: number;
        error: Error;
    }>;
    constructor(message: string, succeeded: number, failed: number, errors: Array<{
        index: number;
        error: Error;
    }>, context?: Record<string, any>);
    toJSON(): Record<string, any>;
}
/**
 * Error factory for creating appropriate error types
 */
export declare class ErrorFactory {
    static fromApiResponse(response: any, request?: any): ApiError;
    static isRetryable(error: Error): boolean;
}
//# sourceMappingURL=AutotaskErrors.d.ts.map