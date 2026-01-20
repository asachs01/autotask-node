/**
 * Core relationship mapping system for Autotask entities
 * Provides centralized relationship discovery, validation, and graph building
 */
import { EntityRelationship, EntityNode, EntityGraph, RelationshipPath, TraversalOptions, RelationshipMetrics } from '../types/RelationshipTypes';
export declare class RelationshipMapper {
    private entityGraph;
    private relationshipCache;
    private pathCache;
    private metrics;
    constructor();
    /**
     * Build the complete entity relationship graph
     */
    private buildEntityGraph;
    /**
     * Detect circular dependencies in the relationship graph
     */
    private detectCircularDependencies;
    /**
     * Build entity hierarchies based on dependency depth
     */
    private buildHierarchies;
    /**
     * Get all relationships for a specific entity
     */
    getEntityRelationships(entityName: string): EntityRelationship[];
    /**
     * Get outgoing relationships (entity as source)
     */
    getOutgoingRelationships(entityName: string): EntityRelationship[];
    /**
     * Get incoming relationships (entity as target)
     */
    getIncomingRelationships(entityName: string): EntityRelationship[];
    /**
     * Find relationship paths between two entities
     */
    findRelationshipPaths(sourceEntity: string, targetEntity: string, options?: TraversalOptions): RelationshipPath[];
    /**
     * Calculate the cost of a relationship path
     */
    private calculatePathCost;
    /**
     * Get the entity graph
     */
    getEntityGraph(): EntityGraph;
    /**
     * Get entities at a specific hierarchy level
     */
    getEntitiesAtLevel(level: number): EntityNode[];
    /**
     * Get all circular dependencies
     */
    getCircularDependencies(): Set<string>;
    /**
     * Check if two entities are directly related
     */
    areDirectlyRelated(entity1: string, entity2: string): boolean;
    /**
     * Get entities with cascade delete risk
     */
    getCascadeDeleteRiskEntities(): string[];
    /**
     * Get relationship metrics
     */
    getMetrics(): RelationshipMetrics;
    /**
     * Calculate relationship metrics
     */
    private calculateMetrics;
    /**
     * Get all relationships in the system
     */
    getAllRelationships(): EntityRelationship[];
    /**
     * Clear caches (useful for testing or memory management)
     */
    clearCaches(): void;
    /**
     * Get relationship statistics for an entity
     */
    getEntityStatistics(entityName: string): {
        totalRelationships: number;
        incomingRelationships: number;
        outgoingRelationships: number;
        hierarchyLevel: number;
        dependents: string[];
        dependencies: string[];
    };
}
//# sourceMappingURL=RelationshipMapper.d.ts.map