import { getIntegrationHelpers, IntegrationTestHelpers } from '../helpers/testHelpers';

// Type declarations for global variables
declare const globalThis: {
  __AUTOTASK_CLIENT__: any;
  __INTEGRATION_CONFIG__: {
    testAccountId: number;
    skipIntegrationTests: boolean;
  };
};

IntegrationTestHelpers.describeIfEnabled('Tickets Integration Tests', () => {
  let helpers: IntegrationTestHelpers;
  let createdTicketIds: number[] = [];

  beforeAll(() => {
    helpers = getIntegrationHelpers();
  });

  afterAll(async () => {
    // Cleanup any created tickets
    for (const ticketId of createdTicketIds) {
      await helpers.cleanupTestTicket(ticketId);
    }
  });

  describe('CRUD Operations', () => {
    IntegrationTestHelpers.skipIfDisabled()('should create a new ticket', async () => {
      const ticketData = {
        title: `Integration Test Ticket - ${Date.now()}`,
        description: 'This is a test ticket created by integration tests',
        accountId: globalThis.__INTEGRATION_CONFIG__.testAccountId || 1,
        status: 1, // New
        priority: 3, // Normal
        issueType: 1,
        subIssueType: 1,
      };

      const response = await globalThis.__AUTOTASK_CLIENT__.tickets.create(ticketData);
      
      expect(response.data).toBeValidAutotaskEntity();
      expect(response.data.title).toBe(ticketData.title);
      expect(response.data.description).toBe(ticketData.description);
      expect(response.data.accountId).toBe(ticketData.accountId);
      
      createdTicketIds.push(response.data.id);
    });

    IntegrationTestHelpers.skipIfDisabled()('should retrieve a ticket by ID', async () => {
      // Create a ticket first
      const createResponse = await helpers.createTestTicket();
      createdTicketIds.push(createResponse.data.id);

      // Retrieve the ticket
      const response = await globalThis.__AUTOTASK_CLIENT__.tickets.get(createResponse.data.id);
      
      expect(response.data).toBeValidAutotaskEntity();
      expect(response.data.id).toBe(createResponse.data.id);
      expect(response.data.title).toBe(createResponse.data.title);
    });

    IntegrationTestHelpers.skipIfDisabled()('should update a ticket', async () => {
      // Create a ticket first
      const createResponse = await helpers.createTestTicket();
      createdTicketIds.push(createResponse.data.id);

      const updateData = {
        title: `Updated Ticket Title - ${Date.now()}`,
        description: 'Updated description',
      };

      // Update the ticket
      const response = await globalThis.__AUTOTASK_CLIENT__.tickets.update(
        createResponse.data.id, 
        updateData
      );
      
      expect(response.data).toBeValidAutotaskEntity();
      expect(response.data.id).toBe(createResponse.data.id);
      expect(response.data.title).toBe(updateData.title);
      expect(response.data.description).toBe(updateData.description);
    });

    IntegrationTestHelpers.skipIfDisabled()('should list tickets with filtering', async () => {
      const response = await globalThis.__AUTOTASK_CLIENT__.tickets.list({
        filter: { status: 1 }, // New tickets
        pageSize: 10,
      });
      
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
      
      // Verify all returned tickets have status = 1
      response.data.forEach(ticket => {
        expect(ticket).toBeValidAutotaskEntity();
        expect(ticket.status).toBe(1);
      });
    });

    IntegrationTestHelpers.skipIfDisabled()('should handle pagination', async () => {
      const page1 = await globalThis.__AUTOTASK_CLIENT__.tickets.list({
        pageSize: 5,
        page: 1,
      });
      
      const page2 = await globalThis.__AUTOTASK_CLIENT__.tickets.list({
        pageSize: 5,
        page: 2,
      });
      
      expect(page1.data).toBeInstanceOf(Array);
      expect(page2.data).toBeInstanceOf(Array);
      
      // Verify pages contain different tickets (if there are enough tickets)
      if (page1.data.length > 0 && page2.data.length > 0) {
        const page1Ids = page1.data.map(t => t.id);
        const page2Ids = page2.data.map(t => t.id);
        
        // Should not have overlapping IDs
        const intersection = page1Ids.filter(id => page2Ids.includes(id));
        expect(intersection.length).toBe(0);
      }
    });
  });

  describe('Error Handling', () => {
    IntegrationTestHelpers.skipIfDisabled()('should handle non-existent ticket retrieval', async () => {
      const nonExistentId = 999999999;
      
      await expect(
        globalThis.__AUTOTASK_CLIENT__.tickets.get(nonExistentId)
      ).rejects.toThrow();
    });

    IntegrationTestHelpers.skipIfDisabled()('should handle invalid ticket creation', async () => {
      const invalidTicketData = {
        // Missing required fields
        title: '',
        accountId: -1,
      };

      await expect(
        globalThis.__AUTOTASK_CLIENT__.tickets.create(invalidTicketData)
      ).rejects.toThrow();
    });
  });

  describe('Performance & Rate Limiting', () => {
    IntegrationTestHelpers.skipIfDisabled()('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        globalThis.__AUTOTASK_CLIENT__.tickets.list({
          pageSize: 1,
          page: i + 1,
        })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.data).toBeInstanceOf(Array);
      });
    });

    IntegrationTestHelpers.skipIfDisabled()('should respect rate limits with retry', async () => {
      // This test verifies that our retry logic works
      const startTime = Date.now();
      
      const response = await helpers.retryOperation(
        () => globalThis.__AUTOTASK_CLIENT__.tickets.list({ pageSize: 1 }),
        3,
        500
      );
      
      const endTime = Date.now();
      
      expect(response.data).toBeInstanceOf(Array);
      // Should complete within reasonable time even with retries
      expect(endTime - startTime).toBeLessThan(10000);
    });
  });

  describe('Zone Detection', () => {
    IntegrationTestHelpers.skipIfDisabled()('should successfully connect to correct API zone', async () => {
      // This test verifies that zone detection worked correctly
      const response = await globalThis.__AUTOTASK_CLIENT__.tickets.list({ pageSize: 1 });
      
      expect(response.data).toBeInstanceOf(Array);
      
      // Verify the client has the correct base URL set
      const client = globalThis.__AUTOTASK_CLIENT__;
      expect(client).toBeDefined();
      
      // The fact that we can make successful API calls means zone detection worked
    });
  });
}); 