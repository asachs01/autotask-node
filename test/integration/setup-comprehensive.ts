/**
 * Comprehensive Integration Test Setup
 * 
 * This setup file configures the test environment for comprehensive integration testing,
 * including custom matchers and performance monitoring utilities.
 */

import winston from 'winston';

// Extend Jest matchers for comprehensive testing
expect.extend({
  toBeWithinPerformanceThreshold(received: number, threshold: number) {
    const pass = received <= threshold;
    if (pass) {
      return {
        message: () => `expected ${received}ms not to be within performance threshold ${threshold}ms`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received}ms to be within performance threshold ${threshold}ms`,
        pass: false,
      };
    }
  },

  toHaveValidAutotaskResponse(received: any) {
    const hasData = received && received.data;
    const hasItem = hasData && (received.data.item || received.data.items);
    
    const pass = hasData && hasItem;
    
    if (pass) {
      return {
        message: () => `expected response not to have valid Autotask structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected response to have valid Autotask structure with data.item or data.items`,
        pass: false,
      };
    }
  },

  toHaveRateLimitHeaders(received: any) {
    const headers = received?.response?.headers || received?.headers || {};
    const hasRateLimitHeaders = 
      headers['x-ratelimit-limit'] &&
      headers['x-ratelimit-remaining'] &&
      headers['x-ratelimit-reset'];

    const pass = Boolean(hasRateLimitHeaders);
    
    if (pass) {
      return {
        message: () => `expected response not to have rate limit headers`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected response to have rate limit headers (x-ratelimit-*)`,
        pass: false,
      };
    }
  },

  toBeValidEntity(received: any) {
    const hasId = received && typeof received.id === 'number' && received.id > 0;
    const hasTimestamp = received && (
      received.createDate || 
      received.createdDate || 
      received.createDateTime ||
      received.lastModifiedDate ||
      received.lastModifiedDateTime
    );

    const pass = hasId && hasTimestamp;
    
    if (pass) {
      return {
        message: () => `expected entity not to be valid`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected entity to have valid id (number > 0) and timestamp fields`,
        pass: false,
      };
    }
  },

  toHandleErrorGracefully(received: Promise<any>) {
    return received.then(
      (result) => ({
        message: () => `expected promise to be rejected but it resolved with ${result}`,
        pass: false,
      }),
      (error) => {
        const hasErrorStructure = error && (
          error.response || 
          error.message ||
          error.code
        );

        const isHandledGracefully = hasErrorStructure && !error.stack?.includes('Unhandled');

        if (isHandledGracefully) {
          return {
            message: () => `expected error not to be handled gracefully`,
            pass: true,
          };
        } else {
          return {
            message: () => `expected error to be handled gracefully with proper structure`,
            pass: false,
          };
        }
      }
    );
  }
});

// Global test configuration
const testConfig = {
  performanceThresholds: {
    create: 3000,    // 3 seconds
    read: 1500,      // 1.5 seconds
    update: 3000,    // 3 seconds
    delete: 1500,    // 1.5 seconds
    list: 3000,      // 3 seconds
    concurrent: 15000 // 15 seconds for concurrent ops
  },
  
  loadTestConfig: {
    maxConcurrentRequests: 10,
    maxTotalRequests: 25,
    expectedSuccessRate: 0.7, // 70%
    maxAverageResponseTime: 2500 // 2.5 seconds
  },

  mockServerConfig: {
    port: parseInt(process.env.MOCK_SERVER_PORT || '3001'),
    errorRate: 0.05, // 5%
    rateLimitPerHour: 100,
    rateLimitPerSecond: 5
  }
};

// Make test config available globally
(global as any).__COMPREHENSIVE_TEST_CONFIG__ = testConfig;

// Setup logger for comprehensive tests
const comprehensiveLogger = winston.createLogger({
  level: process.env.DEBUG_INTEGRATION_TESTS ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `[${timestamp}] ${level}: ${message} ${metaStr}`;
        })
      )
    }),
    new winston.transports.File({
      filename: './test/integration/logs/comprehensive-tests.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

(global as any).__COMPREHENSIVE_LOGGER__ = comprehensiveLogger;

// Performance tracking utilities
const performanceTracker = {
  operations: new Map<string, number[]>(),
  
  startTimer: (operation: string) => {
    const start = Date.now();
    return {
      end: () => {
        const duration = Date.now() - start;
        if (!performanceTracker.operations.has(operation)) {
          performanceTracker.operations.set(operation, []);
        }
        performanceTracker.operations.get(operation)!.push(duration);
        return duration;
      }
    };
  },
  
  getStats: (operation: string) => {
    const durations = performanceTracker.operations.get(operation) || [];
    if (durations.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 };
    }
    
    return {
      count: durations.length,
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations)
    };
  },
  
  getAllStats: () => {
    const stats: Record<string, any> = {};
    for (const [operation, durations] of performanceTracker.operations) {
      stats[operation] = performanceTracker.getStats(operation);
    }
    return stats;
  }
};

(global as any).__PERFORMANCE_TRACKER__ = performanceTracker;

// Test result collector
const testResultCollector = {
  results: {
    total: 0,
    passed: 0,
    failed: 0,
    performance: [] as Array<{
      operation: string;
      duration: number;
      threshold: number;
      passed: boolean;
    }>
  },
  
  recordTest: (passed: boolean) => {
    testResultCollector.results.total++;
    if (passed) {
      testResultCollector.results.passed++;
    } else {
      testResultCollector.results.failed++;
    }
  },
  
  recordPerformance: (operation: string, duration: number, threshold: number) => {
    const passed = duration <= threshold;
    testResultCollector.results.performance.push({
      operation,
      duration,
      threshold,
      passed
    });
  },
  
  getSummary: () => {
    const performancePassed = testResultCollector.results.performance.filter(p => p.passed).length;
    const performanceTotal = testResultCollector.results.performance.length;
    
    return {
      ...testResultCollector.results,
      successRate: testResultCollector.results.total > 0 ? 
        (testResultCollector.results.passed / testResultCollector.results.total) * 100 : 0,
      performanceSuccessRate: performanceTotal > 0 ? 
        (performancePassed / performanceTotal) * 100 : 0
    };
  }
};

(global as any).__TEST_RESULT_COLLECTOR__ = testResultCollector;

comprehensiveLogger.info('Comprehensive integration test setup completed', {
  config: testConfig,
  environment: {
    nodeVersion: process.version,
    platform: process.platform,
    debugEnabled: Boolean(process.env.DEBUG_INTEGRATION_TESTS)
  }
});

// Declare custom matcher types for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinPerformanceThreshold(threshold: number): R;
      toHaveValidAutotaskResponse(): R;
      toHaveRateLimitHeaders(): R;
      toBeValidEntity(): R;
      toHandleErrorGracefully(): Promise<R>;
    }
  }
}