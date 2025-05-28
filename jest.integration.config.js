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

  // Longer timeout for integration tests
  testTimeout: 30000,

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

  // Verbose output for integration tests
  verbose: true,

  // Run tests serially to avoid conflicts
  maxWorkers: 1,

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

  // Reporters
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
};

module.exports = config;
