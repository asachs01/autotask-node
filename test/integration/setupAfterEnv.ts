import { integrationMatchers } from './helpers/testHelpers';

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