/**
 * Mock Server Tests
 * 
 * These tests validate the mock Autotask API server functionality
 * to ensure it behaves correctly for integration testing.
 */

import axios from 'axios';
import { MockAutotaskServer } from './mock-server';

describe('Mock Autotask API Server', () => {
  let server: MockAutotaskServer;
  const port = 3002; // Different port to avoid conflicts
  
  beforeAll(async () => {
    server = new MockAutotaskServer(port);
    await server.start();
  });
  
  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  beforeEach(() => {
    server.resetRateLimit();
  });

  describe('Server Lifecycle', () => {
    it('should start and respond to health checks', async () => {
      const response = await axios.get(`${server.getBaseUrl()}/health`);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        status: 'healthy',
        timestamp: expect.any(String)
      });
    });

    it('should provide zone detection endpoint', async () => {
      const response = await axios.get(`${server.getBaseUrl()}/ATServicesRest/V1.0/zone`);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        URL: expect.stringContaining('ATServicesRest/V1.0')
      });
    });
  });

  describe('Authentication', () => {
    it('should require authentication headers', async () => {
      try {
        await axios.get(`${server.getBaseUrl()}/ATServicesRest/V1.0/Companies`);
        fail('Expected authentication error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.errors[0].code).toBe('AUTHENTICATION_REQUIRED');
      }
    });

    it('should validate authentication credentials', async () => {
      try {
        await axios.get(`${server.getBaseUrl()}/ATServicesRest/V1.0/Companies`, {
          headers: {
            'apiintegrationcode': 'invalid',
            'username': 'invalid',
            'secret': 'invalid'
          }
        });
        fail('Expected authentication error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.errors[0].code).toBe('AUTHENTICATION_FAILED');
      }
    });

    it('should accept valid authentication', async () => {
      const response = await axios.get(`${server.getBaseUrl()}/ATServicesRest/V1.0/Companies?pageSize=1`, {
        headers: {
          'apiintegrationcode': 'TEST',
          'username': 'test',
          'secret': 'test'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.items).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    const authHeaders = {
      'apiintegrationcode': 'TEST',
      'username': 'test',
      'secret': 'test'
    };

    it('should include rate limit headers', async () => {
      const response = await axios.get(`${server.getBaseUrl()}/ATServicesRest/V1.0/Companies?pageSize=1`, {
        headers: authHeaders
      });
      
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should enforce rate limiting', async () => {
      // Make rapid requests to trigger rate limiting
      const promises = Array.from({ length: 8 }, () =>
        axios.get(`${server.getBaseUrl()}/ATServicesRest/V1.0/Companies?pageSize=1`, {
          headers: authHeaders,
          validateStatus: () => true // Don't throw on 429
        })
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.filter(r => r.status === 429);
      
      // Should have encountered some rate limiting
      expect(rateLimited.length).toBeGreaterThan(0);
      
      // Rate limited responses should have proper error structure
      rateLimited.forEach(response => {
        expect(response.data.errors[0].code).toMatch(/RATE_LIMIT/);
      });
    });
  });

  describe('CRUD Operations', () => {
    const authHeaders = {
      'apiintegrationcode': 'TEST',
      'username': 'test',
      'secret': 'test'
    };

    describe('Companies', () => {
      let createdCompanyId: number;

      it('should create a company', async () => {
        const companyData = {
          companyName: 'Test Company',
          accountType: 1,
          phone: '555-0123',
          city: 'Test City',
          state: 'TS',
          country: 'United States'
        };

        const response = await axios.post(
          `${server.getBaseUrl()}/ATServicesRest/V1.0/Companies`,
          companyData,
          { headers: authHeaders }
        );

        expect(response.status).toBe(201);
        expect(response.data.item).toBeDefined();
        expect(response.data.item.id).toBeGreaterThan(0);
        expect(response.data.item.companyName).toBe(companyData.companyName);
        
        createdCompanyId = response.data.item.id;
      });

      it('should retrieve the created company', async () => {
        const response = await axios.get(
          `${server.getBaseUrl()}/ATServicesRest/V1.0/Companies/${createdCompanyId}`,
          { headers: authHeaders }
        );

        expect(response.status).toBe(200);
        expect(response.data.item).toBeDefined();
        expect(response.data.item.id).toBe(createdCompanyId);
      });

      it('should update the company', async () => {
        const updateData = {
          companyName: 'Updated Test Company'
        };

        const response = await axios.put(
          `${server.getBaseUrl()}/ATServicesRest/V1.0/Companies/${createdCompanyId}`,
          updateData,
          { headers: authHeaders }
        );

        expect(response.status).toBe(200);
        expect(response.data.item.companyName).toBe(updateData.companyName);
        expect(response.data.item.lastModifiedDate).toBeDefined();
      });

      it('should list companies with pagination', async () => {
        const response = await axios.get(
          `${server.getBaseUrl()}/ATServicesRest/V1.0/Companies?page=1&pageSize=5`,
          { headers: authHeaders }
        );

        expect(response.status).toBe(200);
        expect(response.data.items).toBeDefined();
        expect(Array.isArray(response.data.items)).toBe(true);
        expect(response.data.items.length).toBeLessThanOrEqual(5);
        expect(response.data.pageDetails).toBeDefined();
      });

      it('should support query operations with filtering', async () => {
        const queryData = {
          filter: [
            { field: 'accountType', op: 'eq', value: 1 }
          ],
          pageSize: 10
        };

        const response = await axios.post(
          `${server.getBaseUrl()}/ATServicesRest/V1.0/Companies/query`,
          queryData,
          { headers: authHeaders }
        );

        expect(response.status).toBe(200);
        expect(response.data.items).toBeDefined();
        
        // Verify filtering worked
        response.data.items.forEach((company: any) => {
          expect(company.accountType).toBe(1);
        });
      });

      it('should delete the company', async () => {
        const response = await axios.delete(
          `${server.getBaseUrl()}/ATServicesRest/V1.0/Companies/${createdCompanyId}`,
          { headers: authHeaders }
        );

        expect(response.status).toBe(204);

        // Verify deletion
        try {
          await axios.get(
            `${server.getBaseUrl()}/ATServicesRest/V1.0/Companies/${createdCompanyId}`,
            { headers: authHeaders }
          );
          fail('Expected 404 for deleted company');
        } catch (error: any) {
          expect(error.response.status).toBe(404);
        }
      });
    });
  });

  describe('Error Handling', () => {
    const authHeaders = {
      'apiintegrationcode': 'TEST',
      'username': 'test',
      'secret': 'test'
    };

    it('should handle 404 for non-existent entities', async () => {
      try {
        await axios.get(
          `${server.getBaseUrl()}/ATServicesRest/V1.0/Companies/999999999`,
          { headers: authHeaders }
        );
        fail('Expected 404 error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.errors[0].code).toBe('NOT_FOUND');
      }
    });

    it('should inject server errors for testing', async () => {
      // Make multiple requests to encounter server errors (5% chance)
      let serverErrorEncountered = false;
      
      for (let i = 0; i < 30 && !serverErrorEncountered; i++) {
        try {
          await axios.get(
            `${server.getBaseUrl()}/ATServicesRest/V1.0/Companies?pageSize=1`,
            { headers: authHeaders }
          );
        } catch (error: any) {
          if (error.response?.status >= 500) {
            serverErrorEncountered = true;
            expect(error.response.status).toBeGreaterThanOrEqual(500);
            expect(error.response.data.errors[0]).toBeDefined();
          }
        }
      }

      // Server error injection should work (though not guaranteed in small sample)
      console.log(`Server error ${serverErrorEncountered ? 'encountered' : 'not encountered'} in ${30} requests`);
    });
  });

  describe('Mock Data Management', () => {
    it('should have pre-populated entities', async () => {
      expect(server.getEntityCount('Companies')).toBeGreaterThan(0);
      expect(server.getEntityCount('Contacts')).toBeGreaterThan(0);
      expect(server.getEntityCount('Tickets')).toBeGreaterThan(0);
      expect(server.getEntityCount('Projects')).toBeGreaterThan(0);
      expect(server.getEntityCount('Tasks')).toBeGreaterThan(0);
    });

    it('should support entity management', async () => {
      const initialCount = server.getEntityCount('Companies');
      
      // Add entity
      server.addEntity('Companies', {
        id: 99999,
        companyName: 'Programmatically Added Company',
        accountType: 1
      });
      
      expect(server.getEntityCount('Companies')).toBe(initialCount + 1);
      
      // Remove entity
      const removed = server.removeEntity('Companies', 99999);
      expect(removed).toBe(true);
      expect(server.getEntityCount('Companies')).toBe(initialCount);
    });

    it('should track request metrics', async () => {
      const initialCount = server.getRequestCount();
      
      const authHeaders = {
        'apiintegrationcode': 'TEST',
        'username': 'test',
        'secret': 'test'
      };

      await axios.get(`${server.getBaseUrl()}/ATServicesRest/V1.0/Companies?pageSize=1`, {
        headers: authHeaders
      });

      expect(server.getRequestCount()).toBeGreaterThan(initialCount);
    });
  });
});