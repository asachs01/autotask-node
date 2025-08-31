/**
 * Comprehensive test suite for the Autotask SDK error hierarchy
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  AutotaskError,
  ApiError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ValidationError,
  NetworkError,
  TimeoutError,
  ConfigurationError,
  NotFoundError,
  BusinessLogicError,
  DataIntegrityError,
  CircuitBreakerError,
  BatchOperationError,
  ErrorFactory
} from '../../src/errors/AutotaskErrors';

describe('AutotaskError Hierarchy', () => {
  describe('AutotaskError Base Class', () => {
    it('should create base error with all properties', () => {
      const context = { userId: 123, operation: 'test' };
      const error = new AutotaskError('Test error', 'TEST_ERROR', true, context);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.retryable).toBe(true);
      expect(error.context).toEqual(context);
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.name).toBe('AutotaskError');
      expect(error.stack).toBeDefined();
    });

    it('should set correlation ID from context', () => {
      const context = { correlationId: 'corr-123' };
      const error = new AutotaskError('Test', 'TEST', false, context);

      expect(error.correlationId).toBe('corr-123');
    });

    it('should serialize to JSON correctly', () => {
      const error = new AutotaskError('Test error', 'TEST_ERROR', true, {
        userId: 123,
        secret: 'should-be-redacted'
      });

      const json = error.toJSON();

      expect(json.name).toBe('AutotaskError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('TEST_ERROR');
      expect(json.retryable).toBe(true);
      expect(json.timestamp).toBeDefined();
      expect(json.context?.userId).toBe(123);
      expect(json.context?.secret).toBe('[REDACTED]');
      expect(json.stack).toBeDefined();
    });

    it('should sanitize sensitive data in context', () => {
      const error = new AutotaskError('Test', 'TEST', false, {
        password: 'secret123',
        apiKey: 'key-456',
        token: 'token-789',
        authorization: 'Bearer abc',
        secret: 'my-secret',
        normalData: 'visible',
        nested: {
          ApiKey: 'nested-key',  // Testing case-insensitive matching
          data: 'nested-visible'
        }
      });

      const json = error.toJSON();

      expect(json.context?.password).toBe('[REDACTED]');
      expect(json.context?.apiKey).toBe('[REDACTED]');
      expect(json.context?.token).toBe('[REDACTED]');
      expect(json.context?.authorization).toBe('[REDACTED]');
      expect(json.context?.secret).toBe('[REDACTED]');
      expect(json.context?.normalData).toBe('visible');
      expect(json.context?.nested?.ApiKey).toBe('[REDACTED]');
      expect(json.context?.nested?.data).toBe('nested-visible');
    });
  });

  describe('ApiError', () => {
    it('should create API error with status code', () => {
      const error = new ApiError('API failed', 500, 'response', 'request');

      expect(error.message).toBe('API failed');
      expect(error.statusCode).toBe(500);
      expect(error.response).toBe('response');
      expect(error.request).toBe('request');
      expect(error.retryable).toBe(true);
      expect(error.name).toBe('ApiError');
    });

    it('should determine retryable status based on status code', () => {
      const retryableCodes = [408, 429, 500, 502, 503, 504];
      const nonRetryableCodes = [400, 401, 403, 404, 405];

      retryableCodes.forEach(code => {
        const error = new ApiError('Test', code);
        expect(error.retryable).toBe(true);
      });

      nonRetryableCodes.forEach(code => {
        const error = new ApiError('Test', code);
        expect(error.retryable).toBe(false);
      });
    });

    it('should sanitize request headers in JSON', () => {
      const request = {
        url: '/api/test',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer secret-token',
          'x-api-key': 'api-key-123',
          'x-api-secret': 'api-secret-456'
        }
      };

      const error = new ApiError('Test', 400, null, request);
      const json = error.toJSON();

      expect(json.request?.headers?.['content-type']).toBe('application/json');
      expect(json.request?.headers?.['authorization']).toBe('[REDACTED]');
      expect(json.request?.headers?.['x-api-key']).toBe('[REDACTED]');
      expect(json.request?.headers?.['x-api-secret']).toBe('[REDACTED]');
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with 401 status', () => {
      const error = new AuthenticationError('Invalid credentials');

      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.retryable).toBe(false);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should use default message if not provided', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('Authentication failed');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with 403 status', () => {
      const error = new AuthorizationError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.retryable).toBe(false);
      expect(error.name).toBe('AuthorizationError');
    });

    it('should use default message if not provided', () => {
      const error = new AuthorizationError();

      expect(error.message).toBe('Authorization failed');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with all properties', () => {
      const reset = new Date();
      const error = new RateLimitError(
        'Too many requests',
        60,
        100,
        5,
        reset
      );

      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(60);
      expect(error.limit).toBe(100);
      expect(error.remaining).toBe(5);
      expect(error.reset).toBe(reset);
      expect(error.name).toBe('RateLimitError');
    });

    it('should serialize with reset date as ISO string', () => {
      const reset = new Date();
      const error = new RateLimitError('Rate limited', 30, 50, 0, reset);
      const json = error.toJSON();

      expect(json.retryAfter).toBe(30);
      expect(json.limit).toBe(50);
      expect(json.remaining).toBe(0);
      expect(json.reset).toBe(reset.toISOString());
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid format', code: 'INVALID_EMAIL' },
        { field: 'name', message: 'Required', value: null }
      ];

      const error = new ValidationError('Validation failed', errors);

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.retryable).toBe(false);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ValidationError');
    });

    it('should sanitize field values in JSON', () => {
      const errors = [
        { field: 'email', message: 'Invalid', value: 'user@example.com' },
        { field: 'password', message: 'Too weak', value: 'secret123' }
      ];

      const error = new ValidationError('Invalid input', errors);
      const json = error.toJSON();

      expect(json.errors?.[0].value).toBe('[VALUE]');
      expect(json.errors?.[1].value).toBe('[VALUE]');
      expect(json.errors?.[0].field).toBe('email');
      expect(json.errors?.[0].message).toBe('Invalid');
    });
  });

  describe('NetworkError', () => {
    it('should create network error with original error', () => {
      const originalError = new Error('ECONNREFUSED');
      const error = new NetworkError('Connection failed', originalError);

      expect(error.message).toBe('Connection failed');
      expect(error.retryable).toBe(true);
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe('NetworkError');
    });

    it('should serialize original error in JSON', () => {
      const originalError = new Error('ETIMEDOUT');
      originalError.stack = 'Error stack trace';

      const error = new NetworkError('Timeout', originalError);
      const json = error.toJSON();

      expect(json.originalError?.name).toBe('Error');
      expect(json.originalError?.message).toBe('ETIMEDOUT');
      expect(json.originalError?.stack).toBe('Error stack trace');
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error with operation name', () => {
      const error = new TimeoutError(5000, 'fetchData');

      expect(error.message).toBe("Operation 'fetchData' timed out after 5000ms");
      expect(error.timeout).toBe(5000);
      expect(error.retryable).toBe(true);
      expect(error.name).toBe('TimeoutError');
    });

    it('should create timeout error without operation name', () => {
      const error = new TimeoutError(3000);

      expect(error.message).toBe('Request timed out after 3000ms');
      expect(error.timeout).toBe(3000);
    });

    it('should serialize timeout value in JSON', () => {
      const error = new TimeoutError(10000, 'longOperation');
      const json = error.toJSON();

      expect(json.timeout).toBe(10000);
      expect(json.message).toContain('10000ms');
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error with field details', () => {
      const error = new ConfigurationError(
        'Invalid configuration',
        ['apiKey', 'secret'],
        ['region']
      );

      expect(error.message).toBe('Invalid configuration');
      expect(error.retryable).toBe(false);
      expect(error.missingFields).toEqual(['apiKey', 'secret']);
      expect(error.invalidFields).toEqual(['region']);
      expect(error.name).toBe('ConfigurationError');
    });

    it('should serialize field details in JSON', () => {
      const error = new ConfigurationError(
        'Config error',
        ['username'],
        ['endpoint']
      );
      const json = error.toJSON();

      expect(json.missingFields).toEqual(['username']);
      expect(json.invalidFields).toEqual(['endpoint']);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with resource details', () => {
      const error = new NotFoundError('Ticket', 12345);

      expect(error.message).toBe('Ticket with ID 12345 not found');
      expect(error.statusCode).toBe(404);
      expect(error.retryable).toBe(false);
      expect(error.resourceType).toBe('Ticket');
      expect(error.resourceId).toBe(12345);
      expect(error.name).toBe('NotFoundError');
    });

    it('should create generic not found error', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });

    it('should serialize resource details in JSON', () => {
      const error = new NotFoundError('Company', 'abc-123');
      const json = error.toJSON();

      expect(json.resourceType).toBe('Company');
      expect(json.resourceId).toBe('abc-123');
    });
  });

  describe('BusinessLogicError', () => {
    it('should create business logic error with rule details', () => {
      const error = new BusinessLogicError(
        'Ticket cannot be closed with open tasks',
        'TICKET_CLOSURE_RULE',
        'Ticket',
        456
      );

      expect(error.message).toBe('Ticket cannot be closed with open tasks');
      expect(error.retryable).toBe(false);
      expect(error.rule).toBe('TICKET_CLOSURE_RULE');
      expect(error.entityType).toBe('Ticket');
      expect(error.entityId).toBe(456);
      expect(error.name).toBe('BusinessLogicError');
    });

    it('should serialize rule details in JSON', () => {
      const error = new BusinessLogicError(
        'Invalid state transition',
        'STATE_MACHINE',
        'Task',
        789
      );
      const json = error.toJSON();

      expect(json.rule).toBe('STATE_MACHINE');
      expect(json.entityType).toBe('Task');
      expect(json.entityId).toBe(789);
    });
  });

  describe('DataIntegrityError', () => {
    it('should create data integrity error with constraint details', () => {
      const conflictingEntities = [
        { type: 'Ticket', id: 123 },
        { type: 'Task', id: 456 }
      ];

      const error = new DataIntegrityError(
        'Foreign key constraint violation',
        'FK_TICKET_TASK',
        conflictingEntities
      );

      expect(error.message).toBe('Foreign key constraint violation');
      expect(error.retryable).toBe(false);
      expect(error.constraint).toBe('FK_TICKET_TASK');
      expect(error.conflictingEntities).toEqual(conflictingEntities);
      expect(error.name).toBe('DataIntegrityError');
    });

    it('should serialize constraint details in JSON', () => {
      const entities = [{ type: 'Company', id: 'comp-1' }];
      const error = new DataIntegrityError(
        'Unique constraint violation',
        'UQ_COMPANY_NAME',
        entities
      );
      const json = error.toJSON();

      expect(json.constraint).toBe('UQ_COMPANY_NAME');
      expect(json.conflictingEntities).toEqual(entities);
    });
  });

  describe('CircuitBreakerError', () => {
    it('should create circuit breaker error with state details', () => {
      const lastFailure = new Date();
      const nextRetry = new Date(Date.now() + 30000);

      const error = new CircuitBreakerError(
        'autotask-api',
        'open',
        5,
        lastFailure,
        nextRetry
      );

      expect(error.message).toBe("Circuit breaker is open for service 'autotask-api'");
      expect(error.retryable).toBe(false);
      expect(error.service).toBe('autotask-api');
      expect(error.state).toBe('open');
      expect(error.failureCount).toBe(5);
      expect(error.lastFailure).toBe(lastFailure);
      expect(error.nextRetry).toBe(nextRetry);
      expect(error.name).toBe('CircuitBreakerError');
    });

    it('should serialize dates in JSON', () => {
      const lastFailure = new Date();
      const nextRetry = new Date(Date.now() + 60000);

      const error = new CircuitBreakerError(
        'external-service',
        'half-open',
        3,
        lastFailure,
        nextRetry
      );
      const json = error.toJSON();

      expect(json.service).toBe('external-service');
      expect(json.state).toBe('half-open');
      expect(json.failureCount).toBe(3);
      expect(json.lastFailure).toBe(lastFailure.toISOString());
      expect(json.nextRetry).toBe(nextRetry.toISOString());
    });
  });

  describe('BatchOperationError', () => {
    it('should create batch operation error with error details', () => {
      const errors = [
        { index: 0, error: new ValidationError('Invalid data') },
        { index: 2, error: new NetworkError('Connection failed') },
        { index: 5, error: new Error('Unknown error') }
      ];

      const error = new BatchOperationError(
        'Batch operation partially failed',
        3,
        3,
        errors
      );

      expect(error.message).toBe('Batch operation partially failed');
      expect(error.retryable).toBe(false);
      expect(error.succeeded).toBe(3);
      expect(error.failed).toBe(3);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('BatchOperationError');
    });

    it('should serialize nested errors in JSON', () => {
      const errors = [
        { index: 1, error: new AuthenticationError('Invalid token') },
        { index: 3, error: new Error('Generic error') }
      ];

      const error = new BatchOperationError(
        'Batch failed',
        2,
        2,
        errors
      );
      const json = error.toJSON();

      expect(json.succeeded).toBe(2);
      expect(json.failed).toBe(2);
      expect(json.errors).toHaveLength(2);
      
      // First error is an AutotaskError, should have full JSON
      expect(json.errors?.[0].index).toBe(1);
      expect(json.errors?.[0].error.name).toBe('AuthenticationError');
      expect(json.errors?.[0].error.statusCode).toBe(401);
      
      // Second error is a generic Error, should have basic properties
      expect(json.errors?.[1].index).toBe(3);
      expect(json.errors?.[1].error.name).toBe('Error');
      expect(json.errors?.[1].error.message).toBe('Generic error');
    });
  });

  describe('ErrorFactory', () => {
    it('should create appropriate error from API response', () => {
      const testCases = [
        { status: 400, expectedType: ValidationError },
        { status: 401, expectedType: AuthenticationError },
        { status: 403, expectedType: AuthorizationError },
        { status: 404, expectedType: NotFoundError },
        { status: 429, expectedType: RateLimitError },
        { status: 500, expectedType: ApiError },
        { status: 502, expectedType: ApiError }
      ];

      testCases.forEach(({ status, expectedType }) => {
        const response = {
          status,
          data: { message: 'Test error' }
        };

        const error = ErrorFactory.fromApiResponse(response);
        expect(error).toBeInstanceOf(expectedType);
        expect(error.statusCode).toBe(status);
      });
    });

    it('should extract rate limit headers', () => {
      const response = {
        status: 429,
        data: { message: 'Rate limited' },
        headers: {
          'retry-after': '60',
          'x-ratelimit-limit': '100',
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1234567890'
        }
      };

      const error = ErrorFactory.fromApiResponse(response) as RateLimitError;

      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.retryAfter).toBe('60');
      expect(error.limit).toBe('100');
      expect(error.remaining).toBe('0');
      expect(error.reset).toEqual(new Date(1234567890000));
    });

    it('should extract validation errors', () => {
      const response = {
        status: 400,
        data: {
          message: 'Validation failed',
          errors: [
            { field: 'email', message: 'Invalid' }
          ]
        }
      };

      const error = ErrorFactory.fromApiResponse(response) as ValidationError;

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.errors).toEqual(response.data.errors);
    });

    it('should determine if error is retryable', () => {
      const retryableError = new RateLimitError();
      const nonRetryableError = new ValidationError();
      const networkError = new Error('ECONNRESET');
      const timeoutError = new Error('Request timeout');

      expect(ErrorFactory.isRetryable(retryableError)).toBe(true);
      expect(ErrorFactory.isRetryable(nonRetryableError)).toBe(false);
      expect(ErrorFactory.isRetryable(networkError)).toBe(true);
      expect(ErrorFactory.isRetryable(timeoutError)).toBe(true);
    });

    it('should identify retryable error patterns', () => {
      const retryableMessages = [
        'Connection timeout',
        'ECONNRESET',
        'ECONNREFUSED',
        'socket hang up'
      ];

      const nonRetryableMessages = [
        'Invalid input',
        'Authentication required',
        'Not found'
      ];

      retryableMessages.forEach(message => {
        const error = new Error(message);
        expect(ErrorFactory.isRetryable(error)).toBe(true);
      });

      nonRetryableMessages.forEach(message => {
        const error = new Error(message);
        expect(ErrorFactory.isRetryable(error)).toBe(false);
      });
    });
  });

  describe('Error instanceof checks', () => {
    it('should properly identify error inheritance', () => {
      const autotaskError = new AutotaskError('Test', 'TEST');
      const apiError = new ApiError('API', 500);
      const authError = new AuthenticationError();
      const networkError = new NetworkError();
      const timeoutError = new TimeoutError(5000);

      // All should be instances of Error
      expect(autotaskError).toBeInstanceOf(Error);
      expect(apiError).toBeInstanceOf(Error);
      expect(authError).toBeInstanceOf(Error);
      expect(networkError).toBeInstanceOf(Error);
      expect(timeoutError).toBeInstanceOf(Error);

      // All should be instances of AutotaskError
      expect(autotaskError).toBeInstanceOf(AutotaskError);
      expect(apiError).toBeInstanceOf(AutotaskError);
      expect(authError).toBeInstanceOf(AutotaskError);
      expect(networkError).toBeInstanceOf(AutotaskError);
      expect(timeoutError).toBeInstanceOf(AutotaskError);

      // API errors should be instances of ApiError
      expect(apiError).toBeInstanceOf(ApiError);
      expect(authError).toBeInstanceOf(ApiError);

      // Network errors should be instances of NetworkError
      expect(networkError).toBeInstanceOf(NetworkError);
      expect(timeoutError).toBeInstanceOf(NetworkError);

      // Specific type checks
      expect(authError).toBeInstanceOf(AuthenticationError);
      expect(timeoutError).toBeInstanceOf(TimeoutError);
    });
  });

  describe('Error stack traces', () => {
    it('should maintain proper stack traces', () => {
      const error = new ValidationError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
      expect(error.stack).toContain('Test error');
    });
  });
});