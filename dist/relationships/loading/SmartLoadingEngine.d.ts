/**
 * Smart loading engine for Autotask entity relationships
 * Provides intelligent loading patterns, caching, and optimization strategies
 */
import { LoadingStrategy, LoadingPattern, RelationshipQueryOptions } from '../types/RelationshipTypes';
import { RelationshipMapper } from '../core/RelationshipMapper';
import { AutotaskClient } from '../../client/AutotaskClient';
export interface LoadingContext {
    entityName: string;
    recordId: string | number;
    requestedFields?: string[];
    relationships: string[];
    loadingStrategy: LoadingStrategy;
    cacheEnabled: boolean;
    performance: {
        startTime: number;
        queryCount: number;
        cacheHits: number;
        cacheMisses: number;
    };
}
export interface LoadingResult {
    entity: any;
    relatedData: Map<string, any[]>;
    loadingStatistics: {
        totalQueryTime: number;
        queriesExecuted: number;
        cacheHitRate: number;
        relationshipsLoaded: number;
        bytesTransferred: number;
    };
    warnings: string[];
    optimizationSuggestions: string[];
}
export interface LoadingProfile {
    name: string;
    description: string;
    patterns: LoadingPattern[];
    cacheStrategy: 'AGGRESSIVE' | 'MODERATE' | 'CONSERVATIVE' | 'NONE';
    batchSize: number;
    maxDepth: number;
    timeoutMs: number;
}
export declare class SmartLoadingEngine {
    private relationshipMapper;
    private client;
    private cache;
    private loadingProfiles;
    private usageStats;
    constructor(client: AutotaskClient, relationshipMapper: RelationshipMapper);
    /**
     * Load entity with smart relationship loading
     */
    loadWithRelationships(entityName: string, recordId: string | number, options?: RelationshipQueryOptions): Promise<LoadingResult>;
    /**
     * Batch load multiple entities with relationships
     */
    batchLoadWithRelationships(requests: Array<{
        entityName: string;
        recordId: string | number;
        options?: RelationshipQueryOptions;
    }>, globalOptions?: {
        batchSize?: number;
        parallelism?: number;
        optimizeQueries?: boolean;
    }): Promise<Map<string, LoadingResult>>;
    /**
     * Prefetch relationships based on access patterns
     */
    prefetchRelationships(entityName: string, recordIds: (string | number)[], options?: {
        relationships?: string[];
        loadingStrategy?: LoadingStrategy;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    }): Promise<void>;
    /**
     * Load entities with selective relationship inclusion
     */
    loadSelective(entityName: string, recordId: string | number, includePatterns: string[], excludePatterns?: string[]): Promise<LoadingResult>;
    /**
     * Initialize default loading profiles
     */
    private initializeDefaultProfiles;
    /**
     * Select optimal loading pattern based on context
     */
    private selectOptimalLoadingPattern;
    /**
     * Load relationships using the selected pattern
     */
    private loadRelationshipsWithPattern;
    /**
     * Eager loading implementation
     */
    private eagerLoadRelationships;
    /**
     * Lazy loading implementation
     */
    private lazyLoadRelationships;
    /**
     * Selective loading implementation
     */
    private selectiveLoadRelationships;
    /**
     * Load a single relationship
     */
    private loadSingleRelationship;
    /**
     * Load primary entity
     */
    private loadPrimaryEntity;
    /**
     * Helper methods
     */
    private initializeCache;
    private buildCacheKey;
    private calculateCacheHitRate;
    private estimateBytesTransferred;
    private findRelationshipByName;
    private isHighPriorityRelationship;
    private loadOneToManyRelationship;
    private loadManyToOneRelationship;
    private loadManyToManyRelationship;
    private loadGenericRelationship;
    private createBatches;
    private groupRequestsByEntity;
    private getPredictedRelationships;
    private matchesIncludePattern;
    private matchesExcludePattern;
    private buildUsageBasedPattern;
    private buildLightweightPattern;
    private buildComprehensivePattern;
    private buildSelectivePattern;
    private prefetchLoadRelationships;
    private setupOnDemandLoading;
    private applyPostProcessingOptimizations;
    private updateUsageStatistics;
    private generateOptimizationSuggestions;
    private cacheLoadingResult;
}
//# sourceMappingURL=SmartLoadingEngine.d.ts.map