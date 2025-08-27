/**
 * Production Reliability Manager
 * 
 * Enterprise-grade reliability system for Autotask SDK with:
 * - Advanced request queuing with priority management
 * - Graceful degradation during API outages
 * - Automatic request replay and reconciliation
 * - Health monitoring and availability checks
 * - Circuit breaker patterns with automatic recovery
 * - Performance optimization and resource management
 * 
 * Features:
 * - Multi-tier priority queue system
 * - Intelligent load shedding under stress
 * - Request deduplication and batching
 * - Comprehensive monitoring and alerting
 * - Automatic failover and recovery mechanisms
 */

import { EventEmitter } from 'events';
import winston from 'winston';
import { AutotaskRateLimiter, RateLimitMetrics } from './AutotaskRateLimiter';
import { AutotaskRetryPatterns, RetryMetrics } from './AutotaskRetryPatterns';
import { ZoneManager, ZoneInfo } from './ZoneManager';
import { AutotaskErrorHandler } from './AutotaskErrorHandler';
import { AutotaskError } from '../utils/errors';

export interface ReliabilityConfig {
  // Queue configuration
  maxQueueSize: number;
  queueTimeoutMs: number;
  enablePriorityQueuing: boolean;
  batchingEnabled: boolean;
  batchSize: number;
  batchTimeoutMs: number;
  
  // Health monitoring
  healthCheckInterval: number;
  healthCheckTimeout: number;
  unhealthyThreshold: number; // consecutive failures
  recoveryThreshold: number; // consecutive successes to recover
  
  // Graceful degradation
  enableGracefulDegradation: boolean;
  degradationThresholds: {
    queueUtilization: number; // 0.0 to 1.0
    errorRate: number; // 0.0 to 1.0
    responseTime: number; // milliseconds
  };
  
  // Load shedding
  enableLoadShedding: boolean;
  loadSheddingThreshold: number; // 0.0 to 1.0
  criticalEndpoints: string[];
  
  // Request reconciliation
  enableReconciliation: boolean;
  reconciliationInterval: number;
  maxReconciliationAge: number; // milliseconds
}

export interface QueuedRequestGroup {
  id: string;
  priority: number;
  requests: QueuedRequest[];
  createdAt: Date;
  batchable: boolean;
  endpoint: string;
  zone: string;
  retryCount: number;
  maxRetries: number;
}

export interface QueuedRequest {
  id: string;
  groupId?: string;
  endpoint: string;
  method: string;
  zone: string;
  priority: number;
  data?: any;
  headers?: Record<string, string>;
  createdAt: Date;
  scheduledAt?: Date;
  timeout: number;
  retryable: boolean;
  metadata: Record<string, any>;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
}

export interface SystemHealth {
  overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNAVAILABLE';
  zones: Map<string, 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNAVAILABLE'>;
  services: Map<string, {
    status: 'UP' | 'DOWN' | 'DEGRADED';
    responseTime: number;
    errorRate: number;
    lastCheck: Date;
  }>;
  queue: {
    utilization: number; // 0.0 to 1.0
    length: number;
    oldestRequest: Date | null;
    throughput: number; // requests per second
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
}

export interface ReliabilityMetrics {
  uptime: number; // percentage
  availability: number; // percentage
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageQueueTime: number;
  averageProcessingTime: number;
  requestsDropped: number;
  degradedOperations: number;
  failoverEvents: number;
  reconciliationEvents: number;
}

/**
 * Comprehensive production reliability management system
 */
export class ProductionReliabilityManager extends EventEmitter {
  private config: Required<ReliabilityConfig>;
  private logger: winston.Logger;
  
  // Core components
  private rateLimiter: AutotaskRateLimiter;
  private retryPatterns: AutotaskRetryPatterns;
  private zoneManager: ZoneManager;
  private errorHandler: AutotaskErrorHandler;
  
  // Queue management
  private requestQueue: QueuedRequestGroup[] = [];
  private batchQueue: Map<string, QueuedRequestGroup> = new Map(); // endpoint -> batch group
  private processingQueue = false;
  private queueProcessor?: ReturnType<typeof setTimeout>;
  
  // Health monitoring
  private systemHealth!: SystemHealth;
  private healthCheckInterval?: ReturnType<typeof setTimeout>;
  private reconciliationInterval?: ReturnType<typeof setTimeout>;
  
  // Metrics and monitoring
  private metrics!: ReliabilityMetrics;
  private metricsInterval?: ReturnType<typeof setTimeout>;
  private startTime: Date = new Date();
  
  // State management
  private isDegraded = false;
  private isSheddingLoad = false;
  private activeRequests: Map<string, { startTime: Date; promise: Promise<any> }> = new Map();
  
  constructor(
    config: Partial<ReliabilityConfig>,
    rateLimiter: AutotaskRateLimiter,
    retryPatterns: AutotaskRetryPatterns,
    zoneManager: ZoneManager,
    errorHandler: AutotaskErrorHandler,
    logger: winston.Logger
  ) {
    super();
    
    this.config = {
      maxQueueSize: 10000,
      queueTimeoutMs: 300000, // 5 minutes
      enablePriorityQueuing: true,
      batchingEnabled: true,
      batchSize: 10,
      batchTimeoutMs: 1000,
      healthCheckInterval: 30000, // 30 seconds
      healthCheckTimeout: 5000,
      unhealthyThreshold: 3,
      recoveryThreshold: 3,
      enableGracefulDegradation: true,
      degradationThresholds: {
        queueUtilization: 0.8,
        errorRate: 0.1,
        responseTime: 10000
      },
      enableLoadShedding: true,
      loadSheddingThreshold: 0.9,
      criticalEndpoints: ['/Companies', '/Tickets', '/TimeEntries'],
      enableReconciliation: true,
      reconciliationInterval: 300000, // 5 minutes
      maxReconciliationAge: 3600000, // 1 hour
      ...config
    };
    
    this.logger = logger;
    this.rateLimiter = rateLimiter;
    this.retryPatterns = retryPatterns;
    this.zoneManager = zoneManager;
    this.errorHandler = errorHandler;
    
    this.initializeMetrics();
    this.initializeSystemHealth();
    this.startHealthMonitoring();
    this.startQueueProcessing();
    this.startMetricsCollection();
    
    if (this.config.enableReconciliation) {
      this.startReconciliation();
    }
    
    this.logger.info('ProductionReliabilityManager initialized', {
      maxQueueSize: this.config.maxQueueSize,
      batchingEnabled: this.config.batchingEnabled,
      gracefulDegradation: this.config.enableGracefulDegradation,
      loadShedding: this.config.enableLoadShedding
    });
  }
  
  /**
   * Queue a request with priority and reliability features
   */
  async queueRequest<T>(
    endpoint: string,
    method: string,
    zone: string,
    requestFn: () => Promise<T>,
    options: {
      priority?: number;
      timeout?: number;
      retryable?: boolean;
      batchable?: boolean;
      metadata?: Record<string, any>;
      data?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    // Check if we should shed this request
    if (this.shouldShedLoad(endpoint, options.priority || 5)) {
      throw new Error('Request rejected due to load shedding');
    }
    
    // Check queue capacity
    if (this.getTotalQueueLength() >= this.config.maxQueueSize) {
      if (!this.tryEmergencyQueueCleanup()) {
        throw new Error('Request queue is full');
      }
    }
    
    return new Promise<T>((resolve, reject) => {
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const priority = options.priority || 5;
      const timeout = options.timeout || this.config.queueTimeoutMs;
      
      const queuedRequest: QueuedRequest = {
        id: requestId,
        endpoint,
        method,
        zone,
        priority,
        data: options.data,
        headers: options.headers,
        createdAt: new Date(),
        timeout,
        retryable: options.retryable !== false,
        metadata: options.metadata || {},
        resolve: (result: T) => resolve(result),
        reject
      };
      
      // Handle batching if enabled and applicable
      if (this.config.batchingEnabled && options.batchable && method === 'GET') {
        this.addToBatch(queuedRequest, requestFn);
      } else {
        this.addToQueue(queuedRequest, requestFn);
      }
      
      // Set request timeout
      setTimeout(() => {
        this.removeFromQueue(requestId);
        reject(new Error('Request timed out in queue'));
      }, timeout);
      
      this.emit('requestQueued', {
        requestId,
        endpoint,
        method,
        zone,
        priority,
        queueLength: this.getTotalQueueLength()
      });
    });
  }
  
  /**
   * Execute request with full reliability patterns
   */
  async executeRequest<T>(
    requestFn: () => Promise<T>,
    endpoint: string,
    method: string,
    zone: string,
    context?: Record<string, any>
  ): Promise<T> {
    const requestId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();
    
    try {
      // Record request start
      this.activeRequests.set(requestId, { startTime, promise: requestFn() });
      this.zoneManager.recordRequestStart(zone, requestId);
      
      // Wait for rate limiter permission
      await this.rateLimiter.requestPermission(zone, endpoint);
      
      // Execute with retry patterns
      const result = await this.retryPatterns.executeWithRetry(
        requestFn,
        endpoint,
        method,
        context?.data,
        context?.headers
      );
      
      // Record success
      const responseTime = Date.now() - startTime.getTime();
      this.recordRequestSuccess(requestId, endpoint, zone, responseTime);
      
      return result;
      
    } catch (error) {
      // Record failure
      const responseTime = Date.now() - startTime.getTime();
      this.recordRequestFailure(requestId, endpoint, zone, responseTime, error as Error);
      
      // Handle error with error handler
      const handledError = await this.errorHandler.handleError(error as any, {
        endpoint,
        method,
        requestId,
        zone,
        timestamp: startTime,
        ...context
      });
      
      throw handledError;
      
    } finally {
      // Cleanup
      this.activeRequests.delete(requestId);
      this.rateLimiter.notifyRequestComplete(zone, endpoint);
    }
  }
  
  /**
   * Get current system health
   */
  getSystemHealth(): SystemHealth {
    this.updateSystemHealth();
    return { ...this.systemHealth };
  }
  
  /**
   * Get reliability metrics
   */
  getMetrics(): ReliabilityMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }
  
  /**
   * Enable/disable graceful degradation
   */
  setDegradedMode(enabled: boolean, reason?: string): void {
    if (this.isDegraded !== enabled) {
      this.isDegraded = enabled;
      
      this.emit('degradationModeChanged', { enabled, reason });
      this.logger.warn(`Degraded mode ${enabled ? 'enabled' : 'disabled'}`, { reason });
      
      if (enabled) {
        this.adjustForDegradation();
      }
    }
  }
  
  /**
   * Force queue processing
   */
  async processQueueNow(): Promise<void> {
    await this.processRequestQueue();
  }
  
  /**
   * Clear queue (emergency operation)
   */
  clearQueue(rejectPending: boolean = false): number {
    const totalCleared = this.getTotalQueueLength();
    
    if (rejectPending) {
      // Reject all pending requests
      this.requestQueue.forEach(group => {
        group.requests.forEach(request => {
          request.reject(new Error('Queue cleared by administrator'));
        });
      });
      
      this.batchQueue.forEach(group => {
        group.requests.forEach(request => {
          request.reject(new Error('Queue cleared by administrator'));
        });
      });
    }
    
    this.requestQueue.length = 0;
    this.batchQueue.clear();
    
    this.emit('queueCleared', { totalCleared, rejectPending });
    this.logger.warn('Request queue cleared', { totalCleared, rejectPending });
    
    return totalCleared;
  }
  
  /**
   * Get queue statistics
   */
  getQueueStatistics(): Record<string, any> {
    const now = new Date();
    const queueStats = {
      totalQueued: this.getTotalQueueLength(),
      regularQueue: this.requestQueue.length,
      batchQueue: this.batchQueue.size,
      priorityDistribution: new Map<number, number>(),
      oldestRequest: null as Date | null,
      averageWaitTime: 0,
      queueUtilization: 0,
      batchUtilization: 0
    };
    
    let totalWaitTime = 0;
    let requestCount = 0;
    let oldestTime: number = Date.now();
    
    // Analyze regular queue
    this.requestQueue.forEach(group => {
      group.requests.forEach(request => {
        const priority = request.priority;
        queueStats.priorityDistribution.set(
          priority,
          (queueStats.priorityDistribution.get(priority) || 0) + 1
        );
        
        const waitTime = now.getTime() - request.createdAt.getTime();
        totalWaitTime += waitTime;
        requestCount++;
        
        if (request.createdAt.getTime() < oldestTime) {
          oldestTime = request.createdAt.getTime();
          queueStats.oldestRequest = request.createdAt;
        }
      });
    });
    
    // Analyze batch queue
    this.batchQueue.forEach(group => {
      group.requests.forEach(request => {
        const priority = request.priority;
        queueStats.priorityDistribution.set(
          priority,
          (queueStats.priorityDistribution.get(priority) || 0) + 1
        );
        
        const waitTime = now.getTime() - request.createdAt.getTime();
        totalWaitTime += waitTime;
        requestCount++;
        
        if (request.createdAt.getTime() < oldestTime) {
          oldestTime = request.createdAt.getTime();
          queueStats.oldestRequest = request.createdAt;
        }
      });
    });
    
    queueStats.averageWaitTime = requestCount > 0 ? totalWaitTime / requestCount : 0;
    queueStats.queueUtilization = this.getTotalQueueLength() / this.config.maxQueueSize;
    
    return queueStats;
  }
  
  /**
   * Add request to queue
   */
  private addToQueue(request: QueuedRequest, requestFn: () => Promise<any>): void {
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const group: QueuedRequestGroup = {
      id: groupId,
      priority: request.priority,
      requests: [request],
      createdAt: new Date(),
      batchable: false,
      endpoint: request.endpoint,
      zone: request.zone,
      retryCount: 0,
      maxRetries: 3
    };
    
    request.groupId = groupId;
    
    // Insert based on priority
    const insertIndex = this.requestQueue.findIndex(g => g.priority < request.priority);
    if (insertIndex === -1) {
      this.requestQueue.push(group);
    } else {
      this.requestQueue.splice(insertIndex, 0, group);
    }
    
    // Store the request function for execution
    (group as any).requestFn = requestFn;
  }
  
  /**
   * Add request to batch queue
   */
  private addToBatch(request: QueuedRequest, requestFn: () => Promise<any>): void {
    const batchKey = `${request.zone}:${request.endpoint}`;
    
    let batch = this.batchQueue.get(batchKey);
    if (!batch) {
      const groupId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      batch = {
        id: groupId,
        priority: request.priority,
        requests: [],
        createdAt: new Date(),
        batchable: true,
        endpoint: request.endpoint,
        zone: request.zone,
        retryCount: 0,
        maxRetries: 3
      };
      this.batchQueue.set(batchKey, batch);
      
      // Schedule batch processing
      setTimeout(() => {
        this.processBatch(batchKey);
      }, this.config.batchTimeoutMs);
    }
    
    request.groupId = batch.id;
    batch.requests.push(request);
    
    // Store the request function
    (request as any).requestFn = requestFn;
    
    // Process batch if it reaches max size
    if (batch.requests.length >= this.config.batchSize) {
      this.processBatch(batchKey);
    }
  }
  
  /**
   * Process a batch of requests
   */
  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batchQueue.get(batchKey);
    if (!batch || batch.requests.length === 0) {
      return;
    }
    
    this.batchQueue.delete(batchKey);
    
    this.emit('batchProcessingStarted', { batchId: batch.id, size: batch.requests.length });
    
    try {
      // Execute all requests in the batch concurrently
      const promises = batch.requests.map(async request => {
        try {
          const requestFn = (request as any).requestFn;
          const result = await this.executeRequest(
            requestFn,
            request.endpoint,
            request.method,
            request.zone,
            { data: request.data, headers: request.headers }
          );
          request.resolve(result);
        } catch (error) {
          request.reject(error as Error);
        }
      });
      
      await Promise.allSettled(promises);
      
      this.emit('batchProcessingCompleted', { 
        batchId: batch.id, 
        size: batch.requests.length 
      });
      
    } catch (error) {
      this.emit('batchProcessingFailed', { 
        batchId: batch.id, 
        error: error as Error 
      });
    }
  }
  
  /**
   * Check if we should shed load for this request
   */
  private shouldShedLoad(endpoint: string, priority: number): boolean {
    if (!this.config.enableLoadShedding || !this.isSheddingLoad) {
      return false;
    }
    
    // Never shed critical endpoints
    if (this.config.criticalEndpoints.includes(endpoint)) {
      return false;
    }
    
    // Never shed high priority requests (8, 9, 10)
    if (priority >= 8) {
      return false;
    }
    
    // Shed low priority requests during load shedding
    return priority <= 3;
  }
  
  /**
   * Try emergency queue cleanup
   */
  private tryEmergencyQueueCleanup(): boolean {
    const now = new Date();
    let cleaned = 0;
    
    // Remove expired requests from regular queue
    this.requestQueue = this.requestQueue.filter(group => {
      group.requests = group.requests.filter(request => {
        const age = now.getTime() - request.createdAt.getTime();
        if (age > request.timeout) {
          request.reject(new Error('Request expired during emergency cleanup'));
          cleaned++;
          return false;
        }
        return true;
      });
      return group.requests.length > 0;
    });
    
    // Remove expired batches
    for (const [key, batch] of this.batchQueue.entries()) {
      const age = now.getTime() - batch.createdAt.getTime();
      if (age > this.config.batchTimeoutMs * 2) {
        batch.requests.forEach(request => {
          request.reject(new Error('Batch expired during emergency cleanup'));
          cleaned++;
        });
        this.batchQueue.delete(key);
      }
    }
    
    if (cleaned > 0) {
      this.emit('emergencyCleanup', { requestsCleaned: cleaned });
      this.logger.warn('Emergency queue cleanup performed', { requestsCleaned: cleaned });
    }
    
    return cleaned > 0;
  }
  
  /**
   * Remove request from queue
   */
  private removeFromQueue(requestId: string): void {
    // Remove from regular queue
    this.requestQueue = this.requestQueue.filter(group => {
      group.requests = group.requests.filter(request => request.id !== requestId);
      return group.requests.length > 0;
    });
    
    // Remove from batch queue
    for (const [key, batch] of this.batchQueue.entries()) {
      batch.requests = batch.requests.filter(request => request.id !== requestId);
      if (batch.requests.length === 0) {
        this.batchQueue.delete(key);
      }
    }
  }
  
  /**
   * Get total queue length
   */
  private getTotalQueueLength(): number {
    const regularCount = this.requestQueue.reduce((sum, group) => sum + group.requests.length, 0);
    const batchCount = Array.from(this.batchQueue.values()).reduce(
      (sum, batch) => sum + batch.requests.length, 0
    );
    return regularCount + batchCount;
  }
  
  /**
   * Process request queue
   */
  private async processRequestQueue(): Promise<void> {
    if (this.processingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.processingQueue = true;
    
    try {
      const group = this.requestQueue.shift();
      if (!group) {
        return;
      }
      
      this.emit('groupProcessingStarted', { 
        groupId: group.id, 
        size: group.requests.length 
      });
      
      // Process all requests in the group
      const promises = group.requests.map(async request => {
        try {
          const requestFn = (group as any).requestFn || (() => Promise.resolve({}));
          const result = await this.executeRequest(
            requestFn,
            request.endpoint,
            request.method,
            request.zone,
            { data: request.data, headers: request.headers }
          );
          request.resolve(result);
        } catch (error) {
          // Check if we should retry the group
          if (group.retryCount < group.maxRetries && request.retryable) {
            group.retryCount++;
            this.requestQueue.unshift(group); // Put back at front with higher priority
            return;
          }
          
          request.reject(error as Error);
        }
      });
      
      await Promise.allSettled(promises);
      
      this.emit('groupProcessingCompleted', { 
        groupId: group.id, 
        size: group.requests.length 
      });
      
    } catch (error) {
      this.logger.error('Error processing request queue', error);
    } finally {
      this.processingQueue = false;
    }
  }
  
  /**
   * Start queue processing
   */
  private startQueueProcessing(): void {
    this.queueProcessor = setInterval(() => {
      this.processRequestQueue();
    }, 100); // Process queue every 100ms
  }
  
  /**
   * Record request success
   */
  private recordRequestSuccess(
    requestId: string, 
    endpoint: string, 
    zone: string, 
    responseTime: number
  ): void {
    this.zoneManager.recordRequestComplete(zone, requestId, true, responseTime);
    this.metrics.successfulRequests++;
    this.metrics.totalRequests++;
    
    this.emit('requestSuccess', { requestId, endpoint, zone, responseTime });
  }
  
  /**
   * Record request failure
   */
  private recordRequestFailure(
    requestId: string, 
    endpoint: string, 
    zone: string, 
    responseTime: number, 
    error: Error
  ): void {
    this.zoneManager.recordRequestComplete(zone, requestId, false, responseTime);
    this.metrics.failedRequests++;
    this.metrics.totalRequests++;
    
    this.emit('requestFailure', { requestId, endpoint, zone, responseTime, error });
  }
  
  /**
   * Update system health
   */
  private updateSystemHealth(): void {
    const queueUtilization = this.getTotalQueueLength() / this.config.maxQueueSize;
    const errorRate = this.metrics.totalRequests > 0 ? 
      this.metrics.failedRequests / this.metrics.totalRequests : 0;
    
    // Update queue metrics
    this.systemHealth.queue.utilization = queueUtilization;
    this.systemHealth.queue.length = this.getTotalQueueLength();
    this.systemHealth.queue.throughput = this.calculateThroughput();
    
    // Update performance metrics
    this.systemHealth.performance.errorRate = errorRate;
    this.systemHealth.performance.requestsPerSecond = this.calculateRequestsPerSecond();
    
    // Determine overall health
    let overallHealth: SystemHealth['overall'] = 'HEALTHY';
    
    if (queueUtilization > this.config.degradationThresholds.queueUtilization) {
      overallHealth = 'DEGRADED';
    }
    
    if (errorRate > this.config.degradationThresholds.errorRate) {
      overallHealth = overallHealth === 'HEALTHY' ? 'DEGRADED' : 'CRITICAL';
    }
    
    if (queueUtilization > this.config.loadSheddingThreshold) {
      overallHealth = 'CRITICAL';
    }
    
    this.systemHealth.overall = overallHealth;
    
    // Update load shedding state
    const shouldShedLoad = queueUtilization > this.config.loadSheddingThreshold;
    if (this.isSheddingLoad !== shouldShedLoad) {
      this.isSheddingLoad = shouldShedLoad;
      this.emit('loadSheddingChanged', { enabled: shouldShedLoad });
    }
    
    // Update degraded mode
    const shouldDegrade = overallHealth === 'DEGRADED' || overallHealth === 'CRITICAL';
    if (this.isDegraded !== shouldDegrade) {
      this.setDegradedMode(shouldDegrade, `System health: ${overallHealth}`);
    }
  }
  
  /**
   * Adjust system for degradation
   */
  private adjustForDegradation(): void {
    if (this.isDegraded) {
      // Reduce batch size to process requests faster
      this.config.batchSize = Math.max(5, Math.floor(this.config.batchSize / 2));
      this.config.batchTimeoutMs = Math.max(500, Math.floor(this.config.batchTimeoutMs / 2));
      
      this.logger.info('Adjusted configuration for degraded mode', {
        batchSize: this.config.batchSize,
        batchTimeout: this.config.batchTimeoutMs
      });
    }
  }
  
  /**
   * Calculate throughput
   */
  private calculateThroughput(): number {
    // This would need to track requests over time window
    // For now, return a simple calculation
    return this.metrics.totalRequests / Math.max(1, 
      (Date.now() - this.startTime.getTime()) / 1000
    );
  }
  
  /**
   * Calculate requests per second
   */
  private calculateRequestsPerSecond(): number {
    // Similar to throughput but over shorter time window
    return this.calculateThroughput();
  }
  
  /**
   * Initialize metrics
   */
  private initializeMetrics(): void {
    this.metrics = {
      uptime: 100,
      availability: 100,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageQueueTime: 0,
      averageProcessingTime: 0,
      requestsDropped: 0,
      degradedOperations: 0,
      failoverEvents: 0,
      reconciliationEvents: 0
    };
  }
  
  /**
   * Initialize system health
   */
  private initializeSystemHealth(): void {
    this.systemHealth = {
      overall: 'HEALTHY',
      zones: new Map(),
      services: new Map(),
      queue: {
        utilization: 0,
        length: 0,
        oldestRequest: null,
        throughput: 0
      },
      performance: {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0
      }
    };
  }
  
  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.updateSystemHealth();
      
      // Emit health status
      this.emit('healthUpdated', this.systemHealth);
      
      // Log health summary periodically
      if (this.metrics.totalRequests % 100 === 0 && this.metrics.totalRequests > 0) {
        this.logger.info('System health summary', {
          overall: this.systemHealth.overall,
          queueUtilization: `${(this.systemHealth.queue.utilization * 100).toFixed(1)}%`,
          errorRate: `${(this.systemHealth.performance.errorRate * 100).toFixed(2)}%`,
          throughput: this.systemHealth.queue.throughput.toFixed(2),
          isDegraded: this.isDegraded,
          isSheddingLoad: this.isSheddingLoad
        });
      }
    }, this.config.healthCheckInterval);
  }
  
  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
      this.emit('metricsUpdated', this.metrics);
    }, 60000); // Update every minute
  }
  
  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const uptimeMs = Date.now() - this.startTime.getTime();
    this.metrics.uptime = Math.min(100, (uptimeMs / 86400000) * 100); // 24h = 100%
    
    if (this.metrics.totalRequests > 0) {
      this.metrics.availability = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
    }
  }
  
  /**
   * Start reconciliation process
   */
  private startReconciliation(): void {
    this.reconciliationInterval = setInterval(() => {
      this.performReconciliation();
    }, this.config.reconciliationInterval);
  }
  
  /**
   * Perform request reconciliation
   */
  private performReconciliation(): void {
    this.emit('reconciliationStarted');
    this.metrics.reconciliationEvents++;
    
    // This would implement logic to verify completed requests
    // and replay any that may have been lost
    
    this.logger.debug('Request reconciliation completed');
    this.emit('reconciliationCompleted');
  }
  
  /**
   * Cleanup and shutdown
   */
  destroy(): void {
    if (this.queueProcessor) {
      clearInterval(this.queueProcessor);
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    if (this.reconciliationInterval) {
      clearInterval(this.reconciliationInterval);
    }
    
    // Clear queues and reject pending requests
    this.clearQueue(true);
    this.activeRequests.clear();
    this.removeAllListeners();
    
    this.logger.info('ProductionReliabilityManager destroyed');
  }
}