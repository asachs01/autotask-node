/**
 * Enhanced error handling for Autotask business logic operations
 * 
 * Provides detailed error information with business context,
 * suggested fixes, and recovery actions
 */

export class BusinessLogicError extends Error {
  public readonly code: string;
  public readonly entityType: string;
  public readonly operation: string;
  public readonly field?: string;
  public readonly suggestedFix?: string;
  public readonly recoveryActions?: string[];
  public readonly context?: Record<string, any>;
  public readonly severity: 'error' | 'warning' | 'info';
  public readonly isRecoverable: boolean;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: string,
    entityType: string,
    operation: string,
    options: {
      field?: string;
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
      severity?: 'error' | 'warning' | 'info';
      isRecoverable?: boolean;
      cause?: Error;
    } = {}
  ) {
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
  toObject(): Record<string, any> {
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
  getUserFriendlyMessage(): string {
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

/**
 * Validation-specific business logic errors
 */
export class ValidationError extends BusinessLogicError {
  public readonly validationType: 'field' | 'entity' | 'cross-entity';
  public readonly violatedRule: string;

  constructor(
    message: string,
    code: string,
    entityType: string,
    field: string,
    validationType: 'field' | 'entity' | 'cross-entity',
    violatedRule: string,
    options: {
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
      severity?: 'error' | 'warning' | 'info';
    } = {}
  ) {
    super(message, code, entityType, 'validate', {
      ...options,
      field
    });
    
    this.name = 'ValidationError';
    this.validationType = validationType;
    this.violatedRule = violatedRule;
  }
}

/**
 * Workflow-specific business logic errors
 */
export class WorkflowError extends BusinessLogicError {
  public readonly workflowId: string;
  public readonly stepId?: string;
  public readonly workflowStep?: string;

  constructor(
    message: string,
    code: string,
    entityType: string,
    workflowId: string,
    options: {
      stepId?: string;
      workflowStep?: string;
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
      cause?: Error;
    } = {}
  ) {
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

/**
 * Permissions and authorization errors
 */
export class PermissionError extends BusinessLogicError {
  public readonly requiredPermissions: string[];
  public readonly userPermissions: string[];
  public readonly resourceId?: string;

  constructor(
    message: string,
    code: string,
    entityType: string,
    operation: string,
    requiredPermissions: string[],
    userPermissions: string[],
    options: {
      resourceId?: string;
      suggestedFix?: string;
      context?: Record<string, any>;
    } = {}
  ) {
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

/**
 * Business rule violation errors
 */
export class BusinessRuleViolationError extends BusinessLogicError {
  public readonly ruleName: string;
  public readonly ruleCategory: string;
  public readonly violationDetails: Record<string, any>;

  constructor(
    message: string,
    code: string,
    entityType: string,
    operation: string,
    ruleName: string,
    ruleCategory: string,
    violationDetails: Record<string, any>,
    options: {
      field?: string;
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
      severity?: 'error' | 'warning' | 'info';
    } = {}
  ) {
    super(message, code, entityType, operation, options);
    
    this.name = 'BusinessRuleViolationError';
    this.ruleName = ruleName;
    this.ruleCategory = ruleCategory;
    this.violationDetails = violationDetails;
  }
}

/**
 * Data consistency and integrity errors
 */
export class DataIntegrityError extends BusinessLogicError {
  public readonly integrityType: 'referential' | 'constraint' | 'business' | 'temporal';
  public readonly affectedEntities: string[];
  public readonly constraintName?: string;

  constructor(
    message: string,
    code: string,
    entityType: string,
    operation: string,
    integrityType: 'referential' | 'constraint' | 'business' | 'temporal',
    affectedEntities: string[],
    options: {
      constraintName?: string;
      field?: string;
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
    } = {}
  ) {
    super(message, code, entityType, operation, options);
    
    this.name = 'DataIntegrityError';
    this.integrityType = integrityType;
    this.affectedEntities = affectedEntities;
    this.constraintName = options.constraintName;
  }
}

/**
 * Configuration and setup errors
 */
export class ConfigurationError extends BusinessLogicError {
  public readonly configurationArea: string;
  public readonly missingConfiguration: string[];
  public readonly invalidConfiguration: string[];

  constructor(
    message: string,
    code: string,
    entityType: string,
    configurationArea: string,
    options: {
      missingConfiguration?: string[];
      invalidConfiguration?: string[];
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
    } = {}
  ) {
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

/**
 * Error factory for creating specific error types
 */
export class ErrorFactory {
  /**
   * Create a validation error
   */
  static createValidationError(
    field: string,
    entityType: string,
    validationType: 'field' | 'entity' | 'cross-entity',
    violatedRule: string,
    message?: string,
    options?: {
      code?: string;
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
      severity?: 'error' | 'warning' | 'info';
    }
  ): ValidationError {
    const code = options?.code || `VALIDATION_${violatedRule.toUpperCase()}`;
    const errorMessage = message || `Validation failed for ${field}`;
    
    return new ValidationError(
      errorMessage,
      code,
      entityType,
      field,
      validationType,
      violatedRule,
      options
    );
  }

  /**
   * Create a workflow error
   */
  static createWorkflowError(
    workflowId: string,
    entityType: string,
    message?: string,
    options?: {
      code?: string;
      stepId?: string;
      workflowStep?: string;
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
      cause?: Error;
    }
  ): WorkflowError {
    const code = options?.code || 'WORKFLOW_EXECUTION_FAILED';
    const errorMessage = message || `Workflow ${workflowId} failed`;
    
    return new WorkflowError(errorMessage, code, entityType, workflowId, options);
  }

  /**
   * Create a permission error
   */
  static createPermissionError(
    entityType: string,
    operation: string,
    requiredPermissions: string[],
    userPermissions: string[],
    message?: string,
    options?: {
      code?: string;
      resourceId?: string;
      suggestedFix?: string;
      context?: Record<string, any>;
    }
  ): PermissionError {
    const code = options?.code || 'INSUFFICIENT_PERMISSIONS';
    const errorMessage = message || 
      `Insufficient permissions for ${operation} on ${entityType}. Required: ${requiredPermissions.join(', ')}`;
    
    return new PermissionError(
      errorMessage,
      code,
      entityType,
      operation,
      requiredPermissions,
      userPermissions,
      options
    );
  }

  /**
   * Create a business rule violation error
   */
  static createBusinessRuleViolationError(
    entityType: string,
    operation: string,
    ruleName: string,
    ruleCategory: string,
    violationDetails: Record<string, any>,
    message?: string,
    options?: {
      code?: string;
      field?: string;
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
      severity?: 'error' | 'warning' | 'info';
    }
  ): BusinessRuleViolationError {
    const code = options?.code || `BUSINESS_RULE_VIOLATION_${ruleName.toUpperCase()}`;
    const errorMessage = message || `Business rule '${ruleName}' violated for ${entityType}`;
    
    return new BusinessRuleViolationError(
      errorMessage,
      code,
      entityType,
      operation,
      ruleName,
      ruleCategory,
      violationDetails,
      options
    );
  }

  /**
   * Create a data integrity error
   */
  static createDataIntegrityError(
    entityType: string,
    operation: string,
    integrityType: 'referential' | 'constraint' | 'business' | 'temporal',
    affectedEntities: string[],
    message?: string,
    options?: {
      code?: string;
      constraintName?: string;
      field?: string;
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
    }
  ): DataIntegrityError {
    const code = options?.code || `DATA_INTEGRITY_${integrityType.toUpperCase()}`;
    const errorMessage = message || `Data integrity violation: ${integrityType} constraint failed`;
    
    return new DataIntegrityError(
      errorMessage,
      code,
      entityType,
      operation,
      integrityType,
      affectedEntities,
      options
    );
  }

  /**
   * Create a configuration error
   */
  static createConfigurationError(
    entityType: string,
    configurationArea: string,
    message?: string,
    options?: {
      code?: string;
      missingConfiguration?: string[];
      invalidConfiguration?: string[];
      suggestedFix?: string;
      recoveryActions?: string[];
      context?: Record<string, any>;
    }
  ): ConfigurationError {
    const code = options?.code || 'CONFIGURATION_ERROR';
    const errorMessage = message || `Configuration error in ${configurationArea}`;
    
    return new ConfigurationError(errorMessage, code, entityType, configurationArea, options);
  }
}

/**
 * Error aggregator for collecting multiple errors
 */
export class ErrorAggregator {
  private errors: BusinessLogicError[] = [];
  private warnings: BusinessLogicError[] = [];

  /**
   * Add an error to the aggregator
   */
  addError(error: BusinessLogicError): void {
    if (error.severity === 'warning' || error.severity === 'info') {
      this.warnings.push(error);
    } else {
      this.errors.push(error);
    }
  }

  /**
   * Add multiple errors
   */
  addErrors(errors: BusinessLogicError[]): void {
    errors.forEach(error => this.addError(error));
  }

  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Check if there are any warnings
   */
  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  /**
   * Get all errors
   */
  getErrors(): BusinessLogicError[] {
    return [...this.errors];
  }

  /**
   * Get all warnings
   */
  getWarnings(): BusinessLogicError[] {
    return [...this.warnings];
  }

  /**
   * Get all issues (errors and warnings)
   */
  getAllIssues(): BusinessLogicError[] {
    return [...this.errors, ...this.warnings];
  }

  /**
   * Get errors by entity type
   */
  getErrorsByEntity(entityType: string): BusinessLogicError[] {
    return this.errors.filter(error => error.entityType === entityType);
  }

  /**
   * Get errors by field
   */
  getErrorsByField(field: string): BusinessLogicError[] {
    return this.errors.filter(error => error.field === field);
  }

  /**
   * Clear all errors and warnings
   */
  clear(): void {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Create a summary of all issues
   */
  getSummary(): {
    totalErrors: number;
    totalWarnings: number;
    errorsByType: Record<string, number>;
    errorsByEntity: Record<string, number>;
    recoverableErrors: number;
  } {
    const allIssues = this.getAllIssues();
    
    const errorsByType: Record<string, number> = {};
    const errorsByEntity: Record<string, number> = {};
    
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