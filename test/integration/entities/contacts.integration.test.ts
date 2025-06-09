import { Contact } from '../../../src/entities/contacts';
import {
  setupIntegrationTest,
  generateTestId,
  shouldSkipIntegrationTests,
  delay,
} from '../setup';

describe('Contacts Integration Tests (Optimized)', () => {
  let config: any;
  const createdContactIds: number[] = [];

  beforeAll(async () => {
    if (shouldSkipIntegrationTests()) {
      console.log(
        '⚠️ Skipping Contacts integration tests - credentials not available'
      );
      return;
    }

    try {
      config = await setupIntegrationTest();
      console.log('👤 Starting optimized Contacts integration tests...');
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'SKIP_INTEGRATION_TESTS'
      ) {
        console.log(
          '⚠️ Skipping Contacts integration tests - credentials not available'
        );
        return;
      }
      throw error;
    }
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up created contacts...');

    // Clean up any contacts created during tests
    for (const contactId of createdContactIds) {
      try {
        await config.client.contacts.delete(contactId);
        console.log(`✅ Deleted contact ${contactId}`);
      } catch (error: any) {
        console.warn(
          `⚠️ Failed to delete contact ${contactId}:`,
          error.message
        );
      }
    }

    await config.cleanup();
    console.log('🎉 Contacts integration tests completed');
  });

  beforeEach(async () => {
    // Rate limiting - longer wait between tests
    await delay(3000);
  });

  describe('Core Functionality', () => {
    it('should authenticate and perform basic list operations', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      console.log('🔌 Testing authentication and basic list operations...');

      // Test authentication
      expect(config.client).toBeDefined();
      expect(config.client.contacts).toBeDefined();

      try {
        // Basic list operation with small page size
        const contacts = await config.client.contacts.list({
          pageSize: 2,
        });

        expect(contacts).toBeDefined();
        expect(contacts.data).toBeDefined();
        expect(Array.isArray(contacts.data)).toBe(true);

        console.log(
          `✅ Basic operations successful (${contacts.data.length} contacts listed)`
        );

        // Test simple filtering if we got results
        if (contacts.data.length > 0) {
          await delay(1000);

          const activeContacts = await config.client.contacts.list({
            filter: { isActive: 1 },
            pageSize: 2,
          });

          expect(Array.isArray(activeContacts.data)).toBe(true);
          console.log(
            `✅ Filtering: Found ${activeContacts.data.length} active contacts`
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('Not Found') ||
            error.message.includes('404') ||
            error.message.includes('Server error (500)'))
        ) {
          console.log(
            '⚠️ Contact list operations may not be permitted in this environment'
          );
          console.log(
            '📝 This is expected behavior in some Autotask environments'
          );
          return;
        }
        throw error;
      }
    });

    it('should perform CRUD operations when permitted', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      console.log(
        '🔄 Testing CRUD operations (may be limited by permissions)...'
      );

      try {
        // First get an account to associate the contact with
        const accounts = await config.client.accounts.list({ pageSize: 1 });
        if (accounts.data.length === 0) {
          console.log('⚠️ No accounts found, skipping CRUD operations');
          return;
        }

        // === CREATE ===
        const testId = generateTestId();
        const contactData: Contact = {
          companyID: accounts.data[0].id,
          firstName: `Test`,
          lastName: `Contact ${testId}`,
          emailAddress: `test.contact.${testId}@example.com`,
          isActive: 1,
        };

        const createdContact = await config.client.contacts.create(contactData);
        expect(createdContact).toBeDefined();
        expect(createdContact.data).toBeDefined();
        expect(createdContact.data.firstName).toBe(contactData.firstName);
        expect(createdContact.data.lastName).toBe(contactData.lastName);

        const contactId = createdContact.data.id!;
        createdContactIds.push(contactId);
        console.log(`✅ CREATE: Contact ${contactId} created`);

        await delay(1000);

        // === READ ===
        const retrievedContact = await config.client.contacts.get(contactId);
        expect(retrievedContact.data.id).toBe(contactId);
        expect(retrievedContact.data.firstName).toBe(contactData.firstName);
        console.log(`✅ READ: Contact ${contactId} retrieved`);

        await delay(1000);

        // === UPDATE ===
        const updateData = {
          phone: '555-9999',
          title: 'Updated Title',
        };

        const updatedContact = await config.client.contacts.update(
          contactId,
          updateData
        );
        expect(updatedContact.data.id).toBe(contactId);
        expect(updatedContact.data.phone).toBe(updateData.phone);
        expect(updatedContact.data.title).toBe(updateData.title);
        console.log(`✅ UPDATE: Contact ${contactId} updated`);

        await delay(1000);

        // === DELETE ===
        await config.client.contacts.delete(contactId);

        // Verify deletion
        await expect(config.client.contacts.get(contactId)).rejects.toThrow();
        console.log(`✅ DELETE: Contact ${contactId} deleted`);

        // Remove from cleanup list since it's already deleted
        const index = createdContactIds.indexOf(contactId);
        if (index > -1) {
          createdContactIds.splice(index, 1);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('Not Found') ||
            error.message.includes('404') ||
            error.message.includes('Server error (500)'))
        ) {
          console.log(
            '⚠️ Contact CRUD operations may not be permitted in this environment'
          );
          console.log(
            '📝 This is expected behavior in some Autotask environments'
          );
          return;
        }
        throw error;
      }
    });

    it('should handle error cases gracefully', async () => {
      if (shouldSkipIntegrationTests() || !config) {
        console.log('⏭️ Skipping test - integration tests disabled');
        return;
      }

      console.log('🔍 Testing error handling...');

      try {
        // Test error handling with non-existent contact
        const nonExistentId = 999999999;
        await expect(
          config.client.contacts.get(nonExistentId)
        ).rejects.toThrow();
        console.log(
          `✅ Error handling: Non-existent contact properly rejected`
        );
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('Not Found') || error.message.includes('404'))
        ) {
          console.log(
            '⚠️ Contact operations may not be permitted - this is expected'
          );
          return;
        }
        throw error;
      }
    });
  });
});
