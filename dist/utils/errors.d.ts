import { AxiosError } from 'axios';
/**
 * Base class for all Autotask API errors
 */
export declare abstract class AutotaskError extends Error {
    readonly statusCode?: number | undefined;
    readonly originalError?: Error | undefined;
    readonly isAutotaskError = true;
    readonly timestamp: Date;
    readonly requestId?: string;
    readonly endpoint?: string;
    readonly method?: string;
    constructor(message: string, statusCode?: number | undefined, originalError?: Error | undefined, requestDetails?: {
        endpoint?: string;
        method?: string;
        requestId?: string;
    });
    toJSON(): {
        name: string;
        message: string;
        statusCode: number | undefined;
        timestamp: string;
        endpoint: string | undefined;
        method: string | undefined;
        requestId: string | undefined;
        stack: string | undefined;
    };
}
/**
 * Authentication and authorization errors (401, 403)
 */
export declare class AuthError extends AutotaskError {
    constructor(message: string, statusCode?: number, originalError?: Error, requestDetails?: {
        endpoint?: string;
        method?: string;
        requestId?: string;
    });
}
/**
 * Validation and bad request errors (400, 422)
 */
export declare class ValidationError extends AutotaskError {
    readonly validationErrors?: Record<string, string[]> | undefined;
    constructor(message: string, validationErrors?: Record<string, string[]> | undefined, statusCode?: number, originalError?: Error, requestDetails?: {
        endpoint?: string;
        method?: string;
        requestId?: string;
    });
    toJSON(): {
        validationErrors: Record<string, string[]> | undefined;
        name: string;
        message: string;
        statusCode: number | undefined;
        timestamp: string;
        endpoint: string | undefined;
        method: string | undefined;
        requestId: string | undefined;
        stack: string | undefined;
    };
}
/**
 * Rate limiting errors (429)
 */
export declare class RateLimitError extends AutotaskError {
    readonly retryAfter?: number | undefined;
    constructor(message: string, retryAfter?: number | undefined, statusCode?: number, originalError?: Error, requestDetails?: {
        endpoint?: string;
        method?: string;
        requestId?: string;
    });
    toJSON(): {
        retryAfter: number | undefined;
        name: string;
        message: string;
        statusCode: number | undefined;
        timestamp: string;
        endpoint: string | undefined;
        method: string | undefined;
        requestId: string | undefined;
        stack: string | undefined;
    };
}
/**
 * Resource not found errors (404)
 */
export declare class NotFoundError extends AutotaskError {
    readonly resourceType?: string | undefined;
    readonly resourceId?: string | number | undefined;
    constructor(message: string, resourceType?: string | undefined, resourceId?: string | number | undefined, statusCode?: number, originalError?: Error, requestDetails?: {
        endpoint?: string;
        method?: string;
        requestId?: string;
    });
    toJSON(): {
        resourceType: string | undefined;
        resourceId: string | number | undefined;
        name: string;
        message: string;
        statusCode: number | undefined;
        timestamp: string;
        endpoint: string | undefined;
        method: string | undefined;
        requestId: string | undefined;
        stack: string | undefined;
    };
}
/**
 * Server errors (500, 502, 503, 504)
 */
export declare class ServerError extends AutotaskError {
    constructor(message: string, statusCode?: number, originalError?: Error, requestDetails?: {
        endpoint?: string;
        method?: string;
        requestId?: string;
    });
}
/**
 * Network and timeout errors
 */
export declare class NetworkError extends AutotaskError {
    readonly timeout?: boolean | undefined;
    constructor(message: string, timeout?: boolean | undefined, originalError?: Error, requestDetails?: {
        endpoint?: string;
        method?: string;
        requestId?: string;
    });
    toJSON(): {
        timeout: boolean | undefined;
        name: string;
        message: string;
        statusCode: number | undefined;
        timestamp: string;
        endpoint: string | undefined;
        method: string | undefined;
        requestId: string | undefined;
        stack: string | undefined;
    };
}
/**
 * Configuration and setup errors
 */
export declare class ConfigurationError extends AutotaskError {
    readonly configField?: string | undefined;
    constructor(message: string, configField?: string | undefined, originalError?: Error);
    toJSON(): {
        configField: string | undefined;
        name: string;
        message: string;
        statusCode: number | undefined;
        timestamp: string;
        endpoint: string | undefined;
        method: string | undefined;
        requestId: string | undefined;
        stack: string | undefined;
    };
}
/**
 * Utility function to classify and create appropriate error from axios error
 */
export declare function createAutotaskError(error: AxiosError, requestDetails?: {
    endpoint?: string;
    method?: string;
    requestId?: string;
}): AutotaskError;
/**
 * Utility function to determine if an error is retryable
 */
export declare function isRetryableError(error: AutotaskError): boolean;
/**
 * Utility function to get retry delay for rate limit errors
 */
export declare function getRetryDelay(error: AutotaskError, attempt: number, baseDelay?: number): number;
//# sourceMappingURL=errors.d.ts.map