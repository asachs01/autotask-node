/**
 * Queue System Type Definitions
 * 
 * Comprehensive type definitions for the advanced offline queue system
 * supporting multiple backends, priority scheduling, and state management.
 */

export interface QueueRequest {
  /** Unique request identifier */
  id: string;
  
  /** Request group ID for batching */
  groupId?: string;
  
  /** API endpoint path */
  endpoint: string;
  
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  /** Autotask zone identifier */
  zone: string;
  
  /** Request priority (1-10, 10 being highest) */
  priority: number;
  
  /** Request payload data */
  data?: any;
  
  /** Custom headers */
  headers?: Record<string, string>;
  
  /** Request creation timestamp */
  createdAt: Date;
  
  /** Scheduled execution time */
  scheduledAt?: Date;
  
  /** Request timeout in milliseconds */
  timeout: number;
  
  /** Maximum retry attempts */
  maxRetries: number;
  
  /** Current retry count */
  retryCount: number;
  
  /** Whether request can be retried */
  retryable: boolean;
  
  /** Whether request can be batched with others */
  batchable: boolean;
  
  /** Request metadata for tracking */
  metadata: Record<string, any>;
  
  /** Current request status */
  status: QueueRequestStatus;
  
  /** Last error if any */
  lastError?: string;
  
  /** Execution history */
  executionHistory: QueueExecutionRecord[];
  
  /** Request fingerprint for deduplication */
  fingerprint?: string;
}

export type QueueRequestStatus = 
  | 'pending'     // Waiting in queue
  | 'processing'  // Currently being processed
  | 'completed'   // Successfully completed
  | 'failed'      // Permanently failed
  | 'retrying'    // Scheduled for retry
  | 'expired'     // Timed out
  | 'cancelled'   // Manually cancelled
  | 'deferred';   // Deferred to later time

export interface QueueExecutionRecord {
  /** Execution timestamp */
  timestamp: Date;
  
  /** Execution duration in ms */
  duration?: number;
  
  /** Execution result */
  result: 'success' | 'failure' | 'timeout' | 'cancelled';
  
  /** Error message if failed */
  error?: string;
  
  /** HTTP status code if applicable */
  statusCode?: number;
  
  /** Response size in bytes */
  responseSize?: number;
}

export interface QueueBatch {
  /** Unique batch identifier */
  id: string;
  
  /** Batch priority (highest priority of contained requests) */
  priority: number;
  
  /** Requests in this batch */
  requests: QueueRequest[];
  
  /** Batch creation timestamp */
  createdAt: Date;
  
  /** Target endpoint for batch */
  endpoint: string;
  
  /** Target zone for batch */
  zone: string;
  
  /** Maximum batch size */
  maxSize: number;
  
  /** Batch timeout in milliseconds */
  timeout: number;
  
  /** Batch status */
  status: QueueBatchStatus;
  
  /** Batch metadata */
  metadata: Record<string, any>;
}

export type QueueBatchStatus = 
  | 'collecting'  // Still accepting requests
  | 'ready'       // Ready for execution
  | 'processing'  // Currently executing
  | 'completed'   // All requests completed
  | 'partial'     // Some requests failed
  | 'failed'      // Batch execution failed
  | 'expired';    // Batch timed out

export interface QueueConfiguration {
  /** Queue name/identifier */
  name: string;
  
  /** Maximum queue size */
  maxSize: number;
  
  /** Queue processing mode */
  processingMode: 'sequential' | 'parallel' | 'batch';
  
  /** Maximum concurrent processors */
  maxConcurrency: number;
  
  /** Enable priority processing */
  priorityEnabled: boolean;
  
  /** Enable request batching */
  batchingEnabled: boolean;
  
  /** Maximum batch size */
  maxBatchSize: number;
  
  /** Batch collection timeout */
  batchTimeout: number;
  
  /** Enable request deduplication */
  deduplicationEnabled: boolean;
  
  /** Deduplication window in milliseconds */
  deduplicationWindow: number;
  
  /** Default request timeout */
  defaultTimeout: number;
  
  /** Default retry count */
  defaultRetries: number;
  
  /** Queue persistence settings */
  persistence: QueuePersistenceConfig;
  
  /** Processing strategies */
  strategies: QueueStrategyConfig;
}

export interface QueuePersistenceConfig {
  /** Storage backend type */
  backend: 'memory' | 'sqlite' | 'redis' | 'hybrid';
  
  /** Connection configuration */
  connection?: {
    /** Connection string or path */
    connectionString?: string;
    
    /** Database/file path for SQLite */
    dbPath?: string;
    
    /** Redis configuration */
    redis?: {
      host: string;
      port: number;
      password?: string;
      db?: number;
    };
    
    /** Connection options */
    options?: Record<string, any>;
  };
  
  /** Persistence options */
  options: {
    /** Enable periodic checkpoints */
    checkpoints: boolean;
    
    /** Checkpoint interval in ms */
    checkpointInterval?: number;
    
    /** Enable compression */
    compression: boolean;
    
    /** Retention period in ms */
    retentionPeriod?: number;
    
    /** Enable WAL mode for SQLite */
    walMode?: boolean;
  };
}

export interface QueueStrategyConfig {
  /** Priority scheduling strategy */
  priorityStrategy: 'fifo' | 'lifo' | 'priority' | 'weighted' | 'adaptive';
  
  /** Retry strategy configuration */
  retryStrategy: {
    /** Base delay in ms */
    baseDelay: number;
    
    /** Maximum delay in ms */
    maxDelay: number;
    
    /** Backoff multiplier */
    multiplier: number;
    
    /** Add jitter to delays */
    jitter: boolean;
    
    /** Jitter range (0.0 to 1.0) */
    jitterRange?: number;
  };
  
  /** Circuit breaker configuration */
  circuitBreaker: {
    /** Enable circuit breaker */
    enabled: boolean;
    
    /** Failure threshold */
    failureThreshold: number;
    
    /** Success threshold for recovery */
    successThreshold: number;
    
    /** Timeout for half-open state */
    timeout: number;
  };
  
  /** Load balancing strategy */
  loadBalancing: 'round-robin' | 'least-connections' | 'zone-based' | 'adaptive';
}

export interface QueueMetrics {
  /** Total requests processed */
  totalRequests: number;
  
  /** Successful requests */
  successfulRequests: number;
  
  /** Failed requests */
  failedRequests: number;
  
  /** Currently queued requests */
  queuedRequests: number;
  
  /** Currently processing requests */
  processingRequests: number;
  
  /** Average processing time in ms */
  averageProcessingTime: number;
  
  /** Average queue wait time in ms */
  averageQueueTime: number;
  
  /** Queue utilization (0.0 to 1.0) */
  queueUtilization: number;
  
  /** Throughput (requests per second) */
  throughput: number;
  
  /** Error rate (0.0 to 1.0) */
  errorRate: number;
  
  /** Batch statistics */
  batchStats: {
    /** Total batches created */
    totalBatches: number;
    
    /** Average batch size */
    averageBatchSize: number;
    
    /** Average batch processing time */
    averageBatchTime: number;
  };
  
  /** Priority distribution */
  priorityDistribution: Map<number, number>;
  
  /** Status distribution */
  statusDistribution: Map<QueueRequestStatus, number>;
  
  /** Last metrics update */
  lastUpdated: Date;
}

export interface QueueHealth {
  /** Overall queue health */
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  
  /** Component health checks */
  components: {
    /** Storage backend health */
    storage: 'healthy' | 'degraded' | 'offline';
    
    /** Processing engine health */
    processor: 'healthy' | 'degraded' | 'offline';
    
    /** Monitoring system health */
    monitoring: 'healthy' | 'degraded' | 'offline';
  };
  
  /** Performance indicators */
  performance: {
    /** Response time percentiles */
    responseTime: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
    };
    
    /** Queue depth over time */
    queueDepth: number[];
    
    /** Processing rate */
    processingRate: number;
  };
  
  /** Resource utilization */
  resources: {
    /** Memory usage in bytes */
    memoryUsage: number;
    
    /** Storage usage in bytes */
    storageUsage: number;
    
    /** CPU utilization (0.0 to 1.0) */
    cpuUtilization: number;
  };
  
  /** Active alerts */
  alerts: QueueAlert[];
  
  /** Last health check */
  lastCheck: Date;
}

export interface QueueAlert {
  /** Alert identifier */
  id: string;
  
  /** Alert severity */
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  /** Alert type */
  type: string;
  
  /** Alert message */
  message: string;
  
  /** Alert timestamp */
  timestamp: Date;
  
  /** Alert metadata */
  metadata?: Record<string, any>;
}

export interface QueueStorageBackend {
  /** Initialize the storage backend */
  initialize(): Promise<void>;
  
  /** Store a request in the queue */
  enqueue(request: QueueRequest): Promise<void>;
  
  /** Remove and return the next request */
  dequeue(zone?: string): Promise<QueueRequest | null>;
  
  /** Peek at the next request without removing */
  peek(zone?: string): Promise<QueueRequest | null>;
  
  /** Update request status and metadata */
  updateRequest(id: string, updates: Partial<QueueRequest>): Promise<void>;
  
  /** Remove a specific request */
  remove(id: string): Promise<boolean>;
  
  /** Get request by ID */
  getRequest(id: string): Promise<QueueRequest | null>;
  
  /** Get all requests matching criteria */
  getRequests(filter: QueueFilter): Promise<QueueRequest[]>;
  
  /** Get queue size */
  size(zone?: string): Promise<number>;
  
  /** Clear all requests */
  clear(zone?: string): Promise<number>;
  
  /** Store a batch */
  storeBatch(batch: QueueBatch): Promise<void>;
  
  /** Get batches ready for processing */
  getReadyBatches(): Promise<QueueBatch[]>;
  
  /** Update batch status */
  updateBatch(id: string, updates: Partial<QueueBatch>): Promise<void>;
  
  /** Get metrics data */
  getMetrics(): Promise<QueueMetrics>;
  
  /** Perform maintenance operations */
  maintenance(): Promise<void>;
  
  /** Close the backend connection */
  close(): Promise<void>;
}

export interface QueueFilter {
  /** Filter by status */
  status?: QueueRequestStatus | QueueRequestStatus[];
  
  /** Filter by priority range */
  priority?: { min?: number; max?: number };
  
  /** Filter by zone */
  zone?: string;
  
  /** Filter by endpoint */
  endpoint?: string;
  
  /** Filter by creation time range */
  createdAfter?: Date;
  createdBefore?: Date;
  
  /** Filter by scheduled time range */
  scheduledAfter?: Date;
  scheduledBefore?: Date;
  
  /** Maximum number of results */
  limit?: number;
  
  /** Skip number of results */
  offset?: number;
  
  /** Sort order */
  sort?: {
    field: 'createdAt' | 'scheduledAt' | 'priority' | 'retryCount';
    direction: 'asc' | 'desc';
  };
}

export interface QueueProcessor {
  /** Process a single request */
  processRequest(request: QueueRequest): Promise<any>;
  
  /** Process a batch of requests */
  processBatch(batch: QueueBatch): Promise<any[]>;
  
  /** Check if processor can handle request */
  canProcess(request: QueueRequest): boolean;
  
  /** Get processor health */
  getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message?: string }>;
}

export interface QueueScheduler {
  /** Select next request to process */
  selectNext(availableRequests: QueueRequest[]): QueueRequest | null;
  
  /** Schedule request for future execution */
  schedule(request: QueueRequest, delay: number): void;
  
  /** Get scheduled requests ready for processing */
  getReadyRequests(): QueueRequest[];
  
  /** Update scheduling strategy */
  updateStrategy(config: QueueStrategyConfig): void;
}

export interface QueueEvent {
  /** Event type */
  type: string;
  
  /** Event timestamp */
  timestamp: Date;
  
  /** Event data */
  data: any;
  
  /** Event metadata */
  metadata?: Record<string, any>;
}

export type QueueEventType = 
  | 'request.enqueued'
  | 'request.processing'
  | 'request.completed'
  | 'request.failed'
  | 'request.retrying'
  | 'request.cancelled'
  | 'batch.created'
  | 'batch.processing'
  | 'batch.completed'
  | 'batch.failed'
  | 'queue.full'
  | 'queue.empty'
  | 'health.degraded'
  | 'health.recovered'
  | 'metrics.updated';