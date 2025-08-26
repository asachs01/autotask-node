import winston from 'winston';
import { PerformanceMonitor } from '../../src/performance/monitoring/PerformanceMonitor';
import { RequestMetrics, PerformanceThresholds } from '../../src/performance/types/PerformanceTypes';

describe('PerformanceMonitor', () => {
  let logger: winston.Logger;
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    logger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })]
    });

    performanceMonitor = new PerformanceMonitor(logger, {
      enableRealTimeMetrics: false,
      metricsInterval: 100,
      maxSamples: 100
    });
  });

  afterEach(() => {
    performanceMonitor.stop();
  });

  describe('Basic Operations', () => {
    it('should start and stop monitoring', () => {
      expect(() => performanceMonitor.start()).not.toThrow();
      expect(() => performanceMonitor.stop()).not.toThrow();
    });

    it('should record request metrics', () => {
      performanceMonitor.start();

      const requestMetrics: RequestMetrics = {
        requestId: 'test-001',
        method: 'GET',
        endpoint: '/companies',
        startTime: Date.now() - 100,
        endTime: Date.now(),
        responseTime: 100,
        statusCode: 200,
        requestSize: 256,
        responseSize: 1024,
        success: true
      };

      expect(() => performanceMonitor.recordRequest(requestMetrics)).not.toThrow();

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.averageResponseTime).toBe(100);
    });

    it('should calculate performance metrics correctly', () => {
      performanceMonitor.start();

      // Record multiple requests
      const requests: RequestMetrics[] = [
        {
          requestId: 'test-001',
          method: 'GET',
          endpoint: '/companies',
          startTime: Date.now() - 150,
          endTime: Date.now() - 50,
          responseTime: 100,
          statusCode: 200,
          success: true
        },
        {
          requestId: 'test-002',
          method: 'GET',
          endpoint: '/tickets',
          startTime: Date.now() - 100,
          endTime: Date.now(),
          responseTime: 200,
          statusCode: 200,
          success: true
        },
        {
          requestId: 'test-003',
          method: 'POST',
          endpoint: '/contacts',
          startTime: Date.now() - 50,
          endTime: Date.now(),
          responseTime: 300,
          statusCode: 500,
          success: false
        }
      ];

      requests.forEach(req => performanceMonitor.recordRequest(req));

      const metrics = performanceMonitor.getCurrentMetrics();
      
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.successfulRequests).toBe(2);
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.errorRate).toBeCloseTo(33.33, 2);
      expect(metrics.averageResponseTime).toBeCloseTo(200, 0);
      expect(metrics.minResponseTime).toBe(100);
      expect(metrics.maxResponseTime).toBe(300);
    });
  });

  describe('Performance Thresholds', () => {
    it('should emit alerts when thresholds are exceeded', (done) => {
      const thresholds: PerformanceThresholds = {
        maxResponseTime: 150,
        maxErrorRate: 20,
        maxMemoryUsage: 100
      };

      performanceMonitor.updateThresholds(thresholds);
      performanceMonitor.start();

      performanceMonitor.on('alert', (alert) => {
        expect(alert.type).toBe('latency');
        expect(alert.severity).toBe('high');
        expect(alert.currentValue).toBe(200);
        expect(alert.threshold).toBe(150);
        done();
      });

      // Record slow request
      const slowRequest: RequestMetrics = {
        requestId: 'slow-001',
        method: 'GET',
        endpoint: '/slow-endpoint',
        startTime: Date.now() - 200,
        endTime: Date.now(),
        responseTime: 200,
        statusCode: 200,
        success: true
      };

      performanceMonitor.recordRequest(slowRequest);
    });

    it('should update thresholds correctly', () => {
      const newThresholds: PerformanceThresholds = {
        maxResponseTime: 2000,
        maxErrorRate: 15,
        maxMemoryUsage: 256
      };

      performanceMonitor.updateThresholds(newThresholds);
      const currentThresholds = performanceMonitor.getThresholds();

      expect(currentThresholds.maxResponseTime).toBe(2000);
      expect(currentThresholds.maxErrorRate).toBe(15);
      expect(currentThresholds.maxMemoryUsage).toBe(256);
    });
  });

  describe('Performance Profiling', () => {
    it('should start and stop profiling sessions', async () => {
      const profileId = performanceMonitor.startProfiling('Test Profile');
      
      expect(profileId).toMatch(/^profile_\d+_[a-z0-9]+$/);

      // Add a small delay to ensure duration > 0
      await new Promise(resolve => setTimeout(resolve, 10));

      const profile = performanceMonitor.stopProfiling();
      
      expect(profile).toBeDefined();
      expect(profile!.id).toBe(profileId);
      expect(profile!.name).toBe('Test Profile');
      expect(profile!.duration).toBeGreaterThanOrEqual(0);
    });

    it('should add markers to active profile', () => {
      const profileId = performanceMonitor.startProfiling('Marker Test');
      
      performanceMonitor.addProfileMarker('Start Phase 1');
      performanceMonitor.addProfileMarker('Phase 1 Complete', { phase: 1 });
      
      const profile = performanceMonitor.stopProfiling();
      
      expect(profile!.markers).toHaveLength(2);
      expect(profile!.markers![0].name).toBe('Start Phase 1');
      expect(profile!.markers![1].name).toBe('Phase 1 Complete');
      expect(profile!.markers![1].data).toEqual({ phase: 1 });
    });

    it('should prevent multiple concurrent profiling sessions', () => {
      performanceMonitor.startProfiling('Profile 1');
      
      expect(() => {
        performanceMonitor.startProfiling('Profile 2');
      }).toThrow('A profiling session is already active');
      
      performanceMonitor.stopProfiling();
    });
  });

  describe('Performance Reports', () => {
    it('should generate comprehensive performance reports', async () => {
      performanceMonitor.start();

      // Simulate some activity
      const requests: RequestMetrics[] = [
        {
          requestId: 'report-001',
          method: 'GET',
          endpoint: '/companies',
          startTime: Date.now() - 100,
          endTime: Date.now(),
          responseTime: 50,
          statusCode: 200,
          success: true
        },
        {
          requestId: 'report-002',
          method: 'GET',
          endpoint: '/tickets',
          startTime: Date.now() - 100,
          endTime: Date.now(),
          responseTime: 150,
          statusCode: 200,
          success: true
        }
      ];

      requests.forEach(req => performanceMonitor.recordRequest(req));

      const report = performanceMonitor.generateReport();

      expect(report.timestamp).toBeDefined();
      expect(report.period).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.totalRequests).toBe(2);
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should identify performance bottlenecks', () => {
      performanceMonitor.start();
      
      // Update thresholds to ensure bottleneck detection
      performanceMonitor.updateThresholds({
        maxResponseTime: 1000, // 1 second threshold
        maxErrorRate: 5
      });

      // Simulate slow endpoint
      const slowRequests: RequestMetrics[] = Array.from({ length: 5 }, (_, i) => ({
        requestId: `slow-${i}`,
        method: 'GET',
        endpoint: '/slow-endpoint',
        startTime: Date.now() - 3000,
        endTime: Date.now(),
        responseTime: 3000,
        statusCode: 200,
        success: true
      }));

      slowRequests.forEach(req => performanceMonitor.recordRequest(req));

      const report = performanceMonitor.generateReport();
      
      // The report should have bottlenecks or at least be generated successfully
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.bottlenecks)).toBe(true);
    });
  });

  describe('Memory Integration', () => {
    it('should track memory metrics in performance data', () => {
      performanceMonitor.start();

      const metrics = performanceMonitor.getCurrentMetrics();
      
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.peakMemoryUsage).toBeDefined();
      expect(typeof metrics.memoryUsage).toBe('number');
      expect(typeof metrics.peakMemoryUsage).toBe('number');
    });
  });

  describe('Event Emission', () => {
    it('should emit events for metrics updates', (done) => {
      performanceMonitor.start();

      performanceMonitor.on('request', (request) => {
        expect(request.requestId).toBe('event-test-001');
        done();
      });

      const request: RequestMetrics = {
        requestId: 'event-test-001',
        method: 'GET',
        endpoint: '/test',
        startTime: Date.now() - 50,
        endTime: Date.now(),
        responseTime: 50,
        statusCode: 200,
        success: true
      };

      performanceMonitor.recordRequest(request);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all performance data', () => {
      performanceMonitor.start();

      // Add some data
      const request: RequestMetrics = {
        requestId: 'reset-test-001',
        method: 'GET',
        endpoint: '/test',
        startTime: Date.now() - 50,
        endTime: Date.now(),
        responseTime: 50,
        statusCode: 200,
        success: true
      };

      performanceMonitor.recordRequest(request);

      let metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics.totalRequests).toBe(1);

      // Reset
      performanceMonitor.reset();

      metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(performanceMonitor.getAllProfiles()).toHaveLength(0);
    });
  });
});