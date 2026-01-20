/**
 * Enhanced error handling for Autotask business logic operations
 *
 * Provides detailed error information with business context,
 * suggested fixes, and recovery actions
 */
export declare class BusinessLogicError extends Error {
    readonly code: string;
    readonly entityType: string;
    readonly operation: string;
    readonly field?: string;
    readonly suggestedFix?: string;
    readonly recoveryActions?: string[];
    readonly context?: Record<string, any>;
    readonly severity: 'error' | 'warning' | 'info';
    readonly isRecoverable: boolean;
    readonly cause?: Error;
    constructor(message: string, code: string, entityType: string, operation: string, options?: {
        field?: string;
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
        severity?: 'error' | 'warning' | 'info';
        isRecoverable?: boolean;
        cause?: Error;
    });
    /**
     * Convert to a plain object for serialization
     */
    toObject(): Record<string, any>;
    /**
     * Create a user-friendly error message
     */
    getUserFriendlyMessage(): string;
}
/**
 * Validation-specific business logic errors
 */
export declare class ValidationError extends BusinessLogicError {
    readonly validationType: 'field' | 'entity' | 'cross-entity';
    readonly violatedRule: string;
    constructor(message: string, code: string, entityType: string, field: string, validationType: 'field' | 'entity' | 'cross-entity', violatedRule: string, options?: {
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
        severity?: 'error' | 'warning' | 'info';
    });
}
/**
 * Workflow-specific business logic errors
 */
export declare class WorkflowError extends BusinessLogicError {
    readonly workflowId: string;
    readonly stepId?: string;
    readonly workflowStep?: string;
    constructor(message: string, code: string, entityType: string, workflowId: string, options?: {
        stepId?: string;
        workflowStep?: string;
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
        cause?: Error;
    });
}
/**
 * Permissions and authorization errors
 */
export declare class PermissionError extends BusinessLogicError {
    readonly requiredPermissions: string[];
    readonly userPermissions: string[];
    readonly resourceId?: string;
    constructor(message: string, code: string, entityType: string, operation: string, requiredPermissions: string[], userPermissions: string[], options?: {
        resourceId?: string;
        suggestedFix?: string;
        context?: Record<string, any>;
    });
}
/**
 * Business rule violation errors
 */
export declare class BusinessRuleViolationError extends BusinessLogicError {
    readonly ruleName: string;
    readonly ruleCategory: string;
    readonly violationDetails: Record<string, any>;
    constructor(message: string, code: string, entityType: string, operation: string, ruleName: string, ruleCategory: string, violationDetails: Record<string, any>, options?: {
        field?: string;
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
        severity?: 'error' | 'warning' | 'info';
    });
}
/**
 * Data consistency and integrity errors
 */
export declare class DataIntegrityError extends BusinessLogicError {
    readonly integrityType: 'referential' | 'constraint' | 'business' | 'temporal';
    readonly affectedEntities: string[];
    readonly constraintName?: string;
    constructor(message: string, code: string, entityType: string, operation: string, integrityType: 'referential' | 'constraint' | 'business' | 'temporal', affectedEntities: string[], options?: {
        constraintName?: string;
        field?: string;
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
    });
}
/**
 * Configuration and setup errors
 */
export declare class ConfigurationError extends BusinessLogicError {
    readonly configurationArea: string;
    readonly missingConfiguration: string[];
    readonly invalidConfiguration: string[];
    constructor(message: string, code: string, entityType: string, configurationArea: string, options?: {
        missingConfiguration?: string[];
        invalidConfiguration?: string[];
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
    });
}
/**
 * Error factory for creating specific error types
 */
export declare class ErrorFactory {
    /**
     * Create a validation error
     */
    static createValidationError(field: string, entityType: string, validationType: 'field' | 'entity' | 'cross-entity', violatedRule: string, message?: string, options?: {
        code?: string;
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
        severity?: 'error' | 'warning' | 'info';
    }): ValidationError;
    /**
     * Create a workflow error
     */
    static createWorkflowError(workflowId: string, entityType: string, message?: string, options?: {
        code?: string;
        stepId?: string;
        workflowStep?: string;
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
        cause?: Error;
    }): WorkflowError;
    /**
     * Create a permission error
     */
    static createPermissionError(entityType: string, operation: string, requiredPermissions: string[], userPermissions: string[], message?: string, options?: {
        code?: string;
        resourceId?: string;
        suggestedFix?: string;
        context?: Record<string, any>;
    }): PermissionError;
    /**
     * Create a business rule violation error
     */
    static createBusinessRuleViolationError(entityType: string, operation: string, ruleName: string, ruleCategory: string, violationDetails: Record<string, any>, message?: string, options?: {
        code?: string;
        field?: string;
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
        severity?: 'error' | 'warning' | 'info';
    }): BusinessRuleViolationError;
    /**
     * Create a data integrity error
     */
    static createDataIntegrityError(entityType: string, operation: string, integrityType: 'referential' | 'constraint' | 'business' | 'temporal', affectedEntities: string[], message?: string, options?: {
        code?: string;
        constraintName?: string;
        field?: string;
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
    }): DataIntegrityError;
    /**
     * Create a configuration error
     */
    static createConfigurationError(entityType: string, configurationArea: string, message?: string, options?: {
        code?: string;
        missingConfiguration?: string[];
        invalidConfiguration?: string[];
        suggestedFix?: string;
        recoveryActions?: string[];
        context?: Record<string, any>;
    }): ConfigurationError;
}
/**
 * Error aggregator for collecting multiple errors
 */
export declare class ErrorAggregator {
    private errors;
    private warnings;
    /**
     * Add an error to the aggregator
     */
    addError(error: BusinessLogicError): void;
    /**
     * Add multiple errors
     */
    addErrors(errors: BusinessLogicError[]): void;
    /**
     * Check if there are any errors
     */
    hasErrors(): boolean;
    /**
     * Check if there are any warnings
     */
    hasWarnings(): boolean;
    /**
     * Get all errors
     */
    getErrors(): BusinessLogicError[];
    /**
     * Get all warnings
     */
    getWarnings(): BusinessLogicError[];
    /**
     * Get all issues (errors and warnings)
     */
    getAllIssues(): BusinessLogicError[];
    /**
     * Get errors by entity type
     */
    getErrorsByEntity(entityType: string): BusinessLogicError[];
    /**
     * Get errors by field
     */
    getErrorsByField(field: string): BusinessLogicError[];
    /**
     * Clear all errors and warnings
     */
    clear(): void;
    /**
     * Create a summary of all issues
     */
    getSummary(): {
        totalErrors: number;
        totalWarnings: number;
        errorsByType: Record<string, number>;
        errorsByEntity: Record<string, number>;
        recoverableErrors: number;
    };
}
//# sourceMappingURL=BusinessLogicErrors.d.ts.map