/**
 * Comprehensive Autotask entity relationship definitions
 * Based on the Autotask REST API entity structure
 */
import { EntityRelationship } from '../types/RelationshipTypes';
export declare class AutotaskRelationshipDefinitions {
    private static relationships;
    /**
     * Get all relationship definitions
     */
    static getAllRelationships(): EntityRelationship[];
    /**
     * Get relationships for a specific entity
     */
    static getRelationshipsForEntity(entityName: string): EntityRelationship[];
    /**
     * Get outgoing relationships for an entity
     */
    static getOutgoingRelationships(entityName: string): EntityRelationship[];
    /**
     * Get incoming relationships for an entity
     */
    static getIncomingRelationships(entityName: string): EntityRelationship[];
    /**
     * Get relationship by ID
     */
    static getRelationshipById(relationshipId: string): EntityRelationship | undefined;
    /**
     * Get direct relationship between two entities
     */
    static getDirectRelationship(sourceEntity: string, targetEntity: string): EntityRelationship | undefined;
    /**
     * Get core entities (frequently used in relationships)
     */
    static getCoreEntities(): string[];
    /**
     * Get entities with high cascade risk (many dependents)
     */
    static getHighCascadeRiskEntities(): string[];
}
//# sourceMappingURL=AutotaskRelationshipDefinitions.d.ts.map