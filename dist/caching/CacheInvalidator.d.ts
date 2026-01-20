/**
 * Cache Invalidation System
 *
 * Provides sophisticated cache invalidation patterns including single key,
 * batch, pattern-based, and intelligent dependency-aware invalidation.
 */
import { EventEmitter } from 'events';
import { ICacheStore, InvalidationPattern } from './types';
import { CacheKeyGenerator } from './CacheKeyGenerator';
import { CacheMetricsCollector } from './CacheMetrics';
import { ErrorLogger } from '../errors/ErrorLogger';
/**
 * Invalidation rule configuration
 */
export interface InvalidationRule {
    /** Rule name/identifier */
    name: string;
    /** Entity type this rule applies to */
    entityType: string;
    /** Invalidation pattern to use */
    pattern: InvalidationPattern;
    /** Target for invalidation (key, pattern, or tag) */
    target: string | string[];
    /** Conditions that must be met for rule to apply */
    conditions?: InvalidationCondition[];
    /** Priority (higher numbers processed first) */
    priority: number;
    /** Whether rule is enabled */
    enabled: boolean;
    /** Delay before invalidation in milliseconds */
    delay?: number;
}
/**
 * Invalidation condition
 */
export interface InvalidationCondition {
    /** Field to check */
    field: string;
    /** Operator for comparison */
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains' | 'startswith' | 'endswith';
    /** Value to compare against */
    value: any;
}
/**
 * Invalidation event data
 */
export interface InvalidationEvent {
    /** Event type */
    type: 'before' | 'after' | 'error';
    /** Entity type affected */
    entityType: string;
    /** Invalidation pattern used */
    pattern: InvalidationPattern;
    /** Target that was invalidated */
    target: string | string[];
    /** Number of keys invalidated */
    invalidatedCount?: number;
    /** Error if invalidation failed */
    error?: Error;
    /** Timestamp */
    timestamp: number;
    /** Execution time */
    executionTime?: number;
}
/**
 * Dependency mapping for cascade invalidation
 */
export interface DependencyMap {
    /** Source entity type */
    source: string;
    /** Dependent entity types */
    dependents: string[];
    /** Fields that trigger dependency invalidation */
    fields?: string[];
    /** Invalidation delay for dependencies */
    delay?: number;
}
/**
 * Batch invalidation request
 */
export interface BatchInvalidationRequest {
    /** Batch identifier */
    batchId: string;
    /** Individual invalidation operations */
    operations: Array<{
        pattern: InvalidationPattern;
        target: string | string[];
        entityType?: string;
        delay?: number;
    }>;
    /** Execute operations in parallel or serial */
    parallel: boolean;
    /** Continue on error or stop */
    continueOnError: boolean;
}
/**
 * Smart invalidation based on data relationships
 */
export declare class CacheInvalidator extends EventEmitter {
    private store;
    private keyGenerator;
    private metrics;
    private logger;
    private rules;
    private dependencies;
    private pendingInvalidations;
    private stats;
    constructor(store: ICacheStore, keyGenerator: CacheKeyGenerator, metrics: CacheMetricsCollector, logger?: ErrorLogger);
    /**
     * Invalidate cache entries using specified pattern
     */
    invalidate(pattern: InvalidationPattern, target: string | string[], entityType?: string, options?: {
        delay?: number;
        cascade?: boolean;
        dryRun?: boolean;
    }): Promise<number>;
    /**
     * Invalidate based on entity data changes
     */
    invalidateByEntityChange(entityType: string, entityData: any, changeType: 'create' | 'update' | 'delete', entityId?: string): Promise<number>;
    /**
     * Execute batch invalidation
     */
    executeBatch(request: BatchInvalidationRequest): Promise<{
        completed: number;
        failed: number;
        totalInvalidated: number;
    }>;
    /**
     * Add invalidation rule
     */
    addRule(rule: InvalidationRule): void;
    /**
     * Remove invalidation rule
     */
    removeRule(ruleName: string): boolean;
    /**
     * Add dependency mapping
     */
    addDependency(dependency: DependencyMap): void;
    /**
     * Get invalidation statistics
     */
    getStats(): typeof this.stats;
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Shutdown invalidator
     */
    shutdown(): Promise<void>;
    /**
     * Invalidate single key
     */
    private invalidateSingle;
    /**
     * Invalidate multiple keys
     */
    private invalidateBatch;
    /**
     * Invalidate by pattern
     */
    private invalidatePattern;
    /**
     * Invalidate by tags
     */
    private invalidateByTags;
    /**
     * Invalidate expired entries
     */
    private invalidateExpired;
    /**
     * Schedule delayed invalidation
     */
    private scheduleDelayedInvalidation;
    /**
     * Handle cascade invalidation based on dependencies
     */
    private handleCascadeInvalidation;
    /**
     * Find applicable rules for entity change
     */
    private findApplicableRules;
    /**
     * Evaluate rule conditions
     */
    private evaluateConditions;
    /**
     * Evaluate single condition
     */
    private evaluateCondition;
    /**
     * Get nested object value
     */
    private getNestedValue;
    /**
     * Update statistics
     */
    private updateStats;
    /**
     * Initialize default invalidation rules
     */
    private initializeDefaultRules;
    /**
     * Generate correlation ID
     */
    private generateCorrelationId;
}
//# sourceMappingURL=CacheInvalidator.d.ts.map