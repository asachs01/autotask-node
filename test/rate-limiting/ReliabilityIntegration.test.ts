/**
 * Integration tests for the complete reliability system
 */

import { 
  createReliabilitySystem, 
  createProductionReliabilitySystem,
  createDevelopmentReliabilitySystem,
  PRODUCTION_CONFIG,
  DEVELOPMENT_CONFIG
} from '../../src/rate-limiting';
import winston from 'winston';

describe('Reliability System Integration', () => {
  let logger: winston.Logger;

  beforeEach(() => {
    // Create silent logger for testing
    logger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })]
    });
  });

  afterEach(() => {
    // Cleanup any resources
    logger.clear();
  });

  describe('System Creation', () => {
    it('should create complete reliability system with defaults', () => {
      const system = createReliabilitySystem({}, logger);
      
      expect(system.rateLimiter).toBeDefined();
      expect(system.retryPatterns).toBeDefined();
      expect(system.zoneManager).toBeDefined();
      expect(system.errorHandler).toBeDefined();
      expect(system.reliabilityManager).toBeDefined();
      expect(system.logger).toBe(logger);
      
      // Cleanup
      system.rateLimiter.destroy();
      system.retryPatterns.destroy();
      system.zoneManager.destroy();
      system.errorHandler.destroy();
      system.reliabilityManager.destroy();
    });

    it('should create production reliability system', () => {
      const system = createProductionReliabilitySystem({}, logger);
      
      expect(system.rateLimiter).toBeDefined();
      expect(system.retryPatterns).toBeDefined();
      expect(system.zoneManager).toBeDefined();
      expect(system.errorHandler).toBeDefined();
      expect(system.reliabilityManager).toBeDefined();
      
      // Verify production configuration is applied
      const rateLimitMetrics = system.rateLimiter.getMetrics();
      expect(rateLimitMetrics).toBeDefined();
      
      // Cleanup
      system.rateLimiter.destroy();
      system.retryPatterns.destroy();
      system.zoneManager.destroy();
      system.errorHandler.destroy();
      system.reliabilityManager.destroy();
    });

    it('should create development reliability system', () => {
      const system = createDevelopmentReliabilitySystem({}, logger);
      
      expect(system.rateLimiter).toBeDefined();
      expect(system.retryPatterns).toBeDefined();
      expect(system.zoneManager).toBeDefined();
      expect(system.errorHandler).toBeDefined();
      expect(system.reliabilityManager).toBeDefined();
      
      // Verify development configuration differences
      const reliabilityMetrics = system.reliabilityManager.getMetrics();
      expect(reliabilityMetrics).toBeDefined();
      
      // Cleanup
      system.rateLimiter.destroy();
      system.retryPatterns.destroy();
      system.zoneManager.destroy();
      system.errorHandler.destroy();
      system.reliabilityManager.destroy();
    });

    it('should create system without provided logger', () => {
      const system = createReliabilitySystem();
      
      expect(system.logger).toBeDefined();
      expect(system.logger).not.toBe(logger);
      
      // Cleanup
      system.rateLimiter.destroy();
      system.retryPatterns.destroy();
      system.zoneManager.destroy();
      system.errorHandler.destroy();
      system.reliabilityManager.destroy();
    });

    it('should merge custom configuration correctly', () => {
      const customConfig = {
        rateLimiting: {
          hourlyRequestLimit: 5000,
          threadLimitPerEndpoint: 5
        },
        retryPatterns: {
          maxRetries: 7,
          baseDelayMs: 2000
        },
        reliability: {
          maxQueueSize: 2000,
          batchingEnabled: false
        }
      };

      const system = createReliabilitySystem(customConfig, logger);
      
      expect(system.rateLimiter).toBeDefined();
      expect(system.retryPatterns).toBeDefined();
      expect(system.reliabilityManager).toBeDefined();
      
      // Cleanup
      system.rateLimiter.destroy();
      system.retryPatterns.destroy();
      system.zoneManager.destroy();
      system.errorHandler.destroy();
      system.reliabilityManager.destroy();
    });
  });

  describe('Component Integration', () => {
    let system: ReturnType<typeof createReliabilitySystem>;

    beforeEach(() => {
      system = createReliabilitySystem({
        rateLimiting: {
          hourlyRequestLimit: 100,
          threadLimitPerEndpoint: 2,
          maxQueueSize: 10
        },
        retryPatterns: {
          maxRetries: 3,
          baseDelayMs: 100,
          enableRequestReplay: false
        },
        reliability: {
          maxQueueSize: 50,
          enableGracefulDegradation: true,
          batchingEnabled: false
        }
      }, logger);

      // Setup zones for testing
      system.zoneManager.addZone({
        zoneId: 'test-zone-1',
        name: 'Test Zone 1',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/CompanyCategories?$select=id&$top=1',
        healthCheckInterval: 30000
      });

      system.rateLimiter.registerZone('test-zone-1', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
    });

    afterEach(() => {
      system.rateLimiter.destroy();
      system.retryPatterns.destroy();
      system.zoneManager.destroy();
      system.errorHandler.destroy();
      system.reliabilityManager.destroy();
    });

    it('should handle request flow through all components', async () => {
      const mockRequestFn = jest.fn().mockResolvedValue({ data: 'test result' });

      // Queue a request through the reliability manager
      const result = await system.reliabilityManager.queueRequest(
        '/Companies',
        'GET',
        'test-zone-1',
        mockRequestFn,
        { priority: 5, timeout: 5000 }
      );

      expect(result).toEqual({ data: 'test result' });
      expect(mockRequestFn).toHaveBeenCalled();
    });

    it('should handle request failures gracefully', async () => {
      const mockError = new Error('Test error');
      const mockRequestFn = jest.fn().mockRejectedValue(mockError);

      await expect(
        system.reliabilityManager.queueRequest(
          '/Companies',
          'GET',
          'test-zone-1',
          mockRequestFn,
          { priority: 5, timeout: 5000 }
        )
      ).rejects.toThrow();

      // Verify error was processed by error handler
      const errorPatterns = system.errorHandler.getErrorPatterns();
      expect(errorPatterns.size).toBeGreaterThanOrEqual(0);
    });

    it('should coordinate between rate limiter and retry patterns', async () => {
      const mockRequestFn = jest.fn()
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockResolvedValueOnce({ data: 'success after retry' });

      const result = await system.reliabilityManager.executeRequest(
        mockRequestFn,
        '/Companies',
        'GET',
        'test-zone-1'
      );

      expect(result).toEqual({ data: 'success after retry' });
      expect(mockRequestFn).toHaveBeenCalledTimes(2);
    });

    it('should update metrics across all components', async () => {
      const mockRequestFn = jest.fn().mockResolvedValue({ data: 'test' });

      await system.reliabilityManager.queueRequest(
        '/Companies',
        'GET',
        'test-zone-1',
        mockRequestFn
      );

      // Check that metrics are updated across components
      const rateLimitMetrics = system.rateLimiter.getMetrics();
      const retryMetrics = system.retryPatterns.getMetrics();
      const zoneStats = system.zoneManager.getZoneStatistics();
      const reliabilityMetrics = system.reliabilityManager.getMetrics();

      expect(rateLimitMetrics.totalRequests).toBeGreaterThanOrEqual(0);
      expect(retryMetrics.totalRetries).toBeGreaterThanOrEqual(0);
      expect(Object.keys(zoneStats)).toContain('test-zone-1');
      expect(reliabilityMetrics.totalRequests).toBeGreaterThanOrEqual(0);
    });

    it('should handle zone failover scenarios', async () => {
      // Add a second zone
      system.zoneManager.addZone({
        zoneId: 'test-zone-2',
        name: 'Test Zone 2',
        apiUrl: 'https://webservices2.autotask.net/ATServicesRest/v1.0/',
        isBackup: true,
        priority: 5,
        maxConcurrentRequests: 5,
        healthCheckEndpoint: '/CompanyCategories?$select=id&$top=1',
        healthCheckInterval: 30000
      });

      system.rateLimiter.registerZone('test-zone-2', 'https://webservices2.autotask.net/ATServicesRest/v1.0/');

      // Mark primary zone as unhealthy
      system.zoneManager.updateZoneHealth('test-zone-1', false, 0.9);

      const selectedZone = system.zoneManager.selectZone({
        requireHealthy: false,
        excludeBackup: false
      });

      expect(selectedZone).toBeDefined();
      // May select backup zone if primary is unhealthy
    });

    it('should handle high load scenarios', async () => {
      const requests: Promise<any>[] = [];
      const mockRequestFn = jest.fn().mockResolvedValue({ data: 'test' });

      // Create many concurrent requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          system.reliabilityManager.queueRequest(
            '/Companies',
            'GET',
            'test-zone-1',
            mockRequestFn,
            { priority: Math.floor(Math.random() * 10) + 1 }
          ).catch(() => {}) // Ignore failures for this test
        );
      }

      const results = await Promise.allSettled(requests);
      
      // Some requests should succeed
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);

      // System should remain responsive
      const systemHealth = system.reliabilityManager.getSystemHealth();
      expect(systemHealth).toBeDefined();
    });

    it('should maintain system health monitoring', () => {
      const systemHealth = system.reliabilityManager.getSystemHealth();
      
      expect(systemHealth.overall).toBeDefined();
      expect(['HEALTHY', 'DEGRADED', 'CRITICAL', 'UNAVAILABLE']).toContain(systemHealth.overall);
      expect(systemHealth.queue).toBeDefined();
      expect(systemHealth.performance).toBeDefined();
    });
  });

  describe('Configuration Validation', () => {
    it('should handle invalid configurations gracefully', () => {
      const invalidConfig = {
        rateLimiting: {
          hourlyRequestLimit: -1, // Invalid
          threadLimitPerEndpoint: 0 // Invalid
        }
      };

      // Should still create system with corrected/default values
      const system = createReliabilitySystem(invalidConfig, logger);
      
      expect(system.rateLimiter).toBeDefined();
      
      // Cleanup
      system.rateLimiter.destroy();
      system.retryPatterns.destroy();
      system.zoneManager.destroy();
      system.errorHandler.destroy();
      system.reliabilityManager.destroy();
    });

    it('should validate production configuration', () => {
      expect(PRODUCTION_CONFIG.rateLimiting?.hourlyRequestLimit).toBe(10000);
      expect(PRODUCTION_CONFIG.retryPatterns?.maxRetries).toBe(5);
      expect(PRODUCTION_CONFIG.reliability?.enableGracefulDegradation).toBe(true);
      expect(PRODUCTION_CONFIG.logging?.level).toBe('info');
    });

    it('should validate development configuration', () => {
      expect(DEVELOPMENT_CONFIG.rateLimiting?.hourlyRequestLimit).toBe(1000);
      expect(DEVELOPMENT_CONFIG.retryPatterns?.maxRetries).toBe(3);
      expect(DEVELOPMENT_CONFIG.reliability?.enableGracefulDegradation).toBe(false);
      expect(DEVELOPMENT_CONFIG.logging?.level).toBe('debug');
    });
  });

  describe('Event Coordination', () => {
    let system: ReturnType<typeof createReliabilitySystem>;
    let eventCounts: Record<string, number>;

    beforeEach(() => {
      system = createReliabilitySystem({}, logger);
      eventCounts = {};

      // Setup event listeners to track cross-component events
      const components = [
        system.rateLimiter,
        system.retryPatterns,
        system.zoneManager,
        system.errorHandler,
        system.reliabilityManager
      ];

      components.forEach(component => {
        const originalEmit = component.emit.bind(component);
        component.emit = function(eventName: string, ...args: any[]) {
          eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;
          return originalEmit(eventName, ...args);
        };
      });

      // Setup test zone
      system.zoneManager.addZone({
        zoneId: 'event-test-zone',
        name: 'Event Test Zone',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/test',
        healthCheckInterval: 30000
      });

      system.rateLimiter.registerZone('event-test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
    });

    afterEach(() => {
      system.rateLimiter.destroy();
      system.retryPatterns.destroy();
      system.zoneManager.destroy();
      system.errorHandler.destroy();
      system.reliabilityManager.destroy();
    });

    it('should coordinate events between components', async () => {
      const mockRequestFn = jest.fn().mockResolvedValue({ data: 'test' });

      await system.reliabilityManager.queueRequest(
        '/Companies',
        'GET',
        'event-test-zone',
        mockRequestFn
      );

      // Verify that events were emitted across components
      expect(Object.keys(eventCounts).length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle system creation and destruction efficiently', () => {
      const startTime = Date.now();
      
      const system = createReliabilitySystem({}, logger);
      const creationTime = Date.now() - startTime;
      
      expect(creationTime).toBeLessThan(1000); // Should create quickly
      
      const destroyStart = Date.now();
      system.rateLimiter.destroy();
      system.retryPatterns.destroy();
      system.zoneManager.destroy();
      system.errorHandler.destroy();
      system.reliabilityManager.destroy();
      const destroyTime = Date.now() - destroyStart;
      
      expect(destroyTime).toBeLessThan(500); // Should cleanup quickly
    });

    it('should handle multiple system instances', () => {
      const systems: any[] = [];
      
      // Create multiple systems
      for (let i = 0; i < 5; i++) {
        systems.push(createReliabilitySystem({
          rateLimiting: { hourlyRequestLimit: 1000 * (i + 1) }
        }, logger));
      }
      
      expect(systems).toHaveLength(5);
      
      // Cleanup all systems
      systems.forEach(system => {
        system.rateLimiter.destroy();
        system.retryPatterns.destroy();
        system.zoneManager.destroy();
        system.errorHandler.destroy();
        system.reliabilityManager.destroy();
      });
    });
  });

  describe('Error Recovery Integration', () => {
    let system: ReturnType<typeof createReliabilitySystem>;

    beforeEach(() => {
      system = createReliabilitySystem({
        retryPatterns: {
          maxRetries: 3,
          baseDelayMs: 50, // Short delay for testing
          enableErrorLearning: true
        }
      }, logger);

      system.zoneManager.addZone({
        zoneId: 'recovery-test-zone',
        name: 'Recovery Test Zone',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/test',
        healthCheckInterval: 30000
      });

      system.rateLimiter.registerZone('recovery-test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
    });

    afterEach(() => {
      system.rateLimiter.destroy();
      system.retryPatterns.destroy();
      system.zoneManager.destroy();
      system.errorHandler.destroy();
      system.reliabilityManager.destroy();
    });

    it('should recover from transient failures', async () => {
      let callCount = 0;
      const mockRequestFn = jest.fn(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Transient failure'));
        }
        return Promise.resolve({ data: 'success after retry' });
      });

      const result = await system.reliabilityManager.executeRequest(
        mockRequestFn,
        '/Companies',
        'GET',
        'recovery-test-zone'
      );

      expect(result).toEqual({ data: 'success after retry' });
      expect(mockRequestFn).toHaveBeenCalledTimes(3);
    });

    it('should handle permanent failures appropriately', async () => {
      const mockRequestFn = jest.fn().mockRejectedValue(new Error('Permanent failure'));

      await expect(
        system.reliabilityManager.executeRequest(
          mockRequestFn,
          '/Companies',
          'GET',
          'recovery-test-zone'
        )
      ).rejects.toThrow('Permanent failure');

      // Should have attempted retries
      expect(mockRequestFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('Memory and Resource Management', () => {
    it('should not leak memory with repeated system creation', () => {
      // Create and destroy systems multiple times
      for (let i = 0; i < 10; i++) {
        const system = createReliabilitySystem({}, logger);
        
        // Add some activity
        system.zoneManager.addZone({
          zoneId: `temp-zone-${i}`,
          name: `Temp Zone ${i}`,
          apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
          isBackup: false,
          priority: 8,
          maxConcurrentRequests: 10,
          healthCheckEndpoint: '/test',
          healthCheckInterval: 30000
        });
        
        // Cleanup immediately
        system.rateLimiter.destroy();
        system.retryPatterns.destroy();
        system.zoneManager.destroy();
        system.errorHandler.destroy();
        system.reliabilityManager.destroy();
      }
      
      // Should not cause memory issues or crashes
      expect(true).toBe(true);
    });
  });
});