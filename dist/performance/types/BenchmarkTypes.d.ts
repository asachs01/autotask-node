/**
 * Benchmarking and load testing types
 */
export interface BenchmarkConfig {
    /** Benchmark name */
    name: string;
    /** Benchmark description */
    description?: string;
    /** Number of iterations to run */
    iterations?: number;
    /** Warm-up iterations */
    warmupIterations?: number;
    /** Maximum duration in milliseconds */
    maxDuration?: number;
    /** Concurrent users/threads */
    concurrency?: number;
    /** Ramp-up duration in milliseconds */
    rampUpDuration?: number;
    /** Cool-down duration in milliseconds */
    coolDownDuration?: number;
    /** Target entities to benchmark */
    targetEntities?: string[];
    /** Custom test scenarios */
    scenarios?: BenchmarkScenario[];
}
export interface BenchmarkScenario {
    /** Scenario name */
    name: string;
    /** Scenario weight (for mixed load testing) */
    weight?: number;
    /** Operations to perform */
    operations: BenchmarkOperation[];
    /** User simulation parameters */
    userSimulation?: {
        thinkTime: number;
        thinkTimeVariation: number;
        sessionDuration: number;
    };
    /** Data setup requirements */
    dataSetup?: {
        entityType: string;
        recordCount: number;
        dataGenerator?: () => any;
    };
}
export interface BenchmarkOperation {
    /** Operation type */
    type: 'list' | 'get' | 'create' | 'update' | 'delete' | 'search' | 'bulk';
    /** Entity type */
    entityType: string;
    /** Operation parameters */
    parameters?: Record<string, any>;
    /** Expected response characteristics */
    expectations?: {
        maxResponseTime?: number;
        maxErrorRate?: number;
        minThroughput?: number;
    };
    /** Operation weight in scenario */
    weight?: number;
}
export interface ThroughputResult {
    /** Requests per second */
    requestsPerSecond: number;
    /** Entities per second */
    entitiesPerSecond: number;
    /** Operations per second */
    operationsPerSecond: number;
    /** Peak throughput achieved */
    peakThroughput: number;
    /** Average throughput */
    averageThroughput: number;
    /** Throughput percentiles */
    percentiles: {
        p50: number;
        p90: number;
        p95: number;
        p99: number;
    };
    /** Throughput over time */
    timeline: Array<{
        timestamp: number;
        throughput: number;
    }>;
}
export interface LatencyResult {
    /** Average response time in milliseconds */
    average: number;
    /** Minimum response time */
    minimum: number;
    /** Maximum response time */
    maximum: number;
    /** Standard deviation */
    standardDeviation: number;
    /** Response time percentiles */
    percentiles: {
        p50: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
        p99_9: number;
    };
    /** Response time distribution */
    distribution: Array<{
        range: string;
        count: number;
        percentage: number;
    }>;
    /** Latency over time */
    timeline: Array<{
        timestamp: number;
        latency: number;
    }>;
}
export interface MemoryResult {
    /** Initial memory usage in MB */
    initialUsage: number;
    /** Peak memory usage in MB */
    peakUsage: number;
    /** Final memory usage in MB */
    finalUsage: number;
    /** Average memory usage */
    averageUsage: number;
    /** Memory growth rate (MB/minute) */
    growthRate: number;
    /** Garbage collection statistics */
    gcStats: {
        count: number;
        totalTime: number;
        averageTime: number;
        maxTime: number;
    };
    /** Memory usage timeline */
    timeline: Array<{
        timestamp: number;
        heapUsed: number;
        heapTotal: number;
        rss: number;
    }>;
    /** Memory leak indicators */
    leakIndicators: {
        suspected: boolean;
        growthTrend: 'stable' | 'growing' | 'declining';
        confidence: number;
    };
}
export interface LoadTestResult {
    /** Test configuration used */
    config: BenchmarkConfig;
    /** Test execution summary */
    summary: {
        startTime: number;
        endTime: number;
        duration: number;
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        errorRate: number;
    };
    /** Performance results */
    performance: {
        throughput: ThroughputResult;
        latency: LatencyResult;
        memory: MemoryResult;
    };
    /** Per-endpoint results */
    endpoints: Record<string, {
        throughput: ThroughputResult;
        latency: LatencyResult;
        errorRate: number;
    }>;
    /** Concurrent user simulation results */
    concurrency: {
        targetUsers: number;
        actualUsers: number;
        userRampUp: Array<{
            timestamp: number;
            activeUsers: number;
        }>;
        userSessions: Array<{
            sessionId: string;
            duration: number;
            requests: number;
            errors: number;
        }>;
    };
    /** Resource utilization during test */
    resourceUtilization: {
        cpu: Array<{
            timestamp: number;
            usage: number;
        }>;
        memory: Array<{
            timestamp: number;
            usage: number;
        }>;
        network: Array<{
            timestamp: number;
            bytesIn: number;
            bytesOut: number;
        }>;
        connections: Array<{
            timestamp: number;
            active: number;
            idle: number;
        }>;
    };
    /** Errors encountered */
    errors: Array<{
        timestamp: number;
        type: string;
        message: string;
        endpoint: string;
        count: number;
    }>;
    /** Performance recommendations */
    recommendations: string[];
}
export interface BenchmarkComparison {
    /** Baseline benchmark result */
    baseline: LoadTestResult;
    /** Current benchmark result */
    current: LoadTestResult;
    /** Performance changes */
    changes: {
        throughput: {
            absolute: number;
            percentage: number;
            significance: 'improved' | 'degraded' | 'unchanged';
        };
        latency: {
            average: {
                absolute: number;
                percentage: number;
            };
            p95: {
                absolute: number;
                percentage: number;
            };
            p99: {
                absolute: number;
                percentage: number;
            };
            significance: 'improved' | 'degraded' | 'unchanged';
        };
        memory: {
            peak: {
                absolute: number;
                percentage: number;
            };
            average: {
                absolute: number;
                percentage: number;
            };
            growthRate: {
                absolute: number;
                percentage: number;
            };
            significance: 'improved' | 'degraded' | 'unchanged';
        };
        errorRate: {
            absolute: number;
            percentage: number;
            significance: 'improved' | 'degraded' | 'unchanged';
        };
    };
    /** Overall performance verdict */
    verdict: 'significant_improvement' | 'improvement' | 'regression' | 'significant_regression' | 'no_change';
    /** Confidence level in results */
    confidence: number;
}
export interface BenchmarkProfile {
    /** Profile name */
    name: string;
    /** Entity types to benchmark */
    entityTypes: string[];
    /** Operations mix */
    operationsMix: Record<string, number>;
    /** Load characteristics */
    loadCharacteristics: {
        baseLoad: number;
        peakLoad: number;
        loadPattern: 'constant' | 'ramp_up' | 'spike' | 'sine_wave';
        duration: number;
    };
    /** Data characteristics */
    dataCharacteristics: {
        recordSizes: 'small' | 'medium' | 'large' | 'mixed';
        relationshipDepth: number;
        dataVariation: number;
    };
    /** Performance expectations */
    expectations: {
        maxResponseTime: number;
        minThroughput: number;
        maxErrorRate: number;
        maxMemoryUsage: number;
    };
}
export interface PerformanceRegression {
    /** Regression type */
    type: 'throughput' | 'latency' | 'memory' | 'error_rate';
    /** Severity level */
    severity: 'minor' | 'major' | 'critical';
    /** Detection timestamp */
    detectedAt: number;
    /** Affected components */
    affectedComponents: string[];
    /** Performance impact */
    impact: {
        throughputDrop?: number;
        latencyIncrease?: number;
        memoryIncrease?: number;
        errorRateIncrease?: number;
    };
    /** Potential causes */
    potentialCauses: string[];
    /** Recommended actions */
    recommendedActions: string[];
    /** Related metrics */
    relatedMetrics: Record<string, number>;
}
//# sourceMappingURL=BenchmarkTypes.d.ts.map