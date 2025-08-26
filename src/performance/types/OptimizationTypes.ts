/**
 * Request optimization types and interfaces
 */

export interface OptimizationConfig {
  /** Enable request batching */
  enableBatching?: boolean;
  /** Maximum batch size */
  maxBatchSize?: number;
  /** Batch timeout in milliseconds */
  batchTimeout?: number;
  /** Enable request deduplication */
  enableDeduplication?: boolean;
  /** Deduplication window in milliseconds */
  deduplicationWindow?: number;
  /** Enable response compression */
  enableCompression?: boolean;
  /** Compression threshold in bytes */
  compressionThreshold?: number;
  /** Maximum concurrent requests */
  maxConcurrency?: number;
  /** Enable request queuing */
  enableQueuing?: boolean;
  /** Queue size limit */
  queueSizeLimit?: number;
  /** Request priority strategy */
  priorityStrategy?: 'fifo' | 'priority' | 'shortest_first';
}

export interface BatchRequest {
  /** Request ID */
  id: string;
  /** HTTP method */
  method: string;
  /** Endpoint path */
  endpoint: string;
  /** Request parameters */
  params?: Record<string, any>;
  /** Request body */
  body?: any;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request priority (1-10) */
  priority?: number;
  /** Request timeout */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
  /** Request metadata */
  metadata?: Record<string, any>;
}

export interface BatchResponse {
  /** Request ID */
  id: string;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Response data */
  data: any;
  /** Response time in milliseconds */
  responseTime: number;
  /** Success status */
  success: boolean;
  /** Error information */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface RequestDeduplicationEntry {
  /** Request hash */
  hash: string;
  /** Original request */
  request: BatchRequest;
  /** Response promise */
  responsePromise: Promise<BatchResponse>;
  /** Creation timestamp */
  createdAt: number;
  /** Expiry timestamp */
  expiresAt: number;
  /** Number of duplicate requests */
  duplicateCount: number;
}

export interface CompressionResult {
  /** Compressed data */
  data: Buffer;
  /** Original size */
  originalSize: number;
  /** Compressed size */
  compressedSize: number;
  /** Compression ratio */
  compressionRatio: number;
  /** Compression algorithm used */
  algorithm: string;
  /** Compression time in milliseconds */
  compressionTime: number;
}

export interface ConcurrencyLimiter {
  /** Current active requests */
  activeRequests: number;
  /** Maximum concurrent requests */
  maxConcurrency: number;
  /** Queued requests count */
  queuedRequests: number;
  /** Queue size limit */
  queueSizeLimit: number;
  /** Average wait time in milliseconds */
  averageWaitTime: number;
  /** Request throughput per second */
  throughput: number;
}

export interface RequestOptimizationMetrics {
  /** Total requests processed */
  totalRequests: number;
  /** Batched requests count */
  batchedRequests: number;
  /** Deduplicated requests count */
  deduplicatedRequests: number;
  /** Compressed responses count */
  compressedResponses: number;
  /** Average batch size */
  averageBatchSize: number;
  /** Batch efficiency percentage */
  batchEfficiency: number;
  /** Deduplication hit rate */
  deduplicationHitRate: number;
  /** Average compression ratio */
  averageCompressionRatio: number;
  /** Bandwidth saved (bytes) */
  bandwidthSaved: number;
  /** Processing time saved (ms) */
  timeSaved: number;
  /** Concurrency utilization percentage */
  concurrencyUtilization: number;
}

export interface RequestQueue {
  /** Queue name */
  name: string;
  /** Queued requests */
  requests: BatchRequest[];
  /** Queue priority */
  priority: number;
  /** Maximum queue size */
  maxSize: number;
  /** Queue processing strategy */
  strategy: 'fifo' | 'lifo' | 'priority' | 'shortest_first';
  /** Queue metrics */
  metrics: {
    totalProcessed: number;
    averageWaitTime: number;
    peakSize: number;
    currentSize: number;
  };
}

export interface ParallelProcessingConfig {
  /** Worker pool size */
  workerPoolSize?: number;
  /** Enable worker thread pooling */
  enableWorkerThreads?: boolean;
  /** Maximum parallel operations */
  maxParallelOperations?: number;
  /** Load balancing strategy */
  loadBalancingStrategy?: 'round_robin' | 'least_connections' | 'weighted';
  /** Enable circuit breaker */
  enableCircuitBreaker?: boolean;
  /** Circuit breaker threshold */
  circuitBreakerThreshold?: number;
}

export interface StreamProcessingOptions {
  /** Stream buffer size */
  bufferSize?: number;
  /** High water mark for stream */
  highWaterMark?: number;
  /** Enable backpressure handling */
  enableBackpressure?: boolean;
  /** Transform function for stream data */
  transform?: (chunk: any) => any;
  /** Error handling strategy */
  errorStrategy?: 'continue' | 'stop' | 'retry';
}

export interface LazyLoadingConfig {
  /** Enable lazy loading */
  enabled?: boolean;
  /** Lazy loading strategy */
  strategy?: 'on_demand' | 'progressive' | 'predictive';
  /** Preload threshold */
  preloadThreshold?: number;
  /** Maximum preload depth */
  maxPreloadDepth?: number;
  /** Preload batch size */
  preloadBatchSize?: number;
}

export interface PaginationOptimization {
  /** Optimal page size */
  optimalPageSize: number;
  /** Enable page prefetching */
  enablePrefetching: boolean;
  /** Prefetch distance */
  prefetchDistance: number;
  /** Enable infinite scroll */
  enableInfiniteScroll: boolean;
  /** Virtual scrolling threshold */
  virtualScrollThreshold: number;
  /** Page cache size */
  pageCacheSize: number;
}

export interface OptimizationRule {
  /** Rule ID */
  id: string;
  /** Rule name */
  name: string;
  /** Rule condition */
  condition: (request: BatchRequest) => boolean;
  /** Optimization action */
  action: (request: BatchRequest) => Promise<BatchRequest>;
  /** Rule priority (1-10) */
  priority: number;
  /** Rule enabled status */
  enabled: boolean;
  /** Rule metrics */
  metrics: {
    applicationsCount: number;
    successRate: number;
    averageImprovement: number;
  };
}

export interface RequestPattern {
  /** Pattern ID */
  id: string;
  /** Pattern name */
  name: string;
  /** Request signature */
  signature: string;
  /** Frequency of pattern occurrence */
  frequency: number;
  /** Average response time */
  averageResponseTime: number;
  /** Optimization opportunities */
  optimizations: string[];
  /** Pattern confidence score (0-1) */
  confidence: number;
}