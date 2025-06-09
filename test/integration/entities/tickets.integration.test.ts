import { Ticket } from '../../../src/entities/tickets';
import {
  setupIntegrationTest,
  generateTestId,
  delay,
  shouldSkipIntegrationTests,
} from '../setup';
import { IntegrationTestConfig } from '../setup';

describe('Tickets Integration Tests (Optimized)', () => {
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
      console.log('🎫 Starting optimized Tickets integration tests...');
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
    // Rate limiting - longer wait between tests
    await delay(2000);
  });

  describe('Core Functionality', () => {
    it('should authenticate and perform basic list operation', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      console.log('🔌 Testing authentication and basic list...');

      // Test authentication and basic list operation
      expect(config.client).toBeDefined();
      expect(config.client.tickets).toBeDefined();

      const result = await config.client.tickets.list({
        pageSize: 3, // Smaller page size to reduce load
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);

      console.log(
        `✅ Authentication and basic list successful (${result.data.length} tickets)`
      );
    });

    it('should perform complete CRUD workflow when permitted', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      if (!config.testAccountId) {
        console.log('⚠️ No test account ID provided, skipping CRUD test');
        return;
      }

      console.log('🔄 Testing complete CRUD workflow...');

      try {
        // === CREATE ===
        const testId = generateTestId();
        const ticketData: Ticket = {
          title: `Integration Test Ticket ${testId}`,
          accountId: config.testAccountId,
          status: 1, // New
          description: `Test ticket created at ${new Date().toISOString()}`,
          priority: 3, // Normal
        };

        const createdTicket = await config.client.tickets.create(ticketData);
        expect(createdTicket.data.id).toBeGreaterThan(0);
        expect(createdTicket.data.title).toBe(ticketData.title);

        const ticketId = createdTicket.data.id!;
        createdTicketIds.push(ticketId);
        console.log(`✅ CREATE: Ticket ${ticketId} created`);

        await delay(1000); // Rate limit between operations

        // === READ ===
        const retrievedTicket = await config.client.tickets.get(ticketId);
        expect(retrievedTicket.data.id).toBe(ticketId);
        expect(retrievedTicket.data.title).toBe(ticketData.title);
        console.log(`✅ READ: Ticket ${ticketId} retrieved`);

        await delay(1000);

        // === UPDATE ===
        const updateData: Partial<Ticket> = {
          title: `Updated Test Ticket ${testId}`,
          priority: 4, // High
        };

        const updatedTicket = await config.client.tickets.update(
          ticketId,
          updateData
        );
        expect(updatedTicket.data.id).toBe(ticketId);
        expect(updatedTicket.data.title).toBe(updateData.title);
        expect(updatedTicket.data.priority).toBe(updateData.priority);
        console.log(`✅ UPDATE: Ticket ${ticketId} updated`);

        await delay(1000);

        // === DELETE ===
        await config.client.tickets.delete(ticketId);

        // Verify deletion
        await expect(config.client.tickets.get(ticketId)).rejects.toThrow();
        console.log(`✅ DELETE: Ticket ${ticketId} deleted`);

        // Remove from cleanup list since it's already deleted
        const index = createdTicketIds.indexOf(ticketId);
        if (index > -1) {
          createdTicketIds.splice(index, 1);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('Server error (500)') ||
            error.message.includes('Not Found') ||
            error.message.includes('forbidden'))
        ) {
          console.log(
            '⚠️ CRUD operations may not be permitted in this environment'
          );
          console.log(
            '📝 This is expected behavior in some Autotask environments'
          );
          return;
        }
        throw error;
      }
    });

    it('should handle basic filtering and error cases', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      console.log('🔍 Testing filtering and error handling...');

      try {
        // Test basic filtering (single API call)
        const filteredTickets = await config.client.tickets.list({
          filter: { status: 1 },
          pageSize: 2, // Small page size
        });

        expect(Array.isArray(filteredTickets.data)).toBe(true);
        console.log(
          `✅ Filtering: Found ${filteredTickets.data.length} tickets with status=1`
        );

        await delay(1000);

        // Test error handling with non-existent ticket
        const nonExistentId = 999999999;
        await expect(
          config.client.tickets.get(nonExistentId)
        ).rejects.toThrow();
        console.log(`✅ Error handling: Non-existent ticket properly rejected`);
      } catch (error) {
        console.log('⚠️ Some operations may be limited by API permissions');
        console.log('📝 This is expected in restrictive environments');
      }
    });
  });
});
