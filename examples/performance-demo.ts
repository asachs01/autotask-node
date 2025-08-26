#!/usr/bin/env tsx

/**
 * AutoTask SDK Enterprise Performance Demo
 * 
 * This script demonstrates the comprehensive enterprise-grade performance
 * optimization and benchmarking system integrated with the AutoTask SDK.
 * 
 * Features demonstrated:
 * - Real-time performance monitoring
 * - Intelligent caching with TTL and invalidation
 * - Request optimization and batching
 * - Memory leak detection and optimization
 * - Comprehensive benchmarking and load testing
 * - Performance regression detection
 */

import { AutotaskClient } from '../src/client/AutotaskClient';
import { AutotaskPerformanceIntegration } from '../src/performance/integration/AutotaskPerformanceIntegration';
import { BenchmarkProfile } from '../src/performance/types/BenchmarkTypes';
import winston from 'winston';

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'performance-demo.log' })
  ]
});

class PerformanceDemo {
  private client!: AutotaskClient;
  private performance!: AutotaskPerformanceIntegration;

  async initialize() {
    logger.info('🚀 Initializing AutoTask SDK with Enterprise Performance System');

    try {
      // Create AutoTask client
      this.client = await AutotaskClient.create({
        username: process.env.AUTOTASK_USERNAME!,
        integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
        secret: process.env.AUTOTASK_SECRET!
      }, {
        timeout: 30000,
        maxConcurrentRequests: 10,
        enableConnectionPooling: true,
        requestsPerSecond: 5,
        enableCompression: true
      });

      // Initialize performance integration
      this.performance = new AutotaskPerformanceIntegration(
        this.client.getRequestHandler().axios,
        logger,
        {
          performance: {
            enableRealTimeMetrics: true,
            metricsInterval: 5000,
            maxSamples: 1000,
            enableMemoryLeakDetection: true,
            memoryWarningThreshold: 256,
            enableProfiling: true,
            enableRequestTracking: true
          },
          cache: {
            defaultTtl: 300000, // 5 minutes
            maxSize: 5000,
            enableStats: true,
            evictionStrategy: 'lru',
            enableCompression: true,
            enableWarming: true,
            warmingInterval: 300000 // 5 minutes
          },
          optimization: {
            enableBatching: true,
            maxBatchSize: 10,
            batchTimeout: 100,
            enableDeduplication: true,
            deduplicationWindow: 5000,
            enableCompression: true,
            compressionThreshold: 1024,
            maxConcurrency: 10
          }
        }
      );

      // Enable performance integration
      this.performance.enable();

      logger.info('✅ Performance system initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize performance system:', error);
      throw error;
    }
  }

  async demonstrateBasicOperations() {
    logger.info('🔧 Demonstrating basic operations with performance monitoring');

    try {
      // Start performance profiling
      const profileId = this.client.getLogger().info('Starting basic operations profile');

      // Perform various operations to generate metrics
      logger.info('📊 Fetching companies...');
      const companies = await this.client.companies.list({ 
        pageSize: 50,
        filter: 'isActive eq true'
      });

      logger.info('🎫 Fetching tickets...');
      const tickets = await this.client.tickets.list({
        pageSize: 50,
        filter: 'status eq "New"'
      });

      logger.info('👥 Fetching contacts...');
      const contacts = await this.client.contacts.list({
        pageSize: 50,
        filter: 'isActive eq 1'
      });

      // These requests should be cached on subsequent calls
      logger.info('🔄 Repeating requests to test cache effectiveness...');
      await Promise.all([
        this.client.companies.list({ pageSize: 50, filter: 'isActive eq true' }),
        this.client.tickets.list({ pageSize: 50, filter: 'status eq "New"' }),
        this.client.contacts.list({ pageSize: 50, filter: 'isActive eq 1' })
      ]);

      logger.info(`✅ Basic operations completed. Retrieved ${companies.items?.length || 0} companies, ${tickets.items?.length || 0} tickets, ${contacts.items?.length || 0} contacts`);

      // Display current performance metrics
      const dashboard = this.performance.getDashboard();
      logger.info('📈 Current Performance Metrics:', {
        totalRequests: dashboard.performance.metrics.totalRequests,
        averageResponseTime: `${dashboard.performance.metrics.averageResponseTime.toFixed(2)}ms`,
        throughput: `${dashboard.performance.metrics.throughput.toFixed(2)} req/s`,
        errorRate: `${dashboard.performance.metrics.errorRate.toFixed(2)}%`,
        cacheHitRate: `${dashboard.cache.stats.hitRate.toFixed(2)}%`,
        memoryUsage: `${dashboard.performance.metrics.memoryUsage.toFixed(2)}MB`
      });

    } catch (error) {
      logger.error('❌ Error during basic operations demo:', error);
    }
  }

  async demonstrateCacheOptimization() {
    logger.info('🧠 Demonstrating intelligent cache optimization');

    try {
      // Define usage patterns based on typical AutoTask workflows
      const usagePatterns = [
        {
          entityType: 'companies',
          operations: ['list', 'get', 'search'],
          frequency: 0.8 // High frequency
        },
        {
          entityType: 'tickets',
          operations: ['list', 'create', 'update'],
          frequency: 0.9 // Very high frequency
        },
        {
          entityType: 'contacts',
          operations: ['list', 'get'],
          frequency: 0.6 // Medium frequency
        },
        {
          entityType: 'projects',
          operations: ['list', 'get'],
          frequency: 0.3 // Lower frequency
        }
      ];

      // Optimize cache based on usage patterns
      await this.performance.optimizeCache(usagePatterns);
      logger.info('✅ Cache optimization completed based on usage patterns');

      // Simulate typical workflow to test optimization
      logger.info('🔄 Testing optimized cache with simulated workflow...');
      
      // Rapid successive requests that should benefit from optimization
      const startTime = Date.now();
      await Promise.all([
        ...Array(5).fill(0).map(() => 
          this.client.companies.list({ pageSize: 20, filter: 'isActive eq true' })
        ),
        ...Array(5).fill(0).map(() => 
          this.client.tickets.list({ pageSize: 20, filter: 'status eq "New"' })
        ),
        ...Array(3).fill(0).map(() => 
          this.client.contacts.list({ pageSize: 20, filter: 'isActive eq 1' })
        )
      ]);
      const duration = Date.now() - startTime;

      const dashboard = this.performance.getDashboard();
      logger.info('📊 Cache optimization results:', {
        totalDuration: `${duration}ms`,
        cacheHitRate: `${dashboard.cache.stats.hitRate.toFixed(2)}%`,
        averageResponseTime: `${dashboard.performance.metrics.averageResponseTime.toFixed(2)}ms`,
        requestsSaved: dashboard.optimization.metrics.deduplicatedRequests,
        bandwidthSaved: `${(dashboard.optimization.metrics.bandwidthSaved / 1024).toFixed(2)}KB`
      });

    } catch (error) {
      logger.error('❌ Error during cache optimization demo:', error);
    }
  }

  async demonstrateBenchmarking() {
    logger.info('🏁 Running comprehensive performance benchmarks');

    try {
      // Define benchmark profile for typical AutoTask usage
      const benchmarkProfile: BenchmarkProfile = {
        name: 'Typical AutoTask Workflow',
        entityTypes: ['companies', 'tickets', 'contacts', 'projects'],
        operationsMix: {
          'list': 40,    // 40% list operations
          'get': 30,     // 30% individual gets
          'search': 20,  // 20% search operations
          'create': 7,   // 7% create operations
          'update': 3    // 3% update operations
        },
        loadCharacteristics: {
          baseLoad: 5,     // 5 requests per second baseline
          peakLoad: 15,    // 15 requests per second peak
          loadPattern: 'ramp_up',
          duration: 5      // 5 minutes
        },
        dataCharacteristics: {
          recordSizes: 'medium',
          relationshipDepth: 2,
          dataVariation: 0.3
        },
        expectations: {
          maxResponseTime: 2000,  // 2 seconds max
          minThroughput: 3,       // 3 requests per second minimum
          maxErrorRate: 5,        // 5% max error rate
          maxMemoryUsage: 512     // 512MB max memory
        }
      };

      logger.info('🎯 Starting benchmark with profile:', benchmarkProfile.name);
      
      // Run benchmark
      const results = await this.performance.benchmarkEntities(
        benchmarkProfile.entityTypes,
        {
          name: benchmarkProfile.name,
          iterations: 300,  // Reduced for demo
          concurrency: 3,   // Reduced for demo
          maxDuration: 120000 // 2 minutes for demo
        }
      );

      // Display results
      logger.info('📊 Benchmark Results:', {
        duration: `${results.summary.duration / 1000}s`,
        totalRequests: results.summary.totalRequests,
        successRate: `${((results.summary.successfulRequests / results.summary.totalRequests) * 100).toFixed(2)}%`,
        averageLatency: `${results.performance.latency.average.toFixed(2)}ms`,
        p95Latency: `${results.performance.latency.percentiles.p95.toFixed(2)}ms`,
        throughput: `${results.performance.throughput.requestsPerSecond.toFixed(2)} req/s`,
        peakMemory: `${results.performance.memory.peakUsage.toFixed(2)}MB`,
        memoryGrowthRate: `${results.performance.memory.growthRate.toFixed(2)}MB/min`
      });

      // Check for performance issues
      if (results.performance.latency.average > benchmarkProfile.expectations.maxResponseTime) {
        logger.warn('⚠️  Performance Warning: Average response time exceeds expectations');
      }

      if (results.performance.throughput.requestsPerSecond < benchmarkProfile.expectations.minThroughput) {
        logger.warn('⚠️  Performance Warning: Throughput below expectations');
      }

      if (results.summary.errorRate > benchmarkProfile.expectations.maxErrorRate) {
        logger.warn('⚠️  Performance Warning: Error rate exceeds expectations');
      }

      // Display recommendations
      if (results.recommendations.length > 0) {
        logger.info('💡 Performance Recommendations:');
        results.recommendations.forEach((rec, index) => {
          logger.info(`  ${index + 1}. ${rec}`);
        });
      }

    } catch (error) {
      logger.error('❌ Error during benchmarking demo:', error);
    }
  }

  async demonstrateMemoryOptimization() {
    logger.info('🧠 Demonstrating memory optimization and leak detection');

    try {
      logger.info('📊 Current memory usage:');
      const initialMemory = process.memoryUsage();
      logger.info({
        heapUsed: `${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(initialMemory.rss / 1024 / 1024).toFixed(2)}MB`
      });

      // Simulate memory-intensive operations
      logger.info('🔄 Performing memory-intensive operations...');
      
      const largeDataSets = [];
      for (let i = 0; i < 10; i++) {
        const companies = await this.client.companies.list({ 
          pageSize: 100,
          includeFields: 'id,companyName,companyNumber,phone,address1,address2,city,state,postalCode,country,website'
        });
        
        const tickets = await this.client.tickets.list({
          pageSize: 100,
          includeFields: 'id,ticketNumber,title,description,status,priority,queueID,assignedResourceID,createDate,dueDateTime'
        });

        // Store references to prevent garbage collection (simulating potential memory leaks)
        largeDataSets.push({ companies, tickets });
        
        // Add some processing delay
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const dashboard = this.performance.getDashboard();
      logger.info('📊 Memory analysis after intensive operations:', {
        currentMemory: `${dashboard.performance.metrics.memoryUsage.toFixed(2)}MB`,
        peakMemory: `${dashboard.performance.metrics.peakMemoryUsage.toFixed(2)}MB`,
        memoryGrowth: `${((dashboard.performance.metrics.memoryUsage - (initialMemory.heapUsed / 1024 / 1024))).toFixed(2)}MB`,
        activeHandles: process._getActiveHandles().length,
        activeRequests: process._getActiveRequests().length
      });

      // Force garbage collection if available
      if (global.gc) {
        logger.info('🗑️  Forcing garbage collection...');
        global.gc();
        
        const afterGC = process.memoryUsage();
        logger.info('📊 Memory after garbage collection:', {
          heapUsed: `${(afterGC.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          memoryFreed: `${((dashboard.performance.metrics.memoryUsage * 1024 * 1024 - afterGC.heapUsed) / 1024 / 1024).toFixed(2)}MB`
        });
      }

      // Get memory optimization suggestions
      const insights = this.performance.getPerformanceInsights();
      if (insights.bottlenecks.some(b => b.component.includes('Memory'))) {
        logger.warn('⚠️  Memory bottlenecks detected:');
        insights.bottlenecks
          .filter(b => b.component.includes('Memory'))
          .forEach(bottleneck => {
            logger.warn(`  - ${bottleneck.issue}: ${bottleneck.recommendation}`);
          });
      }

      // Clean up references
      largeDataSets.length = 0;

    } catch (error) {
      logger.error('❌ Error during memory optimization demo:', error);
    }
  }

  async generatePerformanceReport() {
    logger.info('📈 Generating comprehensive performance report');

    try {
      const dashboard = this.performance.getDashboard();
      const insights = this.performance.getPerformanceInsights();

      logger.info('\n📊 COMPREHENSIVE PERFORMANCE REPORT');
      logger.info('=====================================');
      
      // Performance Summary
      logger.info('\n🔍 PERFORMANCE SUMMARY:');
      logger.info(`  Total Requests: ${dashboard.performance.metrics.totalRequests}`);
      logger.info(`  Success Rate: ${((dashboard.performance.metrics.successfulRequests / dashboard.performance.metrics.totalRequests) * 100).toFixed(2)}%`);
      logger.info(`  Average Response Time: ${dashboard.performance.metrics.averageResponseTime.toFixed(2)}ms`);
      logger.info(`  Throughput: ${dashboard.performance.metrics.throughput.toFixed(2)} requests/second`);
      logger.info(`  Error Rate: ${dashboard.performance.metrics.errorRate.toFixed(2)}%`);

      // Cache Performance
      logger.info('\n💾 CACHE PERFORMANCE:');
      logger.info(`  Hit Rate: ${dashboard.cache.stats.hitRate.toFixed(2)}%`);
      logger.info(`  Total Entries: ${dashboard.cache.stats.entries}`);
      logger.info(`  Cache Utilization: ${dashboard.cache.stats.utilization.toFixed(2)}%`);
      logger.info(`  Evictions: ${dashboard.cache.stats.evictions}`);
      logger.info(`  Efficiency Score: ${dashboard.cache.metrics.efficiencyScore}/100`);

      // Optimization Results
      logger.info('\n⚡ OPTIMIZATION RESULTS:');
      logger.info(`  Batched Requests: ${dashboard.optimization.metrics.batchedRequests}`);
      logger.info(`  Deduplicated Requests: ${dashboard.optimization.metrics.deduplicatedRequests}`);
      logger.info(`  Compressed Responses: ${dashboard.optimization.metrics.compressedResponses}`);
      logger.info(`  Bandwidth Saved: ${(dashboard.optimization.metrics.bandwidthSaved / 1024).toFixed(2)}KB`);
      logger.info(`  Time Saved: ${dashboard.optimization.metrics.timeSaved.toFixed(2)}ms`);

      // Memory Analysis
      logger.info('\n🧠 MEMORY ANALYSIS:');
      logger.info(`  Current Usage: ${dashboard.performance.metrics.memoryUsage.toFixed(2)}MB`);
      logger.info(`  Peak Usage: ${dashboard.performance.metrics.peakMemoryUsage.toFixed(2)}MB`);
      logger.info(`  CPU Usage: ${dashboard.performance.metrics.cpuUsage.toFixed(2)}%`);

      // Performance Insights
      if (insights.bottlenecks.length > 0) {
        logger.info('\n⚠️  PERFORMANCE BOTTLENECKS:');
        insights.bottlenecks.forEach((bottleneck, index) => {
          logger.warn(`  ${index + 1}. ${bottleneck.component}: ${bottleneck.issue}`);
          logger.info(`     💡 ${bottleneck.recommendation}`);
        });
      }

      if (insights.opportunities.length > 0) {
        logger.info('\n🚀 OPTIMIZATION OPPORTUNITIES:');
        insights.opportunities.forEach((opportunity, index) => {
          logger.info(`  ${index + 1}. ${opportunity.area}: ${opportunity.potential}`);
          logger.info(`     🔧 ${opportunity.implementation}`);
        });
      }

      // Recommendations
      if (dashboard.recommendations.length > 0) {
        logger.info('\n💡 RECOMMENDATIONS:');
        dashboard.recommendations.forEach((recommendation, index) => {
          logger.info(`  ${index + 1}. ${recommendation}`);
        });
      }

      logger.info('\n✅ Performance report generation completed');

    } catch (error) {
      logger.error('❌ Error generating performance report:', error);
    }
  }

  async cleanup() {
    logger.info('🧹 Cleaning up performance demo');

    try {
      // Disable performance monitoring
      this.performance.disable();
      
      logger.info('✅ Performance demo cleanup completed');
    } catch (error) {
      logger.error('❌ Error during cleanup:', error);
    }
  }
}

// Main execution
async function main() {
  const demo = new PerformanceDemo();

  try {
    // Check for required environment variables
    if (!process.env.AUTOTASK_USERNAME || !process.env.AUTOTASK_INTEGRATION_CODE || !process.env.AUTOTASK_SECRET) {
      logger.error('❌ Required environment variables not set:');
      logger.error('   AUTOTASK_USERNAME, AUTOTASK_INTEGRATION_CODE, AUTOTASK_SECRET');
      logger.error('   Please create a .env file with your AutoTask credentials');
      process.exit(1);
    }

    await demo.initialize();
    
    logger.info('\n🎬 Starting Enterprise Performance Demonstration\n');

    // Run demonstration phases
    await demo.demonstrateBasicOperations();
    await demo.demonstrateCacheOptimization();
    await demo.demonstrateMemoryOptimization();
    await demo.demonstrateBenchmarking();
    
    // Generate final report
    await demo.generatePerformanceReport();

    logger.info('\n🎉 Performance demonstration completed successfully!');
    logger.info('📝 Check performance-demo.log for detailed logs');
    
  } catch (error) {
    logger.error('💥 Performance demo failed:', error);
    process.exit(1);
  } finally {
    await demo.cleanup();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('\n⏹️  Shutting down performance demo...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('\n⏹️  Shutting down performance demo...');
  process.exit(0);
});

// Run the demo
if (require.main === module) {
  main().catch(error => {
    logger.error('💥 Unhandled error in performance demo:', error);
    process.exit(1);
  });
}

export { PerformanceDemo };