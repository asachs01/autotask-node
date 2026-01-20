/**
 * Referential Integrity Management System
 *
 * Ensures data consistency across related entities by validating
 * references, cascading operations, and maintaining constraints.
 */
import { ErrorLogger } from '../errors/ErrorLogger';
import { ValidationResult } from '../business-rules/ValidationResult';
import { CircuitBreaker } from '../errors/CircuitBreaker';
/**
 * Relationship type between entities
 */
export declare enum RelationshipType {
    ONE_TO_ONE = "one-to-one",
    ONE_TO_MANY = "one-to-many",
    MANY_TO_ONE = "many-to-one",
    MANY_TO_MANY = "many-to-many"
}
/**
 * Action to take when referenced entity is deleted
 */
export declare enum ReferentialAction {
    CASCADE = "cascade",// Delete related entities
    SET_NULL = "set-null",// Set reference to null
    RESTRICT = "restrict",// Prevent deletion
    NO_ACTION = "no-action"
}
/**
 * Entity relationship definition
 */
export interface EntityRelationship {
    /** Source entity type */
    sourceEntity: string;
    /** Target entity type */
    targetEntity: string;
    /** Source field containing the reference */
    sourceField: string;
    /** Target field being referenced (usually ID) */
    targetField: string;
    /** Type of relationship */
    type: RelationshipType;
    /** Action on delete */
    onDelete: ReferentialAction;
    /** Action on update */
    onUpdate: ReferentialAction;
    /** Whether the relationship is required */
    required: boolean;
    /** Custom validation function */
    validator?: (source: any, target: any) => boolean | Promise<boolean>;
    /** Description of the relationship */
    description?: string;
    /** Whether to enforce the constraint */
    enforced?: boolean;
    /** Whether to index for performance */
    indexed?: boolean;
}
/**
 * Integrity constraint definition
 */
export interface IntegrityConstraint {
    /** Unique name for the constraint */
    name: string;
    /** Entity type the constraint applies to */
    entityType: string;
    /** Type of constraint */
    type: 'unique' | 'check' | 'foreign-key' | 'not-null';
    /** Fields involved in the constraint */
    fields: string[];
    /** Validation function for check constraints */
    check?: (entity: any) => boolean | Promise<boolean>;
    /** Error message when constraint is violated */
    errorMessage?: string;
    /** Whether the constraint is enabled */
    enabled?: boolean;
}
/**
 * Validation context for integrity checks
 */
export interface IntegrityContext {
    /** Operation being performed */
    operation: 'create' | 'update' | 'delete';
    /** Original entity (for updates) */
    originalEntity?: any;
    /** User performing the operation */
    userId?: string;
    /** Whether to perform deep validation */
    deepValidation?: boolean;
    /** Function to load related entities */
    loadEntity?: (type: string, id: string) => Promise<any>;
    /** Function to check entity existence */
    entityExists?: (type: string, id: string) => Promise<boolean>;
    /** Function to count related entities */
    countRelated?: (relationship: EntityRelationship, id: string) => Promise<number>;
}
/**
 * Integrity violation details
 */
export interface IntegrityViolation {
    /** Type of violation */
    type: 'missing-reference' | 'orphaned-entity' | 'constraint-violation' | 'cascade-failure';
    /** Entities involved */
    entities: Array<{
        type: string;
        id: string;
        field?: string;
    }>;
    /** Relationship that was violated */
    relationship?: EntityRelationship;
    /** Constraint that was violated */
    constraint?: IntegrityConstraint;
    /** Error message */
    message: string;
    /** Severity of the violation */
    severity: 'error' | 'warning';
    /** Suggested fix action */
    suggestedFix?: string;
}
/**
 * Options for referential integrity manager
 */
export interface IntegrityManagerOptions {
    /** Whether to enable cascade operations */
    enableCascade?: boolean;
    /** Whether to perform deep validation */
    deepValidation?: boolean;
    /** Maximum depth for cascade operations */
    maxCascadeDepth?: number;
    /** Whether to validate on read operations */
    validateOnRead?: boolean;
    /** Whether to auto-fix violations when possible */
    autoFix?: boolean;
    /** Error logger instance */
    errorLogger?: ErrorLogger;
    /** Circuit breaker for external lookups */
    circuitBreaker?: CircuitBreaker;
    /** Cache TTL for validation results */
    cacheTTL?: number;
    /** Maximum number of parallel validations */
    maxParallelValidations?: number;
}
/**
 * Referential Integrity Manager
 */
export declare class ReferentialIntegrityManager {
    private relationships;
    private constraints;
    private validationCache;
    private readonly options;
    private errorLogger?;
    private circuitBreaker?;
    constructor(options?: IntegrityManagerOptions);
    /**
     * Register a relationship between entities
     */
    registerRelationship(relationship: EntityRelationship): void;
    /**
     * Register an integrity constraint
     */
    registerConstraint(constraint: IntegrityConstraint): void;
    /**
     * Validate referential integrity for an entity
     */
    validateIntegrity(entityType: string, entity: any, context: IntegrityContext): Promise<ValidationResult>;
    /**
     * Check for orphaned entities
     */
    findOrphans(entityType: string, entities: any[], context: IntegrityContext): Promise<IntegrityViolation[]>;
    /**
     * Handle cascade operations
     */
    handleCascade(entityType: string, entityId: string, operation: 'delete' | 'update', context: IntegrityContext, depth?: number): Promise<Array<{
        entity: string;
        id: string;
        action: string;
    }>>;
    /**
     * Validate relationships for an entity
     */
    private validateRelationships;
    /**
     * Validate constraints for an entity
     */
    private validateConstraints;
    /**
     * Get outgoing relationships for an entity type
     */
    private getOutgoingRelationships;
    /**
     * Get incoming relationships for an entity type
     */
    private getIncomingRelationships;
    /**
     * Load related entities
     */
    private loadRelatedEntities;
    /**
     * Get field value from entity
     */
    private getFieldValue;
    /**
     * Get cache key for validation
     */
    private getCacheKey;
    /**
     * Check if cache entry is valid
     */
    private isCacheValid;
    /**
     * Clean old cache entries
     */
    private cleanCache;
    /**
     * Initialize default Autotask relationships
     */
    private initializeDefaultRelationships;
    /**
     * Get all registered relationships
     */
    getRelationships(): Map<string, EntityRelationship[]>;
    /**
     * Get all registered constraints
     */
    getConstraints(): Map<string, IntegrityConstraint[]>;
    /**
     * Clear all relationships and constraints
     */
    clear(): void;
}
/**
 * Default referential integrity manager instance
 */
export declare const defaultIntegrityManager: ReferentialIntegrityManager;
//# sourceMappingURL=ReferentialIntegrityManager.d.ts.map