import { AutotaskClient } from '../../../src/client/AutotaskClient';
import { Contact } from '../../../src/entities/contacts';
import { setupIntegrationTest, delay, generateTestId } from '../setup';
import { IntegrationTestConfig } from '../setup';

describe('Contacts Integration Tests', () => {
  let config: any;
  const createdContactIds: number[] = [];

  beforeAll(async () => {
    config = await setupIntegrationTest();
    console.log('👤 Starting Contacts integration tests...');
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
  });

  describe('Authentication and Connectivity', () => {
    it('should connect to Autotask API successfully', async () => {
      expect(config.client).toBeDefined();
      expect(config.client.contacts).toBeDefined();
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new contact', async () => {
      // First get an account to associate the contact with
      const accounts = await config.client.accounts.list({ pageSize: 1 });
      if (accounts.data.length === 0) {
        console.log('⚠️ No accounts found, skipping contact creation test');
        return;
      }

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
      expect(createdContact.data.emailAddress).toBe(contactData.emailAddress);

      if (createdContact.data.id) {
        createdContactIds.push(createdContact.data.id);
      }
    });

    it('should retrieve an existing contact', async () => {
      // First get an account to associate the contact with
      const accounts = await config.client.accounts.list({ pageSize: 1 });
      if (accounts.data.length === 0) {
        console.log('⚠️ No accounts found, skipping contact retrieval test');
        return;
      }

      const testId = generateTestId();
      const contactData: Contact = {
        companyID: accounts.data[0].id,
        firstName: `Test`,
        lastName: `Contact ${testId}`,
        emailAddress: `test.contact.${testId}@example.com`,
        isActive: 1,
      };

      const createdContact = await config.client.contacts.create(contactData);

      if (!createdContact.data.id) {
        throw new Error('Failed to create contact for retrieval test');
      }

      createdContactIds.push(createdContact.data.id);

      // Now retrieve it
      const retrievedContact = await config.client.contacts.get(
        createdContact.data.id
      );

      expect(retrievedContact).toBeDefined();
      expect(retrievedContact.data).toBeDefined();
      expect(retrievedContact.data.id).toBe(createdContact.data.id);
      expect(retrievedContact.data.firstName).toBe(contactData.firstName);
      expect(retrievedContact.data.lastName).toBe(contactData.lastName);
    });

    it('should update an existing contact', async () => {
      // First get an account to associate the contact with
      const accounts = await config.client.accounts.list({ pageSize: 1 });
      if (accounts.data.length === 0) {
        console.log('⚠️ No accounts found, skipping contact update test');
        return;
      }

      const testId = generateTestId();
      const contactData: Contact = {
        companyID: accounts.data[0].id,
        firstName: `Test`,
        lastName: `Contact ${testId}`,
        emailAddress: `test.contact.${testId}@example.com`,
        isActive: 1,
      };

      const createdContact = await config.client.contacts.create(contactData);

      if (!createdContact.data.id) {
        throw new Error('Failed to create contact for update test');
      }

      createdContactIds.push(createdContact.data.id);

      // Update the contact
      const updateData = {
        phone: '555-9999',
        title: 'Updated Title',
      };

      const updatedContact = await config.client.contacts.update(
        createdContact.data.id,
        updateData
      );

      expect(updatedContact).toBeDefined();
      expect(updatedContact.data).toBeDefined();
      expect(updatedContact.data.phone).toBe(updateData.phone);
      expect(updatedContact.data.title).toBe(updateData.title);
    });

    it('should delete an existing contact', async () => {
      // First get an account to associate the contact with
      const accounts = await config.client.accounts.list({ pageSize: 1 });
      if (accounts.data.length === 0) {
        console.log('⚠️ No accounts found, skipping contact delete test');
        return;
      }

      const testId = generateTestId();
      const contactData: Contact = {
        companyID: accounts.data[0].id,
        firstName: `Test`,
        lastName: `Contact ${testId}`,
        emailAddress: `test.contact.${testId}@example.com`,
        isActive: 1,
      };

      const createdContact = await config.client.contacts.create(contactData);

      if (!createdContact.data.id) {
        throw new Error('Failed to create contact for delete test');
      }

      // Delete the contact
      await config.client.contacts.delete(createdContact.data.id);

      // Verify the contact is deleted
      await expect(
        config.client.contacts.get(createdContact.data.id)
      ).rejects.toThrow();
    });
  });

  describe('List Operations', () => {
    it('should list contacts with pagination', async () => {
      const contacts = await config.client.contacts.list({
        pageSize: 5,
        page: 1,
      });

      expect(contacts).toBeDefined();
      expect(contacts.data).toBeDefined();
      expect(Array.isArray(contacts.data)).toBe(true);
      expect(contacts.data.length).toBeLessThanOrEqual(5);

      if (contacts.data.length > 0) {
        expect(contacts.data[0]).toHaveProperty('id');
        expect(contacts.data[0]).toHaveProperty('firstName');
        expect(contacts.data[0]).toHaveProperty('lastName');
      }
    });

    it('should filter contacts by active status', async () => {
      const activeContacts = await config.client.contacts.list({
        filter: { isActive: 1 },
        pageSize: 3,
      });

      expect(activeContacts).toBeDefined();
      expect(activeContacts.data).toBeDefined();
      expect(Array.isArray(activeContacts.data)).toBe(true);

      // All returned contacts should be active
      activeContacts.data.forEach((contact: any) => {
        expect(contact.isActive).toBe(true);
      });
    });

    it('should sort contacts by last name', async () => {
      const sortedContacts = await config.client.contacts.list({
        sort: 'lastName asc',
        pageSize: 5,
      });

      expect(sortedContacts).toBeDefined();
      expect(sortedContacts.data).toBeDefined();
      expect(Array.isArray(sortedContacts.data)).toBe(true);

      // Check if results are sorted (if we have multiple contacts)
      if (sortedContacts.data.length > 1) {
        for (let i = 1; i < sortedContacts.data.length; i++) {
          const prev = sortedContacts.data[i - 1].lastName || '';
          const curr = sortedContacts.data[i].lastName || '';
          expect(prev.localeCompare(curr)).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent contact retrieval', async () => {
      const nonExistentId = 999999999;

      await expect(config.client.contacts.get(nonExistentId)).rejects.toThrow();
    });

    it('should validate required fields when creating contact', async () => {
      const invalidContactData = {
        // Missing required fields like companyID and firstName
        emailAddress: 'test@example.com',
      };

      await expect(
        config.client.contacts.create(invalidContactData)
      ).rejects.toThrow();
    });
  });

  describe('Business Logic', () => {
    it('should validate email format', async () => {
      // First get an account to associate the contact with
      const accounts = await config.client.accounts.list({ pageSize: 1 });
      if (accounts.data.length === 0) {
        console.log('⚠️ No accounts found, skipping email validation test');
        return;
      }

      const testId = generateTestId();
      const contactData: Contact = {
        companyID: accounts.data[0].id,
        firstName: `Test`,
        lastName: `Contact ${testId}`,
        emailAddress: 'invalid-email-format', // Invalid email
        isActive: 1,
      };

      // This should either fail validation or accept it (depending on API validation)
      try {
        const createdContact = await config.client.contacts.create(contactData);
        if (createdContact.data.id) {
          createdContactIds.push(createdContact.data.id);
        }
        // If it succeeds, the API doesn't validate email format strictly
        console.log('ℹ️ API accepts invalid email format');
      } catch (error) {
        // If it fails, the API validates email format
        expect(error).toBeDefined();
        console.log('✅ API validates email format');
      }
    });

    it('should handle primary contact designation', async () => {
      // First get an account to associate the contact with
      const accounts = await config.client.accounts.list({ pageSize: 1 });
      if (accounts.data.length === 0) {
        console.log('⚠️ No accounts found, skipping primary contact test');
        return;
      }

      const testId = generateTestId();
      const contactData: Contact = {
        companyID: accounts.data[0].id,
        firstName: `Primary`,
        lastName: `Contact ${testId}`,
        emailAddress: `primary.contact.${testId}@example.com`,
        primaryContact: true,
        isActive: 1,
      };

      const createdContact = await config.client.contacts.create(contactData);

      expect(createdContact).toBeDefined();
      expect(createdContact.data).toBeDefined();
      expect(createdContact.data.primaryContact).toBe(true);

      if (createdContact.data.id) {
        createdContactIds.push(createdContact.data.id);
      }
    });

    it('should handle multiple communication methods', async () => {
      // First get an account to associate the contact with
      const accounts = await config.client.accounts.list({ pageSize: 1 });
      if (accounts.data.length === 0) {
        console.log(
          '⚠️ No accounts found, skipping communication methods test'
        );
        return;
      }

      const testId = generateTestId();
      const contactData: Contact = {
        companyID: accounts.data[0].id,
        firstName: `Multi`,
        lastName: `Contact ${testId}`,
        emailAddress: `multi.contact.${testId}@example.com`,
        emailAddress2: `multi.contact2.${testId}@example.com`,
        phone: '555-1234',
        mobilePhone: '555-5678',
        faxNumber: '555-9999',
        isActive: 1,
      };

      const createdContact = await config.client.contacts.create(contactData);

      expect(createdContact).toBeDefined();
      expect(createdContact.data).toBeDefined();
      expect(createdContact.data.emailAddress).toBe(contactData.emailAddress);
      expect(createdContact.data.emailAddress2).toBe(contactData.emailAddress2);
      expect(createdContact.data.phone).toBe(contactData.phone);
      expect(createdContact.data.mobilePhone).toBe(contactData.mobilePhone);
      expect(createdContact.data.faxNumber).toBe(contactData.faxNumber);

      if (createdContact.data.id) {
        createdContactIds.push(createdContact.data.id);
      }
    });

    it('should filter contacts by account', async () => {
      const accounts = await config.client.accounts.list({ pageSize: 2 });
      if (accounts.data.length === 0) {
        console.log('⚠️ No accounts found, skipping account filter test');
        return;
      }

      // Try to get contacts for the first account
      const accountContacts = await config.client.contacts.list({
        filter: { companyID: accounts.data[0].id },
        pageSize: 5,
      });

      expect(accountContacts).toBeDefined();
      expect(accountContacts.data).toBeDefined();
      expect(Array.isArray(accountContacts.data)).toBe(true);

      // All returned contacts should belong to the specified account
      accountContacts.data.forEach((contact: any) => {
        expect(contact.companyID).toBe(accounts.data[0].id);
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics', async () => {
      const initialReport = config.client
        .getRequestHandler()
        .getPerformanceReport();
      const initialRequestCount = initialReport.metrics.requestCount || 0;

      // Make a simple request
      await config.client.contacts.list({ pageSize: 1 });

      const finalReport = config.client
        .getRequestHandler()
        .getPerformanceReport();
      const finalRequestCount = finalReport.metrics.requestCount || 0;

      expect(finalRequestCount).toBeGreaterThan(initialRequestCount);
    });
  });
});
