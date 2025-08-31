import { AutotaskClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Autotask SDK Integration Tests', () => {
  let client: AutotaskClient;
  
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
    
    // Create client
    client = await AutotaskClient.create({
      integrationCode: process.env.AUTOTASK_API_INTEGRATION_CODE!,
      username: process.env.AUTOTASK_API_USERNAME!,
      secret: process.env.AUTOTASK_API_SECRET!
    });
  });
  
  describe('Companies', () => {
    it('should list companies', async () => {
      if (!client) {
        console.warn('Skipping test - client not initialized');
        return;
      }
      
      const result = await client.Companies.list({ pageSize: 5 });
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
      
      const result = await client.Tickets.list({ pageSize: 5 });
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
      
      const result = await client.Projects.list({ pageSize: 5 });
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});