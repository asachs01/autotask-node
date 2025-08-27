/**
 * SQLite Storage Backend
 * 
 * Persistent queue storage using SQLite database.
 * Provides data persistence across restarts with excellent performance
 * and ACID transactions for reliability.
 */

// Optional SQLite dependencies - need to be installed separately
let sqlite3: any;
let sqlite: any;

try {
  sqlite3 = require('sqlite3');
  sqlite = require('sqlite');
} catch (error) {
  // SQLite dependencies not available
  console.warn('SQLite backend requires sqlite3 and sqlite packages. Install with: npm install sqlite3 sqlite');
}

type Database = any;
import winston from 'winston';
import {
  QueueRequest,
  QueueRequestStatus,
  QueueBatch,
  QueueMetrics,
  QueueFilter,
  QueueStorageBackend,
  QueuePersistenceConfig
} from '../types/QueueTypes';

interface DatabaseRequest {
  id: string;
  endpoint: string;
  method: string;
  zone: string;
  priority: number;
  data: string | null;
  headers: string | null;
  created_at: string;
  scheduled_at: string | null;
  timeout: number;
  max_retries: number;
  retry_count: number;
  retryable: number;
  batchable: number;
  metadata: string;
  status: QueueRequestStatus;
  last_error: string | null;
  execution_history: string;
  fingerprint: string | null;
  group_id: string | null;
}

export class SQLiteBackend implements QueueStorageBackend {
  private logger: winston.Logger;
  private db: Database | null = null;
  private dbPath: string;
  private options: QueuePersistenceConfig['options'];
  private metricsCache: QueueMetrics | null = null;
  private lastMetricsUpdate = 0;
  
  constructor(
    dbPath: string,
    options: QueuePersistenceConfig['options'],
    logger: winston.Logger
  ) {
    if (!sqlite3 || !sqlite) {
      throw new Error('SQLite backend requires sqlite3 and sqlite packages. Install with: npm install sqlite3 sqlite');
    }
    
    this.dbPath = dbPath;
    this.options = options;
    this.logger = logger;
  }
  
  async initialize(): Promise<void> {
    try {
      // Open database connection
      this.db = await sqlite.open({
        filename: this.dbPath,
        driver: sqlite3.Database,
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
      });
      
      // Configure SQLite for performance
      if (this.options.walMode) {
        await this.db.exec('PRAGMA journal_mode = WAL');
      }
      
      await this.db.exec(`
        PRAGMA synchronous = NORMAL;
        PRAGMA cache_size = 10000;
        PRAGMA temp_store = memory;
        PRAGMA mmap_size = 268435456;
      `);
      
      // Create tables
      await this.createTables();
      
      // Create indexes
      await this.createIndexes();
      
      this.logger.info('SQLiteBackend initialized', { dbPath: this.dbPath });
      
    } catch (error) {
      this.logger.error('Failed to initialize SQLiteBackend', error);
      throw error;
    }
  }
  
  async enqueue(request: QueueRequest): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      await this.db.run(`
        INSERT INTO requests (
          id, endpoint, method, zone, priority, data, headers,
          created_at, scheduled_at, timeout, max_retries, retry_count,
          retryable, batchable, metadata, status, last_error,
          execution_history, fingerprint, group_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        request.id,
        request.endpoint,
        request.method,
        request.zone,
        request.priority,
        request.data ? JSON.stringify(request.data) : null,
        request.headers ? JSON.stringify(request.headers) : null,
        request.createdAt.toISOString(),
        request.scheduledAt?.toISOString() || null,
        request.timeout,
        request.maxRetries,
        request.retryCount,
        request.retryable ? 1 : 0,
        request.batchable ? 1 : 0,
        JSON.stringify(request.metadata),
        request.status,
        request.lastError || null,
        JSON.stringify(request.executionHistory),
        request.fingerprint || null,
        request.groupId || null
      ]);
      
      this.invalidateMetricsCache();
      
    } catch (error) {
      this.logger.error('Failed to enqueue request', { error, requestId: request.id });
      throw error;
    }
  }
  
  async dequeue(zone?: string): Promise<QueueRequest | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const now = new Date().toISOString();
      
      // Build query with optional zone filter
      let query = `
        SELECT * FROM requests 
        WHERE status = 'pending' 
        AND (scheduled_at IS NULL OR scheduled_at <= ?)
      `;
      
      const params = [now];
      
      if (zone) {
        query += ' AND zone = ?';
        params.push(zone);
      }
      
      query += ' ORDER BY priority DESC, created_at ASC LIMIT 1';
      
      const row = await this.db.get(query, params);
      
      if (!row) {
        return null;
      }
      
      // Convert to QueueRequest
      const request = this.dbRowToRequest(row);
      
      // Remove from queue (mark as processing)
      await this.db.run(
        'UPDATE requests SET status = ? WHERE id = ?',
        ['processing', request.id]
      );
      
      this.invalidateMetricsCache();
      
      return request;
      
    } catch (error) {
      this.logger.error('Failed to dequeue request', error);
      throw error;
    }
  }
  
  async peek(zone?: string): Promise<QueueRequest | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const now = new Date().toISOString();
      
      let query = `
        SELECT * FROM requests 
        WHERE status = 'pending' 
        AND (scheduled_at IS NULL OR scheduled_at <= ?)
      `;
      
      const params = [now];
      
      if (zone) {
        query += ' AND zone = ?';
        params.push(zone);
      }
      
      query += ' ORDER BY priority DESC, created_at ASC LIMIT 1';
      
      const row = await this.db.get(query, params);
      
      return row ? this.dbRowToRequest(row) : null;
      
    } catch (error) {
      this.logger.error('Failed to peek request', error);
      throw error;
    }
  }
  
  async updateRequest(id: string, updates: Partial<QueueRequest>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const setParts: string[] = [];
      const params: any[] = [];
      
      // Build dynamic update query
      if (updates.status !== undefined) {
        setParts.push('status = ?');
        params.push(updates.status);
      }
      
      if (updates.retryCount !== undefined) {
        setParts.push('retry_count = ?');
        params.push(updates.retryCount);
      }
      
      if (updates.scheduledAt !== undefined) {
        setParts.push('scheduled_at = ?');
        params.push(updates.scheduledAt?.toISOString() || null);
      }
      
      if (updates.lastError !== undefined) {
        setParts.push('last_error = ?');
        params.push(updates.lastError);
      }
      
      if (updates.executionHistory !== undefined) {
        setParts.push('execution_history = ?');
        params.push(JSON.stringify(updates.executionHistory));
      }
      
      if (updates.metadata !== undefined) {
        setParts.push('metadata = ?');
        params.push(JSON.stringify(updates.metadata));
      }
      
      if (updates.groupId !== undefined) {
        setParts.push('group_id = ?');
        params.push(updates.groupId);
      }
      
      if (setParts.length === 0) {
        return; // No updates to apply
      }
      
      params.push(id);
      
      const query = `UPDATE requests SET ${setParts.join(', ')} WHERE id = ?`;
      
      const result = await this.db.run(query, params);
      
      if (result.changes === 0) {
        throw new Error(`Request ${id} not found`);
      }
      
      this.invalidateMetricsCache();
      
    } catch (error) {
      this.logger.error('Failed to update request', { error, requestId: id });
      throw error;
    }
  }
  
  async remove(id: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const result = await this.db.run('DELETE FROM requests WHERE id = ?', [id]);
      
      this.invalidateMetricsCache();
      
      return (result.changes || 0) > 0;
      
    } catch (error) {
      this.logger.error('Failed to remove request', { error, requestId: id });
      throw error;
    }
  }
  
  async getRequest(id: string): Promise<QueueRequest | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const row = await this.db.get('SELECT * FROM requests WHERE id = ?', [id]);
      
      return row ? this.dbRowToRequest(row) : null;
      
    } catch (error) {
      this.logger.error('Failed to get request', { error, requestId: id });
      throw error;
    }
  }
  
  async getRequests(filter: QueueFilter): Promise<QueueRequest[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      let query = 'SELECT * FROM requests WHERE 1=1';
      const params: any[] = [];
      
      // Apply filters
      if (filter.status) {
        const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
        const placeholders = statusArray.map(() => '?').join(',');
        query += ` AND status IN (${placeholders})`;
        params.push(...statusArray);
      }
      
      if (filter.zone) {
        query += ' AND zone = ?';
        params.push(filter.zone);
      }
      
      if (filter.endpoint) {
        query += ' AND endpoint = ?';
        params.push(filter.endpoint);
      }
      
      if (filter.priority) {
        if (filter.priority.min !== undefined) {
          query += ' AND priority >= ?';
          params.push(filter.priority.min);
        }
        if (filter.priority.max !== undefined) {
          query += ' AND priority <= ?';
          params.push(filter.priority.max);
        }
      }
      
      if (filter.createdAfter) {
        query += ' AND created_at >= ?';
        params.push(filter.createdAfter.toISOString());
      }
      
      if (filter.createdBefore) {
        query += ' AND created_at <= ?';
        params.push(filter.createdBefore.toISOString());
      }
      
      if (filter.scheduledAfter) {
        query += ' AND scheduled_at >= ?';
        params.push(filter.scheduledAfter.toISOString());
      }
      
      if (filter.scheduledBefore) {
        query += ' AND scheduled_at <= ?';
        params.push(filter.scheduledBefore.toISOString());
      }
      
      // Add sorting
      if (filter.sort) {
        const field = this.mapSortField(filter.sort.field);
        const direction = filter.sort.direction.toUpperCase();
        query += ` ORDER BY ${field} ${direction}`;
      } else {
        query += ' ORDER BY priority DESC, created_at ASC';
      }
      
      // Add pagination
      if (filter.limit) {
        query += ' LIMIT ?';
        params.push(filter.limit);
        
        if (filter.offset) {
          query += ' OFFSET ?';
          params.push(filter.offset);
        }
      }
      
      const rows = await this.db.all(query, params);
      
      return rows.map((row: any) => this.dbRowToRequest(row));
      
    } catch (error) {
      this.logger.error('Failed to get requests', error);
      throw error;
    }
  }
  
  async size(zone?: string): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      let query = 'SELECT COUNT(*) as count FROM requests WHERE status IN (?, ?)';
      const params = ['pending', 'processing'];
      
      if (zone) {
        query += ' AND zone = ?';
        params.push(zone);
      }
      
      const result = await this.db.get(query, params);
      
      return result?.count || 0;
      
    } catch (error) {
      this.logger.error('Failed to get queue size', error);
      throw error;
    }
  }
  
  async clear(zone?: string): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      let query = 'DELETE FROM requests WHERE status IN (?, ?)';
      const params = ['pending', 'processing'];
      
      if (zone) {
        query += ' AND zone = ?';
        params.push(zone);
      }
      
      const result = await this.db.run(query, params);
      
      this.invalidateMetricsCache();
      
      return result.changes || 0;
      
    } catch (error) {
      this.logger.error('Failed to clear queue', error);
      throw error;
    }
  }
  
  async storeBatch(batch: QueueBatch): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      await this.db.run(`
        INSERT OR REPLACE INTO batches (
          id, priority, created_at, endpoint, zone, max_size,
          timeout, status, metadata, requests
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        batch.id,
        batch.priority,
        batch.createdAt.toISOString(),
        batch.endpoint,
        batch.zone,
        batch.maxSize,
        batch.timeout,
        batch.status,
        JSON.stringify(batch.metadata),
        JSON.stringify(batch.requests)
      ]);
      
    } catch (error) {
      this.logger.error('Failed to store batch', { error, batchId: batch.id });
      throw error;
    }
  }
  
  async getReadyBatches(): Promise<QueueBatch[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const now = new Date().toISOString();
      
      const rows = await this.db.all(`
        SELECT * FROM batches 
        WHERE status = 'ready' 
        OR (status = 'collecting' AND created_at <= datetime(?, '-' || timeout || ' milliseconds'))
        ORDER BY priority DESC, created_at ASC
      `, [now]);
      
      return rows.map((row: any) => ({
        id: row.id,
        priority: row.priority,
        requests: JSON.parse(row.requests),
        createdAt: new Date(row.created_at),
        endpoint: row.endpoint,
        zone: row.zone,
        maxSize: row.max_size,
        timeout: row.timeout,
        status: row.status,
        metadata: JSON.parse(row.metadata)
      }));
      
    } catch (error) {
      this.logger.error('Failed to get ready batches', error);
      throw error;
    }
  }
  
  async updateBatch(id: string, updates: Partial<QueueBatch>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const setParts: string[] = [];
      const params: any[] = [];
      
      if (updates.status !== undefined) {
        setParts.push('status = ?');
        params.push(updates.status);
      }
      
      if (updates.requests !== undefined) {
        setParts.push('requests = ?');
        params.push(JSON.stringify(updates.requests));
      }
      
      if (updates.metadata !== undefined) {
        setParts.push('metadata = ?');
        params.push(JSON.stringify(updates.metadata));
      }
      
      if (setParts.length === 0) {
        return;
      }
      
      params.push(id);
      
      const query = `UPDATE batches SET ${setParts.join(', ')} WHERE id = ?`;
      
      await this.db.run(query, params);
      
    } catch (error) {
      this.logger.error('Failed to update batch', { error, batchId: id });
      throw error;
    }
  }
  
  async getMetrics(): Promise<QueueMetrics> {
    // Use cached metrics if recent
    const now = Date.now();
    if (this.metricsCache && (now - this.lastMetricsUpdate) < 30000) {
      return { ...this.metricsCache };
    }
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // Get basic counts
      const statusCounts = await this.db.all(`
        SELECT status, COUNT(*) as count 
        FROM requests 
        GROUP BY status
      `);
      
      const priorityCounts = await this.db.all(`
        SELECT priority, COUNT(*) as count 
        FROM requests 
        WHERE status IN ('pending', 'processing')
        GROUP BY priority
      `);
      
      // Get timing metrics
      const timingMetrics = await this.db.get(`
        SELECT 
          AVG(json_extract(execution_history, '$[#-1].duration')) as avg_processing_time,
          COUNT(*) as completed_count
        FROM requests 
        WHERE status = 'completed' 
        AND json_array_length(execution_history) > 0
      `);
      
      // Get batch metrics
      const batchMetrics = await this.db.get(`
        SELECT 
          COUNT(*) as total_batches,
          AVG(json_array_length(requests)) as avg_batch_size
        FROM batches
      `);
      
      // Build metrics object
      const metrics: QueueMetrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        queuedRequests: 0,
        processingRequests: 0,
        averageProcessingTime: timingMetrics?.avg_processing_time || 0,
        averageQueueTime: 0,
        queueUtilization: 0,
        throughput: 0,
        errorRate: 0,
        batchStats: {
          totalBatches: batchMetrics?.total_batches || 0,
          averageBatchSize: batchMetrics?.avg_batch_size || 0,
          averageBatchTime: 0
        },
        priorityDistribution: new Map(),
        statusDistribution: new Map(),
        lastUpdated: new Date()
      };
      
      // Process status counts
      for (const row of statusCounts) {
        metrics.statusDistribution.set(row.status, row.count);
        metrics.totalRequests += row.count;
        
        if (row.status === 'completed') {
          metrics.successfulRequests = row.count;
        } else if (row.status === 'failed') {
          metrics.failedRequests = row.count;
        } else if (row.status === 'pending' || row.status === 'retrying') {
          metrics.queuedRequests += row.count;
        } else if (row.status === 'processing') {
          metrics.processingRequests = row.count;
        }
      }
      
      // Process priority distribution
      for (const row of priorityCounts) {
        metrics.priorityDistribution.set(row.priority, row.count);
      }
      
      // Calculate derived metrics
      metrics.errorRate = metrics.totalRequests > 0 ? 
        metrics.failedRequests / metrics.totalRequests : 0;
      
      // Cache metrics
      this.metricsCache = metrics;
      this.lastMetricsUpdate = now;
      
      return { ...metrics };
      
    } catch (error) {
      this.logger.error('Failed to get metrics', error);
      throw error;
    }
  }
  
  async maintenance(): Promise<void> {
    if (!this.db) {
      return;
    }
    
    try {
      const now = new Date().toISOString();
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      
      // Mark expired pending requests
      await this.db.run(`
        UPDATE requests 
        SET status = 'expired' 
        WHERE status = 'pending' 
        AND datetime(created_at, '+' || timeout || ' milliseconds') <= ?
      `, [now]);
      
      // Clean up old completed/failed requests
      const result = await this.db.run(`
        DELETE FROM requests 
        WHERE status IN ('completed', 'failed', 'expired', 'cancelled') 
        AND created_at <= ?
      `, [oneHourAgo]);
      
      // Clean up old batches
      await this.db.run(`
        DELETE FROM batches 
        WHERE status IN ('completed', 'failed') 
        AND created_at <= ?
      `, [oneHourAgo]);
      
      // Vacuum if many deletes
      if ((result.changes || 0) > 1000) {
        await this.db.exec('VACUUM');
      }
      
      // Invalidate metrics cache
      this.invalidateMetricsCache();
      
      if ((result.changes || 0) > 0) {
        this.logger.debug('Database maintenance completed', {
          deletedRequests: result.changes
        });
      }
      
    } catch (error) {
      this.logger.error('Database maintenance failed', error);
    }
  }
  
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.logger.debug('SQLiteBackend closed');
    }
  }
  
  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      return;
    }
    
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        zone TEXT NOT NULL,
        priority INTEGER NOT NULL,
        data TEXT,
        headers TEXT,
        created_at TEXT NOT NULL,
        scheduled_at TEXT,
        timeout INTEGER NOT NULL,
        max_retries INTEGER NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        retryable INTEGER NOT NULL DEFAULT 1,
        batchable INTEGER NOT NULL DEFAULT 0,
        metadata TEXT NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'pending',
        last_error TEXT,
        execution_history TEXT NOT NULL DEFAULT '[]',
        fingerprint TEXT,
        group_id TEXT
      )
    `);
    
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        priority INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        zone TEXT NOT NULL,
        max_size INTEGER NOT NULL,
        timeout INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'collecting',
        metadata TEXT NOT NULL DEFAULT '{}',
        requests TEXT NOT NULL DEFAULT '[]'
      )
    `);
  }
  
  /**
   * Create database indexes
   */
  private async createIndexes(): Promise<void> {
    if (!this.db) {
      return;
    }
    
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
      CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
      CREATE INDEX IF NOT EXISTS idx_requests_zone ON requests(zone);
      CREATE INDEX IF NOT EXISTS idx_requests_endpoint ON requests(endpoint);
      CREATE INDEX IF NOT EXISTS idx_requests_scheduled ON requests(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at);
      CREATE INDEX IF NOT EXISTS idx_requests_fingerprint ON requests(fingerprint);
      CREATE INDEX IF NOT EXISTS idx_requests_queue ON requests(status, priority, created_at);
      
      CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
      CREATE INDEX IF NOT EXISTS idx_batches_priority ON batches(priority);
      CREATE INDEX IF NOT EXISTS idx_batches_created ON batches(created_at);
    `);
  }
  
  /**
   * Convert database row to QueueRequest
   */
  private dbRowToRequest(row: DatabaseRequest): QueueRequest {
    return {
      id: row.id,
      groupId: row.group_id || undefined,
      endpoint: row.endpoint,
      method: row.method as any,
      zone: row.zone,
      priority: row.priority,
      data: row.data ? JSON.parse(row.data) : undefined,
      headers: row.headers ? JSON.parse(row.headers) : undefined,
      createdAt: new Date(row.created_at),
      scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : undefined,
      timeout: row.timeout,
      maxRetries: row.max_retries,
      retryCount: row.retry_count,
      retryable: row.retryable === 1,
      batchable: row.batchable === 1,
      metadata: JSON.parse(row.metadata),
      status: row.status,
      lastError: row.last_error || undefined,
      executionHistory: JSON.parse(row.execution_history),
      fingerprint: row.fingerprint || undefined
    };
  }
  
  /**
   * Map sort fields to database columns
   */
  private mapSortField(field: string): string {
    switch (field) {
      case 'createdAt':
        return 'created_at';
      case 'scheduledAt':
        return 'scheduled_at';
      case 'retryCount':
        return 'retry_count';
      default:
        return field;
    }
  }
  
  /**
   * Invalidate metrics cache
   */
  private invalidateMetricsCache(): void {
    this.metricsCache = null;
    this.lastMetricsUpdate = 0;
  }
}