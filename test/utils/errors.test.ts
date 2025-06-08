import { describe, it, expect } from '@jest/globals';
import { AxiosError, AxiosResponse } from 'axios';
import {
  AutotaskError,
  AuthError,
  ValidationError,
  RateLimitError,
  NotFoundError,
  ServerError,
  NetworkError,
  ConfigurationError,
  createAutotaskError,
  isRetryableError,
  getRetryDelay,
} from '../../src/utils/errors';

// Helper function to create proper AxiosError mocks
function createMockAxiosError(
  status?: number,
  message: string = 'Request failed',
  data?: any,
  headers?: any,
  code?: string
): AxiosError {
  const mockResponse: Partial<AxiosResponse> | undefined = status
    ? {
        status,
        statusText:
          status === 200
            ? 'OK'
            : status === 400
              ? 'Bad Request'
              : status === 401
                ? 'Unauthorized'
                : status === 404
                  ? 'Not Found'
                  : status === 429
                    ? 'Too Many Requests'
                    : status === 500
                      ? 'Internal Server Error'
                      : 'Error',
        data: data || { message },
        headers: headers || {},
        config: {} as any,
      }
    : undefined;

  return {
    message,
    name: 'AxiosError',
    isAxiosError: true,
    toJSON: () => ({}),
    response: mockResponse,
    code,
    config: {} as any,
    request: {},
  } as AxiosError;
}

describe('Error Utilities', () => {
  describe('AutotaskError Classes', () => {
    it('should create AuthError with correct properties', () => {
      const error = new AuthError('Test error', 401, undefined, {
        endpoint: '/test',
        method: 'GET',
        requestId: 'req-123',
      });

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(401);
      expect(error.endpoint).toBe('/test');
      expect(error.method).toBe('GET');
      expect(error.requestId).toBe('req-123');
      expect(error.name).toBe('AuthError');
      expect(error.isAutotaskError).toBe(true);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create ValidationError with validation details', () => {
      const validationDetails = {
        field: ['Required field'],
        email: ['Invalid email format'],
      };
      const error = new ValidationError(
        'Validation failed',
        validationDetails,
        400
      );

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.validationErrors).toEqual(validationDetails);
      expect(error.name).toBe('ValidationError');
    });

    it('should create RateLimitError with retry after', () => {
      const error = new RateLimitError('Rate limit exceeded', 60, 429);

      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
      expect(error.name).toBe('RateLimitError');
    });

    it('should create NotFoundError with resource details', () => {
      const error = new NotFoundError('Resource not found', 'Ticket', 123, 404);

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.resourceType).toBe('Ticket');
      expect(error.resourceId).toBe(123);
      expect(error.name).toBe('NotFoundError');
    });

    it('should create ServerError with correct properties', () => {
      const error = new ServerError('Internal server error', 500);

      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ServerError');
    });

    it('should create NetworkError with timeout flag', () => {
      const error = new NetworkError('Connection timeout', true);

      expect(error.message).toBe('Connection timeout');
      expect(error.timeout).toBe(true);
      expect(error.name).toBe('NetworkError');
    });

    it('should create ConfigurationError with config field', () => {
      const error = new ConfigurationError('Invalid API key', 'apiKey');

      expect(error.message).toBe('Invalid API key');
      expect(error.configField).toBe('apiKey');
      expect(error.name).toBe('ConfigurationError');
    });
  });

  describe('createAutotaskError', () => {
    it('should create AuthError for 401 status', () => {
      const axiosError = createMockAxiosError(401, 'Unauthorized');

      const error = createAutotaskError(axiosError);

      expect(error).toBeInstanceOf(AuthError);
      expect(error.statusCode).toBe(401);
    });

    it('should create AuthError for 403 status', () => {
      const axiosError = createMockAxiosError(403, 'Forbidden');

      const error = createAutotaskError(axiosError);

      expect(error).toBeInstanceOf(AuthError);
      expect(error.statusCode).toBe(403);
    });

    it('should create ValidationError for 400 status', () => {
      const axiosError = createMockAxiosError(400, 'Bad request', {
        message: 'Validation failed',
        errors: [{ field: 'name', message: 'Required' }],
      });

      const error = createAutotaskError(axiosError);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect((error as ValidationError).validationErrors).toBeDefined();
    });

    it('should create RateLimitError for 429 status', () => {
      const axiosError = createMockAxiosError(
        429,
        'Rate limit exceeded',
        { message: 'Rate limit exceeded' },
        { 'retry-after': '60' }
      );

      const error = createAutotaskError(axiosError);

      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.statusCode).toBe(429);
      expect((error as RateLimitError).retryAfter).toBe(60);
    });

    it('should create NotFoundError for 404 status', () => {
      const axiosError = createMockAxiosError(404, 'Resource not found');

      const error = createAutotaskError(axiosError);

      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
    });

    it('should create ServerError for 500 status', () => {
      const axiosError = createMockAxiosError(500, 'Internal server error');

      const error = createAutotaskError(axiosError);

      expect(error).toBeInstanceOf(ServerError);
      expect(error.statusCode).toBe(500);
    });

    it('should create NetworkError for network failures', () => {
      const axiosError = createMockAxiosError(
        undefined,
        'connect ECONNREFUSED 127.0.0.1:80',
        undefined,
        undefined,
        'ECONNREFUSED'
      );

      const error = createAutotaskError(axiosError);

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toContain('ECONNREFUSED');
    });

    it('should create NetworkError for timeout', () => {
      const axiosError = createMockAxiosError(
        undefined,
        'timeout of 5000ms exceeded',
        undefined,
        undefined,
        'ECONNABORTED'
      );

      const error = createAutotaskError(axiosError);

      expect(error).toBeInstanceOf(NetworkError);
      expect((error as NetworkError).timeout).toBe(true);
    });

    it('should include request details when provided', () => {
      const axiosError = createMockAxiosError(400, 'Bad request');

      const requestDetails = {
        endpoint: '/tickets',
        method: 'POST',
        requestId: 'req-456',
      };

      const error = createAutotaskError(axiosError, requestDetails);

      expect(error.endpoint).toBe('/tickets');
      expect(error.method).toBe('POST');
      expect(error.requestId).toBe('req-456');
    });

    it('should handle missing response data gracefully', () => {
      const axiosError = createMockAxiosError(
        500,
        'Request failed with status code 500',
        null
      );

      const error = createAutotaskError(axiosError);

      expect(error).toBeInstanceOf(ServerError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toContain('Request failed');
    });

    it('should create AutotaskError from AxiosError', () => {
      const axiosError = createMockAxiosError(500, 'Internal server error');

      const autotaskError = createAutotaskError(axiosError, {
        endpoint: '/test',
        method: 'GET',
        requestId: 'req-123',
      });

      expect(autotaskError.name).toBe('ServerError');
      expect(autotaskError.statusCode).toBe(500);
      expect(autotaskError.message).toContain('Internal server error');
    });
  });

  describe('isRetryableError', () => {
    it('should return true for retryable errors', () => {
      expect(isRetryableError(new RateLimitError('Rate limit', 60, 429))).toBe(
        true
      );
      expect(isRetryableError(new ServerError('Server error', 500))).toBe(true);
      expect(isRetryableError(new ServerError('Bad gateway', 502))).toBe(true);
      expect(
        isRetryableError(new ServerError('Service unavailable', 503))
      ).toBe(true);
      expect(isRetryableError(new ServerError('Gateway timeout', 504))).toBe(
        true
      );
      expect(isRetryableError(new NetworkError('Network error', false))).toBe(
        true
      );
    });

    it('should return false for non-retryable errors', () => {
      expect(isRetryableError(new AuthError('Unauthorized', 401))).toBe(false);
      expect(
        isRetryableError(new ValidationError('Bad request', {}, 400))
      ).toBe(false);
      expect(isRetryableError(new AuthError('Forbidden', 403))).toBe(false);
      expect(
        isRetryableError(
          new NotFoundError('Not found', undefined, undefined, 404)
        )
      ).toBe(false);
      expect(isRetryableError(new ConfigurationError('Config error'))).toBe(
        false
      );
    });
  });

  describe('getRetryDelay', () => {
    it('should return retry-after value for rate limit errors', () => {
      const error = new RateLimitError('Rate limit', 30, 429);
      const delay = getRetryDelay(error, 1);

      expect(delay).toBe(30000); // 30 seconds in milliseconds
    });

    it('should use exponential backoff for other retryable errors', () => {
      const error = new ServerError('Server error', 500);

      // Test that delays are approximately correct (accounting for jitter)
      const delay1 = getRetryDelay(error, 1, 1000);
      const delay2 = getRetryDelay(error, 2, 1000);
      const delay3 = getRetryDelay(error, 3, 1000);

      // Delays should be approximately: 1000, 2000, 4000 (with jitter)
      expect(delay1).toBeGreaterThanOrEqual(900);
      expect(delay1).toBeLessThanOrEqual(1100);

      expect(delay2).toBeGreaterThanOrEqual(1800);
      expect(delay2).toBeLessThanOrEqual(2200);

      expect(delay3).toBeGreaterThanOrEqual(3600);
      expect(delay3).toBeLessThanOrEqual(4400);
    });

    it('should cap exponential backoff at maximum delay', () => {
      const error = new ServerError('Server error', 500);
      const delay = getRetryDelay(error, 10, 1000); // Very high attempt number

      expect(delay).toBeLessThanOrEqual(30000); // Should be capped at 30 seconds
    });

    it('should add jitter to prevent thundering herd', () => {
      const error = new ServerError('Server error', 500);
      const delay1 = getRetryDelay(error, 1, 1000);
      const delay2 = getRetryDelay(error, 1, 1000);

      // Due to jitter, delays might be slightly different
      expect(Math.abs(delay1 - delay2)).toBeLessThanOrEqual(200); // Within jitter range
    });
  });

  describe('Error JSON serialization', () => {
    it('should serialize ValidationError with validation details', () => {
      const validationDetails = { field: ['Required'] };
      const error = new ValidationError(
        'Validation failed',
        validationDetails,
        400
      );
      const json = error.toJSON();

      expect(json.name).toBe('ValidationError');
      expect(json.message).toBe('Validation failed');
      expect(json.statusCode).toBe(400);
      expect(json.validationErrors).toEqual(validationDetails);
      expect(json.timestamp).toBeDefined();
    });

    it('should serialize RateLimitError with retry after', () => {
      const error = new RateLimitError('Rate limit', 60, 429);
      const json = error.toJSON();

      expect(json.name).toBe('RateLimitError');
      expect(json.retryAfter).toBe(60);
    });

    it('should serialize NotFoundError with resource details', () => {
      const error = new NotFoundError('Not found', 'Ticket', 123, 404);
      const json = error.toJSON();

      expect(json.name).toBe('NotFoundError');
      expect(json.resourceType).toBe('Ticket');
      expect(json.resourceId).toBe(123);
    });

    it('should serialize NetworkError with timeout flag', () => {
      const error = new NetworkError('Timeout', true);
      const json = error.toJSON();

      expect(json.name).toBe('NetworkError');
      expect(json.timeout).toBe(true);
    });

    it('should serialize ConfigurationError with config field', () => {
      const error = new ConfigurationError('Config error', 'apiKey');
      const json = error.toJSON();

      expect(json.name).toBe('ConfigurationError');
      expect(json.configField).toBe('apiKey');
    });
  });

  describe('Error inheritance and instanceof checks', () => {
    it('should properly identify error types', () => {
      const authError = new AuthError('Auth error', 401);
      const validationError = new ValidationError('Validation error', {}, 400);
      const rateLimitError = new RateLimitError('Rate limit', 60, 429);

      expect(authError instanceof AuthError).toBe(true);
      expect(authError instanceof Error).toBe(true);
      expect(authError.isAutotaskError).toBe(true);

      expect(validationError instanceof ValidationError).toBe(true);
      expect(validationError instanceof Error).toBe(true);
      expect(validationError.isAutotaskError).toBe(true);

      expect(rateLimitError instanceof RateLimitError).toBe(true);
      expect(rateLimitError instanceof Error).toBe(true);
      expect(rateLimitError.isAutotaskError).toBe(true);
    });
  });
});
