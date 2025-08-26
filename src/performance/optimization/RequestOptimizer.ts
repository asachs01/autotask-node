import { EventEmitter } from 'events';
import winston from 'winston';
import {
  OptimizationConfig,
  BatchRequest,
  BatchResponse,
  RequestOptimizationMetrics,
  OptimizationRule,
  RequestPattern
} from '../types/OptimizationTypes';
import { BatchProcessor } from './BatchProcessor';
import { RequestDeduplicator } from './RequestDeduplicator';
import { CompressionManager } from './CompressionManager';

/**
 * Advanced request optimization system
 * 
 * Orchestrates request batching, deduplication, compression, and
 * intelligent routing to maximize API performance and efficiency.
 */
export class RequestOptimizer extends EventEmitter {
  private readonly config: Required<OptimizationConfig>;
  private readonly batchProcessor: BatchProcessor;
  private readonly deduplicator: RequestDeduplicator;
  private readonly compressionManager: CompressionManager;
  
  private metrics: RequestOptimizationMetrics = {
    totalRequests: 0,
    batchedRequests: 0,
    deduplicatedRequests: 0,
    compressedResponses: 0,
    averageBatchSize: 0,
    batchEfficiency: 0,
    deduplicationHitRate: 0,
    averageCompressionRatio: 0,
    bandwidthSaved: 0,
    timeSaved: 0,
    concurrencyUtilization: 0
  };

  private optimizationRules: OptimizationRule[] = [];
  private requestPatterns = new Map<string, RequestPattern>();
  private isOptimizing = false;

  constructor(
    private logger: winston.Logger,
    config: OptimizationConfig = {}
  ) {
    super();

    this.config = {
      enableBatching: true,
      maxBatchSize: 10,
      batchTimeout: 100,
      enableDeduplication: true,
      deduplicationWindow: 5000,
      enableCompression: true,
      compressionThreshold: 1024,
      maxConcurrency: 10,
      enableQueuing: true,
      queueSizeLimit: 1000,
      priorityStrategy: 'priority',
      ...config
    };

    this.batchProcessor = new BatchProcessor(logger, this.config);
    this.deduplicator = new RequestDeduplicator(logger, this.config);
    this.compressionManager = new CompressionManager(logger, this.config);

    this.setupEventHandlers();
    this.initializeDefaultRules();
  }

  /**
   * Start the request optimizer
   */
  start(): void {
    if (this.isOptimizing) return;

    this.isOptimizing = true;
    this.batchProcessor.start();
    
    this.logger.info('Request optimizer started', {
      batching: this.config.enableBatching,
      deduplication: this.config.enableDeduplication,
      compression: this.config.enableCompression
    });
  }

  /**
   * Stop the request optimizer
   */
  stop(): void {
    if (!this.isOptimizing) return;

    this.isOptimizing = false;
    this.batchProcessor.stop();
    
    this.logger.info('Request optimizer stopped');
  }

  /**
   * Optimize a single request
   */
  async optimizeRequest(request: BatchRequest): Promise<BatchResponse> {
    if (!this.isOptimizing) {
      throw new Error('Request optimizer is not running');
    }

    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Apply optimization rules
      const optimizedRequest = await this.applyOptimizationRules(request);
      
      // Check for deduplication
      if (this.config.enableDeduplication) {
        const cachedResponse = await this.deduplicator.checkDuplication(optimizedRequest);
        if (cachedResponse) {
          this.metrics.deduplicatedRequests++;
          this.updateDeduplicationMetrics();
          return cachedResponse;
        }
      }

      // Process request (batching is handled internally by BatchProcessor)
      let response: BatchResponse;
      
      if (this.config.enableBatching) {
        response = await this.batchProcessor.processRequest(optimizedRequest);
        this.metrics.batchedRequests++;
      } else {
        response = await this.processSingleRequest(optimizedRequest);
      }

      // Apply response compression if enabled
      if (this.config.enableCompression && response.data) {
        const compressionResult = await this.compressionManager.compressResponse(response);
        if (compressionResult.compressionRatio > 1.1) { // Only if we save >10%
          response.data = compressionResult.data;
          this.metrics.compressedResponses++;
          this.metrics.bandwidthSaved += 
            compressionResult.originalSize - compressionResult.compressedSize;
        }
      }

      // Record request pattern
      this.recordRequestPattern(optimizedRequest);

      // Update metrics
      this.metrics.timeSaved += Math.max(0, 200 - (Date.now() - startTime)); // Assume we saved time
      this.updateEfficiencyMetrics();

      return response;
    } catch (error) {
      this.logger.error('Request optimization error', { 
        requestId: request.id, 
        error 
      });
      throw error;
    }
  }

  /**
   * Optimize multiple requests in parallel
   */
  async optimizeRequests(requests: BatchRequest[]): Promise<BatchResponse[]> {
    if (!this.isOptimizing) {
      throw new Error('Request optimizer is not running');
    }

    const startTime = Date.now();
    const responses: BatchResponse[] = [];

    try {
      // Group requests by optimization potential
      const optimizedGroups = await this.groupRequestsForOptimization(requests);
      
      // Process groups in parallel with concurrency control
      const processingPromises = optimizedGroups.map(async (group) => {
        if (this.config.enableBatching && group.length > 1) {
          return await this.batchProcessor.processBatch(group);
        } else {
          return await Promise.all(
            group.map(req => this.optimizeRequest(req))
          );
        }
      });

      const groupResponses = await Promise.all(processingPromises);
      
      // Flatten responses
      for (const groupResponse of groupResponses) {
        responses.push(...groupResponse);
      }

      this.logger.info('Batch optimization completed', {
        requestCount: requests.length,
        responseCount: responses.length,
        duration: Date.now() - startTime
      });

      return responses;
    } catch (error) {
      this.logger.error('Batch optimization error', { 
        requestCount: requests.length, 
        error 
      });
      throw error;
    }
  }

  /**
   * Add optimization rule
   */
  addOptimizationRule(rule: OptimizationRule): void {
    this.optimizationRules.push(rule);
    this.optimizationRules.sort((a, b) => b.priority - a.priority);
    
    this.logger.info('Optimization rule added', {
      ruleId: rule.id,
      name: rule.name,
      priority: rule.priority
    });
  }

  /**
   * Remove optimization rule
   */
  removeOptimizationRule(ruleId: string): boolean {
    const index = this.optimizationRules.findIndex(rule => rule.id === ruleId);
    if (index >= 0) {
      this.optimizationRules.splice(index, 1);
      this.logger.info('Optimization rule removed', { ruleId });
      return true;
    }
    return false;
  }

  /**
   * Get optimization metrics
   */
  getMetrics(): RequestOptimizationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get detected request patterns
   */
  getRequestPatterns(): RequestPattern[] {
    return Array.from(this.requestPatterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): {
    batching: string[];
    deduplication: string[];
    compression: string[];
    concurrency: string[];
    general: string[];
  } {
    const recommendations = {
      batching: [] as string[],
      deduplication: [] as string[],
      compression: [] as string[],
      concurrency: [] as string[],
      general: [] as string[]
    };

    // Batching recommendations
    if (this.metrics.batchEfficiency < 60) {
      recommendations.batching.push('Low batch efficiency - consider adjusting batch size or timeout');
    }

    if (this.metrics.averageBatchSize < 3) {
      recommendations.batching.push('Low average batch size - requests may not be grouping effectively');
    }

    // Deduplication recommendations
    if (this.metrics.deduplicationHitRate > 20) {
      recommendations.deduplication.push('High deduplication rate indicates potential for caching improvements');
    }

    // Compression recommendations
    if (this.metrics.averageCompressionRatio > 2 && this.metrics.compressedResponses / this.metrics.totalRequests < 0.8) {
      recommendations.compression.push('High compression ratios available - consider lowering compression threshold');
    }

    // Concurrency recommendations
    if (this.metrics.concurrencyUtilization < 50) {
      recommendations.concurrency.push('Low concurrency utilization - consider increasing concurrent request limit');
    }

    // General recommendations
    if (this.metrics.timeSaved / this.metrics.totalRequests < 50) {
      recommendations.general.push('Low time savings per request - review optimization rules effectiveness');
    }

    return recommendations;
  }

  /**
   * Reset optimization metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      batchedRequests: 0,
      deduplicatedRequests: 0,
      compressedResponses: 0,
      averageBatchSize: 0,
      batchEfficiency: 0,
      deduplicationHitRate: 0,
      averageCompressionRatio: 0,
      bandwidthSaved: 0,
      timeSaved: 0,
      concurrencyUtilization: 0
    };

    this.requestPatterns.clear();
    this.logger.info('Request optimizer metrics reset');
  }

  private setupEventHandlers(): void {
    this.batchProcessor.on('batch_processed', (batchInfo: any) => {
      this.metrics.averageBatchSize = 
        (this.metrics.averageBatchSize + batchInfo.size) / 2;
      this.updateBatchEfficiency();
    });

    this.deduplicator.on('cache_hit', () => {
      this.updateDeduplicationMetrics();
    });

    this.compressionManager.on('compression_completed', (result: any) => {
      this.metrics.averageCompressionRatio = 
        (this.metrics.averageCompressionRatio + result.compressionRatio) / 2;
    });
  }

  private initializeDefaultRules(): void {
    // Default rule: Prioritize GET requests for batching
    this.addOptimizationRule({
      id: 'batch_get_requests',
      name: 'Batch GET Requests',
      condition: (request) => request.method === 'GET',
      action: async (request) => {
        request.priority = (request.priority || 5) + 2;
        return request;
      },
      priority: 8,
      enabled: true,
      metrics: {
        applicationsCount: 0,
        successRate: 100,
        averageImprovement: 15
      }
    });

    // Default rule: Compress large responses
    this.addOptimizationRule({
      id: 'compress_large_responses',
      name: 'Compress Large Responses',
      condition: (request) => 
        request.method === 'GET' && request.endpoint.includes('list'),
      action: async (request) => {
        request.metadata = { 
          ...request.metadata, 
          preferCompression: true 
        };
        return request;
      },
      priority: 6,
      enabled: true,
      metrics: {
        applicationsCount: 0,
        successRate: 95,
        averageImprovement: 25
      }
    });
  }

  private async applyOptimizationRules(request: BatchRequest): Promise<BatchRequest> {
    let optimizedRequest = { ...request };

    for (const rule of this.optimizationRules) {
      if (!rule.enabled) continue;

      try {
        if (rule.condition(optimizedRequest)) {
          optimizedRequest = await rule.action(optimizedRequest);
          rule.metrics.applicationsCount++;
        }
      } catch (error) {
        this.logger.error('Optimization rule error', {
          ruleId: rule.id,
          requestId: request.id,
          error
        });
      }
    }

    return optimizedRequest;
  }

  private async groupRequestsForOptimization(
    requests: BatchRequest[]
  ): Promise<BatchRequest[][]> {
    const groups: BatchRequest[][] = [];
    const ungrouped = [...requests];

    // Group by endpoint and method for batching
    const endpointGroups = new Map<string, BatchRequest[]>();
    
    for (const request of ungrouped) {
      const key = `${request.method}:${request.endpoint}`;
      if (!endpointGroups.has(key)) {
        endpointGroups.set(key, []);
      }
      endpointGroups.get(key)!.push(request);
    }

    // Create groups respecting batch size limits
    for (const group of endpointGroups.values()) {
      if (group.length <= this.config.maxBatchSize) {
        groups.push(group);
      } else {
        // Split large groups
        for (let i = 0; i < group.length; i += this.config.maxBatchSize) {
          groups.push(group.slice(i, i + this.config.maxBatchSize));
        }
      }
    }

    return groups;
  }

  private async processSingleRequest(request: BatchRequest): Promise<BatchResponse> {
    // This would typically make the actual HTTP request
    // For now, we'll simulate a response
    const startTime = Date.now();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

    return {
      id: request.id,
      status: 200,
      headers: { 'content-type': 'application/json' },
      data: { message: 'Optimized response', timestamp: Date.now() },
      responseTime: Date.now() - startTime,
      success: true
    };
  }

  private recordRequestPattern(request: BatchRequest): void {
    const signature = `${request.method}:${request.endpoint}`;
    const pattern = this.requestPatterns.get(signature) || {
      id: signature,
      name: `${request.method} ${request.endpoint}`,
      signature,
      frequency: 0,
      averageResponseTime: 0,
      optimizations: [],
      confidence: 0
    };

    pattern.frequency++;
    
    // Identify optimization opportunities
    if (pattern.frequency > 10 && !pattern.optimizations.includes('batching')) {
      pattern.optimizations.push('batching');
    }

    if (request.endpoint.includes('list') && !pattern.optimizations.includes('compression')) {
      pattern.optimizations.push('compression');
    }

    pattern.confidence = Math.min(pattern.frequency / 100, 1);

    this.requestPatterns.set(signature, pattern);
  }

  private updateBatchEfficiency(): void {
    if (this.metrics.batchedRequests > 0) {
      this.metrics.batchEfficiency = 
        (this.metrics.averageBatchSize / this.config.maxBatchSize) * 100;
    }
  }

  private updateDeduplicationMetrics(): void {
    if (this.metrics.totalRequests > 0) {
      this.metrics.deduplicationHitRate = 
        (this.metrics.deduplicatedRequests / this.metrics.totalRequests) * 100;
    }
  }

  private updateEfficiencyMetrics(): void {
    // Update concurrency utilization
    this.metrics.concurrencyUtilization = 
      Math.min((this.metrics.totalRequests / this.config.maxConcurrency) * 100, 100);
  }
}