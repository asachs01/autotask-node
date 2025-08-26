/**
 * Cascade operations engine for Autotask entity relationships
 * Handles create, update, and delete operations with intelligent dependency resolution
 */

import { 
  EntityRelationship,
  CascadeContext,
  CascadeResult,
  CascadeEntityResult,
  CascadeError,
  CascadeWarning,
  CascadeAction,
  BatchOperation
} from '../types/RelationshipTypes';
import { RelationshipMapper } from '../core/RelationshipMapper';
import { AutotaskClient } from '../../client/AutotaskClient';
import { BaseEntity } from '../../entities/base';

export class CascadeEngine {
  private relationshipMapper: RelationshipMapper;
  private client: AutotaskClient;
  private activeTransactions: Map<string, CascadeContext> = new Map();

  constructor(client: AutotaskClient) {
    this.client = client;
    this.relationshipMapper = new RelationshipMapper();
  }

  /**
   * Execute cascade create operation
   */
  public async cascadeCreate(
    entityName: string,
    entityData: any,
    relatedData: Map<string, any[]> = new Map(),
    options: {
      maxDepth?: number;
      dryRun?: boolean;
      batchSize?: number;
      continueOnError?: boolean;
    } = {}
  ): Promise<CascadeResult> {
    const startTime = Date.now();
    const transactionId = this.generateTransactionId();

    const context: CascadeContext = {
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
      let primaryEntity: any = null;
      if (!context.dryRun) {
        primaryEntity = await this.createEntity(entityName, entityData);
        context.sourceId = primaryEntity.id;
      }

      // Step 3: Cascade create related entities
      await this.executeCreateCascade(entityName, primaryEntity?.id || 'dry-run', relatedData, context);

      return this.buildSuccessResult(context, startTime);

    } catch (error) {
      context.errors.push({
        code: 'CASCADE_CREATE_FAILED',
        message: `Cascade create failed: ${error instanceof Error ? error.message : String(error)}`,
        entityName: entityName,
        severity: 'CRITICAL',
        details: { error: error instanceof Error ? error.stack : String(error) }
      });

      return this.buildErrorResult(context, startTime);
    } finally {
      this.activeTransactions.delete(transactionId);
    }
  }

  /**
   * Execute cascade update operation
   */
  public async cascadeUpdate(
    entityName: string,
    entityId: string | number,
    updateData: any,
    options: {
      maxDepth?: number;
      dryRun?: boolean;
      batchSize?: number;
      continueOnError?: boolean;
      followDependents?: boolean;
    } = {}
  ): Promise<CascadeResult> {
    const startTime = Date.now();
    const transactionId = this.generateTransactionId();

    const context: CascadeContext = {
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

    } catch (error) {
      context.errors.push({
        code: 'CASCADE_UPDATE_FAILED',
        message: `Cascade update failed: ${error instanceof Error ? error.message : String(error)}`,
        entityName: entityName,
        recordId: entityId,
        severity: 'CRITICAL',
        details: { error: error instanceof Error ? error.stack : String(error) }
      });

      return this.buildErrorResult(context, startTime);
    } finally {
      this.activeTransactions.delete(transactionId);
    }
  }

  /**
   * Execute cascade delete operation with safety checks
   */
  public async cascadeDelete(
    entityName: string,
    entityId: string | number,
    options: {
      maxDepth?: number;
      dryRun?: boolean;
      batchSize?: number;
      force?: boolean;
      safetyChecks?: boolean;
    } = {}
  ): Promise<CascadeResult> {
    const startTime = Date.now();
    const transactionId = this.generateTransactionId();

    const context: CascadeContext = {
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

    } catch (error) {
      context.errors.push({
        code: 'CASCADE_DELETE_FAILED',
        message: `Cascade delete failed: ${error instanceof Error ? error.message : String(error)}`,
        entityName: entityName,
        recordId: entityId,
        severity: 'CRITICAL',
        details: { error: error instanceof Error ? error.stack : String(error) }
      });

      return this.buildErrorResult(context, startTime);
    } finally {
      this.activeTransactions.delete(transactionId);
    }
  }

  /**
   * Validate cascade create operation
   */
  private async validateCascadeCreate(
    entityName: string,
    entityData: any,
    relatedData: Map<string, any[]>,
    context: CascadeContext
  ): Promise<void> {
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
  private async validateCascadeUpdate(
    entityName: string,
    entityId: string | number,
    updateData: any,
    context: CascadeContext
  ): Promise<void> {
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
    } catch (error) {
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
  private async validateCascadeDelete(
    entityName: string,
    entityId: string | number,
    context: CascadeContext
  ): Promise<void> {
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
    } catch (error) {
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
        const hasReferences = await this.checkForReferences(
          relationship.sourceEntity,
          relationship.sourceFields,
          entityId
        );

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
  private async performDeleteSafetyChecks(
    entityName: string,
    entityId: string | number,
    context: CascadeContext
  ): Promise<void> {
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
  private async buildDeleteExecutionPlan(
    entityName: string,
    entityId: string | number,
    context: CascadeContext,
    countOnly: boolean = false
  ): Promise<Map<string, (string | number)[]>> {
    const plan = new Map<string, (string | number)[]>();
    const visited = new Set<string>();

    const buildPlan = async (currentEntity: string, currentId: string | number, depth: number): Promise<void> => {
      if (depth > context.maxDepth || visited.has(`${currentEntity}:${currentId}`)) {
        return;
      }

      visited.add(`${currentEntity}:${currentId}`);

      const relationships = this.relationshipMapper.getOutgoingRelationships(currentEntity);

      for (const relationship of relationships) {
        const cascadeAction = relationship.cascadeOptions.onDelete;

        if (cascadeAction === 'CASCADE') {
          const relatedIds = await this.findRelatedRecords(
            relationship.targetEntity,
            relationship.targetFields,
            currentId
          );

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
  private async executeCreateCascade(
    entityName: string,
    entityId: string | number,
    relatedData: Map<string, any[]>,
    context: CascadeContext
  ): Promise<void> {
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
        const createdRecords: (string | number)[] = [];

        for (const recordData of records) {
          // Set foreign key reference
          recordData[relationship.targetFields[0]] = entityId;

          if (!context.dryRun) {
            const createdRecord = await this.createEntity(relatedEntityName, recordData);
            createdRecords.push(createdRecord.id);
          } else {
            createdRecords.push(`dry-run-${Date.now()}`);
          }
        }

        const entityResult: CascadeEntityResult = {
          entityName: relatedEntityName,
          operation: 'CREATE',
          recordIds: createdRecords,
          success: true,
          errors: [],
          executionOrder: context.depth
        };

        context.affectedEntities.set(relatedEntityName, new Set(createdRecords.map(id => id.toString())));

      } catch (error) {
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
  private async executeUpdateCascade(
    entityName: string,
    entityId: string | number,
    updateData: any,
    context: CascadeContext
  ): Promise<void> {
    const relationships = this.relationshipMapper.getOutgoingRelationships(entityName);

    for (const relationship of relationships) {
      if (relationship.cascadeOptions.onUpdate === 'CASCADE') {
        try {
          const relatedIds = await this.findRelatedRecords(
            relationship.targetEntity,
            relationship.targetFields,
            entityId
          );

          for (const relatedId of relatedIds) {
            if (!context.dryRun) {
              await this.updateEntity(relationship.targetEntity, relatedId, updateData);
            }
          }

          context.affectedEntities.set(
            relationship.targetEntity, 
            new Set(relatedIds.map(id => id.toString()))
          );

        } catch (error) {
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
  private async executeDeleteCascade(
    deletePlan: Map<string, (string | number)[]>,
    context: CascadeContext
  ): Promise<void> {
    // Sort entities by dependency order (dependents first)
    const sortedEntities = this.sortEntitiesForDeletion(Array.from(deletePlan.keys()));

    for (const entityName of sortedEntities) {
      const recordIds = deletePlan.get(entityName)!;
      
      try {
        if (!context.dryRun) {
          await this.batchDeleteRecords(entityName, recordIds, context.batchSize!);
        }

        context.affectedEntities.set(entityName, new Set(recordIds.map(id => id.toString())));

      } catch (error) {
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
  private sortEntitiesForDeletion(entities: string[]): string[] {
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
  private async createEntity(entityName: string, data: any): Promise<any> {
    // This would integrate with the actual Autotask client
    // For now, we'll simulate the operation
    return { id: `${entityName}_${Date.now()}`, ...data };
  }

  private async updateEntity(entityName: string, id: string | number, data: any): Promise<any> {
    // This would integrate with the actual Autotask client
    return { id, ...data };
  }

  private async getEntity(entityName: string, id: string | number): Promise<any> {
    // This would integrate with the actual Autotask client
    return { id, entityName };
  }

  private async findRelatedRecords(
    entityName: string, 
    fields: string[], 
    value: string | number
  ): Promise<(string | number)[]> {
    // This would query the Autotask API for related records
    return [];
  }

  private async checkForReferences(
    entityName: string,
    fields: string[],
    value: string | number
  ): Promise<boolean> {
    const records = await this.findRelatedRecords(entityName, fields, value);
    return records.length > 0;
  }

  private async batchDeleteRecords(
    entityName: string,
    recordIds: (string | number)[],
    batchSize: number
  ): Promise<void> {
    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batch = recordIds.slice(i, i + batchSize);
      // Delete batch - would integrate with actual Autotask client
    }
  }

  /**
   * Result builders
   */
  private buildSuccessResult(context: CascadeContext, startTime: number): CascadeResult {
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

  private buildErrorResult(context: CascadeContext, startTime: number): CascadeResult {
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

  private buildEntityResults(context: CascadeContext): Map<string, CascadeEntityResult> {
    const results = new Map<string, CascadeEntityResult>();

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

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}