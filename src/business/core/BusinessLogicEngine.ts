import { ValidationEngine } from './ValidationEngine';
import { WorkflowEngine } from './WorkflowEngine';
import {
  ValidationResult,
  TicketStatusWorkflowValidator,
  TicketSLAValidator,
  CompanyHierarchyValidator,
  ContactMultiCompanyValidator,
  TimeEntryBillingValidator,
  ContractServiceValidator,
  ProjectResourceValidator,
  TicketCompanyContactValidator,
  TimeEntryProjectTicketValidator,
  ContractCompanyServiceValidator,
  ProjectCompanyResourceValidator,
  RequiredValidator,
  EmailValidator,
  PhoneValidator,
  DateRangeValidator,
  NumericRangeValidator
} from '../validation';

/**
 * Central business logic engine that coordinates validation, workflows, and business rules
 */
export class BusinessLogicEngine {
  private validationEngine: ValidationEngine;
  private workflowEngine: WorkflowEngine;
  private initialized = false;
  
  constructor() {
    this.validationEngine = new ValidationEngine();
    this.workflowEngine = new WorkflowEngine();
  }
  
  /**
   * Initialize the business logic engine with default validators and rules
   */
  initialize(): void {
    if (this.initialized) return;
    
    this.setupFieldValidators();
    this.setupEntityValidators();
    this.setupCrossEntityValidators();
    this.setupWorkflows();
    
    this.initialized = true;
  }
  
  /**
   * Setup field-level validators for common fields
   */
  private setupFieldValidators(): void {
    // Email validations
    this.validationEngine.registerFieldValidator(
      'Contacts', 'emailAddress', new EmailValidator()
    );
    this.validationEngine.registerFieldValidator(
      'Resources', 'emailAddress', new EmailValidator()
    );
    
    // Phone validations
    this.validationEngine.registerFieldValidator(
      'Contacts', 'phone', new PhoneValidator()
    );
    this.validationEngine.registerFieldValidator(
      'Companies', 'phone', new PhoneValidator()
    );
    
    // Required field validations
    this.validationEngine.registerFieldValidator(
      'Tickets', 'title', new RequiredValidator()
    );
    this.validationEngine.registerFieldValidator(
      'Companies', 'companyName', new RequiredValidator()
    );
    this.validationEngine.registerFieldValidator(
      'Contacts', 'firstName', new RequiredValidator()
    );
    this.validationEngine.registerFieldValidator(
      'Contacts', 'lastName', new RequiredValidator()
    );
    this.validationEngine.registerFieldValidator(
      'TimeEntries', 'hoursWorked', new RequiredValidator()
    );
    this.validationEngine.registerFieldValidator(
      'TimeEntries', 'dateWorked', new RequiredValidator()
    );
    
    // Numeric range validations
    this.validationEngine.registerFieldValidator(
      'TimeEntries', 'hoursWorked', 
      new NumericRangeValidator({ min: 0, max: 24 })
    );
    this.validationEngine.registerFieldValidator(
      'Tickets', 'priority', 
      new NumericRangeValidator({ min: 1, max: 4 })
    );
    
    // Date range validations
    const today = new Date();
    const futureLimit = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate());
    
    this.validationEngine.registerFieldValidator(
      'Contracts', 'endDate',
      new DateRangeValidator({ minDate: today, maxDate: futureLimit })
    );
    this.validationEngine.registerFieldValidator(
      'Projects', 'endDateTime',
      new DateRangeValidator({ minDate: today, maxDate: futureLimit })
    );
  }
  
  /**
   * Setup entity-level validators
   */
  private setupEntityValidators(): void {
    // Ticket validators
    this.validationEngine.registerEntityValidator(new TicketStatusWorkflowValidator());
    this.validationEngine.registerEntityValidator(new TicketSLAValidator());
    
    // Company validators
    this.validationEngine.registerEntityValidator(new CompanyHierarchyValidator());
    
    // Contact validators
    this.validationEngine.registerEntityValidator(new ContactMultiCompanyValidator());
    
    // Time entry validators
    this.validationEngine.registerEntityValidator(new TimeEntryBillingValidator());
    
    // Contract validators
    this.validationEngine.registerEntityValidator(new ContractServiceValidator());
    
    // Project validators
    this.validationEngine.registerEntityValidator(new ProjectResourceValidator());
  }
  
  /**
   * Setup cross-entity validators
   */
  private setupCrossEntityValidators(): void {
    this.validationEngine.registerCrossEntityValidator(new TicketCompanyContactValidator());
    this.validationEngine.registerCrossEntityValidator(new TimeEntryProjectTicketValidator());
    this.validationEngine.registerCrossEntityValidator(new ContractCompanyServiceValidator());
    this.validationEngine.registerCrossEntityValidator(new ProjectCompanyResourceValidator());
  }
  
  /**
   * Setup business workflows
   */
  private setupWorkflows(): void {
    // This will be implemented when we create the WorkflowEngine
    // For now, just placeholder
  }
  
  /**
   * Validate an entity operation (create, update, delete)
   */
  async validateOperation(
    operation: 'create' | 'update' | 'delete',
    entityType: string,
    entity: any,
    context?: {
      previousEntity?: any;
      relatedEntities?: Record<string, any>;
      user?: any;
      permissions?: string[];
    }
  ): Promise<ValidationResult> {
    this.initialize();
    
    const operationContext = {
      ...context,
      operation,
      [`isNew${entityType}`]: operation === 'create'
    };
    
    return this.validationEngine.validateComplete(
      entityType,
      entity,
      context?.relatedEntities || {},
      operationContext
    );
  }
  
  /**
   * Process business rules for an entity operation
   */
  async processBusinessRules(
    operation: 'create' | 'update' | 'delete',
    entityType: string,
    entity: any,
    context?: any
  ): Promise<{
    isAllowed: boolean;
    validationResult: ValidationResult;
    transformedEntity?: any;
    suggestedActions?: string[];
  }> {
    const validationResult = await this.validateOperation(operation, entityType, entity, context);
    
    // Apply business transformations
    const transformedEntity = await this.applyBusinessTransformations(
      entityType, entity, context
    );
    
    // Generate suggested actions based on validation results
    const suggestedActions = this.generateSuggestedActions(validationResult);
    
    return {
      isAllowed: validationResult.isValid,
      validationResult,
      transformedEntity,
      suggestedActions
    };
  }
  
  /**
   * Apply business-specific transformations to entities
   */
  private async applyBusinessTransformations(
    entityType: string,
    entity: any,
    context?: any
  ): Promise<any> {
    const transformed = { ...entity };
    
    switch (entityType) {
      case 'Tickets':
        return this.transformTicket(transformed, context);
      case 'TimeEntries':
        return this.transformTimeEntry(transformed, context);
      case 'Contracts':
        return this.transformContract(transformed, context);
      default:
        return transformed;
    }
  }
  
  /**
   * Apply ticket-specific business transformations
   */
  private transformTicket(ticket: any, context?: any): any {
    const transformed = { ...ticket };
    
    // Auto-set create date if not provided
    if (!transformed.createDate) {
      transformed.createDate = new Date().toISOString();
    }
    
    // Auto-assign based on queue rules (simplified)
    if (!transformed.assignedResourceID && transformed.queueID) {
      // This would typically query available resources
      // For now, just flag for manual assignment
      transformed._needsResourceAssignment = true;
    }
    
    // Set SLA due date for high priority tickets
    if (transformed.priority >= 3 && !transformed.dueDateTime) {
      const now = new Date();
      const slaHours = transformed.priority === 4 ? 2 : 8; // Critical: 2hrs, High: 8hrs
      const dueDate = new Date(now.getTime() + slaHours * 60 * 60 * 1000);
      transformed.dueDateTime = dueDate.toISOString();
    }
    
    return transformed;
  }
  
  /**
   * Apply time entry-specific business transformations
   */
  private transformTimeEntry(timeEntry: any, context?: any): any {
    const transformed = { ...timeEntry };
    
    // Auto-calculate billing amounts if rates are available
    if (transformed.isBillable && transformed.hoursWorked && context?.billingRate) {
      transformed.billingAmount = transformed.hoursWorked * context.billingRate;
    }
    
    // Round hours to nearest quarter hour
    if (transformed.hoursWorked) {
      transformed.hoursWorked = Math.round(transformed.hoursWorked * 4) / 4;
    }
    
    return transformed;
  }
  
  /**
   * Apply contract-specific business transformations
   */
  private transformContract(contract: any, context?: any): any {
    const transformed = { ...contract };
    
    // Auto-calculate end date if contract period is specified
    if (transformed.startDate && transformed.contractPeriodMonths && !transformed.endDate) {
      const startDate = new Date(transformed.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + transformed.contractPeriodMonths);
      transformed.endDate = endDate.toISOString();
    }
    
    return transformed;
  }
  
  /**
   * Generate suggested actions based on validation results
   */
  private generateSuggestedActions(validationResult: ValidationResult): string[] {
    const actions: string[] = [];
    
    // Add actions based on error types
    validationResult.errors.forEach(error => {
      if (error.suggestedFix) {
        actions.push(error.suggestedFix);
      }
    });
    
    // Add actions based on warning types
    validationResult.warnings.forEach(warning => {
      if (warning.suggestedAction) {
        actions.push(warning.suggestedAction);
      }
    });
    
    return [...new Set(actions)]; // Remove duplicates
  }
  
  /**
   * Get validation engine instance for custom validation
   */
  getValidationEngine(): ValidationEngine {
    this.initialize();
    return this.validationEngine;
  }
  
  /**
   * Get workflow engine instance for custom workflows
   */
  getWorkflowEngine(): WorkflowEngine {
    this.initialize();
    return this.workflowEngine;
  }
}