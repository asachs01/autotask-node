/** @type {import('jest').Config} */
const config = {
  // Use the same preset as main tests
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Only run integration tests
  testMatch: ['<rootDir>/test/integration/**/*.test.ts'],

  // Global setup and teardown
  globalSetup: '<rootDir>/test/integration/setup.ts',
  globalTeardown: '<rootDir>/test/integration/teardown.ts',

  // Setup after environment
  setupFilesAfterEnv: ['<rootDir>/test/integration/setupAfterEnv.ts'],

  // Optimized timeout for integration tests
  testTimeout: 15000, // Reduced from 30000

  // Coverage settings
  collectCoverage: false, // Disable coverage for integration tests

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform settings
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },

  // Optimize output for integration tests
  verbose: false, // Reduced verbosity for speed
  silent: !process.env.DEBUG_INTEGRATION_TESTS,

  // Allow parallel execution for independent tests
  maxWorkers: 1, // Force serial execution to avoid circular reference issues

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Error handling
  errorOnDeprecated: true,

  // Display name for this configuration
  displayName: {
    name: 'Integration Tests',
    color: 'blue',
  },

  // Optimized reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test/integration/reports',
        outputName: 'integration-test-results.xml',
        suiteName: 'Autotask API Integration Tests',
      },
    ],
  ],

  // Performance optimizations
  cache: true,
  detectLeaks: false, // Disable for performance
  forceExit: true, // Force exit after tests complete
};

module.exports = config;
