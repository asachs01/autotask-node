import { ValidationEngine } from './ValidationEngine';
import { WorkflowEngine } from './WorkflowEngine';
import { ValidationResult } from '../validation';
/**
 * Central business logic engine that coordinates validation, workflows, and business rules
 */
export declare class BusinessLogicEngine {
    private validationEngine;
    private workflowEngine;
    private initialized;
    constructor();
    /**
     * Initialize the business logic engine with default validators and rules
     */
    initialize(): void;
    /**
     * Setup field-level validators for common fields
     */
    private setupFieldValidators;
    /**
     * Setup entity-level validators
     */
    private setupEntityValidators;
    /**
     * Setup cross-entity validators
     */
    private setupCrossEntityValidators;
    /**
     * Setup business workflows
     */
    private setupWorkflows;
    /**
     * Validate an entity operation (create, update, delete)
     */
    validateOperation(operation: 'create' | 'update' | 'delete', entityType: string, entity: any, context?: {
        previousEntity?: any;
        relatedEntities?: Record<string, any>;
        user?: any;
        permissions?: string[];
    }): Promise<ValidationResult>;
    /**
     * Process business rules for an entity operation
     */
    processBusinessRules(operation: 'create' | 'update' | 'delete', entityType: string, entity: any, context?: any): Promise<{
        isAllowed: boolean;
        validationResult: ValidationResult;
        transformedEntity?: any;
        suggestedActions?: string[];
    }>;
    /**
     * Apply business-specific transformations to entities
     */
    private applyBusinessTransformations;
    /**
     * Apply ticket-specific business transformations
     */
    private transformTicket;
    /**
     * Apply time entry-specific business transformations
     */
    private transformTimeEntry;
    /**
     * Apply contract-specific business transformations
     */
    private transformContract;
    /**
     * Generate suggested actions based on validation results
     */
    private generateSuggestedActions;
    /**
     * Get validation engine instance for custom validation
     */
    getValidationEngine(): ValidationEngine;
    /**
     * Get workflow engine instance for custom workflows
     */
    getWorkflowEngine(): WorkflowEngine;
}
//# sourceMappingURL=BusinessLogicEngine.d.ts.map