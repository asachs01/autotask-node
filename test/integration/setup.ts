import { AutotaskClient } from '../../src/client/AutotaskClient';
import { AutotaskAuth } from '../../src/types';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../../env.test') });

export interface IntegrationTestConfig {
  client: AutotaskClient;
  auth: AutotaskAuth;
  testAccountId?: number;
  testContactId?: number;
  testProjectId?: number;
  testTicketId?: number;
  cleanup: () => Promise<void>;
}

/**
 * Global setup for integration tests
 * This runs once before all integration tests start
 */
export default async function globalSetup() {
  console.log('🚀 Setting up integration test environment...');

  // Validate that we're not running in production
  validateTestEnvironment();

  // Validate required environment variables
  const requiredVars = [
    'AUTOTASK_USERNAME',
    'AUTOTASK_INTEGRATION_CODE',
    'AUTOTASK_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required test environment variables: ${missing.join(', ')}\n` +
        'Please copy env.test.example to env.test and configure your test credentials.'
    );
  }

  // Store configuration globally for tests to access
  const testAccountId = process.env.TEST_ACCOUNT_ID
    ? parseInt(process.env.TEST_ACCOUNT_ID)
    : undefined;
  const testContactId = process.env.TEST_CONTACT_ID
    ? parseInt(process.env.TEST_CONTACT_ID)
    : undefined;
  const testProjectId = process.env.TEST_PROJECT_ID
    ? parseInt(process.env.TEST_PROJECT_ID)
    : undefined;
  const testTicketId = process.env.TEST_TICKET_ID
    ? parseInt(process.env.TEST_TICKET_ID)
    : undefined;

  (globalThis as any).__INTEGRATION_CONFIG__ = {
    testAccountId,
    testContactId,
    testProjectId,
    testTicketId,
    skipIntegrationTests: process.env.SKIP_INTEGRATION_TESTS === 'true',
  };

  console.log('✅ Integration test environment setup complete');
}

/**
 * Setup integration test environment
 * This creates a real AutotaskClient instance for testing against live API
 */
export async function setupIntegrationTest(): Promise<IntegrationTestConfig> {
  // Validate required environment variables
  const requiredVars = [
    'AUTOTASK_USERNAME',
    'AUTOTASK_INTEGRATION_CODE',
    'AUTOTASK_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required test environment variables: ${missing.join(', ')}\n` +
        'Please copy env.test.example to env.test and configure your test credentials.'
    );
  }

  const auth: AutotaskAuth = {
    username: process.env.AUTOTASK_USERNAME!,
    integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
    secret: process.env.AUTOTASK_SECRET!,
    apiUrl: process.env.AUTOTASK_API_URL,
  };

  // Create client with performance monitoring enabled
  const client = await AutotaskClient.create(auth, {
    timeout: 10000,
    maxConcurrentRequests: 10,
    enableConnectionPooling: true,
    enableCompression: true,
    requestsPerSecond: 10,
    keepAliveTimeout: 15000,
  });

  // Test IDs for cleanup (if provided in env)
  const testAccountId = process.env.TEST_ACCOUNT_ID
    ? parseInt(process.env.TEST_ACCOUNT_ID)
    : undefined;
  const testContactId = process.env.TEST_CONTACT_ID
    ? parseInt(process.env.TEST_CONTACT_ID)
    : undefined;
  const testProjectId = process.env.TEST_PROJECT_ID
    ? parseInt(process.env.TEST_PROJECT_ID)
    : undefined;
  const testTicketId = process.env.TEST_TICKET_ID
    ? parseInt(process.env.TEST_TICKET_ID)
    : undefined;

  // Cleanup function to remove test data
  const cleanup = async (): Promise<void> => {
    console.log('🧹 Cleaning up integration test data...');

    try {
      // Clean up in reverse dependency order
      if (testTicketId) {
        try {
          await client.tickets.delete(testTicketId);
          console.log(`✅ Cleaned up test ticket ${testTicketId}`);
        } catch (error) {
          console.warn(`⚠️ Could not clean up ticket ${testTicketId}:`, error);
        }
      }

      if (testContactId) {
        try {
          await client.contacts.delete(testContactId);
          console.log(`✅ Cleaned up test contact ${testContactId}`);
        } catch (error) {
          console.warn(
            `⚠️ Could not clean up contact ${testContactId}:`,
            error
          );
        }
      }

      if (testProjectId) {
        try {
          await client.projects.delete(testProjectId);
          console.log(`✅ Cleaned up test project ${testProjectId}`);
        } catch (error) {
          console.warn(
            `⚠️ Could not clean up project ${testProjectId}:`,
            error
          );
        }
      }

      // Note: We typically don't delete test accounts as they may be shared
      console.log('🎉 Integration test cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  };

  return {
    client,
    auth,
    testAccountId,
    testContactId,
    testProjectId,
    testTicketId,
    cleanup,
  };
}

/**
 * Utility function to wait for a specified amount of time
 * Useful for rate limiting and API delays
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a unique test identifier
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate that we're running in test environment
 */
export function validateTestEnvironment(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Integration tests should not be run in production environment'
    );
  }

  if (
    !process.env.AUTOTASK_USERNAME?.includes('test') &&
    !process.env.AUTOTASK_USERNAME?.includes('sandbox')
  ) {
    console.warn(
      '⚠️ Warning: Test username does not contain "test" or "sandbox"'
    );
  }
}
