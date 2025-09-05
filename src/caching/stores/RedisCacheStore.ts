import { toError } from '../types';
/**
 * Redis Cache Store Implementation
 * 
 * Production-ready Redis cache implementation with clustering support,
 * connection pooling, compression, and advanced Redis features.
 */

import Redis, { RedisOptions, Cluster } from 'ioredis';
import { promisify } from 'util';
import { gzip, gunzip } from 'zlib';
import { ICacheStore, CacheEntry, CacheResult } from '../types';
import { ErrorLogger, LogContext, defaultErrorLogger } from '../../errors/ErrorLogger';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * Redis cache store configuration
 */
export interface RedisCacheConfig {
  /** Redis connection options */
  redis: RedisOptions;
  /** Redis cluster configuration */
  cluster?: {
    nodes: Array<{ host: string; port: number }>;
    options?: any;
  };
  /** Enable compression for large entries */
  enableCompression: boolean;
  /** Compression threshold in bytes */
  compressionThreshold: number;
  /** Key prefix for all cache entries */
  keyPrefix: string;
  /** Connection timeout in milliseconds */
  connectionTimeout: number;
  /** Command timeout in milliseconds */
  commandTimeout: number;
  /** Enable Redis scripting for atomic operations */
  enableScripting: boolean;
  /** Maximum retry attempts */
  maxRetries: number;
  /** Retry delay in milliseconds */
  retryDelay: number;
}

/**
 * Default Redis cache configuration
 */
export const DEFAULT_REDIS_CONFIG: RedisCacheConfig = {
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0,
    connectTimeout: 10000,
    lazyConnect: true,
    maxRetriesPerRequest: 3
  },
  enableCompression: true,
  compressionThreshold: 1024, // 1KB
  keyPrefix: 'autotask:cache:',
  connectionTimeout: 10000,
  commandTimeout: 5000,
  enableScripting: true,
  maxRetries: 3,
  retryDelay: 1000
};

/**
 * Internal cache entry for Redis storage
 */
interface RedisCacheEntry extends CacheEntry {
  /** Whether the value is compressed */
  compressed: boolean;
  /** Original size before compression */
  originalSize?: number;
  /** Serialization version for future compatibility */
  version: number;
}

/**
 * Redis Lua scripts for atomic operations
 */
const REDIS_SCRIPTS = {
  // Get entry with TTL check
  getWithTtlCheck: `
    local key = KEYS[1]
    local entry = redis.call('GET', key)
    if not entry then
      return nil
    end
    local ttl = redis.call('TTL', key)
    if ttl == -2 then -- Key doesn't exist
      return nil
    end
    if ttl == -1 then -- Key exists but no expiry
      return {entry, -1}
    end
    return {entry, ttl}
  `,

  // Set entry with tags
  setWithTags: `
    local key = KEYS[1]
    local entry = ARGV[1]
    local ttl = tonumber(ARGV[2])
    local tags = cjson.decode(ARGV[3])
    
    -- Set the main entry
    if ttl > 0 then
      redis.call('SETEX', key, ttl, entry)
    else
      redis.call('SET', key, entry)
    end
    
    -- Add to tag sets
    for _, tag in ipairs(tags) do
      local tagKey = 'tag:' .. tag
      redis.call('SADD', tagKey, key)
      -- Set expiry for tag key (longer than entry TTL)
      if ttl > 0 then
        redis.call('EXPIRE', tagKey, ttl + 3600) -- 1 hour buffer
      end
    end
    
    return 'OK'
  `,

  // Delete by tags
  deleteByTags: `
    local tags = cjson.decode(ARGV[1])
    local deletedCount = 0
    
    for _, tag in ipairs(tags) do
      local tagKey = 'tag:' .. tag
      local keys = redis.call('SMEMBERS', tagKey)
      
      for _, key in ipairs(keys) do
        if redis.call('DEL', key) == 1 then
          deletedCount = deletedCount + 1
        end
        -- Remove key from all tag sets
        local cursor = "0"
        repeat
          local result = redis.call('SCAN', cursor, 'MATCH', 'tag:*')
          cursor = result[1]
          local tagKeys = result[2]
          for _, tk in ipairs(tagKeys) do
            redis.call('SREM', tk, key)
          end
        until cursor == "0"
      end
      
      -- Clean up the tag key
      redis.call('DEL', tagKey)
    end
    
    return deletedCount
  `,

  // Delete by pattern
  deleteByPattern: `
    local pattern = ARGV[1]
    local cursor = "0"
    local deletedCount = 0
    
    repeat
      local result = redis.call('SCAN', cursor, 'MATCH', pattern)
      cursor = result[1]
      local keys = result[2]
      
      for _, key in ipairs(keys) do
        if redis.call('DEL', key) == 1 then
          deletedCount = deletedCount + 1
        end
      end
    until cursor == "0"
    
    return deletedCount
  `
};

/**
 * Redis cache store with advanced features
 */
export class RedisCacheStore implements ICacheStore {
  private client: Redis | Cluster;
  private config: RedisCacheConfig;
  private logger: ErrorLogger;
  private scripts: Map<string, string> = new Map();
  private connected: boolean = false;

  constructor(
    config: Partial<RedisCacheConfig> = {},
    logger: ErrorLogger = defaultErrorLogger
  ) {
    this.config = { ...DEFAULT_REDIS_CONFIG, ...config };
    this.logger = logger;

    // Initialize Redis client
    if (this.config.cluster) {
      this.client = new Redis.Cluster(
        this.config.cluster.nodes,
        this.config.cluster.options
      );
    } else {
      this.client = new Redis({
        ...this.config.redis,
        keyPrefix: this.config.keyPrefix
      });
    }

    this.setupEventHandlers();
    this.loadScripts();
  }

  /**
   * Initialize connection
   */
  async initialize(): Promise<void> {
    try {
      await this.client.ping();
      this.connected = true;
      this.logger.info('Redis cache store connected successfully', {
        correlationId: 'cache-init',
        operation: 'redis_connect'
      });
    } catch (error) {
      this.connected = false;
      const context: LogContext = {
        correlationId: 'cache-init',
        operation: 'redis_connect'
      };
      this.logger.error('Failed to connect to Redis', toError(error), context);
      throw error;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<CacheResult<T>> {
    const startTime = performance.now();
    const context: LogContext = {
      operation: 'cache_get',
      correlationId: this.generateCorrelationId()
    };

    try {
      if (!this.connected) {
        await this.initialize();
      }

      const prefixedKey = this.getPrefixedKey(key);
      let result: [string, number] | null;

      if (this.config.enableScripting) {
        result = await this.client.eval(
          this.scripts.get('getWithTtlCheck')!,
          1,
          prefixedKey
        ) as [string, number] | null;
      } else {
        const entry = await this.client.get(prefixedKey);
        if (!entry) {
          result = null;
        } else {
          const ttl = await this.client.ttl(prefixedKey);
          result = [entry, ttl];
        }
      }

      if (!result) {
        return {
          success: true,
          hit: false,
          timing: performance.now() - startTime
        };
      }

      const [entryData, ttl] = result;
      const entry: RedisCacheEntry = JSON.parse(entryData);

      // Double-check expiration (Redis should handle this, but be safe)
      if (ttl === 0 || (entry.expiresAt && Date.now() >= entry.expiresAt)) {
        await this.delete(key);
        return {
          success: true,
          hit: false,
          timing: performance.now() - startTime
        };
      }

      // Decompress if needed
      let value = entry.value;
      if (entry.compressed && Buffer.isBuffer(entry.value)) {
        const buffer = Buffer.from(entry.value);
        const decompressed = await gunzipAsync(buffer);
        value = JSON.parse(decompressed.toString());
      }

      // Update hit statistics
      entry.hitCount++;
      entry.lastAccessed = Date.now();

      // Update the entry in Redis with new stats (fire and forget)
      this.updateEntryStats(prefixedKey, entry).catch(() => {
        // Ignore errors in stats update
      });

      return {
        success: true,
        value,
        hit: true,
        metadata: {
          ...entry,
          compressed: false,
          value
        },
        timing: performance.now() - startTime
      };

    } catch (error) {
      this.logger.error('Redis cache get error', toError(error), context);
      return {
        success: false,
        hit: false,
        error: toError(error),
        timing: performance.now() - startTime
      };
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, ttl?: number, tags: string[] = []): Promise<boolean> {
    const context: LogContext = {
      operation: 'cache_set',
      correlationId: this.generateCorrelationId()
    };

    try {
      if (!this.connected) {
        await this.initialize();
      }

      const now = Date.now();
      const expiresAt = ttl ? now + ttl : now + (24 * 60 * 60 * 1000); // Default 24 hours
      const ttlSeconds = ttl ? Math.floor(ttl / 1000) : 24 * 60 * 60;

      // Calculate size and compress if needed
      let processedValue: any = value;
      let size = this.calculateSize(value);
      let compressed = false;
      let originalSize = size;

      if (this.config.enableCompression && size > this.config.compressionThreshold) {
        try {
          const jsonString = JSON.stringify(value);
          const compressedBuffer = await gzipAsync(jsonString);
          if (compressedBuffer.length < size) {
            processedValue = compressedBuffer;
            size = compressedBuffer.length;
            compressed = true;
          }
        } catch (compressionError) {
          this.logger.warn('Compression failed, storing uncompressed', toError(compressionError), {
            ...context,
            metadata: { key, originalSize: size }
          });
        }
      }

      const entry: RedisCacheEntry = {
        value: processedValue,
        createdAt: now,
        expiresAt,
        ttl: ttl || 24 * 60 * 60 * 1000,
        tags: [...tags],
        hitCount: 0,
        lastAccessed: now,
        size,
        compressed,
        originalSize,
        version: 1
      };

      const prefixedKey = this.getPrefixedKey(key);
      const entryJson = JSON.stringify(entry);

      if (this.config.enableScripting && tags.length > 0) {
        await this.client.eval(
          this.scripts.get('setWithTags')!,
          1,
          prefixedKey,
          entryJson,
          ttlSeconds.toString(),
          JSON.stringify(tags)
        );
      } else {
        if (ttlSeconds > 0) {
          await this.client.setex(prefixedKey, ttlSeconds, entryJson);
        } else {
          await this.client.set(prefixedKey, entryJson);
        }

        // Handle tags separately if not using scripting
        if (tags.length > 0) {
          await this.setTags(prefixedKey, tags, ttlSeconds);
        }
      }

      return true;

    } catch (error) {
      this.logger.error('Redis cache set error', toError(error), {
        ...context,
        metadata: { key, tagsCount: tags.length }
      });
      return false;
    }
  }

  /**
   * Delete a single key
   */
  async delete(key: string): Promise<boolean> {
    const context: LogContext = {
      operation: 'cache_delete',
      correlationId: this.generateCorrelationId()
    };

    try {
      if (!this.connected) {
        await this.initialize();
      }

      const prefixedKey = this.getPrefixedKey(key);
      
      // Get entry to clean up tags
      const entryData = await this.client.get(prefixedKey);
      if (entryData) {
        const entry: RedisCacheEntry = JSON.parse(entryData);
        await this.cleanupTags(prefixedKey, entry.tags);
      }

      const result = await this.client.del(prefixedKey);
      return result > 0;

    } catch (error) {
      this.logger.error('Redis cache delete error', toError(error), {
        ...context,
        metadata: { key }
      });
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }

    const context: LogContext = {
      operation: 'cache_delete_many',
      correlationId: this.generateCorrelationId()
    };

    try {
      if (!this.connected) {
        await this.initialize();
      }

      const prefixedKeys = keys.map(key => this.getPrefixedKey(key));
      
      // Get entries to clean up tags
      const entries = await this.client.mget(...prefixedKeys);
      const pipeline = this.client.pipeline();

      let validEntries = 0;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i]) {
          validEntries++;
          try {
            const entry: RedisCacheEntry = JSON.parse(entries[i] as string);
            this.addTagCleanupToPipeline(pipeline, prefixedKeys[i], entry.tags);
          } catch (parseError) {
            // Skip tag cleanup for malformed entries
          }
        }
      }

      // Add delete commands
      prefixedKeys.forEach(key => pipeline.del(key));

      const results = await pipeline.exec();
      const deleteResults = results?.slice(-prefixedKeys.length) || [];
      
      const deletedCount = deleteResults.reduce((count, result) => {
        return count + (result && Array.isArray(result) && (result[1] as number) > 0 ? 1 : 0);
      }, 0);

      return deletedCount;

    } catch (error) {
      this.logger.error('Redis cache delete many error', toError(error), {
        ...context,
        metadata: { keyCount: keys.length }
      });
      return 0;
    }
  }

  /**
   * Delete keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    const context: LogContext = {
      operation: 'cache_delete_pattern',
      correlationId: this.generateCorrelationId()
    };

    try {
      if (!this.connected) {
        await this.initialize();
      }

      const prefixedPattern = this.getPrefixedKey(pattern);

      if (this.config.enableScripting) {
        const result = await this.client.eval(
          this.scripts.get('deleteByPattern')!,
          0,
          prefixedPattern
        );
        return result as number;
      } else {
        // Fallback implementation
        const keys = await this.client.keys(prefixedPattern);
        if (keys.length === 0) {
          return 0;
        }
        return await this.deleteMany(keys.map(key => this.removePrefixFromKey(key)));
      }

    } catch (error) {
      this.logger.error('Redis cache delete pattern error', toError(error), {
        ...context,
        metadata: { pattern }
      });
      return 0;
    }
  }

  /**
   * Delete keys by tags
   */
  async deleteByTags(tags: string[]): Promise<number> {
    if (tags.length === 0) {
      return 0;
    }

    const context: LogContext = {
      operation: 'cache_delete_by_tags',
      correlationId: this.generateCorrelationId()
    };

    try {
      if (!this.connected) {
        await this.initialize();
      }

      if (this.config.enableScripting) {
        const result = await this.client.eval(
          this.scripts.get('deleteByTags')!,
          0,
          JSON.stringify(tags)
        );
        return result as number;
      } else {
        // Fallback implementation
        const keysToDelete = new Set<string>();

        for (const tag of tags) {
          const tagKey = `${this.config.keyPrefix}tag:${tag}`;
          const keys = await this.client.smembers(tagKey);
          keys.forEach(key => keysToDelete.add(this.removePrefixFromKey(key)));
        }

        if (keysToDelete.size === 0) {
          return 0;
        }

        return await this.deleteMany(Array.from(keysToDelete));
      }

    } catch (error) {
      this.logger.error('Redis cache delete by tags error', toError(error), {
        ...context,
        metadata: { tags }
      });
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.connected) {
        await this.initialize();
      }

      const prefixedKey = this.getPrefixedKey(key);
      const result = await this.client.exists(prefixedKey);
      return result === 1;

    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    const context: LogContext = {
      operation: 'cache_clear',
      correlationId: this.generateCorrelationId()
    };

    try {
      if (!this.connected) {
        await this.initialize();
      }

      // Clear all keys with our prefix
      const pattern = `${this.config.keyPrefix}*`;
      const keys = await this.client.keys(pattern);

      if (keys.length > 0) {
        await this.client.del(...keys);
      }

    } catch (error) {
      this.logger.error('Redis cache clear error', toError(error), context);
      throw error;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern?: string): Promise<string[]> {
    try {
      if (!this.connected) {
        await this.initialize();
      }

      const searchPattern = pattern 
        ? this.getPrefixedKey(pattern)
        : `${this.config.keyPrefix}*`;

      const keys = await this.client.keys(searchPattern);
      
      // Remove prefix from keys
      return keys
        .map(key => this.removePrefixFromKey(key))
        .filter(key => !key.startsWith('tag:')); // Exclude tag keys

    } catch (error) {
      return [];
    }
  }

  /**
   * Get cache size info
   */
  async size(): Promise<{ entries: number; memoryUsage: number }> {
    try {
      if (!this.connected) {
        await this.initialize();
      }

      const keys = await this.keys();
      const entries = keys.length;

      // Estimate memory usage (this is approximate)
      let memoryUsage = 0;
      if (entries > 0) {
        // Sample a few keys to estimate average size
        const sampleKeys = keys.slice(0, Math.min(10, keys.length));
        let totalSampleSize = 0;

        for (const key of sampleKeys) {
          const prefixedKey = this.getPrefixedKey(key);
          const value = await this.client.get(prefixedKey);
          if (value) {
            totalSampleSize += Buffer.byteLength(value, 'utf8');
          }
        }

        const avgSize = totalSampleSize / sampleKeys.length;
        memoryUsage = Math.round(avgSize * entries);
      }

      return { entries, memoryUsage };

    } catch (error) {
      return { entries: 0, memoryUsage: 0 };
    }
  }

  /**
   * Cleanup expired entries (Redis handles this automatically)
   */
  async cleanup(): Promise<number> {
    // Redis automatically handles TTL expiration
    // This method is here for interface compliance
    return 0;
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    try {
      await this.client.quit();
      this.connected = false;
    } catch (error) {
      this.logger.warn('Error closing Redis connection', toError(error), {
        operation: 'redis_close',
        correlationId: this.generateCorrelationId()
      });
    }
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.connected = true;
      this.logger.info('Redis client connected', {
        correlationId: 'redis-events',
        operation: 'redis_connect'
      });
    });

    this.client.on('error', (error) => {
      this.connected = false;
      this.logger.error('Redis client error', toError(error), {
        correlationId: 'redis-events',
        operation: 'redis_error'
      });
    });

    this.client.on('close', () => {
      this.connected = false;
      this.logger.info('Redis client disconnected', {
        correlationId: 'redis-events',
        operation: 'redis_disconnect'
      });
    });
  }

  /**
   * Load Lua scripts into Redis
   */
  private async loadScripts(): Promise<void> {
    if (!this.config.enableScripting) {
      return;
    }

    try {
      for (const [name, script] of Object.entries(REDIS_SCRIPTS)) {
        const sha = await this.client.script('LOAD', script);
        this.scripts.set(name, script);
      }
    } catch (error) {
      this.logger.warn('Failed to load Redis scripts, falling back to regular commands', toError(error), {
        operation: 'redis_scripts',
        correlationId: this.generateCorrelationId()
      });
      this.config.enableScripting = false;
    }
  }

  /**
   * Set tags for a key
   */
  private async setTags(key: string, tags: string[], ttl: number): Promise<void> {
    if (tags.length === 0) return;

    const pipeline = this.client.pipeline();
    
    for (const tag of tags) {
      const tagKey = `${this.config.keyPrefix}tag:${tag}`;
      pipeline.sadd(tagKey, key);
      if (ttl > 0) {
        pipeline.expire(tagKey, ttl + 3600); // Tag key lives longer
      }
    }

    await pipeline.exec();
  }

  /**
   * Clean up tags for a key
   */
  private async cleanupTags(key: string, tags: string[]): Promise<void> {
    if (tags.length === 0) return;

    const pipeline = this.client.pipeline();
    
    for (const tag of tags) {
      const tagKey = `${this.config.keyPrefix}tag:${tag}`;
      pipeline.srem(tagKey, key);
    }

    await pipeline.exec();
  }

  /**
   * Add tag cleanup commands to pipeline
   */
  private addTagCleanupToPipeline(pipeline: any, key: string, tags: string[]): void {
    for (const tag of tags) {
      const tagKey = `${this.config.keyPrefix}tag:${tag}`;
      pipeline.srem(tagKey, key);
    }
  }

  /**
   * Update entry statistics
   */
  private async updateEntryStats(key: string, entry: RedisCacheEntry): Promise<void> {
    try {
      const ttl = await this.client.ttl(key);
      if (ttl > 0) {
        await this.client.setex(key, ttl, JSON.stringify(entry));
      } else {
        await this.client.set(key, JSON.stringify(entry));
      }
    } catch (error) {
      // Ignore stats update errors
    }
  }

  /**
   * Get prefixed key
   */
  private getPrefixedKey(key: string): string {
    return key.startsWith(this.config.keyPrefix) ? key : `${this.config.keyPrefix}${key}`;
  }

  /**
   * Remove prefix from key
   */
  private removePrefixFromKey(key: string): string {
    return key.startsWith(this.config.keyPrefix) 
      ? key.substring(this.config.keyPrefix.length)
      : key;
  }

  /**
   * Calculate size of a value
   */
  private calculateSize(value: any): number {
    const jsonString = JSON.stringify(value);
    return Buffer.byteLength(jsonString, 'utf8');
  }

  /**
   * Generate correlation ID for logging
   */
  private generateCorrelationId(): string {
    return `redis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}