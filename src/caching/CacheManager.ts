import { toError } from './types';
/**
 * Cache Manager - Main Cache System Coordinator
 * 
 * Orchestrates all caching components including stores, strategies, invalidation,
 * metrics, and provides the main interface for the Autotask SDK caching system.
 */

import { EventEmitter } from 'events';
import { 
  ICacheManager, 
  ICacheStore, 
  CacheConfig, 
  EntityCacheConfig,
  CacheKeyContext, 
  CacheResult, 
  CacheMetrics,
  CacheWarmupConfig,
  InvalidationPattern,
  CacheStrategy,
  CacheStorageType
} from './types';

import { createCacheStore, StoreConfigurations } from './stores';
import { CacheKeyGenerator, KeyStrategy } from './CacheKeyGenerator';
import { TTLManager, TTLStrategy } from './TTLManager';
import { CacheMetricsCollector, MetricEvent } from './CacheMetrics';
import { CacheInvalidator } from './CacheInvalidator';
import { CacheStrategyExecutor, StrategyContext } from './CacheStrategy';
import { ErrorLogger, LogContext, defaultErrorLogger } from '../errors/ErrorLogger';

/**
 * Circuit breaker for cache operations
 */
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
  nextAttempt: number;
}

/**
 * Main cache manager implementation
 */
export class CacheManager extends EventEmitter implements ICacheManager {
  private config: CacheConfig;
  private logger: ErrorLogger;

  // Core components
  private primaryStore!: ICacheStore;
  private fallbackStore?: ICacheStore;
  private keyGenerator!: CacheKeyGenerator;
  private ttlManager!: TTLManager;
  private metrics!: CacheMetricsCollector;
  private invalidator!: CacheInvalidator;
  private strategyExecutor!: CacheStrategyExecutor;

  // State management
  private initialized = false;
  private circuitBreaker: CircuitBreakerState = {
    failures: 0,
    lastFailure: 0,
    state: 'closed',
    nextAttempt: 0
  };

  // Cache stampede prevention
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(config: CacheConfig, logger: ErrorLogger = defaultErrorLogger) {
    super();
    
    this.config = config;
    this.logger = logger;

    // Initialize core components
    this.initializeComponents();
  }

  /**
   * Initialize the cache system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const context: LogContext = {
      operation: 'cache_manager_init',
      correlationId: this.generateCorrelationId()
    };

    try {
      this.logger.info('Initializing cache manager', context);

      // Initialize stores
      await this.initializeStores();

      // Setup event handlers
      this.setupEventHandlers();

      // Perform warmup if enabled
      if (this.config.enableWarmup) {
        await this.performInitialWarmup();
      }

      this.initialized = true;

      this.logger.info('Cache manager initialized successfully', {
        ...context,
        metadata: {
          primaryStore: this.config.storageType,
          fallbackStore: this.config.fallbackStorageType,
          enableMetrics: this.config.enableMetrics,
          enableWarmup: this.config.enableWarmup
        }
      });

      this.emit('initialized');

    } catch (error) {
      this.logger.error('Failed to initialize cache manager', toError(error), context);
      throw error;
    }
  }

  /**
   * Get a cached value
   */
  async get<T>(context: CacheKeyContext): Promise<CacheResult<T>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = performance.now();
    const logContext: LogContext = {
      operation: 'cache_get',
      correlationId: this.generateCorrelationId(),
      entityType: context.entityType
    };

    try {
      // Check circuit breaker
      if (this.isCircuitOpen()) {
        return {
          success: false,
          hit: false,
          error: new Error('Cache circuit breaker is open'),
          timing: performance.now() - startTime
        };
      }

      const key = this.keyGenerator.generateKey(context);

      // Check for stampede protection
      if (this.config.preventStampede) {
        const pending = this.pendingRequests.get(key);
        if (pending) {
          try {
            await pending;
          } catch {
            // Ignore errors in pending requests
          }
        }
      }

      // Get entity configuration
      const entityConfig = this.config.entityConfigs.get(context.entityType);
      const strategy = entityConfig?.strategy || CacheStrategy.LAZY_LOADING;

      // Create data fetcher (will be used if cache miss)
      const fetcher = async () => {
        throw new Error('No data fetcher provided - cache miss cannot be resolved');
      };

      // Create strategy context
      const strategyContext: StrategyContext = {
        keyContext: context,
        fetcher,
        customTtl: undefined,
        tags: entityConfig?.defaultTags,
        timestamp: Date.now()
      };

      // Execute strategy (for read operations, only lazy loading makes sense)
      if (strategy === CacheStrategy.LAZY_LOADING || strategy === CacheStrategy.REFRESH_AHEAD) {
        const result = await this.primaryStore.get<T>(key);
        
        if (result.hit) {
          this.metrics.recordHit(context.entityType, key, performance.now() - startTime);
          this.recordSuccess();
          
          return {
            success: true,
            value: result.value,
            hit: true,
            metadata: result.metadata,
            timing: performance.now() - startTime
          };
        }
      }

      // Cache miss
      this.metrics.recordMiss(context.entityType, key, performance.now() - startTime);
      
      return {
        success: true,
        hit: false,
        timing: performance.now() - startTime
      };

    } catch (error) {
      this.recordFailure();
      this.metrics.recordError(context.entityType, 'get', error as Error);
      
      this.logger.error('Cache get error', toError(error), {
        ...logContext,
        metadata: { entityType: context.entityType }
      });

      return {
        success: false,
        hit: false,
        error: toError(error),
        timing: performance.now() - startTime
      };
    }
  }

  /**
   * Cache a value
   */
  async set<T>(context: CacheKeyContext, value: T, customTtl?: number): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    const logContext: LogContext = {
      operation: 'cache_set',
      correlationId: this.generateCorrelationId(),
      entityType: context.entityType
    };

    try {
      // Check circuit breaker
      if (this.isCircuitOpen()) {
        return false;
      }

      const key = this.keyGenerator.generateKey(context);

      // Calculate TTL
      const ttlResult = this.ttlManager.calculateTTL({
        ...context,
        timestamp: Date.now(),
        responseData: value
      });

      const finalTtl = customTtl || ttlResult.ttl;
      
      // Get entity configuration
      const entityConfig = this.config.entityConfigs.get(context.entityType);
      const tags = entityConfig?.defaultTags || [];

      // Check if we should cache this value
      if (entityConfig && !this.shouldCache(value, entityConfig)) {
        return false;
      }

      // Prevent stampede by tracking this request
      let stampedePromise: Promise<boolean> | undefined;
      if (this.config.preventStampede) {
        stampedePromise = this.executeStampedeProtected(key, async () => {
          return await this.primaryStore.set(key, value, finalTtl, tags);
        });
        
        const result = await stampedePromise;
        return result;
      }

      // Set in primary store
      const success = await this.primaryStore.set(key, value, finalTtl, tags);
      
      if (success) {
        this.metrics.recordSet(context.entityType, key, this.estimateSize(value), finalTtl);
        this.recordSuccess();
        
        // Set in fallback store (fire and forget)
        if (this.fallbackStore) {
          this.fallbackStore.set(key, value, finalTtl, tags).catch(() => {
            // Ignore fallback errors
          });
        }
      } else {
        this.recordFailure();
      }

      return success;

    } catch (error) {
      this.recordFailure();
      this.metrics.recordError(context.entityType, 'set', error as Error);
      
      this.logger.error('Cache set error', toError(error), {
        ...logContext,
        metadata: { entityType: context.entityType }
      });

      return false;
    }
  }

  /**
   * Invalidate cache entries
   */
  async invalidate(pattern: InvalidationPattern, target: string | string[]): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    const logContext: LogContext = {
      operation: 'cache_invalidate',
      correlationId: this.generateCorrelationId()
    };

    try {
      const count = await this.invalidator.invalidate(pattern, target, undefined, {
        cascade: true
      });

      this.logger.info('Cache invalidation completed', {
        ...logContext,
        metadata: { pattern, targetCount: Array.isArray(target) ? target.length : 1, invalidatedCount: count }
      });

      return count;

    } catch (error) {
      this.logger.error('Cache invalidation error', toError(error), {
        ...logContext,
        metadata: { pattern, target }
      });
      throw error;
    }
  }

  /**
   * Invalidate cache based on entity changes
   */
  async invalidateByEntityChange(
    entityType: string,
    entityData: any,
    changeType: 'create' | 'update' | 'delete',
    entityId?: string
  ): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      return await this.invalidator.invalidateByEntityChange(
        entityType,
        entityData,
        changeType,
        entityId
      );
    } catch (error) {
      this.logger.error('Entity change invalidation error', toError(error), {
        operation: 'cache_invalidate_entity_change',
        correlationId: this.generateCorrelationId(),
        entityType,
        metadata: { changeType, entityId }
      });
      throw error;
    }
  }

  /**
   * Execute cache strategy with data fetcher
   */
  async executeStrategy<T>(
    context: CacheKeyContext,
    fetcher: () => Promise<T>,
    options?: {
      strategy?: CacheStrategy;
      customTtl?: number;
      tags?: string[];
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    if (!this.initialized) {
      await this.initialize();
    }

    const entityConfig = this.config.entityConfigs.get(context.entityType);
    const strategy = options?.strategy || entityConfig?.strategy || CacheStrategy.LAZY_LOADING;

    const strategyContext: StrategyContext = {
      keyContext: context,
      fetcher,
      customTtl: options?.customTtl,
      tags: options?.tags || entityConfig?.defaultTags,
      forceRefresh: options?.forceRefresh,
      timestamp: Date.now()
    };

    const result = await this.strategyExecutor.execute<T>(strategyContext, strategy);
    return result.value;
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return this.metrics.getMetrics();
  }

  /**
   * Warm up cache
   */
  async warmup(config?: CacheWarmupConfig): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const warmupConfig = config || {
      enabled: true,
      strategies: [],
      maxWarmupTime: 30000,
      concurrency: 3
    };

    const logContext: LogContext = {
      operation: 'cache_warmup',
      correlationId: this.generateCorrelationId()
    };

    try {
      this.logger.info('Starting cache warmup', {
        ...logContext,
        metadata: { strategiesCount: warmupConfig.strategies.length }
      });

      const startTime = Date.now();
      const promises: Promise<void>[] = [];

      // Process warmup strategies with concurrency control
      for (let i = 0; i < warmupConfig.strategies.length; i += warmupConfig.concurrency) {
        const batch = warmupConfig.strategies.slice(i, i + warmupConfig.concurrency);
        
        const batchPromises = batch.map(async (strategy) => {
          for (const entityType of strategy.entityTypes) {
            try {
              await Promise.race([
                strategy.execute(entityType),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Warmup timeout')), warmupConfig.maxWarmupTime)
                )
              ]);
            } catch (error) {
              this.logger.warn('Warmup strategy failed', toError(error), {
                ...logContext,
                metadata: { strategyName: strategy.name, entityType }
              });
            }
          }
        });

        await Promise.allSettled(batchPromises);
      }

      const duration = Date.now() - startTime;
      
      this.logger.info('Cache warmup completed', {
        ...logContext,
        metadata: { duration, strategiesCount: warmupConfig.strategies.length }
      });

      this.emit('warmup_completed', { duration });

    } catch (error) {
      this.logger.error('Cache warmup error', toError(error), logContext);
      throw error;
    }
  }

  /**
   * Get cache health status
   */
  async getHealthStatus(): Promise<{
    healthy: boolean;
    primaryStore: boolean;
    fallbackStore?: boolean;
    circuitBreaker: string;
    metrics: {
      hitRate: number;
      avgResponseTime: number;
      errorRate: number;
    };
  }> {
    try {
      const primaryHealthy = await this.primaryStore.health();
      const fallbackHealthy = this.fallbackStore ? await this.fallbackStore.health() : undefined;
      
      const metrics = this.getMetrics();
      const totalOperations = metrics.hits + metrics.misses;
      const errorRate = totalOperations > 0 ? (metrics.errors / totalOperations) * 100 : 0;

      return {
        healthy: primaryHealthy && this.circuitBreaker.state !== 'open',
        primaryStore: primaryHealthy,
        fallbackStore: fallbackHealthy,
        circuitBreaker: this.circuitBreaker.state,
        metrics: {
          hitRate: metrics.hitRate,
          avgResponseTime: metrics.avgResponseTime,
          errorRate
        }
      };

    } catch (error) {
      return {
        healthy: false,
        primaryStore: false,
        fallbackStore: false,
        circuitBreaker: this.circuitBreaker.state,
        metrics: {
          hitRate: 0,
          avgResponseTime: 0,
          errorRate: 100
        }
      };
    }
  }

  /**
   * Shutdown cache system
   */
  async shutdown(): Promise<void> {
    const context: LogContext = {
      operation: 'cache_manager_shutdown',
      correlationId: this.generateCorrelationId()
    };

    try {
      this.logger.info('Shutting down cache manager', context);

      // Shutdown components
      await this.strategyExecutor.shutdown();
      await this.invalidator.shutdown();
      this.metrics.shutdown();

      // Close stores
      await this.primaryStore.close();
      if (this.fallbackStore) {
        await this.fallbackStore.close();
      }

      // Clear pending requests
      this.pendingRequests.clear();

      this.initialized = false;

      this.logger.info('Cache manager shutdown completed', context);
      this.emit('shutdown');

    } catch (error) {
      this.logger.error('Cache manager shutdown error', toError(error), context);
      throw error;
    }
  }

  /**
   * Initialize core components
   */
  private initializeComponents(): void {
    // Initialize key generator
    this.keyGenerator = new CacheKeyGenerator({
      strategy: KeyStrategy.HIERARCHICAL,
      maxLength: 250,
      includeUser: false,
      sortParams: true,
      prefix: this.config.keyPrefix
    });

    // Initialize TTL manager
    this.ttlManager = new TTLManager(this.config.entityConfigs);

    // Initialize metrics collector
    if (this.config.enableMetrics) {
      this.metrics = new CacheMetricsCollector();
    } else {
      // Create a no-op metrics collector
      this.metrics = new CacheMetricsCollector(0, 0);
    }
  }

  /**
   * Initialize cache stores
   */
  private async initializeStores(): Promise<void> {
    // Create store configurations
    const storeConfigs: StoreConfigurations = {
      memory: {},
      redis: this.config.redis ? {
        redis: this.config.redis,
        keyPrefix: this.config.keyPrefix
      } : undefined,
      file: this.config.file ? {
        directory: this.config.file.directory,
        maxFileSize: this.config.file.maxFileSize
      } : undefined
    };

    // Create primary store
    this.primaryStore = createCacheStore(
      this.config.storageType,
      storeConfigs,
      this.logger
    );

    // Initialize primary store if it has an initialize method
    if ('initialize' in this.primaryStore && typeof this.primaryStore.initialize === 'function') {
      await (this.primaryStore as any).initialize();
    }

    // Create fallback store if configured
    if (this.config.fallbackStorageType) {
      this.fallbackStore = createCacheStore(
        this.config.fallbackStorageType,
        storeConfigs,
        this.logger
      );

      if ('initialize' in this.fallbackStore && typeof this.fallbackStore.initialize === 'function') {
        await (this.fallbackStore as any).initialize();
      }
    }

    // Initialize remaining components that depend on stores
    this.invalidator = new CacheInvalidator(
      this.primaryStore,
      this.keyGenerator,
      this.metrics,
      this.logger
    );

    this.strategyExecutor = new CacheStrategyExecutor(
      this.primaryStore,
      this.keyGenerator,
      this.ttlManager,
      this.metrics,
      this.logger
    );
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Metrics events
    this.metrics.on(MetricEvent.METRIC_THRESHOLD_EXCEEDED, (data) => {
      this.emit('metric_threshold_exceeded', data);
      this.logger.warn('Cache metric threshold exceeded', undefined, {
        operation: 'metric_threshold',
        correlationId: this.generateCorrelationId(),
        metadata: data
      });
    });

    // Invalidator events
    this.invalidator.on('invalidation', (event) => {
      this.emit('invalidation', event);
    });

    // Strategy executor events
    this.strategyExecutor.on('refresh_completed', (data) => {
      this.emit('refresh_completed', data);
    });
  }

  /**
   * Perform initial cache warmup
   */
  private async performInitialWarmup(): Promise<void> {
    // Default warmup strategies
    const defaultStrategies = [
      {
        name: 'common_lookups',
        entityTypes: ['companies', 'contacts', 'resources'],
        priority: 10,
        execute: async (entityType: string) => {
          // This would typically make common API calls to warm the cache
          // For now, this is a placeholder
        }
      }
    ];

    await this.warmup({
      enabled: true,
      strategies: defaultStrategies,
      maxWarmupTime: 30000,
      concurrency: 2
    });
  }

  /**
   * Check if circuit breaker is open
   */
  private isCircuitOpen(): boolean {
    if (this.circuitBreaker.state === 'closed') {
      return false;
    }

    if (this.circuitBreaker.state === 'open') {
      if (Date.now() >= this.circuitBreaker.nextAttempt) {
        this.circuitBreaker.state = 'half-open';
        return false;
      }
      return true;
    }

    // half-open state
    return false;
  }

  /**
   * Record successful operation for circuit breaker
   */
  private recordSuccess(): void {
    if (this.circuitBreaker.state === 'half-open') {
      this.circuitBreaker.state = 'closed';
      this.circuitBreaker.failures = 0;
    }
  }

  /**
   * Record failed operation for circuit breaker
   */
  private recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();

    // Open circuit after 5 failures
    if (this.circuitBreaker.failures >= 5) {
      this.circuitBreaker.state = 'open';
      this.circuitBreaker.nextAttempt = Date.now() + 30000; // 30 seconds
    }
  }

  /**
   * Execute with stampede protection
   */
  private async executeStampedeProtected<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const existing = this.pendingRequests.get(key);
    if (existing) {
      return await existing;
    }

    const promise = operation().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);

    // Add timeout to prevent indefinite blocking
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Stampede protection timeout for key: ${key}`));
      }, this.config.stampedeTimeout || 5000);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Check if value should be cached based on entity configuration
   */
  private shouldCache<T>(value: T, config: EntityCacheConfig): boolean {
    // Check if caching empty results
    if (!config.cacheEmpty && this.isEmpty(value)) {
      return false;
    }

    // Check size limits
    const size = this.estimateSize(value);
    if (size > config.maxEntrySize) {
      return false;
    }

    return true;
  }

  /**
   * Check if value is empty
   */
  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }

    if (typeof value === 'string') {
      return value.trim().length === 0;
    }

    return false;
  }

  /**
   * Estimate size of value
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
    return `cache-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}