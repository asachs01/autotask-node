/**
 * Recovery Strategies and Graceful Degradation System
 *
 * Provides recovery mechanisms to handle errors gracefully and maintain
 * system functionality even when components fail.
 */
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
export declare class RetryRecoveryStrategy<T> implements RecoveryStrategy<T> {
    private readonly retryStrategy;
    private readonly retryOptions;
    readonly name = "retry";
    readonly priority = 100;
    constructor(retryStrategy: RetryStrategy, retryOptions?: RetryOptions);
    canHandle(error: Error, context: RecoveryContext): boolean;
    recover(error: Error, context: RecoveryContext): Promise<RecoveryResult<T>>;
}
/**
 * Fallback data recovery strategy
 */
export declare class FallbackRecoveryStrategy<T> implements RecoveryStrategy<T> {
    private readonly fallbackProvider;
    readonly name = "fallback";
    readonly priority = 50;
    constructor(fallbackProvider: FallbackProvider<T>);
    canHandle(error: Error, context: RecoveryContext): boolean;
    recover(error: Error, context: RecoveryContext): Promise<RecoveryResult<T>>;
}
/**
 * Graceful degradation recovery strategy
 */
export declare class GracefulDegradationStrategy<T> implements RecoveryStrategy<T> {
    private readonly degradedFeatures;
    readonly name = "graceful-degradation";
    readonly priority = 25;
    constructor(degradedFeatures?: Set<string>);
    canHandle(_error: Error, _context: RecoveryContext): boolean;
    recover(error: Error, context: RecoveryContext): Promise<RecoveryResult<T>>;
    private createDegradedResponse;
    /** Check if a feature is currently degraded */
    isFeatureDegraded(feature: string): boolean;
    /** Restore a degraded feature */
    restoreFeature(feature: string): void;
    /** Get all degraded features */
    getDegradedFeatures(): string[];
}
/**
 * Default fallback providers
 */
/**
 * Cache-based fallback provider
 */
export declare class CacheFallbackProvider<T> implements FallbackProvider<T> {
    private readonly cache;
    readonly name = "cache";
    constructor(cache?: Map<string, {
        data: T;
        timestamp: number;
        ttl: number;
    }>);
    canProvide(context: RecoveryContext): boolean;
    getFallback(context: RecoveryContext): Promise<T | null>;
    /** Store data in cache for future fallback use */
    store(context: RecoveryContext, data: T, ttl?: number): void;
    private getCacheKey;
}
/**
 * Static data fallback provider
 */
export declare class StaticDataFallbackProvider<T> implements FallbackProvider<T> {
    private readonly staticData;
    readonly name = "static-data";
    constructor(staticData?: Map<string, T>);
    canProvide(context: RecoveryContext): boolean;
    getFallback(context: RecoveryContext): Promise<T | null>;
    /** Add static fallback data */
    addFallback(operation: string, entityType: string | undefined, data: T): void;
    private getKey;
}
/**
 * Feature flag manager
 */
export declare class FeatureFlagManager {
    private flags;
    private readonly logger;
    constructor(logger?: ErrorLogger);
    /** Set a feature flag */
    setFlag(flag: FeatureFlag): void;
    /** Check if a feature is enabled */
    isEnabled(featureName: string, userId?: string): boolean;
    /** Disable a feature flag */
    disable(featureName: string): void;
    /** Enable a feature flag */
    enable(featureName: string): void;
    /** Get all feature flags */
    getAllFlags(): FeatureFlag[];
    /** Remove a feature flag */
    removeFlag(featureName: string): boolean;
    private hashUserId;
}
/**
 * Centralized error recovery handler
 */
export declare class ErrorRecoveryHandler {
    private strategies;
    private readonly logger;
    private readonly featureFlags;
    constructor(logger?: ErrorLogger, featureFlags?: FeatureFlagManager);
    /** Register a recovery strategy */
    addStrategy(strategy: RecoveryStrategy): void;
    /** Remove a recovery strategy */
    removeStrategy(strategyName: string): boolean;
    /** Handle error with recovery strategies */
    handleError<T>(error: Error, context: RecoveryContext, originalOperation?: () => Promise<T>): Promise<RecoveryResult<T>>;
    private executeRetryStrategy;
    /** Get registered strategies */
    getStrategies(): RecoveryStrategy[];
    /** Get feature flag manager */
    getFeatureFlags(): FeatureFlagManager;
}
/**
 * Default error recovery handler instance
 */
export declare const defaultErrorRecoveryHandler: ErrorRecoveryHandler;
/**
 * Decorator for automatic error recovery
 */
export declare function WithRecovery<T>(operation: string, entityType?: string, maxAttempts?: number): MethodDecorator;
/**
 * Utility function for wrapping operations with recovery
 */
export declare function withRecovery<T>(operation: () => Promise<T>, context: RecoveryContext): Promise<T>;
//# sourceMappingURL=RecoveryStrategies.d.ts.map