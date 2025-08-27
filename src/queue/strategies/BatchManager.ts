/**
 * Batch Manager
 * 
 * Intelligent request batching system that optimizes API calls by:
 * - Grouping similar requests by endpoint and zone
 * - Dynamic batch sizing based on system load
 * - Smart timeout management for optimal throughput
 * - Deduplication of identical requests
 * - Priority-aware batching to maintain SLAs
 */

import { EventEmitter } from 'events';
import winston from 'winston';
import {
  QueueRequest,
  QueueBatch,
  QueueBatchStatus
} from '../types/QueueTypes';

export interface BatchManagerOptions {
  maxBatchSize: number;
  batchTimeout: number;
  enableDeduplication: boolean;
  priorityAwareBatching: boolean;
  adaptiveSizing: boolean;
}

export interface BatchGroup {
  key: string;
  batch: QueueBatch;
  timer: ReturnType<typeof setTimeout>;
  lastActivity: Date;
}

export interface BatchStats {
  totalBatches: number;
  averageBatchSize: number;
  averageWaitTime: number;
  averageProcessingTime: number;
  deduplicationRate: number;
  timeoutRate: number;
}

export class BatchManager extends EventEmitter {
  private logger: winston.Logger;
  private options: BatchManagerOptions;
  private activeBatches = new Map<string, BatchGroup>();
  private batchHistory: Array<{
    batch: QueueBatch;
    startTime: Date;
    endTime: Date;
    success: boolean;
  }> = [];
  
  // Statistics
  private stats: BatchStats = {
    totalBatches: 0,
    averageBatchSize: 0,
    averageWaitTime: 0,
    averageProcessingTime: 0,
    deduplicationRate: 0,
    timeoutRate: 0
  };
  
  // Adaptive sizing parameters
  private systemLoad = 0;
  private lastLoadUpdate = Date.now();
  private dynamicBatchSizes = new Map<string, number>();
  
  constructor(
    maxBatchSize: number,
    batchTimeout: number,
    logger: winston.Logger,
    options: Partial<BatchManagerOptions> = {}
  ) {
    super();
    
    this.logger = logger;
    this.options = {
      maxBatchSize,
      batchTimeout,
      enableDeduplication: true,
      priorityAwareBatching: true,
      adaptiveSizing: true,
      ...options
    };
    
    // Start monitoring system load for adaptive sizing
    if (this.options.adaptiveSizing) {
      this.startLoadMonitoring();
    }
  }
  
  /**
   * Add a request to a batch
   */
  addRequest(request: QueueRequest): void {
    if (!request.batchable) {
      // Process non-batchable requests immediately
      this.emit('requestReady', request);
      return;
    }
    
    const batchKey = this.generateBatchKey(request);
    let batchGroup = this.activeBatches.get(batchKey);
    
    if (!batchGroup) {
      batchGroup = this.createNewBatch(batchKey, request);
      this.activeBatches.set(batchKey, batchGroup);
    }
    
    // Check for deduplication
    if (this.options.enableDeduplication && this.isDuplicate(batchGroup.batch, request)) {
      this.logger.debug('Duplicate request detected, skipping', {
        requestId: request.id,
        batchId: batchGroup.batch.id
      });
      return;
    }
    
    // Add request to batch
    batchGroup.batch.requests.push(request);
    batchGroup.lastActivity = new Date();
    
    // Update batch priority (highest priority request in batch)
    if (request.priority > batchGroup.batch.priority) {
      batchGroup.batch.priority = request.priority;
    }
    
    this.logger.debug('Request added to batch', {
      requestId: request.id,
      batchId: batchGroup.batch.id,
      batchSize: batchGroup.batch.requests.length
    });
    
    // Check if batch is ready
    if (this.shouldProcessBatch(batchGroup)) {
      this.processBatch(batchKey);
    }
  }
  
  /**
   * Force process a specific batch
   */
  processBatch(batchKey: string): void {
    const batchGroup = this.activeBatches.get(batchKey);
    if (!batchGroup) {
      return;
    }
    
    // Clear timeout
    clearTimeout(batchGroup.timer);
    
    // Remove from active batches
    this.activeBatches.delete(batchKey);
    
    // Mark batch as ready
    batchGroup.batch.status = 'ready';
    
    // Record batch metrics
    this.recordBatchMetrics(batchGroup.batch);
    
    this.emit('batchReady', batchGroup.batch);
    
    this.logger.debug('Batch processed', {
      batchId: batchGroup.batch.id,
      size: batchGroup.batch.requests.length,
      priority: batchGroup.batch.priority
    });
  }
  
  /**
   * Process all active batches (for shutdown)
   */
  processAllBatches(): void {
    const batchKeys = Array.from(this.activeBatches.keys());
    
    for (const key of batchKeys) {
      this.processBatch(key);
    }
  }
  
  /**
   * Get current batch statistics
   */
  getStatistics(): BatchStats {
    this.updateStatistics();
    return { ...this.stats };
  }
  
  /**
   * Get active batch information
   */
  getActiveBatches(): Array<{
    key: string;
    batchId: string;
    size: number;
    priority: number;
    age: number;
    endpoint: string;
    zone: string;
  }> {
    const now = Date.now();
    
    return Array.from(this.activeBatches.entries()).map(([key, group]) => ({
      key,
      batchId: group.batch.id,
      size: group.batch.requests.length,
      priority: group.batch.priority,
      age: now - group.batch.createdAt.getTime(),
      endpoint: group.batch.endpoint,
      zone: group.batch.zone
    }));
  }
  
  /**
   * Update system load for adaptive sizing
   */
  updateSystemLoad(load: number): void {
    this.systemLoad = Math.max(0, Math.min(1, load));
    this.lastLoadUpdate = Date.now();
    
    if (this.options.adaptiveSizing) {
      this.adjustBatchSizes();
    }
  }
  
  /**
   * Clear all active batches
   */
  clear(): number {
    const count = this.activeBatches.size;
    
    // Clear all timers
    for (const group of this.activeBatches.values()) {
      clearTimeout(group.timer);
    }
    
    this.activeBatches.clear();
    
    return count;
  }
  
  /**
   * Shutdown batch manager
   */
  shutdown(): void {
    // Process remaining batches
    this.processAllBatches();
    
    // Clear any remaining resources
    this.clear();
    
    this.removeAllListeners();
  }
  
  /**
   * Generate batch key for grouping requests
   */
  private generateBatchKey(request: QueueRequest): string {
    const baseKey = `${request.zone}:${request.endpoint}:${request.method}`;
    
    if (this.options.priorityAwareBatching) {
      // Group by priority bands to maintain SLAs
      const priorityBand = Math.ceil(request.priority / 3); // 1-3, 4-6, 7-9, 10
      return `${baseKey}:p${priorityBand}`;
    }
    
    return baseKey;
  }
  
  /**
   * Create a new batch group
   */
  private createNewBatch(batchKey: string, initialRequest: QueueRequest): BatchGroup {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const batch: QueueBatch = {
      id: batchId,
      priority: initialRequest.priority,
      requests: [],
      createdAt: new Date(),
      endpoint: initialRequest.endpoint,
      zone: initialRequest.zone,
      maxSize: this.getDynamicBatchSize(batchKey),
      timeout: this.getDynamicTimeout(batchKey),
      status: 'collecting',
      metadata: {
        batchKey,
        adaptiveSize: this.options.adaptiveSizing
      }
    };
    
    // Set timeout for batch processing
    const timer = setTimeout(() => {
      this.processBatch(batchKey);
    }, batch.timeout);
    
    return {
      key: batchKey,
      batch,
      timer,
      lastActivity: new Date()
    };
  }
  
  /**
   * Check if request is duplicate within batch
   */
  private isDuplicate(batch: QueueBatch, newRequest: QueueRequest): boolean {
    if (!newRequest.fingerprint) {
      return false;
    }
    
    return batch.requests.some(existingRequest => 
      existingRequest.fingerprint === newRequest.fingerprint
    );
  }
  
  /**
   * Check if batch should be processed
   */
  private shouldProcessBatch(batchGroup: BatchGroup): boolean {
    const batch = batchGroup.batch;
    
    // Size-based processing
    if (batch.requests.length >= batch.maxSize) {
      return true;
    }
    
    // Priority-based processing (high priority batches process sooner)
    if (batch.priority >= 8 && batch.requests.length >= Math.ceil(batch.maxSize / 2)) {
      return true;
    }
    
    // Critical priority processes immediately with any size
    if (batch.priority >= 10) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get dynamic batch size based on system load and historical performance
   */
  private getDynamicBatchSize(batchKey: string): number {
    if (!this.options.adaptiveSizing) {
      return this.options.maxBatchSize;
    }
    
    let dynamicSize = this.dynamicBatchSizes.get(batchKey) || this.options.maxBatchSize;
    
    // Adjust based on system load
    if (this.systemLoad > 0.8) {
      // High load - reduce batch size for faster processing
      dynamicSize = Math.max(2, Math.floor(dynamicSize * 0.7));
    } else if (this.systemLoad < 0.3) {
      // Low load - increase batch size for better efficiency
      dynamicSize = Math.min(this.options.maxBatchSize, Math.ceil(dynamicSize * 1.2));
    }
    
    return dynamicSize;
  }
  
  /**
   * Get dynamic timeout based on priority and system conditions
   */
  private getDynamicTimeout(batchKey: string): number {
    let timeout = this.options.batchTimeout;
    
    // Extract priority from batch key
    const priorityMatch = batchKey.match(/p(\d+)$/);
    const priorityBand = priorityMatch ? parseInt(priorityMatch[1]) : 2;
    
    // Adjust timeout based on priority
    switch (priorityBand) {
      case 4: // Priority 10 (critical)
        timeout = Math.floor(timeout * 0.3);
        break;
      case 3: // Priority 7-9 (high)
        timeout = Math.floor(timeout * 0.6);
        break;
      case 2: // Priority 4-6 (medium)
        timeout = timeout; // No change
        break;
      case 1: // Priority 1-3 (low)
        timeout = Math.floor(timeout * 1.5);
        break;
    }
    
    // Adjust for system load
    if (this.systemLoad > 0.8) {
      timeout = Math.floor(timeout * 0.8); // Faster processing under load
    }
    
    return Math.max(100, timeout); // Minimum 100ms timeout
  }
  
  /**
   * Adjust batch sizes based on system performance
   */
  private adjustBatchSizes(): void {
    // Analyze recent batch performance
    const recentBatches = this.batchHistory
      .filter(entry => Date.now() - entry.endTime.getTime() < 300000) // Last 5 minutes
      .slice(-50); // Last 50 batches
    
    if (recentBatches.length < 5) {
      return; // Not enough data
    }
    
    // Group by batch key for analysis
    const performanceByKey = new Map<string, Array<{
      size: number;
      processingTime: number;
      success: boolean;
    }>>();
    
    for (const entry of recentBatches) {
      const key = entry.batch.metadata.batchKey as string;
      if (!key) continue;
      
      if (!performanceByKey.has(key)) {
        performanceByKey.set(key, []);
      }
      
      performanceByKey.get(key)!.push({
        size: entry.batch.requests.length,
        processingTime: entry.endTime.getTime() - entry.startTime.getTime(),
        success: entry.success
      });
    }
    
    // Adjust sizes based on performance
    for (const [key, performances] of performanceByKey) {
      const avgProcessingTime = performances.reduce((sum, p) => sum + p.processingTime, 0) / performances.length;
      const successRate = performances.filter(p => p.success).length / performances.length;
      
      let currentSize = this.dynamicBatchSizes.get(key) || this.options.maxBatchSize;
      
      if (successRate < 0.9) {
        // Poor success rate - reduce batch size
        currentSize = Math.max(2, Math.floor(currentSize * 0.8));
      } else if (avgProcessingTime > 5000 && this.systemLoad > 0.6) {
        // Slow processing under load - reduce batch size
        currentSize = Math.max(2, Math.floor(currentSize * 0.9));
      } else if (avgProcessingTime < 1000 && this.systemLoad < 0.4 && successRate > 0.95) {
        // Fast processing with low load - can increase size
        currentSize = Math.min(this.options.maxBatchSize, Math.ceil(currentSize * 1.1));
      }
      
      this.dynamicBatchSizes.set(key, currentSize);
    }
  }
  
  /**
   * Record batch metrics for analysis
   */
  private recordBatchMetrics(batch: QueueBatch): void {
    // Add to history for analysis
    this.batchHistory.push({
      batch: { ...batch },
      startTime: batch.createdAt,
      endTime: new Date(),
      success: true // Will be updated when batch actually completes
    });
    
    // Keep history reasonable size
    if (this.batchHistory.length > 1000) {
      this.batchHistory.splice(0, this.batchHistory.length - 1000);
    }
    
    // Update running statistics
    this.stats.totalBatches++;
  }
  
  /**
   * Update batch statistics
   */
  private updateStatistics(): void {
    if (this.batchHistory.length === 0) {
      return;
    }
    
    const recentBatches = this.batchHistory.slice(-100); // Last 100 batches
    
    // Average batch size
    this.stats.averageBatchSize = recentBatches.reduce(
      (sum, entry) => sum + entry.batch.requests.length, 0
    ) / recentBatches.length;
    
    // Average wait time (time from creation to processing)
    this.stats.averageWaitTime = recentBatches.reduce(
      (sum, entry) => sum + (entry.endTime.getTime() - entry.batch.createdAt.getTime()), 0
    ) / recentBatches.length;
    
    // Average processing time (would be updated when batch completes)
    this.stats.averageProcessingTime = recentBatches.reduce(
      (sum, entry) => sum + (entry.endTime.getTime() - entry.startTime.getTime()), 0
    ) / recentBatches.length;
    
    // Deduplication rate (would need tracking of duplicates)
    this.stats.deduplicationRate = 0; // Placeholder
    
    // Timeout rate (batches processed due to timeout vs size)
    const timeoutBatches = recentBatches.filter(entry => 
      entry.batch.requests.length < entry.batch.maxSize
    ).length;
    this.stats.timeoutRate = timeoutBatches / recentBatches.length;
  }
  
  /**
   * Start monitoring system load
   */
  private startLoadMonitoring(): void {
    // Simple load monitoring based on active batches and processing time
    setInterval(() => {
      const activeBatchCount = this.activeBatches.size;
      const avgBatchAge = Array.from(this.activeBatches.values()).reduce(
        (sum, group) => sum + (Date.now() - group.batch.createdAt.getTime()),
        0
      ) / Math.max(1, activeBatchCount);
      
      // Simple heuristic for system load
      let calculatedLoad = 0;
      
      if (activeBatchCount > 20) {
        calculatedLoad += 0.3;
      } else if (activeBatchCount > 10) {
        calculatedLoad += 0.2;
      }
      
      if (avgBatchAge > 5000) { // 5 seconds
        calculatedLoad += 0.3;
      } else if (avgBatchAge > 2000) { // 2 seconds
        calculatedLoad += 0.2;
      }
      
      // Update if we don't have external load information
      if (Date.now() - this.lastLoadUpdate > 30000) { // 30 seconds
        this.updateSystemLoad(calculatedLoad);
      }
    }, 10000); // Every 10 seconds
  }
  
  /**
   * Mark batch as completed (called externally when batch finishes)
   */
  markBatchCompleted(batchId: string, success: boolean, processingTime: number): void {
    const historyEntry = this.batchHistory.find(entry => entry.batch.id === batchId);
    if (historyEntry) {
      historyEntry.success = success;
      historyEntry.endTime = new Date(historyEntry.startTime.getTime() + processingTime);
    }
  }
}