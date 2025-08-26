import { TestEnvironment } from './framework/TestEnvironment';
import { TestReporter } from './reporting/TestReporter';

/**
 * Enhanced global teardown for integration tests
 */
export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting Enhanced Integration Test Suite cleanup...');
  
  try {
    const integrationConfig = (globalThis as any).__INTEGRATION_CONFIG__;
    
    if (!integrationConfig || integrationConfig.skipIntegrationTests) {
      console.log('⚠️ No integration test cleanup needed (tests were skipped)');
      return;
    }
    
    const { testEnvironment, testReporter, config, startTime } = integrationConfig;
    const totalDuration = Date.now() - startTime;
    
    console.log(`⏱️ Total test suite duration: ${(totalDuration / 1000).toFixed(1)} seconds`);
    
    // Generate final test report
    if (testReporter) {
      console.log('📊 Generating comprehensive test report...');
      try {
        const report = await testReporter.generateReport();
        console.log('✅ Test report generated successfully');
        
        // Log summary to console
        const summaryMatch = report.match(/## Executive Summary\n\n([\s\S]*?)\n## /)?.[1];
        if (summaryMatch) {
          console.log('📊 Test Suite Summary:');
          console.log(summaryMatch.trim());
        }
        
      } catch (reportError) {
        console.error('⚠️ Failed to generate test report:', reportError);
      }
    }
    
    // Cleanup test environment
    if (testEnvironment) {
      console.log('🧹 Cleaning up test environment...');
      await testEnvironment.cleanup();
      
      // Log cleanup summary
      const createdEntities = testEnvironment.getCreatedEntities();
      const totalCreated = Array.from(createdEntities.values())
        .reduce((sum, set) => sum + set.size, 0);
      
      if (totalCreated > 0) {
        console.log(`📊 Cleanup Summary:`);
        for (const [entityType, ids] of createdEntities) {
          if (ids.size > 0) {
            console.log(`  - ${entityType}: ${ids.size} entities`);
          }
        }
      }
    }
    
    // Log environment summary
    console.log('📋 Environment Summary:');
    console.log(`  - Environment Type: ${config.environment}`);
    console.log(`  - Data Operations: ${config.safety.allowDataCreation ? 'FULL CRUD' : 'READ-ONLY'}`);
    console.log(`  - Performance Logging: ${config.logging.enablePerformanceLogs ? 'ENABLED' : 'DISABLED'}`);
    
    console.log('✨ Enhanced Integration Test Suite cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during Enhanced Integration Test Suite cleanup:', error);
    // Don't throw - cleanup errors shouldn't fail the entire test run
  }
  
  // Clean up global state
  delete (globalThis as any).__INTEGRATION_CONFIG__;
}
