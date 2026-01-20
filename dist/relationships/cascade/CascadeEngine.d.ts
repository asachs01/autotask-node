/**
 * Cascade operations engine for Autotask entity relationships
 * Handles create, update, and delete operations with intelligent dependency resolution
 */
import { CascadeResult } from '../types/RelationshipTypes';
import { AutotaskClient } from '../../client/AutotaskClient';
export declare class CascadeEngine {
    private relationshipMapper;
    private client;
    private activeTransactions;
    constructor(client: AutotaskClient);
    /**
     * Execute cascade create operation
     */
    cascadeCreate(entityName: string, entityData: any, relatedData?: Map<string, any[]>, options?: {
        maxDepth?: number;
        dryRun?: boolean;
        batchSize?: number;
        continueOnError?: boolean;
    }): Promise<CascadeResult>;
    /**
     * Execute cascade update operation
     */
    cascadeUpdate(entityName: string, entityId: string | number, updateData: any, options?: {
        maxDepth?: number;
        dryRun?: boolean;
        batchSize?: number;
        continueOnError?: boolean;
        followDependents?: boolean;
    }): Promise<CascadeResult>;
    /**
     * Execute cascade delete operation with safety checks
     */
    cascadeDelete(entityName: string, entityId: string | number, options?: {
        maxDepth?: number;
        dryRun?: boolean;
        batchSize?: number;
        force?: boolean;
        safetyChecks?: boolean;
    }): Promise<CascadeResult>;
    /**
     * Validate cascade create operation
     */
    private validateCascadeCreate;
    /**
     * Validate cascade update operation
     */
    private validateCascadeUpdate;
    /**
     * Validate cascade delete operation
     */
    private validateCascadeDelete;
    /**
     * Perform safety checks before cascade delete
     */
    private performDeleteSafetyChecks;
    /**
     * Build execution plan for cascade delete
     */
    private buildDeleteExecutionPlan;
    /**
     * Execute create cascade operations
     */
    private executeCreateCascade;
    /**
     * Execute update cascade operations
     */
    private executeUpdateCascade;
    /**
     * Execute delete cascade operations
     */
    private executeDeleteCascade;
    /**
     * Sort entities for deletion (dependencies first)
     */
    private sortEntitiesForDeletion;
    /**
     * Helper methods for entity operations
     */
    private createEntity;
    private updateEntity;
    private getEntity;
    private findRelatedRecords;
    private checkForReferences;
    private batchDeleteRecords;
    /**
     * Result builders
     */
    private buildSuccessResult;
    private buildErrorResult;
    private buildEntityResults;
    private generateTransactionId;
}
//# sourceMappingURL=CascadeEngine.d.ts.map