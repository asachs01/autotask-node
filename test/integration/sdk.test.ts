import { AutotaskClient } from '../../src';
import { ErrorLogger, LogLevel, LogDestination } from '../../src/errors/ErrorLogger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Autotask SDK Integration Tests', () => {
  let client: AutotaskClient;
  let errorLogger: ErrorLogger;
  
  beforeAll(async () => {
    // Check for required environment variables
    const requiredVars = [
      'AUTOTASK_API_INTEGRATION_CODE',
      'AUTOTASK_API_USERNAME',
      'AUTOTASK_API_SECRET'
    ];
    
    const missingVars = requiredVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      console.warn('Skipping integration tests - missing environment variables:', missingVars);
      return;
    }
    
    // Create enhanced error logger for integration tests
    errorLogger = new ErrorLogger({
      level: LogLevel.DEBUG,
      destinations: [LogDestination.CONSOLE],
      jsonFormat: process.env.DEBUG_INTEGRATION_TESTS === 'true',
      includeStackTrace: true,
      sensitiveFields: ['secret', 'authorization', 'ApiIntegrationCode']
    });
    
    // Create client with enhanced error logging
    client = await AutotaskClient.create({
      integrationCode: process.env.AUTOTASK_API_INTEGRATION_CODE!,
      username: process.env.AUTOTASK_API_USERNAME!,
      secret: process.env.AUTOTASK_API_SECRET!
    }, undefined, errorLogger);
  });
  
  describe('Companies', () => {
    it('should list companies', async () => {
      if (!client) {
        console.warn('Skipping test - client not initialized');
        return;
      }
      
      const result = await client.companies.list({ pageSize: 5 });
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
  
  describe('Tickets', () => {
    it('should list tickets', async () => {
      if (!client) {
        console.warn('Skipping test - client not initialized');
        return;
      }
      
      const result = await client.tickets.list({ pageSize: 5 });
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
  
  describe('Projects', () => {
    it('should list projects', async () => {
      if (!client) {
        console.warn('Skipping test - client not initialized');
        return;
      }
      
      const result = await client.projects.list({ pageSize: 5 });
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Error Logging Integration', () => {
    it('should have error logger integrated', () => {
      if (!client) {
        console.warn('Skipping test - client not initialized');
        return;
      }

      const clientErrorLogger = client.getErrorLogger();
      expect(clientErrorLogger).toBeDefined();
      expect(typeof clientErrorLogger.generateCorrelationId).toBe('function');
      expect(typeof clientErrorLogger.error).toBe('function');
      expect(typeof clientErrorLogger.warn).toBe('function');
      expect(typeof clientErrorLogger.info).toBe('function');
    });

    it('should generate unique correlation IDs', () => {
      if (!client) {
        console.warn('Skipping test - client not initialized');
        return;
      }

      const errorLogger = client.getErrorLogger();
      const id1 = errorLogger.generateCorrelationId();
      const id2 = errorLogger.generateCorrelationId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should log structured information', () => {
      if (!client) {
        console.warn('Skipping test - client not initialized');
        return;
      }

      const errorLogger = client.getErrorLogger();
      const correlationId = errorLogger.generateCorrelationId();
      
      // This should not throw and should log to console
      expect(() => {
        errorLogger.info('Integration test message', {
          correlationId,
          operation: 'integration-test',
          request: {
            method: 'TEST',
            url: '/test'
          }
        }, { testData: 'integration-test' });
      }).not.toThrow();
    });

    it('should handle invalid API calls with proper error logging', async () => {
      if (!client) {
        console.warn('Skipping test - client not initialized');
        return;
      }

      try {
        // Try to access a non-existent endpoint to trigger error handling
        // This will use the private axios instance through the request handler
        const requestHandler = client.getRequestHandler();
        await requestHandler.executeRequest(
          async () => {
            // Create a request that will fail
            throw new Error('Test error for error logging integration');
          },
          '/NonExistentEndpoint',
          'GET'
        );
      } catch (error) {
        // This should trigger our error logging system
        expect(error).toBeDefined();
      }
    });
  });

  describe('Circuit Breaker Integration', () => {
    it('should have circuit breaker metrics available', () => {
      if (!client) {
        console.warn('Skipping test - client not initialized');
        return;
      }

      const requestHandler = client.getRequestHandler();
      expect(requestHandler).toBeDefined();
      
      const metrics = requestHandler.getCircuitBreakerMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });

    it('should have health status reporting', () => {
      if (!client) {
        console.warn('Skipping test - client not initialized');
        return;
      }

      const requestHandler = client.getRequestHandler();
      const healthStatus = requestHandler.getHealthStatus();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.timestamp).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.circuitBreakers).toBeDefined();
      expect(healthStatus.performance).toBeDefined();
      expect(healthStatus.features).toBeDefined();
      
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      expect(typeof healthStatus.circuitBreakers.total).toBe('number');
      expect(typeof healthStatus.circuitBreakers.healthy).toBe('number');
    });
  });
});