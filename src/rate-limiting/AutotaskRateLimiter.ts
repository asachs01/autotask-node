/**
 * Enterprise-grade Autotask Rate Limiting System
 * 
 * Based on Autotask's official API documentation:
 * - 10,000 requests per hour per database (rolling window)
 * - Zone-specific threading limits (3 threads per endpoint for new integrations)
 * - Usage-based latency throttling as limits approach
 * - Thread limiting per API tracking identifier + endpoint
 * 
 * This implementation provides:
 * - Multi-zone rate limiting with automatic detection
 * - Per-endpoint and global rate limiting
 * - Intelligent backoff based on API response patterns
 * - Queue management for high-throughput scenarios
 * - Performance monitoring and metrics
 */

import { EventEmitter } from 'events';
import winston from 'winston';

export interface RateLimitConfig {
  // Global limits from Autotask documentation
  hourlyRequestLimit: number; // Default: 10,000
  threadLimitPerEndpoint: number; // Default: 3 for new integrations
  
  // Intelligent throttling thresholds (from Autotask docs)
  usageThresholds: {
    light: number; // 0-49.99% usage - 0 sec latency
    medium: number; // 50-74.99% usage - 0.5 sec latency  
    heavy: number; // 75%+ usage - 1 sec latency
  };
  
  // Advanced configuration
  enableZoneAwareThrottling: boolean;
  enablePredictiveThrottling: boolean;
  queueTimeout: number; // Maximum time to wait in queue
  maxQueueSize: number; // Maximum pending requests
  
  // Performance optimization
  slidingWindowSize: number; // Window for request tracking (minutes)
  metricsRetentionPeriod: number; // How long to keep metrics (hours)
}

export interface ZoneInfo {
  zoneId: string;
  apiUrl: string;
  isHealthy: boolean;
  lastHealthCheck: Date;
  requestCount: number;
  threadCount: Map<string, number>; // endpoint -> active threads
  averageResponseTime: number;
  errorRate: number;
}

export interface RateLimitMetrics {
  totalRequests: number;
  requestsInCurrentHour: number;
  currentUsagePercentage: number;
  averageWaitTime: number;
  queueLength: number;
  throttledRequests: number;
  zoneMetrics: Map<string, ZoneInfo>;
  endpointMetrics: Map<string, {
    requests: number;
    errors: number;
    averageResponseTime: number;
    activeThreads: number;
  }>;
}

export interface QueuedRequest {
  id: string;
  zone: string;
  endpoint: string;
  priority: number;
  enqueuedAt: Date;
  resolve: (value: boolean) => void;
  reject: (error: Error) => void;
  timeout?: ReturnType<typeof setTimeout>;
}

/**
 * Advanced rate limiter specifically designed for Autotask API patterns
 */
export class AutotaskRateLimiter extends EventEmitter {
  private config: Required<RateLimitConfig>;
  private logger: winston.Logger;
  
  // Request tracking
  private requestHistory: Array<{ timestamp: Date; zone: string; endpoint: string }> = [];
  private zoneInfo: Map<string, ZoneInfo> = new Map();
  private endpointThreads: Map<string, Set<string>> = new Map(); // endpoint -> active request IDs
  
  // Queue management
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;
  
  // Metrics and monitoring
  private metrics!: RateLimitMetrics;
  private metricsUpdateInterval?: ReturnType<typeof setTimeout>;
  
  constructor(config: Partial<RateLimitConfig>, logger: winston.Logger) {
    super();
    
    this.config = {
      hourlyRequestLimit: 10000,
      threadLimitPerEndpoint: 3,
      usageThresholds: {
        light: 0.50,   // 50% usage
        medium: 0.75,  // 75% usage  
        heavy: 1.0     // 100% usage
      },
      enableZoneAwareThrottling: true,
      enablePredictiveThrottling: true,
      queueTimeout: 300000, // 5 minutes
      maxQueueSize: 1000,
      slidingWindowSize: 60, // 60 minutes
      metricsRetentionPeriod: 24, // 24 hours
      ...config
    };
    
    this.logger = logger;
    this.initializeMetrics();
    this.startMetricsCollection();
    
    // Start queue processing
    this.processQueue();
    
    this.logger.info('AutotaskRateLimiter initialized', {
      hourlyLimit: this.config.hourlyRequestLimit,
      threadLimit: this.config.threadLimitPerEndpoint,
      zoneAware: this.config.enableZoneAwareThrottling,
      predictive: this.config.enablePredictiveThrottling
    });
  }
  
  /**
   * Request permission to make an API call
   * Returns a promise that resolves when the request can proceed
   */
  async requestPermission(
    zone: string, 
    endpoint: string, 
    priority: number = 5
  ): Promise<void> {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check immediate availability
    if (this.canProceedImmediately(zone, endpoint)) {
      this.recordRequestStart(requestId, zone, endpoint);
      return;
    }
    
    // Add to queue if necessary
    return new Promise<void>((resolve, reject) => {
      if (this.requestQueue.length >= this.config.maxQueueSize) {
        reject(new Error('Rate limit queue is full. Request rejected.'));
        return;
      }
      
      const queuedRequest: QueuedRequest = {
        id: requestId,
        zone,
        endpoint,
        priority,
        enqueuedAt: new Date(),
        resolve: (canProceed: boolean) => {
          if (canProceed) {
            this.recordRequestStart(requestId, zone, endpoint);
            resolve();
          } else {
            reject(new Error('Request timed out in rate limit queue'));
          }
        },
        reject
      };
      
      // Set timeout for queued request
      queuedRequest.timeout = setTimeout(() => {
        this.removeFromQueue(requestId);
        reject(new Error('Request timed out in rate limit queue'));
      }, this.config.queueTimeout);
      
      // Insert based on priority (higher priority = processed first)
      const insertIndex = this.requestQueue.findIndex(req => req.priority < priority);
      if (insertIndex === -1) {
        this.requestQueue.push(queuedRequest);
      } else {
        this.requestQueue.splice(insertIndex, 0, queuedRequest);
      }
      
      this.emit('requestQueued', { requestId, zone, endpoint, queueLength: this.requestQueue.length });
      this.logger.debug('Request queued for rate limiting', {
        requestId, zone, endpoint, priority, queueLength: this.requestQueue.length
      });
    });
  }
  
  /**
   * Notify that a request has completed
   */
  notifyRequestComplete(
    zone: string, 
    endpoint: string, 
    statusCode?: number, 
    responseTime?: number,
    error?: boolean
  ): void {
    const requestKey = `${zone}:${endpoint}`;
    const activeRequests = this.endpointThreads.get(endpoint);
    
    if (activeRequests && activeRequests.size > 0) {
      // Remove the oldest request (FIFO)
      const firstRequestId = activeRequests.values().next().value;
      if (firstRequestId) {
        activeRequests.delete(firstRequestId);
      }
    }
    
    // Update zone info
    const zoneInfo = this.zoneInfo.get(zone);
    if (zoneInfo) {
      const endpointThreads = zoneInfo.threadCount.get(endpoint) || 0;
      if (endpointThreads > 0) {
        zoneInfo.threadCount.set(endpoint, endpointThreads - 1);
      }
      
      // Update performance metrics
      if (responseTime) {
        zoneInfo.averageResponseTime = 
          (zoneInfo.averageResponseTime * 0.9) + (responseTime * 0.1);
      }
      
      if (error) {
        zoneInfo.errorRate = (zoneInfo.errorRate * 0.9) + (0.1);
      } else {
        zoneInfo.errorRate = zoneInfo.errorRate * 0.9;
      }
    }
    
    this.emit('requestCompleted', { zone, endpoint, statusCode, responseTime, error });
  }
  
  /**
   * Register a new zone for rate limiting
   */
  registerZone(zoneId: string, apiUrl: string): void {
    if (!this.zoneInfo.has(zoneId)) {
      const zoneInfo: ZoneInfo = {
        zoneId,
        apiUrl,
        isHealthy: true,
        lastHealthCheck: new Date(),
        requestCount: 0,
        threadCount: new Map(),
        averageResponseTime: 0,
        errorRate: 0
      };
      
      this.zoneInfo.set(zoneId, zoneInfo);
      this.logger.info('Registered new zone for rate limiting', { zoneId, apiUrl });
    }
  }
  
  /**
   * Update zone health status
   */
  updateZoneHealth(zoneId: string, isHealthy: boolean, errorRate?: number): void {
    const zoneInfo = this.zoneInfo.get(zoneId);
    if (zoneInfo) {
      zoneInfo.isHealthy = isHealthy;
      zoneInfo.lastHealthCheck = new Date();
      if (errorRate !== undefined) {
        zoneInfo.errorRate = errorRate;
      }
      
      this.emit('zoneHealthUpdated', { zoneId, isHealthy, errorRate });
      
      if (!isHealthy) {
        this.logger.warn('Zone marked as unhealthy', { zoneId, errorRate });
      }
    }
  }
  
  /**
   * Get current rate limit metrics
   */
  getMetrics(): RateLimitMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }
  
  /**
   * Get recommended delay before next request
   */
  getRecommendedDelay(zone: string, endpoint: string): number {
    const usage = this.getCurrentUsagePercentage();
    const zoneInfo = this.zoneInfo.get(zone);
    
    let baseDelay = 0;
    
    // Apply usage-based latency (from Autotask documentation)
    if (usage >= this.config.usageThresholds.heavy) {
      baseDelay = 1000; // 1 second
    } else if (usage >= this.config.usageThresholds.medium) {
      baseDelay = 500; // 0.5 seconds
    }
    
    // Add zone-specific delays based on health
    if (zoneInfo) {
      if (zoneInfo.errorRate > 0.1) { // More than 10% errors
        baseDelay += 2000; // Add 2 seconds
      }
      
      if (zoneInfo.averageResponseTime > 5000) { // Slow responses
        baseDelay += 1000; // Add 1 second
      }
    }
    
    // Predictive throttling based on queue size
    if (this.config.enablePredictiveThrottling) {
      const queuePressure = this.requestQueue.length / this.config.maxQueueSize;
      baseDelay += Math.floor(queuePressure * 3000); // Up to 3 seconds based on queue pressure
    }
    
    return baseDelay;
  }
  
  /**
   * Check if request can proceed immediately without queuing
   */
  private canProceedImmediately(zone: string, endpoint: string): boolean {
    // Check global rate limit
    const currentUsage = this.getCurrentUsagePercentage();
    if (currentUsage >= 1.0) { // 100% of hourly limit used
      return false;
    }
    
    // Check zone-specific thread limits
    if (this.config.enableZoneAwareThrottling) {
      const zoneInfo = this.zoneInfo.get(zone);
      if (zoneInfo && !zoneInfo.isHealthy) {
        return false;
      }
      
      const currentThreads = this.endpointThreads.get(endpoint)?.size || 0;
      if (currentThreads >= this.config.threadLimitPerEndpoint) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Record the start of a new request
   */
  private recordRequestStart(requestId: string, zone: string, endpoint: string): void {
    // Update request history
    this.requestHistory.push({
      timestamp: new Date(),
      zone,
      endpoint
    });
    
    // Clean old history
    this.cleanupRequestHistory();
    
    // Update thread tracking
    if (!this.endpointThreads.has(endpoint)) {
      this.endpointThreads.set(endpoint, new Set());
    }
    this.endpointThreads.get(endpoint)!.add(requestId);
    
    // Update zone info
    const zoneInfo = this.zoneInfo.get(zone);
    if (zoneInfo) {
      zoneInfo.requestCount++;
      const currentThreads = zoneInfo.threadCount.get(endpoint) || 0;
      zoneInfo.threadCount.set(endpoint, currentThreads + 1);
    }
    
    this.emit('requestStarted', { requestId, zone, endpoint });
  }
  
  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue[0];
      
      if (this.canProceedImmediately(request.zone, request.endpoint)) {
        // Remove from queue
        this.requestQueue.shift();
        
        // Clear timeout
        if (request.timeout) {
          clearTimeout(request.timeout);
        }
        
        // Allow request to proceed
        request.resolve(true);
        
        this.emit('requestDequeued', { 
          requestId: request.id, 
          waitTime: Date.now() - request.enqueuedAt.getTime() 
        });
      } else {
        // Apply recommended delay before checking again
        const delay = this.getRecommendedDelay(request.zone, request.endpoint);
        if (delay > 0) {
          await this.sleep(Math.min(delay, 5000)); // Cap at 5 seconds for queue processing
        }
        break; // Exit processing loop to prevent tight spinning
      }
    }
    
    this.isProcessingQueue = false;
    
    // Schedule next processing cycle if queue not empty
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), 100); // Check again in 100ms
    }
  }
  
  /**
   * Remove request from queue
   */
  private removeFromQueue(requestId: string): void {
    const index = this.requestQueue.findIndex(req => req.id === requestId);
    if (index !== -1) {
      const request = this.requestQueue.splice(index, 1)[0];
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
    }
  }
  
  /**
   * Get current usage as percentage of hourly limit
   */
  private getCurrentUsagePercentage(): number {
    const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));
    const recentRequests = this.requestHistory.filter(req => req.timestamp > oneHourAgo);
    return recentRequests.length / this.config.hourlyRequestLimit;
  }
  
  /**
   * Clean up old request history
   */
  private cleanupRequestHistory(): void {
    const cutoffTime = new Date(Date.now() - (this.config.metricsRetentionPeriod * 60 * 60 * 1000));
    this.requestHistory = this.requestHistory.filter(req => req.timestamp > cutoffTime);
  }
  
  /**
   * Initialize metrics object
   */
  private initializeMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      requestsInCurrentHour: 0,
      currentUsagePercentage: 0,
      averageWaitTime: 0,
      queueLength: 0,
      throttledRequests: 0,
      zoneMetrics: new Map(),
      endpointMetrics: new Map()
    };
  }
  
  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));
    const recentRequests = this.requestHistory.filter(req => req.timestamp > oneHourAgo);
    
    this.metrics.totalRequests = this.requestHistory.length;
    this.metrics.requestsInCurrentHour = recentRequests.length;
    this.metrics.currentUsagePercentage = this.getCurrentUsagePercentage();
    this.metrics.queueLength = this.requestQueue.length;
    this.metrics.zoneMetrics = new Map(this.zoneInfo);
    
    // Update endpoint metrics
    for (const [endpoint, threads] of this.endpointThreads.entries()) {
      const endpointRequests = recentRequests.filter(req => req.endpoint === endpoint);
      this.metrics.endpointMetrics.set(endpoint, {
        requests: endpointRequests.length,
        errors: 0, // Would need to track this separately
        averageResponseTime: 0, // Would need to track this separately
        activeThreads: threads.size
      });
    }
  }
  
  /**
   * Start metrics collection interval
   */
  private startMetricsCollection(): void {
    this.metricsUpdateInterval = setInterval(() => {
      this.updateMetrics();
      this.cleanupRequestHistory();
      
      // Emit metrics for monitoring
      this.emit('metricsUpdated', this.metrics);
      
      // Log performance summary periodically
      if (this.metrics.totalRequests % 100 === 0 && this.metrics.totalRequests > 0) {
        this.logger.info('Rate limiter performance summary', {
          totalRequests: this.metrics.totalRequests,
          currentUsage: `${(this.metrics.currentUsagePercentage * 100).toFixed(1)}%`,
          queueLength: this.metrics.queueLength,
          zones: this.zoneInfo.size,
          avgWaitTime: this.metrics.averageWaitTime
        });
      }
    }, 30000); // Update every 30 seconds
  }
  
  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Cleanup and shutdown
   */
  destroy(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
    }
    
    // Reject all queued requests
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
      request.reject(new Error('Rate limiter shutting down'));
    }
    
    this.removeAllListeners();
    this.logger.info('AutotaskRateLimiter destroyed');
  }
}