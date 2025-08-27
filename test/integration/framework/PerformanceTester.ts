import { TestEnvironment } from './TestEnvironment';
import { AutotaskClient } from '../../../src/client/AutotaskClient';

/**
 * Performance test metrics
 */
export interface PerformanceMetrics {
  operationType: string;
  duration: number;
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  throughput: number; // requests per second
  memoryUsage: {
    before: NodeJS.MemoryUsage;
    after: NodeJS.MemoryUsage;
    peak: NodeJS.MemoryUsage;
  };
  errors: string[];
}

/**
 * Rate limiting test results
 */
export interface RateLimitTestResult {
  rateLimitHit: boolean;
  requestsBeforeLimit: number;
  rateLimitResponse?: any;
  recoveryTime: number;
  backoffStrategy: string;
}

/**
 * Concurrent operation test results
 */
export interface ConcurrencyTestResult {
  concurrentRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalDuration: number;
  throughput: number;
  errors: string[];
}

/**
 * Performance tester for integration tests
 */
export class PerformanceTester {
  private testEnvironment: TestEnvironment;
  private client: AutotaskClient;

  constructor(testEnvironment: TestEnvironment) {
    this.testEnvironment = testEnvironment;
    this.client = testEnvironment.getClient();
  }

  /**
   * Test rate limiting behavior
   */
  async testRateLimiting(entityType: string = 'tickets'): Promise<RateLimitTestResult> {
    const config = this.testEnvironment.getConfig();
    const client = this.client as any;
    const entityClient = client[entityType];

    if (!entityClient || typeof entityClient.list !== 'function') {
      throw new Error(`Entity type ${entityType} not available for rate limit testing`);
    }

    const result: RateLimitTestResult = {
      rateLimitHit: false,
      requestsBeforeLimit: 0,
      recoveryTime: 0,
      backoffStrategy: 'exponential'
    };

    const startTime = Date.now();
    let requestCount = 0;
    const maxRequests = 50; // Safety limit

    try {
      // Rapidly fire requests until rate limit is hit
      while (requestCount < maxRequests) {
        try {
          await entityClient.list({ pageSize: 1 }); // Minimal request
          requestCount++;
          result.requestsBeforeLimit = requestCount;
          
          // Small delay to avoid overwhelming
          await this.wait(100);
        } catch (error: any) {
          if (error.status === 429 || error.message.includes('rate limit')) {
            result.rateLimitHit = true;
            result.rateLimitResponse = {
              status: error.status,
              message: error.message,
              headers: error.response?.headers
            };
            break;
          } else {
            throw error; // Re-throw non-rate-limit errors
          }
        }
      }

      // If rate limit was hit, test recovery
      if (result.rateLimitHit) {
        const recoveryStart = Date.now();
        let recovered = false;
        let retryDelay = config.retries.baseDelay;

        // Test exponential backoff recovery
        for (let attempt = 1; attempt <= 5; attempt++) {
          await this.wait(retryDelay);
          
          try {
            await entityClient.list({ pageSize: 1 });
            recovered = true;
            result.recoveryTime = Date.now() - recoveryStart;
            break;
          } catch (error: any) {
            if (error.status !== 429) {
              throw error;
            }
            retryDelay *= 2; // Exponential backoff
          }
        }

        if (!recovered) {
          result.recoveryTime = Date.now() - recoveryStart;
        }
      }

    } catch (error) {
      console.error('Rate limit testing failed:', error);
      throw error;
    }

    return result;
  }

  /**
   * Test concurrent request handling
   */
  async testConcurrentRequests(
    entityType: string = 'tickets',
    concurrency: number = 5
  ): Promise<ConcurrencyTestResult> {
    const client = this.client as any;
    const entityClient = client[entityType];

    if (!entityClient || typeof entityClient.list !== 'function') {
      throw new Error(`Entity type ${entityType} not available for concurrency testing`);
    }

    const startTime = Date.now();
    const promises: Promise<any>[] = [];
    const results: any[] = [];
    const errors: string[] = [];

    // Create concurrent requests
    for (let i = 0; i < concurrency; i++) {
      promises.push(
        entityClient.list({ pageSize: 10 })
          .then((result: any) => {
            results.push(result);
            return result;
          })
          .catch((error: any) => {
            errors.push(`Request ${i + 1}: ${error.message}`);
            throw error;
          })
      );
    }

    // Execute all requests concurrently
    const settledResults = await Promise.allSettled(promises);
    const endTime = Date.now();

    const successfulRequests = settledResults.filter(r => r.status === 'fulfilled').length;
    const failedRequests = settledResults.filter(r => r.status === 'rejected').length;
    const totalDuration = endTime - startTime;
    const averageResponseTime = totalDuration / concurrency;
    const throughput = (successfulRequests / totalDuration) * 1000; // requests per second

    return {
      concurrentRequests: concurrency,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      totalDuration,
      throughput,
      errors
    };
  }

  /**
   * Test pagination performance with large datasets
   */
  async testPaginationPerformance(
    entityType: string = 'tickets',
    pageSizes: number[] = [25, 50, 100, 500]
  ): Promise<PerformanceMetrics[]> {
    const client = this.client as any;
    const entityClient = client[entityType];

    if (!entityClient || typeof entityClient.list !== 'function') {
      throw new Error(`Entity type ${entityType} not available for pagination testing`);
    }

    const results: PerformanceMetrics[] = [];

    for (const pageSize of pageSizes) {
      const memoryBefore = process.memoryUsage();
      const startTime = Date.now();
      const responseTimes: number[] = [];
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      try {
        // Test first page only to avoid excessive data
        const requestStart = Date.now();
        const result = await entityClient.list({ pageSize });
        const requestEnd = Date.now();
        
        responseTimes.push(requestEnd - requestStart);
        successCount++;
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
      } catch (error: any) {
        errorCount++;
        errors.push(error.message);
      }

      const endTime = Date.now();
      const memoryAfter = process.memoryUsage();
      const totalDuration = endTime - startTime;
      const requestCount = successCount + errorCount;

      results.push({
        operationType: `pagination_${entityType}_pageSize_${pageSize}`,
        duration: totalDuration,
        requestCount,
        successCount,
        errorCount,
        averageResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        throughput: successCount > 0 ? (successCount / totalDuration) * 1000 : 0,
        memoryUsage: {
          before: memoryBefore,
          after: memoryAfter,
          peak: memoryAfter // Simplified for this test
        },
        errors
      });

      // Rate limiting between different page sizes
      await this.wait(1000);
    }

    return results;
  }

  /**
   * Test CRUD operation performance
   */
  async testCRUDPerformance(
    entityType: string,
    iterations: number = 5
  ): Promise<PerformanceMetrics> {
    if (!this.testEnvironment.isOperationAllowed('create')) {
      throw new Error('CRUD performance testing not allowed in this environment');
    }

    const client = this.client as any;
    const entityClient = client[entityType];
    const testDataFactory = await import('./TestDataFactory');
    const factory = new testDataFactory.TestDataFactory(this.testEnvironment);

    const memoryBefore = process.memoryUsage();
    const startTime = Date.now();
    const responseTimes: number[] = [];
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const createdIds: number[] = [];

    try {
      for (let i = 0; i < iterations; i++) {
        try {
          // CREATE
          const createStart = Date.now();
          const testData = factory.createSafeTestData(entityType.slice(0, -1), {});
          const created = await entityClient.create(testData);
          const createEnd = Date.now();

          responseTimes.push(createEnd - createStart);
          successCount++;
          createdIds.push(created.data.id);
          this.testEnvironment.registerCreatedEntity(entityType, created.data.id);

          // READ
          const readStart = Date.now();
          await entityClient.get(created.data.id);
          const readEnd = Date.now();

          responseTimes.push(readEnd - readStart);
          successCount++;

          // UPDATE (if allowed)
          if (this.testEnvironment.isOperationAllowed('update')) {
            const updateStart = Date.now();
            const updateData = { ...testData, title: `Updated ${testData.title}` };
            await entityClient.update(created.data.id, updateData);
            const updateEnd = Date.now();

            responseTimes.push(updateEnd - updateStart);
            successCount++;
          }

          // Rate limiting between iterations
          await this.wait(500);

        } catch (error: any) {
          errorCount++;
          errors.push(`Iteration ${i + 1}: ${error.message}`);
        }
      }

    } catch (error: any) {
      errors.push(`CRUD test failed: ${error.message}`);
      errorCount++;
    }

    const endTime = Date.now();
    const memoryAfter = process.memoryUsage();
    const totalDuration = endTime - startTime;
    const requestCount = successCount + errorCount;

    return {
      operationType: `crud_${entityType}`,
      duration: totalDuration,
      requestCount,
      successCount,
      errorCount,
      averageResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      throughput: successCount > 0 ? (successCount / totalDuration) * 1000 : 0,
      memoryUsage: {
        before: memoryBefore,
        after: memoryAfter,
        peak: memoryAfter // Simplified
      },
      errors
    };
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(metrics: PerformanceMetrics[]): string {
    let report = '\n=== PERFORMANCE TEST REPORT ===\n\n';

    for (const metric of metrics) {
      report += `Operation: ${metric.operationType}\n`;
      report += `Duration: ${metric.duration}ms\n`;
      report += `Requests: ${metric.requestCount} (${metric.successCount} successful, ${metric.errorCount} failed)\n`;
      report += `Average Response Time: ${metric.averageResponseTime.toFixed(2)}ms\n`;
      report += `Throughput: ${metric.throughput.toFixed(2)} req/sec\n`;
      report += `Memory Usage: ${Math.round(metric.memoryUsage.after.heapUsed / 1024 / 1024)}MB\n`;
      
      if (metric.errors.length > 0) {
        report += `Errors: ${metric.errors.length}\n`;
        metric.errors.slice(0, 3).forEach(error => {
          report += `  - ${error}\n`;
        });
      }
      
      report += '\n';
    }

    return report;
  }

  /**
   * Wait for specified time
   */
  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
