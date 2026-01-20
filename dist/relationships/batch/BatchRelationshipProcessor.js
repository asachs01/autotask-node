"use strict";
/**
 * Batch relationship processing system for Autotask entities
 * Handles high-performance batch operations with intelligent dependency resolution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchRelationshipProcessor = void 0;
class BatchRelationshipProcessor {
    constructor(client, relationshipMapper, cascadeEngine, config) {
        this.activeOperations = new Map();
        this.client = client;
        this.relationshipMapper = relationshipMapper;
        this.cascadeEngine = cascadeEngine;
        this.config = config;
    }
    /**
     * Process batch operations with intelligent dependency resolution
     */
    async processBatchOperations(operations, options = {}) {
        const operationId = this.generateOperationId();
        const processingOptions = {
            maxConcurrency: options.maxConcurrency || 5,
            batchSize: options.batchSize || this.config.defaultBatchSize,
            preserveOrder: options.preserveOrder || false,
            continueOnError: options.continueOnError || false,
            enableOptimizations: options.enableOptimizations !== false,
            timeoutMs: options.timeoutMs || 300000, // 5 minutes default
            retryAttempts: options.retryAttempts || 3,
            rollbackOnFailure: options.rollbackOnFailure || true
        };
        const context = this.initializeExecutionContext(operationId, operations);
        this.activeOperations.set(operationId, context);
        try {
            // Step 1: Build dependency graph
            const dependencyGraph = this.buildDependencyGraph(operations);
            // Step 2: Validate dependency graph
            await this.validateDependencyGraph(dependencyGraph);
            // Step 3: Optimize execution plan
            if (processingOptions.enableOptimizations) {
                this.optimizeExecutionPlan(dependencyGraph, processingOptions);
            }
            // Step 4: Execute operations in dependency order
            await this.executeOperationsInOrder(dependencyGraph, processingOptions, context);
            return this.buildSuccessResult(context);
        }
        catch (error) {
            // Handle rollback if required
            if (processingOptions.rollbackOnFailure && context.completedOperations > 0) {
                await this.rollbackCompletedOperations(context);
            }
            return this.buildFailureResult(context, error instanceof Error ? error : new Error(String(error)));
        }
        finally {
            this.activeOperations.delete(operationId);
        }
    }
    /**
     * Batch create entities with relationship cascade
     */
    async batchCascadeCreate(entityName, records, options = {}) {
        const operations = records.map((record, index) => ({
            id: record.id || `create_${index}`,
            type: 'CASCADE_CREATE',
            entities: [{
                    entityName,
                    recordIds: ['pending'],
                    operation: 'CREATE',
                    data: record.data
                }],
            options: {
                batchSize: options.batchSize,
                continueOnError: options.continueOnError
            },
            status: 'PENDING'
        }));
        return this.processBatchOperations(operations, options);
    }
    /**
     * Batch update entities with relationship cascade
     */
    async batchCascadeUpdate(entityName, updates, options = {}) {
        const operations = updates.map(update => ({
            id: update.id || `update_${update.recordId}`,
            type: 'CASCADE_UPDATE',
            entities: [{
                    entityName,
                    recordIds: [update.recordId],
                    operation: 'UPDATE',
                    data: update.data
                }],
            options: {
                batchSize: options.batchSize,
                continueOnError: options.continueOnError
            },
            status: 'PENDING'
        }));
        return this.processBatchOperations(operations, options);
    }
    /**
     * Batch delete entities with relationship cascade
     */
    async batchCascadeDelete(entityName, recordIds, options = {}) {
        const operations = recordIds.map(recordId => ({
            id: `delete_${recordId}`,
            type: 'CASCADE_DELETE',
            entities: [{
                    entityName,
                    recordIds: [recordId],
                    operation: 'DELETE'
                }],
            options: {
                batchSize: options.batchSize,
                continueOnError: options.continueOnError
            },
            status: 'PENDING'
        }));
        return this.processBatchOperations(operations, options);
    }
    /**
     * Build dependency graph for operations
     */
    buildDependencyGraph(operations) {
        const graph = {
            nodes: new Map(),
            executionLevels: [],
            cyclicDependencies: new Set()
        };
        // Create nodes for each operation
        operations.forEach(operation => {
            const node = {
                operationId: operation.id,
                entityName: operation.entities[0]?.entityName || '',
                recordIds: operation.entities[0]?.recordIds || [],
                operation: operation.entities[0]?.operation || 'UPDATE',
                dependencies: new Set(),
                dependents: new Set(),
                executionLevel: 0,
                status: 'PENDING'
            };
            graph.nodes.set(operation.id, node);
        });
        // Build dependencies based on relationships
        this.analyzeDependencies(graph, operations);
        // Calculate execution levels
        this.calculateExecutionLevels(graph);
        return graph;
    }
    /**
     * Analyze dependencies between operations
     */
    analyzeDependencies(graph, operations) {
        for (let i = 0; i < operations.length; i++) {
            for (let j = i + 1; j < operations.length; j++) {
                const opA = operations[i];
                const opB = operations[j];
                const dependency = this.findOperationDependency(opA, opB);
                if (dependency) {
                    const nodeA = graph.nodes.get(opA.id);
                    const nodeB = graph.nodes.get(opB.id);
                    if (dependency === 'A_DEPENDS_ON_B') {
                        nodeA.dependencies.add(opB.id);
                        nodeB.dependents.add(opA.id);
                    }
                    else if (dependency === 'B_DEPENDS_ON_A') {
                        nodeB.dependencies.add(opA.id);
                        nodeA.dependents.add(opB.id);
                    }
                }
            }
        }
    }
    /**
     * Find dependency relationship between two operations
     */
    findOperationDependency(opA, opB) {
        const entityA = opA.entities[0];
        const entityB = opB.entities[0];
        if (!entityA || !entityB)
            return null;
        // Check direct entity relationships
        const isRelated = this.relationshipMapper.areDirectlyRelated(entityA.entityName, entityB.entityName);
        if (!isRelated)
            return null;
        // Determine dependency direction based on operation types
        if (entityA.operation === 'CREATE' && entityB.operation === 'DELETE') {
            return 'A_DEPENDS_ON_B'; // Create depends on not-deleted
        }
        if (entityA.operation === 'DELETE' && entityB.operation === 'CREATE') {
            return 'B_DEPENDS_ON_A';
        }
        if (entityA.operation === 'UPDATE' && entityB.operation === 'DELETE') {
            return 'A_DEPENDS_ON_B';
        }
        // Check hierarchy levels
        const statsA = this.relationshipMapper.getEntityStatistics(entityA.entityName);
        const statsB = this.relationshipMapper.getEntityStatistics(entityB.entityName);
        if (statsA.hierarchyLevel < statsB.hierarchyLevel) {
            return 'B_DEPENDS_ON_A'; // Higher level depends on lower level
        }
        else if (statsA.hierarchyLevel > statsB.hierarchyLevel) {
            return 'A_DEPENDS_ON_B';
        }
        return null;
    }
    /**
     * Calculate execution levels for dependency graph
     */
    calculateExecutionLevels(graph) {
        const visited = new Set();
        const levels = new Map();
        const calculateLevel = (nodeId, currentLevel) => {
            const node = graph.nodes.get(nodeId);
            if (visited.has(nodeId)) {
                // Circular dependency detected
                graph.cyclicDependencies.add(nodeId);
                return currentLevel;
            }
            visited.add(nodeId);
            let maxDependencyLevel = -1;
            for (const depId of node.dependencies) {
                const depLevel = calculateLevel(depId, currentLevel + 1);
                maxDependencyLevel = Math.max(maxDependencyLevel, depLevel);
            }
            const nodeLevel = maxDependencyLevel + 1;
            node.executionLevel = nodeLevel;
            if (!levels.has(nodeLevel)) {
                levels.set(nodeLevel, []);
            }
            levels.get(nodeLevel).push(node);
            visited.delete(nodeId);
            return nodeLevel;
        };
        // Calculate levels for all nodes
        graph.nodes.forEach((_, nodeId) => {
            if (!visited.has(nodeId)) {
                calculateLevel(nodeId, 0);
            }
        });
        // Convert to array of levels
        const maxLevel = Math.max(...Array.from(levels.keys()));
        for (let i = 0; i <= maxLevel; i++) {
            graph.executionLevels[i] = levels.get(i) || [];
        }
    }
    /**
     * Validate dependency graph for issues
     */
    async validateDependencyGraph(graph) {
        if (graph.cyclicDependencies.size > 0) {
            const cycles = Array.from(graph.cyclicDependencies).join(', ');
            throw new Error(`Circular dependencies detected: ${cycles}`);
        }
        // Validate that all dependencies exist
        graph.nodes.forEach((node, nodeId) => {
            node.dependencies.forEach(depId => {
                if (!graph.nodes.has(depId)) {
                    throw new Error(`Invalid dependency: ${nodeId} depends on non-existent operation ${depId}`);
                }
            });
        });
    }
    /**
     * Optimize execution plan
     */
    optimizeExecutionPlan(graph, options) {
        // Group similar operations for batch processing
        this.groupSimilarOperations(graph);
        // Optimize for memory usage
        if (this.shouldOptimizeMemory(graph)) {
            this.applyMemoryOptimizations(graph, options);
        }
        // Optimize for parallel execution
        this.optimizeParallelExecution(graph, options);
    }
    /**
     * Execute operations in dependency order
     */
    async executeOperationsInOrder(graph, options, context) {
        const semaphore = new Semaphore(options.maxConcurrency);
        for (let level = 0; level < graph.executionLevels.length; level++) {
            const levelNodes = graph.executionLevels[level];
            if (!levelNodes || levelNodes.length === 0)
                continue;
            // Execute all nodes at this level in parallel (respecting concurrency limits)
            const promises = levelNodes.map(async (node) => {
                await semaphore.acquire();
                try {
                    await this.executeOperation(node, options, context);
                }
                finally {
                    semaphore.release();
                }
            });
            await Promise.allSettled(promises);
            // Check if we should continue based on errors
            if (!options.continueOnError) {
                const hasErrors = levelNodes.some(node => node.status === 'FAILED');
                if (hasErrors) {
                    throw new Error('Operation failed at level ' + level);
                }
            }
        }
    }
    /**
     * Execute a single operation
     */
    async executeOperation(node, options, context) {
        node.status = 'IN_PROGRESS';
        try {
            const startTime = Date.now();
            switch (node.operation) {
                case 'CREATE':
                    node.result = await this.executeCreateOperation(node, options);
                    break;
                case 'UPDATE':
                    node.result = await this.executeUpdateOperation(node, options);
                    break;
                case 'DELETE':
                    node.result = await this.executeDeleteOperation(node, options);
                    break;
            }
            const duration = Date.now() - startTime;
            this.updateStatistics(context, node.entityName, duration, true);
            node.status = 'COMPLETED';
            context.completedOperations++;
        }
        catch (error) {
            node.error = error;
            node.status = 'FAILED';
            context.failedOperations++;
            context.errors.set(node.operationId, error);
            if (!options.continueOnError) {
                throw error;
            }
        }
    }
    /**
     * Execute create operation
     */
    async executeCreateOperation(node, options) {
        // Implementation would use CascadeEngine for create operations
        return {
            success: true,
            affectedEntities: new Map(),
            errors: [],
            warnings: [],
            executionTime: 0,
            operationsCount: 1
        };
    }
    /**
     * Execute update operation
     */
    async executeUpdateOperation(node, options) {
        // Implementation would use CascadeEngine for update operations
        return {
            success: true,
            affectedEntities: new Map(),
            errors: [],
            warnings: [],
            executionTime: 0,
            operationsCount: 1
        };
    }
    /**
     * Execute delete operation
     */
    async executeDeleteOperation(node, options) {
        // Implementation would use CascadeEngine for delete operations
        return {
            success: true,
            affectedEntities: new Map(),
            errors: [],
            warnings: [],
            executionTime: 0,
            operationsCount: 1
        };
    }
    /**
     * Helper methods
     */
    initializeExecutionContext(operationId, operations) {
        return {
            operationId,
            startTime: Date.now(),
            totalOperations: operations.length,
            completedOperations: 0,
            failedOperations: 0,
            skippedOperations: 0,
            errors: new Map(),
            statistics: {
                averageExecutionTime: 0,
                peakMemoryUsage: 0,
                totalBytesProcessed: 0,
                cacheHitRate: 0
            }
        };
    }
    groupSimilarOperations(graph) {
        // Group operations of the same type on the same entity for optimization
        const entityGroups = new Map();
        graph.nodes.forEach(node => {
            const key = `${node.entityName}:${node.operation}`;
            if (!entityGroups.has(key)) {
                entityGroups.set(key, []);
            }
            entityGroups.get(key).push(node);
        });
        // Apply grouping optimizations
        entityGroups.forEach((nodes, key) => {
            if (nodes.length > 1) {
                this.optimizeNodeGroup(nodes);
            }
        });
    }
    optimizeNodeGroup(nodes) {
        // Optimize a group of similar operations
        // This could involve batching, caching, etc.
    }
    shouldOptimizeMemory(graph) {
        return graph.nodes.size > 100; // Optimize for large graphs
    }
    applyMemoryOptimizations(graph, options) {
        // Reduce batch sizes for memory-intensive operations
        options.batchSize = Math.min(options.batchSize, 25);
    }
    optimizeParallelExecution(graph, options) {
        // Adjust concurrency based on graph complexity
        const totalNodes = graph.nodes.size;
        const levels = graph.executionLevels.length;
        if (levels > 10) {
            // Deep dependency graph - reduce concurrency
            options.maxConcurrency = Math.max(2, Math.floor(options.maxConcurrency * 0.7));
        }
        else if (totalNodes > 50) {
            // Many operations - increase concurrency if levels are shallow
            options.maxConcurrency = Math.min(10, Math.ceil(options.maxConcurrency * 1.3));
        }
    }
    updateStatistics(context, entityName, duration, success) {
        // Update running statistics
        const totalTime = context.statistics.averageExecutionTime * context.completedOperations;
        context.statistics.averageExecutionTime =
            (totalTime + duration) / (context.completedOperations + 1);
    }
    async rollbackCompletedOperations(context) {
        // Implementation would rollback completed operations
        console.warn(`Rolling back ${context.completedOperations} completed operations`);
    }
    buildSuccessResult(context) {
        return {
            operationId: context.operationId,
            success: true,
            executionTime: Date.now() - context.startTime,
            processedEntities: new Map(),
            statistics: context.statistics
        };
    }
    buildFailureResult(context, error) {
        return {
            operationId: context.operationId,
            success: false,
            executionTime: Date.now() - context.startTime,
            processedEntities: new Map(),
            statistics: context.statistics
        };
    }
    generateOperationId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get active operations status
     */
    getActiveOperations() {
        return new Map(this.activeOperations);
    }
    /**
     * Cancel active operation
     */
    async cancelOperation(operationId) {
        const context = this.activeOperations.get(operationId);
        if (!context) {
            return false;
        }
        // Mark operation as cancelled and cleanup
        this.activeOperations.delete(operationId);
        return true;
    }
}
exports.BatchRelationshipProcessor = BatchRelationshipProcessor;
/**
 * Simple semaphore implementation for controlling concurrency
 */
class Semaphore {
    constructor(permits) {
        this.waitQueue = [];
        this.permits = permits;
    }
    async acquire() {
        return new Promise(resolve => {
            if (this.permits > 0) {
                this.permits--;
                resolve();
            }
            else {
                this.waitQueue.push(resolve);
            }
        });
    }
    release() {
        this.permits++;
        if (this.waitQueue.length > 0) {
            const next = this.waitQueue.shift();
            this.permits--;
            next();
        }
    }
}
//# sourceMappingURL=BatchRelationshipProcessor.js.map