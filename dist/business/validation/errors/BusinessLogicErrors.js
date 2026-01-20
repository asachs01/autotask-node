"use strict";
/**
 * Enhanced error handling for Autotask business logic operations
 *
 * Provides detailed error information with business context,
 * suggested fixes, and recovery actions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorAggregator = exports.ErrorFactory = exports.ConfigurationError = exports.DataIntegrityError = exports.BusinessRuleViolationError = exports.PermissionError = exports.WorkflowError = exports.ValidationError = exports.BusinessLogicError = void 0;
class BusinessLogicError extends Error {
    constructor(message, code, entityType, operation, options = {}) {
        super(message);
        this.name = 'BusinessLogicError';
        this.code = code;
        this.entityType = entityType;
        this.operation = operation;
        this.field = options.field;
        this.suggestedFix = options.suggestedFix;
        this.recoveryActions = options.recoveryActions || [];
        this.context = options.context || {};
        this.severity = options.severity || 'error';
        this.isRecoverable = options.isRecoverable ?? true;
        if (options.cause) {
            this.cause = options.cause;
        }
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BusinessLogicError);
        }
    }
    /**
     * Convert to a plain object for serialization
     */
    toObject() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            entityType: this.entityType,
            operation: this.operation,
            field: this.field,
            suggestedFix: this.suggestedFix,
            recoveryActions: this.recoveryActions,
            context: this.context,
            severity: this.severity,
            isRecoverable: this.isRecoverable,
            stack: this.stack
        };
    }
    /**
     * Create a user-friendly error message
     */
    getUserFriendlyMessage() {
        let message = this.message;
        if (this.field) {
            message = `${this.field}: ${message}`;
        }
        if (this.suggestedFix) {
            message += `\n\nSuggestion: ${this.suggestedFix}`;
        }
        if (this.recoveryActions && this.recoveryActions.length > 0) {
            message += `\n\nRecovery actions:\n${this.recoveryActions.map(action => `• ${action}`).join('\n')}`;
        }
        return message;
    }
}
exports.BusinessLogicError = BusinessLogicError;
/**
 * Validation-specific business logic errors
 */
class ValidationError extends BusinessLogicError {
    constructor(message, code, entityType, field, validationType, violatedRule, options = {}) {
        super(message, code, entityType, 'validate', {
            ...options,
            field
        });
        this.name = 'ValidationError';
        this.validationType = validationType;
        this.violatedRule = violatedRule;
    }
}
exports.ValidationError = ValidationError;
/**
 * Workflow-specific business logic errors
 */
class WorkflowError extends BusinessLogicError {
    constructor(message, code, entityType, workflowId, options = {}) {
        super(message, code, entityType, 'workflow', {
            ...options,
            isRecoverable: false // Workflow errors typically require manual intervention
        });
        this.name = 'WorkflowError';
        this.workflowId = workflowId;
        this.stepId = options.stepId;
        this.workflowStep = options.workflowStep;
    }
}
exports.WorkflowError = WorkflowError;
/**
 * Permissions and authorization errors
 */
class PermissionError extends BusinessLogicError {
    constructor(message, code, entityType, operation, requiredPermissions, userPermissions, options = {}) {
        super(message, code, entityType, operation, {
            ...options,
            severity: 'error',
            isRecoverable: false
        });
        this.name = 'PermissionError';
        this.requiredPermissions = requiredPermissions;
        this.userPermissions = userPermissions;
        this.resourceId = options.resourceId;
    }
}
exports.PermissionError = PermissionError;
/**
 * Business rule violation errors
 */
class BusinessRuleViolationError extends BusinessLogicError {
    constructor(message, code, entityType, operation, ruleName, ruleCategory, violationDetails, options = {}) {
        super(message, code, entityType, operation, options);
        this.name = 'BusinessRuleViolationError';
        this.ruleName = ruleName;
        this.ruleCategory = ruleCategory;
        this.violationDetails = violationDetails;
    }
}
exports.BusinessRuleViolationError = BusinessRuleViolationError;
/**
 * Data consistency and integrity errors
 */
class DataIntegrityError extends BusinessLogicError {
    constructor(message, code, entityType, operation, integrityType, affectedEntities, options = {}) {
        super(message, code, entityType, operation, options);
        this.name = 'DataIntegrityError';
        this.integrityType = integrityType;
        this.affectedEntities = affectedEntities;
        this.constraintName = options.constraintName;
    }
}
exports.DataIntegrityError = DataIntegrityError;
/**
 * Configuration and setup errors
 */
class ConfigurationError extends BusinessLogicError {
    constructor(message, code, entityType, configurationArea, options = {}) {
        super(message, code, entityType, 'configure', {
            ...options,
            severity: 'error',
            isRecoverable: true
        });
        this.name = 'ConfigurationError';
        this.configurationArea = configurationArea;
        this.missingConfiguration = options.missingConfiguration || [];
        this.invalidConfiguration = options.invalidConfiguration || [];
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * Error factory for creating specific error types
 */
class ErrorFactory {
    /**
     * Create a validation error
     */
    static createValidationError(field, entityType, validationType, violatedRule, message, options) {
        const code = options?.code || `VALIDATION_${violatedRule.toUpperCase()}`;
        const errorMessage = message || `Validation failed for ${field}`;
        return new ValidationError(errorMessage, code, entityType, field, validationType, violatedRule, options);
    }
    /**
     * Create a workflow error
     */
    static createWorkflowError(workflowId, entityType, message, options) {
        const code = options?.code || 'WORKFLOW_EXECUTION_FAILED';
        const errorMessage = message || `Workflow ${workflowId} failed`;
        return new WorkflowError(errorMessage, code, entityType, workflowId, options);
    }
    /**
     * Create a permission error
     */
    static createPermissionError(entityType, operation, requiredPermissions, userPermissions, message, options) {
        const code = options?.code || 'INSUFFICIENT_PERMISSIONS';
        const errorMessage = message ||
            `Insufficient permissions for ${operation} on ${entityType}. Required: ${requiredPermissions.join(', ')}`;
        return new PermissionError(errorMessage, code, entityType, operation, requiredPermissions, userPermissions, options);
    }
    /**
     * Create a business rule violation error
     */
    static createBusinessRuleViolationError(entityType, operation, ruleName, ruleCategory, violationDetails, message, options) {
        const code = options?.code || `BUSINESS_RULE_VIOLATION_${ruleName.toUpperCase()}`;
        const errorMessage = message || `Business rule '${ruleName}' violated for ${entityType}`;
        return new BusinessRuleViolationError(errorMessage, code, entityType, operation, ruleName, ruleCategory, violationDetails, options);
    }
    /**
     * Create a data integrity error
     */
    static createDataIntegrityError(entityType, operation, integrityType, affectedEntities, message, options) {
        const code = options?.code || `DATA_INTEGRITY_${integrityType.toUpperCase()}`;
        const errorMessage = message || `Data integrity violation: ${integrityType} constraint failed`;
        return new DataIntegrityError(errorMessage, code, entityType, operation, integrityType, affectedEntities, options);
    }
    /**
     * Create a configuration error
     */
    static createConfigurationError(entityType, configurationArea, message, options) {
        const code = options?.code || 'CONFIGURATION_ERROR';
        const errorMessage = message || `Configuration error in ${configurationArea}`;
        return new ConfigurationError(errorMessage, code, entityType, configurationArea, options);
    }
}
exports.ErrorFactory = ErrorFactory;
/**
 * Error aggregator for collecting multiple errors
 */
class ErrorAggregator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }
    /**
     * Add an error to the aggregator
     */
    addError(error) {
        if (error.severity === 'warning' || error.severity === 'info') {
            this.warnings.push(error);
        }
        else {
            this.errors.push(error);
        }
    }
    /**
     * Add multiple errors
     */
    addErrors(errors) {
        errors.forEach(error => this.addError(error));
    }
    /**
     * Check if there are any errors
     */
    hasErrors() {
        return this.errors.length > 0;
    }
    /**
     * Check if there are any warnings
     */
    hasWarnings() {
        return this.warnings.length > 0;
    }
    /**
     * Get all errors
     */
    getErrors() {
        return [...this.errors];
    }
    /**
     * Get all warnings
     */
    getWarnings() {
        return [...this.warnings];
    }
    /**
     * Get all issues (errors and warnings)
     */
    getAllIssues() {
        return [...this.errors, ...this.warnings];
    }
    /**
     * Get errors by entity type
     */
    getErrorsByEntity(entityType) {
        return this.errors.filter(error => error.entityType === entityType);
    }
    /**
     * Get errors by field
     */
    getErrorsByField(field) {
        return this.errors.filter(error => error.field === field);
    }
    /**
     * Clear all errors and warnings
     */
    clear() {
        this.errors = [];
        this.warnings = [];
    }
    /**
     * Create a summary of all issues
     */
    getSummary() {
        const allIssues = this.getAllIssues();
        const errorsByType = {};
        const errorsByEntity = {};
        allIssues.forEach(issue => {
            errorsByType[issue.name] = (errorsByType[issue.name] || 0) + 1;
            errorsByEntity[issue.entityType] = (errorsByEntity[issue.entityType] || 0) + 1;
        });
        const recoverableErrors = this.errors.filter(error => error.isRecoverable).length;
        return {
            totalErrors: this.errors.length,
            totalWarnings: this.warnings.length,
            errorsByType,
            errorsByEntity,
            recoverableErrors
        };
    }
}
exports.ErrorAggregator = ErrorAggregator;
//# sourceMappingURL=BusinessLogicErrors.js.map