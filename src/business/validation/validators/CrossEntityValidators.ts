import { CrossEntityValidator, ValidationResult, ValidationError } from '../index';

/**
 * Cross-entity validators for relationships and referential integrity
 */

export abstract class BaseCrossEntityValidator implements CrossEntityValidator {
  abstract name: string;
  abstract entities: string[];
  
  abstract validate(entities: Record<string, any>, context?: any): ValidationResult;
  
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

export class TicketCompanyContactValidator extends BaseCrossEntityValidator {
  name = 'ticketCompanyContact';
  entities = ['Tickets', 'Companies', 'Contacts'];
  
  validate(entities: Record<string, any>, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    const ticket = entities.Tickets;
    const company = entities.Companies;
    const contact = entities.Contacts;
    
    if (!ticket) return { isValid: true, errors: [], warnings: [] };
    
    // If ticket has a contact, validate the contact belongs to the ticket's company
    if (ticket.contactID && ticket.companyID && contact) {
      if (contact.companyID !== ticket.companyID) {
        errors.push(this.createError(
          'contactID',
          'Selected contact does not belong to the ticket company',
          'TICKET_CONTACT_COMPANY_MISMATCH',
          'Choose a contact from the same company as the ticket',
          {
            ticketCompanyID: ticket.companyID,
            contactCompanyID: contact.companyID
          }
        ));
      }
    }
    
    // Validate company is active if creating new tickets
    if (context?.isNewTicket && company && !company.isActive) {
      warnings.push(this.createWarning(
        'companyID',
        'Creating ticket for inactive company',
        'TICKET_INACTIVE_COMPANY',
        'Consider reactivating the company or verify this is intentional'
      ));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class TimeEntryProjectTicketValidator extends BaseCrossEntityValidator {
  name = 'timeEntryProjectTicket';
  entities = ['TimeEntries', 'Projects', 'Tickets'];
  
  validate(entities: Record<string, any>, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    const timeEntry = entities.TimeEntries;
    const project = entities.Projects;
    const ticket = entities.Tickets;
    
    if (!timeEntry) return { isValid: true, errors: [], warnings: [] };
    
    // Time entry cannot have both project and ticket
    if (timeEntry.projectID && timeEntry.ticketID) {
      errors.push(this.createError(
        'projectID',
        'Time entry cannot be associated with both a project and a ticket',
        'TIMEENTRY_DUAL_ASSOCIATION',
        'Select either a project OR a ticket, not both'
      ));
    }
    
    // If associated with project, validate project is active
    if (timeEntry.projectID && project && project.status !== 'Active') {
      warnings.push(this.createWarning(
        'projectID',
        'Time entry is associated with inactive project',
        'TIMEENTRY_INACTIVE_PROJECT',
        'Verify this time entry is for the correct project'
      ));
    }
    
    // If associated with ticket, validate ticket is not complete
    if (timeEntry.ticketID && ticket && ticket.status === 5) {
      warnings.push(this.createWarning(
        'ticketID',
        'Adding time to completed ticket',
        'TIMEENTRY_COMPLETED_TICKET',
        'Consider if this time should be logged against a different ticket'
      ));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class ContractCompanyServiceValidator extends BaseCrossEntityValidator {
  name = 'contractCompanyService';
  entities = ['Contracts', 'Companies', 'Services'];
  
  validate(entities: Record<string, any>, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    const contract = entities.Contracts;
    const company = entities.Companies;
    const services = entities.Services; // Array of services
    
    if (!contract) return { isValid: true, errors: [], warnings: [] };
    
    // Validate company is active for new contracts
    if (context?.isNewContract && company && !company.isActive) {
      warnings.push(this.createWarning(
        'companyID',
        'Creating contract for inactive company',
        'CONTRACT_INACTIVE_COMPANY',
        'Consider reactivating the company first'
      ));
    }
    
    // Validate contract has at least one service for paid contracts
    if (contract.contractValue > 0 && (!services || services.length === 0)) {
      warnings.push(this.createWarning(
        'services',
        'Paid contract should include defined services',
        'CONTRACT_PAID_NO_SERVICES',
        'Add services to clarify what is included in this contract'
      ));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class ProjectCompanyResourceValidator extends BaseCrossEntityValidator {
  name = 'projectCompanyResource';
  entities = ['Projects', 'Companies', 'Resources'];
  
  validate(entities: Record<string, any>, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    const project = entities.Projects;
    const company = entities.Companies;
    const projectManager = entities.Resources;
    
    if (!project) return { isValid: true, errors: [], warnings: [] };
    
    // Validate company is active for new projects
    if (context?.isNewProject && company && !company.isActive) {
      warnings.push(this.createWarning(
        'companyID',
        'Creating project for inactive company',
        'PROJECT_INACTIVE_COMPANY',
        'Verify this is intentional or reactivate the company'
      ));
    }
    
    // Validate project manager is active
    if (project.projectManagerResourceID && projectManager && !projectManager.isActive) {
      warnings.push(this.createWarning(
        'projectManagerResourceID',
        'Project manager is inactive',
        'PROJECT_INACTIVE_MANAGER',
        'Consider assigning an active project manager'
      ));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class BillingCodeContractValidator extends BaseCrossEntityValidator {
  name = 'billingCodeContract';
  entities = ['BillingCodes', 'Contracts', 'TimeEntries'];
  
  validate(entities: Record<string, any>, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    const billingCode = entities.BillingCodes;
    const contract = entities.Contracts;
    const timeEntry = entities.TimeEntries;
    
    if (!timeEntry) return { isValid: true, errors: [], warnings: [] };
    
    // If time entry is billable and has contract, validate billing code is allowed
    if (timeEntry.isBillable && timeEntry.contractID && billingCode && contract) {
      // This would require contract billing rules validation
      // For now, we'll just warn about potential mismatches
      if (billingCode.isExcludedFromNewContracts && context?.isNewContract) {
        warnings.push(this.createWarning(
          'billingCodeID',
          'Selected billing code is typically excluded from new contracts',
          'BILLING_CODE_CONTRACT_EXCLUSION',
          'Verify this billing code is appropriate for this contract'
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

export class ConfigurationItemCompanyValidator extends BaseCrossEntityValidator {
  name = 'configurationItemCompany';
  entities = ['ConfigurationItems', 'Companies', 'Contacts'];
  
  validate(entities: Record<string, any>, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    const configItem = entities.ConfigurationItems;
    const company = entities.Companies;
    const contact = entities.Contacts;
    
    if (!configItem) return { isValid: true, errors: [], warnings: [] };
    
    // Configuration items should have company associations
    if (!configItem.companyID && !configItem.accountID) {
      warnings.push(this.createWarning(
        'companyID',
        'Configuration item should be associated with a company',
        'CONFIG_ITEM_NO_COMPANY',
        'Associate with a company for better asset tracking'
      ));
    }
    
    // If has contact, validate contact belongs to same company
    if (configItem.contactID && configItem.companyID && contact) {
      if (contact.companyID !== configItem.companyID) {
        errors.push(this.createError(
          'contactID',
          'Contact must belong to the same company as the configuration item',
          'CONFIG_ITEM_CONTACT_COMPANY_MISMATCH',
          'Select a contact from the associated company'
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

export class ServiceCallResourceValidator extends BaseCrossEntityValidator {
  name = 'serviceCallResource';
  entities = ['ServiceCalls', 'Resources', 'Tickets'];
  
  validate(entities: Record<string, any>, context?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];
    
    const serviceCall = entities.ServiceCalls;
    const resource = entities.Resources;
    const ticket = entities.Tickets;
    
    if (!serviceCall) return { isValid: true, errors: [], warnings: [] };
    
    // Service calls should have assigned resources
    if (serviceCall.status === 'Scheduled' && !serviceCall.resourceID) {
      warnings.push(this.createWarning(
        'resourceID',
        'Scheduled service calls should have assigned resources',
        'SERVICE_CALL_NO_RESOURCE',
        'Assign a resource to ensure proper scheduling'
      ));
    }
    
    // Validate assigned resource is active
    if (serviceCall.resourceID && resource && !resource.isActive) {
      warnings.push(this.createWarning(
        'resourceID',
        'Assigned resource is inactive',
        'SERVICE_CALL_INACTIVE_RESOURCE',
        'Consider assigning an active resource'
      ));
    }
    
    // If linked to ticket, validate ticket is appropriate for service call
    if (serviceCall.ticketID && ticket && ticket.status === 5) {
      warnings.push(this.createWarning(
        'ticketID',
        'Service call linked to completed ticket',
        'SERVICE_CALL_COMPLETED_TICKET',
        'Verify this service call is still needed'
      ));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}