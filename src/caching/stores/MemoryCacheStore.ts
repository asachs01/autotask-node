/**
 * In-Memory Cache Store Implementation
 *
 * Fast in-memory cache with LRU eviction, compression support,
 * and tag-based invalidation for development and production use.
 */

import { performance } from 'perf_hooks';
import { ICacheStore, CacheEntry, CacheResult, toError } from '../types';
import {
  ErrorLogger,
  LogContext,
  defaultErrorLogger,
} from '../../errors/ErrorLogger';

/**
 * Memory cache store configuration
 */
export interface MemoryCacheConfig {
  /** Maximum number of entries */
  maxEntries: number;
  /** Maximum memory usage in bytes */
  maxMemoryUsage: number;
  /** Enable LRU eviction */
  enableLRU: boolean;
  /** Cleanup interval in milliseconds */
  cleanupInterval: number;
  /** Enable compression for large values */
  enableCompression: boolean;
  /** Compression threshold in bytes */
  compressionThreshold: number;
}

/**
 * Default memory cache configuration
 */
export const DEFAULT_MEMORY_CONFIG: MemoryCacheConfig = {
  maxEntries: 10000,
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  enableLRU: true,
  cleanupInterval: 60 * 1000, // 1 minute
  enableCompression: false,
  compressionThreshold: 10240, // 10KB
};

/**
 * In-memory cache store implementation
 */
export class MemoryCacheStore implements ICacheStore {
  private config: MemoryCacheConfig;
  private logger: ErrorLogger;
  private cache: Map<string, CacheEntry> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private cleanupTimer?: ReturnType<typeof setTimeout>;
  private initialized = false;
  private memoryUsage = 0;

  constructor(
    config: Partial<MemoryCacheConfig> = {},
    logger: ErrorLogger = defaultErrorLogger
  ) {
    this.config = { ...DEFAULT_MEMORY_CONFIG, ...config };
    this.logger = logger;
  }

  /**
   * Initialize the memory cache store
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.startCleanupTimer();
    this.initialized = true;

    this.logger.info('Memory cache store initialized', {
      correlationId: 'memory-cache-init',
      operation: 'initialize',
      metadata: {
        maxEntries: this.config.maxEntries,
        maxMemoryUsage: this.config.maxMemoryUsage,
      },
    });
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<CacheResult<T>> {
    const startTime = performance.now();
    const context: LogContext = {
      operation: 'memory_cache_get',
      correlationId: this.generateCorrelationId(),
    };

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const entry = this.cache.get(key);

      if (!entry) {
        return {
          success: true,
          hit: false,
          timing: performance.now() - startTime,
        };
      }

      // Check expiration
      if (Date.now() >= entry.expiresAt) {
        await this.delete(key);
        return {
          success: true,
          hit: false,
          timing: performance.now() - startTime,
        };
      }

      // Update access tracking
      entry.lastAccessed = Date.now();
      entry.hitCount++;

      // Move to end for LRU (reinsert)
      if (this.config.enableLRU) {
        this.cache.delete(key);
        this.cache.set(key, entry);
      }

      return {
        success: true,
        value: entry.value,
        hit: true,
        metadata: entry,
        timing: performance.now() - startTime,
      };
    } catch (error) {
      this.logger.error('Memory cache get error', toError(error), {
        ...context,
        metadata: { key },
      });
      return {
        success: false,
        hit: false,
        error: toError(error),
        timing: performance.now() - startTime,
      };
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    tags: string[] = []
  ): Promise<boolean> {
    const context: LogContext = {
      operation: 'memory_cache_set',
      correlationId: this.generateCorrelationId(),
    };

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const now = Date.now();
      const expiresAt = ttl ? now + ttl : now + 24 * 60 * 60 * 1000; // Default 24 hours

      // Calculate size
      const size = this.calculateSize(value);

      // Check if we need to evict entries
      if (
        this.cache.size >= this.config.maxEntries ||
        this.memoryUsage + size > this.config.maxMemoryUsage
      ) {
        await this.evict(size);
      }

      const entry: CacheEntry<T> = {
        value,
        createdAt: now,
        expiresAt,
        ttl: ttl || 24 * 60 * 60 * 1000,
        tags: [...tags],
        hitCount: 0,
        lastAccessed: now,
        size,
        compressed: false,
      };

      // Remove old entry if exists
      const oldEntry = this.cache.get(key);
      if (oldEntry) {
        this.memoryUsage -= oldEntry.size;
        this.cleanupTagIndex(key);
      }

      // Store entry
      this.cache.set(key, entry);
      this.memoryUsage += size;

      // Update tag index
      this.updateTagIndex(key, tags);

      return true;
    } catch (error) {
      this.logger.error('Memory cache set error', toError(error), {
        ...context,
        metadata: { key, tagsCount: tags.length },
      });
      return false;
    }
  }

  /**
   * Delete a single key
   */
  async delete(key: string): Promise<boolean> {
    const context: LogContext = {
      operation: 'memory_cache_delete',
      correlationId: this.generateCorrelationId(),
    };

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const entry = this.cache.get(key);

      if (!entry) {
        return true;
      }

      this.cache.delete(key);
      this.memoryUsage -= entry.size;
      this.cleanupTagIndex(key);

      return true;
    } catch (error) {
      this.logger.error('Memory cache delete error', toError(error), {
        ...context,
        metadata: { key },
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

    let deletedCount = 0;

    for (const key of keys) {
      const success = await this.delete(key);
      if (success) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Delete keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    const context: LogContext = {
      operation: 'memory_cache_delete_pattern',
      correlationId: this.generateCorrelationId(),
    };

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const regex = this.createPatternRegex(pattern);
      const matchingKeys: string[] = [];

      for (const key of Array.from(this.cache.keys())) {
        if (regex.test(key)) {
          matchingKeys.push(key);
        }
      }

      return await this.deleteMany(matchingKeys);
    } catch (error) {
      this.logger.error('Memory cache delete pattern error', toError(error), {
        ...context,
        metadata: { pattern },
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
      operation: 'memory_cache_delete_by_tags',
      correlationId: this.generateCorrelationId(),
    };

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const keysToDelete = new Set<string>();

      for (const tag of tags) {
        const taggedKeys = this.tagIndex.get(tag);
        if (taggedKeys) {
          taggedKeys.forEach(key => keysToDelete.add(key));
        }
      }

      return await this.deleteMany(Array.from(keysToDelete));
    } catch (error) {
      this.logger.error('Memory cache delete by tags error', toError(error), {
        ...context,
        metadata: { tags },
      });
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const entry = this.cache.get(key);

      if (!entry) {
        return false;
      }

      // Check expiration
      if (Date.now() >= entry.expiresAt) {
        await this.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    const context: LogContext = {
      operation: 'memory_cache_clear',
      correlationId: this.generateCorrelationId(),
    };

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      this.cache.clear();
      this.tagIndex.clear();
      this.memoryUsage = 0;
    } catch (error) {
      this.logger.error('Memory cache clear error', toError(error), context);
      throw error;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern?: string): Promise<string[]> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const allKeys = Array.from(this.cache.keys());

      if (!pattern) {
        return allKeys;
      }

      const regex = this.createPatternRegex(pattern);
      return allKeys.filter(key => regex.test(key));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get cache size info
   */
  async size(): Promise<{ entries: number; memoryUsage: number }> {
    return {
      entries: this.cache.size,
      memoryUsage: this.memoryUsage,
    };
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<number> {
    const context: LogContext = {
      operation: 'memory_cache_cleanup',
      correlationId: this.generateCorrelationId(),
    };

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, entry] of Array.from(this.cache.entries())) {
        if (now >= entry.expiresAt) {
          expiredKeys.push(key);
        }
      }

      const deletedCount = await this.deleteMany(expiredKeys);

      if (deletedCount > 0) {
        this.logger.info('Memory cache cleanup completed', {
          correlationId: this.generateCorrelationId(),
          operation: 'cleanup',
          metadata: { deletedCount, totalEntries: this.cache.size },
        });
      }

      return deletedCount;
    } catch (error) {
      this.logger.error('Memory cache cleanup error', toError(error), context);
      return 0;
    }
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Test write/read/delete operations
      const testKey = '__health_check__';
      const testValue = { timestamp: Date.now() };

      await this.set(testKey, testValue, 1000);
      const result = await this.get(testKey);
      await this.delete(testKey);

      return result.success && result.hit;
    } catch {
      return false;
    }
  }

  /**
   * Close the memory store
   */
  async close(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    this.cache.clear();
    this.tagIndex.clear();
    this.memoryUsage = 0;
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Evict entries to make room for new entry
   */
  private async evict(requiredSize: number): Promise<void> {
    const targetSize = this.config.maxMemoryUsage * 0.8; // Evict to 80% capacity
    const targetEntries = Math.floor(this.config.maxEntries * 0.8);

    // If LRU is enabled, evict oldest entries first
    if (this.config.enableLRU) {
      const entries = Array.from(this.cache.entries());

      while (
        (this.memoryUsage + requiredSize > targetSize ||
          this.cache.size >= this.config.maxEntries) &&
        entries.length > 0
      ) {
        const [key] = entries.shift()!;
        await this.delete(key);
      }
    } else {
      // Simple eviction: remove oldest by creation time
      const entries = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.createdAt - b.createdAt
      );

      while (
        (this.memoryUsage + requiredSize > targetSize ||
          this.cache.size >= this.config.maxEntries) &&
        entries.length > 0
      ) {
        const [key] = entries.shift()!;
        await this.delete(key);
      }
    }
  }

  /**
   * Update tag index
   */
  private updateTagIndex(key: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  /**
   * Clean up tag index for a key
   */
  private cleanupTagIndex(key: string): void {
    for (const taggedKeys of Array.from(this.tagIndex.values())) {
      taggedKeys.delete(key);
    }

    // Remove empty tag sets
    for (const [tag, taggedKeys] of Array.from(this.tagIndex.entries())) {
      if (taggedKeys.size === 0) {
        this.tagIndex.delete(tag);
      }
    }
  }

  /**
   * Create regex from pattern (supports * wildcard)
   */
  private createPatternRegex(pattern: string): RegExp {
    const escapedPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp(`^${escapedPattern}$`);
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
    return `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
