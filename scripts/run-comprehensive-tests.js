#!/usr/bin/env node

/**
 * Comprehensive Integration Test Runner
 * 
 * This script runs the comprehensive integration test suite with proper
 * setup, monitoring, and reporting.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  testTimeout: 120000, // 2 minutes
  jestConfig: path.join(__dirname, '../test/integration/jest.comprehensive.config.js'),
  reportsDir: path.join(__dirname, '../test/integration/reports'),
  logFile: path.join(__dirname, '../test/integration/logs/comprehensive-runner.log')
};

// Ensure directories exist
function ensureDirectories() {
  const dirs = [
    path.dirname(config.logFile),
    config.reportsDir
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Logger utility
const logger = {
  info: (message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}`;
    console.log(logMessage, ...args);
    fs.appendFileSync(config.logFile, logMessage + '\n');
  },
  
  error: (message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    console.error(logMessage, ...args);
    fs.appendFileSync(config.logFile, logMessage + '\n');
  },
  
  warn: (message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message}`;
    console.warn(logMessage, ...args);
    fs.appendFileSync(config.logFile, logMessage + '\n');
  }
};

// Run Jest with comprehensive configuration
function runComprehensiveTests() {
  return new Promise((resolve, reject) => {
    const jestArgs = [
      '--config', config.jestConfig,
      '--verbose',
      '--no-cache',
      '--detectOpenHandles',
      '--forceExit'
    ];

    // Add debug flag if requested
    if (process.env.DEBUG_INTEGRATION_TESTS) {
      jestArgs.push('--verbose');
    }

    logger.info('Starting comprehensive integration tests...');
    logger.info(`Jest config: ${config.jestConfig}`);
    logger.info(`Jest args: ${jestArgs.join(' ')}`);

    const jestProcess = spawn('npx', ['jest', ...jestArgs], {
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        TEST_TIMEOUT: config.testTimeout.toString()
      }
    });

    let stdout = '';
    let stderr = '';

    jestProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });

    jestProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });

    jestProcess.on('close', (code) => {
      logger.info(`Jest process exited with code: ${code}`);
      
      // Write output to log file
      fs.writeFileSync(
        path.join(config.reportsDir, 'test-output.log'),
        `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`
      );

      if (code === 0) {
        logger.info('✅ Comprehensive integration tests PASSED');
        resolve({ success: true, code, stdout, stderr });
      } else {
        logger.error('❌ Comprehensive integration tests FAILED');
        resolve({ success: false, code, stdout, stderr });
      }
    });

    jestProcess.on('error', (error) => {
      logger.error('Failed to start Jest process:', error);
      reject(error);
    });

    // Handle timeout
    setTimeout(() => {
      logger.warn('Tests are taking longer than expected, continuing...');
    }, 60000); // 1 minute warning
  });
}

// Generate test summary report
function generateSummaryReport(testResult) {
  const summaryReport = {
    timestamp: new Date().toISOString(),
    success: testResult.success,
    exitCode: testResult.code,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      debugEnabled: Boolean(process.env.DEBUG_INTEGRATION_TESTS)
    },
    configuration: config,
    performance: {
      // This would be populated by the test results if available
    }
  };

  const reportPath = path.join(config.reportsDir, 'comprehensive-summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2));
  
  logger.info(`Summary report written to: ${reportPath}`);
  return summaryReport;
}

// Display final results
function displayResults(testResult, _summary) {
  console.log('\n' + '='.repeat(70));
  console.log('COMPREHENSIVE INTEGRATION TEST RESULTS');
  console.log('='.repeat(70));
  
  if (testResult.success) {
    console.log('🎉 Status: PASSED');
    console.log('✅ All comprehensive integration tests completed successfully');
  } else {
    console.log('❌ Status: FAILED');
    console.log('⚠️  Some tests failed or encountered errors');
  }
  
  console.log(`📊 Exit Code: ${testResult.code}`);
  console.log(`🔧 Node Version: ${process.version}`);
  console.log(`💻 Platform: ${process.platform}`);
  console.log(`📁 Reports Directory: ${config.reportsDir}`);
  
  console.log('\n📋 Available Reports:');
  const reportFiles = fs.readdirSync(config.reportsDir).filter(f => 
    f.endsWith('.json') || f.endsWith('.xml') || f.endsWith('.log')
  );
  
  reportFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  console.log('\n' + '='.repeat(70));
  
  if (!testResult.success) {
    console.log('\n💡 Tips for debugging failed tests:');
    console.log('  - Check the test output in reports/test-output.log');
    console.log('  - Run with DEBUG_INTEGRATION_TESTS=true for verbose output');
    console.log('  - Verify mock server is not blocked by firewall');
    console.log('  - Check available memory and CPU resources');
  }
}

// Main execution
async function main() {
  try {
    logger.info('Comprehensive Integration Test Runner starting...');
    
    // Setup
    ensureDirectories();
    logger.info('Directories prepared');
    
    // Run tests
    const testResult = await runComprehensiveTests();
    
    // Generate reports
    const summary = generateSummaryReport(testResult);
    
    // Display results
    displayResults(testResult, summary);
    
    // Exit with appropriate code
    process.exit(testResult.success ? 0 : 1);
    
  } catch (error) {
    logger.error('Fatal error in test runner:', error);
    console.error('\n❌ Fatal error occurred:', error.message);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  logger.warn('Received SIGINT, shutting down gracefully...');
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.warn('Received SIGTERM, shutting down gracefully...');
  process.exit(1);
});

// Execute if called directly
if (require.main === module) {
  main();
}