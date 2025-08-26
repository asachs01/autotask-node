/**
 * Redis Storage Backend
 * 
 * Distributed queue storage using Redis for high-performance
 * and scalable queue operations across multiple instances.
 */

import Redis from 'ioredis';
import winston from 'winston';
import {
  QueueRequest,
  QueueRequestStatus,
  QueueBatch,
  QueueMetrics,
  QueueFilter,
  QueueStorageBackend
} from '../types/QueueTypes';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
}

export class RedisBackend implements QueueStorageBackend {
  private logger: winston.Logger;
  private redis: Redis;
  private config: RedisConfig & { host: string; port: number; db: number; keyPrefix: string; maxRetriesPerRequest: number; retryDelayOnFailover: number };
  private keyPrefix: string;
  
  // Redis key patterns
  private keys = {
    request: (id: string) => `${this.keyPrefix}:request:${id}`,
    batch: (id: string) => `${this.keyPrefix}:batch:${id}`,
    queue: (zone?: string) => zone ? `${this.keyPrefix}:queue:${zone}` : `${this.keyPrefix}:queue:default`,
    priorityQueue: (priority: number, zone?: string) => 
      `${this.keyPrefix}:pqueue:${priority}:${zone || 'default'}`,
    statusIndex: (status: string) => `${this.keyPrefix}:status:${status}`,
    zoneIndex: (zone: string) => `${this.keyPrefix}:zone:${zone}`,
    fingerprint: (fingerprint: string) => `${this.keyPrefix}:fingerprint:${fingerprint}`,
    metrics: () => `${this.keyPrefix}:metrics`,
    batches: () => `${this.keyPrefix}:batches`
  };
  
  constructor(config: Partial<RedisConfig> = {}, logger: winston.Logger) {
    this.config = {
      host: 'localhost',
      port: 6379,
      db: 0,
      keyPrefix: 'autotask-queue',
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      ...config
    };
    
    this.logger = logger;
    this.keyPrefix = this.config.keyPrefix;
    
    // Initialize Redis connection
    this.redis = new Redis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      lazyConnect: true
    });
    
    // Handle Redis events
    this.redis.on('connect', () => {
      this.logger.info('Connected to Redis', {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db
      });
    });
    
    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', error);
    });
    
    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });
  }
  
  async initialize(): Promise<void> {
    try {
      await this.redis.connect();
      
      // Test connection
      await this.redis.ping();
      
      // Load Lua scripts
      await this.loadLuaScripts();
      
      this.logger.info('RedisBackend initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize RedisBackend', error);
      throw error;
    }
  }
  
  async enqueue(request: QueueRequest): Promise<void> {
    const multi = this.redis.multi();
    
    try {
      // Store request data
      multi.hmset(this.keys.request(request.id), {
        id: request.id,
        groupId: request.groupId || '',
        endpoint: request.endpoint,
        method: request.method,
        zone: request.zone,
        priority: request.priority.toString(),
        data: request.data ? JSON.stringify(request.data) : '',
        headers: request.headers ? JSON.stringify(request.headers) : '',
        createdAt: request.createdAt.toISOString(),
        scheduledAt: request.scheduledAt?.toISOString() || '',
        timeout: request.timeout.toString(),
        maxRetries: request.maxRetries.toString(),
        retryCount: request.retryCount.toString(),
        retryable: request.retryable ? '1' : '0',
        batchable: request.batchable ? '1' : '0',
        metadata: JSON.stringify(request.metadata),
        status: request.status,
        lastError: request.lastError || '',
        executionHistory: JSON.stringify(request.executionHistory),
        fingerprint: request.fingerprint || ''
      });
      
      // Add to priority queue (sorted set by priority and creation time)
      const score = request.priority * 1000000 + (999999 - (request.createdAt.getTime() % 1000000));
      multi.zadd(this.keys.priorityQueue(request.priority, request.zone), score, request.id);
      
      // Add to status index
      multi.sadd(this.keys.statusIndex(request.status), request.id);
      
      // Add to zone index
      multi.sadd(this.keys.zoneIndex(request.zone), request.id);
      
      // Set fingerprint mapping if present
      if (request.fingerprint) {
        multi.setex(this.keys.fingerprint(request.fingerprint), 3600, request.id);
      }
      
      // Set expiry for request (auto-cleanup after timeout + 1 hour)
      multi.expire(this.keys.request(request.id), Math.ceil(request.timeout / 1000) + 3600);
      
      await multi.exec();
      
      this.logger.debug('Request enqueued to Redis', {
        id: request.id,
        priority: request.priority,
        zone: request.zone
      });
      
    } catch (error) {
      this.logger.error('Failed to enqueue request to Redis', { error, requestId: request.id });
      throw error;
    }
  }
  
  async dequeue(zone?: string): Promise<QueueRequest | null> {
    try {
      // Use Lua script for atomic dequeue operation
      const result = await this.redis.eval(`
        local zone = ARGV[1]
        local keyPrefix = ARGV[2]
        local now = tonumber(ARGV[3])
        
        -- Find highest priority queue with pending requests
        local priorities = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1}
        
        for _, priority in ipairs(priorities) do
          local queueKey = keyPrefix .. ':pqueue:' .. priority .. ':' .. (zone ~= '' and zone or 'default')
          
          -- Get requests from this priority level
          local requestIds = redis.call('ZRANGE', queueKey, 0, 99)
          
          for _, requestId in ipairs(requestIds) do
            local requestKey = keyPrefix .. ':request:' .. requestId
            local requestData = redis.call('HMGET', requestKey, 'status', 'scheduledAt')
            
            if requestData[1] == 'pending' then
              -- Check if scheduled time has passed
              local scheduledAt = requestData[2]
              if scheduledAt == '' or scheduledAt == nil or tonumber(scheduledAt:sub(1, 10)) <= now then
                -- Remove from queue and update status
                redis.call('ZREM', queueKey, requestId)
                redis.call('SREM', keyPrefix .. ':status:pending', requestId)
                redis.call('SADD', keyPrefix .. ':status:processing', requestId)
                redis.call('HSET', requestKey, 'status', 'processing')
                
                return requestId
              end
            end
          end
        end
        
        return nil
      `, 0, zone || '', this.keyPrefix, Math.floor(Date.now() / 1000));
      
      if (!result) {
        return null;
      }
      
      // Get full request data
      const request = await this.getRequest(result as string);
      
      if (!request) {
        this.logger.warn('Dequeued request not found', { requestId: result });
        return null;
      }
      
      this.logger.debug('Request dequeued from Redis', {
        id: request.id,
        priority: request.priority,
        zone: request.zone
      });
      
      return request;
      
    } catch (error) {
      this.logger.error('Failed to dequeue request from Redis', error);
      throw error;
    }
  }
  
  async peek(zone?: string): Promise<QueueRequest | null> {
    try {
      // Find the next request without removing it
      for (let priority = 10; priority >= 1; priority--) {
        const queueKey = this.keys.priorityQueue(priority, zone);
        const requestIds = await this.redis.zrange(queueKey, 0, 99);
        
        for (const requestId of requestIds) {
          const request = await this.getRequest(requestId);
          
          if (!request || request.status !== 'pending') {
            continue;
          }
          
          // Check if scheduled time has passed
          if (request.scheduledAt && request.scheduledAt > new Date()) {
            continue;
          }
          
          return request;
        }
      }
      
      return null;
      
    } catch (error) {
      this.logger.error('Failed to peek request from Redis', error);
      throw error;
    }
  }
  
  async updateRequest(id: string, updates: Partial<QueueRequest>): Promise<void> {
    const multi = this.redis.multi();
    
    try {
      const requestKey = this.keys.request(id);
      
      // Check if request exists
      const exists = await this.redis.exists(requestKey);
      if (!exists) {
        throw new Error(`Request ${id} not found`);
      }
      
      // Get current request for index updates
      const currentRequest = await this.getRequest(id);
      if (!currentRequest) {
        throw new Error(`Request ${id} not found`);
      }
      
      // Update fields
      const updateFields: Record<string, string> = {};
      
      if (updates.status !== undefined) {
        updateFields.status = updates.status;
        
        // Update status indexes
        if (currentRequest.status !== updates.status) {
          multi.srem(this.keys.statusIndex(currentRequest.status), id);
          multi.sadd(this.keys.statusIndex(updates.status), id);
        }
      }
      
      if (updates.retryCount !== undefined) {
        updateFields.retryCount = updates.retryCount.toString();
      }
      
      if (updates.scheduledAt !== undefined) {
        updateFields.scheduledAt = updates.scheduledAt?.toISOString() || '';
      }
      
      if (updates.lastError !== undefined) {
        updateFields.lastError = updates.lastError;
      }
      
      if (updates.executionHistory !== undefined) {
        updateFields.executionHistory = JSON.stringify(updates.executionHistory);
      }
      
      if (updates.metadata !== undefined) {
        updateFields.metadata = JSON.stringify(updates.metadata);
      }
      
      if (updates.groupId !== undefined) {
        updateFields.groupId = updates.groupId;
      }
      
      if (Object.keys(updateFields).length > 0) {
        multi.hmset(requestKey, updateFields);
      }
      
      await multi.exec();
      
      this.logger.debug('Request updated in Redis', {
        id,
        updates: Object.keys(updates)
      });
      
    } catch (error) {
      this.logger.error('Failed to update request in Redis', { error, requestId: id });
      throw error;
    }
  }
  
  async remove(id: string): Promise<boolean> {
    const multi = this.redis.multi();
    
    try {
      const request = await this.getRequest(id);
      if (!request) {
        return false;
      }
      
      // Remove from all indexes
      multi.del(this.keys.request(id));
      multi.zrem(this.keys.priorityQueue(request.priority, request.zone), id);
      multi.srem(this.keys.statusIndex(request.status), id);
      multi.srem(this.keys.zoneIndex(request.zone), id);
      
      if (request.fingerprint) {
        multi.del(this.keys.fingerprint(request.fingerprint));
      }
      
      const results = await multi.exec();
      
      this.logger.debug('Request removed from Redis', { id });
      
      return !!(results && results.length > 0 && results[0][1] === 1);
      
    } catch (error) {
      this.logger.error('Failed to remove request from Redis', { error, requestId: id });
      throw error;
    }
  }
  
  async getRequest(id: string): Promise<QueueRequest | null> {
    try {
      const data = await this.redis.hmget(
        this.keys.request(id),
        'id', 'groupId', 'endpoint', 'method', 'zone', 'priority',
        'data', 'headers', 'createdAt', 'scheduledAt', 'timeout',
        'maxRetries', 'retryCount', 'retryable', 'batchable',
        'metadata', 'status', 'lastError', 'executionHistory', 'fingerprint'
      );
      
      if (!data[0]) {
        return null;
      }
      
      return this.parseRedisData(data);
      
    } catch (error) {
      this.logger.error('Failed to get request from Redis', { error, requestId: id });
      throw error;
    }
  }
  
  async getRequests(filter: QueueFilter): Promise<QueueRequest[]> {
    try {
      let candidateIds: string[] = [];
      
      // Get candidate IDs based on filters
      if (filter.status) {
        const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
        const statusSets = await Promise.all(
          statusArray.map(status => this.redis.smembers(this.keys.statusIndex(status)))
        );
        candidateIds = Array.from(new Set(statusSets.flat()));
      } else if (filter.zone) {
        candidateIds = await this.redis.smembers(this.keys.zoneIndex(filter.zone));
      } else {
        // Get all request IDs (expensive operation, should be avoided in production)
        const pattern = `${this.keyPrefix}:request:*`;
        const keys = await this.redis.keys(pattern);
        candidateIds = keys.map(key => key.replace(`${this.keyPrefix}:request:`, ''));
      }
      
      if (candidateIds.length === 0) {
        return [];
      }
      
      // Get request data for all candidates
      const requests = await Promise.all(
        candidateIds.map(id => this.getRequest(id))
      );
      
      // Filter out null requests and apply remaining filters
      let results = requests.filter((req): req is QueueRequest => req !== null);
      
      // Apply additional filters
      if (filter.endpoint) {
        results = results.filter(req => req.endpoint === filter.endpoint);
      }
      
      if (filter.priority) {
        if (filter.priority.min !== undefined) {
          results = results.filter(req => req.priority >= filter.priority!.min!);
        }
        if (filter.priority.max !== undefined) {
          results = results.filter(req => req.priority <= filter.priority!.max!);
        }
      }
      
      if (filter.createdAfter) {
        results = results.filter(req => req.createdAt >= filter.createdAfter!);
      }
      
      if (filter.createdBefore) {
        results = results.filter(req => req.createdAt <= filter.createdBefore!);
      }
      
      if (filter.scheduledAfter) {
        results = results.filter(req => req.scheduledAt && req.scheduledAt >= filter.scheduledAfter!);
      }
      
      if (filter.scheduledBefore) {
        results = results.filter(req => req.scheduledAt && req.scheduledAt <= filter.scheduledBefore!);
      }
      
      // Sort results
      if (filter.sort) {
        results.sort((a, b) => {
          const field = filter.sort!.field;
          const direction = filter.sort!.direction === 'asc' ? 1 : -1;
          
          let aVal: any, bVal: any;
          
          switch (field) {
            case 'createdAt':
              aVal = a.createdAt.getTime();
              bVal = b.createdAt.getTime();
              break;
            case 'scheduledAt':
              aVal = a.scheduledAt?.getTime() || 0;
              bVal = b.scheduledAt?.getTime() || 0;
              break;
            case 'priority':
              aVal = a.priority;
              bVal = b.priority;
              break;
            case 'retryCount':
              aVal = a.retryCount;
              bVal = b.retryCount;
              break;
            default:
              return 0;
          }
          
          return aVal < bVal ? -direction : aVal > bVal ? direction : 0;
        });
      }
      
      // Apply pagination
      const startIndex = filter.offset || 0;
      const endIndex = filter.limit ? startIndex + filter.limit : undefined;
      
      return results.slice(startIndex, endIndex);
      
    } catch (error) {
      this.logger.error('Failed to get requests from Redis', error);
      throw error;
    }
  }
  
  async size(zone?: string): Promise<number> {
    try {
      if (zone) {
        return await this.redis.scard(this.keys.zoneIndex(zone));
      }
      
      // Count all pending and processing requests
      const pendingCount = await this.redis.scard(this.keys.statusIndex('pending'));
      const processingCount = await this.redis.scard(this.keys.statusIndex('processing'));
      
      return pendingCount + processingCount;
      
    } catch (error) {
      this.logger.error('Failed to get queue size from Redis', error);
      throw error;
    }
  }
  
  async clear(zone?: string): Promise<number> {
    try {
      if (zone) {
        const requestIds = await this.redis.smembers(this.keys.zoneIndex(zone));
        
        if (requestIds.length === 0) {
          return 0;
        }
        
        // Remove each request
        let removed = 0;
        for (const id of requestIds) {
          const success = await this.remove(id);
          if (success) {
            removed++;
          }
        }
        
        return removed;
      }
      
      // Clear all requests
      const pattern = `${this.keyPrefix}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      await this.redis.del(...keys);
      
      return keys.length;
      
    } catch (error) {
      this.logger.error('Failed to clear queue in Redis', error);
      throw error;
    }
  }
  
  async storeBatch(batch: QueueBatch): Promise<void> {
    try {
      await this.redis.hmset(this.keys.batch(batch.id), {
        id: batch.id,
        priority: batch.priority.toString(),
        createdAt: batch.createdAt.toISOString(),
        endpoint: batch.endpoint,
        zone: batch.zone,
        maxSize: batch.maxSize.toString(),
        timeout: batch.timeout.toString(),
        status: batch.status,
        metadata: JSON.stringify(batch.metadata),
        requests: JSON.stringify(batch.requests)
      });
      
      // Add to batches index
      await this.redis.sadd(this.keys.batches(), batch.id);
      
      // Set expiry (1 hour after timeout)
      await this.redis.expire(this.keys.batch(batch.id), Math.ceil(batch.timeout / 1000) + 3600);
      
    } catch (error) {
      this.logger.error('Failed to store batch in Redis', { error, batchId: batch.id });
      throw error;
    }
  }
  
  async getReadyBatches(): Promise<QueueBatch[]> {
    try {
      const batchIds = await this.redis.smembers(this.keys.batches());
      
      if (batchIds.length === 0) {
        return [];
      }
      
      const batches = await Promise.all(
        batchIds.map(async (id) => {
          const data = await this.redis.hmget(
            this.keys.batch(id),
            'id', 'priority', 'createdAt', 'endpoint', 'zone',
            'maxSize', 'timeout', 'status', 'metadata', 'requests'
          );
          
          if (!data[0]) {
            return null;
          }
          
          return this.parseBatchData(data);
        })
      );
      
      const now = new Date();
      
      return batches
        .filter((batch): batch is QueueBatch => batch !== null)
        .filter(batch => {
          return batch.status === 'ready' || 
            (batch.status === 'collecting' && 
             now.getTime() - batch.createdAt.getTime() > batch.timeout);
        });
      
    } catch (error) {
      this.logger.error('Failed to get ready batches from Redis', error);
      throw error;
    }
  }
  
  async updateBatch(id: string, updates: Partial<QueueBatch>): Promise<void> {
    try {
      const updateFields: Record<string, string> = {};
      
      if (updates.status !== undefined) {
        updateFields.status = updates.status;
      }
      
      if (updates.requests !== undefined) {
        updateFields.requests = JSON.stringify(updates.requests);
      }
      
      if (updates.metadata !== undefined) {
        updateFields.metadata = JSON.stringify(updates.metadata);
      }
      
      if (Object.keys(updateFields).length > 0) {
        await this.redis.hmset(this.keys.batch(id), updateFields);
      }
      
    } catch (error) {
      this.logger.error('Failed to update batch in Redis', { error, batchId: id });
      throw error;
    }
  }
  
  async getMetrics(): Promise<QueueMetrics> {
    try {
      // Get status counts
      const statusKeys = ['pending', 'processing', 'completed', 'failed'];
      const statusCounts = await Promise.all(
        statusKeys.map(status => this.redis.scard(this.keys.statusIndex(status)))
      );
      
      // Get priority distribution for queued items
      const priorityDistribution = new Map<number, number>();
      for (let priority = 1; priority <= 10; priority++) {
        const count = await this.redis.zcard(this.keys.priorityQueue(priority));
        if (count > 0) {
          priorityDistribution.set(priority, count);
        }
      }
      
      // Get batch count
      const batchCount = await this.redis.scard(this.keys.batches());
      
      // Build metrics
      const metrics: QueueMetrics = {
        totalRequests: statusCounts.reduce((sum, count) => sum + count, 0),
        successfulRequests: statusCounts[2], // completed
        failedRequests: statusCounts[3], // failed
        queuedRequests: statusCounts[0], // pending
        processingRequests: statusCounts[1], // processing
        averageProcessingTime: 0, // Would need historical data
        averageQueueTime: 0, // Would need historical data
        queueUtilization: 0, // Would need max capacity
        throughput: 0, // Would need time-series data
        errorRate: 0,
        batchStats: {
          totalBatches: batchCount,
          averageBatchSize: 0,
          averageBatchTime: 0
        },
        priorityDistribution,
        statusDistribution: new Map([
          ['pending', statusCounts[0]],
          ['processing', statusCounts[1]],
          ['completed', statusCounts[2]],
          ['failed', statusCounts[3]]
        ]),
        lastUpdated: new Date()
      };
      
      // Calculate error rate
      const totalFinished = metrics.successfulRequests + metrics.failedRequests;
      metrics.errorRate = totalFinished > 0 ? metrics.failedRequests / totalFinished : 0;
      
      return metrics;
      
    } catch (error) {
      this.logger.error('Failed to get metrics from Redis', error);
      throw error;
    }
  }
  
  async maintenance(): Promise<void> {
    try {
      // Clean up expired requests (Redis TTL handles this automatically)
      // Clean up empty priority queues
      for (let priority = 1; priority <= 10; priority++) {
        const count = await this.redis.zcard(this.keys.priorityQueue(priority));
        if (count === 0) {
          await this.redis.del(this.keys.priorityQueue(priority));
        }
      }
      
      // Clean up expired batches
      const batchIds = await this.redis.smembers(this.keys.batches());
      for (const batchId of batchIds) {
        const exists = await this.redis.exists(this.keys.batch(batchId));
        if (!exists) {
          await this.redis.srem(this.keys.batches(), batchId);
        }
      }
      
    } catch (error) {
      this.logger.error('Redis maintenance failed', error);
    }
  }
  
  async close(): Promise<void> {
    await this.redis.quit();
    this.logger.debug('RedisBackend closed');
  }
  
  /**
   * Load Lua scripts for atomic operations
   */
  private async loadLuaScripts(): Promise<void> {
    // Scripts would be defined here for complex atomic operations
    // For now, we use simpler Redis commands
  }
  
  /**
   * Parse Redis hash data into QueueRequest
   */
  private parseRedisData(data: (string | null)[]): QueueRequest {
    return {
      id: data[0] || '',
      groupId: data[1] || undefined,
      endpoint: data[2] || '',
      method: (data[3] as any) || 'GET',
      zone: data[4] || '',
      priority: parseInt(data[5] || '5'),
      data: data[6] ? JSON.parse(data[6]) : undefined,
      headers: data[7] ? JSON.parse(data[7]) : undefined,
      createdAt: new Date(data[8] || ''),
      scheduledAt: data[9] ? new Date(data[9]) : undefined,
      timeout: parseInt(data[10] || '300000'),
      maxRetries: parseInt(data[11] || '3'),
      retryCount: parseInt(data[12] || '0'),
      retryable: data[13] === '1',
      batchable: data[14] === '1',
      metadata: data[15] ? JSON.parse(data[15]) : {},
      status: (data[16] as QueueRequestStatus) || 'pending',
      lastError: data[17] || undefined,
      executionHistory: data[18] ? JSON.parse(data[18]) : [],
      fingerprint: data[19] || undefined
    };
  }
  
  /**
   * Parse Redis hash data into QueueBatch
   */
  private parseBatchData(data: (string | null)[]): QueueBatch | null {
    if (!data[0]) {
      return null;
    }
    
    return {
      id: data[0],
      priority: parseInt(data[1] || '5'),
      requests: data[9] ? JSON.parse(data[9]) : [],
      createdAt: new Date(data[2] || ''),
      endpoint: data[3] || '',
      zone: data[4] || '',
      maxSize: parseInt(data[5] || '10'),
      timeout: parseInt(data[6] || '1000'),
      status: (data[7] as any) || 'collecting',
      metadata: data[8] ? JSON.parse(data[8]) : {}
    };
  }
}