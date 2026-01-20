"use strict";
/**
 * Recovery Strategies and Graceful Degradation System
 *
 * Provides recovery mechanisms to handle errors gracefully and maintain
 * system functionality even when components fail.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorRecoveryHandler = exports.ErrorRecoveryHandler = exports.FeatureFlagManager = exports.StaticDataFallbackProvider = exports.CacheFallbackProvider = exports.GracefulDegradationStrategy = exports.FallbackRecoveryStrategy = exports.RetryRecoveryStrategy = void 0;
exports.WithRecovery = WithRecovery;
exports.withRecovery = withRecovery;
const AutotaskErrors_1 = require("./AutotaskErrors");
const CircuitBreaker_1 = require("./CircuitBreaker");
const RetryStrategy_1 = require("./RetryStrategy");
const ErrorLogger_1 = require("./ErrorLogger");
/**
 * Retry recovery strategy
 */
class RetryRecoveryStrategy {
    constructor(retryStrategy, retryOptions = {}) {
        this.retryStrategy = retryStrategy;
        this.retryOptions = retryOptions;
        this.name = 'retry';
        this.priority = 100;
    }
    canHandle(error, context) {
        // Don't retry if we've already tried too many times
        if (context.attemptCount && context.maxAttempts && context.attemptCount >= context.maxAttempts) {
            return false;
        }
        // Don't retry if circuit breaker is open
        if (context.circuitBreakerState === CircuitBreaker_1.CircuitBreakerState.OPEN) {
            return false;
        }
        return AutotaskErrors_1.ErrorFactory.isRetryable(error);
    }
    async recover(error, context) {
        try {
            // This would need the original operation to retry - in practice this
            // would be handled by the centralized error handler
            throw new Error('Retry recovery requires original operation context');
        }
        catch (recoveryError) {
            return {
                success: false,
                error: recoveryError,
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
exports.RetryRecoveryStrategy = RetryRecoveryStrategy;
/**
 * Fallback data recovery strategy
 */
class FallbackRecoveryStrategy {
    constructor(fallbackProvider) {
        this.fallbackProvider = fallbackProvider;
        this.name = 'fallback';
        this.priority = 50;
    }
    canHandle(error, context) {
        return this.fallbackProvider.canProvide(context);
    }
    async recover(error, context) {
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
        }
        catch (recoveryError) {
            return {
                success: false,
                error: recoveryError,
                strategy: this.name,
                isFallback: false
            };
        }
    }
}
exports.FallbackRecoveryStrategy = FallbackRecoveryStrategy;
/**
 * Graceful degradation recovery strategy
 */
class GracefulDegradationStrategy {
    constructor(degradedFeatures = new Set()) {
        this.degradedFeatures = degradedFeatures;
        this.name = 'graceful-degradation';
        this.priority = 25;
    }
    canHandle(_error, _context) {
        // Can always attempt graceful degradation as last resort
        return true;
    }
    async recover(error, context) {
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
    createDegradedResponse(context) {
        // Create a minimal response indicating degraded functionality
        return {
            _degraded: true,
            operation: context.operation,
            message: 'Service temporarily degraded',
            timestamp: new Date().toISOString()
        };
    }
    /** Check if a feature is currently degraded */
    isFeatureDegraded(feature) {
        return this.degradedFeatures.has(feature);
    }
    /** Restore a degraded feature */
    restoreFeature(feature) {
        this.degradedFeatures.delete(feature);
    }
    /** Get all degraded features */
    getDegradedFeatures() {
        return Array.from(this.degradedFeatures);
    }
}
exports.GracefulDegradationStrategy = GracefulDegradationStrategy;
/**
 * Default fallback providers
 */
/**
 * Cache-based fallback provider
 */
class CacheFallbackProvider {
    constructor(cache = new Map()) {
        this.cache = cache;
        this.name = 'cache';
    }
    canProvide(context) {
        const cacheKey = this.getCacheKey(context);
        const cached = this.cache.get(cacheKey);
        if (!cached) {
            return false;
        }
        // Check if cache entry is still valid
        return Date.now() - cached.timestamp < cached.ttl;
    }
    async getFallback(context) {
        const cacheKey = this.getCacheKey(context);
        const cached = this.cache.get(cacheKey);
        if (!cached || Date.now() - cached.timestamp >= cached.ttl) {
            return null;
        }
        return cached.data;
    }
    /** Store data in cache for future fallback use */
    store(context, data, ttl = 300000) {
        const cacheKey = this.getCacheKey(context);
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
    getCacheKey(context) {
        return `${context.operation}:${context.entityType || 'unknown'}:${JSON.stringify(context.parameters || {})}`;
    }
}
exports.CacheFallbackProvider = CacheFallbackProvider;
/**
 * Static data fallback provider
 */
class StaticDataFallbackProvider {
    constructor(staticData = new Map()) {
        this.staticData = staticData;
        this.name = 'static-data';
    }
    canProvide(context) {
        const key = this.getKey(context);
        return this.staticData.has(key);
    }
    async getFallback(context) {
        const key = this.getKey(context);
        return this.staticData.get(key) || null;
    }
    /** Add static fallback data */
    addFallback(operation, entityType, data) {
        const key = this.getKey({ operation, entityType });
        this.staticData.set(key, data);
    }
    getKey(context) {
        return `${context.operation}:${context.entityType || 'any'}`;
    }
}
exports.StaticDataFallbackProvider = StaticDataFallbackProvider;
/**
 * Feature flag manager
 */
class FeatureFlagManager {
    constructor(logger) {
        this.flags = new Map();
        this.logger = logger || new ErrorLogger_1.ErrorLogger();
    }
    /** Set a feature flag */
    setFlag(flag) {
        this.flags.set(flag.name, flag);
        this.logger.info(`Feature flag set: ${flag.name}`, {
            operation: 'setFlag',
            metadata: { enabled: flag.enabled, rollout: flag.rollout }
        });
    }
    /** Check if a feature is enabled */
    isEnabled(featureName, userId) {
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
    disable(featureName) {
        const flag = this.flags.get(featureName);
        if (flag) {
            flag.enabled = false;
            this.logger.warn(`Feature flag disabled: ${featureName}`, undefined, {
                operation: 'disableFlag'
            });
        }
    }
    /** Enable a feature flag */
    enable(featureName) {
        const flag = this.flags.get(featureName);
        if (flag) {
            flag.enabled = true;
            this.logger.info(`Feature flag enabled: ${featureName}`, {
                operation: 'enableFlag'
            });
        }
    }
    /** Get all feature flags */
    getAllFlags() {
        return Array.from(this.flags.values());
    }
    /** Remove a feature flag */
    removeFlag(featureName) {
        return this.flags.delete(featureName);
    }
    hashUserId(userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash) % 100;
    }
}
exports.FeatureFlagManager = FeatureFlagManager;
/**
 * Centralized error recovery handler
 */
class ErrorRecoveryHandler {
    constructor(logger, featureFlags) {
        this.strategies = [];
        this.logger = logger || new ErrorLogger_1.ErrorLogger();
        this.featureFlags = featureFlags || new FeatureFlagManager(this.logger);
    }
    /** Register a recovery strategy */
    addStrategy(strategy) {
        this.strategies.push(strategy);
        // Sort by priority (highest first)
        this.strategies.sort((a, b) => b.priority - a.priority);
        this.logger.debug('Recovery strategy registered', {
            operation: 'addStrategy',
            metadata: { strategy: strategy.name, priority: strategy.priority }
        });
    }
    /** Remove a recovery strategy */
    removeStrategy(strategyName) {
        const initialLength = this.strategies.length;
        this.strategies = this.strategies.filter(s => s.name !== strategyName);
        return this.strategies.length < initialLength;
    }
    /** Handle error with recovery strategies */
    async handleError(error, context, originalOperation) {
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
                }
                else {
                    const result = await strategy.recover(error, context);
                    if (result.success) {
                        this.logger.info(`Recovery successful with strategy: ${strategy.name}`, context, {
                            isFallback: result.isFallback
                        });
                        return result;
                    }
                }
            }
            catch (strategyError) {
                this.logger.warn(`Recovery strategy failed: ${strategy.name}`, strategyError, context);
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
    async executeRetryStrategy(operation, error, context) {
        const retryStrategy = new RetryStrategy_1.RetryStrategy();
        try {
            const result = await retryStrategy.execute(operation, {
                maxRetries: 3,
                onRetry: (retryError, attempt, delay) => {
                    this.logger.logRetry('Retrying operation', retryError, { attempt, maxAttempts: 3, nextDelay: delay, totalTime: 0 }, context);
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
            }
            else {
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
        }
        catch (retryError) {
            return {
                success: false,
                error: retryError,
                strategy: 'retry',
                isFallback: false
            };
        }
    }
    /** Get registered strategies */
    getStrategies() {
        return [...this.strategies];
    }
    /** Get feature flag manager */
    getFeatureFlags() {
        return this.featureFlags;
    }
}
exports.ErrorRecoveryHandler = ErrorRecoveryHandler;
/**
 * Default error recovery handler instance
 */
exports.defaultErrorRecoveryHandler = new ErrorRecoveryHandler();
// Register default strategies
exports.defaultErrorRecoveryHandler.addStrategy(new RetryRecoveryStrategy(new RetryStrategy_1.RetryStrategy()));
exports.defaultErrorRecoveryHandler.addStrategy(new FallbackRecoveryStrategy(new CacheFallbackProvider()));
exports.defaultErrorRecoveryHandler.addStrategy(new GracefulDegradationStrategy());
/**
 * Decorator for automatic error recovery
 */
function WithRecovery(operation, entityType, maxAttempts = 3) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const context = {
                operation,
                entityType,
                parameters: args.length > 0 ? { args } : undefined,
                maxAttempts,
                attemptCount: 0
            };
            try {
                return await originalMethod.apply(this, args);
            }
            catch (error) {
                const result = await exports.defaultErrorRecoveryHandler.handleError(error, context, () => originalMethod.apply(this, args));
                if (result.success && result.data !== undefined) {
                    return result.data;
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
async function withRecovery(operation, context) {
    try {
        return await operation();
    }
    catch (error) {
        const result = await exports.defaultErrorRecoveryHandler.handleError(error, context, operation);
        if (result.success && result.data !== undefined) {
            return result.data;
        }
        throw result.error || error;
    }
}
//# sourceMappingURL=RecoveryStrategies.js.map