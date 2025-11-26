/**
 * In-Memory Storage Backend
 *
 * Fast in-memory queue storage for development and testing.
 * Provides full QueueStorageBackend implementation without external dependencies.
 */

import winston from 'winston';
import {
  QueueRequest,
  QueueRequestStatus,
  QueueBatch,
  QueueMetrics,
  QueueFilter,
  QueueStorageBackend,
} from '../types/QueueTypes';

/**
 * In-memory queue storage backend
 */
export class MemoryBackend implements QueueStorageBackend {
  private logger: winston.Logger;
  private requests = new Map<string, QueueRequest>();
  private batches = new Map<string, QueueBatch>();
  private priorityQueues = new Map<string, Map<number, Set<string>>>();
  private statusIndexes = new Map<QueueRequestStatus, Set<string>>();
  private zoneIndexes = new Map<string, Set<string>>();
  private fingerprintMap = new Map<string, string>();
  private initialized = false;

  constructor(logger: winston.Logger) {
    this.logger = logger;
    this.initializeIndexes();
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initializeIndexes();
    this.initialized = true;

    this.logger.info('MemoryBackend initialized successfully');
  }

  async enqueue(request: QueueRequest): Promise<void> {
    try {
      // Store request
      this.requests.set(request.id, { ...request });

      // Add to priority queue
      const queueKey = this.getQueueKey(request.zone);
      if (!this.priorityQueues.has(queueKey)) {
        this.priorityQueues.set(queueKey, new Map());
      }

      const priorityQueue = this.priorityQueues.get(queueKey)!;
      if (!priorityQueue.has(request.priority)) {
        priorityQueue.set(request.priority, new Set());
      }

      priorityQueue.get(request.priority)!.add(request.id);

      // Update status index
      this.addToStatusIndex(request.status, request.id);

      // Update zone index
      this.addToZoneIndex(request.zone, request.id);

      // Set fingerprint mapping
      if (request.fingerprint) {
        this.fingerprintMap.set(request.fingerprint, request.id);
      }

      this.logger.debug('Request enqueued to memory', {
        id: request.id,
        priority: request.priority,
        zone: request.zone,
      });
    } catch (error) {
      this.logger.error('Failed to enqueue request to memory', {
        error,
        requestId: request.id,
      });
      throw error;
    }
  }

  async dequeue(zone?: string): Promise<QueueRequest | null> {
    try {
      const queueKey = this.getQueueKey(zone);
      const priorityQueue = this.priorityQueues.get(queueKey);

      if (!priorityQueue) {
        return null;
      }

      // Find highest priority queue with pending requests
      for (let priority = 10; priority >= 1; priority--) {
        const requestIds = priorityQueue.get(priority);

        if (!requestIds || requestIds.size === 0) {
          continue;
        }

        // Find first pending request that is ready
        for (const requestId of Array.from(requestIds)) {
          const request = this.requests.get(requestId);

          if (!request || request.status !== 'pending') {
            continue;
          }

          // Check if scheduled time has passed
          if (request.scheduledAt && request.scheduledAt > new Date()) {
            continue;
          }

          // Remove from priority queue and update status
          requestIds.delete(requestId);
          this.removeFromStatusIndex('pending', requestId);
          this.addToStatusIndex('processing', requestId);

          request.status = 'processing';
          this.requests.set(requestId, request);

          this.logger.debug('Request dequeued from memory', {
            id: request.id,
            priority: request.priority,
            zone: request.zone,
          });

          return { ...request };
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to dequeue request from memory', error);
      throw error;
    }
  }

  async peek(zone?: string): Promise<QueueRequest | null> {
    try {
      const queueKey = this.getQueueKey(zone);
      const priorityQueue = this.priorityQueues.get(queueKey);

      if (!priorityQueue) {
        return null;
      }

      // Find highest priority queue with pending requests
      for (let priority = 10; priority >= 1; priority--) {
        const requestIds = priorityQueue.get(priority);

        if (!requestIds || requestIds.size === 0) {
          continue;
        }

        // Find first pending request that is ready
        for (const requestId of Array.from(requestIds)) {
          const request = this.requests.get(requestId);

          if (!request || request.status !== 'pending') {
            continue;
          }

          // Check if scheduled time has passed
          if (request.scheduledAt && request.scheduledAt > new Date()) {
            continue;
          }

          return { ...request };
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to peek request from memory', error);
      throw error;
    }
  }

  async updateRequest(
    id: string,
    updates: Partial<QueueRequest>
  ): Promise<void> {
    try {
      const request = this.requests.get(id);

      if (!request) {
        throw new Error(`Request ${id} not found`);
      }

      const oldStatus = request.status;

      // Apply updates
      Object.assign(request, updates);

      // Update status index if status changed
      if (updates.status !== undefined && oldStatus !== updates.status) {
        this.removeFromStatusIndex(oldStatus, id);
        this.addToStatusIndex(updates.status, id);
      }

      this.requests.set(id, request);

      this.logger.debug('Request updated in memory', {
        id,
        updates: Object.keys(updates),
      });
    } catch (error) {
      this.logger.error('Failed to update request in memory', {
        error,
        requestId: id,
      });
      throw error;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const request = this.requests.get(id);

      if (!request) {
        return false;
      }

      // Remove from all indexes
      this.requests.delete(id);

      // Remove from priority queue
      const queueKey = this.getQueueKey(request.zone);
      const priorityQueue = this.priorityQueues.get(queueKey);
      if (priorityQueue) {
        const requestIds = priorityQueue.get(request.priority);
        if (requestIds) {
          requestIds.delete(id);
        }
      }

      // Remove from status index
      this.removeFromStatusIndex(request.status, id);

      // Remove from zone index
      this.removeFromZoneIndex(request.zone, id);

      // Remove fingerprint mapping
      if (request.fingerprint) {
        this.fingerprintMap.delete(request.fingerprint);
      }

      this.logger.debug('Request removed from memory', { id });

      return true;
    } catch (error) {
      this.logger.error('Failed to remove request from memory', {
        error,
        requestId: id,
      });
      throw error;
    }
  }

  async getRequest(id: string): Promise<QueueRequest | null> {
    try {
      const request = this.requests.get(id);
      return request ? { ...request } : null;
    } catch (error) {
      this.logger.error('Failed to get request from memory', {
        error,
        requestId: id,
      });
      throw error;
    }
  }

  async getRequests(filter: QueueFilter): Promise<QueueRequest[]> {
    try {
      let candidateIds: string[] = [];

      // Get candidate IDs based on filters
      if (filter.status) {
        const statusArray = Array.isArray(filter.status)
          ? filter.status
          : [filter.status];
        const statusSets = statusArray.map(
          status => this.statusIndexes.get(status) || new Set<string>()
        );
        const combined = new Set<string>();
        statusSets.forEach(set =>
          Array.from(set).forEach(id => combined.add(id))
        );
        candidateIds = Array.from(combined);
      } else if (filter.zone) {
        const zoneSet = this.zoneIndexes.get(filter.zone);
        candidateIds = zoneSet ? Array.from(zoneSet) : [];
      } else {
        candidateIds = Array.from(this.requests.keys());
      }

      if (candidateIds.length === 0) {
        return [];
      }

      // Get request data for all candidates
      let results = candidateIds
        .map(id => this.requests.get(id))
        .filter((req): req is QueueRequest => req !== null);

      // Apply additional filters
      if (filter.endpoint) {
        results = results.filter(req => req.endpoint === filter.endpoint);
      }

      if (filter.priority) {
        if (filter.priority.min !== undefined) {
          results = results.filter(
            req => req.priority >= filter.priority!.min!
          );
        }
        if (filter.priority.max !== undefined) {
          results = results.filter(
            req => req.priority <= filter.priority!.max!
          );
        }
      }

      if (filter.createdAfter) {
        results = results.filter(req => req.createdAt >= filter.createdAfter!);
      }

      if (filter.createdBefore) {
        results = results.filter(req => req.createdAt <= filter.createdBefore!);
      }

      if (filter.scheduledAfter) {
        results = results.filter(
          req => req.scheduledAt && req.scheduledAt >= filter.scheduledAfter!
        );
      }

      if (filter.scheduledBefore) {
        results = results.filter(
          req => req.scheduledAt && req.scheduledAt <= filter.scheduledBefore!
        );
      }

      // Sort results
      if (filter.sort) {
        results.sort((a, b) => {
          const field = filter.sort!.field;
          const direction = filter.sort!.direction === 'asc' ? 1 : -1;

          let aVal: number, bVal: number;

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

      return results.slice(startIndex, endIndex).map(req => ({ ...req }));
    } catch (error) {
      this.logger.error('Failed to get requests from memory', error);
      throw error;
    }
  }

  async size(zone?: string): Promise<number> {
    try {
      if (zone) {
        const zoneSet = this.zoneIndexes.get(zone);
        return zoneSet ? zoneSet.size : 0;
      }

      // Count all pending and processing requests
      const pendingCount = this.statusIndexes.get('pending')?.size || 0;
      const processingCount = this.statusIndexes.get('processing')?.size || 0;

      return pendingCount + processingCount;
    } catch (error) {
      this.logger.error('Failed to get queue size from memory', error);
      throw error;
    }
  }

  async clear(zone?: string): Promise<number> {
    try {
      if (zone) {
        const requestIds = this.zoneIndexes.get(zone);

        if (!requestIds || requestIds.size === 0) {
          return 0;
        }

        let removed = 0;
        for (const id of Array.from(requestIds)) {
          const success = await this.remove(id);
          if (success) {
            removed++;
          }
        }

        return removed;
      }

      // Clear all requests
      const count = this.requests.size;
      this.requests.clear();
      this.batches.clear();
      this.priorityQueues.clear();
      this.fingerprintMap.clear();
      this.initializeIndexes();

      return count;
    } catch (error) {
      this.logger.error('Failed to clear queue in memory', error);
      throw error;
    }
  }

  async storeBatch(batch: QueueBatch): Promise<void> {
    try {
      this.batches.set(batch.id, { ...batch });

      this.logger.debug('Batch stored in memory', { batchId: batch.id });
    } catch (error) {
      this.logger.error('Failed to store batch in memory', {
        error,
        batchId: batch.id,
      });
      throw error;
    }
  }

  async getReadyBatches(): Promise<QueueBatch[]> {
    try {
      const now = Date.now();
      const readyBatches: QueueBatch[] = [];

      for (const batch of Array.from(this.batches.values())) {
        if (
          batch.status === 'ready' ||
          (batch.status === 'collecting' &&
            now - batch.createdAt.getTime() > batch.timeout)
        ) {
          readyBatches.push({ ...batch });
        }
      }

      return readyBatches;
    } catch (error) {
      this.logger.error('Failed to get ready batches from memory', error);
      throw error;
    }
  }

  async updateBatch(id: string, updates: Partial<QueueBatch>): Promise<void> {
    try {
      const batch = this.batches.get(id);

      if (!batch) {
        throw new Error(`Batch ${id} not found`);
      }

      Object.assign(batch, updates);
      this.batches.set(id, batch);
    } catch (error) {
      this.logger.error('Failed to update batch in memory', {
        error,
        batchId: id,
      });
      throw error;
    }
  }

  async getMetrics(): Promise<QueueMetrics> {
    try {
      // Get status counts
      const statusDistribution = new Map<QueueRequestStatus, number>();
      for (const [status, ids] of Array.from(this.statusIndexes.entries())) {
        statusDistribution.set(status, ids.size);
      }

      // Get priority distribution
      const priorityDistribution = new Map<number, number>();
      for (const priorityQueue of Array.from(this.priorityQueues.values())) {
        for (const [priority, ids] of Array.from(priorityQueue.entries())) {
          const current = priorityDistribution.get(priority) || 0;
          priorityDistribution.set(priority, current + ids.size);
        }
      }

      const totalRequests = this.requests.size;
      const successfulRequests = statusDistribution.get('completed') || 0;
      const failedRequests = statusDistribution.get('failed') || 0;
      const queuedRequests = statusDistribution.get('pending') || 0;
      const processingRequests = statusDistribution.get('processing') || 0;

      const metrics: QueueMetrics = {
        totalRequests,
        successfulRequests,
        failedRequests,
        queuedRequests,
        processingRequests,
        averageProcessingTime: 0,
        averageQueueTime: 0,
        queueUtilization: 0,
        throughput: 0,
        errorRate: 0,
        batchStats: {
          totalBatches: this.batches.size,
          averageBatchSize: 0,
          averageBatchTime: 0,
        },
        priorityDistribution,
        statusDistribution,
        lastUpdated: new Date(),
      };

      // Calculate error rate
      const totalFinished = successfulRequests + failedRequests;
      metrics.errorRate =
        totalFinished > 0 ? failedRequests / totalFinished : 0;

      return metrics;
    } catch (error) {
      this.logger.error('Failed to get metrics from memory', error);
      throw error;
    }
  }

  async maintenance(): Promise<void> {
    try {
      // Clean up expired requests
      const now = Date.now();
      const expired: string[] = [];

      for (const [id, request] of Array.from(this.requests.entries())) {
        if (
          request.scheduledAt &&
          request.scheduledAt.getTime() + request.timeout < now
        ) {
          expired.push(id);
        }
      }

      for (const id of expired) {
        await this.remove(id);
      }

      // Clean up empty priority queues
      for (const [queueKey, priorityQueue] of Array.from(
        this.priorityQueues.entries()
      )) {
        for (const [priority, ids] of Array.from(priorityQueue.entries())) {
          if (ids.size === 0) {
            priorityQueue.delete(priority);
          }
        }

        if (priorityQueue.size === 0) {
          this.priorityQueues.delete(queueKey);
        }
      }

      this.logger.debug('Memory backend maintenance completed', {
        expiredRequests: expired.length,
      });
    } catch (error) {
      this.logger.error('Memory maintenance failed', error);
    }
  }

  async close(): Promise<void> {
    this.logger.debug('MemoryBackend closed');
  }

  private initializeIndexes(): void {
    this.statusIndexes = new Map<QueueRequestStatus, Set<string>>([
      ['pending', new Set<string>()],
      ['processing', new Set<string>()],
      ['completed', new Set<string>()],
      ['failed', new Set<string>()],
      ['retrying', new Set<string>()],
      ['expired', new Set<string>()],
      ['cancelled', new Set<string>()],
      ['deferred', new Set<string>()],
    ]);
  }

  private getQueueKey(zone?: string): string {
    return zone || 'default';
  }

  private addToStatusIndex(status: QueueRequestStatus, id: string): void {
    if (!this.statusIndexes.has(status)) {
      this.statusIndexes.set(status, new Set());
    }
    this.statusIndexes.get(status)!.add(id);
  }

  private removeFromStatusIndex(status: QueueRequestStatus, id: string): void {
    const statusSet = this.statusIndexes.get(status);
    if (statusSet) {
      statusSet.delete(id);
    }
  }

  private addToZoneIndex(zone: string, id: string): void {
    if (!this.zoneIndexes.has(zone)) {
      this.zoneIndexes.set(zone, new Set());
    }
    this.zoneIndexes.get(zone)!.add(id);
  }

  private removeFromZoneIndex(zone: string, id: string): void {
    const zoneSet = this.zoneIndexes.get(zone);
    if (zoneSet) {
      zoneSet.delete(id);
    }
  }
}
