/**
 * Core onboarding service that orchestrates the customer onboarding workflow
 */

import { v4 as uuidv4 } from 'uuid';
import { AutotaskClient } from 'autotask-node';
import { createLogger } from '../../shared/utils/logger';
import { 
  CustomerData, 
  OnboardingWorkflow, 
  WorkflowStep, 
  OnboardingTemplate,
  OnboardingReport,
  OnboardingMetrics 
} from '../types/onboarding';
import { CompanyService } from './CompanyService';
import { ContactService } from './ContactService';
import { LocationService } from './LocationService';
import { ContractService } from './ContractService';
import { TicketService } from './TicketService';
import { NotificationService } from './NotificationService';

const logger = createLogger('onboarding-service');

export class OnboardingService {
  private autotaskClient: AutotaskClient;
  private companyService: CompanyService;
  private contactService: ContactService;
  private locationService: LocationService;
  private contractService: ContractService;
  private ticketService: TicketService;
  private notificationService: NotificationService;
  
  // In-memory storage for workflows (use database in production)
  private workflows: Map<string, OnboardingWorkflow> = new Map();
  private templates: Map<string, OnboardingTemplate> = new Map();

  constructor(autotaskClient: AutotaskClient) {
    this.autotaskClient = autotaskClient;
    this.companyService = new CompanyService(autotaskClient);
    this.contactService = new ContactService(autotaskClient);
    this.locationService = new LocationService(autotaskClient);
    this.contractService = new ContractService(autotaskClient);
    this.ticketService = new TicketService(autotaskClient);
    this.notificationService = new NotificationService();
    
    this.initializeDefaultTemplate();
  }

  /**
   * Start a new customer onboarding workflow
   */
  async startOnboarding(customerData: CustomerData, templateId?: string): Promise<OnboardingWorkflow> {
    const workflowId = uuidv4();
    logger.info(`Starting onboarding workflow ${workflowId} for customer ${customerData.companyName}`);

    try {
      // Get template or use default
      const template = templateId ? this.templates.get(templateId) : this.getDefaultTemplate();
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Create workflow
      const workflow: OnboardingWorkflow = {
        id: workflowId,
        name: `Onboarding: ${customerData.companyName}`,
        description: `Customer onboarding workflow for ${customerData.companyName}`,
        status: 'running',
        steps: this.createWorkflowSteps(template),
        startedAt: new Date(),
        createdBy: 'system',
        customerData,
        createdEntities: {},
        notifications: [],
        metadata: {
          templateId: template.id,
          templateVersion: template.version,
        },
      };

      this.workflows.set(workflowId, workflow);

      // Execute workflow asynchronously
      this.executeWorkflow(workflowId).catch(error => {
        logger.error(`Workflow ${workflowId} execution failed:`, error);
        this.markWorkflowFailed(workflowId, error);
      });

      return workflow;
    } catch (error) {
      logger.error(`Failed to start onboarding workflow:`, error);
      throw error;
    }
  }

  /**
   * Execute the workflow steps
   */
  private async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    logger.info(`Executing workflow ${workflowId} with ${workflow.steps.length} steps`);

    try {
      // Execute steps in order
      for (const step of workflow.steps) {
        await this.executeWorkflowStep(workflowId, step.id);
        
        // Check for failure
        const updatedWorkflow = this.workflows.get(workflowId);
        if (updatedWorkflow?.status === 'failed') {
          throw new Error(`Workflow failed at step ${step.name}`);
        }

        // Small delay between steps
        await this.delay(1000);
      }

      // Mark workflow as completed
      this.markWorkflowCompleted(workflowId);
      logger.info(`Workflow ${workflowId} completed successfully`);

    } catch (error) {
      logger.error(`Workflow ${workflowId} execution failed:`, error);
      this.markWorkflowFailed(workflowId, error);
      throw error;
    }
  }

  /**
   * Execute a specific workflow step
   */
  private async executeWorkflowStep(workflowId: string, stepId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found in workflow ${workflowId}`);
    }

    logger.info(`Executing step ${step.name} for workflow ${workflowId}`);

    try {
      // Update step status
      step.status = 'in-progress';
      step.startedAt = new Date();

      // Execute step based on ID
      switch (step.id) {
        case 'create_company':
          await this.executeCreateCompanyStep(workflow, step);
          break;
        case 'create_primary_contact':
          await this.executeCreatePrimaryContactStep(workflow, step);
          break;
        case 'create_additional_contacts':
          await this.executeCreateAdditionalContactsStep(workflow, step);
          break;
        case 'create_locations':
          await this.executeCreateLocationsStep(workflow, step);
          break;
        case 'create_contracts':
          await this.executeCreateContractsStep(workflow, step);
          break;
        case 'create_welcome_tickets':
          await this.executeCreateWelcomeTicketsStep(workflow, step);
          break;
        case 'send_notifications':
          await this.executeSendNotificationsStep(workflow, step);
          break;
        case 'finalize_setup':
          await this.executeFinalizeSetupStep(workflow, step);
          break;
        default:
          throw new Error(`Unknown step type: ${step.id}`);
      }

      // Mark step as completed
      step.status = 'completed';
      step.completedAt = new Date();
      
      logger.info(`Step ${step.name} completed for workflow ${workflowId}`);

    } catch (error) {
      logger.error(`Step ${step.name} failed for workflow ${workflowId}:`, error);
      
      // Mark step as failed
      step.status = 'failed';
      step.completedAt = new Date();
      step.error = error instanceof Error ? error.message : 'Unknown error';
      
      throw error;
    }
  }

  /**
   * Create company in Autotask
   */
  private async executeCreateCompanyStep(workflow: OnboardingWorkflow, step: WorkflowStep): Promise<void> {
    const { customerData } = workflow;
    
    const company = await this.companyService.createCompany({
      CompanyName: customerData.companyName,
      CompanyType: customerData.companyType || 1, // Customer
      Phone: customerData.phone,
      Fax: customerData.fax,
      WebAddress: customerData.website,
      // Add more fields as needed
    });

    workflow.createdEntities.companyId = company.id;
    step.metadata = { companyId: company.id, companyName: company.CompanyName };
  }

  /**
   * Create primary contact
   */
  private async executeCreatePrimaryContactStep(workflow: OnboardingWorkflow, step: WorkflowStep): Promise<void> {
    const { customerData, createdEntities } = workflow;
    
    if (!createdEntities.companyId) {
      throw new Error('Company must be created before contacts');
    }

    const contact = await this.contactService.createContact({
      CompanyID: createdEntities.companyId,
      FirstName: customerData.primaryContact.firstName,
      LastName: customerData.primaryContact.lastName,
      Title: customerData.primaryContact.title,
      EmailAddress: customerData.primaryContact.email,
      Phone: customerData.primaryContact.phone,
      MobilePhone: customerData.primaryContact.mobile,
    });

    if (!workflow.createdEntities.contactIds) {
      workflow.createdEntities.contactIds = [];
    }
    workflow.createdEntities.contactIds.push(contact.id);
    
    step.metadata = { contactId: contact.id, contactName: `${contact.FirstName} ${contact.LastName}` };
  }

  /**
   * Create additional contacts
   */
  private async executeCreateAdditionalContactsStep(workflow: OnboardingWorkflow, step: WorkflowStep): Promise<void> {
    const { customerData, createdEntities } = workflow;
    
    if (!createdEntities.companyId) {
      throw new Error('Company must be created before additional contacts');
    }

    if (!customerData.additionalContacts || customerData.additionalContacts.length === 0) {
      step.status = 'skipped';
      return;
    }

    const contactIds: number[] = [];
    
    for (const contactData of customerData.additionalContacts) {
      const contact = await this.contactService.createContact({
        CompanyID: createdEntities.companyId,
        FirstName: contactData.firstName,
        LastName: contactData.lastName,
        Title: contactData.title,
        EmailAddress: contactData.email,
        Phone: contactData.phone,
        MobilePhone: contactData.mobile,
      });
      
      contactIds.push(contact.id);
    }

    if (!workflow.createdEntities.contactIds) {
      workflow.createdEntities.contactIds = [];
    }
    workflow.createdEntities.contactIds.push(...contactIds);
    
    step.metadata = { 
      contactIds, 
      contactCount: contactIds.length 
    };
  }

  /**
   * Create locations
   */
  private async executeCreateLocationsStep(workflow: OnboardingWorkflow, step: WorkflowStep): Promise<void> {
    const { customerData, createdEntities } = workflow;
    
    if (!createdEntities.companyId) {
      throw new Error('Company must be created before locations');
    }

    const locationIds: number[] = [];
    
    for (const locationData of customerData.locations) {
      const location = await this.locationService.createLocation({
        CompanyID: createdEntities.companyId,
        Name: locationData.name,
        Address1: locationData.address1,
        Address2: locationData.address2,
        City: locationData.city,
        State: locationData.state,
        PostalCode: locationData.zipCode,
        Country: locationData.country,
        Phone: locationData.phone,
        Primary: locationData.isPrimary || false,
      });
      
      locationIds.push(location.id);
    }

    workflow.createdEntities.locationIds = locationIds;
    step.metadata = { 
      locationIds, 
      locationCount: locationIds.length 
    };
  }

  /**
   * Create contracts
   */
  private async executeCreateContractsStep(workflow: OnboardingWorkflow, step: WorkflowStep): Promise<void> {
    const { customerData, createdEntities } = workflow;
    
    if (!createdEntities.companyId) {
      throw new Error('Company must be created before contracts');
    }

    // For demo purposes, create a basic support contract
    const contract = await this.contractService.createContract({
      AccountID: createdEntities.companyId,
      ContractName: `Support Contract - ${customerData.companyName}`,
      ContractType: 1, // Support contract
      Status: 1, // Active
      StartDate: new Date(),
      // Add more contract details as needed
    });

    if (!workflow.createdEntities.contractIds) {
      workflow.createdEntities.contractIds = [];
    }
    workflow.createdEntities.contractIds.push(contract.id);
    
    step.metadata = { 
      contractId: contract.id, 
      contractName: contract.ContractName 
    };
  }

  /**
   * Create welcome tickets
   */
  private async executeCreateWelcomeTicketsStep(workflow: OnboardingWorkflow, step: WorkflowStep): Promise<void> {
    const { customerData, createdEntities } = workflow;
    
    if (!createdEntities.companyId) {
      throw new Error('Company must be created before tickets');
    }

    const ticketIds: number[] = [];
    
    // Create welcome ticket
    const welcomeTicket = await this.ticketService.createTicket({
      CompanyID: createdEntities.companyId,
      Title: `Welcome to Our Services - ${customerData.companyName}`,
      Description: `Welcome ${customerData.companyName}! This ticket has been created to track your initial setup and onboarding process.`,
      QueueID: 1, // Use appropriate queue
      Status: 1, // New
      Priority: 2, // Normal
      IssueType: 1, // General
      TicketType: 1, // Service Request
      Source: 1, // Internal
      ContactID: createdEntities.contactIds?.[0], // Primary contact
    });
    
    ticketIds.push(welcomeTicket.id);

    // Create service-specific tickets
    for (const service of customerData.services) {
      const serviceTicket = await this.ticketService.createTicket({
        CompanyID: createdEntities.companyId,
        Title: `Service Setup: ${service.serviceType}`,
        Description: `Setup ticket for ${service.serviceType} service: ${service.description}`,
        QueueID: 1, // Use appropriate queue
        Status: 1, // New
        Priority: this.mapPriorityToAutotask(service.priority),
        IssueType: 1, // General
        TicketType: 1, // Service Request
        Source: 1, // Internal
        ContactID: createdEntities.contactIds?.[0], // Primary contact
      });
      
      ticketIds.push(serviceTicket.id);
    }

    workflow.createdEntities.ticketIds = ticketIds;
    step.metadata = { 
      ticketIds, 
      ticketCount: ticketIds.length 
    };
  }

  /**
   * Send notifications
   */
  private async executeSendNotificationsStep(workflow: OnboardingWorkflow, step: WorkflowStep): Promise<void> {
    const { customerData } = workflow;
    
    // Send welcome email to primary contact
    await this.notificationService.sendWelcomeEmail(
      customerData.primaryContact.email,
      customerData.primaryContact.firstName,
      customerData.companyName
    );

    // Send internal notification
    await this.notificationService.sendInternalNotification(
      'New Customer Onboarded',
      `${customerData.companyName} has been successfully onboarded with all initial setup completed.`
    );

    step.metadata = { 
      emailsSent: 2,
      recipients: [customerData.primaryContact.email, 'internal@company.com']
    };
  }

  /**
   * Finalize setup
   */
  private async executeFinalizeSetupStep(workflow: OnboardingWorkflow, step: WorkflowStep): Promise<void> {
    // Perform any final setup tasks
    // This could include generating reports, updating CRM, etc.
    
    step.metadata = { 
      finalizedAt: new Date().toISOString(),
      summary: 'Onboarding process completed successfully'
    };
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): OnboardingWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): OnboardingWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflow metrics
   */
  getMetrics(): OnboardingMetrics {
    const workflows = Array.from(this.workflows.values());
    const completed = workflows.filter(w => w.status === 'completed');
    const failed = workflows.filter(w => w.status === 'failed');
    
    const avgCompletionTime = completed.length > 0 
      ? completed.reduce((sum, w) => {
          const duration = w.completedAt && w.startedAt 
            ? w.completedAt.getTime() - w.startedAt.getTime() 
            : 0;
          return sum + duration;
        }, 0) / completed.length / (1000 * 60) // Convert to minutes
      : 0;

    return {
      totalOnboardings: workflows.length,
      completedOnboardings: completed.length,
      failedOnboardings: failed.length,
      averageCompletionTime: avgCompletionTime,
      stepSuccessRates: this.calculateStepSuccessRates(workflows),
      commonFailurePoints: this.getCommonFailurePoints(workflows),
      timeToFirstValue: 0, // Would be calculated based on actual metrics
    };
  }

  /**
   * Helper methods
   */
  private initializeDefaultTemplate(): void {
    const defaultTemplate: OnboardingTemplate = {
      id: 'default',
      name: 'Standard Onboarding',
      description: 'Standard customer onboarding workflow',
      version: '1.0.0',
      steps: [
        {
          id: 'create_company',
          name: 'Create Company',
          description: 'Create company record in Autotask',
          order: 1,
          type: 'create_company',
          configuration: {},
          isRequired: true,
          estimatedDuration: 2,
        },
        {
          id: 'create_primary_contact',
          name: 'Create Primary Contact',
          description: 'Create primary contact for the company',
          order: 2,
          type: 'create_contacts',
          configuration: {},
          dependencies: ['create_company'],
          isRequired: true,
          estimatedDuration: 1,
        },
        {
          id: 'create_additional_contacts',
          name: 'Create Additional Contacts',
          description: 'Create any additional contacts',
          order: 3,
          type: 'create_contacts',
          configuration: {},
          dependencies: ['create_company'],
          isRequired: false,
          estimatedDuration: 5,
        },
        {
          id: 'create_locations',
          name: 'Create Locations',
          description: 'Create location records',
          order: 4,
          type: 'create_locations',
          configuration: {},
          dependencies: ['create_company'],
          isRequired: true,
          estimatedDuration: 3,
        },
        {
          id: 'create_contracts',
          name: 'Create Contracts',
          description: 'Create service contracts',
          order: 5,
          type: 'create_contract',
          configuration: {},
          dependencies: ['create_company'],
          isRequired: false,
          estimatedDuration: 5,
        },
        {
          id: 'create_welcome_tickets',
          name: 'Create Welcome Tickets',
          description: 'Create initial service tickets',
          order: 6,
          type: 'create_tickets',
          configuration: {},
          dependencies: ['create_company', 'create_primary_contact'],
          isRequired: true,
          estimatedDuration: 10,
        },
        {
          id: 'send_notifications',
          name: 'Send Notifications',
          description: 'Send welcome and notification emails',
          order: 7,
          type: 'send_notifications',
          configuration: {},
          dependencies: ['create_primary_contact'],
          isRequired: true,
          estimatedDuration: 2,
        },
        {
          id: 'finalize_setup',
          name: 'Finalize Setup',
          description: 'Complete final setup tasks',
          order: 8,
          type: 'custom',
          configuration: {},
          dependencies: ['create_welcome_tickets'],
          isRequired: true,
          estimatedDuration: 1,
        },
      ],
      defaultServices: [],
      customFields: [],
      notifications: [],
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set('default', defaultTemplate);
  }

  private createWorkflowSteps(template: OnboardingTemplate): WorkflowStep[] {
    return template.steps.map(stepTemplate => ({
      id: stepTemplate.id,
      name: stepTemplate.name,
      description: stepTemplate.description,
      order: stepTemplate.order,
      status: 'pending',
      metadata: stepTemplate.configuration,
    }));
  }

  private getDefaultTemplate(): OnboardingTemplate {
    return this.templates.get('default')!;
  }

  private markWorkflowCompleted(workflowId: string): void {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'completed';
      workflow.completedAt = new Date();
    }
  }

  private markWorkflowFailed(workflowId: string, error: any): void {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'failed';
      workflow.completedAt = new Date();
      workflow.metadata = {
        ...workflow.metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private mapPriorityToAutotask(priority: string): number {
    switch (priority.toLowerCase()) {
      case 'low': return 4;
      case 'medium': return 2;
      case 'high': return 1;
      case 'critical': return 1;
      default: return 2;
    }
  }

  private calculateStepSuccessRates(workflows: OnboardingWorkflow[]): { [stepName: string]: number } {
    const stepStats: { [stepName: string]: { total: number; successful: number } } = {};
    
    workflows.forEach(workflow => {
      workflow.steps.forEach(step => {
        if (!stepStats[step.name]) {
          stepStats[step.name] = { total: 0, successful: 0 };
        }
        stepStats[step.name].total++;
        if (step.status === 'completed') {
          stepStats[step.name].successful++;
        }
      });
    });

    const successRates: { [stepName: string]: number } = {};
    Object.keys(stepStats).forEach(stepName => {
      const stats = stepStats[stepName];
      successRates[stepName] = stats.total > 0 ? (stats.successful / stats.total) * 100 : 0;
    });

    return successRates;
  }

  private getCommonFailurePoints(workflows: OnboardingWorkflow[]): { step: string; count: number }[] {
    const failureCounts: { [stepName: string]: number } = {};
    
    workflows.forEach(workflow => {
      workflow.steps.forEach(step => {
        if (step.status === 'failed') {
          failureCounts[step.name] = (failureCounts[step.name] || 0) + 1;
        }
      });
    });

    return Object.entries(failureCounts)
      .map(([step, count]) => ({ step, count }))
      .sort((a, b) => b.count - a.count);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}