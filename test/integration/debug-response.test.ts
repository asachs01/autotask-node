import { setupIntegrationTest } from './setup';

describe('Debug API Response Structure', () => {
  let config: any;

  beforeAll(async () => {
    config = await setupIntegrationTest();
  });

  it('should show actual tickets response structure', async () => {
    try {
      const result = await config.client.tickets.list({ pageSize: 1 });
      console.log('=== TICKETS RESPONSE STRUCTURE ===');
      console.log('Full result:', JSON.stringify(result, null, 2));
      console.log('Type of result:', typeof result);
      console.log('Type of result.data:', typeof result.data);
      console.log('Is result.data an array?', Array.isArray(result.data));
      if (result.data && typeof result.data === 'object') {
        console.log('Keys in result.data:', Object.keys(result.data));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  it('should show actual accounts response structure', async () => {
    try {
      // Try the query endpoint that works for tickets
      const response = await config.client.axios.post('/Companies/query', {
        filter: [{ field: 'id', op: 'gte', value: 0 }],
        pageSize: 1,
      });
      console.log('=== COMPANIES RESPONSE STRUCTURE ===');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('Companies query error:', error.message);
      console.log('Status:', error.response?.status);
      console.log('Response data:', error.response?.data);
    }
  });
});
