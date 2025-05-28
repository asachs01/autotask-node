import { AutotaskClient } from '../../../src/client/AutotaskClient';
import { Account } from '../../../src/entities/accounts';
import { setupIntegrationTest, delay, generateTestId } from '../setup';
import { IntegrationTestConfig } from '../setup';

describe('Accounts Integration Tests', () => {
  let config: IntegrationTestConfig;
  const createdAccountIds: number[] = [];

  beforeAll(async () => {
    config = await setupIntegrationTest();
    console.log('🏢 Starting Accounts integration tests...');
  });

  afterAll(async () => {
    // Note: Companies cannot be deleted via API according to Autotask documentation
    // We'll leave test accounts in place but mark them as inactive if possible
    if (createdAccountIds.length > 0) {
      console.log(
        `⚠️ Created ${createdAccountIds.length} test accounts that cannot be deleted via API`
      );
      console.log('Test account IDs:', createdAccountIds);

      // Try to deactivate test accounts instead
      for (const accountId of createdAccountIds) {
        try {
          await config.client.accounts.update(accountId, { isActive: false });
          console.log(`✅ Deactivated test account ${accountId}`);
        } catch (error: any) {
          console.log(
            `⚠️ Could not deactivate account ${accountId}:`,
            error.message
          );
        }
      }
    }

    await config.cleanup();
  });

  describe('Authentication and Connectivity', () => {
    it('should connect to Autotask API successfully', async () => {
      expect(config.client).toBeDefined();
      expect(config.client.accounts).toBeDefined();
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new account', async () => {
      const testId = generateTestId();
      const accountData: Account = {
        companyName: `Test Account ${testId}`,
        companyType: 1, // Customer
        phone: '555-0123',
        isActive: true,
      };

      const createdAccount = await config.client.accounts.create(accountData);

      expect(createdAccount).toBeDefined();
      expect(createdAccount.data).toBeDefined();
      expect(createdAccount.data.companyName).toBe(accountData.companyName);
      expect(createdAccount.data.companyType).toBe(accountData.companyType);

      if (createdAccount.data.id) {
        createdAccountIds.push(createdAccount.data.id);
      }
    });

    it('should retrieve an existing account', async () => {
      // First create an account to retrieve
      const testId = generateTestId();
      const accountData: Account = {
        companyName: `Test Account ${testId}`,
        companyType: 1,
        isActive: true,
      };

      const createdAccount = await config.client.accounts.create(accountData);

      if (!createdAccount.data.id) {
        throw new Error('Failed to create account for retrieval test');
      }

      createdAccountIds.push(createdAccount.data.id);

      // Now retrieve it
      const retrievedAccount = await config.client.accounts.get(
        createdAccount.data.id
      );

      expect(retrievedAccount).toBeDefined();
      expect(retrievedAccount.data).toBeDefined();
      expect(retrievedAccount.data.id).toBe(createdAccount.data.id);
      expect(retrievedAccount.data.companyName).toBe(accountData.companyName);
    });

    it('should update an existing account', async () => {
      // First create an account to update
      const testId = generateTestId();
      const accountData: Account = {
        companyName: `Test Account ${testId}`,
        companyType: 1,
        isActive: true,
      };

      const createdAccount = await config.client.accounts.create(accountData);

      if (!createdAccount.data.id) {
        throw new Error('Failed to create account for update test');
      }

      createdAccountIds.push(createdAccount.data.id);

      // Update the account
      const updateData = {
        phone: '555-9999',
        fax: '555-8888',
      };

      const updatedAccount = await config.client.accounts.update(
        createdAccount.data.id,
        updateData
      );

      expect(updatedAccount).toBeDefined();
      expect(updatedAccount.data).toBeDefined();
      expect(updatedAccount.data.phone).toBe(updateData.phone);
      expect(updatedAccount.data.fax).toBe(updateData.fax);
    });

    // Note: Delete test removed because Companies cannot be deleted via API
  });

  describe('List Operations', () => {
    it('should list accounts with pagination', async () => {
      const accounts = await config.client.accounts.list({
        pageSize: 5,
        page: 1,
      });

      expect(accounts).toBeDefined();
      expect(accounts.data).toBeDefined();
      expect(Array.isArray(accounts.data)).toBe(true);
      expect(accounts.data.length).toBeLessThanOrEqual(5);

      if (accounts.data.length > 0) {
        expect(accounts.data[0]).toHaveProperty('id');
        expect(accounts.data[0]).toHaveProperty('companyName');
      }
    });

    it('should filter accounts by active status', async () => {
      const activeAccounts = await config.client.accounts.list({
        filter: { isActive: true },
        pageSize: 3,
      });

      expect(activeAccounts).toBeDefined();
      expect(activeAccounts.data).toBeDefined();
      expect(Array.isArray(activeAccounts.data)).toBe(true);

      // All returned accounts should be active
      activeAccounts.data.forEach(account => {
        expect(account.isActive).toBe(true);
      });
    });

    it('should sort accounts by company name', async () => {
      const sortedAccounts = await config.client.accounts.list({
        sort: 'companyName asc',
        pageSize: 5,
      });

      expect(sortedAccounts).toBeDefined();
      expect(sortedAccounts.data).toBeDefined();
      expect(Array.isArray(sortedAccounts.data)).toBe(true);

      // Check if results are sorted (if we have multiple accounts)
      if (sortedAccounts.data.length > 1) {
        for (let i = 1; i < sortedAccounts.data.length; i++) {
          const prev = sortedAccounts.data[i - 1].companyName || '';
          const curr = sortedAccounts.data[i].companyName || '';
          expect(prev.localeCompare(curr)).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent account retrieval', async () => {
      const nonExistentId = 999999999;

      await expect(config.client.accounts.get(nonExistentId)).rejects.toThrow();
    });

    it('should validate required fields when creating account', async () => {
      const invalidAccountData = {
        // Missing required companyName
        companyType: 1,
      };

      await expect(
        config.client.accounts.create(invalidAccountData)
      ).rejects.toThrow();
    });
  });

  describe('Business Logic', () => {
    it('should handle different company types', async () => {
      const testId = generateTestId();

      // Test Customer type (1)
      const customerData: Account = {
        companyName: `Test Customer ${testId}`,
        companyType: 1, // Customer
        isActive: true,
      };

      const createdCustomer = await config.client.accounts.create(customerData);
      expect(createdCustomer.data.companyType).toBe(1);

      if (createdCustomer.data.id) {
        createdAccountIds.push(createdCustomer.data.id);
      }
    });

    it('should handle account activation/deactivation', async () => {
      const testId = generateTestId();
      const accountData: Account = {
        companyName: `Test Account ${testId}`,
        companyType: 1,
        isActive: true,
      };

      const createdAccount = await config.client.accounts.create(accountData);

      if (!createdAccount.data.id) {
        throw new Error('Failed to create account for activation test');
      }

      createdAccountIds.push(createdAccount.data.id);

      // Deactivate the account
      const deactivatedAccount = await config.client.accounts.update(
        createdAccount.data.id,
        {
          isActive: false,
        }
      );

      expect(deactivatedAccount.data.isActive).toBe(false);

      // Reactivate the account
      const reactivatedAccount = await config.client.accounts.update(
        createdAccount.data.id,
        {
          isActive: true,
        }
      );

      expect(reactivatedAccount.data.isActive).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics', async () => {
      const initialReport = config.client
        .getRequestHandler()
        .getPerformanceReport();
      const initialRequestCount = initialReport.metrics.requestCount || 0;

      // Make a simple request
      await config.client.accounts.list({ pageSize: 1 });

      const finalReport = config.client
        .getRequestHandler()
        .getPerformanceReport();
      const finalRequestCount = finalReport.metrics.requestCount || 0;

      expect(finalRequestCount).toBeGreaterThan(initialRequestCount);
    });
  });
});
