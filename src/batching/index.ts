/**
 * Autotask SDK Batch Processing System
 * 
 * A comprehensive request batching and optimization system designed for the Autotask REST API.
 * Provides intelligent batching strategies, request optimization, queue management, 
 * performance monitoring, and detailed result analysis.
 * 
 * @example
 * ```typescript
 * import { BatchManager, BatchConfig } from '@autotask/batch';
 * 
 * // Initialize with configuration
 * const config: BatchConfig = {
 *   maxBatchSize: 200,
 *   minBatchSize: 5,
 *   maxWaitTime: 5000,
 *   defaultStrategy: 'hybrid',
 *   enableDeduplication: true,
 *   enableCoalescing: true
 * };
 * 
 * const batchManager = new BatchManager(config, processor, logger);
 * 
 * // Add requests for batching
 * await batchManager.addRequest({
 *   id: 'req-1',
 *   endpoint: '/tickets',
 *   method: 'POST',
 *   zone: 'zone1',
 *   priority: 5,
 *   data: ticketData,
 *   batchable: true,
 *   batchHints: {
 *     preferredBatchSize: 50,
 *     maxDelay: 3000
 *   }
 * });
 * 
 * // Monitor performance
 * const metrics = batchManager.getMetrics();
 * console.log('Success rate:', metrics.batchMetrics.successRate);
 * console.log('Throughput:', metrics.batchMetrics.throughput, 'req/s');
 * 
 * // Check system health
 * const health = batchManager.getHealth();
 * console.log('System status:', health.status);
 * ```
 */

// Core types and interfaces
export * from './types';

// Main batch manager
export { BatchManager } from './BatchManager';

// Individual components (for advanced usage)
export { BatchQueue } from './BatchQueue';
export { BatchOptimizer } from './BatchOptimizer';
export { BatchMetricsCollector } from './BatchMetrics';
export { 
  BatchResultBuilder, 
  BatchResultAnalyzer,
  type BatchAnalysis,
  type PerformanceAnalysis,
  type ErrorAnalysis,
  type QualityAssessment,
  type AggregateAnalysis,
  type BatchReport
} from './BatchResult';

// Batch strategies
export {
  BatchStrategyFactory,
  SizeBasedStrategy,
  TimeBasedStrategy,
  HybridStrategy,
  PriorityAwareStrategy,
  AdaptiveStrategy
} from './BatchStrategy';

// Utility functions and helpers

/**
 * Create a default batch configuration for common use cases
 */
export function createDefaultBatchConfig(): Required<import('./types').BatchConfig> {
  return {
    maxBatchSize: 200, // Autotask supports up to 500, but 200 is typically optimal
    minBatchSize: 5,
    maxWaitTime: 5000, // 5 seconds
    defaultStrategy: 'hybrid',
    enableDeduplication: true,
    enableCoalescing: true,
    enableAdaptiveSizing: true,
    retryConfig: {
      maxRetries: 3,
      baseDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 30000
    },
    circuitBreakerConfig: {
      enabled: true,
      failureThreshold: 5,
      timeout: 30000
    }
  };
}

/**
 * Create optimized batch configuration for high-throughput scenarios
 */
export function createHighThroughputBatchConfig(): Required<import('./types').BatchConfig> {
  return {
    maxBatchSize: 500, // Maximum Autotask limit
    minBatchSize: 10,
    maxWaitTime: 2000, // Shorter wait time for faster processing
    defaultStrategy: 'size-based', // Focus on size for throughput
    enableDeduplication: true,
    enableCoalescing: false, // Disable to reduce processing overhead
    enableAdaptiveSizing: true,
    retryConfig: {
      maxRetries: 2, // Fewer retries for speed
      baseDelay: 500,
      backoffMultiplier: 1.5,
      maxDelay: 10000
    },
    circuitBreakerConfig: {
      enabled: true,
      failureThreshold: 10, // Higher threshold for high-volume
      timeout: 15000
    }
  };
}

/**
 * Create batch configuration optimized for low-latency scenarios
 */
export function createLowLatencyBatchConfig(): Required<import('./types').BatchConfig> {
  return {
    maxBatchSize: 50, // Smaller batches for faster processing
    minBatchSize: 1,
    maxWaitTime: 1000, // Very short wait time
    defaultStrategy: 'priority-aware', // Prioritize urgent requests
    enableDeduplication: true,
    enableCoalescing: false, // Skip optimization for speed
    enableAdaptiveSizing: false,
    retryConfig: {
      maxRetries: 3,
      baseDelay: 100,
      backoffMultiplier: 1.5,
      maxDelay: 5000
    },
    circuitBreakerConfig: {
      enabled: true,
      failureThreshold: 3, // Lower threshold for quick failure detection
      timeout: 10000
    }
  };
}

/**
 * Create batch configuration for development and testing
 */
export function createDevelopmentBatchConfig(): Required<import('./types').BatchConfig> {
  return {
    maxBatchSize: 10, // Small batches for easier debugging
    minBatchSize: 1,
    maxWaitTime: 10000, // Longer wait time for manual testing
    defaultStrategy: 'time-based',
    enableDeduplication: true,
    enableCoalescing: true,
    enableAdaptiveSizing: false, // Predictable behavior for testing
    retryConfig: {
      maxRetries: 1, // Fewer retries for faster failure
      baseDelay: 1000,
      backoffMultiplier: 1,
      maxDelay: 5000
    },
    circuitBreakerConfig: {
      enabled: false, // Disabled for easier debugging
      failureThreshold: 5,
      timeout: 30000
    }
  };
}

/**
 * Utility function to create a batch request from a regular request
 */
export function createBatchRequest(
  request: Omit<import('./types').BatchRequest, 'batchable'>,
  batchHints?: import('./types').BatchHints
): import('./types').BatchRequest {
  return {
    ...request,
    batchable: true,
    batchHints
  };
}

/**
 * Utility function to calculate optimal batch size based on request characteristics
 */
export function calculateOptimalBatchSize(
  requests: import('./types').BatchRequest[],
  maxSize: number = 200
): number {
  if (requests.length === 0) return 1;
  
  // Consider average data size
  const avgDataSize = requests.reduce((sum, req) => {
    if (req.data) {
      try {
        return sum + JSON.stringify(req.data).length;
      } catch {
        return sum + 1000; // Estimate for non-serializable data
      }
    }
    return sum;
  }, 0) / requests.length;
  
  // Adjust batch size based on data size
  let optimalSize = maxSize;
  
  if (avgDataSize > 10000) { // Large data objects
    optimalSize = Math.min(50, maxSize);
  } else if (avgDataSize > 5000) { // Medium data objects
    optimalSize = Math.min(100, maxSize);
  }
  
  // Consider priority distribution
  const highPriorityCount = requests.filter(r => r.priority >= 8).length;
  const highPriorityRatio = highPriorityCount / requests.length;
  
  if (highPriorityRatio > 0.5) {
    optimalSize = Math.min(optimalSize, 30); // Smaller batches for high priority
  }
  
  return Math.max(1, optimalSize);
}

/**
 * Utility function to analyze batch performance and provide recommendations
 */
export function analyzeBatchPerformance(
  results: import('./types').BatchResult[]
): {
  overallSuccessRate: number;
  averageProcessingTime: number;
  throughput: number;
  recommendations: string[];
} {
  if (results.length === 0) {
    return {
      overallSuccessRate: 0,
      averageProcessingTime: 0,
      throughput: 0,
      recommendations: ['No batch results to analyze']
    };
  }
  
  const totalRequests = results.reduce((sum, r) => sum + r.results.length, 0);
  const successfulRequests = results.reduce((sum, r) => 
    sum + r.results.filter(req => req.success).length, 0
  );
  
  const overallSuccessRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;
  const averageProcessingTime = results.reduce((sum, r) => sum + r.metadata.processingTime, 0) / results.length;
  
  // Calculate throughput (requests per second)
  const totalTime = results.reduce((sum, r) => sum + r.metadata.processingTime, 0) / 1000;
  const throughput = totalTime > 0 ? totalRequests / totalTime : 0;
  
  const recommendations: string[] = [];
  
  // Success rate analysis
  if (overallSuccessRate < 0.8) {
    recommendations.push('Overall success rate is low - consider reducing batch sizes or reviewing request validation');
  }
  
  if (overallSuccessRate < 0.5) {
    recommendations.push('Critical: Very low success rate detected - immediate investigation required');
  }
  
  // Performance analysis
  if (averageProcessingTime > 10000) {
    recommendations.push('High processing times detected - consider smaller batch sizes or performance optimization');
  }
  
  if (throughput < 10) {
    recommendations.push('Low throughput detected - consider increasing batch sizes or parallel processing');
  }
  
  // Size distribution analysis
  const avgBatchSize = totalRequests / results.length;
  if (avgBatchSize < 10 && averageProcessingTime > 2000) {
    recommendations.push('Small batches with high processing time - consider larger batch sizes for better efficiency');
  }
  
  if (avgBatchSize > 100 && overallSuccessRate < 0.9) {
    recommendations.push('Large batches with low success rate - consider smaller batch sizes for better reliability');
  }
  
  // Strategy recommendations
  const strategyUsage = new Map<string, number>();
  results.forEach(r => {
    const strategy = r.metadata.strategy;
    strategyUsage.set(strategy, (strategyUsage.get(strategy) || 0) + 1);
  });
  
  if (strategyUsage.size > 1) {
    // Find best performing strategy
    const strategyPerformance = new Map<string, number>();
    results.forEach(r => {
      const strategy = r.metadata.strategy;
      const currentPerf = strategyPerformance.get(strategy) || 0;
      strategyPerformance.set(strategy, currentPerf + r.metadata.successRate);
    });
    
    let bestStrategy = '';
    let bestPerformance = 0;
    
    for (const [strategy, totalPerformance] of strategyPerformance) {
      const avgPerformance = totalPerformance / (strategyUsage.get(strategy) || 1);
      if (avgPerformance > bestPerformance) {
        bestPerformance = avgPerformance;
        bestStrategy = strategy;
      }
    }
    
    if (bestStrategy && bestPerformance > overallSuccessRate + 0.1) {
      recommendations.push(`Consider using '${bestStrategy}' strategy - showing ${(bestPerformance * 100).toFixed(1)}% success rate`);
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Batch performance is within acceptable ranges');
  }
  
  return {
    overallSuccessRate,
    averageProcessingTime,
    throughput,
    recommendations
  };
}

/**
 * Version information
 */
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

/**
 * Feature flags for experimental functionality
 */
export const FEATURES = {
  EXPERIMENTAL_COALESCING: false,
  EXPERIMENTAL_ADAPTIVE_SIZING: true,
  EXPERIMENTAL_MACHINE_LEARNING: false,
  DEBUG_METRICS: process.env.NODE_ENV === 'development'
};

// Re-export commonly used types from queue system for convenience
export type {
  QueueBatch,
  QueueRequest,
  QueueRequestStatus
} from '../queue/types/QueueTypes';