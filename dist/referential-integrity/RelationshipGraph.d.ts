/**
 * Entity Relationship Graph
 *
 * Manages and analyzes the graph of entity relationships,
 * providing path finding and dependency analysis.
 */
import { EntityRelationship } from './ReferentialIntegrityManager';
/**
 * Node in the relationship graph
 */
export interface GraphNode {
    /** Entity type */
    entityType: string;
    /** Outgoing edges (relationships where this is the source) */
    outgoing: GraphEdge[];
    /** Incoming edges (relationships where this is the target) */
    incoming: GraphEdge[];
    /** Metadata about the entity */
    metadata?: {
        description?: string;
        primaryKey?: string;
        indexes?: string[];
        constraints?: string[];
    };
}
/**
 * Edge in the relationship graph
 */
export interface GraphEdge {
    /** Source entity type */
    source: string;
    /** Target entity type */
    target: string;
    /** Relationship details */
    relationship: EntityRelationship;
    /** Weight for path finding (lower is better) */
    weight: number;
}
/**
 * Path between two entities
 */
export interface EntityPath {
    /** Starting entity */
    source: string;
    /** Ending entity */
    target: string;
    /** Edges in the path */
    edges: GraphEdge[];
    /** Total path weight */
    totalWeight: number;
    /** Path length (number of edges) */
    length: number;
}
/**
 * Dependency information for an entity
 */
export interface DependencyInfo {
    /** Entity type */
    entityType: string;
    /** Entities that this entity depends on */
    dependencies: string[];
    /** Entities that depend on this entity */
    dependents: string[];
    /** Whether this entity can be deleted independently */
    canDelete: boolean;
    /** Order for safe deletion (lower numbers should be deleted first) */
    deletionOrder: number;
    /** Order for safe creation (lower numbers should be created first) */
    creationOrder: number;
}
/**
 * Graph cycle detection result
 */
export interface CycleInfo {
    /** Whether a cycle exists */
    hasCycle: boolean;
    /** Entities involved in cycles */
    cycleEntities?: string[];
    /** Edges forming the cycle */
    cycleEdges?: GraphEdge[];
}
/**
 * Relationship Graph Manager
 */
export declare class RelationshipGraph {
    private nodes;
    private adjacencyList;
    private pathCache;
    /**
     * Add a relationship to the graph
     */
    addRelationship(relationship: EntityRelationship): void;
    /**
     * Find shortest path between two entities
     */
    findPath(source: string, target: string): EntityPath | null;
    /**
     * Find all paths between two entities
     */
    findAllPaths(source: string, target: string, maxLength?: number): EntityPath[];
    /**
     * Analyze dependencies for an entity
     */
    analyzeDependencies(entityType: string): DependencyInfo;
    /**
     * Detect cycles in the relationship graph
     */
    detectCycles(): CycleInfo;
    /**
     * Get topological ordering of entities
     */
    getTopologicalOrder(): string[] | null;
    /**
     * Get entities at a specific depth from a source
     */
    getEntitiesAtDepth(source: string, depth: number): string[];
    /**
     * Get impact analysis for entity deletion
     */
    getDeleteImpact(entityType: string): {
        directImpact: string[];
        cascadeImpact: string[];
        restrictedBy: string[];
    };
    /**
     * Ensure a node exists in the graph
     */
    private ensureNode;
    /**
     * Calculate edge weight based on relationship properties
     */
    private calculateWeight;
    /**
     * Reconstruct path from Dijkstra's algorithm
     */
    private reconstructPath;
    /**
     * DFS for finding all paths
     */
    private dfsAllPaths;
    /**
     * DFS for cycle detection
     */
    private dfsCycleDetection;
    /**
     * Calculate entity creation and deletion order
     */
    private calculateEntityOrder;
    /**
     * Export graph as DOT format for visualization
     */
    exportAsDot(): string;
    /**
     * Get graph statistics
     */
    getStatistics(): {
        nodeCount: number;
        edgeCount: number;
        averageDegree: number;
        maxInDegree: {
            entity: string;
            count: number;
        };
        maxOutDegree: {
            entity: string;
            count: number;
        };
        hasCycles: boolean;
    };
    /**
     * Clear the graph
     */
    clear(): void;
}
//# sourceMappingURL=RelationshipGraph.d.ts.map