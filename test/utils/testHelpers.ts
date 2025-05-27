import { AxiosInstance } from 'axios';
import winston from 'winston';
import { RequestHandler } from '../../src/utils/requestHandler';

export function createMockAxios(): jest.Mocked<AxiosInstance> {
  return {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    request: jest.fn(),
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
    defaults: {},
    getUri: jest.fn(),
  } as any;
}

export function createMockLogger(): jest.Mocked<winston.Logger> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    silly: jest.fn(),
    log: jest.fn(),
  } as any;
}

export function createTestRequestHandler(
  axios: AxiosInstance, 
  logger: winston.Logger
): RequestHandler {
  return new RequestHandler(axios, logger, {
    retries: 0, // No retries for tests
    baseDelay: 0,
    timeout: 1000, // Short timeout for tests
    enableRequestLogging: false,
    enableResponseLogging: false,
  });
} 