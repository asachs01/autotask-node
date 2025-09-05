/**
 * Cache System Tests
 * 
 * Tests for the comprehensive caching system including all components.
 */

import {
  CacheManager,
  CacheConfigBuilder,
  createAutotaskCacheManager,
  CacheStorageType,
  CacheStrategy,
  InvalidationPattern,
  CacheKeyContext
} from '../../src/caching';

describe('Cache System', () => {
  let cacheManager: CacheManager;

  beforeEach(async () => {
    // Use memory storage for tests
    const config = CacheConfigBuilder.testing().build();
    cacheManager = new CacheManager(config);
    await cacheManager.initialize();
  });

  afterEach(async () => {
    if (cacheManager) {
      await cacheManager.shutdown();
    }
  });

  describe('CacheManager', () => {
    test('should initialize successfully', async () => {
      expect(cacheManager).toBeDefined();
      
      const health = await cacheManager.getHealthStatus();
      expect(health.healthy).toBe(true);
      expect(health.primaryStore).toBe(true);
    });

    test('should cache and retrieve values', async () => {
      const context: CacheKeyContext = {
        method: 'GET',
        endpoint: '/api/tickets',
        entityType: 'tickets',
        params: { status: 'Open' }
      };

      const testData = { id: 1, title: 'Test Ticket', status: 'Open' };

      // Set value
      const setResult = await cacheManager.set(context, testData);
      expect(setResult).toBe(true);

      // Get value
      const getResult = await cacheManager.get<typeof testData>(context);
      expect(getResult.success).toBe(true);
      expect(getResult.hit).toBe(true);
      expect(getResult.value).toEqual(testData);
    });

    test('should handle cache miss', async () => {
      const context: CacheKeyContext = {
        method: 'GET',
        endpoint: '/api/nonexistent',
        entityType: 'tickets',
        params: { id: 999 }
      };

      const getResult = await cacheManager.get(context);
      expect(getResult.success).toBe(true);
      expect(getResult.hit).toBe(false);
      expect(getResult.value).toBeUndefined();
    });

    test('should execute cache strategy', async () => {
      const context: CacheKeyContext = {
        method: 'GET',
        endpoint: '/api/tickets',
        entityType: 'tickets',
        params: { id: 1 }
      };

      const testData = { id: 1, title: 'Test Ticket', status: 'Open' };
      let fetcherCalled = false;

      const fetcher = async () => {
        fetcherCalled = true;
        return testData;
      };

      // First call should fetch data
      const result1 = await cacheManager.executeStrategy(context, fetcher, {
        strategy: CacheStrategy.LAZY_LOADING
      });

      expect(result1).toEqual(testData);
      expect(fetcherCalled).toBe(true);

      // Reset flag
      fetcherCalled = false;

      // Second call should use cache
      const result2 = await cacheManager.executeStrategy(context, fetcher, {
        strategy: CacheStrategy.LAZY_LOADING
      });

      expect(result2).toEqual(testData);
      expect(fetcherCalled).toBe(false); // Should not call fetcher
    });

    test('should invalidate by pattern', async () => {
      const contexts = [
        {
          method: 'GET',
          endpoint: '/api/tickets/1',
          entityType: 'tickets',
          params: { id: 1 }
        },
        {
          method: 'GET',
          endpoint: '/api/tickets/2', 
          entityType: 'tickets',
          params: { id: 2 }
        }
      ];

      const testData1 = { id: 1, title: 'Ticket 1' };
      const testData2 = { id: 2, title: 'Ticket 2' };

      // Cache both values
      await cacheManager.set(contexts[0], testData1);
      await cacheManager.set(contexts[1], testData2);

      // Verify both are cached
      const beforeInvalidation1 = await cacheManager.get(contexts[0]);
      const beforeInvalidation2 = await cacheManager.get(contexts[1]);
      expect(beforeInvalidation1.hit).toBe(true);
      expect(beforeInvalidation2.hit).toBe(true);

      // Invalidate by pattern - match the actual key format
      const invalidatedCount = await cacheManager.invalidate(
        InvalidationPattern.PATTERN,
        'test:autotask::tickets:*'
      );
      
      expect(invalidatedCount).toBeGreaterThan(0);

      // Verify both are invalidated
      const afterInvalidation1 = await cacheManager.get(contexts[0]);
      const afterInvalidation2 = await cacheManager.get(contexts[1]);
      expect(afterInvalidation1.hit).toBe(false);
      expect(afterInvalidation2.hit).toBe(false);
    });

    test('should collect metrics', async () => {
      // Create a separate cache manager with metrics enabled
      const metricsConfig = CacheConfigBuilder.testing()
        .withMetrics(true)  // Enable metrics for this test
        .build();
      const metricsManager = new CacheManager(metricsConfig);
      await metricsManager.initialize();

      const context: CacheKeyContext = {
        method: 'GET',
        endpoint: '/api/tickets',
        entityType: 'tickets',
        params: { id: 1 }
      };

      const testData = { id: 1, title: 'Test Ticket' };

      // Generate some cache activity
      await metricsManager.set(context, testData);
      await metricsManager.get(context); // Hit
      
      const missContext = { ...context, params: { id: 2 } };
      await metricsManager.get(missContext); // Miss

      const metrics = metricsManager.getMetrics();
      
      expect(metrics.hits).toBeGreaterThan(0);
      expect(metrics.misses).toBeGreaterThan(0);
      expect(metrics.hitRate).toBeGreaterThan(0);
      expect(metrics.entryCount).toBeGreaterThan(0);

      await metricsManager.shutdown();
    });
  });

  describe('CacheConfigBuilder', () => {
    test('should create development configuration', () => {
      const config = CacheConfigBuilder.development().build();
      
      expect(config.storageType).toBe(CacheStorageType.MEMORY);
      expect(config.maxEntries).toBe(1000);
      expect(config.defaultTtl).toBe(60000);
      expect(config.enableMetrics).toBe(true);
      expect(config.keyPrefix).toBe('dev:autotask:');
    });

    test('should create production configuration', () => {
      const config = CacheConfigBuilder.production().build();
      
      expect(config.storageType).toBe(CacheStorageType.REDIS);
      expect(config.maxEntries).toBe(100000);
      expect(config.defaultTtl).toBe(300000);
      expect(config.enableMetrics).toBe(true);
      expect(config.enableWarmup).toBe(true);
      expect(config.keyPrefix).toBe('prod:autotask:');
    });

    test('should create testing configuration', () => {
      const config = CacheConfigBuilder.testing().build();
      
      expect(config.storageType).toBe(CacheStorageType.MEMORY);
      expect(config.maxEntries).toBe(100);
      expect(config.defaultTtl).toBe(10000);
      expect(config.enableMetrics).toBe(false);
      expect(config.keyPrefix).toBe('test:autotask:');
    });

    test('should customize configuration', () => {
      const config = CacheConfigBuilder.development()
        .withMaxEntries(5000)
        .withDefaultTtl(120000)
        .withKeyPrefix('custom:prefix:')
        .withStampedeProtection(true, 3000)
        .build();
      
      expect(config.maxEntries).toBe(5000);
      expect(config.defaultTtl).toBe(120000);
      expect(config.keyPrefix).toBe('custom:prefix:');
      expect(config.preventStampede).toBe(true);
      expect(config.stampedeTimeout).toBe(3000);
    });

    test('should add entity configurations', () => {
      const config = CacheConfigBuilder.development()
        .withEntityConfig('tickets', {
          defaultTtl: 30000,
          strategy: CacheStrategy.REFRESH_AHEAD,
          defaultTags: ['tickets', 'test']
        })
        .build();
      
      const ticketsConfig = config.entityConfigs.get('tickets');
      expect(ticketsConfig).toBeDefined();
      expect(ticketsConfig?.defaultTtl).toBe(30000);
      expect(ticketsConfig?.strategy).toBe(CacheStrategy.REFRESH_AHEAD);
      expect(ticketsConfig?.defaultTags).toEqual(['tickets', 'test']);
    });
  });

  describe('createAutotaskCacheManager', () => {
    test('should create cache manager with default configurations', async () => {
      const manager = await createAutotaskCacheManager({
        storageType: CacheStorageType.MEMORY,
        maxEntries: 1000
      });

      expect(manager).toBeInstanceOf(CacheManager);
      
      const health = await manager.getHealthStatus();
      expect(health.healthy).toBe(true);

      await manager.shutdown();
    });

    test('should have predefined entity configurations', async () => {
      const manager = await createAutotaskCacheManager({
        storageType: CacheStorageType.MEMORY
      });

      const ticketsContext: CacheKeyContext = {
        method: 'GET',
        endpoint: '/api/tickets',
        entityType: 'tickets',
        params: {}
      };

      const companiesContext: CacheKeyContext = {
        method: 'GET',
        endpoint: '/api/companies',
        entityType: 'companies',
        params: {}
      };

      // Test that different entity types have different TTLs
      const testData = { test: 'data' };
      
      await manager.set(ticketsContext, testData);
      await manager.set(companiesContext, testData);

      // Both should be cached
      const ticketsResult = await manager.get(ticketsContext);
      const companiesResult = await manager.get(companiesContext);

      expect(ticketsResult.hit).toBe(true);
      expect(companiesResult.hit).toBe(true);

      await manager.shutdown();
    });
  });
});

describe('Cache Integration', () => {
  test('should handle concurrent operations', async () => {
    const config = CacheConfigBuilder.testing()
      .withStampedeProtection(true, 1000)
      .build();
    
    const manager = new CacheManager(config);
    await manager.initialize();

    const context: CacheKeyContext = {
      method: 'GET',
      endpoint: '/api/tickets/concurrent',
      entityType: 'tickets',
      params: { id: 'concurrent' }
    };

    let fetcherCallCount = 0;
    const fetcher = async () => {
      fetcherCallCount++;
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
      return { id: 'concurrent', data: `call-${fetcherCallCount}` };
    };

    // Execute multiple concurrent requests
    const promises = Array.from({ length: 5 }, () =>
      manager.executeStrategy(context, fetcher, { strategy: CacheStrategy.LAZY_LOADING })
    );

    const results = await Promise.all(promises);

    // All results should be the same (from cache after first fetch)
    const firstResult = results[0];
    results.forEach(result => {
      expect(result).toEqual(firstResult);
    });

    // Fetcher should only be called once due to stampede protection
    expect(fetcherCallCount).toBe(1);

    await manager.shutdown();
  });

  test('should handle cache failures gracefully', async () => {
    const config = CacheConfigBuilder.testing().build();
    const manager = new CacheManager(config);
    await manager.initialize();

    // Shutdown the cache to simulate failure
    await manager.shutdown();

    const context: CacheKeyContext = {
      method: 'GET',
      endpoint: '/api/tickets/failure',
      entityType: 'tickets',
      params: { id: 'failure' }
    };

    const testData = { id: 'failure', data: 'test' };

    // Operations should fail gracefully
    const setResult = await manager.set(context, testData);
    expect(setResult).toBe(false);

    const getResult = await manager.get(context);
    expect(getResult.success).toBe(false);
    expect(getResult.hit).toBe(false);
    expect(getResult.error).toBeDefined();
  });
});