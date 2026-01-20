/**
 * Graph traversal engine for Autotask entity relationships
 * Provides advanced graph navigation, path finding, and dependency analysis
 */
import { RelationshipPath, TraversalOptions } from '../types/RelationshipTypes';
import { RelationshipMapper } from '../core/RelationshipMapper';
export interface GraphTraversalResult {
    paths: RelationshipPath[];
    visitedNodes: string[];
    executionTime: number;
    statistics: {
        totalPaths: number;
        shortestPath: RelationshipPath | null;
        longestPath: RelationshipPath | null;
        averagePathLength: number;
        circularPaths: number;
    };
}
export interface DependencyAnalysis {
    entityName: string;
    directDependencies: string[];
    transiteDependencies: string[];
    dependents: string[];
    transiteDependents: string[];
    circularDependencies: string[];
    independentFrom: string[];
    criticalPath: RelationshipPath[];
    isolationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export declare class GraphTraversalEngine {
    private relationshipMapper;
    private graph;
    constructor(relationshipMapper: RelationshipMapper);
    /**
     * Perform breadth-first search traversal
     */
    breadthFirstSearch(startEntity: string, targetEntity?: string, options?: Partial<TraversalOptions>): GraphTraversalResult;
    /**
     * Perform depth-first search traversal
     */
    depthFirstSearch(startEntity: string, targetEntity?: string, options?: Partial<TraversalOptions>): GraphTraversalResult;
    /**
     * Find shortest path using Dijkstra's algorithm
     */
    findShortestPath(startEntity: string, targetEntity: string, options?: Partial<TraversalOptions>): RelationshipPath | null;
    /**
     * Find all paths between two entities
     */
    findAllPaths(startEntity: string, targetEntity: string, options?: Partial<TraversalOptions>): RelationshipPath[];
    /**
     * Analyze entity dependencies
     */
    analyzeDependencies(entityName: string): DependencyAnalysis;
    /**
     * Find strongly connected components (circular dependency groups)
     */
    findStronglyConnectedComponents(): string[][];
    /**
     * Helper methods
     */
    private getEntityRelationships;
    private calculatePathCost;
    private calculateRelationshipCost;
    private markOptimalPaths;
    private reconstructPath;
    private calculateTraversalStatistics;
    private findTransitiveDependencies;
    private findCircularDependenciesForEntity;
    private findCriticalPath;
    private calculateIsolationRisk;
}
//# sourceMappingURL=GraphTraversalEngine.d.ts.map