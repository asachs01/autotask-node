import * as dotenv from 'dotenv';
import { TestEnvironmentType } from '../framework/TestEnvironment';

// Load environment variables
dotenv.config({ path: '.env.test' });

/**
 * Integration test configuration interface
 */
export interface IntegrationTestConfig {
  // Environment settings
  environment: TestEnvironmentType;
  skipIntegrationTests: boolean;
  
  // API credentials
  autotask: {
    username: string;
    integrationCode: string;
    secret: string;
    apiUrl?: string;
  };
  
  // Test data settings
  testData: {
    accountId?: number;
    contactId?: number;
    projectId?: number;
    resourceId?: number;
  };
  
  // Performance settings
  performance: {
    maxRetries: number;
    baseRetryDelay: number;
    testTimeout: number;
    concurrency: {
      maxConcurrent: number;
      rateLimitPerSecond: number;
    };
  };
  
  // Logging settings
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enablePerformanceLogs: boolean;
    enableDetailedErrors: boolean;
  };
  
  // Safety settings
  safety: {
    allowDataCreation: boolean;
    allowDataModification: boolean;
    allowDataDeletion: boolean;
    maxTestEntitiesPerType: number;
  };
}

/**
 * Load and validate integration test configuration
 */
export function loadTestConfig(): IntegrationTestConfig {
  // Check if integration tests should be skipped
  const skipTests = process.env.SKIP_INTEGRATION_TESTS === 'true';
  
  if (skipTests) {
    return getDefaultConfig(true);
  }
  
  // Validate required credentials
  const requiredVars = ['AUTOTASK_USERNAME', 'AUTOTASK_INTEGRATION_CODE', 'AUTOTASK_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.warn('Integration tests will be skipped. Copy .env.test.example to .env.test and configure it.');
    return getDefaultConfig(true);
  }
  
  // Determine environment type
  const envType = determineEnvironmentType();
  
  const config: IntegrationTestConfig = {
    environment: envType,
    skipIntegrationTests: false,
    
    autotask: {
      username: process.env.AUTOTASK_USERNAME!,
      integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
      secret: process.env.AUTOTASK_SECRET!,
      apiUrl: process.env.AUTOTASK_API_URL,
    },
    
    testData: {
      accountId: process.env.TEST_ACCOUNT_ID ? parseInt(process.env.TEST_ACCOUNT_ID) : undefined,
      contactId: process.env.TEST_CONTACT_ID ? parseInt(process.env.TEST_CONTACT_ID) : undefined,
      projectId: process.env.TEST_PROJECT_ID ? parseInt(process.env.TEST_PROJECT_ID) : undefined,
      resourceId: process.env.TEST_RESOURCE_ID ? parseInt(process.env.TEST_RESOURCE_ID) : undefined,
    },
    
    performance: {
      maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
      baseRetryDelay: parseInt(process.env.BASE_RETRY_DELAY || '1000'),
      testTimeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
      concurrency: {
        maxConcurrent: envType === TestEnvironmentType.PRODUCTION_READONLY ? 2 : 5,
        rateLimitPerSecond: envType === TestEnvironmentType.PRODUCTION_READONLY ? 1 : 3,
      },
    },
    
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      enablePerformanceLogs: process.env.ENABLE_PERFORMANCE_LOGS === 'true',
      enableDetailedErrors: process.env.ENABLE_DETAILED_ERRORS === 'true',
    },
    
    safety: {
      allowDataCreation: envType === TestEnvironmentType.SANDBOX,
      allowDataModification: envType === TestEnvironmentType.SANDBOX,
      allowDataDeletion: envType === TestEnvironmentType.SANDBOX,
      maxTestEntitiesPerType: 10,
    },
  };
  
  // Override safety settings based on explicit environment variables
  if (process.env.ALLOW_DATA_CREATION === 'true') {
    config.safety.allowDataCreation = true;
  }
  if (process.env.ALLOW_DATA_MODIFICATION === 'true') {
    config.safety.allowDataModification = true;
  }
  if (process.env.ALLOW_DATA_DELETION === 'true') {
    config.safety.allowDataDeletion = true;
  }
  
  return config;
}

/**
 * Determine environment type based on configuration
 */
function determineEnvironmentType(): TestEnvironmentType {
  const explicitEnv = process.env.TEST_ENVIRONMENT as TestEnvironmentType;
  
  if (explicitEnv && Object.values(TestEnvironmentType).includes(explicitEnv)) {
    return explicitEnv;
  }
  
  // Auto-detect based on patterns
  const apiUrl = process.env.AUTOTASK_API_URL || '';
  const username = process.env.AUTOTASK_USERNAME || '';
  
  if (apiUrl.includes('sandbox') || username.includes('test') || username.includes('demo')) {
    return TestEnvironmentType.SANDBOX;
  }
  
  if (apiUrl.includes('staging') || username.includes('staging')) {
    return TestEnvironmentType.STAGING;
  }
  
  // Default to production readonly for safety
  return TestEnvironmentType.PRODUCTION_READONLY;
}

/**
 * Get default configuration when integration tests are skipped
 */
function getDefaultConfig(skip: boolean): IntegrationTestConfig {
  return {
    environment: TestEnvironmentType.PRODUCTION_READONLY,
    skipIntegrationTests: skip,
    
    autotask: {
      username: 'test@example.com',
      integrationCode: 'test-code',
      secret: 'test-secret',
    },
    
    testData: {},
    
    performance: {
      maxRetries: 3,
      baseRetryDelay: 1000,
      testTimeout: 30000,
      concurrency: {
        maxConcurrent: 2,
        rateLimitPerSecond: 1,
      },
    },
    
    logging: {
      level: 'info',
      enablePerformanceLogs: false,
      enableDetailedErrors: false,
    },
    
    safety: {
      allowDataCreation: false,
      allowDataModification: false,
      allowDataDeletion: false,
      maxTestEntitiesPerType: 0,
    },
  };
}

/**
 * Validate test configuration
 */
export function validateTestConfig(config: IntegrationTestConfig): string[] {
  const errors: string[] = [];
  
  if (!config.skipIntegrationTests) {
    if (!config.autotask.username) {
      errors.push('Autotask username is required');
    }
    
    if (!config.autotask.integrationCode) {
      errors.push('Autotask integration code is required');
    }
    
    if (!config.autotask.secret) {
      errors.push('Autotask secret is required');
    }
    
    if (config.performance.maxRetries < 1) {
      errors.push('Max retries must be at least 1');
    }
    
    if (config.performance.testTimeout < 5000) {
      errors.push('Test timeout must be at least 5000ms');
    }
  }
  
  return errors;
}

/**
 * Get configuration summary for logging
 */
export function getConfigSummary(config: IntegrationTestConfig): string {
  if (config.skipIntegrationTests) {
    return 'Integration tests are SKIPPED (no credentials or explicitly disabled)';
  }
  
  return `Integration test configuration:
  Environment: ${config.environment}
  Username: ${config.autotask.username}
  API URL: ${config.autotask.apiUrl || 'auto-detect'}
  Data Creation: ${config.safety.allowDataCreation ? 'ALLOWED' : 'DISABLED'}
  Data Modification: ${config.safety.allowDataModification ? 'ALLOWED' : 'DISABLED'}
  Data Deletion: ${config.safety.allowDataDeletion ? 'ALLOWED' : 'DISABLED'}
  Max Concurrent: ${config.performance.concurrency.maxConcurrent}
  Test Timeout: ${config.performance.testTimeout}ms
  Log Level: ${config.logging.level}`;
}
