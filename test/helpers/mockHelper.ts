import { jest } from '@jest/globals';
import { AxiosInstance, AxiosResponse } from 'axios';
import winston from 'winston';
import { RequestHandler } from '../../src/utils/requestHandler';
import { ApiResponse } from '../../src/types';

/**
 * Creates a properly mocked axios instance for entity testing
 */
export function createMockAxios(): jest.Mocked<AxiosInstance> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    request: jest.fn(),
    getUri: jest.fn(),
    defaults: {} as any,
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
        clear: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
        clear: jest.fn(),
      },
    },
  } as any;
}

/**
 * Creates a mock winston logger that silences all output during tests
 */
export function createMockLogger(): winston.Logger {
  return winston.createLogger({
    level: 'error',
    transports: [new winston.transports.Console({ silent: true })],
  });
}

/**
 * Creates a mock RequestHandler that bypasses all networking and returns controlled responses
 */
export function createMockRequestHandler(
  mockAxios: jest.Mocked<AxiosInstance>,
  mockLogger: winston.Logger
): jest.Mocked<RequestHandler> {
  const mockRequestHandler = {
    executeRequest: jest.fn(),
    getPerformanceMonitor: jest.fn(),
    getPerformanceMetrics: jest.fn(),
    getPerformanceReport: jest.fn(),
    resetPerformanceMetrics: jest.fn(),
    logPerformanceSummary: jest.fn(),
    updateGlobalOptions: jest.fn(),
    getGlobalOptions: jest.fn(),
    getCircuitBreakerMetrics: jest.fn(),
    getCircuitBreakerMetricsForEndpoint: jest.fn(),
    resetCircuitBreakerForEndpoint: jest.fn(),
    resetAllCircuitBreakers: jest.fn(),
    updateRetryStrategy: jest.fn(),
    getHealthStatus: jest.fn(),
    configureCircuitBreakerForEndpoint: jest.fn(),
  } as any;

  // Mock executeRequest to return properly formatted responses
  mockRequestHandler.executeRequest.mockImplementation(
    async <T>(
      requestFn: () => Promise<AxiosResponse<T>>,
      endpoint: string,
      method: string,
      options: any = {}
    ): Promise<AxiosResponse<T>> => {
      // Execute the request function to get the mocked response
      return await requestFn();
    }
  );

  return mockRequestHandler;
}

/**
 * Creates a standard mock response for successful API calls
 */
export function createMockResponse<T>(data: T, status: number = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {} as any,
    request: {},
  };
}

/**
 * Creates a mock response for Autotask API single item responses
 */
export function createMockItemResponse<T>(item: T, status: number = 200): AxiosResponse<{ item: T }> {
  return createMockResponse({ item }, status);
}

/**
 * Creates a mock response for Autotask API list responses
 */
export function createMockItemsResponse<T>(items: T[], status: number = 200): AxiosResponse<{ items: T[] }> {
  return createMockResponse({ items }, status);
}

/**
 * Creates a mock response for delete operations (typically empty response)
 */
export function createMockDeleteResponse(status: number = 200): AxiosResponse<{}> {
  return createMockResponse({}, status);
}

/**
 * Complete setup function that creates all mocks needed for entity testing
 */
export function setupEntityMocks() {
  const mockAxios = createMockAxios();
  const mockLogger = createMockLogger();
  const mockRequestHandler = createMockRequestHandler(mockAxios, mockLogger);

  return {
    mockAxios,
    mockLogger,
    mockRequestHandler,
  };
}

/**
 * Helper function to reset all mocks between tests
 */
export function resetAllMocks(mocks: ReturnType<typeof setupEntityMocks>): void {
  jest.clearAllMocks();
  
  // Reset specific mock implementations
  mocks.mockRequestHandler.executeRequest.mockImplementation(
    async <T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<AxiosResponse<T>> => {
      return await requestFn();
    }
  );
}

/**
 * Type-safe entity test setup helper
 */
export interface EntityTestSetup<T> {
  entity: T;
  mockAxios: jest.Mocked<AxiosInstance>;
  mockLogger: winston.Logger;
  mockRequestHandler: jest.Mocked<RequestHandler>;
}

/**
 * Factory function for creating entity instances with proper mocking
 */
export function createEntityTestSetup<T>(
  EntityClass: new (
    axios: AxiosInstance,
    logger: winston.Logger,
    requestHandler?: RequestHandler
  ) => T
): EntityTestSetup<T> {
  const { mockAxios, mockLogger, mockRequestHandler } = setupEntityMocks();
  
  const entity = new EntityClass(mockAxios, mockLogger, mockRequestHandler);

  return {
    entity,
    mockAxios,
    mockLogger,
    mockRequestHandler,
  };
}