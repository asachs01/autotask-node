/**
 * Recovery Strategies and Graceful Degradation System
 * 
 * Provides recovery mechanisms to handle errors gracefully and maintain
 * system functionality even when components fail.
 */

import { ErrorFactory } from './AutotaskErrors';
import { CircuitBreakerState } from './CircuitBreaker';
import { RetryStrategy, RetryOptions } from './RetryStrategy';
import { ErrorLogger } from './ErrorLogger';

/**
 * Recovery strategy result
 */
export interface RecoveryResult<T = any> {
  /** Whether recovery was successful */
  success: boolean;
  
  /** Recovered data if successful */
  data?: T;
  
  /** Error if recovery failed */
  error?: Error;
  
  /** Strategy used for recovery */
  strategy: string;
  
  /** Whether this was fallback data */
  isFallback: boolean;
  
  /** Recovery metadata */
  metadata?: Record<string, any>;
}

/**
 * Recovery strategy interface
 */
export interface RecoveryStrategy<T = any> {
  /** Strategy name */
  readonly name: string;
  
  /** Strategy priority (higher = tried first) */
  readonly priority: number;
  
  /** Check if this strategy can handle the error */
  canHandle(error: Error, context: RecoveryContext): boolean;
  
  /** Execute recovery strategy */
  recover(error: Error, context: RecoveryContext): Promise<RecoveryResult<T>>;
}

/**
 * Context information for recovery operations
 */
export interface RecoveryContext {
  /** Operation being performed */
  operation: string;
  
  /** Entity type being operated on */
  entityType?: string;
  
  /** Original operation parameters */
  parameters?: Record<string, any>;
  
  /** Number of recovery attempts made */
  attemptCount?: number;
  
  /** Maximum recovery attempts allowed */
  maxAttempts?: number;
  
  /** Circuit breaker state if applicable */
  circuitBreakerState?: CircuitBreakerState;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Fallback data provider interface
 */
export interface FallbackProvider<T = any> {
  /** Provider name */
  readonly name: string;
  
  /** Check if fallback data is available for this context */
  canProvide(context: RecoveryContext): boolean;
  
  /** Get fallback data */
  getFallback(context: RecoveryContext): Promise<T | null>;
}

/**
 * Feature flag interface
 */
export interface FeatureFlag {
  /** Feature name */
  name: string;
  
  /** Whether feature is enabled */
  enabled: boolean;
  
  /** Rollout percentage (0-100) */
  rollout?: number;
  
  /** Expiration date */
  expiresAt?: Date;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Retry recovery strategy
 */
export class RetryRecoveryStrategy<T> implements RecoveryStrategy<T> {
  readonly name = 'retry';
  readonly priority = 100;
  
  constructor(
    private readonly retryStrategy: RetryStrategy,
    private readonly retryOptions: RetryOptions = {}
  ) {}
  
  canHandle(error: Error, context: RecoveryContext): boolean {
    // Don't retry if we've already tried too many times
    if (context.attemptCount && context.maxAttempts && context.attemptCount >= context.maxAttempts) {
      return false;
    }
    
    // Don't retry if circuit breaker is open
    if (context.circuitBreakerState === CircuitBreakerState.OPEN) {
      return false;
    }
    
    return ErrorFactory.isRetryable(error);
  }
  
  async recover(error: Error, context: RecoveryContext): Promise<RecoveryResult<T>> {
    try {
      // This would need the original operation to retry - in practice this
      // would be handled by the centralized error handler
      throw new Error('Retry recovery requires original operation context');
    } catch (recoveryError) {
      return {
        success: false,
        error: recoveryError as Error,
        strategy: this.name,
        isFallback: false,
        metadata: {
          originalError: error.message,
          context
        }
      };
    }
  }
}

/**
 * Fallback data recovery strategy
 */
export class FallbackRecoveryStrategy<T> implements RecoveryStrategy<T> {
  readonly name = 'fallback';
  readonly priority = 50;
  
  constructor(private readonly fallbackProvider: FallbackProvider<T>) {}
  
  canHandle(error: Error, context: RecoveryContext): boolean {
    return this.fallbackProvider.canProvide(context);
  }
  
  async recover(error: Error, context: RecoveryContext): Promise<RecoveryResult<T>> {
    try {
      const fallbackData = await this.fallbackProvider.getFallback(context);
      
      if (fallbackData !== null) {
        return {
          success: true,
          data: fallbackData,
          strategy: this.name,
          isFallback: true,
          metadata: {
            provider: this.fallbackProvider.name,
            originalError: error.message
          }
        };
      }
      
      return {
        success: false,
        error: new Error('No fallback data available'),
        strategy: this.name,
        isFallback: false
      };
    } catch (recoveryError) {
      return {
        success: false,
        error: recoveryError as Error,
        strategy: this.name,
        isFallback: false
      };
    }
  }
}

/**
 * Graceful degradation recovery strategy
 */
export class GracefulDegradationStrategy<T> implements RecoveryStrategy<T> {
  readonly name = 'graceful-degradation';
  readonly priority = 25;
  
  constructor(private readonly degradedFeatures: Set<string> = new Set()) {}
  
  canHandle(_error: Error, _context: RecoveryContext): boolean {
    // Can always attempt graceful degradation as last resort
    return true;
  }
  
  async recover(error: Error, context: RecoveryContext): Promise<RecoveryResult<T>> {
    // Mark feature as degraded
    if (context.operation) {
      this.degradedFeatures.add(context.operation);
    }
    
    // Return minimal functionality indication
    const degradedData = this.createDegradedResponse(context);
    
    return {
      success: true,
      data: degradedData,
      strategy: this.name,
      isFallback: true,
      metadata: {
        degradedOperation: context.operation,
        originalError: error.message,
        degradedFeatures: Array.from(this.degradedFeatures)
      }
    };
  }
  
  private createDegradedResponse(context: RecoveryContext): T {
    // Create a minimal response indicating degraded functionality
    return {
      _degraded: true,
      operation: context.operation,
      message: 'Service temporarily degraded',
      timestamp: new Date().toISOString()
    } as T;
  }
  
  /** Check if a feature is currently degraded */
  isFeatureDegraded(feature: string): boolean {
    return this.degradedFeatures.has(feature);
  }
  
  /** Restore a degraded feature */
  restoreFeature(feature: string): void {
    this.degradedFeatures.delete(feature);
  }
  
  /** Get all degraded features */
  getDegradedFeatures(): string[] {
    return Array.from(this.degradedFeatures);
  }
}

/**
 * Default fallback providers
 */

/**
 * Cache-based fallback provider
 */
export class CacheFallbackProvider<T> implements FallbackProvider<T> {
  readonly name = 'cache';
  
  constructor(private readonly cache: Map<string, { data: T; timestamp: number; ttl: number }> = new Map()) {}
  
  canProvide(context: RecoveryContext): boolean {
    const cacheKey = this.getCacheKey(context);
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return false;
    }
    
    // Check if cache entry is still valid
    return Date.now() - cached.timestamp < cached.ttl;
  }
  
  async getFallback(context: RecoveryContext): Promise<T | null> {
    const cacheKey = this.getCacheKey(context);
    const cached = this.cache.get(cacheKey);
    
    if (!cached || Date.now() - cached.timestamp >= cached.ttl) {
      return null;
    }
    
    return cached.data;
  }
  
  /** Store data in cache for future fallback use */
  store(context: RecoveryContext, data: T, ttl: number = 300000): void {
    const cacheKey = this.getCacheKey(context);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  private getCacheKey(context: RecoveryContext): string {
    return `${context.operation}:${context.entityType || 'unknown'}:${JSON.stringify(context.parameters || {})}`;
  }
}

/**
 * Static data fallback provider
 */
export class StaticDataFallbackProvider<T> implements FallbackProvider<T> {
  readonly name = 'static-data';
  
  constructor(private readonly staticData: Map<string, T> = new Map()) {}
  
  canProvide(context: RecoveryContext): boolean {
    const key = this.getKey(context);
    return this.staticData.has(key);
  }
  
  async getFallback(context: RecoveryContext): Promise<T | null> {
    const key = this.getKey(context);
    return this.staticData.get(key) || null;
  }
  
  /** Add static fallback data */
  addFallback(operation: string, entityType: string | undefined, data: T): void {
    const key = this.getKey({ operation, entityType });
    this.staticData.set(key, data);
  }
  
  private getKey(context: Pick<RecoveryContext, 'operation' | 'entityType'>): string {
    return `${context.operation}:${context.entityType || 'any'}`;
  }
}

/**
 * Feature flag manager
 */
export class FeatureFlagManager {
  private flags = new Map<string, FeatureFlag>();
  private readonly logger: ErrorLogger;
  
  constructor(logger?: ErrorLogger) {
    this.logger = logger || new ErrorLogger();
  }
  
  /** Set a feature flag */
  setFlag(flag: FeatureFlag): void {
    this.flags.set(flag.name, flag);
    this.logger.info(`Feature flag set: ${flag.name}`, {
      operation: 'setFlag',
      metadata: { enabled: flag.enabled, rollout: flag.rollout }
    });
  }
  
  /** Check if a feature is enabled */
  isEnabled(featureName: string, userId?: string): boolean {
    const flag = this.flags.get(featureName);
    
    if (!flag) {
      return true; // Default to enabled if flag doesn't exist
    }
    
    // Check expiration
    if (flag.expiresAt && flag.expiresAt < new Date()) {
      return true; // Default to enabled if expired
    }
    
    if (!flag.enabled) {
      return false;
    }
    
    // Check rollout percentage
    if (flag.rollout !== undefined && flag.rollout < 100) {
      const hash = this.hashUserId(userId || 'anonymous');
      return hash < flag.rollout;
    }
    
    return flag.enabled;
  }
  
  /** Disable a feature flag */
  disable(featureName: string): void {
    const flag = this.flags.get(featureName);
    if (flag) {
      flag.enabled = false;
      this.logger.warn(`Feature flag disabled: ${featureName}`, undefined, {
        operation: 'disableFlag'
      });
    }
  }
  
  /** Enable a feature flag */
  enable(featureName: string): void {
    const flag = this.flags.get(featureName);
    if (flag) {
      flag.enabled = true;
      this.logger.info(`Feature flag enabled: ${featureName}`, {
        operation: 'enableFlag'
      });
    }
  }
  
  /** Get all feature flags */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
  
  /** Remove a feature flag */
  removeFlag(featureName: string): boolean {
    return this.flags.delete(featureName);
  }
  
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 100;
  }
}

/**
 * Centralized error recovery handler
 */
export class ErrorRecoveryHandler {
  private strategies: RecoveryStrategy[] = [];
  private readonly logger: ErrorLogger;
  private readonly featureFlags: FeatureFlagManager;
  
  constructor(
    logger?: ErrorLogger,
    featureFlags?: FeatureFlagManager
  ) {
    this.logger = logger || new ErrorLogger();
    this.featureFlags = featureFlags || new FeatureFlagManager(this.logger);
  }
  
  /** Register a recovery strategy */
  addStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
    // Sort by priority (highest first)
    this.strategies.sort((a, b) => b.priority - a.priority);
    
    this.logger.debug('Recovery strategy registered', {
      operation: 'addStrategy',
      metadata: { strategy: strategy.name, priority: strategy.priority }
    });
  }
  
  /** Remove a recovery strategy */
  removeStrategy(strategyName: string): boolean {
    const initialLength = this.strategies.length;
    this.strategies = this.strategies.filter(s => s.name !== strategyName);
    return this.strategies.length < initialLength;
  }
  
  /** Handle error with recovery strategies */
  async handleError<T>(
    error: Error, 
    context: RecoveryContext,
    originalOperation?: () => Promise<T>
  ): Promise<RecoveryResult<T>> {
    // Check if the operation is disabled by feature flag
    if (context.operation && !this.featureFlags.isEnabled(`operation:${context.operation}`)) {
      this.logger.warn(`Operation disabled by feature flag: ${context.operation}`, error, context);
      return {
        success: false,
        error: new Error(`Operation ${context.operation} is currently disabled`),
        strategy: 'feature-flag',
        isFallback: false,
        metadata: { reason: 'disabled-by-feature-flag' }
      };
    }
    
    this.logger.error('Error occurred, attempting recovery', error, context);
    
    // Try each strategy in priority order
    for (const strategy of this.strategies) {
      if (!strategy.canHandle(error, context)) {
        continue;
      }
      
      this.logger.debug(`Attempting recovery with strategy: ${strategy.name}`, context);
      
      try {
        // Special handling for retry strategy - needs original operation
        if (strategy.name === 'retry' && originalOperation) {
          const result = await this.executeRetryStrategy(originalOperation, error, context);
          if (result.success) {
            this.logger.info(`Recovery successful with strategy: ${strategy.name}`, context);
            return result;
          }
        } else {
          const result = await strategy.recover(error, context);
          if (result.success) {
            this.logger.info(`Recovery successful with strategy: ${strategy.name}`, context, {
              isFallback: result.isFallback
            });
            return result;
          }
        }
      } catch (strategyError) {
        this.logger.warn(`Recovery strategy failed: ${strategy.name}`, strategyError as Error, context);
        continue;
      }
    }
    
    // All strategies failed
    this.logger.error('All recovery strategies failed', error, context);
    return {
      success: false,
      error,
      strategy: 'none',
      isFallback: false,
      metadata: {
        attemptedStrategies: this.strategies.map(s => s.name),
        context
      }
    };
  }
  
  private async executeRetryStrategy<T>(
    operation: () => Promise<T>,
    error: Error,
    context: RecoveryContext
  ): Promise<RecoveryResult<T>> {
    const retryStrategy = new RetryStrategy();
    
    try {
      const result = await retryStrategy.execute(operation, {
        maxRetries: 3,
        onRetry: (retryError, attempt, delay) => {
          this.logger.logRetry(
            'Retrying operation',
            retryError,
            { attempt, maxAttempts: 3, nextDelay: delay, totalTime: 0 },
            context
          );
        }
      });
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          strategy: 'retry',
          isFallback: false,
          metadata: {
            attempts: result.attempts,
            totalTime: result.totalTime
          }
        };
      } else {
        return {
          success: false,
          error: result.error,
          strategy: 'retry',
          isFallback: false,
          metadata: {
            attempts: result.attempts,
            totalTime: result.totalTime
          }
        };
      }
    } catch (retryError) {
      return {
        success: false,
        error: retryError as Error,
        strategy: 'retry',
        isFallback: false
      };
    }
  }
  
  /** Get registered strategies */
  getStrategies(): RecoveryStrategy[] {
    return [...this.strategies];
  }
  
  /** Get feature flag manager */
  getFeatureFlags(): FeatureFlagManager {
    return this.featureFlags;
  }
}

/**
 * Default error recovery handler instance
 */
export const defaultErrorRecoveryHandler = new ErrorRecoveryHandler();

// Register default strategies
defaultErrorRecoveryHandler.addStrategy(new RetryRecoveryStrategy(new RetryStrategy()));
defaultErrorRecoveryHandler.addStrategy(new FallbackRecoveryStrategy(new CacheFallbackProvider()));
defaultErrorRecoveryHandler.addStrategy(new GracefulDegradationStrategy());

/**
 * Decorator for automatic error recovery
 */
export function WithRecovery<T>(
  operation: string,
  entityType?: string,
  maxAttempts: number = 3
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]): Promise<T> {
      const context: RecoveryContext = {
        operation,
        entityType,
        parameters: args.length > 0 ? { args } : undefined,
        maxAttempts,
        attemptCount: 0
      };
      
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const result = await defaultErrorRecoveryHandler.handleError(
          error as Error,
          context,
          () => originalMethod.apply(this, args)
        );
        
        if (result.success && result.data !== undefined) {
          return result.data as T;
        }
        
        throw result.error || error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Utility function for wrapping operations with recovery
 */
export async function withRecovery<T>(
  operation: () => Promise<T>,
  context: RecoveryContext
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const result = await defaultErrorRecoveryHandler.handleError(
      error as Error,
      context,
      operation
    );
    
    if (result.success && result.data !== undefined) {
      return result.data as T;
    }
    
    throw result.error || error;
  }
}