"use strict";
/**
 * Smart loading engine for Autotask entity relationships
 * Provides intelligent loading patterns, caching, and optimization strategies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartLoadingEngine = void 0;
class SmartLoadingEngine {
    constructor(client, relationshipMapper) {
        this.loadingProfiles = new Map();
        this.usageStats = new Map();
        this.client = client;
        this.relationshipMapper = relationshipMapper;
        this.cache = this.initializeCache();
        this.initializeDefaultProfiles();
    }
    /**
     * Load entity with smart relationship loading
     */
    async loadWithRelationships(entityName, recordId, options = {}) {
        const context = {
            entityName,
            recordId,
            requestedFields: options.includeRelationships,
            relationships: options.includeRelationships || [],
            loadingStrategy: options.loadingStrategy || 'SELECTIVE',
            cacheEnabled: options.cacheResults !== false,
            performance: {
                startTime: Date.now(),
                queryCount: 0,
                cacheHits: 0,
                cacheMisses: 0
            }
        };
        const result = {
            entity: null,
            relatedData: new Map(),
            loadingStatistics: {
                totalQueryTime: 0,
                queriesExecuted: 0,
                cacheHitRate: 0,
                relationshipsLoaded: 0,
                bytesTransferred: 0
            },
            warnings: [],
            optimizationSuggestions: []
        };
        try {
            // Step 1: Load primary entity
            result.entity = await this.loadPrimaryEntity(entityName, recordId, context);
            // Step 2: Determine optimal loading pattern
            const loadingPattern = this.selectOptimalLoadingPattern(entityName, context);
            // Step 3: Load relationships based on strategy
            await this.loadRelationshipsWithPattern(result, loadingPattern, context, options);
            // Step 4: Apply post-processing optimizations
            await this.applyPostProcessingOptimizations(result, context);
            // Step 5: Update usage statistics
            this.updateUsageStatistics(entityName, context);
            // Step 6: Generate optimization suggestions
            result.optimizationSuggestions = this.generateOptimizationSuggestions(context, result);
        }
        catch (error) {
            result.warnings.push(`Loading failed: ${error.message}`);
        }
        // Calculate final statistics
        result.loadingStatistics = {
            totalQueryTime: Date.now() - context.performance.startTime,
            queriesExecuted: context.performance.queryCount,
            cacheHitRate: this.calculateCacheHitRate(context),
            relationshipsLoaded: result.relatedData.size,
            bytesTransferred: this.estimateBytesTransferred(result)
        };
        return result;
    }
    /**
     * Batch load multiple entities with relationships
     */
    async batchLoadWithRelationships(requests, globalOptions = {}) {
        const results = new Map();
        const batchSize = globalOptions.batchSize || 10;
        const parallelism = globalOptions.parallelism || 3;
        // Group requests by entity type for optimization
        const requestsByEntity = this.groupRequestsByEntity(requests);
        // Process each entity type in batches
        for (const [entityName, entityRequests] of requestsByEntity) {
            const batches = this.createBatches(entityRequests, batchSize);
            for (const batch of batches) {
                const promises = batch.slice(0, parallelism).map(async (request) => {
                    const key = `${request.entityName}:${request.recordId}`;
                    const result = await this.loadWithRelationships(request.entityName, request.recordId, request.options);
                    results.set(key, result);
                });
                await Promise.all(promises);
            }
        }
        return results;
    }
    /**
     * Prefetch relationships based on access patterns
     */
    async prefetchRelationships(entityName, recordIds, options = {}) {
        const relationships = options.relationships ||
            this.getPredictedRelationships(entityName);
        const prefetchTasks = recordIds.map(async (recordId) => {
            const cacheKey = this.buildCacheKey(entityName, recordId, relationships);
            if (!this.cache.entityRelationships.has(cacheKey)) {
                try {
                    const result = await this.loadWithRelationships(entityName, recordId, {
                        includeRelationships: relationships,
                        loadingStrategy: options.loadingStrategy || 'LAZY',
                        cacheResults: true
                    });
                    // Store in cache with appropriate TTL
                    this.cacheLoadingResult(cacheKey, result, options.priority);
                }
                catch (error) {
                    // Silently fail prefetch operations
                    console.debug(`Prefetch failed for ${entityName}:${recordId}`, error);
                }
            }
        });
        // Execute prefetch tasks with limited concurrency
        const concurrency = 5;
        for (let i = 0; i < prefetchTasks.length; i += concurrency) {
            const batch = prefetchTasks.slice(i, i + concurrency);
            await Promise.allSettled(batch);
        }
    }
    /**
     * Load entities with selective relationship inclusion
     */
    async loadSelective(entityName, recordId, includePatterns, excludePatterns = []) {
        const allRelationships = this.relationshipMapper.getEntityRelationships(entityName);
        const selectedRelationships = allRelationships
            .filter(rel => this.matchesIncludePattern(rel, includePatterns))
            .filter(rel => !this.matchesExcludePattern(rel, excludePatterns))
            .map(rel => rel.relationshipName);
        return this.loadWithRelationships(entityName, recordId, {
            includeRelationships: selectedRelationships,
            loadingStrategy: 'SELECTIVE'
        });
    }
    /**
     * Initialize default loading profiles
     */
    initializeDefaultProfiles() {
        // Lightweight profile for quick operations
        this.loadingProfiles.set('lightweight', {
            name: 'Lightweight',
            description: 'Minimal relationship loading for fast operations',
            patterns: [
                {
                    name: 'core-only',
                    description: 'Load only essential relationships',
                    strategy: 'LAZY',
                    relationships: ['company', 'assignedResource', 'status'],
                    performance: { priority: 1, estimatedLoadTime: 100, cacheability: 'HIGH' }
                }
            ],
            cacheStrategy: 'AGGRESSIVE',
            batchSize: 50,
            maxDepth: 2,
            timeoutMs: 5000
        });
        // Comprehensive profile for detailed operations
        this.loadingProfiles.set('comprehensive', {
            name: 'Comprehensive',
            description: 'Full relationship loading for detailed analysis',
            patterns: [
                {
                    name: 'full-load',
                    description: 'Load all available relationships',
                    strategy: 'EAGER',
                    relationships: ['*'],
                    performance: { priority: 3, estimatedLoadTime: 1000, cacheability: 'MEDIUM' }
                }
            ],
            cacheStrategy: 'MODERATE',
            batchSize: 20,
            maxDepth: 5,
            timeoutMs: 30000
        });
        // Balanced profile for typical operations
        this.loadingProfiles.set('balanced', {
            name: 'Balanced',
            description: 'Optimized balance between speed and completeness',
            patterns: [
                {
                    name: 'smart-selective',
                    description: 'Load commonly accessed relationships',
                    strategy: 'SELECTIVE',
                    relationships: [], // Will be determined dynamically
                    performance: { priority: 2, estimatedLoadTime: 300, cacheability: 'HIGH' }
                }
            ],
            cacheStrategy: 'MODERATE',
            batchSize: 30,
            maxDepth: 3,
            timeoutMs: 15000
        });
    }
    /**
     * Select optimal loading pattern based on context
     */
    selectOptimalLoadingPattern(entityName, context) {
        // Analyze usage patterns
        const usageFrequency = this.usageStats.get(entityName) || 0;
        const relationships = this.relationshipMapper.getEntityRelationships(entityName);
        // Determine pattern based on various factors
        if (context.relationships.length === 0) {
            // No specific relationships requested, use usage-based pattern
            if (usageFrequency > 100) {
                return this.buildUsageBasedPattern(entityName);
            }
            else {
                return this.buildLightweightPattern(entityName);
            }
        }
        else if (context.relationships.length > relationships.length * 0.7) {
            // Requesting most relationships, use comprehensive pattern
            return this.buildComprehensivePattern(entityName);
        }
        else {
            // Specific relationships requested, use selective pattern
            return this.buildSelectivePattern(entityName, context.relationships);
        }
    }
    /**
     * Load relationships using the selected pattern
     */
    async loadRelationshipsWithPattern(result, pattern, context, options) {
        const maxDepth = options.maxDepth || 3;
        const batchSize = options.batchSize || 25;
        switch (pattern.strategy) {
            case 'EAGER':
                await this.eagerLoadRelationships(result, context, pattern.relationships, maxDepth);
                break;
            case 'LAZY':
                await this.lazyLoadRelationships(result, context, pattern.relationships);
                break;
            case 'SELECTIVE':
                await this.selectiveLoadRelationships(result, context, pattern.relationships, batchSize);
                break;
            case 'PREFETCH':
                await this.prefetchLoadRelationships(result, context, pattern.relationships);
                break;
            case 'ON_DEMAND':
                // Store relationships for on-demand loading
                this.setupOnDemandLoading(result, context, pattern.relationships);
                break;
        }
    }
    /**
     * Eager loading implementation
     */
    async eagerLoadRelationships(result, context, relationships, maxDepth) {
        const loadQueue = [];
        // Initialize queue with direct relationships
        for (const relationshipName of relationships) {
            loadQueue.push({
                entityName: context.entityName,
                recordId: context.recordId,
                relationshipName,
                depth: 1
            });
        }
        const loaded = new Set();
        while (loadQueue.length > 0) {
            const { entityName, recordId, relationshipName, depth } = loadQueue.shift();
            if (depth > maxDepth)
                continue;
            const cacheKey = `${entityName}:${recordId}:${relationshipName}`;
            if (loaded.has(cacheKey))
                continue;
            try {
                const relatedData = await this.loadSingleRelationship(entityName, recordId, relationshipName, context);
                if (relatedData && relatedData.length > 0) {
                    result.relatedData.set(relationshipName, relatedData);
                    loaded.add(cacheKey);
                    // Queue nested relationships if within depth limit
                    if (depth < maxDepth) {
                        const relationship = this.findRelationshipByName(entityName, relationshipName);
                        if (relationship) {
                            const nestedRelationships = this.relationshipMapper
                                .getEntityRelationships(relationship.targetEntity)
                                .slice(0, 3); // Limit nested relationships to prevent explosion
                            for (const nestedRel of nestedRelationships) {
                                for (const record of relatedData) {
                                    loadQueue.push({
                                        entityName: relationship.targetEntity,
                                        recordId: record.id,
                                        relationshipName: nestedRel.relationshipName,
                                        depth: depth + 1
                                    });
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
                result.warnings.push(`Failed to load relationship ${relationshipName}: ${error.message}`);
            }
        }
    }
    /**
     * Lazy loading implementation
     */
    async lazyLoadRelationships(result, context, relationships) {
        // Only load relationships that are likely to be accessed immediately
        const highPriorityRelationships = relationships.filter(rel => this.isHighPriorityRelationship(context.entityName, rel)).slice(0, 5); // Limit to top 5
        for (const relationshipName of highPriorityRelationships) {
            try {
                const relatedData = await this.loadSingleRelationship(context.entityName, context.recordId, relationshipName, context);
                if (relatedData && relatedData.length > 0) {
                    result.relatedData.set(relationshipName, relatedData);
                }
            }
            catch (error) {
                result.warnings.push(`Failed to lazy load relationship ${relationshipName}: ${error.message}`);
            }
        }
    }
    /**
     * Selective loading implementation
     */
    async selectiveLoadRelationships(result, context, relationships, batchSize) {
        const batches = this.createBatches(relationships, batchSize);
        for (const batch of batches) {
            const promises = batch.map(async (relationshipName) => {
                try {
                    const relatedData = await this.loadSingleRelationship(context.entityName, context.recordId, relationshipName, context);
                    if (relatedData && relatedData.length > 0) {
                        result.relatedData.set(relationshipName, relatedData);
                    }
                }
                catch (error) {
                    result.warnings.push(`Failed to selectively load relationship ${relationshipName}: ${error.message}`);
                }
            });
            await Promise.all(promises);
        }
    }
    /**
     * Load a single relationship
     */
    async loadSingleRelationship(entityName, recordId, relationshipName, context) {
        const cacheKey = this.buildCacheKey(entityName, recordId, [relationshipName]);
        // Check cache first
        if (context.cacheEnabled && this.cache.entityRelationships.has(cacheKey)) {
            context.performance.cacheHits++;
            return this.cache.entityRelationships.get(cacheKey);
        }
        context.performance.cacheMisses++;
        context.performance.queryCount++;
        // Find relationship definition
        const relationship = this.findRelationshipByName(entityName, relationshipName);
        if (!relationship) {
            throw new Error(`Relationship '${relationshipName}' not found for entity '${entityName}'`);
        }
        // Execute query based on relationship type
        let relatedData = [];
        try {
            switch (relationship.relationshipType) {
                case 'ONE_TO_MANY':
                    relatedData = await this.loadOneToManyRelationship(relationship, recordId);
                    break;
                case 'MANY_TO_ONE':
                    relatedData = await this.loadManyToOneRelationship(relationship, recordId);
                    break;
                case 'MANY_TO_MANY':
                    relatedData = await this.loadManyToManyRelationship(relationship, recordId);
                    break;
                default:
                    relatedData = await this.loadGenericRelationship(relationship, recordId);
            }
            // Cache the result
            if (context.cacheEnabled) {
                this.cache.entityRelationships.set(cacheKey, relatedData);
            }
        }
        catch (error) {
            throw new Error(`Failed to load ${relationshipName}: ${error.message}`);
        }
        return relatedData;
    }
    /**
     * Load primary entity
     */
    async loadPrimaryEntity(entityName, recordId, context) {
        const cacheKey = `${entityName}:${recordId}`;
        if (context.cacheEnabled && this.cache.entityRelationships.has(cacheKey)) {
            context.performance.cacheHits++;
            return this.cache.entityRelationships.get(cacheKey);
        }
        context.performance.cacheMisses++;
        context.performance.queryCount++;
        // Load entity using client
        const entity = await this.client.core.get(entityName, recordId);
        if (context.cacheEnabled) {
            this.cache.entityRelationships.set(cacheKey, entity);
        }
        return entity;
    }
    /**
     * Helper methods
     */
    initializeCache() {
        return {
            entityRelationships: new Map(),
            graphPaths: new Map(),
            loadingPatterns: new Map(),
            integrityResults: new Map(),
            lastUpdated: new Date(),
            ttl: 300000 // 5 minutes default TTL
        };
    }
    buildCacheKey(entityName, recordId, relationships) {
        return `${entityName}:${recordId}:${relationships.sort().join(',')}`;
    }
    calculateCacheHitRate(context) {
        const total = context.performance.cacheHits + context.performance.cacheMisses;
        return total > 0 ? (context.performance.cacheHits / total) * 100 : 0;
    }
    estimateBytesTransferred(result) {
        let bytes = JSON.stringify(result.entity).length;
        result.relatedData.forEach(data => {
            bytes += JSON.stringify(data).length;
        });
        return bytes;
    }
    findRelationshipByName(entityName, relationshipName) {
        return this.relationshipMapper.getEntityRelationships(entityName)
            .find(rel => rel.relationshipName === relationshipName);
    }
    isHighPriorityRelationship(entityName, relationshipName) {
        // This would be based on usage statistics and business rules
        const highPriorityRelationships = new Set([
            'company', 'assignedResource', 'project', 'ticket', 'contact'
        ]);
        return highPriorityRelationships.has(relationshipName);
    }
    // Placeholder methods for actual data loading
    async loadOneToManyRelationship(relationship, recordId) {
        // Implementation would use Autotask client to fetch related records
        return [];
    }
    async loadManyToOneRelationship(relationship, recordId) {
        // Implementation would use Autotask client to fetch related records
        return [];
    }
    async loadManyToManyRelationship(relationship, recordId) {
        // Implementation would use Autotask client to fetch related records
        return [];
    }
    async loadGenericRelationship(relationship, recordId) {
        // Implementation would use Autotask client to fetch related records
        return [];
    }
    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }
    groupRequestsByEntity(requests) {
        const grouped = new Map();
        requests.forEach(request => {
            if (!grouped.has(request.entityName)) {
                grouped.set(request.entityName, []);
            }
            grouped.get(request.entityName).push(request);
        });
        return grouped;
    }
    getPredictedRelationships(entityName) {
        // This would use ML or heuristics to predict likely relationships
        return [];
    }
    matchesIncludePattern(relationship, patterns) {
        return patterns.some(pattern => relationship.relationshipName.includes(pattern) || pattern === '*');
    }
    matchesExcludePattern(relationship, patterns) {
        return patterns.some(pattern => relationship.relationshipName.includes(pattern));
    }
    buildUsageBasedPattern(entityName) {
        // Build pattern based on usage statistics
        return {
            name: 'usage-based',
            description: 'Pattern based on usage statistics',
            strategy: 'SELECTIVE',
            relationships: [],
            performance: { priority: 2, estimatedLoadTime: 200, cacheability: 'HIGH' }
        };
    }
    buildLightweightPattern(entityName) {
        return this.loadingProfiles.get('lightweight').patterns[0];
    }
    buildComprehensivePattern(entityName) {
        return this.loadingProfiles.get('comprehensive').patterns[0];
    }
    buildSelectivePattern(entityName, relationships) {
        return {
            name: 'custom-selective',
            description: 'Custom selective pattern',
            strategy: 'SELECTIVE',
            relationships,
            performance: { priority: 2, estimatedLoadTime: 300, cacheability: 'MEDIUM' }
        };
    }
    async prefetchLoadRelationships(result, context, relationships) {
        // Implementation for prefetch loading
    }
    setupOnDemandLoading(result, context, relationships) {
        // Implementation for on-demand loading setup
    }
    async applyPostProcessingOptimizations(result, context) {
        // Implementation for post-processing optimizations
    }
    updateUsageStatistics(entityName, context) {
        const current = this.usageStats.get(entityName) || 0;
        this.usageStats.set(entityName, current + 1);
    }
    generateOptimizationSuggestions(context, result) {
        const suggestions = [];
        // Analyze performance and suggest improvements
        if (context.performance.queryCount > 10) {
            suggestions.push('Consider using batch loading for better performance');
        }
        if (this.calculateCacheHitRate(context) < 50) {
            suggestions.push('Enable caching to improve response times');
        }
        return suggestions;
    }
    cacheLoadingResult(cacheKey, result, priority) {
        // Implementation for caching with priority-based TTL
    }
}
exports.SmartLoadingEngine = SmartLoadingEngine;
//# sourceMappingURL=SmartLoadingEngine.js.map