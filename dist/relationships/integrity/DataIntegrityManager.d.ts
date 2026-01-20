/**
 * Data integrity management system for Autotask entity relationships
 * Handles orphaned record detection, referential integrity, and conflict resolution
 */
import { IntegrityViolation } from '../types/RelationshipTypes';
import { RelationshipMapper } from '../core/RelationshipMapper';
import { AutotaskClient } from '../../client/AutotaskClient';
export interface IntegrityCheckOptions {
    entities?: string[];
    checkOrphans?: boolean;
    checkReferences?: boolean;
    checkCircularDependencies?: boolean;
    checkConstraints?: boolean;
    batchSize?: number;
    continueOnError?: boolean;
    generateReport?: boolean;
}
export interface OrphanedRecord {
    entityName: string;
    recordId: string | number;
    orphanedField: string;
    expectedParentEntity: string;
    missingParentId: string | number;
    discoveredAt: Date;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export interface ReferentialIntegrityIssue {
    sourceEntity: string;
    sourceRecordId: string | number;
    targetEntity: string;
    targetRecordId: string | number;
    relationshipId: string;
    issueType: 'MISSING_REFERENCE' | 'INVALID_REFERENCE' | 'CIRCULAR_REFERENCE';
    details: string;
}
export interface ConstraintViolation {
    entityName: string;
    recordId: string | number;
    constraintName: string;
    violationType: 'REQUIRED_FIELD_NULL' | 'INVALID_VALUE' | 'BUSINESS_RULE_VIOLATION';
    expectedValue?: any;
    actualValue?: any;
    businessRule?: string;
}
export interface IntegrityReport {
    checkId: string;
    executedAt: Date;
    duration: number;
    entitiesChecked: string[];
    recordsChecked: number;
    violations: IntegrityViolation[];
    orphanedRecords: OrphanedRecord[];
    referentialIssues: ReferentialIntegrityIssue[];
    constraintViolations: ConstraintViolation[];
    recommendations: string[];
    repairPlan?: IntegrityRepairPlan;
}
export interface IntegrityRepairPlan {
    repairId: string;
    createdAt: Date;
    steps: IntegrityRepairStep[];
    estimatedImpact: {
        recordsToUpdate: number;
        recordsToDelete: number;
        relatedEntitiesAffected: string[];
        estimatedDuration: number;
    };
    riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export interface IntegrityRepairStep {
    stepId: string;
    stepType: 'DELETE_ORPHAN' | 'UPDATE_REFERENCE' | 'CREATE_MISSING' | 'VALIDATE_CONSTRAINT';
    entityName: string;
    recordId: string | number;
    action: string;
    data?: any;
    dependencies: string[];
    rollbackPlan?: string;
}
export declare class DataIntegrityManager {
    private relationshipMapper;
    private client;
    private checkHistory;
    private repairHistory;
    constructor(client: AutotaskClient, relationshipMapper: RelationshipMapper);
    /**
     * Perform comprehensive integrity check
     */
    performIntegrityCheck(options?: IntegrityCheckOptions): Promise<IntegrityReport>;
    /**
     * Find orphaned records across all entities
     */
    private findOrphanedRecords;
    /**
     * Check referential integrity
     */
    private checkReferentialIntegrity;
    /**
     * Check for circular dependencies
     */
    private checkCircularDependencies;
    /**
     * Check business rule constraints
     */
    private checkConstraints;
    /**
     * Create automated repair plan
     */
    private createRepairPlan;
    /**
     * Execute repair plan
     */
    executeRepairPlan(repairId: string, options?: {
        dryRun?: boolean;
        stepByStep?: boolean;
        backupData?: boolean;
    }): Promise<{
        success: boolean;
        executedSteps: string[];
        errors: string[];
        rollbackPlan?: string;
    }>;
    /**
     * Cleanup operations for orphaned records
     */
    cleanupOrphanedRecords(entities?: string[], options?: {
        dryRun?: boolean;
        batchSize?: number;
        maxAge?: number;
        severityThreshold?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }): Promise<{
        deletedRecords: Array<{
            entityName: string;
            recordId: string | number;
        }>;
        errors: string[];
    }>;
    /**
     * Helper methods
     */
    private getCheckableEntities;
    private buildOrphanQuery;
    private executeQuery;
    private checkParentExists;
    private calculateOrphanSeverity;
    private checkRelationshipIntegrity;
    private getEntityConstraints;
    private validateConstraint;
    private addOrphanViolations;
    private addReferentialViolations;
    private addCircularDependencyViolations;
    private addConstraintViolations;
    private generateRecommendations;
    private calculateRepairImpact;
    private assessRepairRisk;
    private sortRepairSteps;
    private executeRepairStep;
    private deleteRecord;
    private updateRecord;
    private createDataBackup;
    private confirmStepExecution;
    private generateCheckId;
    private generateRepairId;
    /**
     * Get integrity check history
     */
    getCheckHistory(limit?: number): IntegrityReport[];
    /**
     * Get repair plan history
     */
    getRepairHistory(limit?: number): IntegrityRepairPlan[];
}
//# sourceMappingURL=DataIntegrityManager.d.ts.map