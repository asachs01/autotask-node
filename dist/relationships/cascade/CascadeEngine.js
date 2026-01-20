"use strict";
/**
 * Cascade operations engine for Autotask entity relationships
 * Handles create, update, and delete operations with intelligent dependency resolution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CascadeEngine = void 0;
const RelationshipMapper_1 = require("../core/RelationshipMapper");
class CascadeEngine {
    constructor(client) {
        this.activeTransactions = new Map();
        this.client = client;
        this.relationshipMapper = new RelationshipMapper_1.RelationshipMapper();
    }
    /**
     * Execute cascade create operation
     */
    async cascadeCreate(entityName, entityData, relatedData = new Map(), options = {}) {
        const startTime = Date.now();
        const transactionId = this.generateTransactionId();
        const context = {
            operation: 'CREATE',
            sourceEntity: entityName,
            sourceId: 'pending',
            depth: 0,
            maxDepth: options.maxDepth || 10,
            visited: new Set(),
            affectedEntities: new Map(),
            errors: [],
            dryRun: options.dryRun || false,
            transactionId,
            batchSize: options.batchSize || 50
        };
        this.activeTransactions.set(transactionId, context);
        try {
            // Step 1: Validate the cascade operation
            await this.validateCascadeCreate(entityName, entityData, relatedData, context);
            if (context.errors.length > 0 && !options.continueOnError) {
                return this.buildErrorResult(context, startTime);
            }
            // Step 2: Create the primary entity
            let primaryEntity = null;
            if (!context.dryRun) {
                primaryEntity = await this.createEntity(entityName, entityData);
                context.sourceId = primaryEntity.id;
            }
            // Step 3: Cascade create related entities
            await this.executeCreateCascade(entityName, primaryEntity?.id || 'dry-run', relatedData, context);
            return this.buildSuccessResult(context, startTime);
        }
        catch (error) {
            context.errors.push({
                code: 'CASCADE_CREATE_FAILED',
                message: `Cascade create failed: ${error instanceof Error ? error.message : String(error)}`,
                entityName: entityName,
                severity: 'CRITICAL',
                details: { error: error instanceof Error ? error.stack : String(error) }
            });
            return this.buildErrorResult(context, startTime);
        }
        finally {
            this.activeTransactions.delete(transactionId);
        }
    }
    /**
     * Execute cascade update operation
     */
    async cascadeUpdate(entityName, entityId, updateData, options = {}) {
        const startTime = Date.now();
        const transactionId = this.generateTransactionId();
        const context = {
            operation: 'UPDATE',
            sourceEntity: entityName,
            sourceId: entityId.toString(),
            depth: 0,
            maxDepth: options.maxDepth || 5,
            visited: new Set(),
            affectedEntities: new Map(),
            errors: [],
            dryRun: options.dryRun || false,
            transactionId,
            batchSize: options.batchSize || 50
        };
        this.activeTransactions.set(transactionId, context);
        try {
            // Step 1: Validate the cascade operation
            await this.validateCascadeUpdate(entityName, entityId, updateData, context);
            if (context.errors.length > 0 && !options.continueOnError) {
                return this.buildErrorResult(context, startTime);
            }
            // Step 2: Update the primary entity
            if (!context.dryRun) {
                await this.updateEntity(entityName, entityId, updateData);
            }
            // Step 3: Cascade update to related entities if needed
            if (options.followDependents) {
                await this.executeUpdateCascade(entityName, entityId, updateData, context);
            }
            return this.buildSuccessResult(context, startTime);
        }
        catch (error) {
            context.errors.push({
                code: 'CASCADE_UPDATE_FAILED',
                message: `Cascade update failed: ${error instanceof Error ? error.message : String(error)}`,
                entityName: entityName,
                recordId: entityId,
                severity: 'CRITICAL',
                details: { error: error instanceof Error ? error.stack : String(error) }
            });
            return this.buildErrorResult(context, startTime);
        }
        finally {
            this.activeTransactions.delete(transactionId);
        }
    }
    /**
     * Execute cascade delete operation with safety checks
     */
    async cascadeDelete(entityName, entityId, options = {}) {
        const startTime = Date.now();
        const transactionId = this.generateTransactionId();
        const context = {
            operation: 'DELETE',
            sourceEntity: entityName,
            sourceId: entityId.toString(),
            depth: 0,
            maxDepth: options.maxDepth || 10,
            visited: new Set(),
            affectedEntities: new Map(),
            errors: [],
            dryRun: options.dryRun || false,
            transactionId,
            batchSize: options.batchSize || 25 // Smaller batches for deletes
        };
        this.activeTransactions.set(transactionId, context);
        try {
            // Step 1: Safety checks (unless forced)
            if (!options.force && (options.safetyChecks !== false)) {
                await this.performDeleteSafetyChecks(entityName, entityId, context);
            }
            // Step 2: Validate the cascade operation
            await this.validateCascadeDelete(entityName, entityId, context);
            if (context.errors.length > 0 && !options.force) {
                return this.buildErrorResult(context, startTime);
            }
            // Step 3: Build delete execution plan
            const deletePlan = await this.buildDeleteExecutionPlan(entityName, entityId, context);
            // Step 4: Execute cascade delete in proper order
            await this.executeDeleteCascade(deletePlan, context);
            return this.buildSuccessResult(context, startTime);
        }
        catch (error) {
            context.errors.push({
                code: 'CASCADE_DELETE_FAILED',
                message: `Cascade delete failed: ${error instanceof Error ? error.message : String(error)}`,
                entityName: entityName,
                recordId: entityId,
                severity: 'CRITICAL',
                details: { error: error instanceof Error ? error.stack : String(error) }
            });
            return this.buildErrorResult(context, startTime);
        }
        finally {
            this.activeTransactions.delete(transactionId);
        }
    }
    /**
     * Validate cascade create operation
     */
    async validateCascadeCreate(entityName, entityData, relatedData, context) {
        // Check if entity supports create operations
        const relationships = this.relationshipMapper.getOutgoingRelationships(entityName);
        for (const [relatedEntityName, records] of relatedData) {
            const relationship = relationships.find(rel => rel.targetEntity === relatedEntityName);
            if (!relationship) {
                context.errors.push({
                    code: 'INVALID_RELATIONSHIP',
                    message: `No relationship found between ${entityName} and ${relatedEntityName}`,
                    entityName: relatedEntityName,
                    severity: 'HIGH'
                });
                continue;
            }
            // Validate cascade action
            if (relationship.cascadeOptions.onCreate !== 'CASCADE') {
                context.errors.push({
                    code: 'CASCADE_NOT_ALLOWED',
                    message: `Cascade create not allowed for relationship ${relationship.id}`,
                    entityName: relatedEntityName,
                    relationshipId: relationship.id,
                    severity: 'MEDIUM'
                });
            }
            // Validate required fields
            if (relationship.required && (!records || records.length === 0)) {
                context.errors.push({
                    code: 'REQUIRED_RELATIONSHIP_MISSING',
                    message: `Required relationship ${relationship.relationshipName} is missing`,
                    entityName: relatedEntityName,
                    relationshipId: relationship.id,
                    severity: 'HIGH'
                });
            }
        }
    }
    /**
     * Validate cascade update operation
     */
    async validateCascadeUpdate(entityName, entityId, updateData, context) {
        // Check if entity exists
        try {
            const entity = await this.getEntity(entityName, entityId);
            if (!entity) {
                context.errors.push({
                    code: 'ENTITY_NOT_FOUND',
                    message: `Entity ${entityName} with ID ${entityId} not found`,
                    entityName: entityName,
                    recordId: entityId,
                    severity: 'CRITICAL'
                });
            }
        }
        catch (error) {
            context.errors.push({
                code: 'VALIDATION_ERROR',
                message: `Failed to validate entity existence: ${error instanceof Error ? error.message : String(error)}`,
                entityName: entityName,
                recordId: entityId,
                severity: 'HIGH'
            });
        }
    }
    /**
     * Validate cascade delete operation
     */
    async validateCascadeDelete(entityName, entityId, context) {
        // Check if entity exists
        try {
            const entity = await this.getEntity(entityName, entityId);
            if (!entity) {
                context.errors.push({
                    code: 'ENTITY_NOT_FOUND',
                    message: `Entity ${entityName} with ID ${entityId} not found`,
                    entityName: entityName,
                    recordId: entityId,
                    severity: 'CRITICAL'
                });
                return;
            }
        }
        catch (error) {
            context.errors.push({
                code: 'VALIDATION_ERROR',
                message: `Failed to validate entity existence: ${error instanceof Error ? error.message : String(error)}`,
                entityName: entityName,
                recordId: entityId,
                severity: 'HIGH'
            });
            return;
        }
        // Check for RESTRICT relationships that would prevent deletion
        const incomingRelationships = this.relationshipMapper.getIncomingRelationships(entityName);
        for (const relationship of incomingRelationships) {
            if (relationship.cascadeOptions.onDelete === 'RESTRICT') {
                const hasReferences = await this.checkForReferences(relationship.sourceEntity, relationship.sourceFields, entityId);
                if (hasReferences) {
                    context.errors.push({
                        code: 'RESTRICT_VIOLATION',
                        message: `Cannot delete ${entityName} ${entityId}: restricted by ${relationship.sourceEntity}`,
                        entityName: entityName,
                        recordId: entityId,
                        relationshipId: relationship.id,
                        severity: 'CRITICAL'
                    });
                }
            }
        }
    }
    /**
     * Perform safety checks before cascade delete
     */
    async performDeleteSafetyChecks(entityName, entityId, context) {
        // Check for high-value entities
        const highRiskEntities = this.relationshipMapper.getCascadeDeleteRiskEntities();
        if (highRiskEntities.includes(entityName)) {
            // Count total affected records
            const deletePlan = await this.buildDeleteExecutionPlan(entityName, entityId, context, true);
            const totalAffected = Array.from(deletePlan.values()).reduce((sum, records) => sum + records.length, 0);
            if (totalAffected > 100) {
                context.errors.push({
                    code: 'HIGH_IMPACT_DELETE',
                    message: `Delete operation would affect ${totalAffected} records. Use force option to proceed.`,
                    entityName: entityName,
                    recordId: entityId,
                    severity: 'CRITICAL',
                    details: { totalAffected }
                });
            }
        }
    }
    /**
     * Build execution plan for cascade delete
     */
    async buildDeleteExecutionPlan(entityName, entityId, context, countOnly = false) {
        const plan = new Map();
        const visited = new Set();
        const buildPlan = async (currentEntity, currentId, depth) => {
            if (depth > context.maxDepth || visited.has(`${currentEntity}:${currentId}`)) {
                return;
            }
            visited.add(`${currentEntity}:${currentId}`);
            const relationships = this.relationshipMapper.getOutgoingRelationships(currentEntity);
            for (const relationship of relationships) {
                const cascadeAction = relationship.cascadeOptions.onDelete;
                if (cascadeAction === 'CASCADE') {
                    const relatedIds = await this.findRelatedRecords(relationship.targetEntity, relationship.targetFields, currentId);
                    if (relatedIds.length > 0) {
                        const existing = plan.get(relationship.targetEntity) || [];
                        plan.set(relationship.targetEntity, [...existing, ...relatedIds]);
                        if (!countOnly) {
                            // Recursively build plan for cascade deletes
                            for (const relatedId of relatedIds) {
                                await buildPlan(relationship.targetEntity, relatedId, depth + 1);
                            }
                        }
                    }
                }
            }
        };
        await buildPlan(entityName, entityId, 0);
        // Add the source entity to the plan (to be deleted last)
        const existing = plan.get(entityName) || [];
        if (!existing.includes(entityId)) {
            plan.set(entityName, [...existing, entityId]);
        }
        return plan;
    }
    /**
     * Execute create cascade operations
     */
    async executeCreateCascade(entityName, entityId, relatedData, context) {
        context.depth++;
        for (const [relatedEntityName, records] of relatedData) {
            if (context.depth > context.maxDepth) {
                context.errors.push({
                    code: 'MAX_DEPTH_EXCEEDED',
                    message: `Maximum cascade depth ${context.maxDepth} exceeded`,
                    entityName: relatedEntityName,
                    severity: 'MEDIUM'
                });
                continue;
            }
            const relationship = this.relationshipMapper.getOutgoingRelationships(entityName)
                .find(rel => rel.targetEntity === relatedEntityName);
            if (!relationship || relationship.cascadeOptions.onCreate !== 'CASCADE') {
                continue;
            }
            try {
                const createdRecords = [];
                for (const recordData of records) {
                    // Set foreign key reference
                    recordData[relationship.targetFields[0]] = entityId;
                    if (!context.dryRun) {
                        const createdRecord = await this.createEntity(relatedEntityName, recordData);
                        createdRecords.push(createdRecord.id);
                    }
                    else {
                        createdRecords.push(`dry-run-${Date.now()}`);
                    }
                }
                const entityResult = {
                    entityName: relatedEntityName,
                    operation: 'CREATE',
                    recordIds: createdRecords,
                    success: true,
                    errors: [],
                    executionOrder: context.depth
                };
                context.affectedEntities.set(relatedEntityName, new Set(createdRecords.map(id => id.toString())));
            }
            catch (error) {
                context.errors.push({
                    code: 'CREATE_FAILED',
                    message: `Failed to create ${relatedEntityName}: ${error instanceof Error ? error.message : String(error)}`,
                    entityName: relatedEntityName,
                    severity: 'HIGH',
                    details: { error: error instanceof Error ? error.stack : String(error) }
                });
            }
        }
    }
    /**
     * Execute update cascade operations
     */
    async executeUpdateCascade(entityName, entityId, updateData, context) {
        const relationships = this.relationshipMapper.getOutgoingRelationships(entityName);
        for (const relationship of relationships) {
            if (relationship.cascadeOptions.onUpdate === 'CASCADE') {
                try {
                    const relatedIds = await this.findRelatedRecords(relationship.targetEntity, relationship.targetFields, entityId);
                    for (const relatedId of relatedIds) {
                        if (!context.dryRun) {
                            await this.updateEntity(relationship.targetEntity, relatedId, updateData);
                        }
                    }
                    context.affectedEntities.set(relationship.targetEntity, new Set(relatedIds.map(id => id.toString())));
                }
                catch (error) {
                    context.errors.push({
                        code: 'UPDATE_FAILED',
                        message: `Failed to cascade update to ${relationship.targetEntity}: ${error instanceof Error ? error.message : String(error)}`,
                        entityName: relationship.targetEntity,
                        severity: 'HIGH'
                    });
                }
            }
        }
    }
    /**
     * Execute delete cascade operations
     */
    async executeDeleteCascade(deletePlan, context) {
        // Sort entities by dependency order (dependents first)
        const sortedEntities = this.sortEntitiesForDeletion(Array.from(deletePlan.keys()));
        for (const entityName of sortedEntities) {
            const recordIds = deletePlan.get(entityName);
            try {
                if (!context.dryRun) {
                    await this.batchDeleteRecords(entityName, recordIds, context.batchSize);
                }
                context.affectedEntities.set(entityName, new Set(recordIds.map(id => id.toString())));
            }
            catch (error) {
                context.errors.push({
                    code: 'DELETE_FAILED',
                    message: `Failed to delete ${entityName} records: ${error instanceof Error ? error.message : String(error)}`,
                    entityName: entityName,
                    severity: 'HIGH',
                    details: { recordIds }
                });
            }
        }
    }
    /**
     * Sort entities for deletion (dependencies first)
     */
    sortEntitiesForDeletion(entities) {
        const graph = this.relationshipMapper.getEntityGraph();
        return entities.sort((a, b) => {
            const nodeA = graph.nodes.get(a);
            const nodeB = graph.nodes.get(b);
            const levelA = nodeA?.hierarchyLevel || 0;
            const levelB = nodeB?.hierarchyLevel || 0;
            // Higher level entities (more dependencies) should be deleted first
            return levelB - levelA;
        });
    }
    /**
     * Helper methods for entity operations
     */
    async createEntity(entityName, data) {
        // This would integrate with the actual Autotask client
        // For now, we'll simulate the operation
        return { id: `${entityName}_${Date.now()}`, ...data };
    }
    async updateEntity(entityName, id, data) {
        // This would integrate with the actual Autotask client
        return { id, ...data };
    }
    async getEntity(entityName, id) {
        // This would integrate with the actual Autotask client
        return { id, entityName };
    }
    async findRelatedRecords(entityName, fields, value) {
        // This would query the Autotask API for related records
        return [];
    }
    async checkForReferences(entityName, fields, value) {
        const records = await this.findRelatedRecords(entityName, fields, value);
        return records.length > 0;
    }
    async batchDeleteRecords(entityName, recordIds, batchSize) {
        for (let i = 0; i < recordIds.length; i += batchSize) {
            const batch = recordIds.slice(i, i + batchSize);
            // Delete batch - would integrate with actual Autotask client
        }
    }
    /**
     * Result builders
     */
    buildSuccessResult(context, startTime) {
        return {
            success: true,
            affectedEntities: this.buildEntityResults(context),
            errors: context.errors,
            warnings: [],
            executionTime: Date.now() - startTime,
            operationsCount: Array.from(context.affectedEntities.values()).reduce((sum, set) => sum + set.size, 0),
            transactionId: context.transactionId
        };
    }
    buildErrorResult(context, startTime) {
        return {
            success: false,
            affectedEntities: this.buildEntityResults(context),
            errors: context.errors,
            warnings: [],
            executionTime: Date.now() - startTime,
            operationsCount: 0,
            transactionId: context.transactionId
        };
    }
    buildEntityResults(context) {
        const results = new Map();
        context.affectedEntities.forEach((recordIds, entityName) => {
            results.set(entityName, {
                entityName,
                operation: context.operation,
                recordIds: Array.from(recordIds),
                success: true,
                errors: [],
                executionOrder: 1
            });
        });
        return results;
    }
    generateTransactionId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.CascadeEngine = CascadeEngine;
//# sourceMappingURL=CascadeEngine.js.map