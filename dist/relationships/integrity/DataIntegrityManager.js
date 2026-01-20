"use strict";
/**
 * Data integrity management system for Autotask entity relationships
 * Handles orphaned record detection, referential integrity, and conflict resolution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataIntegrityManager = void 0;
class DataIntegrityManager {
    constructor(client, relationshipMapper) {
        this.checkHistory = new Map();
        this.repairHistory = new Map();
        this.client = client;
        this.relationshipMapper = relationshipMapper;
    }
    /**
     * Perform comprehensive integrity check
     */
    async performIntegrityCheck(options = {}) {
        const checkId = this.generateCheckId();
        const startTime = Date.now();
        const report = {
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
        }
        catch (error) {
            report.violations.push({
                type: 'CONSTRAINT_VIOLATION',
                entityName: 'SYSTEM',
                recordId: 'N/A',
                relationshipId: '',
                details: `Integrity check failed: ${error.message}`,
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
    async findOrphanedRecords(entities, options) {
        const orphans = [];
        const batchSize = options.batchSize || 100;
        for (const entityName of entities) {
            const relationships = this.relationshipMapper.getIncomingRelationships(entityName);
            for (const relationship of relationships) {
                if (!relationship.required)
                    continue;
                try {
                    // Find records with null or invalid parent references
                    const query = this.buildOrphanQuery(entityName, relationship);
                    const potentialOrphans = await this.executeQuery(query, batchSize);
                    for (const record of potentialOrphans) {
                        const parentExists = await this.checkParentExists(relationship.sourceEntity, record[relationship.targetFields[0]]);
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
                }
                catch (error) {
                    console.warn(`Failed to check orphans for ${entityName}:`, error);
                }
            }
        }
        return orphans;
    }
    /**
     * Check referential integrity
     */
    async checkReferentialIntegrity(entities, options) {
        const issues = [];
        for (const entityName of entities) {
            const relationships = this.relationshipMapper.getOutgoingRelationships(entityName);
            for (const relationship of relationships) {
                try {
                    const referentialIssues = await this.checkRelationshipIntegrity(relationship);
                    issues.push(...referentialIssues);
                }
                catch (error) {
                    console.warn(`Failed to check referential integrity for ${relationship.id}:`, error);
                }
            }
        }
        return issues;
    }
    /**
     * Check for circular dependencies
     */
    async checkCircularDependencies(entities) {
        const circularDeps = this.relationshipMapper.getCircularDependencies();
        return Array.from(circularDeps);
    }
    /**
     * Check business rule constraints
     */
    async checkConstraints(entities, options) {
        const violations = [];
        for (const entityName of entities) {
            const entityConstraints = this.getEntityConstraints(entityName);
            for (const constraint of entityConstraints) {
                try {
                    const constraintViolations = await this.validateConstraint(entityName, constraint);
                    violations.push(...constraintViolations);
                }
                catch (error) {
                    console.warn(`Failed to check constraint ${constraint.name} for ${entityName}:`, error);
                }
            }
        }
        return violations;
    }
    /**
     * Create automated repair plan
     */
    async createRepairPlan(report) {
        const repairId = this.generateRepairId();
        const steps = [];
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
        const repairPlan = {
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
    async executeRepairPlan(repairId, options = {}) {
        const repairPlan = this.repairHistory.get(repairId);
        if (!repairPlan) {
            throw new Error(`Repair plan ${repairId} not found`);
        }
        const result = {
            success: true,
            executedSteps: [],
            errors: [],
            rollbackPlan: undefined
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
            }
            catch (error) {
                result.success = false;
                result.errors.push(`Step ${step.stepId} failed: ${error.message}`);
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
    async cleanupOrphanedRecords(entities = [], options = {}) {
        const result = {
            deletedRecords: [],
            errors: []
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
            }
            catch (error) {
                result.errors.push(`Failed to delete ${orphan.entityName}:${orphan.recordId} - ${error.message}`);
            }
        }
        return result;
    }
    /**
     * Helper methods
     */
    getCheckableEntities() {
        // Return entities that support integrity checks
        return [
            'Companies', 'Contacts', 'Tickets', 'Projects', 'Tasks',
            'Resources', 'TimeEntries', 'Contracts', 'ConfigurationItems',
            'Opportunities'
        ];
    }
    buildOrphanQuery(entityName, relationship) {
        // Build query to find potential orphans
        return `SELECT id, ${relationship.targetFields[0]} FROM ${entityName} WHERE ${relationship.targetFields[0]} IS NOT NULL`;
    }
    async executeQuery(query, batchSize) {
        // Execute query using Autotask client
        // This is a placeholder implementation
        return [];
    }
    async checkParentExists(entityName, parentId) {
        try {
            const parent = await this.client.core.get(entityName, parentId);
            return !!parent;
        }
        catch (error) {
            return false;
        }
    }
    calculateOrphanSeverity(relationship) {
        if (relationship.required && relationship.cascadeOptions.onDelete === 'CASCADE') {
            return 'CRITICAL';
        }
        else if (relationship.required) {
            return 'HIGH';
        }
        else if (relationship.cascadeOptions.onDelete === 'RESTRICT') {
            return 'MEDIUM';
        }
        else {
            return 'LOW';
        }
    }
    async checkRelationshipIntegrity(relationship) {
        // Check if all references point to valid records
        return [];
    }
    getEntityConstraints(entityName) {
        // Return business rule constraints for the entity
        return [];
    }
    async validateConstraint(entityName, constraint) {
        // Validate business rule constraint
        return [];
    }
    addOrphanViolations(report, orphans) {
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
    addReferentialViolations(report, issues) {
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
    addCircularDependencyViolations(report, circularDeps) {
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
    addConstraintViolations(report, violations) {
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
    generateRecommendations(report) {
        const recommendations = [];
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
    calculateRepairImpact(steps) {
        const impact = {
            recordsToUpdate: 0,
            recordsToDelete: 0,
            relatedEntitiesAffected: [],
            estimatedDuration: 0
        };
        const affectedEntities = new Set();
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
    assessRepairRisk(steps, impact) {
        if (impact.recordsToDelete > 100 || impact.relatedEntitiesAffected.length > 5) {
            return 'CRITICAL';
        }
        else if (impact.recordsToDelete > 50 || impact.recordsToUpdate > 200) {
            return 'HIGH';
        }
        else if (impact.recordsToDelete > 10 || impact.recordsToUpdate > 50) {
            return 'MEDIUM';
        }
        else {
            return 'LOW';
        }
    }
    sortRepairSteps(steps) {
        // Sort steps based on dependencies
        return steps.sort((a, b) => a.dependencies.length - b.dependencies.length);
    }
    async executeRepairStep(step) {
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
    async deleteRecord(entityName, recordId) {
        // Delete record using client
        await this.client.core.delete(entityName, recordId);
    }
    async updateRecord(entityName, recordId, data) {
        // Update record using client
        await this.client.core.update(entityName, recordId, data);
    }
    async createDataBackup(repairPlan) {
        // Create backup of data that will be modified
        const backupId = `backup_${Date.now()}`;
        // Implementation would create actual backup
        return backupId;
    }
    async confirmStepExecution(step) {
        // In a real implementation, this would prompt for user confirmation
        return true;
    }
    generateCheckId() {
        return `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateRepairId() {
        return `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get integrity check history
     */
    getCheckHistory(limit = 10) {
        return Array.from(this.checkHistory.values())
            .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
            .slice(0, limit);
    }
    /**
     * Get repair plan history
     */
    getRepairHistory(limit = 10) {
        return Array.from(this.repairHistory.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }
}
exports.DataIntegrityManager = DataIntegrityManager;
//# sourceMappingURL=DataIntegrityManager.js.map