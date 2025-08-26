/**
 * Batch relationship processing system for Autotask entities
 * Handles high-performance batch operations with intelligent dependency resolution
 */

import { 
  BatchOperation,
  CascadeContext,
  CascadeResult,
  EntityRelationship,
  RelationshipSystemConfig
} from '../types/RelationshipTypes';
import { RelationshipMapper } from '../core/RelationshipMapper';
import { CascadeEngine } from '../cascade/CascadeEngine';
import { AutotaskClient } from '../../client/AutotaskClient';

export interface BatchProcessingOptions {
  maxConcurrency: number;
  batchSize: number;
  preserveOrder: boolean;
  continueOnError: boolean;
  enableOptimizations: boolean;
  timeoutMs: number;
  retryAttempts: number;
  rollbackOnFailure: boolean;
}

export interface BatchExecutionContext {
  operationId: string;
  startTime: number;
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  skippedOperations: number;
  errors: Map<string, Error>;
  statistics: {
    averageExecutionTime: number;
    peakMemoryUsage: number;
    totalBytesProcessed: number;
    cacheHitRate: number;
  };
}

export interface BatchResult {
  operationId: string;
  success: boolean;
  executionTime: number;
  processedEntities: Map<string, {
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  }>;
  statistics: BatchExecutionContext['statistics'];
  rollbackPlan?: string;
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  executionLevels: DependencyNode[][];
  cyclicDependencies: Set<string>;
}

export interface DependencyNode {
  operationId: string;
  entityName: string;
  recordIds: (string | number)[];
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  dependencies: Set<string>;
  dependents: Set<string>;
  executionLevel: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  result?: any;
  error?: Error;
}

export class BatchRelationshipProcessor {
  private relationshipMapper: RelationshipMapper;
  private cascadeEngine: CascadeEngine;
  private client: AutotaskClient;
  private config: RelationshipSystemConfig;
  private activeOperations: Map<string, BatchExecutionContext> = new Map();

  constructor(
    client: AutotaskClient, 
    relationshipMapper: RelationshipMapper,
    cascadeEngine: CascadeEngine,
    config: RelationshipSystemConfig
  ) {
    this.client = client;
    this.relationshipMapper = relationshipMapper;
    this.cascadeEngine = cascadeEngine;
    this.config = config;
  }

  /**
   * Process batch operations with intelligent dependency resolution
   */
  public async processBatchOperations(
    operations: BatchOperation[],
    options: Partial<BatchProcessingOptions> = {}
  ): Promise<BatchResult> {
    const operationId = this.generateOperationId();
    
    const processingOptions: BatchProcessingOptions = {
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

    } catch (error) {
      // Handle rollback if required
      if (processingOptions.rollbackOnFailure && context.completedOperations > 0) {
        await this.rollbackCompletedOperations(context);
      }

      return this.buildFailureResult(context, error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.activeOperations.delete(operationId);
    }
  }

  /**
   * Batch create entities with relationship cascade
   */
  public async batchCascadeCreate(
    entityName: string,
    records: Array<{
      data: any;
      relatedData?: Map<string, any[]>;
      id?: string; // Optional client-provided ID for tracking
    }>,
    options: Partial<BatchProcessingOptions> = {}
  ): Promise<BatchResult> {
    const operations: BatchOperation[] = records.map((record, index) => ({
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
  public async batchCascadeUpdate(
    entityName: string,
    updates: Array<{
      recordId: string | number;
      data: any;
      id?: string;
    }>,
    options: Partial<BatchProcessingOptions & { followDependents?: boolean }> = {}
  ): Promise<BatchResult> {
    const operations: BatchOperation[] = updates.map(update => ({
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
  public async batchCascadeDelete(
    entityName: string,
    recordIds: (string | number)[],
    options: Partial<BatchProcessingOptions & { force?: boolean; safetyChecks?: boolean }> = {}
  ): Promise<BatchResult> {
    const operations: BatchOperation[] = recordIds.map(recordId => ({
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
  private buildDependencyGraph(operations: BatchOperation[]): DependencyGraph {
    const graph: DependencyGraph = {
      nodes: new Map(),
      executionLevels: [],
      cyclicDependencies: new Set()
    };

    // Create nodes for each operation
    operations.forEach(operation => {
      const node: DependencyNode = {
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
  private analyzeDependencies(graph: DependencyGraph, operations: BatchOperation[]): void {
    for (let i = 0; i < operations.length; i++) {
      for (let j = i + 1; j < operations.length; j++) {
        const opA = operations[i];
        const opB = operations[j];

        const dependency = this.findOperationDependency(opA, opB);
        
        if (dependency) {
          const nodeA = graph.nodes.get(opA.id)!;
          const nodeB = graph.nodes.get(opB.id)!;

          if (dependency === 'A_DEPENDS_ON_B') {
            nodeA.dependencies.add(opB.id);
            nodeB.dependents.add(opA.id);
          } else if (dependency === 'B_DEPENDS_ON_A') {
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
  private findOperationDependency(
    opA: BatchOperation, 
    opB: BatchOperation
  ): 'A_DEPENDS_ON_B' | 'B_DEPENDS_ON_A' | null {
    const entityA = opA.entities[0];
    const entityB = opB.entities[0];

    if (!entityA || !entityB) return null;

    // Check direct entity relationships
    const isRelated = this.relationshipMapper.areDirectlyRelated(
      entityA.entityName, 
      entityB.entityName
    );

    if (!isRelated) return null;

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
    } else if (statsA.hierarchyLevel > statsB.hierarchyLevel) {
      return 'A_DEPENDS_ON_B';
    }

    return null;
  }

  /**
   * Calculate execution levels for dependency graph
   */
  private calculateExecutionLevels(graph: DependencyGraph): void {
    const visited = new Set<string>();
    const levels = new Map<number, DependencyNode[]>();

    const calculateLevel = (nodeId: string, currentLevel: number): number => {
      const node = graph.nodes.get(nodeId)!;
      
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
      levels.get(nodeLevel)!.push(node);

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
  private async validateDependencyGraph(graph: DependencyGraph): Promise<void> {
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
  private optimizeExecutionPlan(
    graph: DependencyGraph, 
    options: BatchProcessingOptions
  ): void {
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
  private async executeOperationsInOrder(
    graph: DependencyGraph,
    options: BatchProcessingOptions,
    context: BatchExecutionContext
  ): Promise<void> {
    const semaphore = new Semaphore(options.maxConcurrency);

    for (let level = 0; level < graph.executionLevels.length; level++) {
      const levelNodes = graph.executionLevels[level];
      if (!levelNodes || levelNodes.length === 0) continue;

      // Execute all nodes at this level in parallel (respecting concurrency limits)
      const promises = levelNodes.map(async node => {
        await semaphore.acquire();
        
        try {
          await this.executeOperation(node, options, context);
        } finally {
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
  private async executeOperation(
    node: DependencyNode,
    options: BatchProcessingOptions,
    context: BatchExecutionContext
  ): Promise<void> {
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

    } catch (error) {
      node.error = error as Error;
      node.status = 'FAILED';
      context.failedOperations++;
      context.errors.set(node.operationId, error as Error);

      if (!options.continueOnError) {
        throw error;
      }
    }
  }

  /**
   * Execute create operation
   */
  private async executeCreateOperation(
    node: DependencyNode, 
    options: BatchProcessingOptions
  ): Promise<CascadeResult> {
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
  private async executeUpdateOperation(
    node: DependencyNode,
    options: BatchProcessingOptions
  ): Promise<CascadeResult> {
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
  private async executeDeleteOperation(
    node: DependencyNode,
    options: BatchProcessingOptions
  ): Promise<CascadeResult> {
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
  private initializeExecutionContext(
    operationId: string, 
    operations: BatchOperation[]
  ): BatchExecutionContext {
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

  private groupSimilarOperations(graph: DependencyGraph): void {
    // Group operations of the same type on the same entity for optimization
    const entityGroups = new Map<string, DependencyNode[]>();

    graph.nodes.forEach(node => {
      const key = `${node.entityName}:${node.operation}`;
      if (!entityGroups.has(key)) {
        entityGroups.set(key, []);
      }
      entityGroups.get(key)!.push(node);
    });

    // Apply grouping optimizations
    entityGroups.forEach((nodes, key) => {
      if (nodes.length > 1) {
        this.optimizeNodeGroup(nodes);
      }
    });
  }

  private optimizeNodeGroup(nodes: DependencyNode[]): void {
    // Optimize a group of similar operations
    // This could involve batching, caching, etc.
  }

  private shouldOptimizeMemory(graph: DependencyGraph): boolean {
    return graph.nodes.size > 100; // Optimize for large graphs
  }

  private applyMemoryOptimizations(graph: DependencyGraph, options: BatchProcessingOptions): void {
    // Reduce batch sizes for memory-intensive operations
    options.batchSize = Math.min(options.batchSize, 25);
  }

  private optimizeParallelExecution(graph: DependencyGraph, options: BatchProcessingOptions): void {
    // Adjust concurrency based on graph complexity
    const totalNodes = graph.nodes.size;
    const levels = graph.executionLevels.length;
    
    if (levels > 10) {
      // Deep dependency graph - reduce concurrency
      options.maxConcurrency = Math.max(2, Math.floor(options.maxConcurrency * 0.7));
    } else if (totalNodes > 50) {
      // Many operations - increase concurrency if levels are shallow
      options.maxConcurrency = Math.min(10, Math.ceil(options.maxConcurrency * 1.3));
    }
  }

  private updateStatistics(
    context: BatchExecutionContext,
    entityName: string,
    duration: number,
    success: boolean
  ): void {
    // Update running statistics
    const totalTime = context.statistics.averageExecutionTime * context.completedOperations;
    context.statistics.averageExecutionTime = 
      (totalTime + duration) / (context.completedOperations + 1);
  }

  private async rollbackCompletedOperations(context: BatchExecutionContext): Promise<void> {
    // Implementation would rollback completed operations
    console.warn(`Rolling back ${context.completedOperations} completed operations`);
  }

  private buildSuccessResult(context: BatchExecutionContext): BatchResult {
    return {
      operationId: context.operationId,
      success: true,
      executionTime: Date.now() - context.startTime,
      processedEntities: new Map(),
      statistics: context.statistics
    };
  }

  private buildFailureResult(context: BatchExecutionContext, error: Error): BatchResult {
    return {
      operationId: context.operationId,
      success: false,
      executionTime: Date.now() - context.startTime,
      processedEntities: new Map(),
      statistics: context.statistics
    };
  }

  private generateOperationId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active operations status
   */
  public getActiveOperations(): Map<string, BatchExecutionContext> {
    return new Map(this.activeOperations);
  }

  /**
   * Cancel active operation
   */
  public async cancelOperation(operationId: string): Promise<boolean> {
    const context = this.activeOperations.get(operationId);
    if (!context) {
      return false;
    }

    // Mark operation as cancelled and cleanup
    this.activeOperations.delete(operationId);
    return true;
  }
}

/**
 * Simple semaphore implementation for controlling concurrency
 */
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.waitQueue.push(resolve);
      }
    });
  }

  release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift()!;
      this.permits--;
      next();
    }
  }
}