/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test patterns - exclude integration tests
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/test/integration/',
    '<rootDir>/node_modules/',
  ],

  // Setup files - CRITICAL: Network blocking must come first
  setupFilesAfterEnv: [
    '<rootDir>/test/setup/networkBlock.ts',
    '<rootDir>/test/setup.ts'
  ],

  // Coverage settings
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.test.ts'],

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

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Error handling
  errorOnDeprecated: true,

  // Display name for this configuration
  displayName: {
    name: 'Unit Tests',
    color: 'green',
  },

  // Timeout for unit tests
  testTimeout: 10000,
  
  // CRITICAL: Single worker to prevent concurrent API calls
  maxWorkers: 1,

  // Verbose output
  verbose: false,
};

module.exports = config;
