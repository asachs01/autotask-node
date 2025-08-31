/**
 * Tests for ErrorLogger
 */

import {
  ErrorLogger,
  LogLevel,
  LogDestination,
  LogContext,
  ConsoleLogHandler,
  FileLogHandler,
  ExternalLogHandler,
  defaultErrorLogger,
  LogErrors,
  withLoggingContext
} from '../../src/errors/ErrorLogger';
import { AutotaskError, AuthenticationError } from '../../src/errors/AutotaskErrors';
import { CircuitBreakerState, CircuitBreakerMetrics } from '../../src/errors/CircuitBreaker';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock fetch for external logging tests
(globalThis as any).fetch = jest.fn();

describe('ErrorLogger', () => {
  let logger: ErrorLogger;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;
  const testLogPath = './test-logs/test.log';

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    
    // Mock fs methods
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.appendFileSync.mockReturnValue(undefined);
    
    logger = new ErrorLogger({
      level: LogLevel.DEBUG,
      destinations: [LogDestination.CONSOLE]
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const defaultLogger = new ErrorLogger();
      const config = defaultLogger.getConfig();
      
      expect(config.level).toBe(LogLevel.INFO);
      expect(config.includeStackTrace).toBe(true);
      expect(config.destinations).toEqual([LogDestination.CONSOLE]);
      expect(config.jsonFormat).toBe(false);
    });

    it('should initialize with custom configuration', () => {
      const customLogger = new ErrorLogger({
        level: LogLevel.ERROR,
        includeStackTrace: false,
        destinations: [LogDestination.FILE, LogDestination.CONSOLE],
        filePath: './custom.log',
        jsonFormat: true,
        sensitiveFields: ['customSecret']
      });

      const config = customLogger.getConfig();
      expect(config.level).toBe(LogLevel.ERROR);
      expect(config.includeStackTrace).toBe(false);
      expect(config.destinations).toContain(LogDestination.FILE);
      expect(config.jsonFormat).toBe(true);
      expect(config.sensitiveFields).toContain('customSecret');
    });
  });

  describe('correlation ID generation', () => {
    it('should generate unique correlation IDs', () => {
      const id1 = logger.generateCorrelationId();
      const id2 = logger.generateCorrelationId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
    });

    it('should increment counter in correlation IDs', () => {
      const id1 = logger.generateCorrelationId();
      const id2 = logger.generateCorrelationId();
      
      const parts1 = id1.split('-');
      const parts2 = id2.split('-');
      
      expect(parseInt(parts2[1], 36)).toBeGreaterThan(parseInt(parts1[1], 36));
    });
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message', { operation: 'test' });
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG')
      );
    });

    it('should log info messages', () => {
      logger.info('Info message', { operation: 'test' });
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('INFO')
      );
    });

    it('should log warning messages', () => {
      const error = new Error('Test error');
      logger.warn('Warning message', error, { operation: 'test' });
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('WARN')
      );
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error message', error, { operation: 'test' });
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ERROR')
      );
    });

    it('should log fatal messages', () => {
      const error = new Error('Fatal error');
      logger.fatal('Fatal message', error, { operation: 'test' });
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('FATAL')
      );
    });

    it('should respect minimum log level', () => {
      const errorOnlyLogger = new ErrorLogger({
        level: LogLevel.ERROR,
        destinations: [LogDestination.CONSOLE]
      });

      errorOnlyLogger.debug('Debug message');
      errorOnlyLogger.info('Info message');
      errorOnlyLogger.warn('Warn message');
      errorOnlyLogger.error('Error message');

      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ERROR')
      );
    });
  });

  describe('error handling', () => {
    it('should log basic errors with stack trace', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('Error occurred');
      expect(logCall).toContain('Test error');
      expect(logCall).toContain('at '); // Stack trace indicator
    });

    it('should log AutotaskError with additional details', () => {
      const error = new AuthenticationError('Invalid credentials', {
        userId: 'user123', 
        action: 'login' 
      });
      
      logger.error('Authentication failed', error);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('Authentication failed');
      expect(logCall).toContain('Invalid credentials');
      // Check that the error details contain the context information  
      expect(logCall).toContain('userId');
    });

    it('should exclude stack trace when configured', () => {
      const noStackLogger = new ErrorLogger({
        includeStackTrace: false,
        destinations: [LogDestination.CONSOLE]
      });

      const error = new Error('Test error');
      noStackLogger.error('Error occurred', error);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).not.toContain('at ');
    });
  });

  describe('context enrichment', () => {
    it('should include context information in logs', () => {
      const context: LogContext = {
        correlationId: 'test-123',
        userId: 'user456',
        operation: 'getData',
        entityType: 'Company',
        performance: {
          startTime: Date.now(),
          duration: 150
        }
      };

      logger.info('Operation completed', context);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('test-123');
      expect(logCall).toContain('getData');
      expect(logCall).toContain('Company');
    });

    it('should generate correlation ID if not provided', () => {
      logger.info('Test message');
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toMatch(/\[[a-z0-9]+-[a-z0-9]+-[a-z0-9]+\]/);
    });
  });

  describe('sensitive data redaction', () => {
    it('should redact default sensitive fields', () => {
      const context = {
        password: 'secret123',
        apiKey: 'key456',
        authorization: 'Bearer token789',
        username: 'john_doe', // This should not be redacted
        operation: 'login'
      };

      logger.info('Login attempt', context);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).not.toContain('secret123');
      expect(logCall).not.toContain('key456');
      expect(logCall).not.toContain('token789');
      expect(logCall).toContain('john_doe');
    });

    it('should redact custom sensitive fields', () => {
      const customLogger = new ErrorLogger({
        sensitiveFields: ['customSecret', 'privateData'],
        destinations: [LogDestination.CONSOLE]
      });

      const context: LogContext = {
        metadata: {
          customSecret: 'secret123',
          privateData: 'private456',
          publicData: 'public789'
        }
      };

      customLogger.info('Test message', context);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).not.toContain('secret123');
      expect(logCall).not.toContain('private456');
      expect(logCall).toContain('public789');
    });

    it('should redact nested sensitive data', () => {
      const context = {
        request: {
          headers: {
            authorization: 'Bearer secret',
            'content-type': 'application/json'
          }
        },
        user: {
          id: 'user123',
          password: 'secret'
        }
      };

      logger.info('Request processed', context);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).not.toContain('Bearer secret');
      expect(logCall).toContain('application/json');
      expect(logCall).toContain('user123');
    });
  });

  describe('retry logging', () => {
    it('should log retry attempts with context', () => {
      const error = new Error('Network timeout');
      const retryInfo = {
        attempt: 2,
        maxAttempts: 3,
        nextDelay: 2000,
        totalTime: 3500
      };

      logger.logRetry('API call failed', error, retryInfo, { operation: 'getData' });
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('Retry attempt 2/3');
      expect(logCall).toContain('API call failed');
      expect(logCall).toContain('Network timeout');
      expect(logCall).toContain('getData');
    });
  });

  describe('circuit breaker logging', () => {
    it('should log circuit breaker state changes', () => {
      const metrics: CircuitBreakerMetrics = {
        state: CircuitBreakerState.OPEN,
        totalRequests: 100,
        successCount: 50,
        failureCount: 50,
        rejectedCount: 25,
        failureRate: 0.5,
        stateTransitions: 3,
        averageResponseTime: 250
      };

      const error = new Error('Service unavailable');
      logger.logCircuitBreakerStateChange(
        'api-service',
        'closed',
        'open',
        error,
        metrics
      );
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('Circuit breaker');
      expect(logCall).toContain('api-service');
      expect(logCall).toContain('closed');
      expect(logCall).toContain('open');
      expect(logCall).toContain('Service unavailable');
    });
  });

  describe('message truncation', () => {
    it('should truncate long messages', () => {
      const longMessage = 'A'.repeat(11000);
      const shortLogger = new ErrorLogger({
        maxLogSize: 100,
        destinations: [LogDestination.CONSOLE]
      });

      shortLogger.info(longMessage);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('A'.repeat(97) + '...');
      expect(logCall.length).toBeLessThan(longMessage.length);
    });
  });
});

describe('ConsoleLogHandler', () => {
  let handler: ConsoleLogHandler;
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should format logs in human-readable format by default', () => {
    handler = new ConsoleLogHandler(false);
    
    const entry = {
      timestamp: '2023-01-01T10:00:00.000Z',
      level: LogLevel.INFO,
      levelName: 'INFO',
      message: 'Test message',
      context: { correlationId: 'test-123' },
      executionTime: 100
    };

    handler.write(entry);
    
    const logCall = mockConsoleLog.mock.calls[0][0];
    expect(logCall).toContain('INFO [test-123]:');
    expect(logCall).toContain('Test message');
  });

  it('should format logs in JSON format when configured', () => {
    handler = new ConsoleLogHandler(true);
    
    const entry = {
      timestamp: '2023-01-01T10:00:00.000Z',
      level: LogLevel.INFO,
      levelName: 'INFO',
      message: 'Test message',
      context: { correlationId: 'test-123' }
    };

    handler.write(entry);
    
    expect(mockConsoleLog).toHaveBeenCalledWith(
      JSON.stringify(entry, null, 2)
    );
  });
});

describe('FileLogHandler', () => {
  let handler: FileLogHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.appendFileSync.mockReturnValue(undefined);
  });

  it('should create directory if it does not exist', async () => {
    handler = new FileLogHandler('./logs/test.log');
    
    const entry = {
      timestamp: '2023-01-01T10:00:00.000Z',
      level: LogLevel.INFO,
      levelName: 'INFO',
      message: 'Test message',
      context: {}
    };

    await handler.write(entry);
    
    expect(mockFs.mkdirSync).toHaveBeenCalledWith('./logs', { recursive: true });
  });

  it('should append JSON log entries to file', async () => {
    handler = new FileLogHandler('./logs/test.log', true);
    
    const entry = {
      timestamp: '2023-01-01T10:00:00.000Z',
      level: LogLevel.INFO,
      levelName: 'INFO',
      message: 'Test message',
      context: {}
    };

    await handler.write(entry);
    
    expect(mockFs.appendFileSync).toHaveBeenCalledWith(
      './logs/test.log',
      JSON.stringify(entry) + '\n'
    );
  });
});

describe('ExternalLogHandler', () => {
  let handler: ExternalLogHandler;
  const mockFetch = (globalThis as any).fetch as jest.MockedFunction<typeof globalThis.fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200
    } as any);
  });

  it('should send logs to external endpoint', async () => {
    handler = new ExternalLogHandler({
      endpoint: 'https://logs.example.com/api/logs',
      apiKey: 'test-key',
      service: 'custom'
    });

    const entry = {
      timestamp: '2023-01-01T10:00:00.000Z',
      level: LogLevel.INFO,
      levelName: 'INFO',
      message: 'Test message',
      context: {}
    };

    await handler.write(entry);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://logs.example.com/api/logs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        body: JSON.stringify(entry)
      }
    );
  });

  it('should handle Datadog specific headers', async () => {
    handler = new ExternalLogHandler({
      endpoint: 'https://http-intake.logs.datadoghq.com/v1/input/test',
      apiKey: 'datadog-key',
      service: 'datadog'
    });

    const entry = {
      timestamp: '2023-01-01T10:00:00.000Z',
      level: LogLevel.INFO,
      levelName: 'INFO',
      message: 'Test message',
      context: {}
    };

    await handler.write(entry);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'DD-API-KEY': 'datadog-key'
        })
      })
    );
  });

  it('should handle failed requests gracefully', async () => {
    const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500
    } as any);

    handler = new ExternalLogHandler({
      endpoint: 'https://logs.example.com/api/logs',
      apiKey: 'test-key'
    });

    const entry = {
      timestamp: '2023-01-01T10:00:00.000Z',
      level: LogLevel.INFO,
      levelName: 'INFO',
      message: 'Test message',
      context: {}
    };

    await handler.write(entry);

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'Failed to send log to external service: 500'
    );

    mockConsoleWarn.mockRestore();
  });

  it('should skip logging when endpoint or API key is missing', async () => {
    handler = new ExternalLogHandler({
      service: 'custom'
    });

    const entry = {
      timestamp: '2023-01-01T10:00:00.000Z',
      level: LogLevel.INFO,
      levelName: 'INFO',
      message: 'Test message',
      context: {}
    };

    await handler.write(entry);

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('LogErrors decorator', () => {
  let mockConsoleLog: jest.SpyInstance;
  let originalConfig: any;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    // Temporarily set default logger to debug level
    originalConfig = defaultErrorLogger.getConfig();
    defaultErrorLogger.updateConfig({ level: LogLevel.DEBUG });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Restore original config
    if (originalConfig) {
      defaultErrorLogger.updateConfig(originalConfig);
    }
  });

  it('should create a decorator function', () => {
    const decorator = LogErrors('Test message');
    expect(typeof decorator).toBe('function');
  });

  it('should wrap method with logging functionality', async () => {
    const decorator = LogErrors('Testing method execution');
    
    const originalMethod = async (param: string): Promise<string> => {
      return `result: ${param}`;
    };

    const mockDescriptor = {
      value: originalMethod,
      writable: true,
      enumerable: true,
      configurable: true
    };

    class TestClass {}
    const mockTarget = new TestClass();
    const propertyKey = 'testMethod';

    // Apply decorator
    decorator(mockTarget, propertyKey, mockDescriptor);

    // Call the wrapped method
    const result = await mockDescriptor.value('test');

    expect(result).toBe('result: test');
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Testing method execution')
    );
  });

  it('should log errors and rethrow them', async () => {
    const decorator = LogErrors('Testing error handling');
    
    const originalMethod = async (): Promise<void> => {
      throw new Error('Test error');
    };

    const mockDescriptor = {
      value: originalMethod,
      writable: true,
      enumerable: true,
      configurable: true
    };

    class TestClass {}
    const mockTarget = new TestClass();
    const propertyKey = 'throwingMethod';

    // Apply decorator
    decorator(mockTarget, propertyKey, mockDescriptor);

    // Call the wrapped method and expect error
    await expect(mockDescriptor.value()).rejects.toThrow('Test error');
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('ERROR')
    );
  });
});

describe('withLoggingContext', () => {
  let mockConsoleLog: jest.SpyInstance;
  let originalConfig: any;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    // Temporarily set default logger to debug level
    originalConfig = defaultErrorLogger.getConfig();
    defaultErrorLogger.updateConfig({ level: LogLevel.DEBUG });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Restore original config
    if (originalConfig) {
      defaultErrorLogger.updateConfig(originalConfig);
    }
  });

  it('should wrap operation with logging context', async () => {
    const result = await withLoggingContext(
      'test-operation',
      async (logger, correlationId) => {
        expect(logger).toBeDefined();
        expect(correlationId).toBeDefined();
        return 'success';
      },
      { entityType: 'Company' }
    );

    expect(result).toBe('success');
    expect(mockConsoleLog).toHaveBeenCalledTimes(2); // Start and completion
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Starting test-operation')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Completed test-operation')
    );
  });

  it('should log errors and rethrow them', async () => {
    await expect(
      withLoggingContext(
        'failing-operation',
        async () => {
          throw new Error('Operation failed');
        }
      )
    ).rejects.toThrow('Operation failed');

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Failed failing-operation')
    );
  });
});

describe('defaultErrorLogger', () => {
  it('should be available as singleton', () => {
    expect(defaultErrorLogger).toBeInstanceOf(ErrorLogger);
  });

  it('should have default configuration', () => {
    const config = defaultErrorLogger.getConfig();
    expect(config.level).toBe(LogLevel.INFO);
    expect(config.destinations).toEqual([LogDestination.CONSOLE]);
  });
});