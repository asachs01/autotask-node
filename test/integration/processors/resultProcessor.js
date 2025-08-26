/**
 * Jest test result processor for enhanced integration tests
 * Processes test results and generates additional metrics
 */

module.exports = (testResults) => {
  const { testResults: results, numTotalTests, numPassedTests, numFailedTests, numPendingTests } = testResults;
  
  console.log('\n📊 Enhanced Integration Test Results Summary:');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${numTotalTests}`);
  console.log(`Passed: ${numPassedTests} (${((numPassedTests / numTotalTests) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${numFailedTests} (${((numFailedTests / numTotalTests) * 100).toFixed(1)}%)`);
  console.log(`Pending: ${numPendingTests} (${((numPendingTests / numTotalTests) * 100).toFixed(1)}%)`);
  
  // Performance metrics
  const totalTime = results.reduce((sum, result) => sum + (result.perfStats?.end - result.perfStats?.start || 0), 0);
  console.log(`Total Duration: ${(totalTime / 1000).toFixed(1)} seconds`);
  
  // Test suite breakdown
  console.log('\n📋 Test Suite Breakdown:');
  results.forEach(result => {
    const suiteName = result.testFilePath.split('/').pop()?.replace('.test.ts', '') || 'Unknown';
    const passed = result.numPassingTests;
    const failed = result.numFailingTests;
    const total = passed + failed + result.numPendingTests;
    const duration = result.perfStats ? ((result.perfStats.end - result.perfStats.start) / 1000).toFixed(1) : 'N/A';
    
    console.log(`  ${suiteName}: ${passed}/${total} passed (${duration}s)`);
  });
  
  // Error summary
  const failedTests = results.filter(result => result.numFailingTests > 0);
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Test Summary:');
    failedTests.forEach(result => {
      const suiteName = result.testFilePath.split('/').pop()?.replace('.test.ts', '') || 'Unknown';
      console.log(`  ${suiteName}: ${result.numFailingTests} failed`);
      
      // Show first error for context
      if (result.testResults && result.testResults[0] && result.testResults[0].failureMessages) {
        const firstError = result.testResults[0].failureMessages[0];
        if (firstError) {
          const errorLines = firstError.split('\n');
          const errorSummary = errorLines.find(line => line.includes('Error:') || line.includes('expect'));
          if (errorSummary) {
            console.log(`    └─ ${errorSummary.trim()}`);
          }
        }
      }
    });
  }
  
  console.log('=' .repeat(60));
  
  return testResults;
};
