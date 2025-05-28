import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import axios, { AxiosInstance } from 'axios';
import winston from 'winston';
import {
  AutotaskClient,
  PerformanceConfig,
} from '../../src/client/AutotaskClient';
import {
  PerformanceMonitor,
  RequestTiming,
} from '../../src/utils/performanceMonitor';
import {
  PaginationHandler,
  MemoryOptimizationConfig,
} from '../../src/utils/memoryOptimization';
import { RequestHandler } from '../../src/utils/requestHandler';

describe('Performance & Reliability Improvements', () => {
  let logger: winston.Logger;
  let mockAxios: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    logger = winston.createLogger({
      level: 'error', // Reduce noise in tests
      transports: [new winston.transports.Console({ silent: true })],
    });

    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      create: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PerformanceMonitor', () => {
    let performanceMonitor: PerformanceMonitor;

    beforeEach(() => {
      performanceMonitor = new PerformanceMonitor(logger);
    });

    it('should track request metrics correctly', () => {
      const timing: RequestTiming = {
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        duration: 1000,
        endpoint: '/test',
        method: 'GET',
        statusCode: 200,
        success: true,
      };

      performanceMonitor.recordRequest(timing);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.requestCount).toBe(1);
      expect(metrics.successCount).toBe(1);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.averageResponseTime).toBe(1000);
      expect(metrics.minResponseTime).toBe(1000);
      expect(metrics.maxResponseTime).toBe(1000);
    });

    it('should calculate error rates correctly', () => {
      // Add successful request
      performanceMonitor.recordRequest({
        startTime: Date.now() - 500,
        endTime: Date.now(),
        duration: 500,
        endpoint: '/test',
        method: 'GET',
        statusCode: 200,
        success: true,
      });

      // Add failed request
      performanceMonitor.recordRequest({
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        duration: 1000,
        endpoint: '/test',
        method: 'GET',
        statusCode: 500,
        success: false,
        error: 'Server error',
      });

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.requestCount).toBe(2);
      expect(metrics.successCount).toBe(1);
      expect(metrics.errorCount).toBe(1);
      expect(metrics.errorRate).toBe(50);
    });

    it('should generate detailed performance reports', () => {
      // Add multiple requests
      for (let i = 0; i < 10; i++) {
        performanceMonitor.recordRequest({
          startTime: Date.now() - i * 100,
          endTime: Date.now(),
          duration: i * 100,
          endpoint: '/test',
          method: 'GET',
          statusCode: 200,
          success: true,
        });
      }

      const report = performanceMonitor.getDetailedReport();
      expect(report.metrics.requestCount).toBe(10);
      expect(report.percentiles.p50).toBeGreaterThan(0);
      expect(report.percentiles.p95).toBeGreaterThan(0);
      expect(report.endpointStats['GET /test']).toBeDefined();
      expect(report.endpointStats['GET /test'].count).toBe(10);
    });

    it('should reset metrics correctly', () => {
      performanceMonitor.recordRequest({
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        duration: 1000,
        endpoint: '/test',
        method: 'GET',
        statusCode: 200,
        success: true,
      });

      expect(performanceMonitor.getMetrics().requestCount).toBe(1);

      performanceMonitor.reset();
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.requestCount).toBe(0);
      expect(metrics.successCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
    });
  });

  describe('PaginationHandler', () => {
    let paginationHandler: PaginationHandler;

    beforeEach(() => {
      paginationHandler = new PaginationHandler(mockAxios, logger);
    });

    it('should handle streaming pagination correctly', async () => {
      // Mock paginated responses
      mockAxios.get
        .mockResolvedValueOnce({
          data: { items: [{ id: 1 }, { id: 2 }] },
        })
        .mockResolvedValueOnce({
          data: { items: [{ id: 3 }, { id: 4 }] },
        })
        .mockResolvedValueOnce({
          data: { items: [] }, // Empty response to end pagination
        });

      const results: any[] = [];
      for await (const batch of paginationHandler.streamResults(
        '/test',
        {},
        2
      )) {
        results.push(...batch);
      }

      expect(results).toHaveLength(4);
      expect(results[0].id).toBe(1);
      expect(results[3].id).toBe(4);
      expect(mockAxios.get).toHaveBeenCalledTimes(3);
    });

    it('should fetch all results with optimization', async () => {
      mockAxios.get
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
        })
        .mockResolvedValueOnce({
          data: [],
        });

      const results = await paginationHandler.fetchAllOptimized<{ id: number }>(
        '/test',
        {},
        2
      );

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe(1);
      expect(results[1].id).toBe(2);
    });

    it('should process batches with callback function', async () => {
      mockAxios.get
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
        })
        .mockResolvedValueOnce({
          data: [],
        });

      const processor = jest.fn((batch: { id: number }[]) =>
        batch.map(item => ({ ...item, processed: true }))
      );

      const results = await paginationHandler.processBatches(
        '/test',
        processor,
        {},
        2
      );

      expect(results).toHaveLength(2);
      expect((results[0] as any).processed).toBe(true);
      expect(processor).toHaveBeenCalledTimes(1);
    });
  });

  describe('RequestHandler with Performance Monitoring', () => {
    let requestHandler: RequestHandler;

    beforeEach(() => {
      requestHandler = new RequestHandler(mockAxios, logger, {
        enablePerformanceMonitoring: true,
      });
    });

    it('should track performance metrics during requests', async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      await requestHandler.executeRequest(
        () => mockAxios.get('/test'),
        '/test',
        'GET'
      );

      const metrics = requestHandler.getPerformanceMetrics();
      expect(metrics.requestCount).toBe(1);
      expect(metrics.successCount).toBe(1);
      expect(metrics.errorCount).toBe(0);
    });

    it('should provide performance reports', async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      await requestHandler.executeRequest(
        () => mockAxios.get('/test'),
        '/test',
        'GET'
      );

      const report = requestHandler.getPerformanceReport();
      expect(report.metrics.requestCount).toBe(1);
      expect(report.endpointStats['GET /test']).toBeDefined();
    });
  });

  describe('AutotaskClient Performance Configuration', () => {
    it('should accept performance configuration', async () => {
      const performanceConfig: PerformanceConfig = {
        timeout: 15000,
        maxConcurrentRequests: 5,
        enableConnectionPooling: true,
        requestsPerSecond: 3,
      };

      // Mock the zone detection
      const mockZoneResponse = {
        data: { url: 'https://test.autotask.net/ATServicesRest/V1.0/' },
      };
      jest.spyOn(axios, 'get').mockResolvedValueOnce(mockZoneResponse);
      jest.spyOn(axios, 'create').mockReturnValueOnce(mockAxios);

      const client = await AutotaskClient.create(
        {
          username: 'test@example.com',
          integrationCode: 'TEST123',
          secret: 'secret123',
        },
        performanceConfig
      );

      const config = client.getPerformanceConfig();
      expect(config.timeout).toBe(15000);
      expect(config.maxConcurrentRequests).toBe(5);
      expect(config.requestsPerSecond).toBe(3);
    });

    it('should provide performance metrics', async () => {
      // Mock the zone detection
      const mockZoneResponse = {
        data: { url: 'https://test.autotask.net/ATServicesRest/V1.0/' },
      };
      jest.spyOn(axios, 'get').mockResolvedValueOnce(mockZoneResponse);
      jest.spyOn(axios, 'create').mockReturnValueOnce(mockAxios);

      const client = await AutotaskClient.create({
        username: 'test@example.com',
        integrationCode: 'TEST123',
        secret: 'secret123',
      });

      const metrics = client.getPerformanceMetrics();
      expect(metrics).toHaveProperty('rateLimiter');
      expect(metrics).toHaveProperty('connectionPooling');
      expect(metrics).toHaveProperty('timeouts');
      expect(metrics).toHaveProperty('limits');
    });
  });
});
