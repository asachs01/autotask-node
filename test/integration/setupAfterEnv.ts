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

// Create logs directory if it doesn't exist
try {
  const fs = require('fs');
  fs.mkdirSync('./test/integration/logs', { recursive: true });
} catch {
  // Directory might already exist
}

// Setup for integration tests - runs after Jest environment is set up

// Skip all tests if integration tests are disabled
if (process.env.SKIP_INTEGRATION_TESTS === 'true') {
  beforeEach(() => {
    test.skip('Integration tests are disabled', () => {});
  });
}

// Suppress winston logging during integration tests unless debug mode is enabled
if (!process.env.DEBUG_INTEGRATION_TESTS) {
  // Configure the default winston logger to be silent
  winston.configure({
    level: 'error', // Only show errors and above
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });

  // Override winston.createLogger to always return silent loggers during tests
  const originalCreateLogger = winston.createLogger;
  winston.createLogger = () => {
    return originalCreateLogger({
      level: 'silent',
      transports: [],
      silent: true,
    });
  };
}

// Set up environment for faster tests
beforeAll(() => {
  // Reduce rate limiting for tests
  process.env.AUTOTASK_REQUESTS_PER_SECOND = '10'; // Faster than default 3
  process.env.AUTOTASK_TIMEOUT = '10000'; // Reduced timeout
});
