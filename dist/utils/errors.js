"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = exports.NetworkError = exports.ServerError = exports.NotFoundError = exports.RateLimitError = exports.ValidationError = exports.AuthError = exports.AutotaskError = void 0;
exports.createAutotaskError = createAutotaskError;
exports.isRetryableError = isRetryableError;
exports.getRetryDelay = getRetryDelay;
/**
 * Base class for all Autotask API errors
 */
class AutotaskError extends Error {
    constructor(message, statusCode, originalError, requestDetails) {
        super(message);
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.isAutotaskError = true;
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
exports.AutotaskError = AutotaskError;
/**
 * Authentication and authorization errors (401, 403)
 */
class AuthError extends AutotaskError {
    constructor(message, statusCode, originalError, requestDetails) {
        super(message, statusCode, originalError, requestDetails);
    }
}
exports.AuthError = AuthError;
/**
 * Validation and bad request errors (400, 422)
 */
class ValidationError extends AutotaskError {
    constructor(message, validationErrors, statusCode, originalError, requestDetails) {
        super(message, statusCode, originalError, requestDetails);
        this.validationErrors = validationErrors;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            validationErrors: this.validationErrors,
        };
    }
}
exports.ValidationError = ValidationError;
/**
 * Rate limiting errors (429)
 */
class RateLimitError extends AutotaskError {
    constructor(message, retryAfter, statusCode, originalError, requestDetails) {
        super(message, statusCode, originalError, requestDetails);
        this.retryAfter = retryAfter;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            retryAfter: this.retryAfter,
        };
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Resource not found errors (404)
 */
class NotFoundError extends AutotaskError {
    constructor(message, resourceType, resourceId, statusCode, originalError, requestDetails) {
        super(message, statusCode, originalError, requestDetails);
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            resourceType: this.resourceType,
            resourceId: this.resourceId,
        };
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Server errors (500, 502, 503, 504)
 */
class ServerError extends AutotaskError {
    constructor(message, statusCode, originalError, requestDetails) {
        super(message, statusCode, originalError, requestDetails);
    }
}
exports.ServerError = ServerError;
/**
 * Network and timeout errors
 */
class NetworkError extends AutotaskError {
    constructor(message, timeout, originalError, requestDetails) {
        super(message, undefined, originalError, requestDetails);
        this.timeout = timeout;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            timeout: this.timeout,
        };
    }
}
exports.NetworkError = NetworkError;
/**
 * Configuration and setup errors
 */
class ConfigurationError extends AutotaskError {
    constructor(message, configField, originalError) {
        super(message, undefined, originalError);
        this.configField = configField;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            configField: this.configField,
        };
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * Utility function to classify and create appropriate error from axios error
 */
function createAutotaskError(error, requestDetails) {
    const status = error.response?.status || 0;
    const responseData = error.response?.data;
    const message = responseData?.message ||
        error.response?.statusText ||
        error.message ||
        'Request failed';
    // Extract additional error details from response
    const validationErrors = responseData?.errors || responseData?.validationErrors;
    const retryAfter = error.response?.headers['retry-after']
        ? parseInt(error.response.headers['retry-after'], 10)
        : undefined;
    switch (status) {
        case 400:
            return new ValidationError(`Bad Request: ${message}`, validationErrors, status, error, requestDetails);
        case 401:
            return new AuthError(`Authentication failed: ${message}`, status, error, requestDetails);
        case 403:
            return new AuthError(`Access forbidden: ${message}`, status, error, requestDetails);
        case 404:
            return new NotFoundError(`Resource not found: ${message}`, requestDetails?.endpoint?.split('/')[1], // Extract resource type from endpoint
            undefined, status, error, requestDetails);
        case 422:
            return new ValidationError(`Validation failed: ${message}`, validationErrors, status, error, requestDetails);
        case 429:
            return new RateLimitError(`Rate limit exceeded: ${message}`, retryAfter, status, error, requestDetails);
        case 500:
        case 502:
        case 503:
        case 504:
            return new ServerError(`Server error (${status}): ${message}`, status, error, requestDetails);
        default:
            // Handle network errors (no response)
            if (!error.response) {
                const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
                return new NetworkError(`Network error: ${error.message}`, isTimeout, error, requestDetails);
            }
            // Fallback for unknown status codes - use ServerError for unknown HTTP errors
            return new ServerError(`HTTP ${status || 'Unknown'}: ${message}`, status, error, requestDetails);
    }
}
/**
 * Utility function to determine if an error is retryable
 */
function isRetryableError(error) {
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
function getRetryDelay(error, attempt, baseDelay = 1000) {
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
//# sourceMappingURL=errors.js.map