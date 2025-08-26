/** @type {import('jest').Config} */
const config = {
  // Use TypeScript preset
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Target comprehensive integration tests
  testMatch: [
    '<rootDir>/test/integration/sdk-integration.test.ts',
    '<rootDir>/test/integration/mock-server.test.ts'
  ],

  // Optimized timeout for comprehensive tests
  testTimeout: 60000, // 1 minute for comprehensive tests

  // Coverage settings - disabled for performance
  collectCoverage: false,

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

  // Optimized for comprehensive testing
  verbose: true,
  silent: false,

  // Serial execution for mock server tests
  maxWorkers: 1,

  // Enhanced error handling
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  // Error reporting
  errorOnDeprecated: true,

  // Display name for this configuration
  displayName: {
    name: 'Comprehensive Integration Tests',
    color: 'magenta',
  },

  // Enhanced reporters for comprehensive testing
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test/integration/reports',
        outputName: 'comprehensive-integration-results.xml',
        suiteName: 'Autotask SDK Comprehensive Integration Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        includeShortConsoleOutput: true,
      },
    ],
  ],

  // Performance optimizations
  cache: true,
  detectLeaks: false,
  forceExit: true,

  // Environment setup
  setupFilesAfterEnv: ['<rootDir>/test/integration/setup-comprehensive.ts'],

  // Custom test environment variables
  testEnvironment: 'node',
  globalTeardown: '<rootDir>/test/integration/teardown-comprehensive.ts',
};

module.exports = config;