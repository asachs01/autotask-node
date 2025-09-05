/**
 * Batch Strategy Implementation
 * 
 * Implements different batching strategies for optimal request processing:
 * - Size-based: Process when batch reaches target size
 * - Time-based: Process after timeout regardless of size
 * - Hybrid: Combination of size and time triggers
 * - Priority-aware: Consider request priorities in batching decisions
 * - Adaptive: Adjust based on system performance and load
 */

import { QueueBatch } from '../queue/types/QueueTypes';
import { IBatchStrategy, BatchContext, BatchStrategy as BatchStrategyType } from './types';

/**
 * Base batch strategy with common functionality
 */
abstract class BaseBatchStrategy implements IBatchStrategy {
  protected config: {
    maxBatchSize: number;
    minBatchSize: number;
    maxWaitTime: number;
  };

  constructor(config: { maxBatchSize: number; minBatchSize: number; maxWaitTime: number }) {
    this.config = config;
  }

  abstract readonly name: string;
  abstract shouldProcess(batch: QueueBatch): boolean;
  abstract getOptimalBatchSize(context: BatchContext): number;
  abstract getBatchTimeout(context: BatchContext): number;

  /**
   * Calculate age of batch in milliseconds
   */
  protected getBatchAge(batch: QueueBatch): number {
    return Date.now() - batch.createdAt.getTime();
  }

  /**
   * Get highest priority in batch
   */
  protected getBatchPriority(batch: QueueBatch): number {
    return Math.max(...batch.requests.map(r => r.priority));
  }

  /**
   * Check if batch has critical priority requests
   */
  protected hasCriticalPriority(batch: QueueBatch): boolean {
    return batch.requests.some(r => r.priority >= 9);
  }
}

/**
 * Size-based batching strategy
 * Processes batches when they reach the target size
 */
export class SizeBasedStrategy extends BaseBatchStrategy {
  readonly name = 'size-based';

  shouldProcess(batch: QueueBatch): boolean {
    // Process immediately if batch is full
    if (batch.requests.length >= this.config.maxBatchSize) {
      return true;
    }

    // Process if minimum size reached and has critical priority
    if (batch.requests.length >= this.config.minBatchSize && this.hasCriticalPriority(batch)) {
      return true;
    }

    // Don't process based on time in pure size strategy
    return false;
  }

  getOptimalBatchSize(context: BatchContext): number {
    // Under high load, use smaller batches for faster processing
    if (context.systemLoad > 0.8) {
      return Math.max(this.config.minBatchSize, Math.floor(this.config.maxBatchSize * 0.6));
    }

    // Under low load, use larger batches for efficiency
    if (context.systemLoad < 0.3) {
      return this.config.maxBatchSize;
    }

    // Normal load - use 80% of max size as target
    return Math.floor(this.config.maxBatchSize * 0.8);
  }

  getBatchTimeout(context: BatchContext): number {
    // Size-based strategy uses long timeouts as fallback
    return this.config.maxWaitTime * 2;
  }
}

/**
 * Time-based batching strategy
 * Processes batches after a timeout regardless of size
 */
export class TimeBasedStrategy extends BaseBatchStrategy {
  readonly name = 'time-based';

  shouldProcess(batch: QueueBatch): boolean {
    const age = this.getBatchAge(batch);
    
    // Process if timeout reached
    if (age >= batch.timeout) {
      return true;
    }

    // Process immediately for critical priority
    if (this.hasCriticalPriority(batch)) {
      return true;
    }

    // Process if batch is full (emergency fallback)
    if (batch.requests.length >= this.config.maxBatchSize) {
      return true;
    }

    return false;
  }

  getOptimalBatchSize(context: BatchContext): number {
    // Time-based strategy is less concerned with size
    // Use smaller target sizes for more frequent processing
    return Math.floor(this.config.maxBatchSize * 0.5);
  }

  getBatchTimeout(context: BatchContext): number {
    const basTimeout = this.config.maxWaitTime;
    
    // Shorter timeouts under high load
    if (context.systemLoad > 0.8) {
      return Math.floor(basTimeout * 0.6);
    }

    // Adjust based on queue depth
    if (context.queueDepth > 100) {
      return Math.floor(basTimeout * 0.7);
    }

    return basTimeout;
  }
}

/**
 * Hybrid batching strategy
 * Combines size and time triggers with intelligent decision making
 */
export class HybridStrategy extends BaseBatchStrategy {
  readonly name = 'hybrid';

  shouldProcess(batch: QueueBatch): boolean {
    const age = this.getBatchAge(batch);
    const size = batch.requests.length;
    const priority = this.getBatchPriority(batch);

    // Immediate processing conditions
    if (size >= this.config.maxBatchSize) return true;
    if (this.hasCriticalPriority(batch)) return true;
    if (age >= batch.timeout) return true;

    // High priority with reasonable size
    if (priority >= 7 && size >= Math.floor(this.config.maxBatchSize * 0.4)) {
      return true;
    }

    // Medium priority with good size or age
    if (priority >= 5) {
      if (size >= Math.floor(this.config.maxBatchSize * 0.6) || age >= batch.timeout * 0.7) {
        return true;
      }
    }

    // Minimum size with some age
    if (size >= this.config.minBatchSize && age >= batch.timeout * 0.3) {
      return true;
    }

    return false;
  }

  getOptimalBatchSize(context: BatchContext): number {
    let targetSize = Math.floor(this.config.maxBatchSize * 0.7);

    // Adjust for system load
    if (context.systemLoad > 0.8) {
      targetSize = Math.floor(targetSize * 0.7);
    } else if (context.systemLoad < 0.3) {
      targetSize = Math.floor(targetSize * 1.2);
    }

    // Adjust for queue depth
    if (context.queueDepth > 200) {
      targetSize = Math.floor(targetSize * 0.8);
    }

    return Math.max(this.config.minBatchSize, Math.min(this.config.maxBatchSize, targetSize));
  }

  getBatchTimeout(context: BatchContext): number {
    let timeout = this.config.maxWaitTime;

    // Adjust for system conditions
    if (context.systemLoad > 0.8 || context.queueDepth > 100) {
      timeout = Math.floor(timeout * 0.7);
    }

    // Adjust for recent performance
    if (context.recentPerformance.errorRate > 0.1) {
      timeout = Math.floor(timeout * 0.8); // Faster processing when errors are high
    }

    return Math.max(100, timeout); // Minimum 100ms timeout
  }
}

/**
 * Priority-aware batching strategy
 * Groups requests by priority and processes high-priority batches first
 */
export class PriorityAwareStrategy extends BaseBatchStrategy {
  readonly name = 'priority-aware';

  shouldProcess(batch: QueueBatch): boolean {
    const priority = this.getBatchPriority(batch);
    const size = batch.requests.length;
    const age = this.getBatchAge(batch);

    // Critical priority - process immediately with any size
    if (priority >= 9) return true;

    // High priority - lower size threshold
    if (priority >= 7) {
      return size >= Math.floor(this.config.maxBatchSize * 0.3) || 
             age >= this.config.maxWaitTime * 0.5;
    }

    // Medium priority - normal thresholds
    if (priority >= 5) {
      return size >= Math.floor(this.config.maxBatchSize * 0.6) || 
             age >= this.config.maxWaitTime * 0.8;
    }

    // Low priority - high thresholds
    return size >= this.config.maxBatchSize || age >= this.config.maxWaitTime;
  }

  getOptimalBatchSize(context: BatchContext): number {
    // Base size on recent performance and load
    let baseSize = Math.floor(this.config.maxBatchSize * 0.7);

    if (context.systemLoad > 0.8) {
      baseSize = Math.floor(baseSize * 0.8);
    }

    return Math.max(this.config.minBatchSize, baseSize);
  }

  getBatchTimeout(context: BatchContext): number {
    // Priority-aware strategy uses variable timeouts
    // Will be adjusted per-batch based on priority in batch creation
    return this.config.maxWaitTime;
  }
}

/**
 * Adaptive batching strategy
 * Continuously adjusts behavior based on system performance and conditions
 */
export class AdaptiveStrategy extends BaseBatchStrategy {
  readonly name = 'adaptive';
  
  private performanceHistory: Array<{
    timestamp: Date;
    avgResponseTime: number;
    successRate: number;
    batchSize: number;
    systemLoad: number;
  }> = [];

  shouldProcess(batch: QueueBatch): boolean {
    const context = this.getAdaptiveContext(batch);
    
    // Always process critical priority immediately
    if (this.hasCriticalPriority(batch)) return true;

    // Adaptive thresholds based on recent performance
    const sizeThreshold = this.getAdaptiveSizeThreshold(context);
    const timeThreshold = this.getAdaptiveTimeThreshold(context);

    return batch.requests.length >= sizeThreshold || 
           this.getBatchAge(batch) >= timeThreshold;
  }

  getOptimalBatchSize(context: BatchContext): number {
    // Learn from recent performance
    const recentPerformance = this.getRecentPerformance();
    
    let optimalSize = this.config.maxBatchSize * 0.7;

    // Adjust based on success rate
    if (recentPerformance.successRate < 0.9) {
      optimalSize *= 0.8; // Smaller batches when failing
    } else if (recentPerformance.successRate > 0.98) {
      optimalSize *= 1.1; // Larger batches when succeeding
    }

    // Adjust based on response time
    if (recentPerformance.avgResponseTime > 3000) {
      optimalSize *= 0.7; // Smaller batches when slow
    } else if (recentPerformance.avgResponseTime < 1000) {
      optimalSize *= 1.2; // Larger batches when fast
    }

    // Adjust for system load
    optimalSize *= (1 - context.systemLoad * 0.3);

    return Math.max(
      this.config.minBatchSize,
      Math.min(this.config.maxBatchSize, Math.floor(optimalSize))
    );
  }

  getBatchTimeout(context: BatchContext): number {
    const baseTimeout = this.config.maxWaitTime;
    const recentPerformance = this.getRecentPerformance();
    
    let adaptiveTimeout = baseTimeout;

    // Adjust based on response time
    if (recentPerformance.avgResponseTime > 2000) {
      adaptiveTimeout *= 0.8; // Shorter timeouts when slow
    }

    // Adjust for queue depth
    if (context.queueDepth > 100) {
      adaptiveTimeout *= 0.7;
    }

    // Adjust for system load
    adaptiveTimeout *= (1 - context.systemLoad * 0.4);

    return Math.max(100, Math.floor(adaptiveTimeout));
  }

  /**
   * Record performance data for adaptive learning
   */
  recordPerformance(
    avgResponseTime: number, 
    successRate: number, 
    batchSize: number, 
    systemLoad: number
  ): void {
    this.performanceHistory.push({
      timestamp: new Date(),
      avgResponseTime,
      successRate,
      batchSize,
      systemLoad
    });

    // Keep only recent history (last 100 entries)
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.splice(0, this.performanceHistory.length - 100);
    }
  }

  private getAdaptiveContext(batch: QueueBatch) {
    return {
      batchAge: this.getBatchAge(batch),
      batchSize: batch.requests.length,
      batchPriority: this.getBatchPriority(batch),
      recentPerformance: this.getRecentPerformance()
    };
  }

  private getAdaptiveSizeThreshold(context: any): number {
    const baseThreshold = this.config.maxBatchSize * 0.6;
    
    // Adjust based on performance
    if (context.recentPerformance.successRate < 0.9) {
      return Math.floor(baseThreshold * 0.7);
    }
    if (context.recentPerformance.avgResponseTime > 3000) {
      return Math.floor(baseThreshold * 0.8);
    }
    
    return Math.floor(baseThreshold);
  }

  private getAdaptiveTimeThreshold(context: any): number {
    const baseThreshold = this.config.maxWaitTime;
    
    // Adjust based on batch priority
    if (context.batchPriority >= 7) {
      return Math.floor(baseThreshold * 0.6);
    }
    
    // Adjust based on performance
    if (context.recentPerformance.avgResponseTime > 2000) {
      return Math.floor(baseThreshold * 0.8);
    }
    
    return baseThreshold;
  }

  private getRecentPerformance() {
    if (this.performanceHistory.length === 0) {
      return { avgResponseTime: 1000, successRate: 0.95 };
    }

    // Get recent entries (last 20)
    const recent = this.performanceHistory.slice(-20);
    
    return {
      avgResponseTime: recent.reduce((sum, p) => sum + p.avgResponseTime, 0) / recent.length,
      successRate: recent.reduce((sum, p) => sum + p.successRate, 0) / recent.length
    };
  }
}

/**
 * Strategy factory for creating batch strategies
 */
export class BatchStrategyFactory {
  private static strategies = new Map<BatchStrategyType, new (config: any) => IBatchStrategy>([
    ['size-based', SizeBasedStrategy],
    ['time-based', TimeBasedStrategy],
    ['hybrid', HybridStrategy],
    ['priority-aware', PriorityAwareStrategy],
    ['adaptive', AdaptiveStrategy]
  ]);

  /**
   * Create a batch strategy instance
   */
  static create(
    type: BatchStrategyType, 
    config: { maxBatchSize: number; minBatchSize: number; maxWaitTime: number }
  ): IBatchStrategy {
    const StrategyClass = this.strategies.get(type);
    if (!StrategyClass) {
      throw new Error(`Unknown batch strategy: ${type}`);
    }

    return new StrategyClass(config) as IBatchStrategy;
  }

  /**
   * Get available strategy types
   */
  static getAvailableStrategies(): BatchStrategyType[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Register a custom strategy
   */
  static registerStrategy(
    name: BatchStrategyType, 
    strategyClass: new (config: any) => IBatchStrategy
  ): void {
    this.strategies.set(name, strategyClass);
  }
}