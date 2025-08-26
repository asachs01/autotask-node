import winston from 'winston';
import { IntelligentCache } from '../../src/performance/caching/IntelligentCache';
import { CacheConfig, CacheInvalidationRule, CacheWarmupStrategy } from '../../src/performance/types/CacheTypes';

describe('IntelligentCache', () => {
  let logger: winston.Logger;
  let cache: IntelligentCache;

  beforeEach(() => {
    logger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })]
    });

    const config: CacheConfig = {
      defaultTtl: 1000, // 1 second for fast tests
      maxSize: 10,
      enableStats: true,
      evictionStrategy: 'lru'
    };

    cache = new IntelligentCache(logger, config);
  });

  describe('Basic Cache Operations', () => {
    it('should set and get cache values', async () => {
      const key = 'test:key1';
      const value = { id: 1, name: 'Test Object' };

      await cache.set(key, value);
      const retrieved = await cache.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cache.get('non:existent:key');
      expect(result).toBeNull();
    });

    it('should delete cache entries', async () => {
      const key = 'test:delete:key';
      const value = { test: 'data' };

      await cache.set(key, value);
      expect(await cache.get(key)).toEqual(value);

      const deleted = await cache.delete(key);
      expect(deleted).toBe(true);
      expect(await cache.get(key)).toBeNull();
    });

    it('should check if keys exist', async () => {
      const key = 'test:exists:key';
      const value = { exists: true };

      expect(await cache.exists(key)).toBe(false);

      await cache.set(key, value);
      expect(await cache.exists(key)).toBe(true);

      await cache.delete(key);
      expect(await cache.exists(key)).toBe(false);
    });

    it('should clear all cache entries', async () => {
      await cache.set('key1', { value: 1 });
      await cache.set('key2', { value: 2 });
      await cache.set('key3', { value: 3 });

      await cache.clear();

      expect(await cache.get('key1')).toBeNull();
      expect(await cache.get('key2')).toBeNull();
      expect(await cache.get('key3')).toBeNull();
    });
  });

  describe('TTL and Expiration', () => {
    it('should respect default TTL', async () => {
      const key = 'test:ttl:default';
      const value = { ttl: 'default' };

      await cache.set(key, value);
      expect(await cache.get(key)).toEqual(value);

      // Wait for expiration (TTL is set to 1 second in test config)
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(await cache.get(key)).toBeNull();
    });

    it('should respect custom TTL', async () => {
      const key = 'test:ttl:custom';
      const value = { ttl: 'custom' };
      const customTtl = 500; // 500ms

      await cache.set(key, value, customTtl);
      expect(await cache.get(key)).toEqual(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 600));
      
      expect(await cache.get(key)).toBeNull();
    });
  });

  describe('Cache Statistics', () => {
    it('should track hit/miss statistics', async () => {
      const key1 = 'stats:key1';
      const key2 = 'stats:key2';
      const value1 = { id: 1 };
      const value2 = { id: 2 };

      // Set values
      await cache.set(key1, value1);
      await cache.set(key2, value2);

      // Generate hits
      await cache.get(key1); // Hit
      await cache.get(key1); // Hit
      await cache.get(key2); // Hit

      // Generate miss
      await cache.get('nonexistent'); // Miss

      const stats = cache.getStats();
      
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(75, 0); // 3/4 = 75%
      expect(stats.entries).toBe(2);
    });

    it('should track cache size and utilization', async () => {
      await cache.set('size:key1', { data: 'test1' });
      await cache.set('size:key2', { data: 'test2' });

      const stats = cache.getStats();
      
      expect(stats.entries).toBe(2);
      expect(stats.utilization).toBeCloseTo(20, 0); // 2/10 = 20%
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('Cache Eviction', () => {
    it('should evict entries when cache is full', async () => {
      // Fill cache to capacity (maxSize is 10 in test config)
      for (let i = 0; i < 12; i++) {
        await cache.set(`evict:key${i}`, { id: i });
      }

      const stats = cache.getStats();
      expect(stats.entries).toBeLessThanOrEqual(10);
      expect(stats.evictions).toBeGreaterThan(0);
    });

    it('should use LRU eviction strategy', async () => {
      // Fill cache
      for (let i = 0; i < 10; i++) {
        await cache.set(`lru:key${i}`, { id: i });
      }

      // Access some keys to make them more recently used
      await cache.get('lru:key5');
      await cache.get('lru:key6');
      await cache.get('lru:key7');

      // Add one more to trigger eviction
      await cache.set('lru:new', { id: 'new' });

      // Recently accessed keys should still be present
      expect(await cache.get('lru:key5')).toBeTruthy();
      expect(await cache.get('lru:key6')).toBeTruthy();
      expect(await cache.get('lru:key7')).toBeTruthy();
      expect(await cache.get('lru:new')).toBeTruthy();

      // Some older keys should have been evicted
      const stats = cache.getStats();
      expect(stats.entries).toBeLessThanOrEqual(10);
    });
  });

  describe('Cache Invalidation', () => {
    it('should add and apply invalidation rules', async () => {
      const rule: CacheInvalidationRule = {
        id: 'test:rule1',
        name: 'Test Companies Invalidation',
        triggerEntities: ['companies'],
        invalidatePatterns: ['company:*', 'companies:*'],
        strategy: 'immediate'
      };

      cache.addInvalidationRule(rule);

      // Set up some cache entries
      await cache.set('company:123', { id: 123 });
      await cache.set('companies:list', { items: [] });
      await cache.set('unrelated:data', { test: true });

      // Invalidate pattern
      const invalidatedCount = await cache.invalidatePattern('compan.*');

      expect(invalidatedCount).toBeGreaterThanOrEqual(2);
      expect(await cache.get('company:123')).toBeNull();
      expect(await cache.get('companies:list')).toBeNull();
      expect(await cache.get('unrelated:data')).toBeTruthy(); // Should remain
    });

    it('should remove invalidation rules', async () => {
      const rule: CacheInvalidationRule = {
        id: 'test:rule2',
        name: 'Test Rule to Remove',
        triggerEntities: ['test'],
        invalidatePatterns: ['test:*'],
        strategy: 'immediate'
      };

      cache.addInvalidationRule(rule);
      const removed = cache.removeInvalidationRule('test:rule2');

      expect(removed).toBe(true);
      
      // Try to remove again
      const removedAgain = cache.removeInvalidationRule('test:rule2');
      expect(removedAgain).toBe(false);
    });
  });

  describe('Cache Warming', () => {
    it('should add and execute warmup strategies', async () => {
      const strategy: CacheWarmupStrategy = {
        name: 'Test Warmup',
        entityTypes: ['companies', 'tickets'],
        priority: 5,
        queries: [
          {
            endpoint: '/companies',
            parameters: { status: 'active' },
            ttl: 60000
          },
          {
            endpoint: '/tickets',
            parameters: { priority: 'high' },
            ttl: 30000
          }
        ]
      };

      cache.addWarmupStrategy(strategy);

      // Execute warming
      await cache.warmCache();

      // Check that warming created cache entries
      const warmedKey1 = '/companies_{"status":"active"}';
      const warmedKey2 = '/tickets_{"priority":"high"}';

      expect(await cache.get(warmedKey1)).toBeTruthy();
      expect(await cache.get(warmedKey2)).toBeTruthy();
    });

    it('should execute custom warmup strategies', async () => {
      let customExecuted = false;

      const strategy: CacheWarmupStrategy = {
        name: 'Custom Warmup',
        entityTypes: ['custom'],
        priority: 8,
        customStrategy: async () => {
          customExecuted = true;
        }
      };

      cache.addWarmupStrategy(strategy);
      await cache.warmCache();

      expect(customExecuted).toBe(true);
    });
  });

  describe('Cache Metrics', () => {
    it('should provide detailed cache metrics', async () => {
      // Generate some cache activity
      await cache.set('metrics:key1', { data: 'test1' });
      await cache.set('metrics:key2', { data: 'test2' });
      
      await cache.get('metrics:key1'); // Hit
      await cache.get('metrics:key1'); // Hit
      await cache.get('nonexistent'); // Miss

      const metrics = cache.getMetrics();

      expect(metrics.overall).toBeDefined();
      expect(metrics.overall.hits).toBeGreaterThan(0);
      expect(metrics.overall.misses).toBeGreaterThan(0);
      expect(metrics.overall.hitRate).toBeGreaterThan(0);
      
      expect(metrics.trends).toBeDefined();
      expect(Array.isArray(metrics.trends.hitRate)).toBe(true);
      expect(Array.isArray(metrics.trends.size)).toBe(true);
      
      expect(metrics.topKeys).toBeDefined();
      expect(Array.isArray(metrics.topKeys)).toBe(true);
      
      expect(metrics.efficiencyScore).toBeGreaterThanOrEqual(0);
      expect(metrics.efficiencyScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Event Emission', () => {
    it('should emit cache operation events', (done) => {
      let eventCount = 0;

      cache.on('set', (key, value) => {
        expect(key).toBe('events:test');
        expect(value).toEqual({ event: 'test' });
        eventCount++;
      });

      cache.on('hit', (key, value) => {
        expect(key).toBe('events:test');
        expect(value).toEqual({ event: 'test' });
        eventCount++;
        
        if (eventCount === 2) {
          done();
        }
      });

      cache.set('events:test', { event: 'test' }).then(() => {
        return cache.get('events:test');
      });
    });

    it('should emit invalidation events', (done) => {
      cache.on('invalidate', (pattern, count) => {
        expect(pattern).toBe('invalidate:.*');
        expect(count).toBeGreaterThan(0);
        done();
      });

      cache.set('invalidate:key1', { data: 1 }).then(() => {
        cache.set('invalidate:key2', { data: 2 }).then(() => {
          cache.invalidatePattern('invalidate:.*');
        });
      });
    });
  });

  describe('Smart Cache Keys', () => {
    it('should handle string keys', async () => {
      const key = 'simple:string:key';
      const value = { type: 'string_key' };

      await cache.set(key, value);
      expect(await cache.get(key)).toEqual(value);
    });

    it('should handle SmartCacheKey objects', async () => {
      const smartKey = {
        base: 'entity',
        entity: 'company',
        entityId: 123,
        params: { include: 'contacts' },
        version: 'v1',
        toString: function() {
          return `${this.base}:${this.entity}:${this.entityId}:${JSON.stringify(this.params)}:${this.version}`;
        }
      };

      const value = { id: 123, name: 'Test Company' };

      await cache.set(smartKey, value);
      expect(await cache.get(smartKey)).toEqual(value);
    });
  });
});