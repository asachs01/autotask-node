/**
 * Entity-Specific Business Rules for Autotask
 * 
 * Implements business rules specific to Autotask entities
 * like Tickets, Companies, Contacts, Projects, etc.
 */

import { BaseBusinessRule, BusinessRule, RuleContext, RulePriority } from './BusinessRule';
import { ValidationResult } from './ValidationResult';
import { RequiredFieldRule, PatternRule, RangeRule } from './BusinessRule';
import { ConditionalRequiredRule, DateRangeRule, DependentFieldsRule } from './CrossFieldRules';

/**
 * Ticket-specific validation rules
 */
export class TicketBusinessRules {
  static createRules(): BusinessRule[] {
    return [
      // Required fields for tickets
      new RequiredFieldRule(
        'ticket.required.fields',
        ['title', 'companyID', 'status', 'priority'],
        {
          description: 'Validates required fields for tickets',
          priority: RulePriority.CRITICAL,
          appliesTo: ['Ticket', 'tickets']
        }
      ),
      
      // Conditional required fields
      new ConditionalRequiredRule(
        'ticket.resolution.required',
        'status',
        'equals',
        'Complete',
        'resolution',
        {
          description: 'Resolution is required when ticket is complete',
          priority: RulePriority.HIGH,
          appliesTo: ['Ticket', 'tickets']
        }
      ),
      
      // Due date validation
      new DateRangeRule(
        'ticket.due.date.validation',
        'createDate',
        'dueDateTime',
        {
          allowEqual: false,
          minDuration: 0,
          description: 'Due date must be after creation date',
          priority: RulePriority.NORMAL,
          appliesTo: ['Ticket', 'tickets']
        }
      ),
      
      // Custom ticket status validation
      new TicketStatusTransitionRule(
        'ticket.status.transitions',
        {
          description: 'Validates valid ticket status transitions',
          priority: RulePriority.HIGH,
          appliesTo: ['Ticket', 'tickets']
        }
      ),
      
      // SLA validation
      new TicketSLARule(
        'ticket.sla.compliance',
        {
          description: 'Validates SLA compliance for tickets',
          priority: RulePriority.HIGH,
          appliesTo: ['Ticket', 'tickets']
        }
      )
    ];
  }
}

/**
 * Company-specific validation rules
 */
export class CompanyBusinessRules {
  static createRules(): BusinessRule[] {
    return [
      // Required fields for companies
      new RequiredFieldRule(
        'company.required.fields',
        ['companyName', 'companyType', 'ownerResourceID'],
        {
          description: 'Validates required fields for companies',
          priority: RulePriority.CRITICAL,
          appliesTo: ['Company', 'companies']
        }
      ),
      
      // Phone number validation
      new PatternRule(
        'company.phone.format',
        'phone',
        /^(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
        'Invalid phone number format',
        {
          description: 'Validates company phone number format',
          priority: RulePriority.LOW,
          appliesTo: ['Company', 'companies']
        }
      ),
      
      // Website URL validation
      new PatternRule(
        'company.website.format',
        'webSiteURL',
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        'Invalid website URL format',
        {
          description: 'Validates company website URL',
          priority: RulePriority.LOW,
          appliesTo: ['Company', 'companies']
        }
      ),
      
      // Tax ID validation
      new CompanyTaxIDRule(
        'company.tax.id.validation',
        {
          description: 'Validates company tax ID format',
          priority: RulePriority.NORMAL,
          appliesTo: ['Company', 'companies']
        }
      )
    ];
  }
}

/**
 * Contact-specific validation rules
 */
export class ContactBusinessRules {
  static createRules(): BusinessRule[] {
    return [
      // Required fields for contacts
      new RequiredFieldRule(
        'contact.required.fields',
        ['firstName', 'lastName', 'companyID'],
        {
          description: 'Validates required fields for contacts',
          priority: RulePriority.CRITICAL,
          appliesTo: ['Contact', 'contacts']
        }
      ),
      
      // Email validation
      new PatternRule(
        'contact.email.format',
        'emailAddress',
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Invalid email address format',
        {
          description: 'Validates contact email format',
          priority: RulePriority.HIGH,
          appliesTo: ['Contact', 'contacts']
        }
      ),
      
      // Phone number validation
      new PatternRule(
        'contact.phone.format',
        'phone',
        /^(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
        'Invalid phone number format',
        {
          description: 'Validates contact phone number format',
          priority: RulePriority.LOW,
          appliesTo: ['Contact', 'contacts']
        }
      ),
      
      // Dependent fields (alternative email requires primary email)
      new DependentFieldsRule(
        'contact.email.dependencies',
        'emailAddress',
        ['emailAddress2', 'emailAddress3'],
        {
          description: 'Alternative emails require primary email',
          priority: RulePriority.NORMAL,
          appliesTo: ['Contact', 'contacts']
        }
      )
    ];
  }
}

/**
 * Project-specific validation rules
 */
export class ProjectBusinessRules {
  static createRules(): BusinessRule[] {
    return [
      // Required fields for projects
      new RequiredFieldRule(
        'project.required.fields',
        ['projectName', 'companyID', 'type', 'status'],
        {
          description: 'Validates required fields for projects',
          priority: RulePriority.CRITICAL,
          appliesTo: ['Project', 'projects']
        }
      ),
      
      // Date range validation
      new DateRangeRule(
        'project.date.range',
        'startDateTime',
        'endDateTime',
        {
          allowEqual: false,
          minDuration: 1,
          description: 'Project end date must be after start date',
          priority: RulePriority.HIGH,
          appliesTo: ['Project', 'projects']
        }
      ),
      
      // Budget validation
      new RangeRule(
        'project.budget.range',
        'estimatedRevenue',
        {
          min: 0,
          description: 'Project budget must be positive',
          priority: RulePriority.NORMAL,
          appliesTo: ['Project', 'projects']
        }
      ),
      
      // Custom project validation
      new ProjectMilestoneRule(
        'project.milestone.validation',
        {
          description: 'Validates project milestones',
          priority: RulePriority.NORMAL,
          appliesTo: ['Project', 'projects']
        }
      )
    ];
  }
}

/**
 * Contract-specific validation rules
 */
export class ContractBusinessRules {
  static createRules(): BusinessRule[] {
    return [
      // Required fields for contracts
      new RequiredFieldRule(
        'contract.required.fields',
        ['contractName', 'accountID', 'contractType', 'status'],
        {
          description: 'Validates required fields for contracts',
          priority: RulePriority.CRITICAL,
          appliesTo: ['Contract', 'contracts']
        }
      ),
      
      // Date range validation
      new DateRangeRule(
        'contract.date.range',
        'startDate',
        'endDate',
        {
          allowEqual: false,
          minDuration: 1,
          maxDuration: 3650, // Max 10 years
          description: 'Contract date range validation',
          priority: RulePriority.HIGH,
          appliesTo: ['Contract', 'contracts']
        }
      ),
      
      // Contract value validation
      new ContractValueRule(
        'contract.value.validation',
        {
          description: 'Validates contract financial values',
          priority: RulePriority.HIGH,
          appliesTo: ['Contract', 'contracts']
        }
      )
    ];
  }
}

/**
 * Custom rule for ticket status transitions
 */
class TicketStatusTransitionRule extends BaseBusinessRule {
  private validTransitions: Map<string, string[]> = new Map([
    ['New', ['In Progress', 'Waiting Customer', 'Waiting Vendor']],
    ['In Progress', ['Waiting Customer', 'Waiting Vendor', 'Complete', 'New']],
    ['Waiting Customer', ['In Progress', 'Complete']],
    ['Waiting Vendor', ['In Progress', 'Complete']],
    ['Complete', []] // No transitions from Complete
  ]);
  
  async validate(entity: any, context?: RuleContext): Promise<ValidationResult> {
    const result = new ValidationResult();
    
    // Only validate on update operations
    if (context?.operation !== 'update' || !context.originalEntity) {
      return result;
    }
    
    const oldStatus = context.originalEntity.status;
    const newStatus = entity.status;
    
    if (oldStatus === newStatus) {
      return result; // No status change
    }
    
    const allowedTransitions = this.validTransitions.get(oldStatus) || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      result.addError(
        'INVALID_STATUS_TRANSITION',
        `Invalid status transition from '${oldStatus}' to '${newStatus}'`,
        ['status'],
        { 
          oldStatus, 
          newStatus, 
          allowedTransitions,
          entityType: context?.entityType 
        }
      );
    }
    
    return result;
  }
}

/**
 * Custom rule for ticket SLA compliance
 */
class TicketSLARule extends BaseBusinessRule {
  async validate(entity: any, context?: RuleContext): Promise<ValidationResult> {
    const result = new ValidationResult();
    
    // Check if ticket has SLA
    if (!entity.serviceLevelAgreementID) {
      return result; // No SLA assigned
    }
    
    // Check response time SLA
    if (entity.firstResponseDateTime && entity.createDate) {
      const responseTime = new Date(entity.firstResponseDateTime).getTime() - 
                          new Date(entity.createDate).getTime();
      const responseHours = responseTime / (1000 * 60 * 60);
      
      // This would normally check against actual SLA thresholds
      if (responseHours > 4) {
        result.addWarning(
          'SLA_RESPONSE_TIME_WARNING',
          'First response time may exceed SLA threshold',
          ['firstResponseDateTime'],
          { responseHours, entityType: context?.entityType }
        );
      }
    }
    
    // Check resolution time SLA
    if (entity.status === 'Complete' && entity.completedDate && entity.createDate) {
      const resolutionTime = new Date(entity.completedDate).getTime() - 
                            new Date(entity.createDate).getTime();
      const resolutionHours = resolutionTime / (1000 * 60 * 60);
      
      // This would normally check against actual SLA thresholds
      if (resolutionHours > 24) {
        result.addWarning(
          'SLA_RESOLUTION_TIME_WARNING',
          'Resolution time may exceed SLA threshold',
          ['completedDate'],
          { resolutionHours, entityType: context?.entityType }
        );
      }
    }
    
    return result;
  }
}

/**
 * Custom rule for company tax ID validation
 */
class CompanyTaxIDRule extends BaseBusinessRule {
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    
    if (!entity.taxID) {
      return result; // Tax ID is optional
    }
    
    const taxID = String(entity.taxID).replace(/[^0-9]/g, '');
    
    // US EIN validation (XX-XXXXXXX format)
    if (entity.countryID === 'US' || entity.countryID === 237) { // 237 is US country ID
      if (taxID.length !== 9) {
        result.addError(
          'INVALID_TAX_ID',
          'US Tax ID (EIN) must be 9 digits',
          ['taxID'],
          { taxID, entityType: context?.entityType }
        );
      }
    }
    
    // Add more country-specific validations as needed
    
    return result;
  }
}

/**
 * Custom rule for project milestone validation
 */
class ProjectMilestoneRule extends BaseBusinessRule {
  async validate(entity: any, context?: RuleContext): Promise<ValidationResult> {
    const result = new ValidationResult();
    
    // Check if project has milestones
    if (!entity.projectMilestones || entity.projectMilestones.length === 0) {
      if (entity.type === 'Fixed Fee' || entity.type === 'Milestone') {
        result.addWarning(
          'NO_MILESTONES',
          'Fixed fee and milestone projects should have defined milestones',
          ['projectMilestones'],
          { projectType: entity.type, entityType: context?.entityType }
        );
      }
      return result;
    }
    
    // Validate milestone dates are within project dates
    const projectStart = new Date(entity.startDateTime);
    const projectEnd = new Date(entity.endDateTime);
    
    for (const milestone of entity.projectMilestones) {
      const milestoneDate = new Date(milestone.dueDate);
      
      if (milestoneDate < projectStart || milestoneDate > projectEnd) {
        result.addError(
          'MILESTONE_DATE_OUT_OF_RANGE',
          `Milestone '${milestone.title}' date is outside project date range`,
          ['projectMilestones'],
          { 
            milestone: milestone.title,
            milestoneDate,
            projectStart,
            projectEnd,
            entityType: context?.entityType 
          }
        );
      }
    }
    
    return result;
  }
}

/**
 * Custom rule for contract value validation
 */
class ContractValueRule extends BaseBusinessRule {
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    
    // Validate setup fee
    if (entity.setupFee !== undefined && entity.setupFee < 0) {
      result.addError(
        'NEGATIVE_SETUP_FEE',
        'Setup fee cannot be negative',
        ['setupFee'],
        { setupFee: entity.setupFee, entityType: context?.entityType }
      );
    }
    
    // Validate contract value
    if (entity.contractValue !== undefined && entity.contractValue < 0) {
      result.addError(
        'NEGATIVE_CONTRACT_VALUE',
        'Contract value cannot be negative',
        ['contractValue'],
        { contractValue: entity.contractValue, entityType: context?.entityType }
      );
    }
    
    // Validate billing period amounts
    if (entity.contractType === 'Recurring Service') {
      if (!entity.billingPeriod) {
        result.addError(
          'MISSING_BILLING_PERIOD',
          'Recurring service contracts require a billing period',
          ['billingPeriod'],
          { entityType: context?.entityType }
        );
      }
      
      if (entity.recurringRevenue !== undefined && entity.recurringRevenue <= 0) {
        result.addError(
          'INVALID_RECURRING_REVENUE',
          'Recurring revenue must be positive for recurring service contracts',
          ['recurringRevenue'],
          { recurringRevenue: entity.recurringRevenue, entityType: context?.entityType }
        );
      }
    }
    
    return result;
  }
}

/**
 * Task-specific validation rules
 */
export class TaskBusinessRules {
  static createRules(): BusinessRule[] {
    return [
      // Required fields for tasks
      new RequiredFieldRule(
        'task.required.fields',
        ['title', 'projectID', 'status', 'assignedResourceID'],
        {
          description: 'Validates required fields for tasks',
          priority: RulePriority.CRITICAL,
          appliesTo: ['Task', 'tasks']
        }
      ),
      
      // Date range validation
      new DateRangeRule(
        'task.date.range',
        'startDateTime',
        'endDateTime',
        {
          allowEqual: true,
          minDuration: 0,
          description: 'Task end date must be after or equal to start date',
          priority: RulePriority.HIGH,
          appliesTo: ['Task', 'tasks']
        }
      ),
      
      // Estimated hours validation
      new RangeRule(
        'task.estimated.hours',
        'estimatedHours',
        {
          min: 0,
          max: 999,
          description: 'Estimated hours must be between 0 and 999',
          priority: RulePriority.NORMAL,
          appliesTo: ['Task', 'tasks']
        }
      )
    ];
  }
}

/**
 * Time entry validation rules
 */
export class TimeEntryBusinessRules {
  static createRules(): BusinessRule[] {
    return [
      // Required fields for time entries
      new RequiredFieldRule(
        'timeentry.required.fields',
        ['resourceID', 'dateWorked', 'hoursWorked'],
        {
          description: 'Validates required fields for time entries',
          priority: RulePriority.CRITICAL,
          appliesTo: ['TimeEntry', 'timeentries']
        }
      ),
      
      // Hours worked validation
      new RangeRule(
        'timeentry.hours.range',
        'hoursWorked',
        {
          min: 0.25,
          max: 24,
          description: 'Hours worked must be between 0.25 and 24',
          priority: RulePriority.HIGH,
          appliesTo: ['TimeEntry', 'timeentries']
        }
      ),
      
      // Future date validation
      new TimeEntryDateRule(
        'timeentry.date.validation',
        {
          description: 'Validates time entry dates',
          priority: RulePriority.HIGH,
          appliesTo: ['TimeEntry', 'timeentries']
        }
      )
    ];
  }
}

/**
 * Custom rule for time entry date validation
 */
class TimeEntryDateRule extends BaseBusinessRule {
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    
    if (!entity.dateWorked) {
      return result;
    }
    
    const dateWorked = new Date(entity.dateWorked);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Check for future dates
    if (dateWorked > today) {
      result.addError(
        'FUTURE_TIME_ENTRY',
        'Time entries cannot be created for future dates',
        ['dateWorked'],
        { dateWorked, today, entityType: context?.entityType }
      );
    }
    
    // Check for very old dates (more than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    if (dateWorked < ninetyDaysAgo) {
      result.addWarning(
        'OLD_TIME_ENTRY',
        'Time entry is more than 90 days old',
        ['dateWorked'],
        { dateWorked, ninetyDaysAgo, entityType: context?.entityType }
      );
    }
    
    return result;
  }
}

/**
 * Factory class to create entity-specific rules
 */
export class EntityRuleFactory {
  private static ruleMap: Map<string, () => BusinessRule[]> = new Map([
    ['Ticket', TicketBusinessRules.createRules],
    ['tickets', TicketBusinessRules.createRules],
    ['Company', CompanyBusinessRules.createRules],
    ['companies', CompanyBusinessRules.createRules],
    ['Contact', ContactBusinessRules.createRules],
    ['contacts', ContactBusinessRules.createRules],
    ['Project', ProjectBusinessRules.createRules],
    ['projects', ProjectBusinessRules.createRules],
    ['Contract', ContractBusinessRules.createRules],
    ['contracts', ContractBusinessRules.createRules],
    ['Task', TaskBusinessRules.createRules],
    ['tasks', TaskBusinessRules.createRules],
    ['TimeEntry', TimeEntryBusinessRules.createRules],
    ['timeentries', TimeEntryBusinessRules.createRules]
  ]);
  
  /**
   * Get rules for a specific entity type
   */
  static getRulesForEntity(entityType: string): BusinessRule[] {
    const factory = this.ruleMap.get(entityType);
    return factory ? factory() : [];
  }
  
  /**
   * Get all available entity rules
   */
  static getAllRules(): Map<string, BusinessRule[]> {
    const allRules = new Map<string, BusinessRule[]>();
    
    for (const [entityType, factory] of this.ruleMap) {
      allRules.set(entityType, factory());
    }
    
    return allRules;
  }
  
  /**
   * Register custom rules for an entity type
   */
  static registerEntityRules(entityType: string, rulesFactory: () => BusinessRule[]): void {
    this.ruleMap.set(entityType, rulesFactory);
  }
}