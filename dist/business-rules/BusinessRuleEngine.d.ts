/**
 * Business Rule Engine
 *
 * Manages registration and execution of business rules for entity validation.
 * Supports rule prioritization, caching, and performance optimization.
 */
import { BusinessRule, RuleContext } from './BusinessRule';
import { ValidationResult } from './ValidationResult';
import { ErrorLogger } from '../errors/ErrorLogger';
/**
 * Options for rule engine configuration
 */
export interface RuleEngineOptions {
    /** Enable caching of rule results */
    enableCache?: boolean;
    /** Cache TTL in milliseconds */
    cacheTTL?: number;
    /** Maximum cache size */
    maxCacheSize?: number;
    /** Enable parallel rule execution */
    enableParallelExecution?: boolean;
    /** Maximum parallel rules to execute */
    maxParallelRules?: number;
    /** Enable performance tracking */
    enablePerformanceTracking?: boolean;
    /** Stop validation on first error */
    stopOnFirstError?: boolean;
    /** Error logger instance */
    errorLogger?: ErrorLogger;
}
/**
 * Rule execution statistics
 */
export interface RuleExecutionStats {
    ruleName: string;
    executionTime: number;
    passed: boolean;
    errorCount: number;
    warningCount: number;
}
/**
 * Business Rule Engine
 */
export declare class BusinessRuleEngine {
    private rules;
    private globalRules;
    private cache;
    private stats;
    private options;
    private errorLogger?;
    constructor(options?: RuleEngineOptions);
    /**
     * Register a rule for specific entity type(s)
     */
    registerRule(entityType: string | string[], rule: BusinessRule): void;
    /**
     * Register a global rule that applies to all entity types
     */
    registerGlobalRule(rule: BusinessRule): void;
    /**
     * Unregister a rule
     */
    unregisterRule(entityType: string, ruleName: string): boolean;
    /**
     * Unregister a global rule
     */
    unregisterGlobalRule(ruleName: string): boolean;
    /**
     * Get all rules for an entity type
     */
    getRules(entityType: string): BusinessRule[];
    /**
     * Get a specific rule by name
     */
    getRule(entityType: string, ruleName: string): BusinessRule | undefined;
    /**
     * List all registered entity types
     */
    getEntityTypes(): string[];
    /**
     * Validate an entity
     */
    validateEntity(entityType: string, entity: any, context?: RuleContext): Promise<ValidationResult>;
    /**
     * Execute rules
     */
    private executeRules;
    /**
     * Execute a single rule
     */
    private executeRule;
    /**
     * Create rule batches for parallel execution
     */
    private createRuleBatches;
    /**
     * Get cached validation result
     */
    private getCachedResult;
    /**
     * Cache validation result
     */
    private cacheResult;
    /**
     * Create cache key for entity
     */
    private createCacheKey;
    /**
     * Create hash of entity for cache validation
     */
    private hashEntity;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get performance statistics
     */
    getStatistics(): Map<string, RuleExecutionStats[]>;
    /**
     * Clear performance statistics
     */
    clearStatistics(): void;
    /**
     * Get rule execution summary
     */
    getRuleSummary(entityType?: string): {
        totalRules: number;
        enabledRules: number;
        globalRules: number;
        entityTypeRules: Map<string, number>;
    };
    private logDebug;
    private logInfo;
    private logWarn;
    private logError;
}
//# sourceMappingURL=BusinessRuleEngine.d.ts.map