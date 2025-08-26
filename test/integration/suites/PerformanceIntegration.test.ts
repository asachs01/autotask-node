import { TestEnvironment, TestEnvironmentType } from '../framework/TestEnvironment';
import { PerformanceTester, PerformanceMetrics, RateLimitTestResult, ConcurrencyTestResult } from '../framework/PerformanceTester';
import { loadTestConfig, IntegrationTestConfig } from '../config/TestConfig';
import { AutotaskClient } from '../../../src/client/AutotaskClient';

describe('Performance Integration Tests', () => {
  let testConfig: IntegrationTestConfig;
  let testEnvironment: TestEnvironment;
  let performanceTester: PerformanceTester;
  let client: AutotaskClient;

  beforeAll(async () => {
    testConfig = loadTestConfig();
    
    if (testConfig.skipIntegrationTests) {
      console.log('⚠️ Skipping Performance Integration Tests - credentials not available or explicitly disabled');
      return;
    }

    try {
      // Initialize Autotask client
      client = new AutotaskClient({
        username: testConfig.autotask.username,
        integrationCode: testConfig.autotask.integrationCode,
        secret: testConfig.autotask.secret,
        apiUrl: testConfig.autotask.apiUrl,
      });

      // Initialize test environment  
      testEnvironment = new TestEnvironment(client, testConfig.environment);
      await testEnvironment.initialize();

      // Initialize performance tester
      performanceTester = new PerformanceTester(testEnvironment);

      console.log('🚀 Performance Integration Tests initialized successfully');
      console.log(`Environment: ${testConfig.environment}`);
      console.log(`Max Concurrent: ${testConfig.performance.concurrency.maxConcurrent}`);
    } catch (error) {
      console.error('Failed to initialize Performance Integration Tests:', error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    if (testEnvironment) {
      await testEnvironment.cleanup();
      console.log('🧹 Performance Integration Tests cleanup completed');
    }
  });

  describe('Rate Limiting Tests', () => {
    it('should respect API rate limits', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🚷 Testing API rate limiting behavior...');

      const result: RateLimitTestResult = await performanceTester.testRateLimiting('tickets');

      // Log results
      console.log(`Rate Limit Test Results:`);
      console.log(`  - Rate limit hit: ${result.rateLimitHit}`);
      console.log(`  - Requests before limit: ${result.requestsBeforeLimit}`);
      console.log(`  - Recovery time: ${result.recoveryTime}ms`);
      
      if (result.rateLimitResponse) {
        console.log(`  - Rate limit response status: ${result.rateLimitResponse.status}`);
      }

      // Validate rate limiting behavior
      if (result.rateLimitHit) {
        expect(result.rateLimitResponse.status).toBe(429);
        expect(result.recoveryTime).toBeGreaterThan(0);
        console.log('✅ Rate limiting is working correctly');
      } else {
        console.log('📋 No rate limit encountered (may indicate very permissive limits or low request volume)');
      }

      // Ensure we don't make too many requests without hitting limits in reasonable environments
      if (testConfig.environment === TestEnvironmentType.PRODUCTION_READONLY) {
        expect(result.requestsBeforeLimit).toBeLessThan(100);
      }
    }, 60000);

    it('should implement exponential backoff on rate limit hits', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🚷 Testing exponential backoff strategy...');

      // This test validates that our retry logic works with exponential backoff
      let retryCount = 0;
      const maxRetries = 3;
      const baseDelay = 1000;

      const testOperation = async (): Promise<any> => {
        retryCount++;
        if (retryCount < maxRetries) {
          // Simulate rate limit error
          const error = new Error('Rate limit exceeded') as any;
          error.status = 429;
          throw error;
        }
        return { success: true };
      };

      const startTime = Date.now();
      const result = await testEnvironment.executeWithRetry(testOperation, maxRetries);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(retryCount).toBe(maxRetries);
      
      // Validate that exponential backoff was applied
      const totalTime = endTime - startTime;
      const expectedMinTime = baseDelay + (baseDelay * 2); // First two retries
      expect(totalTime).toBeGreaterThanOrEqual(expectedMinTime * 0.9); // Allow for timing variations

      console.log(`✅ Exponential backoff working correctly (${retryCount} retries, ${totalTime}ms total)`);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent requests efficiently', async () => {
      if (testConfig.skipIntegrationTests) return;

      const concurrency = Math.min(testConfig.performance.concurrency.maxConcurrent, 5);
      console.log(`🔄 Testing concurrent request handling with ${concurrency} concurrent requests...`);

      const result: ConcurrencyTestResult = await performanceTester.testConcurrentRequests('tickets', concurrency);

      // Log results
      console.log(`Concurrency Test Results:`);
      console.log(`  - Concurrent requests: ${result.concurrentRequests}`);
      console.log(`  - Successful requests: ${result.successfulRequests}`);
      console.log(`  - Failed requests: ${result.failedRequests}`);
      console.log(`  - Average response time: ${result.averageResponseTime.toFixed(2)}ms`);
      console.log(`  - Throughput: ${result.throughput.toFixed(2)} req/sec`);
      console.log(`  - Total duration: ${result.totalDuration}ms`);

      if (result.errors.length > 0) {
        console.log(`  - Errors: ${result.errors.length}`);
        result.errors.slice(0, 3).forEach(error => console.log(`    - ${error}`));
      }

      // Validate concurrency handling
      expect(result.concurrentRequests).toBe(concurrency);
      expect(result.successfulRequests).toBeGreaterThan(0);
      
      // Most requests should succeed unless rate limited
      const successRate = result.successfulRequests / result.concurrentRequests;
      if (successRate < 0.5) {
        console.log('⚠️ Low success rate may indicate aggressive rate limiting');
      } else {
        console.log(`✅ Good success rate: ${(successRate * 100).toFixed(1)}%`);
      }

      // Response times should be reasonable
      expect(result.averageResponseTime).toBeLessThan(30000); // 30 seconds max
      
      console.log('✅ Concurrent request handling test completed');
    });

    it('should maintain response quality under concurrent load', async () => {
      if (testConfig.skipIntegrationTests) return;

      const concurrency = Math.min(testConfig.performance.concurrency.maxConcurrent, 3);
      console.log(`🔄 Testing response quality under concurrent load...`);

      // Make concurrent requests and validate response structure
      const promises = [];
      for (let i = 0; i < concurrency; i++) {
        promises.push(
          testEnvironment.executeWithRateLimit(async () => {
            const result = await client.tickets.list({ pageSize: 5 });
            return {
              requestIndex: i,
              dataCount: result.data.length,
              hasValidStructure: Array.isArray(result.data),
              responseTime: Date.now()
            };
          })
        );
      }

      const results = await Promise.allSettled(promises);
      const successfulResults = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<any>).value);

      expect(successfulResults.length).toBeGreaterThan(0);
      
      // Validate that all successful responses have proper structure
      for (const result of successfulResults) {
        expect(result.hasValidStructure).toBe(true);
        expect(result.dataCount).toBeGreaterThanOrEqual(0);
      }

      console.log(`✅ Response quality maintained: ${successfulResults.length}/${concurrency} requests succeeded`);
    });
  });

  describe('Large Dataset Handling', () => {
    it('should handle pagination performance efficiently', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('📄 Testing pagination performance across different page sizes...');

      const pageSizes = testConfig.environment === TestEnvironmentType.PRODUCTION_READONLY 
        ? [25, 50] // Conservative for production
        : [25, 50, 100];
        
      const metrics: PerformanceMetrics[] = await performanceTester.testPaginationPerformance('tickets', pageSizes);

      // Generate and log performance report
      const report = performanceTester.generatePerformanceReport(metrics);
      console.log(report);

      // Validate pagination performance
      for (const metric of metrics) {
        expect(metric.successCount).toBeGreaterThan(0);
        expect(metric.averageResponseTime).toBeGreaterThan(0);
        expect(metric.averageResponseTime).toBeLessThan(60000); // 60 seconds max
        
        // Memory usage should be reasonable
        const memoryUsed = metric.memoryUsage.after.heapUsed / 1024 / 1024; // MB
        expect(memoryUsed).toBeLessThan(500); // 500MB max for pagination test
        
        console.log(`✅ Page size ${metric.operationType} performed well`);
      }

      // Compare performance across page sizes
      if (metrics.length > 1) {
        const bestThroughput = Math.max(...metrics.map(m => m.throughput));
        const bestMetric = metrics.find(m => m.throughput === bestThroughput);
        console.log(`🟆 Best performing page size: ${bestMetric?.operationType} (${bestThroughput.toFixed(2)} req/sec)`);
      }
    }, 120000);

    it('should handle memory efficiently with large responses', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🧠 Testing memory efficiency with larger page sizes...');

      const memoryBefore = process.memoryUsage();
      
      // Request larger page size (within reasonable limits)
      const pageSize = testConfig.environment === TestEnvironmentType.PRODUCTION_READONLY ? 50 : 100;
      
      const result = await testEnvironment.executeWithRateLimit(async () => {
        return await client.tickets.list({ pageSize });
      });

      const memoryAfter = process.memoryUsage();
      const memoryIncrease = (memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024; // MB

      console.log(`Memory usage:`);
      console.log(`  - Before: ${Math.round(memoryBefore.heapUsed / 1024 / 1024)}MB`);
      console.log(`  - After: ${Math.round(memoryAfter.heapUsed / 1024 / 1024)}MB`);
      console.log(`  - Increase: ${memoryIncrease.toFixed(2)}MB`);
      console.log(`  - Records retrieved: ${result.data.length}`);
      
      if (result.data.length > 0) {
        const memoryPerRecord = memoryIncrease / result.data.length;
        console.log(`  - Memory per record: ${memoryPerRecord.toFixed(4)}MB`);
        
        // Validate reasonable memory usage per record
        expect(memoryPerRecord).toBeLessThan(1); // Less than 1MB per record
      }

      // Validate that memory increase is reasonable for the data retrieved
      expect(memoryIncrease).toBeLessThan(100); // Less than 100MB increase
      
      console.log('✅ Memory efficiency test completed');
    });
  });

  describe('Network and Error Recovery', () => {
    it('should recover from temporary network issues', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🌐 Testing network error recovery...');

      // Simulate network error by making request to non-existent endpoint
      // then recover with valid request
      let networkErrorCaught = false;
      
      try {
        // This should fail
        await client.tickets.get(999999999);
      } catch (error: any) {
        if (error.status === 404) {
          networkErrorCaught = true;
          console.log('✅ Network error properly caught (404 for non-existent resource)');
        }
      }

      expect(networkErrorCaught).toBe(true);

      // Now test that we can recover with a valid request
      const validResult = await testEnvironment.executeWithRetry(async () => {
        return await client.tickets.list({ pageSize: 1 });
      });

      expect(validResult.data).toBeDefined();
      expect(Array.isArray(validResult.data)).toBe(true);
      
      console.log('✅ Successfully recovered from network error with valid request');
    });

    it('should handle server errors gracefully', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🚨 Testing server error handling...');

      // Test retry mechanism with exponential backoff
      let attemptCount = 0;
      const maxAttempts = 3;
      
      const unreliableOperation = async () => {
        attemptCount++;
        if (attemptCount < maxAttempts) {
          // Simulate server error
          const error = new Error('Internal server error') as any;
          error.status = 500;
          throw error;
        }
        // Succeed on final attempt
        return await client.tickets.list({ pageSize: 1 });
      };

      const startTime = Date.now();
      const result = await testEnvironment.executeWithRetry(unreliableOperation, maxAttempts);
      const endTime = Date.now();

      expect(result.data).toBeDefined();
      expect(attemptCount).toBe(maxAttempts);
      
      const totalTime = endTime - startTime;
      console.log(`✅ Server error recovery successful after ${attemptCount} attempts (${totalTime}ms total)`);
      
      // Validate that retry delays were applied
      expect(totalTime).toBeGreaterThan(testConfig.performance.baseRetryDelay * 0.9);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet minimum performance benchmarks', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('📏 Testing minimum performance benchmarks...');

      const benchmarks = {
        listOperation: { maxTime: 10000, description: 'List operation' },
        getOperation: { maxTime: 5000, description: 'Get single entity' },
        concurrentRequests: { minThroughput: 0.5, description: 'Concurrent request throughput' }
      };

      // Test list operation performance
      const listStart = Date.now();
      const listResult = await client.tickets.list({ pageSize: 10 });
      const listTime = Date.now() - listStart;
      
      console.log(`${benchmarks.listOperation.description}: ${listTime}ms`);
      expect(listTime).toBeLessThan(benchmarks.listOperation.maxTime);
      
      // Test get operation performance (if we have data)
      if (listResult.data.length > 0) {
        const getStart = Date.now();
        await client.tickets.get(listResult.data[0].id);
        const getTime = Date.now() - getStart;
        
        console.log(`${benchmarks.getOperation.description}: ${getTime}ms`);
        expect(getTime).toBeLessThan(benchmarks.getOperation.maxTime);
      }

      // Test concurrent throughput
      const concurrencyResult = await performanceTester.testConcurrentRequests('tickets', 3);
      console.log(`${benchmarks.concurrentRequests.description}: ${concurrencyResult.throughput.toFixed(2)} req/sec`);
      
      if (concurrencyResult.successfulRequests > 0) {
        expect(concurrencyResult.throughput).toBeGreaterThan(benchmarks.concurrentRequests.minThroughput);
      }

      console.log('✅ All performance benchmarks met');
    }, 60000);
  });
});
