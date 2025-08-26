import { EntityValidator, ValidationResult, ValidationError } from '../index';

/**
 * Entity-level validators for business rules and state consistency
 */

export abstract class BaseEntityValidator implements EntityValidator {
  abstract name: string;
  abstract entityType: string;
  
  abstract validate(entity: any, context?: any): ValidationResult;
  
  protected createError(
    field: string,
    message: string,
    code: string,
    suggestedFix?: string,
    context?: Record<string, any>
  ): ValidationError {
    return {
      field,
      message,
      code,
      severity: 'error' as const,
      suggestedFix,
      context
    };
  }
  
  protected createWarning(
    field: string,
    message: string,
    code: string,
    suggestedAction?: string
  ) {
    return {
      field,
      message,
      code,
      suggestedAction
    };
  }
}

export class TicketStatusWorkflowValidator extends BaseEntityValidator {
  name = 'ticketStatusWorkflow';
  entityType = 'Tickets';
  
  private readonly validTransitions = new Map<number, number[]>([
    // New -> In Progress, Complete, Waiting Customer, Waiting Materials
    [1, [2, 5, 6, 13]],
    // In Progress -> Complete, Waiting Customer, Waiting Materials
    [2, [5, 6, 13]],
    // Complete -> (terminal state - no transitions allowed)
    [5, []],
    // Waiting Customer -> In Progress, Complete
    [6, [2, 5]],
    // Waiting Materials -> In Progress, Complete
    [13, [2, 5]]
  ]);
  
  validate(entity: any, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    // Check if status transition is valid
    if (context?.previousEntity?.status && entity.status !== context.previousEntity.status) {
      const fromStatus = context.previousEntity.status;
      const toStatus = entity.status;
      
      const allowedTransitions = this.validTransitions.get(fromStatus) || [];
      
      if (!allowedTransitions.includes(toStatus)) {
        errors.push(this.createError(
          'status',
          `Invalid status transition from ${fromStatus} to ${toStatus}`,
          'TICKET_INVALID_STATUS_TRANSITION',
          `Valid transitions from status ${fromStatus} are: ${allowedTransitions.join(', ')}`,
          { fromStatus, toStatus, allowedTransitions }
        ));
      }
    }
    
    // Complete tickets must have resolution
    if (entity.status === 5 && !entity.resolution) {
      errors.push(this.createError(
        'resolution',
        'Resolution is required when marking ticket as complete',
        'TICKET_COMPLETE_REQUIRES_RESOLUTION',
        'Add a resolution description before completing the ticket'
      ));
    }
    
    // In Progress tickets should have an assigned resource
    if (entity.status === 2 && !entity.assignedResourceID) {
      warnings.push(this.createWarning(
        'assignedResourceID',
        'In Progress tickets should have an assigned resource',
        'TICKET_INPROGRESS_NO_RESOURCE',
        'Consider assigning a resource to track accountability'
      ));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class TicketSLAValidator extends BaseEntityValidator {
  name = 'ticketSLA';
  entityType = 'Tickets';
  
  validate(entity: any, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    // High priority tickets should have due dates
    if (entity.priority >= 3 && !entity.dueDateTime) {
      warnings.push(this.createWarning(
        'dueDateTime',
        'High priority tickets should have due dates for SLA tracking',
        'TICKET_HIGH_PRIORITY_NO_DUE_DATE',
        'Set a due date based on your SLA requirements'
      ));
    }
    
    // Check if due date is in the past for active tickets
    if (entity.dueDateTime && entity.status !== 5) {
      const dueDate = new Date(entity.dueDateTime);
      const now = new Date();
      
      if (dueDate < now) {
        warnings.push(this.createWarning(
          'dueDateTime',
          'This ticket is overdue according to its SLA',
          'TICKET_OVERDUE',
          'Consider escalating or updating the due date'
        ));
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class CompanyHierarchyValidator extends BaseEntityValidator {
  name = 'companyHierarchy';
  entityType = 'Companies';
  
  validate(entity: any, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    // Parent company cannot be itself
    if (entity.parentCompanyID === entity.id) {
      errors.push(this.createError(
        'parentCompanyID',
        'A company cannot be its own parent',
        'COMPANY_CIRCULAR_PARENT_REFERENCE',
        'Select a different parent company or leave blank for top-level company'
      ));
    }
    
    // Active companies should have valid addresses
    if (entity.isActive && (!entity.address1 || !entity.city || !entity.postalCode)) {
      warnings.push(this.createWarning(
        'address',
        'Active companies should have complete address information',
        'COMPANY_INCOMPLETE_ADDRESS',
        'Complete the address fields for better customer communication'
      ));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class ContactMultiCompanyValidator extends BaseEntityValidator {
  name = 'contactMultiCompany';
  entityType = 'Contacts';
  
  validate(entity: any, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    // Active contacts must have email addresses
    if (entity.isActive && !entity.emailAddress) {
      errors.push(this.createError(
        'emailAddress',
        'Active contacts must have an email address',
        'CONTACT_ACTIVE_NO_EMAIL',
        'Add an email address or set the contact as inactive'
      ));
    }
    
    // Primary contact validation
    if (entity.isPrimaryContact && !entity.companyID) {
      errors.push(this.createError(
        'companyID',
        'Primary contacts must be associated with a company',
        'CONTACT_PRIMARY_NO_COMPANY',
        'Assign the contact to a company before marking as primary'
      ));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class TimeEntryBillingValidator extends BaseEntityValidator {
  name = 'timeEntryBilling';
  entityType = 'TimeEntries';
  
  validate(entity: any, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    // Billable entries must have billing codes
    if (entity.isBillable && !entity.billingCodeID) {
      errors.push(this.createError(
        'billingCodeID',
        'Billable time entries must have a billing code',
        'TIMEENTRY_BILLABLE_NO_CODE',
        'Select an appropriate billing code for this billable time'
      ));
    }
    
    // Time entries should not exceed 24 hours
    if (entity.hoursWorked > 24) {
      warnings.push(this.createWarning(
        'hoursWorked',
        'Time entry exceeds 24 hours - please verify this is correct',
        'TIMEENTRY_EXCESSIVE_HOURS',
        'Consider splitting long work sessions across multiple days'
      ));
    }
    
    // Future time entries should be flagged
    const entryDate = new Date(entity.dateWorked);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (entryDate > today) {
      warnings.push(this.createWarning(
        'dateWorked',
        'Time entry is dated in the future',
        'TIMEENTRY_FUTURE_DATE',
        'Verify the date is correct or adjust to the actual work date'
      ));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class ContractServiceValidator extends BaseEntityValidator {
  name = 'contractService';
  entityType = 'Contracts';
  
  validate(entity: any, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    // Active contracts must have end dates
    if (entity.status === 'Active' && !entity.endDate) {
      warnings.push(this.createWarning(
        'endDate',
        'Active contracts should have defined end dates',
        'CONTRACT_ACTIVE_NO_END_DATE',
        'Set an end date to track contract renewals properly'
      ));
    }
    
    // Contract value should be positive for paid services
    if (entity.contractValue !== undefined && entity.contractValue < 0) {
      errors.push(this.createError(
        'contractValue',
        'Contract value cannot be negative',
        'CONTRACT_NEGATIVE_VALUE',
        'Enter a positive value or zero for no-charge contracts'
      ));
    }
    
    // End date should be after start date
    if (entity.startDate && entity.endDate) {
      const start = new Date(entity.startDate);
      const end = new Date(entity.endDate);
      
      if (end <= start) {
        errors.push(this.createError(
          'endDate',
          'Contract end date must be after start date',
          'CONTRACT_INVALID_DATE_RANGE',
          'Set an end date that comes after the start date'
        ));
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class ProjectResourceValidator extends BaseEntityValidator {
  name = 'projectResource';
  entityType = 'Projects';
  
  validate(entity: any, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    // Active projects should have project managers
    if (entity.status === 'Active' && !entity.projectManagerResourceID) {
      warnings.push(this.createWarning(
        'projectManagerResourceID',
        'Active projects should have assigned project managers',
        'PROJECT_NO_MANAGER',
        'Assign a project manager to ensure proper oversight'
      ));
    }
    
    // Project end date should be after start date
    if (entity.startDateTime && entity.endDateTime) {
      const start = new Date(entity.startDateTime);
      const end = new Date(entity.endDateTime);
      
      if (end <= start) {
        errors.push(this.createError(
          'endDateTime',
          'Project end date must be after start date',
          'PROJECT_INVALID_DATE_RANGE',
          'Set an end date that comes after the start date'
        ));
      }
    }
    
    // Budget validation
    if (entity.budget !== undefined && entity.budget < 0) {
      errors.push(this.createError(
        'budget',
        'Project budget cannot be negative',
        'PROJECT_NEGATIVE_BUDGET',
        'Enter a positive budget value or zero for no budget limit'
      ));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}