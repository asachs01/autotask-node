/**
 * CRITICAL: Network Request Blocker for Tests
 * 
 * This file ensures NO real network requests are made during testing
 * to prevent hitting Kaseya's API rate limits.
 */

import nock from 'nock';
import axios from 'axios';

// Block ALL external network requests
beforeAll(() => {
  // Disable all network connections except localhost
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
  
  // Override axios defaults to prevent real requests
  axios.defaults.adapter = 'http'; // Use HTTP adapter, not real network
  
  console.log('🚫 NETWORK REQUESTS BLOCKED - All external API calls disabled');
});

// Clean up after all tests
afterAll(() => {
  nock.cleanAll();
  nock.restore();
  console.log('✅ Network blocking cleanup completed');
});

// Intercept any Autotask API calls and return mock responses
beforeEach(() => {
  // Block all Autotask API domains
  nock('https://webservices.autotask.net')
    .persist()
    .get(/.*/)
    .reply(200, { items: [] });
    
  nock('https://webservices14.autotask.net')
    .persist()
    .get(/.*/)
    .reply(200, { items: [] })
    .post(/.*/)
    .reply(200, { item: {} })
    .put(/.*/)
    .reply(200, { item: {} })
    .patch(/.*/)
    .reply(200, { item: {} })
    .delete(/.*/)
    .reply(200, { itemId: 1 });
    
  // Block any other external domains
  nock(/^https?:\/\/(?!127\.0\.0\.1|localhost).*/)
    .persist()
    .get(/.*/)
    .reply(200, { message: 'Blocked by test setup' });
});

export {};