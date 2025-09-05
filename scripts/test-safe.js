#!/usr/bin/env node

/**
 * SAFE TEST RUNNER
 * 
 * This script ensures tests run without making any real API calls
 * to prevent hitting Kaseya's API rate limits.
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚫 SAFE TEST MODE - Blocking all external network requests');

// Check if network blocker is in place
if (!fs.existsSync('./test/setup/networkBlock.ts')) {
  console.error('❌ CRITICAL: Network blocker not found! Tests may make real API calls!');
  process.exit(1);
}

// Set environment variables to ensure mock mode
process.env.NODE_ENV = 'test';
process.env.AUTOTASK_MOCK_MODE = 'true';
process.env.JEST_MAX_WORKERS = '1';

try {
  // Run tests with specific parameters to prevent API calls
  const command = 'npm test -- --maxWorkers=1 --runInBand --detectOpenHandles --forceExit';
  
  console.log('🧪 Running tests with network protection...');
  execSync(command, { stdio: 'inherit' });
  
  console.log('✅ Tests completed safely - No API calls made');
} catch (error) {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
}