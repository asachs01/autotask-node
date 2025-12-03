/**
 * Environment setup for enhanced integration tests
 */

// Load environment variables from .env.test
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Set default Node.js options for integration tests
process.env.NODE_OPTIONS =
  process.env.NODE_OPTIONS || '--max-old-space-size=4096';

// Configure test timeouts
process.env.JEST_TIMEOUT = process.env.JEST_TIMEOUT || '60000';

// Enable enhanced logging for integration tests
if (process.env.DEBUG_INTEGRATION_TESTS === 'true') {
  process.env.LOG_LEVEL = 'debug';
}

// Setup global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - let tests handle gracefully
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  // Don't exit - let tests handle gracefully
});

// Extend Jest matchers if available
if (typeof expect !== 'undefined') {
  // Custom matcher for API response validation
  expect.extend({
    toBeValidApiResponse(received) {
      const pass =
        received &&
        typeof received === 'object' &&
        Object.prototype.hasOwnProperty.call(received, 'data') &&
        Array.isArray(received.data);

      return {
        message: () =>
          `expected ${received} to be a valid API response with data array`,
        pass,
      };
    },

    toHaveValidAutotaskEntity(received) {
      const pass =
        received &&
        typeof received === 'object' &&
        typeof received.id === 'number' &&
        received.id > 0;

      return {
        message: () =>
          `expected ${received} to be a valid Autotask entity with numeric ID`,
        pass,
      };
    },

    toBeWithinPerformanceThreshold(received, threshold) {
      const pass = typeof received === 'number' && received <= threshold;

      return {
        message: () =>
          `expected ${received}ms to be within performance threshold of ${threshold}ms`,
        pass,
      };
    },
  });
}

// Configure global test utilities
(globalThis as any).testUtils = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  generateTestId: () =>
    `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

  isTestEnvironment: () =>
    process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined,

  logTestInfo: (message: string) => {
    if (process.env.DEBUG_INTEGRATION_TESTS === 'true') {
      console.log(`[TEST INFO] ${message}`);
    }
  },

  logTestWarning: (message: string) => {
    console.warn(`[TEST WARNING] ${message}`);
  },

  logTestError: (message: string, error?: any) => {
    console.error(`[TEST ERROR] ${message}`, error || '');
  },
};

// Export environment info for reference
export const testEnvironmentInfo = {
  nodeVersion: process.version,
  platform: process.platform,
  architecture: process.arch,
  memoryLimit: process.env.NODE_OPTIONS?.includes('max-old-space-size')
    ? process.env.NODE_OPTIONS.match(/max-old-space-size=(\d+)/)?.[1] + 'MB'
    : 'default',
  jestTimeout: process.env.JEST_TIMEOUT,
  debugEnabled: process.env.DEBUG_INTEGRATION_TESTS === 'true',
};

console.log('🔧 Enhanced Integration Test Environment Setup Complete');
console.log('📋 Environment Info:', testEnvironmentInfo);
