import { getIntegrationHelpers, IntegrationTestHelpers } from '../helpers/testHelpers';

IntegrationTestHelpers.describeIfEnabled('Accounts Integration Tests', () => {
  let helpers: IntegrationTestHelpers;
  let createdAccountIds: number[] = [];

  beforeAll(() => {
    helpers = getIntegrationHelpers();
  });

  afterAll(async () => {
    // Cleanup any created accounts
    for (const accountId of createdAccountIds) {
      await helpers.cleanupTestAccount(accountId);
    }
  });

  describe('CRUD Operations', () => {
    IntegrationTestHelpers.skipIfDisabled()('should create a new account', async () => {
      const accountData = {
        accountName: `Integration Test Account - ${Date.now()}`,
        accountType: 1, // Customer
        phone: '555-0123',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'United States',
      };

      const response = await globalThis.__AUTOTASK_CLIENT__.accounts.create(accountData);
      
      expect(response.data).toBeValidAutotaskEntity();
      expect(response.data.accountName).toBe(accountData.accountName);
      expect(response.data.accountType).toBe(accountData.accountType);
      expect(response.data.phone).toBe(accountData.phone);
      
      createdAccountIds.push(response.data.id);
    });

    IntegrationTestHelpers.skipIfDisabled()('should retrieve an account by ID', async () => {
      // Create an account first
      const createResponse = await helpers.createTestAccount();
      createdAccountIds.push(createResponse.data.id);

      // Retrieve the account
      const response = await globalThis.__AUTOTASK_CLIENT__.accounts.get(createResponse.data.id);
      
      expect(response.data).toBeValidAutotaskEntity();
      expect(response.data.id).toBe(createResponse.data.id);
      expect(response.data.accountName).toBe(createResponse.data.accountName);
    });

    IntegrationTestHelpers.skipIfDisabled()('should update an account', async () => {
      // Create an account first
      const createResponse = await helpers.createTestAccount();
      createdAccountIds.push(createResponse.data.id);

      const updateData = {
        accountName: `Updated Account Name - ${Date.now()}`,
        phone: '555-9999',
      };

      // Update the account
      const response = await globalThis.__AUTOTASK_CLIENT__.accounts.update(
        createResponse.data.id, 
        updateData
      );
      
      expect(response.data).toBeValidAutotaskEntity();
      expect(response.data.id).toBe(createResponse.data.id);
      expect(response.data.accountName).toBe(updateData.accountName);
      expect(response.data.phone).toBe(updateData.phone);
    });

    IntegrationTestHelpers.skipIfDisabled()('should list accounts with filtering', async () => {
      const response = await globalThis.__AUTOTASK_CLIENT__.accounts.list({
        filter: { accountType: 1 }, // Customer accounts
        pageSize: 10,
      });
      
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
      
      // Verify all returned accounts have accountType = 1
      response.data.forEach(account => {
        expect(account).toBeValidAutotaskEntity();
        expect(account.accountType).toBe(1);
      });
    });
  });

  describe('Business Logic', () => {
    IntegrationTestHelpers.skipIfDisabled()('should handle account hierarchy', async () => {
      // Create a parent account
      const parentAccount = await helpers.createTestAccount({
        accountName: `Parent Account - ${Date.now()}`,
      });
      createdAccountIds.push(parentAccount.data.id);

      // Create a child account
      const childAccount = await helpers.createTestAccount({
        accountName: `Child Account - ${Date.now()}`,
        parentAccountId: parentAccount.data.id,
      });
      createdAccountIds.push(childAccount.data.id);

      // Verify the relationship
      expect(childAccount.data.parentAccountId).toBe(parentAccount.data.id);
    });

    IntegrationTestHelpers.skipIfDisabled()('should validate required fields', async () => {
      const invalidAccountData = {
        // Missing required accountName
        accountType: 1,
      };

      await expect(
        globalThis.__AUTOTASK_CLIENT__.accounts.create(invalidAccountData)
      ).rejects.toThrow();
    });
  });

  describe('Search and Filtering', () => {
    IntegrationTestHelpers.skipIfDisabled()('should search accounts by name', async () => {
      // Create a uniquely named account
      const uniqueName = `SearchTest-${Date.now()}`;
      const createResponse = await helpers.createTestAccount({
        accountName: uniqueName,
      });
      createdAccountIds.push(createResponse.data.id);

      // Search for the account
      const response = await globalThis.__AUTOTASK_CLIENT__.accounts.list({
        filter: { accountName: uniqueName },
      });
      
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
      
      const foundAccount = response.data.find(acc => acc.id === createResponse.data.id);
      expect(foundAccount).toBeDefined();
      expect(foundAccount?.accountName).toBe(uniqueName);
    });

    IntegrationTestHelpers.skipIfDisabled()('should filter by account type', async () => {
      const response = await globalThis.__AUTOTASK_CLIENT__.accounts.list({
        filter: { accountType: 1 }, // Customer
        pageSize: 5,
      });
      
      expect(response.data).toBeInstanceOf(Array);
      
      response.data.forEach(account => {
        expect(account.accountType).toBe(1);
      });
    });
  });

  describe('Error Handling', () => {
    IntegrationTestHelpers.skipIfDisabled()('should handle non-existent account retrieval', async () => {
      const nonExistentId = 999999999;
      
      await expect(
        globalThis.__AUTOTASK_CLIENT__.accounts.get(nonExistentId)
      ).rejects.toThrow();
    });

    IntegrationTestHelpers.skipIfDisabled()('should handle duplicate account names gracefully', async () => {
      // Create first account
      const accountName = `Duplicate Test - ${Date.now()}`;
      const firstAccount = await helpers.createTestAccount({
        accountName,
      });
      createdAccountIds.push(firstAccount.data.id);

      // Try to create second account with same name
      // Note: Autotask may or may not allow duplicate names depending on configuration
      try {
        const secondAccount = await helpers.createTestAccount({
          accountName,
        });
        createdAccountIds.push(secondAccount.data.id);
        
        // If it succeeds, that's also valid behavior
        expect(secondAccount.data).toBeValidAutotaskEntity();
      } catch (error) {
        // If it fails, that's expected behavior for duplicate prevention
        expect(error).toBeDefined();
      }
    });
  });
}); 