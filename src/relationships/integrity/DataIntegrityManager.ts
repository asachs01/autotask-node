/**
 * Data integrity management system for Autotask entity relationships
 * Handles orphaned record detection, referential integrity, and conflict resolution
 */

import { 
  IntegrityViolation,
  IntegrityCheckResult,
  EntityRelationship,
  CascadeAction
} from '../types/RelationshipTypes';
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

export class DataIntegrityManager {
  private relationshipMapper: RelationshipMapper;
  private client: AutotaskClient;
  private checkHistory: Map<string, IntegrityReport> = new Map();
  private repairHistory: Map<string, IntegrityRepairPlan> = new Map();

  constructor(client: AutotaskClient, relationshipMapper: RelationshipMapper) {
    this.client = client;
    this.relationshipMapper = relationshipMapper;
  }

  /**
   * Perform comprehensive integrity check
   */
  public async performIntegrityCheck(options: IntegrityCheckOptions = {}): Promise<IntegrityReport> {
    const checkId = this.generateCheckId();
    const startTime = Date.now();

    const report: IntegrityReport = {
      checkId,
      executedAt: new Date(),
      duration: 0,
      entitiesChecked: options.entities || this.getCheckableEntities(),
      recordsChecked: 0,
      violations: [],
      orphanedRecords: [],
      referentialIssues: [],
      constraintViolations: [],
      recommendations: []
    };

    try {
      // Step 1: Check for orphaned records
      if (options.checkOrphans !== false) {
        const orphans = await this.findOrphanedRecords(report.entitiesChecked, options);
        report.orphanedRecords = orphans;
        this.addOrphanViolations(report, orphans);
      }

      // Step 2: Check referential integrity
      if (options.checkReferences !== false) {
        const refIssues = await this.checkReferentialIntegrity(report.entitiesChecked, options);
        report.referentialIssues = refIssues;
        this.addReferentialViolations(report, refIssues);
      }

      // Step 3: Check circular dependencies
      if (options.checkCircularDependencies !== false) {
        const circularIssues = await this.checkCircularDependencies(report.entitiesChecked);
        this.addCircularDependencyViolations(report, circularIssues);
      }

      // Step 4: Check business rule constraints
      if (options.checkConstraints !== false) {
        const constraintViolations = await this.checkConstraints(report.entitiesChecked, options);
        report.constraintViolations = constraintViolations;
        this.addConstraintViolations(report, constraintViolations);
      }

      // Step 5: Generate recommendations
      report.recommendations = this.generateRecommendations(report);

      // Step 6: Create repair plan if requested
      if (options.generateReport && report.violations.length > 0) {
        report.repairPlan = await this.createRepairPlan(report);
      }

    } catch (error) {
      report.violations.push({
        type: 'CONSTRAINT_VIOLATION',
        entityName: 'SYSTEM',
        recordId: 'N/A',
        relationshipId: '',
        details: `Integrity check failed: ${(error as Error).message}`,
        severity: 'CRITICAL'
      });
    }

    report.duration = Date.now() - startTime;
    this.checkHistory.set(checkId, report);

    return report;
  }

  /**
   * Find orphaned records across all entities
   */
  private async findOrphanedRecords(
    entities: string[],
    options: IntegrityCheckOptions
  ): Promise<OrphanedRecord[]> {
    const orphans: OrphanedRecord[] = [];
    const batchSize = options.batchSize || 100;

    for (const entityName of entities) {
      const relationships = this.relationshipMapper.getIncomingRelationships(entityName);

      for (const relationship of relationships) {
        if (!relationship.required) continue;

        try {
          // Find records with null or invalid parent references
          const query = this.buildOrphanQuery(entityName, relationship);
          const potentialOrphans = await this.executeQuery(query, batchSize);

          for (const record of potentialOrphans) {
            const parentExists = await this.checkParentExists(
              relationship.sourceEntity,
              record[relationship.targetFields[0]]
            );

            if (!parentExists) {
              orphans.push({
                entityName,
                recordId: record.id,
                orphanedField: relationship.targetFields[0],
                expectedParentEntity: relationship.sourceEntity,
                missingParentId: record[relationship.targetFields[0]],
                discoveredAt: new Date(),
                severity: this.calculateOrphanSeverity(relationship)
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check orphans for ${entityName}:`, error);
        }
      }
    }

    return orphans;
  }

  /**
   * Check referential integrity
   */
  private async checkReferentialIntegrity(
    entities: string[],
    options: IntegrityCheckOptions
  ): Promise<ReferentialIntegrityIssue[]> {
    const issues: ReferentialIntegrityIssue[] = [];

    for (const entityName of entities) {
      const relationships = this.relationshipMapper.getOutgoingRelationships(entityName);

      for (const relationship of relationships) {
        try {
          const referentialIssues = await this.checkRelationshipIntegrity(relationship);
          issues.push(...referentialIssues);
        } catch (error) {
          console.warn(`Failed to check referential integrity for ${relationship.id}:`, error);
        }
      }
    }

    return issues;
  }

  /**
   * Check for circular dependencies
   */
  private async checkCircularDependencies(entities: string[]): Promise<string[]> {
    const circularDeps = this.relationshipMapper.getCircularDependencies();
    return Array.from(circularDeps);
  }

  /**
   * Check business rule constraints
   */
  private async checkConstraints(
    entities: string[],
    options: IntegrityCheckOptions
  ): Promise<ConstraintViolation[]> {
    const violations: ConstraintViolation[] = [];

    for (const entityName of entities) {
      const entityConstraints = this.getEntityConstraints(entityName);

      for (const constraint of entityConstraints) {
        try {
          const constraintViolations = await this.validateConstraint(entityName, constraint);
          violations.push(...constraintViolations);
        } catch (error) {
          console.warn(`Failed to check constraint ${constraint.name} for ${entityName}:`, error);
        }
      }
    }

    return violations;
  }

  /**
   * Create automated repair plan
   */
  private async createRepairPlan(report: IntegrityReport): Promise<IntegrityRepairPlan> {
    const repairId = this.generateRepairId();
    const steps: IntegrityRepairStep[] = [];

    // Plan for orphaned records
    for (const orphan of report.orphanedRecords) {
      if (orphan.severity === 'CRITICAL' || orphan.severity === 'HIGH') {
        steps.push({
          stepId: `orphan_${steps.length + 1}`,
          stepType: 'DELETE_ORPHAN',
          entityName: orphan.entityName,
          recordId: orphan.recordId,
          action: `Delete orphaned ${orphan.entityName} record`,
          dependencies: [],
          rollbackPlan: `Backup record data before deletion`
        });
      }
    }

    // Plan for referential issues
    for (const issue of report.referentialIssues) {
      switch (issue.issueType) {
        case 'MISSING_REFERENCE':
          steps.push({
            stepId: `ref_${steps.length + 1}`,
            stepType: 'UPDATE_REFERENCE',
            entityName: issue.sourceEntity,
            recordId: issue.sourceRecordId,
            action: `Set reference to NULL or valid target`,
            dependencies: [],
            rollbackPlan: `Restore original reference value`
          });
          break;

        case 'INVALID_REFERENCE':
          steps.push({
            stepId: `inv_ref_${steps.length + 1}`,
            stepType: 'UPDATE_REFERENCE',
            entityName: issue.sourceEntity,
            recordId: issue.sourceRecordId,
            action: `Update invalid reference to valid target`,
            dependencies: [],
            rollbackPlan: `Restore original reference value`
          });
          break;
      }
    }

    // Calculate impact and risk
    const estimatedImpact = this.calculateRepairImpact(steps);
    const riskAssessment = this.assessRepairRisk(steps, estimatedImpact);

    const repairPlan: IntegrityRepairPlan = {
      repairId,
      createdAt: new Date(),
      steps,
      estimatedImpact,
      riskAssessment
    };

    this.repairHistory.set(repairId, repairPlan);
    return repairPlan;
  }

  /**
   * Execute repair plan
   */
  public async executeRepairPlan(
    repairId: string,
    options: {
      dryRun?: boolean;
      stepByStep?: boolean;
      backupData?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    executedSteps: string[];
    errors: string[];
    rollbackPlan?: string;
  }> {
    const repairPlan = this.repairHistory.get(repairId);
    if (!repairPlan) {
      throw new Error(`Repair plan ${repairId} not found`);
    }

    const result = {
      success: true,
      executedSteps: [] as string[],
      errors: [] as string[],
      rollbackPlan: undefined as string | undefined
    };

    if (options.backupData) {
      result.rollbackPlan = await this.createDataBackup(repairPlan);
    }

    // Execute steps in dependency order
    const sortedSteps = this.sortRepairSteps(repairPlan.steps);

    for (const step of sortedSteps) {
      try {
        if (!options.dryRun) {
          await this.executeRepairStep(step);
        }
        
        result.executedSteps.push(step.stepId);

        if (options.stepByStep) {
          // Allow for manual confirmation between steps
          const shouldContinue = await this.confirmStepExecution(step);
          if (!shouldContinue) {
            break;
          }
        }
      } catch (error) {
        result.success = false;
        result.errors.push(`Step ${step.stepId} failed: ${(error as Error).message}`);
        
        if (!options.stepByStep) {
          break; // Stop on first error unless step-by-step mode
        }
      }
    }

    return result;
  }

  /**
   * Cleanup operations for orphaned records
   */
  public async cleanupOrphanedRecords(
    entities: string[] = [],
    options: {
      dryRun?: boolean;
      batchSize?: number;
      maxAge?: number; // Days
      severityThreshold?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    } = {}
  ): Promise<{
    deletedRecords: Array<{ entityName: string; recordId: string | number }>;
    errors: string[];
  }> {
    const result = {
      deletedRecords: [] as Array<{ entityName: string; recordId: string | number }>,
      errors: [] as string[]
    };

    const checkEntities = entities.length > 0 ? entities : this.getCheckableEntities();
    const orphans = await this.findOrphanedRecords(checkEntities, { batchSize: options.batchSize });

    // Filter by age and severity
    const filteredOrphans = orphans.filter(orphan => {
      const ageInDays = (Date.now() - orphan.discoveredAt.getTime()) / (1000 * 60 * 60 * 24);
      const ageThreshold = options.maxAge || 30;
      const severityThreshold = options.severityThreshold || 'MEDIUM';
      
      const severityOrder = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
      const meetsSeverity = severityOrder[orphan.severity] >= severityOrder[severityThreshold];
      
      return ageInDays >= ageThreshold && meetsSeverity;
    });

    for (const orphan of filteredOrphans) {
      try {
        if (!options.dryRun) {
          await this.deleteRecord(orphan.entityName, orphan.recordId);
        }
        
        result.deletedRecords.push({
          entityName: orphan.entityName,
          recordId: orphan.recordId
        });
      } catch (error) {
        result.errors.push(`Failed to delete ${orphan.entityName}:${orphan.recordId} - ${(error as Error).message}`);
      }
    }

    return result;
  }

  /**
   * Helper methods
   */
  private getCheckableEntities(): string[] {
    // Return entities that support integrity checks
    return [
      'Companies', 'Contacts', 'Tickets', 'Projects', 'Tasks',
      'Resources', 'TimeEntries', 'Contracts', 'ConfigurationItems',
      'Opportunities'
    ];
  }

  private buildOrphanQuery(entityName: string, relationship: EntityRelationship): string {
    // Build query to find potential orphans
    return `SELECT id, ${relationship.targetFields[0]} FROM ${entityName} WHERE ${relationship.targetFields[0]} IS NOT NULL`;
  }

  private async executeQuery(query: string, batchSize: number): Promise<any[]> {
    // Execute query using Autotask client
    // This is a placeholder implementation
    return [];
  }

  private async checkParentExists(entityName: string, parentId: any): Promise<boolean> {
    try {
      const parent = await (this.client as any).core.get(entityName as any, parentId);
      return !!parent;
    } catch (error) {
      return false;
    }
  }

  private calculateOrphanSeverity(relationship: EntityRelationship): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (relationship.required && relationship.cascadeOptions.onDelete === 'CASCADE') {
      return 'CRITICAL';
    } else if (relationship.required) {
      return 'HIGH';
    } else if (relationship.cascadeOptions.onDelete === 'RESTRICT') {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  private async checkRelationshipIntegrity(relationship: EntityRelationship): Promise<ReferentialIntegrityIssue[]> {
    // Check if all references point to valid records
    return [];
  }

  private getEntityConstraints(entityName: string): Array<{ name: string; rule: string; severity: string }> {
    // Return business rule constraints for the entity
    return [];
  }

  private async validateConstraint(
    entityName: string, 
    constraint: { name: string; rule: string; severity: string }
  ): Promise<ConstraintViolation[]> {
    // Validate business rule constraint
    return [];
  }

  private addOrphanViolations(report: IntegrityReport, orphans: OrphanedRecord[]): void {
    orphans.forEach(orphan => {
      report.violations.push({
        type: 'ORPHANED_RECORD',
        entityName: orphan.entityName,
        recordId: orphan.recordId,
        relationshipId: '',
        details: `Orphaned record: missing ${orphan.expectedParentEntity}:${orphan.missingParentId}`,
        severity: orphan.severity
      });
    });
  }

  private addReferentialViolations(report: IntegrityReport, issues: ReferentialIntegrityIssue[]): void {
    issues.forEach(issue => {
      report.violations.push({
        type: 'MISSING_REFERENCE',
        entityName: issue.sourceEntity,
        recordId: issue.sourceRecordId,
        relationshipId: issue.relationshipId,
        details: issue.details,
        severity: 'HIGH'
      });
    });
  }

  private addCircularDependencyViolations(report: IntegrityReport, circularDeps: string[]): void {
    circularDeps.forEach(dep => {
      report.violations.push({
        type: 'CIRCULAR_DEPENDENCY',
        entityName: 'SYSTEM',
        recordId: 'N/A',
        relationshipId: '',
        details: `Circular dependency detected: ${dep}`,
        severity: 'MEDIUM'
      });
    });
  }

  private addConstraintViolations(report: IntegrityReport, violations: ConstraintViolation[]): void {
    violations.forEach(violation => {
      report.violations.push({
        type: 'CONSTRAINT_VIOLATION',
        entityName: violation.entityName,
        recordId: violation.recordId,
        relationshipId: '',
        details: `Constraint violation: ${violation.constraintName}`,
        severity: 'MEDIUM'
      });
    });
  }

  private generateRecommendations(report: IntegrityReport): string[] {
    const recommendations: string[] = [];

    if (report.orphanedRecords.length > 0) {
      recommendations.push('Consider implementing cascade delete rules for better data consistency');
      recommendations.push('Regular orphaned record cleanup should be scheduled');
    }

    if (report.referentialIssues.length > 0) {
      recommendations.push('Review relationship definitions and add proper constraints');
    }

    if (report.violations.some(v => v.severity === 'CRITICAL')) {
      recommendations.push('Critical integrity issues require immediate attention');
    }

    return recommendations;
  }

  private calculateRepairImpact(steps: IntegrityRepairStep[]) {
    const impact = {
      recordsToUpdate: 0,
      recordsToDelete: 0,
      relatedEntitiesAffected: [] as string[],
      estimatedDuration: 0
    };

    const affectedEntities = new Set<string>();

    steps.forEach(step => {
      affectedEntities.add(step.entityName);
      
      switch (step.stepType) {
        case 'DELETE_ORPHAN':
          impact.recordsToDelete++;
          impact.estimatedDuration += 5; // 5 seconds per delete
          break;
        case 'UPDATE_REFERENCE':
          impact.recordsToUpdate++;
          impact.estimatedDuration += 3; // 3 seconds per update
          break;
        default:
          impact.estimatedDuration += 10; // Default time estimate
      }
    });

    impact.relatedEntitiesAffected = Array.from(affectedEntities);
    return impact;
  }

  private assessRepairRisk(steps: IntegrityRepairStep[], impact: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (impact.recordsToDelete > 100 || impact.relatedEntitiesAffected.length > 5) {
      return 'CRITICAL';
    } else if (impact.recordsToDelete > 50 || impact.recordsToUpdate > 200) {
      return 'HIGH';
    } else if (impact.recordsToDelete > 10 || impact.recordsToUpdate > 50) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  private sortRepairSteps(steps: IntegrityRepairStep[]): IntegrityRepairStep[] {
    // Sort steps based on dependencies
    return steps.sort((a, b) => a.dependencies.length - b.dependencies.length);
  }

  private async executeRepairStep(step: IntegrityRepairStep): Promise<void> {
    switch (step.stepType) {
      case 'DELETE_ORPHAN':
        await this.deleteRecord(step.entityName, step.recordId);
        break;
      case 'UPDATE_REFERENCE':
        await this.updateRecord(step.entityName, step.recordId, step.data);
        break;
      default:
        throw new Error(`Unknown repair step type: ${step.stepType}`);
    }
  }

  private async deleteRecord(entityName: string, recordId: string | number): Promise<void> {
    // Delete record using client
    await (this.client as any).core.delete(entityName as any, recordId as number);
  }

  private async updateRecord(entityName: string, recordId: string | number, data: any): Promise<void> {
    // Update record using client
    await (this.client as any).core.update(entityName as any, recordId as number, data);
  }

  private async createDataBackup(repairPlan: IntegrityRepairPlan): Promise<string> {
    // Create backup of data that will be modified
    const backupId = `backup_${Date.now()}`;
    // Implementation would create actual backup
    return backupId;
  }

  private async confirmStepExecution(step: IntegrityRepairStep): Promise<boolean> {
    // In a real implementation, this would prompt for user confirmation
    return true;
  }

  private generateCheckId(): string {
    return `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRepairId(): string {
    return `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get integrity check history
   */
  public getCheckHistory(limit: number = 10): IntegrityReport[] {
    return Array.from(this.checkHistory.values())
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get repair plan history
   */
  public getRepairHistory(limit: number = 10): IntegrityRepairPlan[] {
    return Array.from(this.repairHistory.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}