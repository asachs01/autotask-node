// Jest setup file for unit tests
// This runs before each test file

// Suppress winston logging during tests
import winston from 'winston';

// Completely silence winston during tests unless debug mode is enabled
if (!process.env.DEBUG_TESTS) {
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
  
  // Also suppress any console output during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  // Keep console.error for actual test failures
} 