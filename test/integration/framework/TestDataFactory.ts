import { TestEnvironment } from './TestEnvironment';

/**
 * Test data factory for creating safe test data
 */
export class TestDataFactory {
  private testEnvironment: TestEnvironment;
  private testSessionId: string;

  constructor(testEnvironment: TestEnvironment) {
    this.testEnvironment = testEnvironment;
    this.testSessionId = testEnvironment.getTestSession();
  }

  /**
   * Create test account data
   */
  createAccountData(overrides: any = {}) {
    const timestamp = Date.now();
    return {
      accountName: `Test Account ${this.testSessionId.slice(-4)} - ${timestamp}`,
      accountType: 1, // Customer
      phone: '555-0123',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'United States',
      webAddress: 'https://test.example.com',
      ...overrides,
    };
  }

  /**
   * Create test contact data
   */
  createContactData(accountId: number, overrides: any = {}) {
    const timestamp = Date.now();
    return {
      firstName: 'Test',
      lastName: `Contact-${this.testSessionId.slice(-4)}-${timestamp}`,
      emailAddress: `test.contact.${timestamp}@example.com`,
      accountId,
      isActive: true,
      phone: '555-0124',
      ...overrides,
    };
  }

  /**
   * Create test ticket data
   */
  createTicketData(accountId: number, overrides: any = {}) {
    const timestamp = Date.now();
    return {
      title: `Integration Test Ticket ${this.testSessionId.slice(-4)} - ${timestamp}`,
      description: `This is a test ticket created by integration tests at ${new Date().toISOString()}`,
      accountId,
      status: 1, // New
      priority: 3, // Normal
      issueType: 1,
      subIssueType: 1,
      queueId: 1,
      ...overrides,
    };
  }

  /**
   * Create test project data
   */
  createProjectData(accountId: number, overrides: any = {}) {
    const timestamp = Date.now();
    return {
      projectName: `Test Project ${this.testSessionId.slice(-4)} - ${timestamp}`,
      accountId,
      type: 1, // Project
      status: 1, // New
      startDateTime: new Date().toISOString(),
      description: `Test project created by integration tests at ${new Date().toISOString()}`,
      ...overrides,
    };
  }

  /**
   * Create test task data
   */
  createTaskData(projectId: number, overrides: any = {}) {
    const timestamp = Date.now();
    return {
      title: `Test Task ${this.testSessionId.slice(-4)} - ${timestamp}`,
      projectId,
      status: 1, // New
      priority: 3, // Normal
      description: `Test task created by integration tests at ${new Date().toISOString()}`,
      estimatedHours: 2,
      ...overrides,
    };
  }

  /**
   * Create test time entry data
   */
  createTimeEntryData(taskId: number, resourceId: number, overrides: any = {}) {
    const timestamp = Date.now();
    const today = new Date();
    return {
      taskId,
      resourceId,
      dateWorked: today.toISOString().split('T')[0],
      startDateTime: today.toISOString(),
      endDateTime: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      hoursWorked: 2.0,
      description: `Test time entry ${this.testSessionId.slice(-4)} - ${timestamp}`,
      ...overrides,
    };
  }

  /**
   * Create minimal safe test data based on environment
   */
  createSafeTestData(entityType: string, parentIds: any = {}) {
    const config = this.testEnvironment.getConfig();
    
    // For production readonly, create minimal data that won't be persisted
    if (!config.allowCreate) {
      return this.createMinimalTestData(entityType, parentIds);
    }

    // For environments that allow creation, create full test data
    switch (entityType) {
      case 'account':
        return this.createAccountData();
      case 'contact':
        return this.createContactData(parentIds.accountId);
      case 'ticket':
        return this.createTicketData(parentIds.accountId);
      case 'project':
        return this.createProjectData(parentIds.accountId);
      case 'task':
        return this.createTaskData(parentIds.projectId);
      case 'timeentry':
        return this.createTimeEntryData(parentIds.taskId, parentIds.resourceId);
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Create minimal test data for validation only
   */
  private createMinimalTestData(entityType: string, parentIds: any = {}) {
    const timestamp = Date.now();
    
    switch (entityType) {
      case 'account':
        return {
          accountName: `Validation Test Account - ${timestamp}`,
          accountType: 1,
        };
      case 'contact':
        return {
          firstName: 'Test',
          lastName: `Validation-${timestamp}`,
          emailAddress: `validation.${timestamp}@example.com`,
          accountId: parentIds.accountId || 1,
        };
      case 'ticket':
        return {
          title: `Validation Test Ticket - ${timestamp}`,
          accountId: parentIds.accountId || 1,
          status: 1,
          description: 'Minimal validation test data',
        };
      default:
        return {};
    }
  }

  /**
   * Generate test data with business rule compliance
   */
  async createCompliantTestData(entityType: string, parentIds: any = {}) {
    const businessLogic = this.testEnvironment.getBusinessLogic();
    const baseData = this.createSafeTestData(entityType, parentIds);

    // Apply business rule validation if available
    try {
      const validationResult = await businessLogic.validateEntity(entityType, baseData);
      
      if (!validationResult.isValid) {
        console.warn(`Test data validation warnings for ${entityType}:`, validationResult.errors);
        // Attempt to fix common validation issues
        return this.fixValidationIssues(entityType, baseData, validationResult.errors);
      }

      return baseData;
    } catch (error) {
      // If validation fails, return basic data
      console.warn(`Business logic validation failed for ${entityType}, using basic data:`, error);
      return baseData;
    }
  }

  /**
   * Fix common validation issues in test data
   */
  private fixValidationIssues(entityType: string, data: any, errors: string[]): any {
    const fixedData = { ...data };

    for (const error of errors) {
      // Fix common issues based on error patterns
      if (error.includes('required') && error.includes('email')) {
        fixedData.emailAddress = fixedData.emailAddress || `required.${Date.now()}@example.com`;
      }
      
      if (error.includes('required') && error.includes('phone')) {
        fixedData.phone = fixedData.phone || '555-0123';
      }
      
      if (error.includes('status') && error.includes('invalid')) {
        fixedData.status = 1; // Default to active/new status
      }
    }

    return fixedData;
  }

  /**
   * Create test data with relationships for complex scenarios
   */
  async createRelatedTestData() {
    const client = this.testEnvironment.getClient();
    const relatedData: any = {};

    try {
      // Create account first (if creation is allowed)
      if (this.testEnvironment.isOperationAllowed('create')) {
        const accountData = this.createAccountData();
        const account = await client.accounts.create(accountData);
        relatedData.account = account.data;
        this.testEnvironment.registerCreatedEntity('accounts', account.data.id);

        // Create contact for the account
        const contactData = this.createContactData(account.data.id);
        const contact = await client.contacts.create(contactData);
        relatedData.contact = contact.data;
        this.testEnvironment.registerCreatedEntity('contacts', contact.data.id);

        // Create project for the account
        const projectData = this.createProjectData(account.data.id);
        const project = await client.projects.create(projectData);
        relatedData.project = project.data;
        this.testEnvironment.registerCreatedEntity('projects', project.data.id);
      } else {
        // For read-only environments, use existing data or mock data
        relatedData.account = { id: 1, accountName: 'Mock Account' };
        relatedData.contact = { id: 1, firstName: 'Mock', lastName: 'Contact' };
        relatedData.project = { id: 1, projectName: 'Mock Project' };
      }

      return relatedData;
    } catch (error) {
      console.error('Failed to create related test data:', error);
      throw error;
    }
  }
}
