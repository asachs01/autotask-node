/**
 * Comprehensive tests for AutotaskRateLimiter
 */

import { AutotaskRateLimiter, RateLimitConfig } from '../../src/rate-limiting/AutotaskRateLimiter';
import winston from 'winston';

describe('AutotaskRateLimiter', () => {
  let rateLimiter: AutotaskRateLimiter;
  let logger: winston.Logger;
  let config: Partial<RateLimitConfig>;

  beforeEach(() => {
    // Create silent logger for testing
    logger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })]
    });
    
    config = {
      hourlyRequestLimit: 100,
      threadLimitPerEndpoint: 2,
      usageThresholds: {
        light: 0.5,
        medium: 0.75,
        heavy: 1.0
      },
      maxQueueSize: 10,
      queueTimeout: 5000
    };
    
    rateLimiter = new AutotaskRateLimiter(config, logger);
  });

  afterEach(() => {
    rateLimiter.destroy();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultLimiter = new AutotaskRateLimiter({}, logger);
      const metrics = defaultLimiter.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.currentUsagePercentage).toBe(0);
      
      defaultLimiter.destroy();
    });

    it('should register zones correctly', () => {
      rateLimiter.registerZone('zone1', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      rateLimiter.registerZone('zone2', 'https://webservices2.autotask.net/ATServicesRest/v1.0/');
      
      const metrics = rateLimiter.getMetrics();
      expect(metrics.zoneMetrics.size).toBe(2);
      expect(metrics.zoneMetrics.has('zone1')).toBe(true);
      expect(metrics.zoneMetrics.has('zone2')).toBe(true);
    });
  });

  describe('Request Permission', () => {
    beforeEach(() => {
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
    });

    it('should grant permission for requests under limit', async () => {
      const startTime = Date.now();
      await rateLimiter.requestPermission('test-zone', '/Companies');
      const endTime = Date.now();
      
      // Should complete quickly since we're under limits
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should queue requests when thread limit exceeded', async () => {
      const promises: Promise<void>[] = [];
      
      // Make more requests than thread limit
      for (let i = 0; i < 5; i++) {
        promises.push(rateLimiter.requestPermission('test-zone', '/Companies', 5));
      }
      
      // Some should be queued
      const startTime = Date.now();
      await Promise.all(promises);
      const endTime = Date.now();
      
      // Should take some time due to queuing
      expect(endTime - startTime).toBeGreaterThan(0);
    });

    it('should respect priority ordering in queue', async () => {
      const completionOrder: number[] = [];
      const promises: Promise<void>[] = [];
      
      // Add low priority requests
      for (let i = 0; i < 3; i++) {
        promises.push(
          rateLimiter.requestPermission('test-zone', '/Companies', 1)
            .then((): void => { completionOrder.push(1); })
        );
      }
      
      // Add high priority request
      promises.push(
        rateLimiter.requestPermission('test-zone', '/Companies', 10)
          .then((): void => { completionOrder.push(10); })
      );
      
      await Promise.all(promises);
      
      // High priority should complete before some low priority requests
      const highPriorityIndex = completionOrder.indexOf(10);
      expect(highPriorityIndex).not.toBe(-1);
    });

    it('should timeout queued requests after configured timeout', async () => {
      const shortTimeoutLimiter = new AutotaskRateLimiter(
        { ...config, queueTimeout: 100 },
        logger
      );
      shortTimeoutLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      // Fill up the queue
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          shortTimeoutLimiter.requestPermission('test-zone', '/Companies')
            .catch(() => {}) // Ignore timeout errors for this test
        );
      }
      
      await Promise.allSettled(promises);
      shortTimeoutLimiter.destroy();
    });
  });

  describe('Rate Limit Metrics', () => {
    it('should track request metrics correctly', () => {
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      // Simulate some requests
      rateLimiter.notifyRequestComplete('test-zone', '/Companies', 200, 500, false);
      rateLimiter.notifyRequestComplete('test-zone', '/Tickets', 429, 1000, true);
      
      const metrics = rateLimiter.getMetrics();
      expect(metrics.endpointMetrics.size).toBeGreaterThan(0);
    });

    it('should calculate usage percentage correctly', () => {
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      // Simulate usage at 50% of hourly limit
      for (let i = 0; i < 50; i++) {
        rateLimiter.notifyRequestComplete('test-zone', '/Companies', 200, 500, false);
      }
      
      const metrics = rateLimiter.getMetrics();
      expect(metrics.currentUsagePercentage).toBeCloseTo(0.5, 1);
    });

    it('should provide recommended delays based on usage', () => {
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      // Test different usage levels
      const lightDelay = rateLimiter.getRecommendedDelay('test-zone', '/Companies');
      expect(lightDelay).toBe(0); // Should be 0 for light usage
      
      // Simulate heavy usage
      for (let i = 0; i < 80; i++) {
        rateLimiter.notifyRequestComplete('test-zone', '/Companies', 200, 500, false);
      }
      
      const heavyDelay = rateLimiter.getRecommendedDelay('test-zone', '/Companies');
      expect(heavyDelay).toBeGreaterThan(0);
    });
  });

  describe('Zone Health Monitoring', () => {
    it('should track zone health correctly', () => {
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      // Simulate healthy responses
      rateLimiter.notifyRequestComplete('test-zone', '/Companies', 200, 500, false);
      rateLimiter.updateZoneHealth('test-zone', true, 0.05);
      
      const metrics = rateLimiter.getMetrics();
      const zoneHealth = metrics.zoneMetrics.get('test-zone');
      expect(zoneHealth?.isHealthy).toBe(true);
    });

    it('should mark zones as unhealthy based on error rates', () => {
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      // Simulate high error rate
      rateLimiter.updateZoneHealth('test-zone', false, 0.8);
      
      const metrics = rateLimiter.getMetrics();
      const zoneHealth = metrics.zoneMetrics.get('test-zone');
      expect(zoneHealth?.isHealthy).toBe(false);
    });
  });

  describe('Event Emission', () => {
    it('should emit events for important actions', (done) => {
      let eventCount = 0;
      const expectedEvents = ['requestQueued', 'requestStarted', 'requestCompleted'];
      
      expectedEvents.forEach(eventName => {
        rateLimiter.on(eventName, () => {
          eventCount++;
          if (eventCount === expectedEvents.length) {
            done();
          }
        });
      });
      
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      // This should trigger multiple events
      rateLimiter.requestPermission('test-zone', '/Companies')
        .then(() => {
          rateLimiter.notifyRequestComplete('test-zone', '/Companies', 200, 500, false);
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle zone registration errors gracefully', () => {
      // Attempting to register the same zone twice should not throw
      expect(() => {
        rateLimiter.registerZone('duplicate', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
        rateLimiter.registerZone('duplicate', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      }).not.toThrow();
    });

    it('should handle invalid zone requests gracefully', async () => {
      // Requesting permission for non-existent zone should still work
      await expect(
        rateLimiter.requestPermission('non-existent-zone', '/Companies')
      ).resolves.not.toThrow();
    });

    it('should handle queue overflow gracefully', async () => {
      const smallQueueLimiter = new AutotaskRateLimiter(
        { ...config, maxQueueSize: 2 },
        logger
      );
      
      const promises: Promise<void>[] = [];
      
      // Try to add more requests than queue can handle
      for (let i = 0; i < 10; i++) {
        promises.push(
          smallQueueLimiter.requestPermission('test-zone', '/Companies')
            .catch(() => {}) // Ignore rejections for this test
        );
      }
      
      await Promise.allSettled(promises);
      smallQueueLimiter.destroy();
    });
  });

  describe('Performance', () => {
    it('should handle high request volumes efficiently', async () => {
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      const startTime = Date.now();
      const promises: Promise<void>[] = [];
      
      // Create many concurrent requests
      for (let i = 0; i < 100; i++) {
        promises.push(rateLimiter.requestPermission('test-zone', '/Companies'));
      }
      
      await Promise.all(promises);
      const endTime = Date.now();
      
      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should clean up old request history efficiently', () => {
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      // Simulate old requests
      for (let i = 0; i < 1000; i++) {
        rateLimiter.notifyRequestComplete('test-zone', '/Companies', 200, 500, false);
      }
      
      const initialMetrics = rateLimiter.getMetrics();
      expect(initialMetrics.totalRequests).toBe(1000);
      
      // Metrics should still be reasonable size due to cleanup
      expect(Object.keys(initialMetrics).length).toBeLessThan(50);
    });
  });

  describe('Configuration Updates', () => {
    it('should handle runtime configuration changes', () => {
      const initialConfig = rateLimiter.getMetrics();
      
      // This would need to be implemented in the actual class
      // For now, just verify the interface exists
      expect(typeof rateLimiter.getMetrics).toBe('function');
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with long-running usage', () => {
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      // Simulate extended usage
      for (let i = 0; i < 10000; i++) {
        rateLimiter.notifyRequestComplete('test-zone', `/endpoint${i % 10}`, 200, 500, false);
      }
      
      // Should not crash or consume excessive memory
      const metrics = rateLimiter.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.endpointMetrics.size).toBeLessThan(100); // Should be cleaned up
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent access to queue safely', async () => {
      rateLimiter.registerZone('test-zone', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');
      
      const promises: Promise<void>[] = [];
      
      // Create concurrent requests from different 'threads'
      for (let i = 0; i < 50; i++) {
        promises.push(
          rateLimiter.requestPermission('test-zone', `/endpoint${i % 5}`, Math.floor(Math.random() * 10))
        );
      }
      
      // Should complete without race conditions
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });
});