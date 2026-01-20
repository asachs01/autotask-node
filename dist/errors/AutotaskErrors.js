"use strict";
/**
 * Comprehensive error handling system for the Autotask SDK
 *
 * Provides a robust error hierarchy with specific error types,
 * detailed context, and proper error serialization capabilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorFactory = exports.BatchOperationError = exports.CircuitBreakerError = exports.DataIntegrityError = exports.BusinessLogicError = exports.NotFoundError = exports.ConfigurationError = exports.TimeoutError = exports.NetworkError = exports.ValidationError = exports.RateLimitError = exports.AuthorizationError = exports.AuthenticationError = exports.ApiError = exports.AutotaskError = void 0;
/**
 * Base error class for all Autotask SDK errors
 */
class AutotaskError extends Error {
    constructor(message, code = 'AUTOTASK_ERROR', retryable = false, context) {
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
    toJSON() {
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
    sanitizeContext(context) {
        if (!context)
            return undefined;
        const sensitiveKeys = ['password', 'token', 'apikey', 'secret', 'authorization'];
        const sanitized = {};
        for (const [key, value] of Object.entries(context)) {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                sanitized[key] = '[REDACTED]';
            }
            else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeContext(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
}
exports.AutotaskError = AutotaskError;
/**
 * API-related errors
 */
class ApiError extends AutotaskError {
    constructor(message, statusCode, response, request, context) {
        const retryable = statusCode ? [408, 429, 500, 502, 503, 504].includes(statusCode) : false;
        super(message, 'API_ERROR', retryable, context);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.response = response;
        this.request = request;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            statusCode: this.statusCode,
            response: this.response,
            request: this.sanitizeRequest(this.request)
        };
    }
    sanitizeRequest(request) {
        if (!request)
            return undefined;
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
exports.ApiError = ApiError;
/**
 * Authentication and authorization errors
 */
class AuthenticationError extends ApiError {
    constructor(message = 'Authentication failed', context) {
        super(message, 401, undefined, undefined, context);
        this.name = 'AuthenticationError';
        // code and retryable are set by parent class
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends ApiError {
    constructor(message = 'Authorization failed', context) {
        super(message, 403, undefined, undefined, context);
        this.name = 'AuthorizationError';
        // code and retryable are set by parent class
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Rate limiting errors
 */
class RateLimitError extends ApiError {
    constructor(message = 'Rate limit exceeded', retryAfter, limit, remaining, reset, context) {
        super(message, 429, undefined, undefined, context);
        this.name = 'RateLimitError';
        // code and retryable are set by parent class
        this.retryAfter = retryAfter;
        this.limit = limit;
        this.remaining = remaining;
        this.reset = reset;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            retryAfter: this.retryAfter,
            limit: this.limit,
            remaining: this.remaining,
            reset: this.reset?.toISOString()
        };
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Validation errors
 */
class ValidationError extends ApiError {
    constructor(message = 'Validation failed', errors = [], context) {
        super(message, 400, undefined, undefined, context);
        this.name = 'ValidationError';
        this.errors = errors;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            errors: this.errors.map(error => ({
                ...error,
                value: error.value === undefined ? undefined : '[VALUE]'
            }))
        };
    }
}
exports.ValidationError = ValidationError;
/**
 * Network-related errors
 */
class NetworkError extends AutotaskError {
    constructor(message = 'Network error occurred', originalError, context) {
        super(message, 'NETWORK_ERROR', true, context);
        this.name = 'NetworkError';
        this.originalError = originalError;
    }
    toJSON() {
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
exports.NetworkError = NetworkError;
/**
 * Timeout errors
 */
class TimeoutError extends NetworkError {
    constructor(timeout, operation, context) {
        const message = operation
            ? `Operation '${operation}' timed out after ${timeout}ms`
            : `Request timed out after ${timeout}ms`;
        super(message, undefined, context);
        this.name = 'TimeoutError';
        // code is set by parent class
        this.timeout = timeout;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            timeout: this.timeout
        };
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Configuration errors
 */
class ConfigurationError extends AutotaskError {
    constructor(message = 'Configuration error', missingFields, invalidFields, context) {
        super(message, 'CONFIGURATION_ERROR', false, context);
        this.name = 'ConfigurationError';
        this.missingFields = missingFields;
        this.invalidFields = invalidFields;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            missingFields: this.missingFields,
            invalidFields: this.invalidFields
        };
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * Resource not found error
 */
class NotFoundError extends ApiError {
    constructor(resourceType, resourceId, context) {
        const message = resourceType && resourceId
            ? `${resourceType} with ID ${resourceId} not found`
            : 'Resource not found';
        super(message, 404, undefined, undefined, context);
        this.name = 'NotFoundError';
        // code and retryable are set by parent class
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            resourceType: this.resourceType,
            resourceId: this.resourceId
        };
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Business logic errors
 */
class BusinessLogicError extends AutotaskError {
    constructor(message, rule, entityType, entityId, context) {
        super(message, 'BUSINESS_LOGIC_ERROR', false, context);
        this.name = 'BusinessLogicError';
        this.rule = rule;
        this.entityType = entityType;
        this.entityId = entityId;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            rule: this.rule,
            entityType: this.entityType,
            entityId: this.entityId
        };
    }
}
exports.BusinessLogicError = BusinessLogicError;
/**
 * Data integrity errors
 */
class DataIntegrityError extends AutotaskError {
    constructor(message, constraint, conflictingEntities, context) {
        super(message, 'DATA_INTEGRITY_ERROR', false, context);
        this.name = 'DataIntegrityError';
        this.constraint = constraint;
        this.conflictingEntities = conflictingEntities;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            constraint: this.constraint,
            conflictingEntities: this.conflictingEntities
        };
    }
}
exports.DataIntegrityError = DataIntegrityError;
/**
 * Circuit breaker error
 */
class CircuitBreakerError extends AutotaskError {
    constructor(service, state, failureCount, lastFailure, nextRetry, context) {
        const message = `Circuit breaker is ${state} for service '${service}'`;
        super(message, 'CIRCUIT_BREAKER_ERROR', false, context);
        this.name = 'CircuitBreakerError';
        this.service = service;
        this.state = state;
        this.failureCount = failureCount;
        this.lastFailure = lastFailure;
        this.nextRetry = nextRetry;
    }
    toJSON() {
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
exports.CircuitBreakerError = CircuitBreakerError;
/**
 * Batch operation error
 */
class BatchOperationError extends AutotaskError {
    constructor(message, succeeded, failed, errors, context) {
        super(message, 'BATCH_OPERATION_ERROR', false, context);
        this.name = 'BatchOperationError';
        this.succeeded = succeeded;
        this.failed = failed;
        this.errors = errors;
    }
    toJSON() {
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
exports.BatchOperationError = BatchOperationError;
/**
 * Error factory for creating appropriate error types
 */
class ErrorFactory {
    static fromApiResponse(response, request) {
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
                return new RateLimitError(message, response?.headers?.['retry-after'], response?.headers?.['x-ratelimit-limit'], response?.headers?.['x-ratelimit-remaining'], response?.headers?.['x-ratelimit-reset']
                    ? new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000)
                    : undefined);
            default:
                return new ApiError(message, statusCode, response, request);
        }
    }
    static isRetryable(error) {
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
exports.ErrorFactory = ErrorFactory;
//# sourceMappingURL=AutotaskErrors.js.map