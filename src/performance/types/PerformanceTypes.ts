/**
 * Core performance monitoring types and interfaces
 */

export interface PerformanceConfig {
  /** Enable real-time metrics collection */
  enableRealTimeMetrics?: boolean;
  /** Metrics collection interval in milliseconds */
  metricsInterval?: number;
  /** Maximum number of metric samples to retain */
  maxSamples?: number;
  /** Enable memory leak detection */
  enableMemoryLeakDetection?: boolean;
  /** Memory threshold for warnings (MB) */
  memoryWarningThreshold?: number;
  /** Enable performance profiling */
  enableProfiling?: boolean;
  /** Enable detailed request tracking */
  enableRequestTracking?: boolean;
}

export interface PerformanceMetrics {
  /** Total number of requests processed */
  totalRequests: number;
  /** Number of successful requests */
  successfulRequests: number;
  /** Number of failed requests */
  failedRequests: number;
  /** Average response time in milliseconds */
  averageResponseTime: number;
  /** Minimum response time in milliseconds */
  minResponseTime: number;
  /** Maximum response time in milliseconds */
  maxResponseTime: number;
  /** Requests per second */
  throughput: number;
  /** Error rate percentage */
  errorRate: number;
  /** Current memory usage in MB */
  memoryUsage: number;
  /** Peak memory usage in MB */
  peakMemoryUsage: number;
  /** CPU usage percentage */
  cpuUsage: number;
  /** Active connections count */
  activeConnections: number;
  /** Pool efficiency percentage */
  poolEfficiency: number;
  /** Cache hit rate percentage */
  cacheHitRate: number;
  /** Timestamp of last metric collection */
  timestamp: number;
}

export interface RequestMetrics {
  /** Request ID for tracking */
  requestId: string;
  /** HTTP method */
  method: string;
  /** Endpoint path */
  endpoint: string;
  /** Request start time */
  startTime: number;
  /** Request end time */
  endTime?: number;
  /** Response time in milliseconds */
  responseTime?: number;
  /** HTTP status code */
  statusCode?: number;
  /** Request size in bytes */
  requestSize?: number;
  /** Response size in bytes */
  responseSize?: number;
  /** Whether request was successful */
  success?: boolean;
  /** Error message if failed */
  error?: string;
  /** Request metadata */
  metadata?: Record<string, any>;
}

export interface MemoryMetrics {
  /** Heap used in MB */
  heapUsed: number;
  /** Heap total in MB */
  heapTotal: number;
  /** External memory in MB */
  external: number;
  /** RSS memory in MB */
  rss: number;
  /** Number of active handles */
  activeHandles: number;
  /** Number of active requests */
  activeRequests: number;
  /** Garbage collection count */
  gcCount: number;
  /** Last GC duration in milliseconds */
  lastGcDuration?: number;
}

export interface ConnectionPoolMetrics {
  /** Total connections in pool */
  totalConnections: number;
  /** Active connections */
  activeConnections: number;
  /** Idle connections */
  idleConnections: number;
  /** Maximum pool size */
  maxPoolSize: number;
  /** Connection acquisition time */
  avgAcquisitionTime: number;
  /** Connection creation count */
  connectionsCreated: number;
  /** Connection destruction count */
  connectionsDestroyed: number;
  /** Pool efficiency percentage */
  efficiency: number;
}

export interface PerformanceAlert {
  /** Alert type */
  type: 'memory' | 'cpu' | 'latency' | 'error_rate' | 'throughput';
  /** Alert severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Alert message */
  message: string;
  /** Current value that triggered alert */
  currentValue: number;
  /** Threshold that was exceeded */
  threshold: number;
  /** Timestamp when alert was triggered */
  timestamp: number;
  /** Additional context data */
  context?: Record<string, any>;
}

export interface PerformanceProfile {
  /** Profile ID */
  id: string;
  /** Profile name */
  name: string;
  /** Start time */
  startTime: number;
  /** End time */
  endTime?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** CPU samples */
  cpuProfile?: any;
  /** Memory samples */
  memoryProfile?: MemoryMetrics[];
  /** Request samples during profiling */
  requestSamples?: RequestMetrics[];
  /** Custom markers */
  markers?: Array<{ name: string; timestamp: number; data?: any }>;
}

export interface PerformanceThresholds {
  /** Maximum acceptable response time (ms) */
  maxResponseTime?: number;
  /** Maximum acceptable error rate (%) */
  maxErrorRate?: number;
  /** Maximum acceptable memory usage (MB) */
  maxMemoryUsage?: number;
  /** Maximum acceptable CPU usage (%) */
  maxCpuUsage?: number;
  /** Minimum acceptable throughput (req/s) */
  minThroughput?: number;
  /** Connection pool efficiency threshold (%) */
  minPoolEfficiency?: number;
}

export interface PerformanceReport {
  /** Report generation timestamp */
  timestamp: number;
  /** Report time period */
  period: {
    start: number;
    end: number;
    duration: number;
  };
  /** Overall performance metrics */
  summary: PerformanceMetrics;
  /** Endpoint-specific metrics */
  endpoints: Record<string, PerformanceMetrics>;
  /** Performance trends */
  trends: {
    responseTime: Array<{ timestamp: number; value: number }>;
    throughput: Array<{ timestamp: number; value: number }>;
    errorRate: Array<{ timestamp: number; value: number }>;
    memoryUsage: Array<{ timestamp: number; value: number }>;
  };
  /** Alerts generated during period */
  alerts: PerformanceAlert[];
  /** Top performing endpoints */
  topPerformers: Array<{ endpoint: string; metric: string; value: number }>;
  /** Worst performing endpoints */
  bottlenecks: Array<{ endpoint: string; metric: string; value: number }>;
  /** Recommendations for improvement */
  recommendations: string[];
}

export interface PerformanceEventEmitter {
  on(event: 'metrics', listener: (metrics: PerformanceMetrics) => void): void;
  on(event: 'alert', listener: (alert: PerformanceAlert) => void): void;
  on(event: 'request', listener: (request: RequestMetrics) => void): void;
  on(event: 'memory', listener: (memory: MemoryMetrics) => void): void;
  on(event: 'profile', listener: (profile: PerformanceProfile) => void): void;
  emit(event: string, ...args: any[]): boolean;
}