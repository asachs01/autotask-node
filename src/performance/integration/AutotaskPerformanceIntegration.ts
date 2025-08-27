import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import winston from 'winston';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';
import { IntelligentCache } from '../caching/IntelligentCache';
import { RequestOptimizer } from '../optimization/RequestOptimizer';
import { BenchmarkSuite } from '../benchmarks/BenchmarkSuite';
import { RequestMetrics, PerformanceConfig } from '../types/PerformanceTypes';
import { CacheConfig } from '../types/CacheTypes';
import { OptimizationConfig, BatchRequest, BatchResponse } from '../types/OptimizationTypes';
import { BenchmarkConfig } from '../types/BenchmarkTypes';

/**
 * Performance integration layer for AutotaskClient
 * 
 * Integrates performance monitoring, caching, optimization, and benchmarking
 * directly into the AutotaskClient workflow for comprehensive performance management.
 */
export class AutotaskPerformanceIntegration {
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly cache: IntelligentCache;
  private readonly requestOptimizer: RequestOptimizer;
  private readonly benchmarkSuite: BenchmarkSuite;
  
  private isEnabled = false;
  private requestIdCounter = 0;

  constructor(
    private axios: AxiosInstance,
    private logger: winston.Logger,
    private config: {
      performance?: PerformanceConfig;
      cache?: CacheConfig;
      optimization?: OptimizationConfig;
    } = {}
  ) {
    this.performanceMonitor = new PerformanceMonitor(logger, config.performance);
    this.cache = new IntelligentCache(logger, config.cache);
    this.requestOptimizer = new RequestOptimizer(logger, config.optimization);
    this.benchmarkSuite = new BenchmarkSuite(logger);

    this.setupCacheWarmingStrategies();
    this.setupOptimizationRules();
  }

  /**
   * Enable performance integration
   */
  enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    
    // Start all performance components
    this.performanceMonitor.start();
    this.requestOptimizer.start();

    // Setup request/response interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();

    // Setup cache invalidation for entity operations
    this.setupCacheInvalidation();

    this.logger.info('AutoTask performance integration enabled');
  }

  /**
   * Disable performance integration
   */
  disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;

    // Stop performance components
    this.performanceMonitor.stop();
    this.requestOptimizer.stop();
    this.cache.stopCacheWarming();

    this.logger.info('AutoTask performance integration disabled');
  }

  /**
   * Get comprehensive performance dashboard data
   */
  getDashboard(): {
    performance: any;
    cache: any;
    optimization: any;
    recommendations: string[];
  } {
    const performance = {
      metrics: this.performanceMonitor.getCurrentMetrics(),
      report: this.performanceMonitor.generateReport(Date.now() - 3600000), // Last hour
      profiles: this.performanceMonitor.getAllProfiles()
    };

    const cache = {
      stats: this.cache.getStats(),
      metrics: this.cache.getMetrics(),
      // patterns: this.cache.getRequestPatterns?.() || []
      patterns: [] // Method not implemented yet
    };

    const optimization = {
      metrics: this.requestOptimizer.getMetrics(),
      patterns: this.requestOptimizer.getRequestPatterns(),
      recommendations: this.requestOptimizer.getOptimizationRecommendations()
    };

    const recommendations = this.generateComprehensiveRecommendations(
      performance,
      cache,
      optimization
    );

    return {
      performance,
      cache,
      optimization,
      recommendations
    };
  }

  /**
   * Run performance benchmark for specific entities
   */
  async benchmarkEntities(
    entityTypes: string[],
    config?: Partial<BenchmarkConfig>
  ): Promise<any> {
    const benchmarkConfig: BenchmarkConfig = {
      name: `AutoTask Entity Benchmark - ${entityTypes.join(', ')}`,
      description: `Performance benchmark for ${entityTypes.length} entity types`,
      iterations: 1000,
      concurrency: 5,
      maxDuration: 300000, // 5 minutes
      targetEntities: entityTypes,
      scenarios: this.createEntityBenchmarkScenarios(entityTypes),
      ...config
    };

    return this.benchmarkSuite.runBenchmark(benchmarkConfig);
  }

  /**
   * Optimize cache for specific usage patterns
   */
  async optimizeCache(usagePatterns: {
    entityType: string;
    operations: string[];
    frequency: number;
  }[]): Promise<void> {
    for (const pattern of usagePatterns) {
      // Add cache warming strategy
      this.cache.addWarmupStrategy({
        name: `${pattern.entityType} Optimization`,
        entityTypes: [pattern.entityType],
        priority: Math.floor(pattern.frequency * 10),
        queries: pattern.operations.map(op => ({
          endpoint: `/${pattern.entityType}`,
          parameters: this.getOptimalQueryParams(pattern.entityType, op),
          ttl: this.calculateOptimalTTL(pattern.frequency)
        }))
      });

      // Add invalidation rules
      this.cache.addInvalidationRule({
        id: `${pattern.entityType}_invalidation`,
        name: `${pattern.entityType} Auto Invalidation`,
        triggerEntities: [pattern.entityType],
        invalidatePatterns: [
          `${pattern.entityType}:*`,
          `${pattern.entityType}_list:*`,
          `${pattern.entityType}_search:*`
        ],
        strategy: 'immediate'
      });
    }

    // Warm cache with optimized patterns
    await this.cache.warmCache();
  }

  /**
   * Get performance insights and recommendations
   */
  getPerformanceInsights(): {
    bottlenecks: Array<{
      component: string;
      issue: string;
      impact: string;
      recommendation: string;
    }>;
    opportunities: Array<{
      area: string;
      potential: string;
      implementation: string;
    }>;
    trends: {
      performance: 'improving' | 'degrading' | 'stable';
      cache: 'improving' | 'degrading' | 'stable';
      optimization: 'improving' | 'degrading' | 'stable';
    };
  } {
    const metrics = this.performanceMonitor.getCurrentMetrics();
    const cacheStats = this.cache.getStats();
    const optMetrics = this.requestOptimizer.getMetrics();

    const bottlenecks = [];
    const opportunities = [];

    // Identify bottlenecks
    if (metrics.averageResponseTime > 2000) {
      bottlenecks.push({
        component: 'API Response Time',
        issue: 'High average response time detected',
        impact: 'Poor user experience and reduced throughput',
        recommendation: 'Implement request batching and optimize database queries'
      });
    }

    if (cacheStats.hitRate < 70) {
      bottlenecks.push({
        component: 'Cache Efficiency',
        issue: 'Low cache hit rate',
        impact: 'Increased API calls and server load',
        recommendation: 'Review cache TTL settings and warming strategies'
      });
    }

    if (optMetrics.batchEfficiency < 50) {
      bottlenecks.push({
        component: 'Request Batching',
        issue: 'Low batching efficiency',
        impact: 'Suboptimal request grouping and throughput',
        recommendation: 'Adjust batch size and timeout parameters'
      });
    }

    // Identify opportunities
    if (optMetrics.deduplicationHitRate > 20) {
      opportunities.push({
        area: 'Request Deduplication',
        potential: 'High duplicate request rate indicates caching potential',
        implementation: 'Implement more aggressive caching for frequent operations'
      });
    }

    if (optMetrics.averageCompressionRatio > 2) {
      opportunities.push({
        area: 'Response Compression',
        potential: 'High compression ratios available',
        implementation: 'Lower compression threshold to save more bandwidth'
      });
    }

    return {
      bottlenecks,
      opportunities,
      trends: {
        performance: 'stable', // Would analyze historical data
        cache: 'stable',
        optimization: 'improving'
      }
    };
  }

  private setupRequestInterceptor(): void {
    this.axios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      if (!this.isEnabled) return config;

      const requestId = `req_${++this.requestIdCounter}_${Date.now()}`;
      
      // Add request metadata
      (config as any).metadata = {
        ...((config as any).metadata || {}),
        requestId,
        startTime: Date.now(),
        performanceTracking: true
      };

      // Check cache for GET requests
      if (config.method?.toLowerCase() === 'get') {
        const cacheKey = this.generateCacheKey(config);
        const cachedResponse = await this.cache.get(cacheKey);
        
        if (cachedResponse) {
          // Return cached response
          const response = {
            data: cachedResponse,
            status: 200,
            statusText: 'OK',
            headers: { 'x-cache': 'HIT' },
            config,
            request: {}
          } as AxiosResponse;

          // Record cache hit metrics
          this.recordCacheHit(config, response);
          
          // Throw response to bypass actual request
          throw { response, cached: true };
        }
      }

      // Apply request optimization if enabled
      if (this.config.optimization?.enableBatching) {
        const batchRequest = this.convertToBatchRequest(config);
        const optimizedResponse = await this.requestOptimizer.optimizeRequest(batchRequest);
        
        if (optimizedResponse.success) {
          // Convert back to Axios format and throw to bypass request
          const axiosResponse = this.convertToAxiosResponse(optimizedResponse, config);
          throw { response: axiosResponse, optimized: true };
        }
      }

      return config;
    }, (error) => {
      // Handle cached/optimized responses
      if (error.cached || error.optimized) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    });
  }

  private setupResponseInterceptor(): void {
    this.axios.interceptors.response.use(
      async (response: AxiosResponse) => {
        if (!this.isEnabled) return response;

        const config = response.config as any;
        const metadata = config.metadata || {};

        // Record performance metrics
        const requestMetrics: RequestMetrics = {
          requestId: metadata.requestId || 'unknown',
          method: config.method?.toUpperCase() || 'UNKNOWN',
          endpoint: this.extractEndpoint(config.url || ''),
          startTime: metadata.startTime || Date.now(),
          endTime: Date.now(),
          responseTime: Date.now() - (metadata.startTime || Date.now()),
          statusCode: response.status,
          requestSize: this.estimateRequestSize(config),
          responseSize: this.estimateResponseSize(response),
          success: response.status >= 200 && response.status < 300
        };

        this.performanceMonitor.recordRequest(requestMetrics);

        // Cache successful GET responses
        if (config.method?.toLowerCase() === 'get' && 
            response.status >= 200 && 
            response.status < 300) {
          const cacheKey = this.generateCacheKey(config);
          const ttl = this.calculateResponseTTL(config.url, response.data);
          
          await this.cache.set(cacheKey, response.data, ttl);
        }

        return response;
      },
      async (error) => {
        if (!this.isEnabled) return Promise.reject(error);

        // Record error metrics
        const config = error.config as any;
        const metadata = config?.metadata || {};

        const requestMetrics: RequestMetrics = {
          requestId: metadata.requestId || 'unknown',
          method: config?.method?.toUpperCase() || 'UNKNOWN',
          endpoint: this.extractEndpoint(config?.url || ''),
          startTime: metadata.startTime || Date.now(),
          endTime: Date.now(),
          responseTime: Date.now() - (metadata.startTime || Date.now()),
          statusCode: error.response?.status,
          requestSize: this.estimateRequestSize(config),
          responseSize: this.estimateResponseSize(error.response),
          success: false,
          error: error.message
        };

        this.performanceMonitor.recordRequest(requestMetrics);

        return Promise.reject(error);
      }
    );
  }

  private setupCacheWarmingStrategies(): void {
    // Default warming strategies for common AutoTask entities
    const commonStrategies = [
      {
        name: 'Companies Warming',
        entityTypes: ['companies'],
        priority: 9,
        queries: [
          { endpoint: '/companies', parameters: { pageSize: 50 }, ttl: 300000 },
          { endpoint: '/companies', parameters: { isActive: 'true' }, ttl: 600000 }
        ]
      },
      {
        name: 'Reference Data Warming',
        entityTypes: ['picklists', 'udf'],
        priority: 10,
        queries: [
          { endpoint: '/countries', parameters: {}, ttl: 3600000 },
          { endpoint: '/departments', parameters: {}, ttl: 1800000 },
          { endpoint: '/roles', parameters: {}, ttl: 1800000 }
        ]
      },
      {
        name: 'Tickets Warming',
        entityTypes: ['tickets'],
        priority: 8,
        queries: [
          { endpoint: '/tickets', parameters: { status: 'New' }, ttl: 120000 },
          { endpoint: '/tickets', parameters: { priority: 'High' }, ttl: 60000 }
        ]
      }
    ];

    commonStrategies.forEach(strategy => {
      this.cache.addWarmupStrategy(strategy);
    });
  }

  private setupOptimizationRules(): void {
    // Entity-specific optimization rules
    this.requestOptimizer.addOptimizationRule({
      id: 'batch_entity_lists',
      name: 'Batch Entity List Requests',
      condition: (req) => 
        req.method === 'GET' && 
        !!req.endpoint.match(/\/(companies|contacts|tickets|projects)$/),
      action: async (req) => {
        req.priority = (req.priority || 5) + 3;
        req.metadata = { ...req.metadata, batchable: true };
        return req;
      },
      priority: 9,
      enabled: true,
      metrics: { applicationsCount: 0, successRate: 100, averageImprovement: 20 }
    });

    this.requestOptimizer.addOptimizationRule({
      id: 'compress_large_lists',
      name: 'Compress Large Entity Lists',
      condition: (req) => 
        req.method === 'GET' && 
        req.params?.pageSize && 
        parseInt(req.params.pageSize) > 100,
      action: async (req) => {
        req.metadata = { ...req.metadata, preferCompression: true };
        return req;
      },
      priority: 7,
      enabled: true,
      metrics: { applicationsCount: 0, successRate: 95, averageImprovement: 30 }
    });
  }

  private setupCacheInvalidation(): void {
    // Setup entity-specific cache invalidation rules
    const entityTypes = [
      'companies', 'contacts', 'tickets', 'projects', 'tasks',
      'contracts', 'opportunities', 'resources', 'invoices'
    ];

    entityTypes.forEach(entityType => {
      this.cache.addInvalidationRule({
        id: `${entityType}_crud_invalidation`,
        name: `${entityType} CRUD Invalidation`,
        triggerEntities: [entityType],
        invalidatePatterns: [
          `${entityType}:*`,
          `${entityType}_list:*`,
          `${entityType}_search:*`,
          `${entityType}_count:*`
        ],
        strategy: 'immediate',
        conditions: [
          { field: 'method', operator: 'equals', value: 'POST' },
          { field: 'method', operator: 'equals', value: 'PUT' },
          { field: 'method', operator: 'equals', value: 'PATCH' },
          { field: 'method', operator: 'equals', value: 'DELETE' }
        ]
      });
    });
  }

  private generateCacheKey(config: AxiosRequestConfig): string {
    const url = config.url || '';
    const method = config.method || 'GET';
    const params = JSON.stringify(config.params || {});
    const data = config.method !== 'GET' ? JSON.stringify(config.data || {}) : '';
    
    return `autotask:${method}:${url}:${params}:${data}`;
  }

  private extractEndpoint(url: string): string {
    return url.replace(/^.*\/v[\d.]+/, '').split('?')[0];
  }

  private estimateRequestSize(config?: AxiosRequestConfig): number {
    if (!config) return 0;
    return JSON.stringify(config.data || '').length + 
           JSON.stringify(config.params || '').length + 
           (config.url?.length || 0);
  }

  private estimateResponseSize(response?: AxiosResponse): number {
    if (!response) return 0;
    return JSON.stringify(response.data || '').length;
  }

  private calculateResponseTTL(url?: string, data?: any): number {
    // Intelligent TTL based on endpoint and data characteristics
    if (!url) return 300000; // 5 minutes default

    // Reference data - long TTL
    if (url.match(/\/(countries|departments|roles|actiontypes|phases)/)) {
      return 3600000; // 1 hour
    }

    // Entity lists - medium TTL
    if (url.match(/\/(companies|contacts|projects)/) && data?.items?.length > 100) {
      return 600000; // 10 minutes
    }

    // Active/changing data - short TTL
    if (url.match(/\/(tickets|tasks|opportunities)/) && data?.items?.some((item: any) => 
        ['New', 'In Progress', 'Waiting'].includes(item.status))) {
      return 60000; // 1 minute
    }

    return 300000; // 5 minutes default
  }

  private convertToBatchRequest(config: AxiosRequestConfig): BatchRequest {
    return {
      id: (config as any).metadata?.requestId || 'unknown',
      method: config.method?.toUpperCase() || 'GET',
      endpoint: this.extractEndpoint(config.url || ''),
      params: config.params,
      body: config.data,
      headers: config.headers as Record<string, string>,
      priority: 5, // Default priority
      metadata: (config as any).metadata || {}
    };
  }

  private convertToAxiosResponse(batchResponse: BatchResponse, config: AxiosRequestConfig): AxiosResponse {
    return {
      data: batchResponse.data,
      status: batchResponse.status,
      statusText: batchResponse.success ? 'OK' : 'Error',
      headers: batchResponse.headers,
      config,
      request: {}
    } as AxiosResponse;
  }

  private recordCacheHit(config: AxiosRequestConfig, response: AxiosResponse): void {
    const requestMetrics: RequestMetrics = {
      requestId: (config as any).metadata?.requestId || 'cached',
      method: config.method?.toUpperCase() || 'GET',
      endpoint: this.extractEndpoint(config.url || ''),
      startTime: Date.now() - 1,
      endTime: Date.now(),
      responseTime: 1, // Cache hits are essentially instantaneous
      statusCode: 200,
      requestSize: this.estimateRequestSize(config),
      responseSize: this.estimateResponseSize(response),
      success: true,
      metadata: { cached: true }
    };

    this.performanceMonitor.recordRequest(requestMetrics);
  }

  private createEntityBenchmarkScenarios(entityTypes: string[]): any[] {
    return entityTypes.map(entityType => ({
      name: `${entityType} Operations`,
      weight: 100 / entityTypes.length,
      operations: [
        { type: 'list', entityType, weight: 40 },
        { type: 'get', entityType, weight: 30 },
        { type: 'search', entityType, weight: 20 },
        { type: 'create', entityType, weight: 10 }
      ]
    }));
  }

  private getOptimalQueryParams(entityType: string, operation: string): Record<string, any> {
    const baseParams: Record<string, any> = {
      pageSize: 100,
      includeFields: 'id,companyName,isActive' // Common fields
    };

    // Entity-specific optimizations
    switch (entityType) {
      case 'companies':
        return { ...baseParams, isActive: true };
      case 'tickets':
        return { ...baseParams, status: 'Open', includeFields: 'id,title,status,priority' };
      case 'contacts':
        return { ...baseParams, isActive: 1, includeFields: 'id,firstName,lastName,email' };
      default:
        return baseParams;
    }
  }

  private calculateOptimalTTL(frequency: number): number {
    // Higher frequency = shorter TTL for fresher data
    if (frequency > 100) return 30000; // 30 seconds for very frequent
    if (frequency > 50) return 120000; // 2 minutes for frequent
    if (frequency > 10) return 300000; // 5 minutes for moderate
    return 600000; // 10 minutes for infrequent
  }

  private generateComprehensiveRecommendations(
    performance: any,
    cache: any,
    optimization: any
  ): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (performance.metrics.averageResponseTime > 1000) {
      recommendations.push('High response times detected - consider implementing request batching');
    }

    if (performance.metrics.errorRate > 5) {
      recommendations.push('Elevated error rate - review API error handling and retry mechanisms');
    }

    // Cache recommendations
    if (cache.stats.hitRate < 60) {
      recommendations.push('Low cache hit rate - review cache warming strategies and TTL settings');
    }

    if (cache.stats.utilization > 90) {
      recommendations.push('Cache near capacity - consider increasing cache size or implementing better eviction');
    }

    // Optimization recommendations
    if (optimization.metrics.batchEfficiency < 50) {
      recommendations.push('Poor batching efficiency - adjust batch size and timeout parameters');
    }

    if (optimization.metrics.deduplicationHitRate > 25) {
      recommendations.push('High request duplication detected - implement more aggressive caching');
    }

    return recommendations;
  }
}