/**
 * Comprehensive type definitions for Autotask entity relationship mapping
 * and cascade operations system
 */
export type RelationshipType = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY' | 'SELF_REFERENCING' | 'HIERARCHICAL' | 'POLYMORPHIC';
export type CascadeAction = 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION' | 'SET_DEFAULT';
export type LoadingStrategy = 'EAGER' | 'LAZY' | 'SELECTIVE' | 'PREFETCH' | 'ON_DEMAND';
export interface EntityRelationship {
    /** Unique identifier for this relationship */
    id: string;
    /** Source entity name */
    sourceEntity: string;
    /** Target entity name */
    targetEntity: string;
    /** Type of relationship */
    relationshipType: RelationshipType;
    /** Source field(s) that define the relationship */
    sourceFields: string[];
    /** Target field(s) that define the relationship */
    targetFields: string[];
    /** Name of the relationship from source perspective */
    relationshipName: string;
    /** Name of the inverse relationship from target perspective */
    inverseRelationshipName?: string;
    /** Whether this relationship is mandatory */
    required: boolean;
    /** Cascade actions for different operations */
    cascadeOptions: {
        onCreate?: CascadeAction;
        onUpdate?: CascadeAction;
        onDelete?: CascadeAction;
    };
    /** Default loading strategy */
    loadingStrategy: LoadingStrategy;
    /** Additional metadata */
    metadata?: {
        description?: string;
        isSystemManaged?: boolean;
        businessRules?: string[];
        constraints?: string[];
        performance?: {
            isIndexed?: boolean;
            expectedCardinality?: number;
            queryFrequency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        };
    };
}
export interface EntityNode {
    entityName: string;
    relationships: Map<string, EntityRelationship>;
    incomingRelationships: Map<string, EntityRelationship>;
    outgoingRelationships: Map<string, EntityRelationship>;
    hierarchyLevel?: number;
    dependsOn: Set<string>;
    dependents: Set<string>;
}
export interface EntityGraph {
    nodes: Map<string, EntityNode>;
    edges: Map<string, EntityRelationship>;
    hierarchies: Map<string, EntityNode[]>;
    circularDependencies: Set<string>;
}
export interface CascadeContext {
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    sourceEntity: string;
    sourceId: string | number;
    depth: number;
    maxDepth: number;
    visited: Set<string>;
    affectedEntities: Map<string, Set<string | number>>;
    errors: CascadeError[];
    dryRun: boolean;
    transactionId?: string;
    batchSize?: number;
    preserveOrder?: boolean;
}
export interface CascadeResult {
    success: boolean;
    affectedEntities: Map<string, CascadeEntityResult>;
    errors: CascadeError[];
    warnings: CascadeWarning[];
    executionTime: number;
    operationsCount: number;
    transactionId?: string;
}
export interface CascadeEntityResult {
    entityName: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SKIP';
    recordIds: (string | number)[];
    success: boolean;
    errors: CascadeError[];
    executionOrder: number;
}
export interface CascadeError {
    code: string;
    message: string;
    entityName: string;
    recordId?: string | number;
    relationshipId?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details?: Record<string, any>;
}
export interface CascadeWarning {
    code: string;
    message: string;
    entityName: string;
    recordId?: string | number;
    suggestion?: string;
}
export interface RelationshipQueryOptions {
    includeRelationships?: string[];
    excludeRelationships?: string[];
    loadingStrategy?: LoadingStrategy;
    maxDepth?: number;
    batchSize?: number;
    includeMetadata?: boolean;
    followCircular?: boolean;
    cacheResults?: boolean;
    timeout?: number;
}
export interface LoadingPattern {
    name: string;
    description: string;
    strategy: LoadingStrategy;
    relationships: string[];
    conditions?: {
        entityName?: string;
        fieldConditions?: Record<string, any>;
        contextConditions?: string[];
    };
    performance?: {
        priority: number;
        estimatedLoadTime: number;
        cacheability: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    };
}
export interface RelationshipPath {
    source: string;
    target: string;
    path: EntityRelationship[];
    distance: number;
    cost: number;
    isOptimal: boolean;
}
export interface TraversalOptions {
    direction: 'FORWARD' | 'BACKWARD' | 'BIDIRECTIONAL';
    maxDepth: number;
    includeCircular: boolean;
    strategy: 'BREADTH_FIRST' | 'DEPTH_FIRST' | 'SHORTEST_PATH' | 'ALL_PATHS';
    filter?: (relationship: EntityRelationship) => boolean;
    sort?: (a: EntityRelationship, b: EntityRelationship) => number;
}
export interface IntegrityViolation {
    type: 'ORPHANED_RECORD' | 'MISSING_REFERENCE' | 'CIRCULAR_DEPENDENCY' | 'CONSTRAINT_VIOLATION';
    entityName: string;
    recordId: string | number;
    relationshipId: string;
    details: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    suggestedAction?: string;
}
export interface IntegrityCheckResult {
    isValid: boolean;
    violations: IntegrityViolation[];
    entitiesChecked: string[];
    recordsChecked: number;
    executionTime: number;
}
export interface BatchOperation {
    id: string;
    type: 'CASCADE_CREATE' | 'CASCADE_UPDATE' | 'CASCADE_DELETE' | 'INTEGRITY_CHECK';
    entities: {
        entityName: string;
        recordIds: (string | number)[];
        operation?: 'CREATE' | 'UPDATE' | 'DELETE';
        data?: any;
    }[];
    options: {
        batchSize?: number;
        parallelism?: number;
        preserveOrder?: boolean;
        continueOnError?: boolean;
        timeout?: number;
    };
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    result?: CascadeResult;
}
export interface RelationshipCache {
    entityRelationships: Map<string, EntityRelationship[]>;
    graphPaths: Map<string, RelationshipPath[]>;
    loadingPatterns: Map<string, LoadingPattern>;
    integrityResults: Map<string, IntegrityCheckResult>;
    lastUpdated: Date;
    ttl: number;
}
export interface RelationshipSystemConfig {
    maxCascadeDepth: number;
    defaultBatchSize: number;
    enableCircularDependencyDetection: boolean;
    enableIntegrityValidation: boolean;
    defaultLoadingStrategy: LoadingStrategy;
    cacheEnabled: boolean;
    cacheTtl: number;
    performanceMonitoring: boolean;
    logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    retryPolicy: {
        maxRetries: number;
        baseDelay: number;
        maxDelay: number;
        exponentialBackoff: boolean;
    };
}
export interface RelationshipEvent {
    type: 'RELATIONSHIP_LOADED' | 'CASCADE_STARTED' | 'CASCADE_COMPLETED' | 'INTEGRITY_VIOLATION' | 'PERFORMANCE_ALERT';
    entityName: string;
    relationshipId?: string;
    timestamp: Date;
    data: any;
    duration?: number;
}
export type RelationshipEventHandler = (event: RelationshipEvent) => void | Promise<void>;
export interface RelationshipMetrics {
    totalRelationships: number;
    relationshipsByType: Map<RelationshipType, number>;
    averageCascadeDepth: number;
    averageExecutionTime: number;
    cacheHitRate: number;
    integrityViolationsCount: number;
    mostUsedRelationships: Array<{
        relationshipId: string;
        usageCount: number;
    }>;
    performanceBottlenecks: Array<{
        operation: string;
        averageTime: number;
    }>;
}
//# sourceMappingURL=RelationshipTypes.d.ts.map