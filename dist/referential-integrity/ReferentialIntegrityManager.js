"use strict";
/**
 * Referential Integrity Management System
 *
 * Ensures data consistency across related entities by validating
 * references, cascading operations, and maintaining constraints.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultIntegrityManager = exports.ReferentialIntegrityManager = exports.ReferentialAction = exports.RelationshipType = void 0;
const ValidationResult_1 = require("../business-rules/ValidationResult");
const AutotaskErrors_1 = require("../errors/AutotaskErrors");
/**
 * Relationship type between entities
 */
var RelationshipType;
(function (RelationshipType) {
    RelationshipType["ONE_TO_ONE"] = "one-to-one";
    RelationshipType["ONE_TO_MANY"] = "one-to-many";
    RelationshipType["MANY_TO_ONE"] = "many-to-one";
    RelationshipType["MANY_TO_MANY"] = "many-to-many";
})(RelationshipType || (exports.RelationshipType = RelationshipType = {}));
/**
 * Action to take when referenced entity is deleted
 */
var ReferentialAction;
(function (ReferentialAction) {
    ReferentialAction["CASCADE"] = "cascade";
    ReferentialAction["SET_NULL"] = "set-null";
    ReferentialAction["RESTRICT"] = "restrict";
    ReferentialAction["NO_ACTION"] = "no-action"; // Do nothing
})(ReferentialAction || (exports.ReferentialAction = ReferentialAction = {}));
/**
 * Referential Integrity Manager
 */
class ReferentialIntegrityManager {
    constructor(options = {}) {
        this.relationships = new Map();
        this.constraints = new Map();
        this.validationCache = new Map();
        this.options = {
            enableCascade: options.enableCascade ?? true,
            deepValidation: options.deepValidation ?? false,
            maxCascadeDepth: options.maxCascadeDepth ?? 5,
            validateOnRead: options.validateOnRead ?? false,
            autoFix: options.autoFix ?? false,
            errorLogger: options.errorLogger,
            circuitBreaker: options.circuitBreaker,
            cacheTTL: options.cacheTTL ?? 5 * 60 * 1000, // 5 minutes
            maxParallelValidations: options.maxParallelValidations ?? 10
        };
        this.errorLogger = options.errorLogger;
        this.circuitBreaker = options.circuitBreaker;
        this.initializeDefaultRelationships();
    }
    /**
     * Register a relationship between entities
     */
    registerRelationship(relationship) {
        const key = `${relationship.sourceEntity}->${relationship.targetEntity}`;
        if (!this.relationships.has(key)) {
            this.relationships.set(key, []);
        }
        this.relationships.get(key).push(relationship);
        this.errorLogger?.debug('Registered relationship', {
            metadata: {
                sourceEntity: relationship.sourceEntity,
                targetEntity: relationship.targetEntity,
                type: relationship.type
            }
        });
    }
    /**
     * Register an integrity constraint
     */
    registerConstraint(constraint) {
        if (!this.constraints.has(constraint.entityType)) {
            this.constraints.set(constraint.entityType, []);
        }
        this.constraints.get(constraint.entityType).push(constraint);
        this.errorLogger?.debug('Registered constraint', {
            entityType: constraint.entityType,
            metadata: {
                name: constraint.name,
                type: constraint.type
            }
        });
    }
    /**
     * Validate referential integrity for an entity
     */
    async validateIntegrity(entityType, entity, context) {
        const cacheKey = this.getCacheKey(entityType, entity, context);
        // Check cache
        if (this.isCacheValid(cacheKey)) {
            const cached = this.validationCache.get(cacheKey);
            this.errorLogger?.debug('Integrity validation cache hit', {
                entityType,
                metadata: { cacheKey }
            });
            return cached.result;
        }
        const result = new ValidationResult_1.ValidationResult();
        // Validate relationships
        await this.validateRelationships(entityType, entity, context, result);
        // Validate constraints
        await this.validateConstraints(entityType, entity, context, result);
        // Cache result
        this.validationCache.set(cacheKey, {
            result,
            timestamp: Date.now()
        });
        // Clean old cache entries
        this.cleanCache();
        return result;
    }
    /**
     * Check for orphaned entities
     */
    async findOrphans(entityType, entities, context) {
        const violations = [];
        for (const entity of entities) {
            const relationships = this.getIncomingRelationships(entityType);
            for (const rel of relationships) {
                if (rel.required && context.countRelated) {
                    const count = await context.countRelated(rel, entity.id);
                    if (count === 0) {
                        violations.push({
                            type: 'orphaned-entity',
                            entities: [{
                                    type: entityType,
                                    id: entity.id
                                }],
                            relationship: rel,
                            message: `Entity ${entityType}:${entity.id} has no required references from ${rel.sourceEntity}`,
                            severity: 'warning',
                            suggestedFix: `Consider deleting orphaned ${entityType} or creating required ${rel.sourceEntity} reference`
                        });
                    }
                }
            }
        }
        return violations;
    }
    /**
     * Handle cascade operations
     */
    async handleCascade(entityType, entityId, operation, context, depth = 0) {
        if (depth >= this.options.maxCascadeDepth) {
            throw new AutotaskErrors_1.AutotaskError(`Maximum cascade depth (${this.options.maxCascadeDepth}) exceeded`, 'CASCADE_DEPTH_EXCEEDED');
        }
        const cascadeActions = [];
        const relationships = this.getOutgoingRelationships(entityType);
        for (const rel of relationships) {
            const action = operation === 'delete' ? rel.onDelete : rel.onUpdate;
            if (action === ReferentialAction.CASCADE && context.loadEntity) {
                // Load related entities
                const relatedEntities = await this.loadRelatedEntities(rel, entityId, context);
                for (const related of relatedEntities) {
                    cascadeActions.push({
                        entity: rel.targetEntity,
                        id: related.id,
                        action: operation
                    });
                    // Recursive cascade
                    const nestedActions = await this.handleCascade(rel.targetEntity, related.id, operation, context, depth + 1);
                    cascadeActions.push(...nestedActions);
                }
            }
            else if (action === ReferentialAction.SET_NULL) {
                // Mark for null setting
                cascadeActions.push({
                    entity: rel.targetEntity,
                    id: entityId,
                    action: 'set-null'
                });
            }
            else if (action === ReferentialAction.RESTRICT) {
                // Check for related entities
                if (context.countRelated) {
                    const count = await context.countRelated(rel, entityId);
                    if (count > 0) {
                        throw new AutotaskErrors_1.AutotaskError(`Cannot ${operation} ${entityType}:${entityId} - has ${count} related ${rel.targetEntity} entities`, 'REFERENTIAL_CONSTRAINT_VIOLATION');
                    }
                }
            }
        }
        return cascadeActions;
    }
    /**
     * Validate relationships for an entity
     */
    async validateRelationships(entityType, entity, context, result) {
        const relationships = this.getOutgoingRelationships(entityType);
        for (const rel of relationships) {
            if (!rel.enforced)
                continue;
            const refValue = this.getFieldValue(entity, rel.sourceField);
            if (rel.required && !refValue) {
                result.addError('MISSING_REFERENCE', `Required reference to ${rel.targetEntity} is missing`, [rel.sourceField], { relationship: rel });
                continue;
            }
            if (refValue && context.entityExists) {
                const exists = await context.entityExists(rel.targetEntity, refValue);
                if (!exists) {
                    result.addError('INVALID_REFERENCE', `Referenced ${rel.targetEntity}:${refValue} does not exist`, [rel.sourceField], { relationship: rel });
                }
                else if (rel.validator && context.loadEntity) {
                    // Custom validation
                    const targetEntity = await context.loadEntity(rel.targetEntity, refValue);
                    const isValid = await rel.validator(entity, targetEntity);
                    if (!isValid) {
                        result.addError('RELATIONSHIP_VALIDATION_FAILED', `Relationship validation failed between ${entityType} and ${rel.targetEntity}`, [rel.sourceField], { relationship: rel });
                    }
                }
            }
        }
    }
    /**
     * Validate constraints for an entity
     */
    async validateConstraints(entityType, entity, context, result) {
        const constraints = this.constraints.get(entityType) || [];
        for (const constraint of constraints) {
            if (!constraint.enabled)
                continue;
            switch (constraint.type) {
                case 'not-null':
                    for (const field of constraint.fields) {
                        const value = this.getFieldValue(entity, field);
                        if (value === null || value === undefined) {
                            result.addError('NOT_NULL_VIOLATION', constraint.errorMessage || `Field ${field} cannot be null`, [field], { constraint });
                        }
                    }
                    break;
                case 'unique':
                    // This would require checking against other entities
                    // Implementation depends on data access layer
                    break;
                case 'check':
                    if (constraint.check) {
                        const isValid = await constraint.check(entity);
                        if (!isValid) {
                            result.addError('CHECK_CONSTRAINT_VIOLATION', constraint.errorMessage || `Check constraint ${constraint.name} failed`, constraint.fields, { constraint });
                        }
                    }
                    break;
                case 'foreign-key':
                    // Handled by relationship validation
                    break;
            }
        }
    }
    /**
     * Get outgoing relationships for an entity type
     */
    getOutgoingRelationships(entityType) {
        const relationships = [];
        for (const [key, rels] of this.relationships.entries()) {
            if (key.startsWith(`${entityType}->`)) {
                relationships.push(...rels);
            }
        }
        return relationships;
    }
    /**
     * Get incoming relationships for an entity type
     */
    getIncomingRelationships(entityType) {
        const relationships = [];
        for (const [key, rels] of this.relationships.entries()) {
            if (key.endsWith(`->${entityType}`)) {
                relationships.push(...rels);
            }
        }
        return relationships;
    }
    /**
     * Load related entities
     */
    async loadRelatedEntities(relationship, entityId, context) {
        // This is a placeholder - actual implementation would query the data layer
        // For now, return empty array
        return [];
    }
    /**
     * Get field value from entity
     */
    getFieldValue(entity, fieldPath) {
        const parts = fieldPath.split('.');
        let value = entity;
        for (const part of parts) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[part];
        }
        return value;
    }
    /**
     * Get cache key for validation
     */
    getCacheKey(entityType, entity, context) {
        const entityHash = JSON.stringify(entity);
        const contextHash = `${context.operation}-${context.deepValidation}`;
        return `${entityType}:${entityHash}:${contextHash}`;
    }
    /**
     * Check if cache entry is valid
     */
    isCacheValid(key) {
        const entry = this.validationCache.get(key);
        if (!entry)
            return false;
        return Date.now() - entry.timestamp < this.options.cacheTTL;
    }
    /**
     * Clean old cache entries
     */
    cleanCache() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.validationCache.entries()) {
            if (now - entry.timestamp > this.options.cacheTTL) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.validationCache.delete(key);
        }
    }
    /**
     * Initialize default Autotask relationships
     */
    initializeDefaultRelationships() {
        // Ticket relationships
        this.registerRelationship({
            sourceEntity: 'Ticket',
            targetEntity: 'Company',
            sourceField: 'companyID',
            targetField: 'id',
            type: RelationshipType.MANY_TO_ONE,
            onDelete: ReferentialAction.RESTRICT,
            onUpdate: ReferentialAction.CASCADE,
            required: true,
            description: 'Ticket belongs to Company'
        });
        this.registerRelationship({
            sourceEntity: 'Ticket',
            targetEntity: 'Contact',
            sourceField: 'contactID',
            targetField: 'id',
            type: RelationshipType.MANY_TO_ONE,
            onDelete: ReferentialAction.SET_NULL,
            onUpdate: ReferentialAction.CASCADE,
            required: false,
            description: 'Ticket may have a Contact'
        });
        // Task relationships
        this.registerRelationship({
            sourceEntity: 'Task',
            targetEntity: 'Project',
            sourceField: 'projectID',
            targetField: 'id',
            type: RelationshipType.MANY_TO_ONE,
            onDelete: ReferentialAction.CASCADE,
            onUpdate: ReferentialAction.CASCADE,
            required: false,
            description: 'Task may belong to Project'
        });
        this.registerRelationship({
            sourceEntity: 'Task',
            targetEntity: 'Ticket',
            sourceField: 'ticketID',
            targetField: 'id',
            type: RelationshipType.MANY_TO_ONE,
            onDelete: ReferentialAction.CASCADE,
            onUpdate: ReferentialAction.CASCADE,
            required: false,
            description: 'Task may belong to Ticket'
        });
        // Contact relationships
        this.registerRelationship({
            sourceEntity: 'Contact',
            targetEntity: 'Company',
            sourceField: 'companyID',
            targetField: 'id',
            type: RelationshipType.MANY_TO_ONE,
            onDelete: ReferentialAction.RESTRICT,
            onUpdate: ReferentialAction.CASCADE,
            required: true,
            description: 'Contact belongs to Company'
        });
        // TimeEntry relationships
        this.registerRelationship({
            sourceEntity: 'TimeEntry',
            targetEntity: 'Task',
            sourceField: 'taskID',
            targetField: 'id',
            type: RelationshipType.MANY_TO_ONE,
            onDelete: ReferentialAction.RESTRICT,
            onUpdate: ReferentialAction.CASCADE,
            required: false,
            description: 'TimeEntry may belong to Task'
        });
        this.registerRelationship({
            sourceEntity: 'TimeEntry',
            targetEntity: 'Ticket',
            sourceField: 'ticketID',
            targetField: 'id',
            type: RelationshipType.MANY_TO_ONE,
            onDelete: ReferentialAction.RESTRICT,
            onUpdate: ReferentialAction.CASCADE,
            required: false,
            description: 'TimeEntry may belong to Ticket'
        });
        // Project relationships
        this.registerRelationship({
            sourceEntity: 'Project',
            targetEntity: 'Company',
            sourceField: 'companyID',
            targetField: 'id',
            type: RelationshipType.MANY_TO_ONE,
            onDelete: ReferentialAction.RESTRICT,
            onUpdate: ReferentialAction.CASCADE,
            required: true,
            description: 'Project belongs to Company'
        });
        // Contract relationships
        this.registerRelationship({
            sourceEntity: 'Contract',
            targetEntity: 'Company',
            sourceField: 'companyID',
            targetField: 'id',
            type: RelationshipType.MANY_TO_ONE,
            onDelete: ReferentialAction.RESTRICT,
            onUpdate: ReferentialAction.CASCADE,
            required: true,
            description: 'Contract belongs to Company'
        });
        // Add constraints
        this.registerConstraint({
            name: 'ticket_priority_check',
            entityType: 'Ticket',
            type: 'check',
            fields: ['priority'],
            check: (entity) => {
                const validPriorities = [1, 2, 3, 4, 5];
                return validPriorities.includes(entity.priority);
            },
            errorMessage: 'Ticket priority must be between 1 and 5'
        });
        this.registerConstraint({
            name: 'task_hours_check',
            entityType: 'Task',
            type: 'check',
            fields: ['estimatedHours', 'actualHours'],
            check: (entity) => {
                if (entity.estimatedHours && entity.estimatedHours < 0)
                    return false;
                if (entity.actualHours && entity.actualHours < 0)
                    return false;
                return true;
            },
            errorMessage: 'Task hours cannot be negative'
        });
    }
    /**
     * Get all registered relationships
     */
    getRelationships() {
        return new Map(this.relationships);
    }
    /**
     * Get all registered constraints
     */
    getConstraints() {
        return new Map(this.constraints);
    }
    /**
     * Clear all relationships and constraints
     */
    clear() {
        this.relationships.clear();
        this.constraints.clear();
        this.validationCache.clear();
    }
}
exports.ReferentialIntegrityManager = ReferentialIntegrityManager;
/**
 * Default referential integrity manager instance
 */
exports.defaultIntegrityManager = new ReferentialIntegrityManager();
//# sourceMappingURL=ReferentialIntegrityManager.js.map