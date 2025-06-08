import { integrationMatchers } from './helpers/testHelpers';
import winston from 'winston';

// Extend Jest with custom matchers for integration tests
expect.extend(integrationMatchers);

// Set longer timeout for integration tests
jest.setTimeout(30000);

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Ensure logs directory exists
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const logDir = dirname('./test/integration/logs/integration-tests.log');
try {
  mkdirSync(logDir, { recursive: true });
} catch (error) {
  // Directory might already exist
}

// Setup for integration tests - runs after Jest environment is set up

// Skip all tests if integration tests are disabled
if (process.env.SKIP_INTEGRATION_TESTS === 'true') {
  beforeEach(() => {
    pending('Integration tests are disabled');
  });
}

// Suppress winston logging during integration tests unless debug mode is enabled
if (!process.env.DEBUG_INTEGRATION_TESTS) {
  // Configure the default winston logger to be silent
  winston.configure({
    level: 'silent',
    transports: []
  });
  
  // Override winston.createLogger to always return silent loggers during tests
  const originalCreateLogger = winston.createLogger;
  winston.createLogger = (options?: winston.LoggerOptions) => {
    return originalCreateLogger({
      level: 'silent',
      transports: [],
      silent: true
    });
  };
}

// Set up environment for faster tests
beforeAll(() => {
  // Reduce rate limiting for tests
  process.env.AUTOTASK_REQUESTS_PER_SECOND = '10'; // Faster than default 3
  process.env.AUTOTASK_TIMEOUT = '10000'; // Reduced timeout
}); 