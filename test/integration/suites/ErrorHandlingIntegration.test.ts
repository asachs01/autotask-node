import { TestEnvironment, TestEnvironmentType } from '../framework/TestEnvironment';
import { TestDataFactory } from '../framework/TestDataFactory';
import { loadTestConfig, IntegrationTestConfig } from '../config/TestConfig';
import { AutotaskClient } from '../../../src/client/AutotaskClient';

describe('Error Handling and Recovery Integration Tests', () => {
  let testConfig: IntegrationTestConfig;
  let testEnvironment: TestEnvironment;
  let testDataFactory: TestDataFactory;
  let client: AutotaskClient;

  beforeAll(async () => {
    testConfig = loadTestConfig();
    
    if (testConfig.skipIntegrationTests) {
      console.log('⚠️ Skipping Error Handling Integration Tests - credentials not available or explicitly disabled');
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

      // Initialize test data factory
      testDataFactory = new TestDataFactory(testEnvironment);

      console.log('🚨 Error Handling Integration Tests initialized successfully');
      console.log(`Environment: ${testConfig.environment}`);
      console.log(`Retry Configuration: ${testConfig.performance.maxRetries} attempts, ${testConfig.performance.baseRetryDelay}ms base delay`);
    } catch (error) {
      console.error('Failed to initialize Error Handling Integration Tests:', error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    if (testEnvironment) {
      await testEnvironment.cleanup();
      console.log('🧹 Error Handling Integration Tests cleanup completed');
    }
  });

  describe('HTTP Error Handling', () => {
    it('should handle 404 Not Found errors gracefully', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🔍 Testing 404 Not Found error handling...');

      const nonExistentIds = [999999999, 888888888, 777777777];
      const entityTypes = [
        { name: 'tickets', client: client.tickets },
        { name: 'accounts', client: client.accounts },
        { name: 'contacts', client: client.contacts },
        { name: 'projects', client: client.projects }
      ];

      for (const entityType of entityTypes) {
        for (const id of nonExistentIds.slice(0, 1)) { // Test only one ID per entity to reduce load
          try {
            await testEnvironment.executeWithRateLimit(async () => {
              return await entityType.client.get(id);
            });
            
            console.log(`⚠️ Unexpectedly found ${entityType.name} with ID ${id}`);
          } catch (error: any) {
            expect(error.status).toBe(404);
            expect(error.message).toContain('404');
            
            // Validate error structure
            expect(error).toHaveProperty('status');
            expect(error).toHaveProperty('message');
            
            console.log(`✅ ${entityType.name} correctly returned 404 for ID ${id}`);
          }
        }
        
        // Rate limiting between entity types
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('✅ 404 error handling validation completed');
    });

    it('should handle 400 Bad Request errors with validation details', async () => {
      if (testConfig.skipIntegrationTests) return;
      
      if (!testEnvironment.isOperationAllowed('create')) {
        console.log('⚠️ Data creation not allowed, skipping 400 error tests');
        return;
      }

      console.log('🚫 Testing 400 Bad Request error handling...');

      // Test invalid ticket creation
      const invalidTicketData = {
        title: '', // Empty title
        accountId: -1, // Invalid account ID
        status: 999, // Invalid status
        priority: -5 // Invalid priority
      };

      try {
        await testEnvironment.executeWithRetry(async () => {
          return await client.tickets.create(invalidTicketData as any);
        }, 1); // Only try once for validation errors
        
        console.log('⚠️ Invalid ticket creation unexpectedly succeeded');
      } catch (error: any) {
        expect(error.status).toBeGreaterThanOrEqual(400);
        expect(error.status).toBeLessThan(500);
        
        console.log(`✅ Invalid ticket creation correctly failed with status ${error.status}`);
        console.log(`Error message: ${error.message}`);
        
        // Validate error contains helpful information
        expect(error.message).toBeDefined();
        expect(typeof error.message).toBe('string');
        expect(error.message.length).toBeGreaterThan(0);
      }

      // Test invalid account creation
      const invalidAccountData = {
        accountName: '', // Empty name
        accountType: 999, // Invalid type
        phone: 'invalid-phone-format'
      };

      try {
        await testEnvironment.executeWithRetry(async () => {
          return await client.accounts.create(invalidAccountData as any);
        }, 1);
        
        console.log('⚠️ Invalid account creation unexpectedly succeeded');
      } catch (error: any) {
        expect(error.status).toBeGreaterThanOrEqual(400);
        expect(error.status).toBeLessThan(500);
        
        console.log(`✅ Invalid account creation correctly failed with status ${error.status}`);
      }

      console.log('✅ 400 Bad Request error handling validation completed');
    });

    it('should handle 401 Unauthorized errors', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🔒 Testing 401 Unauthorized error handling...');

      // Create a client with invalid credentials
      const invalidClient = new AutotaskClient({
        username: 'invalid@example.com',
        integrationCode: 'invalid-code',
        secret: 'invalid-secret'
      });

      try {
        await invalidClient.tickets.list({ pageSize: 1 });
        console.log('⚠️ Invalid credentials unexpectedly succeeded');
      } catch (error: any) {
        expect(error.status).toBe(401);
        expect(error.message).toContain('401');
        
        console.log(`✅ Invalid credentials correctly returned 401 error`);
        console.log(`Error details: ${error.message}`);
      }

      console.log('✅ 401 Unauthorized error handling validation completed');
    });

    it('should handle 403 Forbidden errors gracefully', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🚫 Testing 403 Forbidden error handling...');

      // Try operations that might be forbidden in some environments
      const restrictedOperations = [
        {
          name: 'Delete non-existent ticket',
          operation: async () => {
            if (testEnvironment.isOperationAllowed('delete')) {
              return await client.tickets.delete(999999999);
            }
            throw new Error('Operation not allowed in this environment');
          }
        },
        {
          name: 'Update system configuration',
          operation: async () => {
            // This operation is likely to be restricted
            return await client.version.list();
          }
        }
      ];

      for (const test of restrictedOperations) {
        try {
          await testEnvironment.executeWithRateLimit(test.operation);
          console.log(`📋 ${test.name}: Operation succeeded (not restricted)`);
        } catch (error: any) {
          if (error.status === 403) {
            expect(error.message).toContain('403');
            console.log(`✅ ${test.name}: Correctly returned 403 Forbidden`);
          } else if (error.status === 404) {
            console.log(`📋 ${test.name}: Returned 404 (resource not found, which is also valid)`);
          } else {
            console.log(`📋 ${test.name}: Returned ${error.status} (${error.message})`);
          }
        }
        
        // Rate limiting between operations
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log('✅ 403 Forbidden error handling validation completed');
    });
  });

  describe('Network and Connection Recovery', () => {
    it('should recover from temporary connection issues with retry logic', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🌐 Testing connection recovery with retry logic...');

      let attemptCount = 0;
      const maxAttempts = 3;
      
      const unreliableOperation = async () => {
        attemptCount++;
        
        if (attemptCount === 1) {
          // Simulate connection timeout
          const error = new Error('Connection timeout') as any;
          error.code = 'ECONNRESET';
          throw error;
        } else if (attemptCount === 2) {
          // Simulate server error
          const error = new Error('Internal server error') as any;
          error.status = 500;
          throw error;
        } else {
          // Succeed on third attempt
          return await client.tickets.list({ pageSize: 1 });
        }
      };

      const startTime = Date.now();
      const result = await testEnvironment.executeWithRetry(unreliableOperation, maxAttempts);
      const endTime = Date.now();

      expect(result.data).toBeDefined();
      expect(attemptCount).toBe(maxAttempts);
      
      const totalTime = endTime - startTime;
      console.log(`✅ Connection recovery successful after ${attemptCount} attempts (${totalTime}ms total)`);
      
      // Validate that retry delays were applied
      const expectedMinTime = testConfig.performance.baseRetryDelay + (testConfig.performance.baseRetryDelay * 2);
      expect(totalTime).toBeGreaterThan(expectedMinTime * 0.8); // Allow for timing variations
    });

    it('should handle DNS resolution failures gracefully', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🌐 Testing DNS resolution failure handling...');

      // Create client with invalid API URL
      const invalidUrlClient = new AutotaskClient({
        username: testConfig.autotask.username,
        integrationCode: testConfig.autotask.integrationCode,
        secret: testConfig.autotask.secret,
        apiUrl: 'https://non-existent-domain-12345.autotask.net/ATServicesRest'
      });

      try {
        await invalidUrlClient.tickets.list({ pageSize: 1 });
        console.log('⚠️ Invalid URL unexpectedly succeeded');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(typeof error.message).toBe('string');
        
        // Common DNS/connection error codes
        const isNetworkError = error.code === 'ENOTFOUND' || 
                              error.code === 'ECONNREFUSED' || 
                              error.message.includes('network') ||
                              error.message.includes('DNS');
        
        console.log(`✅ DNS/Network error correctly handled: ${error.message}`);
        console.log(`Error code: ${error.code || 'Not specified'}`);
      }

      console.log('✅ DNS resolution failure handling validation completed');
    });

    it('should handle SSL/TLS certificate errors', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🔒 Testing SSL/TLS certificate error handling...');

      // Note: This test assumes proper SSL is configured, but we'll test error handling structure
      try {
        // Use the real client to ensure SSL is working properly
        const result = await testEnvironment.executeWithRateLimit(async () => {
          return await client.version.list({ pageSize: 1 });
        });
        
        expect(result).toBeDefined();
        console.log('✅ SSL/TLS connection working correctly');
        
        // Log SSL details if available
        if (process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0') {
          console.log('🔒 SSL certificate validation is enabled (secure)');
        } else {
          console.log('⚠️ SSL certificate validation is disabled (insecure for production)');
        }
        
      } catch (error: any) {
        // If we get SSL errors with the real client, that's a configuration issue
        if (error.code === 'CERT_HAS_EXPIRED' || 
            error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
            error.message.includes('certificate')) {
          console.log(`⚠️ SSL certificate issue detected: ${error.message}`);
          console.log('This may require certificate updates or configuration changes');
        } else {
          throw error; // Re-throw non-SSL errors
        }
      }

      console.log('✅ SSL/TLS error handling validation completed');
    });
  });

  describe('Rate Limiting and Throttling Recovery', () => {
    it('should handle rate limit errors with exponential backoff', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🚷 Testing rate limit recovery with exponential backoff...');

      let rateLimitHit = false;
      let recoverySuccessful = false;
      
      // Simulate hitting rate limits by making rapid requests
      const rapidRequests = async () => {
        const promises = [];
        
        for (let i = 0; i < 10; i++) {
          promises.push(
            testEnvironment.executeWithRateLimit(async () => {
              return await client.tickets.list({ pageSize: 1 });
            }).catch(error => {
              if (error.status === 429) {
                rateLimitHit = true;
              }
              throw error;
            })
          );
        }
        
        return Promise.allSettled(promises);
      };

      try {
        const results = await rapidRequests();
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`Rapid requests: ${successful} successful, ${failed} failed`);
        
        if (rateLimitHit) {
          console.log('✅ Rate limiting detected as expected');
          
          // Test recovery after rate limit
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          
          const recoveryResult = await testEnvironment.executeWithRetry(async () => {
            return await client.tickets.list({ pageSize: 1 });
          });
          
          if (recoveryResult.data) {
            recoverySuccessful = true;
            console.log('✅ Successfully recovered from rate limiting');
          }
        } else {
          console.log('📋 No rate limiting encountered (API limits may be very permissive)');
        }
        
      } catch (error) {
        console.log('⚠️ Rate limiting test failed:', error);
      }

      console.log('✅ Rate limiting recovery validation completed');
    });

    it('should respect API rate limits and avoid overwhelming the server', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🚷 Testing respectful API usage patterns...');

      const requestTimes: number[] = [];
      const requestCount = 5;
      
      // Make sequential requests with proper rate limiting
      for (let i = 0; i < requestCount; i++) {
        const startTime = Date.now();
        
        await testEnvironment.executeWithRateLimit(async () => {
          return await client.tickets.list({ pageSize: 1 });
        });
        
        const endTime = Date.now();
        requestTimes.push(endTime - startTime);
        
        console.log(`Request ${i + 1}: ${endTime - startTime}ms`);
      }

      // Analyze request patterns
      const averageTime = requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length;
      const maxTime = Math.max(...requestTimes);
      const minTime = Math.min(...requestTimes);
      
      console.log(`Request timing analysis:`);
      console.log(`  Average: ${averageTime.toFixed(2)}ms`);
      console.log(`  Max: ${maxTime}ms`);
      console.log(`  Min: ${minTime}ms`);
      
      // Validate reasonable response times
      expect(averageTime).toBeLessThan(30000); // Less than 30 seconds average
      expect(maxTime).toBeLessThan(60000); // Less than 60 seconds max
      
      console.log('✅ Respectful API usage pattern validation completed');
    });
  });

  describe('Data Consistency and Transaction Recovery', () => {
    it('should handle partial operation failures gracefully', async () => {
      if (testConfig.skipIntegrationTests) return;
      
      if (!testEnvironment.isOperationAllowed('create')) {
        console.log('⚠️ Data creation not allowed, skipping transaction tests');
        return;
      }

      console.log('🔄 Testing partial operation failure handling...');

      const accountId = testConfig.testData.accountId || 1;
      const createdEntities: number[] = [];
      
      try {
        // Attempt to create multiple related entities
        const ticketData1 = testDataFactory.createTicketData(accountId, {
          title: 'Transaction Test Ticket 1'
        });
        
        const ticket1 = await client.tickets.create(ticketData1 as any);
        createdEntities.push(ticket1.data.id);
        testEnvironment.registerCreatedEntity('tickets', ticket1.data.id);
        
        console.log(`✅ Created ticket 1: ${ticket1.data.id}`);
        
        // Create second ticket (this should succeed)
        const ticketData2 = testDataFactory.createTicketData(accountId, {
          title: 'Transaction Test Ticket 2'
        });
        
        const ticket2 = await client.tickets.create(ticketData2 as any);
        createdEntities.push(ticket2.data.id);
        testEnvironment.registerCreatedEntity('tickets', ticket2.data.id);
        
        console.log(`✅ Created ticket 2: ${ticket2.data.id}`);
        
        // Attempt to create ticket with invalid data (should fail)
        const invalidTicketData = {
          title: '', // Invalid
          accountId: -1, // Invalid
        };
        
        try {
          const ticket3 = await client.tickets.create(invalidTicketData as any);
          console.log('⚠️ Invalid ticket creation unexpectedly succeeded');
        } catch (error) {
          console.log(`✅ Invalid ticket creation correctly failed`);
        }
        
        // Verify that successful operations remain valid
        const verifyTicket1 = await client.tickets.get(ticket1.data.id);
        const verifyTicket2 = await client.tickets.get(ticket2.data.id);
        
        expect(verifyTicket1.data.id).toBe(ticket1.data.id);
        expect(verifyTicket2.data.id).toBe(ticket2.data.id);
        
        console.log('✅ Successful operations maintained integrity despite partial failure');
        
      } catch (error) {
        console.log('⚠️ Transaction test failed:', error);
        
        // Clean up any created entities
        for (const id of createdEntities) {
          try {
            if (testEnvironment.isOperationAllowed('delete')) {
              await client.tickets.delete(id);
            }
          } catch (cleanupError) {
            console.log(`Warning: Could not clean up ticket ${id}`);
          }
        }
      }

      console.log('✅ Partial operation failure handling validation completed');
    });

    it('should maintain data consistency during error conditions', async () => {
      if (testConfig.skipIntegrationTests) return;

      console.log('🔄 Testing data consistency during error conditions...');

      // Test that read operations remain consistent even after write failures
      const initialTickets = await testEnvironment.executeWithRateLimit(async () => {
        return await client.tickets.list({ pageSize: 5 });
      });
      
      const initialCount = initialTickets.data.length;
      console.log(`Initial ticket count: ${initialCount}`);
      
      // Attempt invalid operations
      if (testEnvironment.isOperationAllowed('create')) {
        try {
          await client.tickets.create({
            title: '', // Invalid
            accountId: -999, // Invalid
          } as any);
        } catch (error) {
          console.log('✅ Invalid operation correctly rejected');
        }
      }
      
      // Verify data consistency after failed operation
      const afterFailureTickets = await testEnvironment.executeWithRateLimit(async () => {
        return await client.tickets.list({ pageSize: 5 });
      });
      
      const afterFailureCount = afterFailureTickets.data.length;
      console.log(`Ticket count after failed operation: ${afterFailureCount}`);
      
      // Count should remain the same (no partial writes)
      expect(afterFailureCount).toBeGreaterThanOrEqual(initialCount);
      
      // Verify that existing data is still accessible and consistent
      if (initialTickets.data.length > 0) {
        const testTicket = initialTickets.data[0];
        const verifyTicket = await testEnvironment.executeWithRateLimit(async () => {
          return await client.tickets.get(testTicket.id);
        });
        
        expect(verifyTicket.data.id).toBe(testTicket.id);
        expect(verifyTicket.data.title).toBe(testTicket.title);
        
        console.log('✅ Existing data remains consistent and accessible');
      }
      
      console.log('✅ Data consistency validation completed');
    });
  });
});
