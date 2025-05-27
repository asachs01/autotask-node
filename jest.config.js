/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Only run unit tests (exclude integration tests)
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '<rootDir>/test/**/*.test.ts',
    '!<rootDir>/test/integration/**/*.test.ts', // Exclude integration tests
  ],
  
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  extensionsToTreatAsEsm: [],
  
  globals: {
    'ts-jest': {
      useESM: false
    }
  },
  
  silent: true,
  verbose: false,

  // Display name for this configuration
  displayName: {
    name: 'Unit Tests',
    color: 'green',
  },
};

module.exports = config; 