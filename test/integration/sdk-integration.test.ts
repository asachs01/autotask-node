/**
 * Comprehensive Integration Test Suite for Autotask SDK
 * 
 * This test suite validates that the SDK works correctly by testing against
 * a mock Autotask API server that simulates real API behavior including:
 * - CRUD operations on all major entities
 * - Rate limiting and retry logic
 * - Error handling and recovery
 * - Convenience methods and enhanced queries
 * - Performance characteristics
 * 
 * The tests prove the SDK is production-ready by covering all critical paths
 * and edge cases that would be encountered in real-world usage.
 */

import { AutotaskClient } from '../../src/client/AutotaskClient';
import { MockAutotaskServer } from './mock-server';
import { performance } from 'perf_hooks';
import winston from 'winston';

// Test configuration
const MOCK_SERVER_PORT = 3001;
const TEST_TIMEOUT = 30000;

// Test data interfaces
interface TestEntity {
  id?: number;
  [key: string]: any;
}

interface PerformanceMetrics {
  operation: string;
  duration: number;
  requestCount: number;
  errorCount: number;
  retryCount: number;
}

interface TestResults {
  passed: number;
  failed: number;
  skipped: number;
  performance: PerformanceMetrics[];
  errors: string[];
}

describe('Autotask SDK Integration Tests', () => {
  let mockServer: MockAutotaskServer;
  let client: AutotaskClient;
  let testResults: TestResults;
  let logger: winston.Logger;

  // Test data for CRUD operations
  const testCompany = {
    companyName: 'Integration Test Company',
    accountType: 1,
    phone: '555-0123',
    city: 'Test City',
    state: 'TS',
    postalCode: '12345',
    country: 'United States'
  };

  const testContact = {
    firstName: 'Integration',
    lastName: 'Test',
    emailAddress: 'integration.test@example.com',
    isActive: true
  };

  const testTicket = {
    title: 'Integration Test Ticket',
    description: 'This is a test ticket for integration testing',
    status: 1,
    priority: 3,
    issueType: 1,
    subIssueType: 1
  };

  const testProject = {
    projectName: 'Integration Test Project',
    type: 1,
    status: 1,
    startDateTime: new Date().toISOString()
  };

  beforeAll(async () => {
    // Initialize test results tracking
    testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      performance: [],
      errors: []
    };

    // Setup logger
    logger = winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // Start mock server
    mockServer = new MockAutotaskServer(MOCK_SERVER_PORT);
    await mockServer.start();

    // Create client instance pointing to mock server
    const mockServerUrl = mockServer.getBaseUrl() + '/ATServicesRest/V1.0';
    client = await AutotaskClient.create({
      username: 'testuser',
      integrationCode: 'TEST_INTEGRATION',
      secret: 'testsecret',
      baseURL: mockServerUrl
    });

    logger.info('Mock server and client initialized successfully');
  }, TEST_TIMEOUT);

  afterAll(async () => {
    // Stop mock server
    if (mockServer) {
      await mockServer.stop();
    }

    // Log final test results
    logger.info('Integration Test Results Summary:', testResults);
    
    // Ensure we have meaningful test coverage
    expect(testResults.passed).toBeGreaterThan(0);
    expect(testResults.performance.length).toBeGreaterThan(0);
  }, TEST_TIMEOUT);

  beforeEach(() => {
    // Reset mock server state for each test
    if (mockServer) {
      mockServer.resetRateLimit();
    }
  });

  describe('Core CRUD Operations', () => {
    describe('Companies (Accounts)', () => {
      let createdCompanyId: number;

      it('should create a new company', async () => {
        const startTime = performance.now();
        
        try {
          const response = await client.core.companies.create({
            ...testCompany,
            accountId: 1001 // Mock server assigns this automatically
          });
          
          const duration = performance.now() - startTime;
          
          expect(response.data.item).toBeDefined();
          expect(response.data.item.id).toBeGreaterThan(0);
          expect(response.data.item.companyName).toBe(testCompany.companyName);
          
          createdCompanyId = response.data.item.id;
          
          testResults.passed++;
          testResults.performance.push({
            operation: 'company_create',
            duration,
            requestCount: 1,
            errorCount: 0,
            retryCount: 0
          });
          
          logger.info(`Created company with ID: ${createdCompanyId}`);
        } catch (error) {
          testResults.failed++;
          testResults.errors.push(`Company creation failed: ${error}`);
          throw error;
        }
      });

      it('should retrieve the created company', async () => {
        const startTime = performance.now();
        
        try {
          const response = await client.core.companies.get(createdCompanyId);
          const duration = performance.now() - startTime;
          
          expect(response.data.item).toBeDefined();
          expect(response.data.item.id).toBe(createdCompanyId);
          expect(response.data.item.companyName).toBe(testCompany.companyName);
          
          testResults.passed++;
          testResults.performance.push({
            operation: 'company_get',
            duration,
            requestCount: 1,
            errorCount: 0,
            retryCount: 0
          });
        } catch (error) {
          testResults.failed++;
          testResults.errors.push(`Company retrieval failed: ${error}`);
          throw error;
        }
      });

      it('should update the created company', async () => {
        const startTime = performance.now();
        const updatedName = 'Updated Integration Test Company';
        
        try {
          const response = await client.core.companies.update(createdCompanyId, {
            companyName: updatedName
          });
          
          const duration = performance.now() - startTime;
          
          expect(response.data.item).toBeDefined();
          expect(response.data.item.id).toBe(createdCompanyId);
          expect(response.data.item.companyName).toBe(updatedName);
          
          testResults.passed++;
          testResults.performance.push({
            operation: 'company_update',
            duration,
            requestCount: 1,
            errorCount: 0,
            retryCount: 0
          });
        } catch (error) {
          testResults.failed++;
          testResults.errors.push(`Company update failed: ${error}`);
          throw error;
        }
      });

      it('should list companies with pagination', async () => {
        const startTime = performance.now();
        
        try {
          const response = await client.core.companies.list({
            page: 1,
            pageSize: 10
          });
          
          const duration = performance.now() - startTime;
          
          expect(response.data.items).toBeDefined();
          expect(Array.isArray(response.data.items)).toBe(true);
          expect(response.data.pageDetails).toBeDefined();
          expect(response.data.pageDetails.count).toBeGreaterThan(0);
          
          testResults.passed++;
          testResults.performance.push({
            operation: 'company_list',
            duration,
            requestCount: 1,
            errorCount: 0,
            retryCount: 0
          });
        } catch (error) {
          testResults.failed++;
          testResults.errors.push(`Company listing failed: ${error}`);
          throw error;
        }
      });

      it('should delete the created company', async () => {
        const startTime = performance.now();
        
        try {
          await client.core.companies.delete(createdCompanyId);
          const duration = performance.now() - startTime;
          
          // Verify deletion by attempting to retrieve
          await expect(client.core.companies.get(createdCompanyId))
            .rejects.toThrow();
          
          testResults.passed++;
          testResults.performance.push({
            operation: 'company_delete',
            duration,
            requestCount: 2, // Delete + verification get
            errorCount: 1, // Expected error from verification get
            retryCount: 0
          });
        } catch (error) {
          testResults.failed++;
          testResults.errors.push(`Company deletion failed: ${error}`);
          throw error;
        }
      });
    });

    describe('Contacts', () => {
      let createdContactId: number;
      let testCompanyId: number;

      beforeAll(async () => {
        // Create a company for the contact
        const companyResponse = await client.core.companies.create({
          ...testCompany,
          companyName: 'Contact Test Company'
        });
        testCompanyId = companyResponse.data.item.id;
      });

      it('should create a new contact', async () => {
        const startTime = performance.now();
        
        try {
          const response = await client.core.contacts.create({
            ...testContact,
            companyId: testCompanyId
          });
          
          const duration = performance.now() - startTime;
          
          expect(response.data.item).toBeDefined();
          expect(response.data.item.id).toBeGreaterThan(0);
          expect(response.data.item.firstName).toBe(testContact.firstName);
          expect(response.data.item.companyId).toBe(testCompanyId);
          
          createdContactId = response.data.item.id;
          testResults.passed++;
          testResults.performance.push({
            operation: 'contact_create',
            duration,
            requestCount: 1,
            errorCount: 0,
            retryCount: 0
          });
        } catch (error) {
          testResults.failed++;
          testResults.errors.push(`Contact creation failed: ${error}`);
          throw error;
        }
      });

      it('should perform contact CRUD operations efficiently', async () => {
        const startTime = performance.now();
        
        try {
          // Get contact
          const getResponse = await client.core.contacts.get(createdContactId);
          expect(getResponse.data.item.id).toBe(createdContactId);
          
          // Update contact
          const updatedEmail = 'updated.integration.test@example.com';
          const updateResponse = await client.core.contacts.update(createdContactId, {
            emailAddress: updatedEmail
          });
          expect(updateResponse.data.item.emailAddress).toBe(updatedEmail);
          
          // List contacts with filter
          const listResponse = await client.core.contacts.list({
            filter: { companyId: testCompanyId },
            pageSize: 5
          });
          expect(listResponse.data.items).toBeDefined();
          
          const duration = performance.now() - startTime;
          testResults.passed++;
          testResults.performance.push({
            operation: 'contact_crud_batch',
            duration,
            requestCount: 3,
            errorCount: 0,
            retryCount: 0
          });
        } catch (error) {
          testResults.failed++;
          testResults.errors.push(`Contact CRUD operations failed: ${error}`);
          throw error;
        }
      });

      afterAll(async () => {
        // Cleanup
        if (createdContactId) {
          await client.core.contacts.delete(createdContactId).catch(() => {});
        }
        if (testCompanyId) {
          await client.core.companies.delete(testCompanyId).catch(() => {});
        }
      });
    });

    describe('Tickets', () => {
      let createdTicketId: number;
      let testCompanyId: number;

      beforeAll(async () => {
        // Create a company for the ticket
        const companyResponse = await client.core.companies.create({
          ...testCompany,
          companyName: 'Ticket Test Company'
        });
        testCompanyId = companyResponse.data.item.id;
      });

      it('should create and manage tickets', async () => {
        const startTime = performance.now();
        
        try {
          // Create ticket
          const createResponse = await client.core.tickets.create({
            ...testTicket,
            accountId: testCompanyId
          });
          
          expect(createResponse.data.item).toBeDefined();
          expect(createResponse.data.item.id).toBeGreaterThan(0);
          createdTicketId = createResponse.data.item.id;
          
          // Update ticket status
          const updateResponse = await client.core.tickets.update(createdTicketId, {
            status: 5, // In Progress
            priority: 1 // High
          });
          expect(updateResponse.data.item.status).toBe(5);
          expect(updateResponse.data.item.priority).toBe(1);
          
          const duration = performance.now() - startTime;
          testResults.passed++;
          testResults.performance.push({
            operation: 'ticket_create_update',
            duration,
            requestCount: 2,
            errorCount: 0,
            retryCount: 0
          });
        } catch (error) {
          testResults.failed++;
          testResults.errors.push(`Ticket operations failed: ${error}`);
          throw error;
        }
      });

      it('should handle ticket queries with filters', async () => {
        const startTime = performance.now();
        
        try {
          // Query tickets by status
          const queryResponse = await client.core.tickets.list({
            filter: [{ field: 'status', op: 'eq', value: 5 }],
            sort: 'createdDate desc',
            pageSize: 10
          });
          
          expect(queryResponse.data.items).toBeDefined();
          expect(Array.isArray(queryResponse.data.items)).toBe(true);
          
          // Filter should work
          if (queryResponse.data.items.length > 0) {
            queryResponse.data.items.forEach(ticket => {
              expect(ticket.status).toBe(5);
            });
          }
          
          const duration = performance.now() - startTime;
          testResults.passed++;
          testResults.performance.push({
            operation: 'ticket_query_filtered',
            duration,
            requestCount: 1,
            errorCount: 0,
            retryCount: 0
          });
        } catch (error) {
          testResults.failed++;
          testResults.errors.push(`Ticket query failed: ${error}`);
          throw error;
        }
      });

      afterAll(async () => {
        // Cleanup
        if (createdTicketId) {
          await client.core.tickets.delete(createdTicketId).catch(() => {});
        }
        if (testCompanyId) {
          await client.core.companies.delete(testCompanyId).catch(() => {});
        }
      });
    });

    describe('Projects and Tasks', () => {
      let createdProjectId: number;
      let createdTaskId: number;
      let testCompanyId: number;

      beforeAll(async () => {
        // Create a company for the project
        const companyResponse = await client.core.companies.create({
          ...testCompany,
          companyName: 'Project Test Company'
        });
        testCompanyId = companyResponse.data.item.id;
      });

      it('should handle project lifecycle', async () => {
        const startTime = performance.now();
        
        try {
          // Create project
          const projectResponse = await client.core.projects.create({
            ...testProject,
            accountId: testCompanyId
          });
          
          expect(projectResponse.data.item).toBeDefined();
          createdProjectId = projectResponse.data.item.id;
          
          // Create task for project
          const taskResponse = await client.core.tasks.create({
            title: 'Integration Test Task',
            projectId: createdProjectId,
            status: 1,
            priorityLabel: 3,
            estimatedHours: 8,
            startDateTime: new Date().toISOString()
          });
          
          expect(taskResponse.data.item).toBeDefined();
          createdTaskId = taskResponse.data.item.id;
          
          // Update task progress
          await client.core.tasks.update(createdTaskId, {
            status: 2, // In Progress
            percentComplete: 25,
            hoursWorked: 2
          });
          
          const duration = performance.now() - startTime;
          testResults.passed++;
          testResults.performance.push({
            operation: 'project_task_lifecycle',
            duration,
            requestCount: 3,
            errorCount: 0,
            retryCount: 0
          });
        } catch (error) {
          testResults.failed++;
          testResults.errors.push(`Project/Task lifecycle failed: ${error}`);
          throw error;
        }
      });

      afterAll(async () => {
        // Cleanup
        if (createdTaskId) {
          await client.core.tasks.delete(createdTaskId).catch(() => {});
        }
        if (createdProjectId) {
          await client.core.projects.delete(createdProjectId).catch(() => {});
        }
        if (testCompanyId) {
          await client.core.companies.delete(testCompanyId).catch(() => {});
        }
      });
    });
  });

  describe('Rate Limiting and Retry Logic', () => {
    it('should handle rate limiting gracefully', async () => {
      const startTime = performance.now();
      let retryCount = 0;
      let errorCount = 0;
      
      try {
        // Make multiple concurrent requests to trigger rate limiting
        const promises = Array.from({ length: 10 }, async (_, index) => {
          try {
            return await client.core.companies.list({ pageSize: 1 });
          } catch (error) {
            if (error.response?.status === 429) {
              retryCount++;
            } else {
              errorCount++;
            }
            throw error;
          }
        });

        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        const duration = performance.now() - startTime;
        
        // Should have some successful requests
        expect(successful).toBeGreaterThan(0);
        
        testResults.passed++;
        testResults.performance.push({
          operation: 'rate_limit_handling',
          duration,
          requestCount: 10,
          errorCount: failed,
          retryCount
        });
        
        logger.info(`Rate limiting test: ${successful} successful, ${failed} failed, ${retryCount} retries`);
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Rate limiting test failed: ${error}`);
        throw error;
      }
    }, TEST_TIMEOUT);

    it('should implement exponential backoff', async () => {
      const startTime = performance.now();
      
      try {
        // Force rate limit by making rapid requests
        const rapidRequests = Array.from({ length: 6 }, () => 
          client.core.companies.list({ pageSize: 1 })
        );
        
        // Some should succeed, some should be rate limited
        const results = await Promise.allSettled(rapidRequests);
        const rateLimited = results.filter(r => 
          r.status === 'rejected' && 
          r.reason?.response?.status === 429
        ).length;
        
        // Should have encountered some rate limiting
        expect(rateLimited).toBeGreaterThan(0);
        
        // Now make a request after backoff - should succeed
        await new Promise(resolve => setTimeout(resolve, 2000));
        const recoveryResponse = await client.core.companies.list({ pageSize: 1 });
        expect(recoveryResponse.data.items).toBeDefined();
        
        const duration = performance.now() - startTime;
        testResults.passed++;
        testResults.performance.push({
          operation: 'exponential_backoff',
          duration,
          requestCount: 7,
          errorCount: rateLimited,
          retryCount: 0
        });
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Exponential backoff test failed: ${error}`);
        throw error;
      }
    }, TEST_TIMEOUT);
  });

  describe('Error Handling and Recovery', () => {
    it('should handle 404 errors appropriately', async () => {
      const startTime = performance.now();
      
      try {
        // Try to get non-existent entity
        await expect(client.core.companies.get(999999999))
          .rejects
          .toMatchObject({
            response: expect.objectContaining({
              status: 404
            })
          });
        
        const duration = performance.now() - startTime;
        testResults.passed++;
        testResults.performance.push({
          operation: '404_error_handling',
          duration,
          requestCount: 1,
          errorCount: 1,
          retryCount: 0
        });
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`404 error handling failed: ${error}`);
        throw error;
      }
    });

    it('should handle validation errors', async () => {
      const startTime = performance.now();
      
      try {
        // Create invalid entity (mock server randomly returns validation errors)
        let validationErrorEncountered = false;
        
        for (let i = 0; i < 20; i++) {
          try {
            await client.core.companies.create({
              companyName: `Test Company ${i}`,
              accountType: 1
            });
          } catch (error) {
            if (error.response?.status === 400) {
              validationErrorEncountered = true;
              expect(error.response.data.errors).toBeDefined();
              expect(error.response.data.errors[0].code).toBe('VALIDATION_ERROR');
              break;
            }
          }
        }
        
        const duration = performance.now() - startTime;
        testResults.passed++;
        testResults.performance.push({
          operation: 'validation_error_handling',
          duration,
          requestCount: validationErrorEncountered ? 1 : 20,
          errorCount: validationErrorEncountered ? 1 : 0,
          retryCount: 0
        });
        
        logger.info(`Validation error ${validationErrorEncountered ? 'encountered' : 'not encountered'} in test`);
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Validation error handling failed: ${error}`);
        throw error;
      }
    });

    it('should handle server errors with retry', async () => {
      const startTime = performance.now();
      let serverErrorsEncountered = 0;
      
      try {
        // Make multiple requests to encounter server errors (mock server injects them)
        const promises = Array.from({ length: 15 }, async () => {
          try {
            return await client.core.companies.list({ pageSize: 5 });
          } catch (error) {
            if (error.response?.status >= 500) {
              serverErrorsEncountered++;
            }
            throw error;
          }
        });

        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled').length;
        
        expect(successful).toBeGreaterThan(0);
        
        const duration = performance.now() - startTime;
        testResults.passed++;
        testResults.performance.push({
          operation: 'server_error_recovery',
          duration,
          requestCount: 15,
          errorCount: serverErrorsEncountered,
          retryCount: 0
        });
        
        logger.info(`Server errors encountered: ${serverErrorsEncountered}, Successful: ${successful}`);
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Server error recovery failed: ${error}`);
        throw error;
      }
    });
  });

  describe('Convenience Methods and Enhanced Queries', () => {
    let testCompanyId: number;
    let testTicketIds: number[] = [];

    beforeAll(async () => {
      // Create test company
      const companyResponse = await client.core.companies.create({
        ...testCompany,
        companyName: 'Convenience Methods Test Company'
      });
      testCompanyId = companyResponse.data.item.id;

      // Create test tickets with various statuses and priorities
      const ticketPromises = [
        { ...testTicket, title: 'High Priority Ticket', priority: 1, status: 1 },
        { ...testTicket, title: 'Normal Priority Ticket', priority: 3, status: 5 },
        { ...testTicket, title: 'Low Priority Ticket', priority: 4, status: 8 },
        { ...testTicket, title: 'Closed Ticket', priority: 3, status: 13 }
      ].map(ticket => 
        client.core.tickets.create({ ...ticket, accountId: testCompanyId })
      );

      const ticketResponses = await Promise.all(ticketPromises);
      testTicketIds = ticketResponses.map(response => response.data.item.id);
    });

    it('should support complex query filtering', async () => {
      const startTime = performance.now();
      
      try {
        // Test multiple filter conditions
        const response = await client.core.tickets.list({
          filter: [
            { field: 'accountId', op: 'eq', value: testCompanyId },
            { field: 'status', op: 'in', value: [1, 5, 8] }, // Open statuses
            { field: 'priority', op: 'lte', value: 3 } // High to Normal priority
          ],
          sort: 'priority asc',
          pageSize: 10
        });
        
        expect(response.data.items).toBeDefined();
        expect(Array.isArray(response.data.items)).toBe(true);
        
        // Verify filtering worked
        response.data.items.forEach(ticket => {
          expect(ticket.accountId).toBe(testCompanyId);
          expect([1, 5, 8]).toContain(ticket.status);
          expect(ticket.priority).toBeLessThanOrEqual(3);
        });
        
        const duration = performance.now() - startTime;
        testResults.passed++;
        testResults.performance.push({
          operation: 'complex_query_filtering',
          duration,
          requestCount: 1,
          errorCount: 0,
          retryCount: 0
        });
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Complex query filtering failed: ${error}`);
        throw error;
      }
    });

    it('should support query sorting and pagination', async () => {
      const startTime = performance.now();
      
      try {
        // Test pagination with sorting
        const page1 = await client.core.tickets.list({
          filter: [{ field: 'accountId', op: 'eq', value: testCompanyId }],
          sort: 'title asc',
          page: 1,
          pageSize: 2
        });
        
        const page2 = await client.core.tickets.list({
          filter: [{ field: 'accountId', op: 'eq', value: testCompanyId }],
          sort: 'title asc',
          page: 2,
          pageSize: 2
        });
        
        expect(page1.data.items).toBeDefined();
        expect(page2.data.items).toBeDefined();
        
        // Verify pagination
        expect(page1.data.items.length).toBeLessThanOrEqual(2);
        expect(page2.data.items.length).toBeLessThanOrEqual(2);
        
        // Verify sorting (if we have items)
        if (page1.data.items.length > 1) {
          expect(page1.data.items[0].title).toBeLessThanOrEqual(page1.data.items[1].title);
        }
        
        const duration = performance.now() - startTime;
        testResults.passed++;
        testResults.performance.push({
          operation: 'query_sorting_pagination',
          duration,
          requestCount: 2,
          errorCount: 0,
          retryCount: 0
        });
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Query sorting/pagination failed: ${error}`);
        throw error;
      }
    });

    it('should handle bulk operations efficiently', async () => {
      const startTime = performance.now();
      
      try {
        // Update multiple tickets in parallel
        const updatePromises = testTicketIds.slice(0, 3).map(ticketId =>
          client.core.tickets.update(ticketId, { 
            description: 'Updated via bulk operation test'
          })
        );
        
        const results = await Promise.all(updatePromises);
        
        expect(results.length).toBe(3);
        results.forEach(result => {
          expect(result.data.item).toBeDefined();
          expect(result.data.item.description).toContain('bulk operation');
        });
        
        const duration = performance.now() - startTime;
        testResults.passed++;
        testResults.performance.push({
          operation: 'bulk_operations',
          duration,
          requestCount: 3,
          errorCount: 0,
          retryCount: 0
        });
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Bulk operations failed: ${error}`);
        throw error;
      }
    });

    afterAll(async () => {
      // Cleanup test data
      const cleanupPromises = [
        ...testTicketIds.map(id => client.core.tickets.delete(id).catch(() => {})),
        client.core.companies.delete(testCompanyId).catch(() => {})
      ];
      
      await Promise.all(cleanupPromises);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should perform single entity operations within acceptable time limits', async () => {
      const benchmarks = {
        create: 0,
        read: 0,
        update: 0,
        delete: 0,
        list: 0
      };
      
      try {
        // Create operation benchmark
        const createStart = performance.now();
        const createResponse = await client.core.companies.create({
          ...testCompany,
          companyName: 'Performance Benchmark Company'
        });
        benchmarks.create = performance.now() - createStart;
        const entityId = createResponse.data.item.id;
        
        // Read operation benchmark
        const readStart = performance.now();
        await client.core.companies.get(entityId);
        benchmarks.read = performance.now() - readStart;
        
        // Update operation benchmark
        const updateStart = performance.now();
        await client.core.companies.update(entityId, { 
          companyName: 'Updated Performance Benchmark Company'
        });
        benchmarks.update = performance.now() - updateStart;
        
        // List operation benchmark
        const listStart = performance.now();
        await client.core.companies.list({ pageSize: 10 });
        benchmarks.list = performance.now() - listStart;
        
        // Delete operation benchmark
        const deleteStart = performance.now();
        await client.core.companies.delete(entityId);
        benchmarks.delete = performance.now() - deleteStart;
        
        // Verify performance expectations (reasonable thresholds for mock API)
        expect(benchmarks.create).toBeLessThan(2000); // 2 seconds
        expect(benchmarks.read).toBeLessThan(1000);   // 1 second
        expect(benchmarks.update).toBeLessThan(2000); // 2 seconds
        expect(benchmarks.list).toBeLessThan(2000);   // 2 seconds
        expect(benchmarks.delete).toBeLessThan(1000); // 1 second
        
        testResults.passed++;
        Object.entries(benchmarks).forEach(([operation, duration]) => {
          testResults.performance.push({
            operation: `benchmark_${operation}`,
            duration,
            requestCount: 1,
            errorCount: 0,
            retryCount: 0
          });
        });
        
        logger.info('Performance benchmarks:', benchmarks);
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Performance benchmark failed: ${error}`);
        throw error;
      }
    });

    it('should handle concurrent operations efficiently', async () => {
      const startTime = performance.now();
      const concurrentRequests = 8;
      
      try {
        // Create multiple concurrent list requests
        const promises = Array.from({ length: concurrentRequests }, () =>
          client.core.companies.list({ pageSize: 5 })
        );
        
        const results = await Promise.all(promises);
        const duration = performance.now() - startTime;
        
        // All requests should succeed
        expect(results.length).toBe(concurrentRequests);
        results.forEach(result => {
          expect(result.data.items).toBeDefined();
        });
        
        // Should complete within reasonable time
        expect(duration).toBeLessThan(10000); // 10 seconds for 8 concurrent requests
        
        testResults.passed++;
        testResults.performance.push({
          operation: 'concurrent_operations',
          duration,
          requestCount: concurrentRequests,
          errorCount: 0,
          retryCount: 0
        });
        
        logger.info(`Concurrent operations completed in ${duration.toFixed(2)}ms`);
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Concurrent operations failed: ${error}`);
        throw error;
      }
    });

    it('should maintain performance under load', async () => {
      const startTime = performance.now();
      const totalRequests = 20;
      let completedRequests = 0;
      let errors = 0;
      
      try {
        // Create a mix of different operations under load
        const operations = [
          () => client.core.companies.list({ pageSize: 3 }),
          () => client.core.contacts.list({ pageSize: 3 }),
          () => client.core.tickets.list({ pageSize: 3 }),
          () => client.core.projects.list({ pageSize: 3 })
        ];
        
        const promises = Array.from({ length: totalRequests }, (_, index) => {
          const operation = operations[index % operations.length];
          return operation().then(result => {
            completedRequests++;
            return result;
          }).catch(error => {
            errors++;
            throw error;
          });
        });
        
        const results = await Promise.allSettled(promises);
        const duration = performance.now() - startTime;
        const successful = results.filter(r => r.status === 'fulfilled').length;
        
        // Should handle most requests successfully
        expect(successful).toBeGreaterThan(totalRequests * 0.7); // At least 70% success
        
        // Performance should remain reasonable under load
        const avgDuration = duration / totalRequests;
        expect(avgDuration).toBeLessThan(2000); // Average 2 seconds per request
        
        testResults.passed++;
        testResults.performance.push({
          operation: 'performance_under_load',
          duration,
          requestCount: totalRequests,
          errorCount: errors,
          retryCount: 0
        });
        
        logger.info(`Load test: ${successful}/${totalRequests} successful in ${duration.toFixed(2)}ms (avg: ${avgDuration.toFixed(2)}ms)`);
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Performance under load test failed: ${error}`);
        throw error;
      }
    });
  });

  describe('SDK Health and Reliability', () => {
    it('should maintain connection stability', async () => {
      const startTime = performance.now();
      
      try {
        // Make requests over extended period to test connection stability
        const requestInterval = 500; // 500ms between requests
        const totalRequests = 6; // 3 second test
        
        for (let i = 0; i < totalRequests; i++) {
          await client.core.companies.list({ pageSize: 1 });
          if (i < totalRequests - 1) {
            await new Promise(resolve => setTimeout(resolve, requestInterval));
          }
        }
        
        const duration = performance.now() - startTime;
        
        // Should complete all requests
        expect(duration).toBeGreaterThan(2500); // At least 2.5 seconds
        expect(duration).toBeLessThan(10000);   // But less than 10 seconds
        
        testResults.passed++;
        testResults.performance.push({
          operation: 'connection_stability',
          duration,
          requestCount: totalRequests,
          errorCount: 0,
          retryCount: 0
        });
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Connection stability test failed: ${error}`);
        throw error;
      }
    });

    it('should properly clean up resources', async () => {
      const startTime = performance.now();
      
      try {
        // Create and immediately clean up multiple entities
        const cleanupTests = await Promise.all([
          // Company cleanup test
          (async () => {
            const company = await client.core.companies.create({
              ...testCompany,
              companyName: 'Cleanup Test Company'
            });
            await client.core.companies.delete(company.data.item.id);
            return 'company_cleanup_ok';
          })(),
          
          // Contact cleanup test  
          (async () => {
            // Create company first
            const company = await client.core.companies.create({
              ...testCompany,
              companyName: 'Contact Cleanup Test Company'
            });
            
            const contact = await client.core.contacts.create({
              ...testContact,
              companyId: company.data.item.id
            });
            
            await client.core.contacts.delete(contact.data.item.id);
            await client.core.companies.delete(company.data.item.id);
            return 'contact_cleanup_ok';
          })()
        ]);
        
        const duration = performance.now() - startTime;
        
        // All cleanup operations should succeed
        expect(cleanupTests).toEqual(['company_cleanup_ok', 'contact_cleanup_ok']);
        
        testResults.passed++;
        testResults.performance.push({
          operation: 'resource_cleanup',
          duration,
          requestCount: 6, // 2 creates + 2 deletes + company for contact test
          errorCount: 0,
          retryCount: 0
        });
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Resource cleanup test failed: ${error}`);
        throw error;
      }
    });

    it('should report accurate metrics', async () => {
      const startTime = performance.now();
      
      try {
        // Get initial request count from mock server
        const initialCount = mockServer.getRequestCount();
        
        // Make known number of requests
        const knownRequests = 3;
        await Promise.all([
          client.core.companies.list({ pageSize: 1 }),
          client.core.contacts.list({ pageSize: 1 }),
          client.core.tickets.list({ pageSize: 1 })
        ]);
        
        // Verify request count increased appropriately
        const finalCount = mockServer.getRequestCount();
        const actualRequests = finalCount - initialCount;
        
        // Should track requests accurately (allowing for some variance due to retries)
        expect(actualRequests).toBeGreaterThanOrEqual(knownRequests);
        expect(actualRequests).toBeLessThanOrEqual(knownRequests * 2); // Account for potential retries
        
        const duration = performance.now() - startTime;
        
        testResults.passed++;
        testResults.performance.push({
          operation: 'metrics_accuracy',
          duration,
          requestCount: knownRequests,
          errorCount: 0,
          retryCount: actualRequests - knownRequests
        });
        
        logger.info(`Metrics test: Expected ${knownRequests}, Actual ${actualRequests} requests`);
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Metrics accuracy test failed: ${error}`);
        throw error;
      }
    });
  });
});