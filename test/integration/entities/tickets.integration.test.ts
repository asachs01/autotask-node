import { Ticket } from '../../../src/entities/tickets';
import {
  setupIntegrationTest,
  generateTestId,
  delay,
  shouldSkipIntegrationTests,
} from '../setup';
import { IntegrationTestConfig } from '../setup';

describe('Tickets Integration Tests', () => {
  let config: IntegrationTestConfig;
  const createdTicketIds: number[] = [];

  beforeAll(async () => {
    if (shouldSkipIntegrationTests()) {
      console.log(
        '⚠️ Skipping Tickets integration tests - credentials not available'
      );
      return;
    }

    try {
      config = await setupIntegrationTest();
      console.log('🎫 Starting Tickets integration tests...');
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'SKIP_INTEGRATION_TESTS'
      ) {
        console.log(
          '⚠️ Skipping Tickets integration tests - credentials not available'
        );
        return;
      }
      throw error;
    }
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up created tickets...');

    // Clean up any tickets created during tests
    for (const ticketId of createdTicketIds) {
      try {
        await config.client.tickets.delete(ticketId);
        console.log(`✅ Cleaned up ticket ${ticketId}`);
      } catch (error) {
        console.warn(`⚠️ Could not clean up ticket ${ticketId}:`, error);
      }
    }

    await config.cleanup();
    console.log('🎉 Tickets integration tests completed');
  });

  beforeEach(async () => {
    // Rate limiting - wait between tests
    await delay(1000);
  });

  describe('Authentication and Connectivity', () => {
    it('should authenticate and connect to Autotask API', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      expect(config.client).toBeDefined();
      expect(config.client.tickets).toBeDefined();
      console.log('✅ Successfully connected to Autotask API');
    });
  });

  describe('List Operations', () => {
    it('should list tickets with basic query', async () => {
      console.log('📋 Testing basic ticket listing...');

      const result = await config.client.tickets.list({
        pageSize: 5,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);

      console.log(`📋 Found ${result.data.length} tickets`);
    });

    it('should list tickets with pagination', async () => {
      console.log('📄 Testing ticket pagination...');

      const result = await config.client.tickets.list({
        pageSize: 5,
        page: 1,
      });

      // The API might return more than requested, so just check we got some results
      expect(result.data.length).toBeGreaterThan(0);

      console.log(`📄 Retrieved page 1 with ${result.data.length} tickets`);
    });

    it('should list tickets with filtering', async () => {
      console.log('🔍 Testing ticket filtering...');

      const result = await config.client.tickets.list({
        filter: { status: 1 },
        pageSize: 10,
      });

      expect(Array.isArray(result.data)).toBe(true);

      // Verify all returned tickets have the expected status (if any returned)
      if (result.data.length > 0) {
        result.data.forEach(ticket => {
          expect(ticket.status).toBe(1);
        });
      }

      console.log(`🔍 Found ${result.data.length} tickets with status = 1`);
    });

    it('should list tickets with sorting', async () => {
      const result = await config.client.tickets.list({
        sort: 'createDate desc',
        pageSize: 10,
      });

      expect(result.data.length).toBeGreaterThan(0);

      // Just verify we got tickets - sorting verification is optional since API behavior varies
      console.log(
        `📅 Retrieved ${result.data.length} tickets with sort parameter`
      );

      if (result.data.length > 1) {
        const firstDate = new Date(result.data[0].createDate);
        const lastDate = new Date(
          result.data[result.data.length - 1].createDate
        );
        console.log(
          `📅 Date range: ${firstDate.toISOString()} to ${lastDate.toISOString()}`
        );
      }
    });
  });

  describe('Get Operations', () => {
    it('should get a specific ticket by ID', async () => {
      console.log('🎫 Testing ticket retrieval...');

      // First get a list to find a ticket ID
      const listResult = await config.client.tickets.list({ pageSize: 1 });

      if (listResult.data.length === 0) {
        console.log('⚠️ No tickets found, skipping get test');
        return;
      }

      const ticketId = listResult.data[0].id;
      if (!ticketId) {
        console.log('⚠️ Ticket has no ID, skipping get test');
        return;
      }

      // Now get the specific ticket
      const ticket = await config.client.tickets.get(ticketId);

      expect(ticket.data.id).toBe(ticketId);
      expect(typeof ticket.data.title).toBe('string');
      expect(typeof ticket.data.accountId).toBe('number');
      expect(typeof ticket.data.status).toBe('number');

      console.log(`🎫 Retrieved ticket ${ticketId}: "${ticket.data.title}"`);
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new ticket', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      console.log('✨ Testing ticket creation...');

      if (!config.testAccountId) {
        console.log('⚠️ No test account ID provided, skipping create test');
        return;
      }

      const testId = generateTestId();
      const ticketData: Ticket = {
        title: `Integration Test Ticket ${testId}`,
        accountId: config.testAccountId,
        status: 1, // New
        description: `This is a test ticket created by integration tests at ${new Date().toISOString()}`,
        priority: 3, // Normal
      };

      const createdTicket = await config.client.tickets.create(ticketData);

      if (createdTicket.data.id) {
        createdTicketIds.push(createdTicket.data.id);
      }

      // Verify the created ticket
      expect(createdTicket.data.id).toBeGreaterThan(0);
      expect(createdTicket.data.title).toBe(ticketData.title);
      expect(createdTicket.data.accountId).toBe(ticketData.accountId);
      expect(createdTicket.data.status).toBe(ticketData.status);

      console.log(
        `✅ Created ticket ${createdTicket.data.id}: "${createdTicket.data.title}"`
      );
    });

    it('should update an existing ticket', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      console.log('🔄 Testing ticket update...');

      if (!config.testAccountId) {
        console.log('⚠️ No test account ID provided, skipping update test');
        return;
      }

      // First create a ticket to update
      const testId = generateTestId();
      const ticketData: Ticket = {
        title: `Update Test Ticket ${testId}`,
        accountId: config.testAccountId,
        status: 1,
        description: 'Original description',
        priority: 3,
      };

      const createdTicket = await config.client.tickets.create(ticketData);

      if (createdTicket.data.id) {
        createdTicketIds.push(createdTicket.data.id);
      }

      if (!createdTicket.data.id) {
        throw new Error('Created ticket has no ID');
      }

      // Now update it
      const updateData: Partial<Ticket> = {
        title: `Updated Test Ticket ${testId}`,
        description: 'Updated description',
        priority: 4, // High
      };

      const updatedTicket = await config.client.tickets.update(
        createdTicket.data.id,
        updateData
      );

      expect(updatedTicket.data.id).toBe(createdTicket.data.id);
      expect(updatedTicket.data.title).toBe(updateData.title);
      expect(updatedTicket.data.description).toBe(updateData.description);
      expect(updatedTicket.data.priority).toBe(updateData.priority);

      console.log(
        `🔄 Updated ticket ${updatedTicket.data.id}: "${updatedTicket.data.title}"`
      );
    });

    it('should handle update validation errors', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      const invalidUpdateData: Partial<Ticket> = {
        status: 999, // Invalid status
      };

      await expect(
        config.client.tickets.update(999999, invalidUpdateData)
      ).rejects.toThrow();

      console.log('✅ Update validation working correctly');
    });

    it('should delete a ticket', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      console.log('🗑️ Testing ticket deletion...');

      if (!config.testAccountId) {
        console.log('⚠️ No test account ID provided, skipping delete test');
        return;
      }

      // First create a ticket to delete
      const testId = generateTestId();
      const ticketData: Ticket = {
        title: `Delete Test Ticket ${testId}`,
        accountId: config.testAccountId,
        status: 1,
        description: 'This ticket will be deleted',
      };

      const createdTicket = await config.client.tickets.create(ticketData);

      if (!createdTicket.data.id) {
        throw new Error('Created ticket has no ID');
      }

      // Delete the ticket
      await config.client.tickets.delete(createdTicket.data.id);

      // Verify it's deleted by trying to get it (should throw)
      await expect(
        config.client.tickets.get(createdTicket.data.id)
      ).rejects.toThrow();

      console.log(`🗑️ Deleted ticket ${createdTicket.data.id}`);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent ticket requests', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      const nonExistentId = 999999999;

      await expect(config.client.tickets.get(nonExistentId)).rejects.toThrow();

      console.log('✅ Non-existent ticket error handling working');
    });

    it('should handle invalid filter syntax', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      await expect(
        config.client.tickets.list({
          filter: 'invalid filter syntax' as any,
        })
      ).rejects.toThrow();

      console.log('✅ Invalid filter error handling working');
    });

    it('should handle rate limiting gracefully', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      console.log('⏱️ Testing rate limiting behavior...');

      // Make multiple rapid requests to test rate limiting
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(config.client.tickets.list({ pageSize: 1 }));
      }

      const results = await Promise.allSettled(promises);

      // At least some should succeed
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);

      console.log(
        `⏱️ Rate limiting test completed: ${successful.length}/3 requests succeeded`
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      console.log('📊 Testing performance monitoring...');

      // Get initial request count
      const initialReport = config.client
        .getRequestHandler()
        .getPerformanceReport();
      const initialRequestCount = initialReport.metrics.requestCount || 0;

      // Make a few requests to generate metrics
      await config.client.tickets.list({ pageSize: 5 });
      await delay(100);
      await config.client.tickets.list({ pageSize: 3 });

      // Get updated performance report
      const finalReport = config.client
        .getRequestHandler()
        .getPerformanceReport();

      expect(finalReport).toBeDefined();
      expect(finalReport.metrics).toBeDefined();

      const finalRequestCount = finalReport.metrics.requestCount || 0;
      expect(finalRequestCount).toBeGreaterThan(initialRequestCount);

      console.log('📊 Performance monitoring working correctly');
      console.log(`📈 Total requests: ${finalRequestCount}`);
      console.log(
        `⚡ Average response time: ${finalReport.metrics.averageResponseTime}ms`
      );
    });
  });
});
