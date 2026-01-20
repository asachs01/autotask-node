"use strict";
/**
 * Business Rule Engine
 *
 * Manages registration and execution of business rules for entity validation.
 * Supports rule prioritization, caching, and performance optimization.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRuleEngine = void 0;
const BusinessRule_1 = require("./BusinessRule");
const ValidationResult_1 = require("./ValidationResult");
/**
 * Business Rule Engine
 */
class BusinessRuleEngine {
    constructor(options = {}) {
        this.rules = new Map();
        this.globalRules = [];
        this.cache = new Map();
        this.stats = new Map();
        this.options = {
            enableCache: options.enableCache ?? false,
            cacheTTL: options.cacheTTL ?? 5 * 60 * 1000, // 5 minutes
            maxCacheSize: options.maxCacheSize ?? 1000,
            enableParallelExecution: options.enableParallelExecution ?? false,
            maxParallelRules: options.maxParallelRules ?? 5,
            enablePerformanceTracking: options.enablePerformanceTracking ?? false,
            stopOnFirstError: options.stopOnFirstError ?? false,
            errorLogger: options.errorLogger
        };
        this.errorLogger = options.errorLogger;
    }
    /**
     * Register a rule for specific entity type(s)
     */
    registerRule(entityType, rule) {
        const types = Array.isArray(entityType) ? entityType : [entityType];
        for (const type of types) {
            if (!this.rules.has(type)) {
                this.rules.set(type, []);
            }
            const rules = this.rules.get(type);
            // Check for duplicate rule names
            const existingIndex = rules.findIndex(r => r.name === rule.name);
            if (existingIndex >= 0) {
                // Replace existing rule
                rules[existingIndex] = rule;
                this.logDebug(`Replaced rule '${rule.name}' for entity type '${type}'`);
            }
            else {
                rules.push(rule);
                this.logDebug(`Registered rule '${rule.name}' for entity type '${type}'`);
            }
            // Sort rules by priority
            rules.sort((a, b) => {
                const priorityA = a.priority ?? BusinessRule_1.RulePriority.NORMAL;
                const priorityB = b.priority ?? BusinessRule_1.RulePriority.NORMAL;
                return priorityA - priorityB;
            });
        }
        // If rule has appliesTo, register for those types as well
        if (rule.appliesTo && rule.appliesTo.length > 0) {
            for (const type of rule.appliesTo) {
                if (!types.includes(type)) {
                    this.registerRule(type, rule);
                }
            }
        }
    }
    /**
     * Register a global rule that applies to all entity types
     */
    registerGlobalRule(rule) {
        const existingIndex = this.globalRules.findIndex(r => r.name === rule.name);
        if (existingIndex >= 0) {
            this.globalRules[existingIndex] = rule;
            this.logDebug(`Replaced global rule '${rule.name}'`);
        }
        else {
            this.globalRules.push(rule);
            this.logDebug(`Registered global rule '${rule.name}'`);
        }
        // Sort by priority
        this.globalRules.sort((a, b) => {
            const priorityA = a.priority ?? BusinessRule_1.RulePriority.NORMAL;
            const priorityB = b.priority ?? BusinessRule_1.RulePriority.NORMAL;
            return priorityA - priorityB;
        });
    }
    /**
     * Unregister a rule
     */
    unregisterRule(entityType, ruleName) {
        const rules = this.rules.get(entityType);
        if (!rules)
            return false;
        const index = rules.findIndex(r => r.name === ruleName);
        if (index >= 0) {
            rules.splice(index, 1);
            this.logDebug(`Unregistered rule '${ruleName}' for entity type '${entityType}'`);
            return true;
        }
        return false;
    }
    /**
     * Unregister a global rule
     */
    unregisterGlobalRule(ruleName) {
        const index = this.globalRules.findIndex(r => r.name === ruleName);
        if (index >= 0) {
            this.globalRules.splice(index, 1);
            this.logDebug(`Unregistered global rule '${ruleName}'`);
            return true;
        }
        return false;
    }
    /**
     * Get all rules for an entity type
     */
    getRules(entityType) {
        const typeRules = this.rules.get(entityType) || [];
        return [...this.globalRules, ...typeRules];
    }
    /**
     * Get a specific rule by name
     */
    getRule(entityType, ruleName) {
        const rules = this.getRules(entityType);
        return rules.find(r => r.name === ruleName);
    }
    /**
     * List all registered entity types
     */
    getEntityTypes() {
        return Array.from(this.rules.keys());
    }
    /**
     * Validate an entity
     */
    async validateEntity(entityType, entity, context) {
        const correlationId = this.errorLogger?.generateCorrelationId();
        const startTime = Date.now();
        try {
            // Check cache if enabled
            if (this.options.enableCache) {
                const cached = this.getCachedResult(entityType, entity);
                if (cached) {
                    this.logDebug(`Cache hit for entity type '${entityType}'`, { correlationId });
                    return cached;
                }
            }
            // Get applicable rules
            const rules = this.getRules(entityType);
            if (rules.length === 0) {
                this.logDebug(`No rules found for entity type '${entityType}'`, { correlationId });
                return ValidationResult_1.ValidationResult.success();
            }
            // Create context with entity type
            const fullContext = {
                ...context,
                entityType
            };
            // Execute rules
            const result = await this.executeRules(rules, entity, fullContext, correlationId);
            // Cache result if enabled
            if (this.options.enableCache) {
                this.cacheResult(entityType, entity, result);
            }
            // Log validation summary
            const summary = result.getSummary();
            const duration = Date.now() - startTime;
            if (result.isValid) {
                this.logInfo(`Validation passed for entity type '${entityType}'`, { correlationId, duration, summary });
            }
            else {
                this.logWarn(`Validation failed for entity type '${entityType}'`, { correlationId, duration, summary });
            }
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logError(`Error validating entity type '${entityType}'`, error, { correlationId, duration });
            // Return error result
            const result = new ValidationResult_1.ValidationResult();
            result.addError('VALIDATION_ERROR', `Validation failed: ${error.message}`, undefined, { entityType, error: error.message });
            return result;
        }
    }
    /**
     * Execute rules
     */
    async executeRules(rules, entity, context, correlationId) {
        const result = new ValidationResult_1.ValidationResult();
        const stats = [];
        if (this.options.enableParallelExecution) {
            // Execute rules in parallel batches
            const batches = this.createRuleBatches(rules);
            for (const batch of batches) {
                const batchResults = await Promise.all(batch.map(rule => this.executeRule(rule, entity, context, stats)));
                for (const ruleResult of batchResults) {
                    if (ruleResult) {
                        result.merge(ruleResult);
                        if (this.options.stopOnFirstError && ruleResult.hasErrors()) {
                            break;
                        }
                    }
                }
                if (this.options.stopOnFirstError && result.hasErrors()) {
                    break;
                }
            }
        }
        else {
            // Execute rules sequentially
            for (const rule of rules) {
                const ruleResult = await this.executeRule(rule, entity, context, stats);
                if (ruleResult) {
                    result.merge(ruleResult);
                    if (this.options.stopOnFirstError && ruleResult.hasErrors()) {
                        break;
                    }
                }
            }
        }
        // Store stats if tracking is enabled
        if (this.options.enablePerformanceTracking && stats.length > 0) {
            const key = `${context.entityType}-${correlationId}`;
            this.stats.set(key, stats);
        }
        return result;
    }
    /**
     * Execute a single rule
     */
    async executeRule(rule, entity, context, stats) {
        const startTime = Date.now();
        try {
            // Check if rule is enabled
            if (rule.enabled === false) {
                return null;
            }
            // Check condition
            if (rule.condition) {
                const shouldApply = await rule.condition(entity, context);
                if (!shouldApply) {
                    return null;
                }
            }
            // Execute validation
            const result = await rule.validate(entity, context);
            // Add rule name to issues
            const issues = result.getIssues();
            issues.forEach(issue => {
                if (!issue.ruleName) {
                    issue.ruleName = rule.name;
                }
            });
            // Track stats
            if (this.options.enablePerformanceTracking) {
                stats.push({
                    ruleName: rule.name,
                    executionTime: Date.now() - startTime,
                    passed: !result.hasErrors(),
                    errorCount: result.getErrors().length,
                    warningCount: result.getWarnings().length
                });
            }
            return result;
        }
        catch (error) {
            this.logError(`Error executing rule '${rule.name}'`, error, { entityType: context.entityType });
            // Return error result
            const result = new ValidationResult_1.ValidationResult();
            result.addError('RULE_EXECUTION_ERROR', `Rule '${rule.name}' failed: ${error.message}`, undefined, { ruleName: rule.name, error: error.message });
            // Track stats
            if (this.options.enablePerformanceTracking) {
                stats.push({
                    ruleName: rule.name,
                    executionTime: Date.now() - startTime,
                    passed: false,
                    errorCount: 1,
                    warningCount: 0
                });
            }
            return result;
        }
    }
    /**
     * Create rule batches for parallel execution
     */
    createRuleBatches(rules) {
        const batches = [];
        const batchSize = this.options.maxParallelRules;
        for (let i = 0; i < rules.length; i += batchSize) {
            batches.push(rules.slice(i, i + batchSize));
        }
        return batches;
    }
    /**
     * Get cached validation result
     */
    getCachedResult(entityType, entity) {
        const key = this.createCacheKey(entityType, entity);
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        // Check if cache entry is still valid
        const age = Date.now() - entry.timestamp;
        if (age > this.options.cacheTTL) {
            this.cache.delete(key);
            return null;
        }
        // Verify hash matches
        const currentHash = this.hashEntity(entity);
        if (currentHash !== entry.hash) {
            this.cache.delete(key);
            return null;
        }
        return entry.result;
    }
    /**
     * Cache validation result
     */
    cacheResult(entityType, entity, result) {
        // Check cache size limit
        if (this.cache.size >= this.options.maxCacheSize) {
            // Remove oldest entry
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
        const key = this.createCacheKey(entityType, entity);
        const entry = {
            result,
            timestamp: Date.now(),
            hash: this.hashEntity(entity)
        };
        this.cache.set(key, entry);
    }
    /**
     * Create cache key for entity
     */
    createCacheKey(entityType, entity) {
        const id = entity.id || entity.Id || entity._id || JSON.stringify(entity);
        return `${entityType}:${id}`;
    }
    /**
     * Create hash of entity for cache validation
     */
    hashEntity(entity) {
        // Simple hash using JSON stringification
        // In production, consider using a proper hash function
        return JSON.stringify(entity);
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.logDebug('Cache cleared');
    }
    /**
     * Get performance statistics
     */
    getStatistics() {
        return new Map(this.stats);
    }
    /**
     * Clear performance statistics
     */
    clearStatistics() {
        this.stats.clear();
        this.logDebug('Statistics cleared');
    }
    /**
     * Get rule execution summary
     */
    getRuleSummary(entityType) {
        const summary = {
            totalRules: this.globalRules.length,
            enabledRules: this.globalRules.filter(r => r.enabled !== false).length,
            globalRules: this.globalRules.length,
            entityTypeRules: new Map()
        };
        if (entityType) {
            const rules = this.rules.get(entityType) || [];
            summary.totalRules += rules.length;
            summary.enabledRules += rules.filter(r => r.enabled !== false).length;
            summary.entityTypeRules.set(entityType, rules.length);
        }
        else {
            for (const [type, rules] of this.rules) {
                summary.totalRules += rules.length;
                summary.enabledRules += rules.filter(r => r.enabled !== false).length;
                summary.entityTypeRules.set(type, rules.length);
            }
        }
        return summary;
    }
    // Logging helpers
    logDebug(message, context) {
        this.errorLogger?.debug(message, { component: 'BusinessRuleEngine', ...context });
    }
    logInfo(message, context) {
        this.errorLogger?.info(message, { component: 'BusinessRuleEngine', ...context });
    }
    logWarn(message, context) {
        this.errorLogger?.warn(message, undefined, { component: 'BusinessRuleEngine', ...context });
    }
    logError(message, error, context) {
        this.errorLogger?.error(message, error, { component: 'BusinessRuleEngine', ...context });
    }
}
exports.BusinessRuleEngine = BusinessRuleEngine;
//# sourceMappingURL=BusinessRuleEngine.js.map