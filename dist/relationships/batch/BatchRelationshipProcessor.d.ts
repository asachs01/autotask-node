/**
 * Batch relationship processing system for Autotask entities
 * Handles high-performance batch operations with intelligent dependency resolution
 */
import { BatchOperation, RelationshipSystemConfig } from '../types/RelationshipTypes';
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
export declare class BatchRelationshipProcessor {
    private relationshipMapper;
    private cascadeEngine;
    private client;
    private config;
    private activeOperations;
    constructor(client: AutotaskClient, relationshipMapper: RelationshipMapper, cascadeEngine: CascadeEngine, config: RelationshipSystemConfig);
    /**
     * Process batch operations with intelligent dependency resolution
     */
    processBatchOperations(operations: BatchOperation[], options?: Partial<BatchProcessingOptions>): Promise<BatchResult>;
    /**
     * Batch create entities with relationship cascade
     */
    batchCascadeCreate(entityName: string, records: Array<{
        data: any;
        relatedData?: Map<string, any[]>;
        id?: string;
    }>, options?: Partial<BatchProcessingOptions>): Promise<BatchResult>;
    /**
     * Batch update entities with relationship cascade
     */
    batchCascadeUpdate(entityName: string, updates: Array<{
        recordId: string | number;
        data: any;
        id?: string;
    }>, options?: Partial<BatchProcessingOptions & {
        followDependents?: boolean;
    }>): Promise<BatchResult>;
    /**
     * Batch delete entities with relationship cascade
     */
    batchCascadeDelete(entityName: string, recordIds: (string | number)[], options?: Partial<BatchProcessingOptions & {
        force?: boolean;
        safetyChecks?: boolean;
    }>): Promise<BatchResult>;
    /**
     * Build dependency graph for operations
     */
    private buildDependencyGraph;
    /**
     * Analyze dependencies between operations
     */
    private analyzeDependencies;
    /**
     * Find dependency relationship between two operations
     */
    private findOperationDependency;
    /**
     * Calculate execution levels for dependency graph
     */
    private calculateExecutionLevels;
    /**
     * Validate dependency graph for issues
     */
    private validateDependencyGraph;
    /**
     * Optimize execution plan
     */
    private optimizeExecutionPlan;
    /**
     * Execute operations in dependency order
     */
    private executeOperationsInOrder;
    /**
     * Execute a single operation
     */
    private executeOperation;
    /**
     * Execute create operation
     */
    private executeCreateOperation;
    /**
     * Execute update operation
     */
    private executeUpdateOperation;
    /**
     * Execute delete operation
     */
    private executeDeleteOperation;
    /**
     * Helper methods
     */
    private initializeExecutionContext;
    private groupSimilarOperations;
    private optimizeNodeGroup;
    private shouldOptimizeMemory;
    private applyMemoryOptimizations;
    private optimizeParallelExecution;
    private updateStatistics;
    private rollbackCompletedOperations;
    private buildSuccessResult;
    private buildFailureResult;
    private generateOperationId;
    /**
     * Get active operations status
     */
    getActiveOperations(): Map<string, BatchExecutionContext>;
    /**
     * Cancel active operation
     */
    cancelOperation(operationId: string): Promise<boolean>;
}
//# sourceMappingURL=BatchRelationshipProcessor.d.ts.map