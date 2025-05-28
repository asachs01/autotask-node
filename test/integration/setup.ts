import { AutotaskClient } from '../../src/client/AutotaskClient';
import { AutotaskAuth } from '../../src/types';
import winston from 'winston';
import dotenv from 'dotenv';

// Load environment variables for integration tests
dotenv.config({ path: '.env.test' });

declare global {
  var __AUTOTASK_CLIENT__: AutotaskClient;
  var __INTEGRATION_CONFIG__: {
    auth: AutotaskAuth;
    testAccountId: number;
    testContactId: number;
    testProjectId: number;
    skipIntegrationTests: boolean;
  };
}

// Extend globalThis interface for TypeScript
declare global {
  namespace globalThis {
    var __AUTOTASK_CLIENT__: AutotaskClient;
    var __INTEGRATION_CONFIG__: {
      auth: AutotaskAuth;
      testAccountId: number;
      testContactId: number;
      testProjectId: number;
      skipIntegrationTests: boolean;
    };
  }
}

/**
 * Global setup for integration tests
 * This runs once before all integration tests
 */
export default async function globalSetup() {
  console.log('🚀 Setting up integration test environment...');

  // Check if integration tests should be skipped
  const skipTests =
    process.env.SKIP_INTEGRATION_TESTS === 'true' ||
    !process.env.AUTOTASK_USERNAME ||
    !process.env.AUTOTASK_INTEGRATION_CODE ||
    !process.env.AUTOTASK_SECRET;

  if (skipTests) {
    console.log(
      '⚠️  Skipping integration tests - missing credentials or SKIP_INTEGRATION_TESTS=true'
    );
    globalThis.__INTEGRATION_CONFIG__ = {
      auth: {} as AutotaskAuth,
      testAccountId: 0,
      testContactId: 0,
      testProjectId: 0,
      skipIntegrationTests: true,
    };
    return;
  }

  // Setup authentication
  const auth: AutotaskAuth = {
    username: process.env.AUTOTASK_USERNAME!,
    integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
    secret: process.env.AUTOTASK_SECRET!,
    apiUrl: process.env.AUTOTASK_API_URL, // Optional override
  };

  // Create logger for integration tests
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({
        filename: 'test/integration/logs/integration-tests.log',
        level: 'debug',
      }),
    ],
  });

  try {
    // Initialize Autotask client using the static create method
    console.log('🔍 Creating Autotask client...');
    const client = await AutotaskClient.create(auth);

    // Test basic connectivity
    console.log('🔍 Testing API connectivity...');
    const testTickets = await client.tickets.list({
      filter: { id: 1 },
      pageSize: 1,
    });

    console.log('✅ API connectivity confirmed');

    // Store global references
    globalThis.__AUTOTASK_CLIENT__ = client;
    globalThis.__INTEGRATION_CONFIG__ = {
      auth,
      testAccountId: parseInt(process.env.TEST_ACCOUNT_ID || '0'),
      testContactId: parseInt(process.env.TEST_CONTACT_ID || '0'),
      testProjectId: parseInt(process.env.TEST_PROJECT_ID || '0'),
      skipIntegrationTests: false,
    };

    console.log('✅ Integration test environment ready');
  } catch (error) {
    console.error('❌ Failed to setup integration test environment:', error);
    throw error;
  }
}
