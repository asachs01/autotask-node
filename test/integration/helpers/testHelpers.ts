import { AutotaskClient } from '../../../src/client/AutotaskClient';

/**
 * Integration test helper utilities
 */
export class IntegrationTestHelpers {
  private client: AutotaskClient;

  constructor(client: AutotaskClient) {
    this.client = client;
  }

  /**
   * Skip test if integration tests are disabled
   */
  static skipIfDisabled() {
    if (globalThis.__INTEGRATION_CONFIG__?.skipIntegrationTests) {
      return test.skip;
    }
    return test;
  }

  /**
   * Skip describe block if integration tests are disabled
   */
  static describeIfEnabled(name: string, fn: () => void) {
    if (globalThis.__INTEGRATION_CONFIG__?.skipIntegrationTests) {
      return describe.skip(name, fn);
    }
    return describe(name, fn);
  }

  /**
   * Create a test ticket for integration testing
   */
  async createTestTicket(overrides: any = {}) {
    const testData = {
      title: `Integration Test Ticket - ${Date.now()}`,
      description: 'This is a test ticket created by integration tests',
      accountId: globalThis.__INTEGRATION_CONFIG__.testAccountId || 1,
      status: 1, // New
      priority: 3, // Normal
      issueType: 1,
      subIssueType: 1,
      ...overrides,
    };

    return await this.client.tickets.create(testData);
  }

  /**
   * Create a test account for integration testing
   */
  async createTestAccount(overrides: any = {}) {
    const testData = {
      accountName: `Test Account - ${Date.now()}`,
      accountType: 1, // Customer
      phone: '555-0123',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'United States',
      ...overrides,
    };

    return await this.client.accounts.create(testData);
  }

  /**
   * Create a test contact for integration testing
   */
  async createTestContact(accountId?: number, overrides: any = {}) {
    const testData = {
      firstName: 'Test',
      lastName: `Contact-${Date.now()}`,
      emailAddress: `test.contact.${Date.now()}@example.com`,
      accountId: accountId || globalThis.__INTEGRATION_CONFIG__.testAccountId || 1,
      isActive: true,
      ...overrides,
    };

    return await this.client.contacts.create(testData);
  }

  /**
   * Create a test project for integration testing
   */
  async createTestProject(accountId?: number, overrides: any = {}) {
    const testData = {
      projectName: `Test Project - ${Date.now()}`,
      accountId: accountId || globalThis.__INTEGRATION_CONFIG__.testAccountId || 1,
      type: 1, // Project
      status: 1, // New
      startDateTime: new Date().toISOString(),
      ...overrides,
    };

    return await this.client.projects.create(testData);
  }

  /**
   * Clean up test data by ID
   */
  async cleanupTestTicket(ticketId: number) {
    try {
      await this.client.tickets.delete(ticketId);
    } catch (error) {
      console.warn(`Failed to cleanup test ticket ${ticketId}:`, error);
    }
  }

  async cleanupTestAccount(accountId: number) {
    try {
      await this.client.accounts.delete(accountId);
    } catch (error) {
      console.warn(`Failed to cleanup test account ${accountId}:`, error);
    }
  }

  async cleanupTestContact(contactId: number) {
    try {
      await this.client.contacts.delete(contactId);
    } catch (error) {
      console.warn(`Failed to cleanup test contact ${contactId}:`, error);
    }
  }

  async cleanupTestProject(projectId: number) {
    try {
      await this.client.projects.delete(projectId);
    } catch (error) {
      console.warn(`Failed to cleanup test project ${projectId}:`, error);
    }
  }

  /**
   * Wait for a specified amount of time (for rate limiting)
   */
  async wait(ms: number = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry an operation with exponential backoff
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.wait(delay);
      }
    }

    throw lastError!;
  }
}

/**
 * Get integration test helpers instance
 */
export function getIntegrationHelpers(): IntegrationTestHelpers {
  if (!globalThis.__AUTOTASK_CLIENT__) {
    throw new Error('Integration test client not initialized. Make sure global setup ran successfully.');
  }
  return new IntegrationTestHelpers(globalThis.__AUTOTASK_CLIENT__);
}

/**
 * Custom matchers for integration tests
 */
export const integrationMatchers = {
  toHaveValidId: (received: any) => {
    const pass = received && typeof received.id === 'number' && received.id > 0;
    return {
      message: () => `expected ${received} to have a valid ID (positive number)`,
      pass,
    };
  },

  toHaveTimestamps: (received: any) => {
    const hasCreated = received.createDate || received.createdDate || received.createDateTime;
    const hasModified = received.lastModifiedDate || received.lastModifiedDateTime;
    
    const pass = Boolean(hasCreated);
    return {
      message: () => `expected ${received} to have timestamp fields`,
      pass,
    };
  },

  toBeValidAutotaskEntity: (received: any) => {
    const hasId = received && typeof received.id === 'number' && received.id > 0;
    const hasTimestamp = received.createDate || received.createdDate || received.createDateTime;
    
    const pass = hasId && hasTimestamp;
    return {
      message: () => `expected ${received} to be a valid Autotask entity with ID and timestamps`,
      pass,
    };
  },
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidId(): R;
      toHaveTimestamps(): R;
      toBeValidAutotaskEntity(): R;
    }
  }
} 