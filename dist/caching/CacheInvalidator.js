"use strict";
/**
 * Cache Invalidation System
 *
 * Provides sophisticated cache invalidation patterns including single key,
 * batch, pattern-based, and intelligent dependency-aware invalidation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInvalidator = void 0;
const events_1 = require("events");
const perf_hooks_1 = require("perf_hooks");
const types_1 = require("./types");
const ErrorLogger_1 = require("../errors/ErrorLogger");
/**
 * Smart invalidation based on data relationships
 */
class CacheInvalidator extends events_1.EventEmitter {
    constructor(store, keyGenerator, metrics, logger = ErrorLogger_1.defaultErrorLogger) {
        super();
        // Invalidation rules and dependencies
        this.rules = new Map();
        this.dependencies = new Map();
        this.pendingInvalidations = new Map();
        // Statistics
        this.stats = {
            totalInvalidations: 0,
            invalidationsByPattern: new Map(),
            invalidationsByEntity: new Map(),
            averageExecutionTime: 0,
            errors: 0
        };
        this.store = store;
        this.keyGenerator = keyGenerator;
        this.metrics = metrics;
        this.logger = logger;
        this.initializeDefaultRules();
    }
    /**
     * Invalidate cache entries using specified pattern
     */
    async invalidate(pattern, target, entityType, options) {
        const startTime = perf_hooks_1.performance.now();
        const context = {
            operation: 'cache_invalidate',
            correlationId: this.generateCorrelationId()
        };
        const event = {
            type: 'before',
            entityType: entityType || 'unknown',
            pattern,
            target,
            timestamp: Date.now()
        };
        this.emit('invalidation', event);
        try {
            let invalidatedCount = 0;
            // Handle delayed invalidation
            if (options?.delay && options.delay > 0) {
                return this.scheduleDelayedInvalidation(pattern, target, entityType, options);
            }
            // Execute invalidation based on pattern
            switch (pattern) {
                case types_1.InvalidationPattern.SINGLE:
                    invalidatedCount = await this.invalidateSingle(target, options?.dryRun);
                    break;
                case types_1.InvalidationPattern.BATCH:
                    invalidatedCount = await this.invalidateBatch(target, options?.dryRun);
                    break;
                case types_1.InvalidationPattern.PATTERN:
                    invalidatedCount = await this.invalidatePattern(target, options?.dryRun);
                    break;
                case types_1.InvalidationPattern.TAG_BASED:
                    invalidatedCount = await this.invalidateByTags(target, options?.dryRun);
                    break;
                case types_1.InvalidationPattern.TTL:
                    invalidatedCount = await this.invalidateExpired(options?.dryRun);
                    break;
                default:
                    throw new Error(`Unsupported invalidation pattern: ${pattern}`);
            }
            // Handle cascade invalidation
            if (options?.cascade && entityType) {
                const cascadeCount = await this.handleCascadeInvalidation(entityType, target, options?.dryRun);
                invalidatedCount += cascadeCount;
            }
            // Update statistics
            this.updateStats(pattern, entityType, invalidatedCount, perf_hooks_1.performance.now() - startTime);
            // Emit success event
            const successEvent = {
                type: 'after',
                entityType: entityType || 'unknown',
                pattern,
                target,
                invalidatedCount,
                timestamp: Date.now(),
                executionTime: perf_hooks_1.performance.now() - startTime
            };
            this.emit('invalidation', successEvent);
            this.logger.info('Cache invalidation completed', {
                ...context,
                metadata: { pattern, entityType, invalidatedCount, executionTime: successEvent.executionTime }
            });
            return invalidatedCount;
        }
        catch (error) {
            this.stats.errors++;
            const errorEvent = {
                type: 'error',
                entityType: entityType || 'unknown',
                pattern,
                target,
                error: error,
                timestamp: Date.now(),
                executionTime: perf_hooks_1.performance.now() - startTime
            };
            this.emit('invalidation', errorEvent);
            this.logger.error('Cache invalidation error', (0, types_1.toError)(error), {
                ...context,
                metadata: { pattern, entityType, target }
            });
            throw error;
        }
    }
    /**
     * Invalidate based on entity data changes
     */
    async invalidateByEntityChange(entityType, entityData, changeType, entityId) {
        const context = {
            operation: 'cache_invalidate_entity_change',
            correlationId: this.generateCorrelationId()
        };
        try {
            let totalInvalidated = 0;
            // Find applicable rules
            const applicableRules = this.findApplicableRules(entityType, entityData, changeType);
            // Process rules in priority order
            const sortedRules = applicableRules.sort((a, b) => b.priority - a.priority);
            for (const rule of sortedRules) {
                if (!rule.enabled)
                    continue;
                try {
                    const invalidatedCount = await this.invalidate(rule.pattern, rule.target, entityType, { delay: rule.delay, cascade: true });
                    totalInvalidated += invalidatedCount;
                    this.logger.debug('Invalidation rule applied', {
                        ...context,
                        metadata: {
                            ruleName: rule.name,
                            entityType,
                            changeType,
                            invalidatedCount
                        }
                    });
                }
                catch (ruleError) {
                    this.logger.warn('Invalidation rule failed', (0, types_1.toError)(ruleError), {
                        ...context,
                        metadata: { ruleName: rule.name, entityType, changeType }
                    });
                }
            }
            return totalInvalidated;
        }
        catch (error) {
            this.logger.error('Entity change invalidation error', (0, types_1.toError)(error), {
                ...context,
                metadata: { entityType, changeType, entityId }
            });
            throw error;
        }
    }
    /**
     * Execute batch invalidation
     */
    async executeBatch(request) {
        const context = {
            operation: 'cache_invalidate_batch',
            correlationId: this.generateCorrelationId()
        };
        let completed = 0;
        let failed = 0;
        let totalInvalidated = 0;
        try {
            this.logger.info('Starting batch invalidation', {
                ...context,
                metadata: { batchId: request.batchId, operationCount: request.operations.length }
            });
            if (request.parallel) {
                // Execute all operations in parallel
                const promises = request.operations.map(async (op) => {
                    try {
                        const count = await this.invalidate(op.pattern, op.target, op.entityType, {
                            delay: op.delay
                        });
                        return { success: true, count };
                    }
                    catch (error) {
                        if (!request.continueOnError) {
                            throw error;
                        }
                        return { success: false, count: 0, error };
                    }
                });
                const results = await Promise.allSettled(promises);
                for (const result of results) {
                    if (result.status === 'fulfilled') {
                        if (result.value.success) {
                            completed++;
                            totalInvalidated += result.value.count;
                        }
                        else {
                            failed++;
                        }
                    }
                    else {
                        failed++;
                    }
                }
            }
            else {
                // Execute operations sequentially
                for (const operation of request.operations) {
                    try {
                        const count = await this.invalidate(operation.pattern, operation.target, operation.entityType, { delay: operation.delay });
                        completed++;
                        totalInvalidated += count;
                    }
                    catch (error) {
                        failed++;
                        if (!request.continueOnError) {
                            throw error;
                        }
                        this.logger.warn('Batch operation failed, continuing', (0, types_1.toError)(error), {
                            ...context,
                            metadata: { batchId: request.batchId, operation: operation.pattern }
                        });
                    }
                }
            }
            this.logger.info('Batch invalidation completed', {
                ...context,
                metadata: {
                    batchId: request.batchId,
                    completed,
                    failed,
                    totalInvalidated
                }
            });
            return { completed, failed, totalInvalidated };
        }
        catch (error) {
            this.logger.error('Batch invalidation error', (0, types_1.toError)(error), {
                ...context,
                metadata: { batchId: request.batchId }
            });
            throw error;
        }
    }
    /**
     * Add invalidation rule
     */
    addRule(rule) {
        this.rules.set(rule.name, rule);
        this.logger.debug('Invalidation rule added', {
            operation: 'add_invalidation_rule',
            correlationId: this.generateCorrelationId(),
            metadata: { ruleName: rule.name, entityType: rule.entityType, pattern: rule.pattern }
        });
    }
    /**
     * Remove invalidation rule
     */
    removeRule(ruleName) {
        const removed = this.rules.delete(ruleName);
        if (removed) {
            this.logger.debug('Invalidation rule removed', {
                operation: 'remove_invalidation_rule',
                correlationId: this.generateCorrelationId(),
                metadata: { ruleName }
            });
        }
        return removed;
    }
    /**
     * Add dependency mapping
     */
    addDependency(dependency) {
        if (!this.dependencies.has(dependency.source)) {
            this.dependencies.set(dependency.source, []);
        }
        this.dependencies.get(dependency.source).push(dependency);
    }
    /**
     * Get invalidation statistics
     */
    getStats() {
        return {
            ...this.stats,
            invalidationsByPattern: new Map(this.stats.invalidationsByPattern),
            invalidationsByEntity: new Map(this.stats.invalidationsByEntity)
        };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalInvalidations: 0,
            invalidationsByPattern: new Map(),
            invalidationsByEntity: new Map(),
            averageExecutionTime: 0,
            errors: 0
        };
    }
    /**
     * Shutdown invalidator
     */
    async shutdown() {
        // Cancel pending invalidations
        for (const timer of this.pendingInvalidations.values()) {
            clearTimeout(timer);
        }
        this.pendingInvalidations.clear();
        this.logger.info('Cache invalidator shutdown completed', {
            operation: 'shutdown',
            correlationId: this.generateCorrelationId()
        });
    }
    /**
     * Invalidate single key
     */
    async invalidateSingle(key, dryRun = false) {
        if (dryRun) {
            const exists = await this.store.exists(key);
            return exists ? 1 : 0;
        }
        const result = await this.store.delete(key);
        return result ? 1 : 0;
    }
    /**
     * Invalidate multiple keys
     */
    async invalidateBatch(keys, dryRun = false) {
        if (dryRun) {
            let count = 0;
            for (const key of keys) {
                if (await this.store.exists(key)) {
                    count++;
                }
            }
            return count;
        }
        return await this.store.deleteMany(keys);
    }
    /**
     * Invalidate by pattern
     */
    async invalidatePattern(pattern, dryRun = false) {
        if (dryRun) {
            const keys = await this.store.keys(pattern);
            return keys.length;
        }
        return await this.store.deletePattern(pattern);
    }
    /**
     * Invalidate by tags
     */
    async invalidateByTags(tags, dryRun = false) {
        if (dryRun) {
            // This is approximate for dry run
            const allKeys = await this.store.keys();
            return Math.floor(allKeys.length * 0.1); // Rough estimate
        }
        return await this.store.deleteByTags(tags);
    }
    /**
     * Invalidate expired entries
     */
    async invalidateExpired(dryRun = false) {
        if (dryRun) {
            // This is approximate for dry run
            const size = await this.store.size();
            return Math.floor(size.entries * 0.05); // Rough estimate of expired entries
        }
        return await this.store.cleanup();
    }
    /**
     * Schedule delayed invalidation
     */
    scheduleDelayedInvalidation(pattern, target, entityType, options) {
        const delay = options?.delay || 0;
        const invalidationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(async () => {
                try {
                    this.pendingInvalidations.delete(invalidationId);
                    const count = await this.invalidate(pattern, target, entityType, {
                        cascade: options?.cascade
                    });
                    resolve(count);
                }
                catch (error) {
                    reject(error);
                }
            }, delay);
            this.pendingInvalidations.set(invalidationId, timer);
        });
    }
    /**
     * Handle cascade invalidation based on dependencies
     */
    async handleCascadeInvalidation(entityType, target, dryRun = false) {
        const dependencies = this.dependencies.get(entityType);
        if (!dependencies || dependencies.length === 0) {
            return 0;
        }
        let totalInvalidated = 0;
        for (const dep of dependencies) {
            for (const dependent of dep.dependents) {
                // Generate pattern for dependent entity type
                const pattern = this.keyGenerator.generatePatternKey(dependent);
                if (dep.delay && dep.delay > 0) {
                    // Schedule delayed cascade invalidation (fire and forget)
                    this.scheduleDelayedInvalidation(types_1.InvalidationPattern.PATTERN, pattern, dependent, {}).catch(() => {
                        // Ignore cascade errors
                    });
                }
                else {
                    try {
                        const count = await this.invalidatePattern(pattern, dryRun);
                        totalInvalidated += count;
                    }
                    catch (error) {
                        // Log cascade error but continue
                        this.logger.warn('Cascade invalidation failed', (0, types_1.toError)(error), {
                            operation: 'cascade_invalidation',
                            correlationId: this.generateCorrelationId(),
                            metadata: { sourceEntity: entityType, dependentEntity: dependent }
                        });
                    }
                }
            }
        }
        return totalInvalidated;
    }
    /**
     * Find applicable rules for entity change
     */
    findApplicableRules(entityType, entityData, changeType) {
        const applicableRules = [];
        for (const rule of this.rules.values()) {
            if (rule.entityType !== entityType && rule.entityType !== '*') {
                continue;
            }
            // Check conditions
            if (rule.conditions && !this.evaluateConditions(rule.conditions, entityData, changeType)) {
                continue;
            }
            applicableRules.push(rule);
        }
        return applicableRules;
    }
    /**
     * Evaluate rule conditions
     */
    evaluateConditions(conditions, entityData, changeType) {
        for (const condition of conditions) {
            const fieldValue = this.getNestedValue(entityData, condition.field);
            if (!this.evaluateCondition(condition, fieldValue, changeType)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Evaluate single condition
     */
    evaluateCondition(condition, fieldValue, changeType) {
        // Special field for change type
        if (condition.field === '__changeType') {
            fieldValue = changeType;
        }
        switch (condition.operator) {
            case 'eq':
                return fieldValue === condition.value;
            case 'ne':
                return fieldValue !== condition.value;
            case 'gt':
                return fieldValue > condition.value;
            case 'lt':
                return fieldValue < condition.value;
            case 'gte':
                return fieldValue >= condition.value;
            case 'lte':
                return fieldValue <= condition.value;
            case 'in':
                return Array.isArray(condition.value) && condition.value.includes(fieldValue);
            case 'contains':
                return String(fieldValue).includes(String(condition.value));
            case 'startswith':
                return String(fieldValue).startsWith(String(condition.value));
            case 'endswith':
                return String(fieldValue).endsWith(String(condition.value));
            default:
                return false;
        }
    }
    /**
     * Get nested object value
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && typeof current === 'object' ? current[key] : undefined;
        }, obj);
    }
    /**
     * Update statistics
     */
    updateStats(pattern, entityType, invalidatedCount, executionTime) {
        this.stats.totalInvalidations++;
        // Update pattern stats
        const patternCount = this.stats.invalidationsByPattern.get(pattern) || 0;
        this.stats.invalidationsByPattern.set(pattern, patternCount + 1);
        // Update entity stats
        if (entityType) {
            const entityCount = this.stats.invalidationsByEntity.get(entityType) || 0;
            this.stats.invalidationsByEntity.set(entityType, entityCount + 1);
        }
        // Update average execution time
        this.stats.averageExecutionTime = ((this.stats.averageExecutionTime * (this.stats.totalInvalidations - 1)) + executionTime) / this.stats.totalInvalidations;
    }
    /**
     * Initialize default invalidation rules
     */
    initializeDefaultRules() {
        // Rule: Invalidate company-related caches when company is updated
        this.addRule({
            name: 'company_update_cascade',
            entityType: 'companies',
            pattern: types_1.InvalidationPattern.TAG_BASED,
            target: ['company'],
            conditions: [
                { field: '__changeType', operator: 'in', value: ['update', 'delete'] }
            ],
            priority: 10,
            enabled: true
        });
        // Rule: Invalidate ticket lists when ticket status changes
        this.addRule({
            name: 'ticket_status_lists',
            entityType: 'tickets',
            pattern: types_1.InvalidationPattern.PATTERN,
            target: 'autotask:tickets:*:list*',
            conditions: [
                { field: 'status', operator: 'ne', value: null },
                { field: '__changeType', operator: 'eq', value: 'update' }
            ],
            priority: 8,
            enabled: true
        });
        // Rule: Invalidate project caches when project is completed
        this.addRule({
            name: 'project_completion',
            entityType: 'projects',
            pattern: types_1.InvalidationPattern.PATTERN,
            target: 'autotask:projects:*',
            conditions: [
                { field: 'status', operator: 'eq', value: 'Complete' },
                { field: '__changeType', operator: 'eq', value: 'update' }
            ],
            priority: 7,
            enabled: true,
            delay: 5000 // 5 second delay
        });
        // Add default dependencies
        this.addDependency({
            source: 'companies',
            dependents: ['contacts', 'tickets', 'projects', 'contracts'],
            delay: 1000
        });
        this.addDependency({
            source: 'contacts',
            dependents: ['tickets'],
            delay: 500
        });
        this.addDependency({
            source: 'projects',
            dependents: ['tasks', 'tickets'],
            delay: 2000
        });
    }
    /**
     * Generate correlation ID
     */
    generateCorrelationId() {
        return `invalidator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.CacheInvalidator = CacheInvalidator;
//# sourceMappingURL=CacheInvalidator.js.map