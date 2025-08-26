/**
 * Autotask-specific business rules and configurations
 * 
 * This file contains the comprehensive business rules that govern
 * Autotask entity behavior, workflows, and validations.
 */

import { BusinessRule } from './index';

/**
 * Autotask business rules registry
 */
export class AutotaskBusinessRules {
  private static rules = new Map<string, BusinessRule>();
  
  /**
   * Initialize default Autotask business rules
   */
  static initialize(): void {
    this.registerTicketRules();
    this.registerTimeEntryRules();
    this.registerContractRules();
    this.registerCompanyRules();
    this.registerContactRules();
    this.registerProjectRules();
  }
  
  /**
   * Register a business rule
   */
  static registerRule(rule: BusinessRule): void {
    this.rules.set(rule.id, rule);
  }
  
  /**
   * Get a business rule by ID
   */
  static getRule(ruleId: string): BusinessRule | undefined {
    return this.rules.get(ruleId);
  }
  
  /**
   * Get all rules for an entity type
   */
  static getRulesForEntity(entityType: string): BusinessRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.entityType === entityType);
  }
  
  /**
   * Get rules by type
   */
  static getRulesByType(ruleType: string): BusinessRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.ruleType === ruleType);
  }
  
  /**
   * Register ticket-specific business rules
   */
  private static registerTicketRules(): void {
    // Ticket status transition rules
    this.registerRule({
      id: 'ticket_status_transition',
      name: 'Ticket Status Transition Rules',
      description: 'Enforce valid ticket status transitions',
      entityType: 'Tickets',
      ruleType: 'validation',
      enabled: true,
      priority: 100,
      conditions: [
        {
          field: 'status',
          operator: 'not_equals',
          value: null
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'status',
          formula: 'validateStatusTransition(previousStatus, newStatus)'
        }
      ]
    });
    
    // High priority ticket assignment
    this.registerRule({
      id: 'high_priority_assignment',
      name: 'High Priority Ticket Assignment',
      description: 'Auto-assign high priority tickets',
      entityType: 'Tickets',
      ruleType: 'automation',
      enabled: true,
      priority: 90,
      conditions: [
        {
          field: 'priority',
          operator: 'greater_than',
          value: 3
        },
        {
          field: 'assignedResourceID',
          operator: 'equals',
          value: null,
          logicalOperator: 'AND'
        }
      ],
      actions: [
        {
          type: 'trigger_workflow',
          target: 'assignedResourceID',
          workflowId: 'auto_assign_high_priority'
        }
      ]
    });
    
    // SLA due date calculation
    this.registerRule({
      id: 'sla_due_date_calculation',
      name: 'SLA Due Date Calculation',
      description: 'Automatically calculate SLA due dates based on priority',
      entityType: 'Tickets',
      ruleType: 'calculation',
      enabled: true,
      priority: 80,
      conditions: [
        {
          field: 'priority',
          operator: 'not_equals',
          value: null
        }
      ],
      actions: [
        {
          type: 'calculate',
          target: 'dueDateTime',
          formula: 'calculateSLADueDate(priority, createDate)'
        }
      ]
    });
    
    // Completion requires resolution
    this.registerRule({
      id: 'completion_requires_resolution',
      name: 'Completion Requires Resolution',
      description: 'Tickets must have resolution when marked complete',
      entityType: 'Tickets',
      ruleType: 'validation',
      enabled: true,
      priority: 100,
      conditions: [
        {
          field: 'status',
          operator: 'equals',
          value: 5 // Complete status
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'resolution',
          formula: 'required(resolution)'
        }
      ]
    });
  }
  
  /**
   * Register time entry business rules
   */
  private static registerTimeEntryRules(): void {
    // Billable time requires billing code
    this.registerRule({
      id: 'billable_requires_billing_code',
      name: 'Billable Time Requires Billing Code',
      description: 'Billable time entries must have a billing code',
      entityType: 'TimeEntries',
      ruleType: 'validation',
      enabled: true,
      priority: 100,
      conditions: [
        {
          field: 'isBillable',
          operator: 'equals',
          value: true
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'billingCodeID',
          formula: 'required(billingCodeID)'
        }
      ]
    });
    
    // Auto-calculate billing amounts
    this.registerRule({
      id: 'auto_calculate_billing',
      name: 'Auto Calculate Billing Amounts',
      description: 'Automatically calculate billing amounts for billable time',
      entityType: 'TimeEntries',
      ruleType: 'calculation',
      enabled: true,
      priority: 80,
      conditions: [
        {
          field: 'isBillable',
          operator: 'equals',
          value: true
        },
        {
          field: 'hoursWorked',
          operator: 'greater_than',
          value: 0,
          logicalOperator: 'AND'
        }
      ],
      actions: [
        {
          type: 'calculate',
          target: 'billingAmount',
          formula: 'hoursWorked * getBillingRate(resourceID, billingCodeID)'
        }
      ]
    });
    
    // Approval required for overtime
    this.registerRule({
      id: 'overtime_approval_required',
      name: 'Overtime Approval Required',
      description: 'Time entries over 8 hours require approval',
      entityType: 'TimeEntries',
      ruleType: 'workflow',
      enabled: true,
      priority: 90,
      conditions: [
        {
          field: 'hoursWorked',
          operator: 'greater_than',
          value: 8
        }
      ],
      actions: [
        {
          type: 'trigger_workflow',
          target: 'approvalStatus',
          workflowId: 'time_entry_approval'
        }
      ]
    });
  }
  
  /**
   * Register contract business rules
   */
  private static registerContractRules(): void {
    // Contract end date validation
    this.registerRule({
      id: 'contract_end_date_validation',
      name: 'Contract End Date Validation',
      description: 'Contract end date must be after start date',
      entityType: 'Contracts',
      ruleType: 'validation',
      enabled: true,
      priority: 100,
      conditions: [
        {
          field: 'startDate',
          operator: 'not_equals',
          value: null
        },
        {
          field: 'endDate',
          operator: 'not_equals',
          value: null,
          logicalOperator: 'AND'
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'endDate',
          formula: 'endDate > startDate'
        }
      ]
    });
    
    // Renewal notification
    this.registerRule({
      id: 'contract_renewal_notification',
      name: 'Contract Renewal Notification',
      description: 'Send renewal notifications 90 days before expiry',
      entityType: 'Contracts',
      ruleType: 'automation',
      enabled: true,
      priority: 70,
      conditions: [
        {
          field: 'endDate',
          operator: 'not_equals',
          value: null
        }
      ],
      actions: [
        {
          type: 'trigger_workflow',
          target: 'renewalNotification',
          workflowId: 'contract_renewal'
        }
      ]
    });
    
    // Active contract validation
    this.registerRule({
      id: 'active_contract_validation',
      name: 'Active Contract Validation',
      description: 'Active contracts must have valid dates and services',
      entityType: 'Contracts',
      ruleType: 'validation',
      enabled: true,
      priority: 90,
      conditions: [
        {
          field: 'status',
          operator: 'equals',
          value: 'Active'
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'startDate',
          formula: 'required(startDate) && startDate <= today()'
        },
        {
          type: 'validate',
          target: 'endDate',
          formula: 'required(endDate) && endDate > today()'
        }
      ]
    });
  }
  
  /**
   * Register company business rules
   */
  private static registerCompanyRules(): void {
    // Company hierarchy validation
    this.registerRule({
      id: 'company_hierarchy_validation',
      name: 'Company Hierarchy Validation',
      description: 'Prevent circular parent company references',
      entityType: 'Companies',
      ruleType: 'validation',
      enabled: true,
      priority: 100,
      conditions: [
        {
          field: 'parentCompanyID',
          operator: 'not_equals',
          value: null
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'parentCompanyID',
          formula: 'validateCompanyHierarchy(id, parentCompanyID)'
        }
      ]
    });
    
    // Active company address validation
    this.registerRule({
      id: 'active_company_address',
      name: 'Active Company Address Validation',
      description: 'Active companies should have complete address information',
      entityType: 'Companies',
      ruleType: 'validation',
      enabled: true,
      priority: 80,
      conditions: [
        {
          field: 'isActive',
          operator: 'equals',
          value: true
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'address1',
          formula: 'recommended(address1)'
        },
        {
          type: 'validate',
          target: 'city',
          formula: 'recommended(city)'
        },
        {
          type: 'validate',
          target: 'postalCode',
          formula: 'recommended(postalCode)'
        }
      ]
    });
  }
  
  /**
   * Register contact business rules
   */
  private static registerContactRules(): void {
    // Active contact email validation
    this.registerRule({
      id: 'active_contact_email',
      name: 'Active Contact Email Validation',
      description: 'Active contacts must have email addresses',
      entityType: 'Contacts',
      ruleType: 'validation',
      enabled: true,
      priority: 100,
      conditions: [
        {
          field: 'isActive',
          operator: 'equals',
          value: true
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'emailAddress',
          formula: 'required(emailAddress) && isValidEmail(emailAddress)'
        }
      ]
    });
    
    // Primary contact company association
    this.registerRule({
      id: 'primary_contact_company',
      name: 'Primary Contact Company Association',
      description: 'Primary contacts must be associated with a company',
      entityType: 'Contacts',
      ruleType: 'validation',
      enabled: true,
      priority: 90,
      conditions: [
        {
          field: 'isPrimaryContact',
          operator: 'equals',
          value: true
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'companyID',
          formula: 'required(companyID)'
        }
      ]
    });
  }
  
  /**
   * Register project business rules
   */
  private static registerProjectRules(): void {
    // Project date validation
    this.registerRule({
      id: 'project_date_validation',
      name: 'Project Date Validation',
      description: 'Project end date must be after start date',
      entityType: 'Projects',
      ruleType: 'validation',
      enabled: true,
      priority: 100,
      conditions: [
        {
          field: 'startDateTime',
          operator: 'not_equals',
          value: null
        },
        {
          field: 'endDateTime',
          operator: 'not_equals',
          value: null,
          logicalOperator: 'AND'
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'endDateTime',
          formula: 'endDateTime > startDateTime'
        }
      ]
    });
    
    // Active project manager assignment
    this.registerRule({
      id: 'active_project_manager',
      name: 'Active Project Manager Assignment',
      description: 'Active projects should have project managers',
      entityType: 'Projects',
      ruleType: 'validation',
      enabled: true,
      priority: 80,
      conditions: [
        {
          field: 'status',
          operator: 'equals',
          value: 'Active'
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'projectManagerResourceID',
          formula: 'recommended(projectManagerResourceID)'
        }
      ]
    });
    
    // Budget validation
    this.registerRule({
      id: 'project_budget_validation',
      name: 'Project Budget Validation',
      description: 'Project budget cannot be negative',
      entityType: 'Projects',
      ruleType: 'validation',
      enabled: true,
      priority: 90,
      conditions: [
        {
          field: 'budget',
          operator: 'not_equals',
          value: null
        }
      ],
      actions: [
        {
          type: 'validate',
          target: 'budget',
          formula: 'budget >= 0'
        }
      ]
    });
  }
}

// Initialize rules on module load
AutotaskBusinessRules.initialize();