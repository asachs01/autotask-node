/** @type {import('jest').Config} */
const config = {
  // Use the same preset as main tests
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Only run enhanced integration tests
  testMatch: ['<rootDir>/test/integration/suites/**/*.test.ts'],

  // Enhanced global setup and teardown
  globalSetup: '<rootDir>/test/integration/setup-enhanced.ts',
  globalTeardown: '<rootDir>/test/integration/teardown-enhanced.ts',

  // Setup after environment
  setupFilesAfterEnv: ['<rootDir>/test/integration/setupAfterEnv.ts'],

  // Increased timeout for comprehensive integration tests
  testTimeout: 60000, // 60 seconds for complex operations

  // Coverage settings - disabled for integration tests
  collectCoverage: false,

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform settings
  transform: {
    '^.+\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },

  // Optimized output for integration tests
  verbose: true, // Enhanced verbosity for detailed logging
  silent: false, // Show all output including console.log statements

  // Force serial execution for integration tests to avoid conflicts
  maxWorkers: 1,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Error handling
  errorOnDeprecated: true,

  // Display name for this configuration
  displayName: {
    name: 'Enhanced Integration Tests',
    color: 'blue',
  },

  // Enhanced reporters for comprehensive reporting
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test/integration/reports',
        outputName: 'enhanced-integration-results.xml',
        suiteName: 'Autotask SDK Enhanced Integration Tests',
        includeShortConsoleOutput: true,
        addFileAttribute: true,
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: './test/integration/reports',
        filename: 'enhanced-integration-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Autotask SDK Enhanced Integration Test Report',
        logoImgPath: undefined,
        customInfos: [
          {
            title: 'Test Environment',
            value: process.env.TEST_ENVIRONMENT || 'production-readonly',
          },
          {
            title: 'API Endpoint',
            value: process.env.AUTOTASK_API_URL || 'auto-detected',
          },
        ],
      },
    ],
  ],

  // Performance optimizations
  cache: true,
  detectLeaks: false, // Disable for performance in integration tests
  forceExit: true, // Force exit after tests complete

  // Test result processor for additional metrics
  testResultsProcessor:
    '<rootDir>/test/integration/processors/resultProcessor.js',

  // Environment variables for enhanced integration tests
  setupFiles: ['<rootDir>/test/integration/env-setup.ts'],
};

module.exports = config;
