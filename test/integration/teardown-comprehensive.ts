/**
 * Comprehensive Integration Test Teardown
 * 
 * This teardown file handles cleanup and reporting for comprehensive integration tests.
 */

export default async function teardownComprehensive() {
  const logger = (global as any).__COMPREHENSIVE_LOGGER__;
  const performanceTracker = (global as any).__PERFORMANCE_TRACKER__;
  const testResultCollector = (global as any).__TEST_RESULT_COLLECTOR__;

  try {
    // Generate performance summary
    if (performanceTracker) {
      const performanceStats = performanceTracker.getAllStats();
      logger.info('Performance Summary:', performanceStats);
      
      // Write performance report to file
      const fs = require('fs');
      const path = require('path');
      
      const reportsDir = path.join(__dirname, 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const performanceReport = {
        timestamp: new Date().toISOString(),
        summary: performanceStats,
        testConfig: (global as any).__COMPREHENSIVE_TEST_CONFIG__,
        nodeInfo: {
          version: process.version,
          platform: process.platform,
          arch: process.arch
        }
      };
      
      fs.writeFileSync(
        path.join(reportsDir, 'performance-report.json'),
        JSON.stringify(performanceReport, null, 2)
      );
    }

    // Generate test results summary
    if (testResultCollector) {
      const summary = testResultCollector.getSummary();
      logger.info('Test Results Summary:', summary);
      
      // Determine overall test success
      const overallSuccess = summary.successRate >= 95 && summary.performanceSuccessRate >= 80;
      
      if (overallSuccess) {
        logger.info('🎉 Comprehensive Integration Tests: PASSED', {
          successRate: `${summary.successRate.toFixed(1)}%`,
          performanceRate: `${summary.performanceSuccessRate.toFixed(1)}%`,
          totalTests: summary.total,
          passedTests: summary.passed
        });
      } else {
        logger.warn('⚠️ Comprehensive Integration Tests: REVIEW NEEDED', {
          successRate: `${summary.successRate.toFixed(1)}%`,
          performanceRate: `${summary.performanceSuccessRate.toFixed(1)}%`,
          totalTests: summary.total,
          failedTests: summary.failed
        });
      }
    }

    // Log final status
    logger.info('Comprehensive integration test teardown completed successfully');
    
  } catch (error) {
    console.error('Error during comprehensive test teardown:', error);
  }
}