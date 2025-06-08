import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { RequestHandler, RequestOptions } from '../../src/utils/requestHandler';
import {
  AutotaskError,
  AuthError,
  RateLimitError,
  ServerError,
  NetworkError,
} from '../../src/utils/errors';
import { PerformanceMonitor } from '../../src/utils/performanceMonitor';
import { Logger } from 'winston';

// Helper functions for creating mock objects
const createMockResponse = (
  data: any = { id: 1, name: 'Test' },
  status: number = 200
): AxiosResponse => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

const createMockAxiosError = (
  status: number,
  message: string,
  data: any = {}
): AxiosError => {
  const error = new Error(`Request failed with status code ${status}`) as any;
  error.isAxiosError = true;
  error.name = 'AxiosError';
  error.response = {
    status,
    data,
    headers: {},
    statusText: message,
    config: {} as any,
  };
  error.config = {} as any;
  error.request = {};
  error.toJSON = () => ({});
  return error as AxiosError;
};

// Helper function to create network errors without response
const createMockNetworkError = (message: string, code?: string): AxiosError =>
  ({
    message,
    name: 'AxiosError',
    isAxiosError: true,
    toJSON: () => ({}),
    code,
    config: {} as any,
    request: {},
    // No response property for network errors
  }) as AxiosError;

// Type for request function
type RequestFunction = () => Promise<AxiosResponse>;

describe('RequestHandler', () => {
  let requestHandler: RequestHandler;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: jest.Mocked<Logger>;
  let mockPerformanceMonitor: jest.Mocked<PerformanceMonitor>;

  beforeEach(() => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
        },
        response: {
          use: jest.fn(),
          eject: jest.fn(),
        },
      },
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    mockPerformanceMonitor = {
      startTimer: jest.fn().mockReturnValue(jest.fn()),
      recordMemoryUsage: jest.fn(),
      getMetrics: jest.fn().mockReturnValue({}),
    } as any;

    requestHandler = new RequestHandler(
      mockAxios,
      mockLogger,
      {} // globalOptions
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeRequest', () => {
    it('should execute request successfully', async () => {
      const mockResponse = createMockResponse();
      const requestFn = jest
        .fn<RequestFunction>()
        .mockResolvedValueOnce(mockResponse);

      const result = await requestHandler.executeRequest(
        requestFn,
        '/test',
        'GET'
      );

      expect(result).toEqual(mockResponse);
      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on server errors', async () => {
      const mockResponse = createMockResponse();
      const serverError = createMockAxiosError(500, 'Internal Server Error');

      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(mockResponse);

      const result = await requestHandler.executeRequest(
        requestFn,
        '/test',
        'GET',
        { retries: 3 }
      );

      expect(result).toEqual(mockResponse);
      expect(requestFn).toHaveBeenCalledTimes(3);
    });

    it('should throw AuthError for 401 responses', async () => {
      const authError = createMockAxiosError(401, 'Unauthorized');
      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValueOnce(authError);

      await expect(
        requestHandler.executeRequest(requestFn, '/test', 'GET', { retries: 3 })
      ).rejects.toThrow(AuthError);
    });

    it('should fail after maximum retries', async () => {
      const serverError = createMockAxiosError(500, 'Internal Server Error');
      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValue(serverError);

      await expect(
        requestHandler.executeRequest(requestFn, '/test', 'GET', { retries: 2 })
      ).rejects.toThrow(ServerError);

      expect(requestFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should handle rate limit with retry-after', async () => {
      const mockResponse = createMockResponse();
      const rateLimitError = createMockAxiosError(429, 'Too Many Requests');
      if (rateLimitError.response) {
        rateLimitError.response.headers = { 'retry-after': '1' };
      }

      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce(mockResponse);

      const result = await requestHandler.executeRequest(
        requestFn,
        '/test',
        'GET',
        { retries: 3 }
      );

      expect(requestFn).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });

    it('should handle network errors', async () => {
      const networkError = createMockNetworkError(
        'Network Error',
        'ECONNREFUSED'
      );
      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValueOnce(networkError);

      await expect(
        requestHandler.executeRequest(requestFn, '/test', 'GET')
      ).rejects.toThrow(NetworkError);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = createMockNetworkError('Timeout', 'ECONNABORTED');
      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValueOnce(timeoutError);

      await expect(
        requestHandler.executeRequest(requestFn, '/test', 'GET')
      ).rejects.toThrow(NetworkError);
    });
  });

  describe('error handling', () => {
    it('should handle different error types correctly', async () => {
      const serverError = createMockAxiosError(500, 'Internal Server Error');
      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(createMockResponse());

      await requestHandler.executeRequest(requestFn, '/test', 'GET', {
        retries: 3,
      });

      expect(requestFn).toHaveBeenCalledTimes(3);
    });

    it('should handle network errors', async () => {
      const networkError = createMockNetworkError(
        'Network Error',
        'ECONNREFUSED'
      );
      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValueOnce(networkError);

      await expect(
        requestHandler.executeRequest(requestFn, '/test', 'GET')
      ).rejects.toThrow(NetworkError);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = createMockNetworkError('Timeout', 'ECONNABORTED');
      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValueOnce(timeoutError);

      await expect(
        requestHandler.executeRequest(requestFn, '/test', 'GET')
      ).rejects.toThrow(NetworkError);
    });

    it('should handle non-retryable errors', async () => {
      const serverError = createMockAxiosError(500, 'Internal Server Error');
      const requestFn = jest.fn<RequestFunction>().mockImplementation(() => {
        throw serverError;
      });

      await expect(
        requestHandler.executeRequest(requestFn, '/test', 'GET')
      ).rejects.toThrow(ServerError);
    });
  });

  describe('request options', () => {
    it('should respect custom timeout', async () => {
      const mockResponse = createMockResponse();
      const requestFn = jest
        .fn<RequestFunction>()
        .mockResolvedValueOnce(mockResponse);

      await requestHandler.executeRequest(requestFn, '/test', 'GET', {
        timeout: 5000,
      });

      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('should respect custom retry count', async () => {
      const mockResponse = createMockResponse();
      const requestFn = jest
        .fn<RequestFunction>()
        .mockResolvedValueOnce(mockResponse);

      await requestHandler.executeRequest(requestFn, '/test', 'GET', {
        retries: 5,
      });

      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('should respect custom base delay', async () => {
      const mockResponse = createMockResponse();
      const requestFn = jest
        .fn<RequestFunction>()
        .mockResolvedValueOnce(mockResponse);

      await requestHandler.executeRequest(requestFn, '/test', 'GET', {
        baseDelay: 2000,
      });

      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('should handle request logging options', async () => {
      const mockResponse = createMockResponse();
      const requestFn = jest
        .fn<RequestFunction>()
        .mockResolvedValueOnce(mockResponse);

      await requestHandler.executeRequest(requestFn, '/test', 'GET', {
        enableRequestLogging: false,
      });

      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('should handle response logging options', async () => {
      const mockResponse = createMockResponse();
      const requestFn = jest
        .fn<RequestFunction>()
        .mockResolvedValueOnce(mockResponse);

      await requestHandler.executeRequest(requestFn, '/test', 'GET', {
        enableResponseLogging: false,
      });

      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('should handle custom request ID', async () => {
      const mockResponse = createMockResponse();
      const requestFn = jest
        .fn<RequestFunction>()
        .mockResolvedValueOnce(mockResponse);

      await requestHandler.executeRequest(requestFn, '/test', 'GET', {
        requestId: 'custom-id-123',
      });

      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('should handle performance monitoring options', async () => {
      const mockResponse = createMockResponse();
      const requestFn = jest
        .fn<RequestFunction>()
        .mockResolvedValueOnce(mockResponse);

      await requestHandler.executeRequest(requestFn, '/test', 'GET', {
        enablePerformanceMonitoring: true,
      });

      expect(requestFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('performance monitoring', () => {
    it('should provide performance metrics', () => {
      const metrics = requestHandler.getPerformanceMetrics();
      expect(metrics).toBeDefined();
    });

    it('should provide performance report', () => {
      const report = requestHandler.getPerformanceReport();
      expect(report).toBeDefined();
    });

    it('should reset performance metrics', () => {
      requestHandler.resetPerformanceMetrics();
      const metrics = requestHandler.getPerformanceMetrics();
      expect(metrics.requestCount).toBe(0);
    });

    it('should log performance summary', () => {
      expect(() => requestHandler.logPerformanceSummary()).not.toThrow();
    });
  });

  describe('global options', () => {
    it('should update global options', () => {
      const newOptions: Partial<RequestOptions> = {
        retries: 5,
        timeout: 60000,
      };

      requestHandler.updateGlobalOptions(newOptions);
      const globalOptions = requestHandler.getGlobalOptions();

      expect(globalOptions.retries).toBe(5);
      expect(globalOptions.timeout).toBe(60000);
    });

    it('should get global options', () => {
      const globalOptions = requestHandler.getGlobalOptions();
      expect(globalOptions).toBeDefined();
    });
  });

  describe('error classification', () => {
    it('should classify server errors correctly', async () => {
      const serverError = createMockAxiosError(500, 'Internal Server Error');
      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValue(serverError);

      await expect(
        requestHandler.executeRequest(requestFn, '/test', 'GET')
      ).rejects.toThrow(ServerError);
    });

    it('should classify rate limit errors correctly', async () => {
      const rateLimitError = createMockAxiosError(429, 'Too Many Requests');
      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValue(rateLimitError);

      await expect(
        requestHandler.executeRequest(requestFn, '/test', 'GET', { retries: 1 })
      ).rejects.toThrow(RateLimitError);
    });

    it('should handle client errors', async () => {
      const clientError = createMockAxiosError(400, 'Bad Request');
      const requestFn = jest
        .fn<RequestFunction>()
        .mockRejectedValueOnce(clientError);

      await expect(
        requestHandler.executeRequest(requestFn, '/test', 'GET')
      ).rejects.toThrow(AutotaskError);
    });
  });
});
