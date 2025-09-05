/**
 * Cache Strategy Implementation System
 * 
 * Implements different caching strategies for various scenarios including
 * write-through, lazy loading, refresh-ahead, and write-behind patterns.
 */

import { EventEmitter } from 'events';
import { ICacheStore, CacheStrategy, CacheKeyContext, CacheResult, toError } from './types';
import { CacheKeyGenerator } from './CacheKeyGenerator';
import { TTLManager } from './TTLManager';
import { CacheMetricsCollector } from './CacheMetrics';
import { ErrorLogger, LogContext, defaultErrorLogger } from '../errors/ErrorLogger';

/**
 * Data fetch function type for strategies
 */
export type DataFetcher<T = any> = () => Promise<T>;

/**
 * Strategy execution context
 */
export interface StrategyContext {
  /** Cache key context */
  keyContext: CacheKeyContext;
  /** Data fetcher function */
  fetcher: DataFetcher;
  /** Custom TTL override */
  customTtl?: number;
  /** Custom tags */
  tags?: string[];
  /** Force refresh flag */
  forceRefresh?: boolean;
  /** Request timestamp */
  timestamp: number;
}

/**
 * Strategy execution result
 */
export interface StrategyResult<T = any> {
  /** The retrieved/cached value */
  value: T;
  /** Whether this was a cache hit */
  fromCache: boolean;
  /** Strategy that was executed */
  strategy: CacheStrategy;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Whether data was refreshed */
  refreshed: boolean;
  /** Error if strategy failed */
  error?: Error;
}

/**
 * Refresh-ahead configuration
 */
export interface RefreshAheadConfig {
  /** Refresh threshold as percentage of TTL (0-1) */
  refreshThreshold: number;
  /** Maximum concurrent refresh operations */
  maxConcurrentRefresh: number;
  /** Background refresh timeout in milliseconds */
  refreshTimeout: number;
  /** Whether to return stale data while refreshing */
  allowStaleWhileRefresh: boolean;
}

/**
 * Write-behind configuration
 */
export interface WriteBehindConfig {
  /** Write delay in milliseconds */
  writeDelay: number;
  /** Maximum number of pending writes */
  maxPendingWrites: number;
  /** Write batch size */
  batchSize: number;
  /** Write retry attempts */
  retryAttempts: number;
  /** Whether to coalesce multiple writes to same key */
  coalesceWrites: boolean;
}

/**
 * Cache strategy executor
 */
export class CacheStrategyExecutor extends EventEmitter {
  private store: ICacheStore;
  private keyGenerator: CacheKeyGenerator;
  private ttlManager: TTLManager;
  private metrics: CacheMetricsCollector;
  private logger: ErrorLogger;

  // Refresh-ahead state
  private refreshInProgress = new Set<string>();
  private refreshAheadConfig: RefreshAheadConfig = {
    refreshThreshold: 0.8,
    maxConcurrentRefresh: 5,
    refreshTimeout: 30000,
    allowStaleWhileRefresh: true
  };

  // Write-behind state
  private pendingWrites = new Map<string, { context: StrategyContext; value: any; timestamp: number }>();
  private writeBehindTimer?: NodeJS.Timeout;
  private writeBehindConfig: WriteBehindConfig = {
    writeDelay: 5000,
    maxPendingWrites: 1000,
    batchSize: 50,
    retryAttempts: 3,
    coalesceWrites: true
  };

  constructor(
    store: ICacheStore,
    keyGenerator: CacheKeyGenerator,
    ttlManager: TTLManager,
    metrics: CacheMetricsCollector,
    logger: ErrorLogger = defaultErrorLogger
  ) {
    super();
    
    this.store = store;
    this.keyGenerator = keyGenerator;
    this.ttlManager = ttlManager;
    this.metrics = metrics;
    this.logger = logger;

    this.startWriteBehindProcessor();
  }

  /**
   * Execute a cache strategy
   */
  async execute<T>(context: StrategyContext, strategy: CacheStrategy): Promise<StrategyResult<T>> {
    const startTime = performance.now();
    const logContext: LogContext = {
      operation: 'cache_strategy_execute',
      correlationId: this.generateCorrelationId()
    };

    try {
      let result: StrategyResult<T>;

      switch (strategy) {
        case CacheStrategy.WRITE_THROUGH:
          result = await this.executeWriteThrough<T>(context);
          break;

        case CacheStrategy.LAZY_LOADING:
          result = await this.executeLazyLoading<T>(context);
          break;

        case CacheStrategy.REFRESH_AHEAD:
          result = await this.executeRefreshAhead<T>(context);
          break;

        case CacheStrategy.WRITE_BEHIND:
          result = await this.executeWriteBehind<T>(context);
          break;

        case CacheStrategy.NONE:
          result = await this.executeNoCache<T>(context);
          break;

        default:
          throw new Error(`Unsupported cache strategy: ${strategy}`);
      }

      result.executionTime = performance.now() - startTime;
      result.strategy = strategy;

      // Record metrics
      if (result.fromCache) {
        this.metrics.recordHit(context.keyContext.entityType, 
          this.keyGenerator.generateKey(context.keyContext), 
          result.executionTime);
      } else {
        this.metrics.recordMiss(context.keyContext.entityType, 
          this.keyGenerator.generateKey(context.keyContext), 
          result.executionTime);
      }

      return result;

    } catch (error) {
      this.logger.error('Cache strategy execution error', toError(error), {
        ...logContext,
        metadata: { strategy, entityType: context.keyContext.entityType }
      });

      const executionTime = performance.now() - startTime;
      this.metrics.recordError(context.keyContext.entityType, 'strategy_execute', error as Error);

      return {
        value: await context.fetcher(), // Fallback to direct fetch
        fromCache: false,
        strategy,
        executionTime,
        refreshed: false,
        error: error as Error
      };
    }
  }

  /**
   * Update refresh-ahead configuration
   */
  updateRefreshAheadConfig(config: Partial<RefreshAheadConfig>): void {
    this.refreshAheadConfig = { ...this.refreshAheadConfig, ...config };
  }

  /**
   * Update write-behind configuration
   */
  updateWriteBehindConfig(config: Partial<WriteBehindConfig>): void {
    this.writeBehindConfig = { ...this.writeBehindConfig, ...config };
  }

  /**
   * Get pending write count
   */
  getPendingWriteCount(): number {
    return this.pendingWrites.size;
  }

  /**
   * Force flush pending writes
   */
  async flushPendingWrites(): Promise<number> {
    return await this.processPendingWrites();
  }

  /**
   * Shutdown strategy executor
   */
  async shutdown(): Promise<void> {
    if (this.writeBehindTimer) {
      clearInterval(this.writeBehindTimer);
      this.writeBehindTimer = undefined;
    }

    // Flush any pending writes
    await this.flushPendingWrites();
    
    // Clear state
    this.refreshInProgress.clear();
    this.pendingWrites.clear();
  }

  /**
   * Execute write-through strategy
   */
  private async executeWriteThrough<T>(context: StrategyContext): Promise<StrategyResult<T>> {
    const key = this.keyGenerator.generateKey(context.keyContext);

    // Always fetch fresh data and cache it
    const value = await context.fetcher();
    const ttlResult = this.ttlManager.calculateTTL({
      ...context.keyContext,
      timestamp: context.timestamp,
      responseData: value
    });

    const finalTtl = context.customTtl || ttlResult.ttl;
    await this.store.set(key, value, finalTtl, context.tags);

    this.metrics.recordSet(context.keyContext.entityType, key, 
      this.estimateSize(value), finalTtl);

    return {
      value,
      fromCache: false,
      strategy: CacheStrategy.WRITE_THROUGH,
      executionTime: 0,
      refreshed: true
    };
  }

  /**
   * Execute lazy loading strategy (cache-aside)
   */
  private async executeLazyLoading<T>(context: StrategyContext): Promise<StrategyResult<T>> {
    const key = this.keyGenerator.generateKey(context.keyContext);

    // Try to get from cache first
    if (!context.forceRefresh) {
      const cacheResult = await this.store.get<T>(key);
      
      if (cacheResult.hit && cacheResult.value !== undefined) {
        return {
          value: cacheResult.value,
          fromCache: true,
          strategy: CacheStrategy.LAZY_LOADING,
          executionTime: 0,
          refreshed: false
        };
      }
    }

    // Cache miss - fetch data and cache it
    const value = await context.fetcher();
    const ttlResult = this.ttlManager.calculateTTL({
      ...context.keyContext,
      timestamp: context.timestamp,
      responseData: value
    });

    const finalTtl = context.customTtl || ttlResult.ttl;
    await this.store.set(key, value, finalTtl, context.tags);

    this.metrics.recordSet(context.keyContext.entityType, key, 
      this.estimateSize(value), finalTtl);

    return {
      value,
      fromCache: false,
      strategy: CacheStrategy.LAZY_LOADING,
      executionTime: 0,
      refreshed: true
    };
  }

  /**
   * Execute refresh-ahead strategy
   */
  private async executeRefreshAhead<T>(context: StrategyContext): Promise<StrategyResult<T>> {
    const key = this.keyGenerator.generateKey(context.keyContext);

    // Check if force refresh is requested
    if (context.forceRefresh) {
      return await this.refreshAndReturn<T>(context, key);
    }

    // Try to get from cache
    const cacheResult = await this.store.get<T>(key);
    
    if (!cacheResult.hit || cacheResult.value === undefined) {
      // Cache miss - fetch and cache
      return await this.refreshAndReturn<T>(context, key);
    }

    // Cache hit - check if refresh is needed
    const entry = cacheResult.metadata;
    if (entry) {
      const age = Date.now() - entry.createdAt;
      const refreshThresholdAge = entry.ttl * this.refreshAheadConfig.refreshThreshold;

      if (age >= refreshThresholdAge && 
          !this.refreshInProgress.has(key) &&
          this.refreshInProgress.size < this.refreshAheadConfig.maxConcurrentRefresh) {
        
        // Trigger background refresh
        this.triggerBackgroundRefresh(context, key);
      }
    }

    return {
      value: cacheResult.value,
      fromCache: true,
      strategy: CacheStrategy.REFRESH_AHEAD,
      executionTime: 0,
      refreshed: false
    };
  }

  /**
   * Execute write-behind strategy
   */
  private async executeWriteBehind<T>(context: StrategyContext): Promise<StrategyResult<T>> {
    const key = this.keyGenerator.generateKey(context.keyContext);

    // Try to get from cache first
    if (!context.forceRefresh) {
      const cacheResult = await this.store.get<T>(key);
      
      if (cacheResult.hit && cacheResult.value !== undefined) {
        return {
          value: cacheResult.value,
          fromCache: true,
          strategy: CacheStrategy.WRITE_BEHIND,
          executionTime: 0,
          refreshed: false
        };
      }
    }

    // Cache miss - fetch data and schedule write-behind
    const value = await context.fetcher();
    
    if (this.pendingWrites.size < this.writeBehindConfig.maxPendingWrites) {
      // Schedule write-behind
      if (this.writeBehindConfig.coalesceWrites) {
        // Replace existing write for same key
        this.pendingWrites.set(key, {
          context,
          value,
          timestamp: Date.now()
        });
      } else if (!this.pendingWrites.has(key)) {
        // Only add if not already pending
        this.pendingWrites.set(key, {
          context,
          value,
          timestamp: Date.now()
        });
      }
    } else {
      // Too many pending writes, cache immediately
      const ttlResult = this.ttlManager.calculateTTL({
        ...context.keyContext,
        timestamp: context.timestamp,
        responseData: value
      });

      const finalTtl = context.customTtl || ttlResult.ttl;
      await this.store.set(key, value, finalTtl, context.tags);
      
      this.metrics.recordSet(context.keyContext.entityType, key, 
        this.estimateSize(value), finalTtl);
    }

    return {
      value,
      fromCache: false,
      strategy: CacheStrategy.WRITE_BEHIND,
      executionTime: 0,
      refreshed: true
    };
  }

  /**
   * Execute no-cache strategy
   */
  private async executeNoCache<T>(context: StrategyContext): Promise<StrategyResult<T>> {
    const value = await context.fetcher();

    return {
      value,
      fromCache: false,
      strategy: CacheStrategy.NONE,
      executionTime: 0,
      refreshed: true
    };
  }

  /**
   * Refresh data and return result
   */
  private async refreshAndReturn<T>(context: StrategyContext, key: string): Promise<StrategyResult<T>> {
    const value = await context.fetcher();
    const ttlResult = this.ttlManager.calculateTTL({
      ...context.keyContext,
      timestamp: context.timestamp,
      responseData: value
    });

    const finalTtl = context.customTtl || ttlResult.ttl;
    await this.store.set(key, value, finalTtl, context.tags);

    this.metrics.recordSet(context.keyContext.entityType, key, 
      this.estimateSize(value), finalTtl);

    return {
      value,
      fromCache: false,
      strategy: CacheStrategy.REFRESH_AHEAD,
      executionTime: 0,
      refreshed: true
    };
  }

  /**
   * Trigger background refresh for refresh-ahead strategy
   */
  private triggerBackgroundRefresh(context: StrategyContext, key: string): void {
    this.refreshInProgress.add(key);

    // Run refresh in background
    Promise.race([
      context.fetcher(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Refresh timeout')), this.refreshAheadConfig.refreshTimeout)
      )
    ]).then(async (value) => {
      // Update cache with fresh data
      const ttlResult = this.ttlManager.calculateTTL({
        ...context.keyContext,
        timestamp: Date.now(),
        responseData: value
      });

      const finalTtl = context.customTtl || ttlResult.ttl;
      await this.store.set(key, value, finalTtl, context.tags);

      this.metrics.recordSet(context.keyContext.entityType, key, 
        this.estimateSize(value), finalTtl);

      this.emit('refresh_completed', { key, value, success: true });

    }).catch((error) => {
      this.logger.error('Background refresh failed', toError(error), {
        operation: 'background_refresh',
        correlationId: this.generateCorrelationId(),
        metadata: { key, entityType: context.keyContext.entityType }
      });

      this.emit('refresh_completed', { key, error: toError(error), success: false });

    }).finally(() => {
      this.refreshInProgress.delete(key);
    });
  }

  /**
   * Start write-behind processor
   */
  private startWriteBehindProcessor(): void {
    this.writeBehindTimer = setInterval(async () => {
      await this.processPendingWrites();
    }, this.writeBehindConfig.writeDelay);
  }

  /**
   * Process pending writes for write-behind strategy
   */
  private async processPendingWrites(): Promise<number> {
    if (this.pendingWrites.size === 0) {
      return 0;
    }

    const writes = Array.from(this.pendingWrites.entries()).slice(0, this.writeBehindConfig.batchSize);
    let processedCount = 0;

    for (const [key, writeData] of writes) {
      try {
        const { context, value } = writeData;
        const ttlResult = this.ttlManager.calculateTTL({
          ...context.keyContext,
          timestamp: Date.now(),
          responseData: value
        });

        const finalTtl = context.customTtl || ttlResult.ttl;
        const success = await this.store.set(key, value, finalTtl, context.tags);

        if (success) {
          this.pendingWrites.delete(key);
          processedCount++;
          
          this.metrics.recordSet(context.keyContext.entityType, key, 
            this.estimateSize(value), finalTtl);
        }

      } catch (error) {
        this.logger.error('Write-behind processing error', error as Error, {
          operation: 'write_behind_process',
          correlationId: this.generateCorrelationId(),
          metadata: { key }
        });

        // Remove failed writes after retry attempts (implement retry logic if needed)
        this.pendingWrites.delete(key);
      }
    }

    return processedCount;
  }

  /**
   * Estimate size of a value
   */
  private estimateSize(value: any): number {
    try {
      return Buffer.byteLength(JSON.stringify(value), 'utf8');
    } catch {
      return 1000; // Fallback estimate
    }
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `strategy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}