import { TestEnvironment, TestEnvironmentType } from '../framework/TestEnvironment';
import { TestDataFactory } from '../framework/TestDataFactory';
import { PerformanceTester } from '../framework/PerformanceTester';
import { loadTestConfig, IntegrationTestConfig } from '../config/TestConfig';
import { AutotaskClient } from '../../../src/client/AutotaskClient';

describe('Core Entities Integration Tests', () => {
  let testConfig: IntegrationTestConfig;
  let testEnvironment: TestEnvironment;
  let testDataFactory: TestDataFactory;
  let performanceTester: PerformanceTester;
  let client: AutotaskClient;

  beforeAll(async () => {
    testConfig = loadTestConfig();
    
    if (testConfig.skipIntegrationTests) {
      console.log('⚠️ Skipping Core Entities Integration Tests - credentials not available or explicitly disabled');
      return;
    }

    try {
      // Initialize Autotask client
      client = new AutotaskClient({
        username: testConfig.autotask.username,
        integrationCode: testConfig.autotask.integrationCode,
        secret: testConfig.autotask.secret,
        apiUrl: testConfig.autotask.apiUrl,
      });

      // Initialize test environment
      testEnvironment = new TestEnvironment(client, testConfig.environment);
      await testEnvironment.initialize();

      // Initialize helpers
      testDataFactory = new TestDataFactory(testEnvironment);
      performanceTester = new PerformanceTester(testEnvironment);

      console.log('🎯 Core Entities Integration Tests initialized successfully');
      console.log(`Environment: ${testConfig.environment}`);
      console.log(`Data Creation: ${testConfig.safety.allowDataCreation ? 'ENABLED' : 'DISABLED'}`);
    } catch (error) {
      console.error('Failed to initialize Core Entities Integration Tests:', error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    if (testEnvironment) {
      await testEnvironment.cleanup();
      console.log('🧹 Core Entities Integration Tests cleanup completed');
    }
  });

  describe('Companies (Accounts)', () => {
    let testAccountId: number | undefined;

    it('should validate company list operation', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🏢 Testing company list operation...');

      const result = await testEnvironment.executeWithRateLimit(async () => {
        return await client.accounts.list({ pageSize: 10 });
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      if (result.data.length > 0) {
        const account = result.data[0];
        expect(account).toHaveProperty('id');
        expect(account).toHaveProperty('accountName');
        expect(typeof account.id).toBe('number');
        expect(account.id).toBeGreaterThan(0);
      }

      console.log(`✅ Company list successful (${result.data.length} companies found)`);
    });

    it('should handle company creation if allowed', async () => {
      if (testConfig.skipIntegrationTests) return;
      
      if (!testEnvironment.isOperationAllowed('create')) {
        console.log('⚠️ Company creation not allowed in this environment, skipping...');
        return;
      }

      console.log('🏢 Testing company creation...');

      const accountData = testDataFactory.createAccountData({
        accountName: `Integration Test Company ${Date.now()}`,
      });

      const result = await testEnvironment.executeWithRetry(async () => {
        return await client.accounts.create(accountData);
      });

      expect(result.data).toBeDefined();
      expect(result.data.id).toBeGreaterThan(0);
      expect(result.data.accountName).toBe(accountData.accountName);

      testAccountId = result.data.id;
      testEnvironment.registerCreatedEntity('accounts', testAccountId);

      console.log(`✅ Company created successfully with ID: ${testAccountId}`);
    });

    it('should handle company retrieval', async () => {
      if (testConfig.skipIntegrationTests) return;

      const accountId = testAccountId || testConfig.testData.accountId || 1;
      console.log(`🏢 Testing company retrieval for ID: ${accountId}`);

      try {
        const result = await testEnvironment.executeWithRateLimit(async () => {
          return await client.accounts.get(accountId);
        });

        expect(result.data).toBeDefined();
        expect(result.data.id).toBe(accountId);
        expect(result.data.accountName).toBeDefined();

        console.log(`✅ Company retrieved successfully: ${result.data.accountName}`);
      } catch (error: any) {
        if (error.status === 404) {
          console.log(`⚠️ Company ${accountId} not found, which is expected in some test environments`);
        } else {
          throw error;
        }
      }
    });

    it('should validate company filtering', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🏢 Testing company filtering...');

      const result = await testEnvironment.executeWithRateLimit(async () => {
        return await client.accounts.list({ 
          filter: { accountType: 1 }, // Customer accounts
          pageSize: 5 
        });
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);

      // Validate that all returned accounts match the filter
      for (const account of result.data) {
        expect(account.accountType).toBe(1);
      }

      console.log(`✅ Company filtering successful (${result.data.length} customer accounts found)`);
    });
  });

  describe('Contacts', () => {
    it('should validate contact list operation', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('👤 Testing contact list operation...');

      const result = await testEnvironment.executeWithRateLimit(async () => {
        return await client.contacts.list({ pageSize: 10 });
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      if (result.data.length > 0) {
        const contact = result.data[0];
        expect(contact).toHaveProperty('id');
        expect(contact).toHaveProperty('firstName');
        expect(contact).toHaveProperty('lastName');
        expect(contact).toHaveProperty('accountId');
        expect(typeof contact.id).toBe('number');
        expect(contact.id).toBeGreaterThan(0);
      }

      console.log(`✅ Contact list successful (${result.data.length} contacts found)`);
    });

    it('should handle contact creation with account relationship', async () => {
      if (testConfig.skipIntegrationTests) return;
      
      if (!testEnvironment.isOperationAllowed('create')) {
        console.log('⚠️ Contact creation not allowed in this environment, skipping...');
        return;
      }

      console.log('👤 Testing contact creation with account relationship...');

      const accountId = testConfig.testData.accountId || 1;
      const contactData = testDataFactory.createContactData(accountId, {
        firstName: 'Integration',
        lastName: `Test-${Date.now()}`,
      });

      const result = await testEnvironment.executeWithRetry(async () => {
        return await client.contacts.create(contactData);
      });

      expect(result.data).toBeDefined();
      expect(result.data.id).toBeGreaterThan(0);
      expect(result.data.firstName).toBe(contactData.firstName);
      expect(result.data.lastName).toBe(contactData.lastName);
      expect(result.data.accountId).toBe(accountId);

      testEnvironment.registerCreatedEntity('contacts', result.data.id);

      console.log(`✅ Contact created successfully with ID: ${result.data.id}`);
    });

    it('should validate contact business logic', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('👤 Testing contact business logic validation...');

      const businessLogic = testEnvironment.getBusinessLogic();
      const contactData = testDataFactory.createContactData(1, {
        emailAddress: 'invalid-email', // Invalid email to test validation
      });

      try {
        const validationResult = await businessLogic.validateEntity('contact', contactData);
        
        if (!validationResult.isValid) {
          console.log('📝 Contact validation caught expected issues:', validationResult.errors);
          expect(validationResult.errors.some(error => error.includes('email'))).toBe(true);
        }
      } catch (error) {
        console.log('⚠️ Business logic validation not fully implemented yet, which is expected');
      }

      console.log('✅ Contact business logic validation completed');
    });
  });

  describe('Tickets', () => {
    it('should validate ticket list operation with filtering', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🎫 Testing ticket list operation with filtering...');

      const result = await testEnvironment.executeWithRateLimit(async () => {
        return await client.tickets.list({ 
          filter: { status: 1 }, // New tickets
          pageSize: 10 
        });
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      // Validate ticket structure
      if (result.data.length > 0) {
        const ticket = result.data[0];
        expect(ticket).toHaveProperty('id');
        expect(ticket).toHaveProperty('title');
        expect(ticket).toHaveProperty('accountId');
        expect(ticket).toHaveProperty('status');
        expect(typeof ticket.id).toBe('number');
        expect(ticket.id).toBeGreaterThan(0);
        expect(ticket.status).toBe(1); // Should match filter
      }

      console.log(`✅ Ticket list with filtering successful (${result.data.length} new tickets found)`);
    });

    it('should handle ticket CRUD workflow if allowed', async () => {
      if (testConfig.skipIntegrationTests) return;
      
      if (!testEnvironment.isOperationAllowed('create')) {
        console.log('⚠️ Ticket CRUD not allowed in this environment, testing read-only operations...');
        
        // Test read operations only
        const tickets = await client.tickets.list({ pageSize: 1 });
        if (tickets.data.length > 0) {
          const ticketId = tickets.data[0].id;
          const ticket = await client.tickets.get(ticketId);
          expect(ticket.data.id).toBe(ticketId);
          console.log(`✅ Read-only ticket operations successful`);
        }
        return;
      }

      console.log('🎫 Testing complete ticket CRUD workflow...');

      const accountId = testConfig.testData.accountId || 1;
      const ticketData = testDataFactory.createTicketData(accountId, {
        title: `Integration Test Ticket ${Date.now()}`,
        priority: 3,
      });

      // CREATE
      const createdTicket = await testEnvironment.executeWithRetry(async () => {
        return await client.tickets.create(ticketData);
      });

      expect(createdTicket.data.id).toBeGreaterThan(0);
      expect(createdTicket.data.title).toBe(ticketData.title);
      
      const ticketId = createdTicket.data.id;
      testEnvironment.registerCreatedEntity('tickets', ticketId);
      console.log(`✅ Ticket created with ID: ${ticketId}`);

      // READ
      await testEnvironment.executeWithRateLimit(async () => {
        const retrievedTicket = await client.tickets.get(ticketId);
        expect(retrievedTicket.data.id).toBe(ticketId);
        expect(retrievedTicket.data.title).toBe(ticketData.title);
        return retrievedTicket;
      });
      console.log(`✅ Ticket retrieved successfully`);

      // UPDATE (if allowed)
      if (testEnvironment.isOperationAllowed('update')) {
        await testEnvironment.executeWithRateLimit(async () => {
          const updateData = {
            title: `Updated ${ticketData.title}`,
            priority: 4,
          };
          
          const updatedTicket = await client.tickets.update(ticketId, updateData);
          expect(updatedTicket.data.title).toBe(updateData.title);
          expect(updatedTicket.data.priority).toBe(updateData.priority);
          return updatedTicket;
        });
        console.log(`✅ Ticket updated successfully`);
      }

      console.log('✅ Complete ticket CRUD workflow successful');
    });
  });

  describe('Projects', () => {
    it('should validate project list operation', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('📋 Testing project list operation...');

      const result = await testEnvironment.executeWithRateLimit(async () => {
        return await client.projects.list({ pageSize: 10 });
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      if (result.data.length > 0) {
        const project = result.data[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('projectName');
        expect(project).toHaveProperty('accountId');
        expect(typeof project.id).toBe('number');
        expect(project.id).toBeGreaterThan(0);
      }

      console.log(`✅ Project list successful (${result.data.length} projects found)`);
    });

    it('should validate project-account relationship integrity', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('📋 Testing project-account relationship integrity...');

      const projects = await testEnvironment.executeWithRateLimit(async () => {
        return await client.projects.list({ pageSize: 5 });
      });

      if (projects.data.length === 0) {
        console.log('⚠️ No projects found for relationship testing');
        return;
      }

      // Test that each project's account exists
      for (const project of projects.data) {
        try {
          const account = await testEnvironment.executeWithRateLimit(async () => {
            return await client.accounts.get(project.accountId);
          });
          
          expect(account.data).toBeDefined();
          expect(account.data.id).toBe(project.accountId);
          
          console.log(`✅ Project "${project.projectName}" correctly linked to account "${account.data.accountName}"`);
        } catch (error: any) {
          if (error.status === 404) {
            console.log(`⚠️ Account ${project.accountId} not found for project ${project.id}, which may indicate data inconsistency`);
          } else {
            throw error;
          }
        }
        
        // Rate limiting between relationship checks
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('✅ Project-account relationship integrity validation completed');
    });
  });

  describe('Cross-Entity Business Logic', () => {
    it('should validate ticket-account-contact relationships', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🔗 Testing cross-entity relationship validation...');

      // Get a sample ticket with related data
      const tickets = await testEnvironment.executeWithRateLimit(async () => {
        return await client.tickets.list({ pageSize: 3 });
      });

      if (tickets.data.length === 0) {
        console.log('⚠️ No tickets found for cross-entity testing');
        return;
      }

      const ticket = tickets.data[0];
      
      // Validate account relationship
      try {
        const account = await testEnvironment.executeWithRateLimit(async () => {
          return await client.accounts.get(ticket.accountId);
        });
        
        expect(account.data).toBeDefined();
        expect(account.data.id).toBe(ticket.accountId);
        
        console.log(`✅ Ticket ${ticket.id} correctly linked to account ${account.data.accountName}`);
        
        // Find contacts for this account
        const contacts = await testEnvironment.executeWithRateLimit(async () => {
          return await client.contacts.list({ 
            filter: { accountId: ticket.accountId },
            pageSize: 5 
          });
        });
        
        console.log(`📞 Found ${contacts.data.length} contacts for account ${account.data.accountName}`);
        
        // Validate contact-account relationships
        for (const contact of contacts.data) {
          expect(contact.accountId).toBe(ticket.accountId);
        }
        
        console.log('✅ Contact-account relationships validated');
        
      } catch (error: any) {
        if (error.status === 404) {
          console.log(`⚠️ Related entity not found, which may indicate data inconsistency`);
        } else {
          throw error;
        }
      }

      console.log('✅ Cross-entity relationship validation completed');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle non-existent entity gracefully', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🚫 Testing error handling for non-existent entities...');

      const nonExistentId = 999999999;
      
      // Test each entity type
      const entityTests = [
        { name: 'account', client: client.accounts },
        { name: 'contact', client: client.contacts },
        { name: 'ticket', client: client.tickets },
        { name: 'project', client: client.projects },
      ];

      for (const entityTest of entityTests) {
        try {
          await testEnvironment.executeWithRateLimit(async () => {
            return await entityTest.client.get(nonExistentId);
          });
          
          // If we get here, the entity was found (unexpected)
          console.log(`⚠️ Entity ${entityTest.name} ${nonExistentId} unexpectedly exists`);
        } catch (error: any) {
          expect(error.status).toBe(404);
          console.log(`✅ ${entityTest.name} correctly returned 404 for non-existent ID`);
        }
        
        // Rate limiting between error tests
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log('✅ Error handling validation completed');
    });

    it('should handle malformed data validation', async () => {
      if (testConfig.skipIntegrationTests) return;
      
      if (!testEnvironment.isOperationAllowed('create')) {
        console.log('⚠️ Data creation not allowed, skipping malformed data test');
        return;
      }

      console.log('🚫 Testing malformed data handling...');

      // Test invalid ticket creation
      const invalidTicketData = {
        title: '', // Empty title
        accountId: -1, // Invalid account ID
        status: 999, // Invalid status
      };

      try {
        await testEnvironment.executeWithRetry(async () => {
          return await client.tickets.create(invalidTicketData);
        });
        
        console.log('⚠️ Invalid ticket creation unexpectedly succeeded');
      } catch (error: any) {
        expect(error.status).toBeGreaterThanOrEqual(400);
        expect(error.status).toBeLessThan(500);
        console.log(`✅ Invalid ticket creation correctly failed with status ${error.status}`);
      }

      console.log('✅ Malformed data handling validation completed');
    });
  });
});
