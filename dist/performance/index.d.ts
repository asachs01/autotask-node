/**
 * Enterprise Performance Optimization and Benchmarking System
 *
 * This module provides comprehensive performance monitoring, optimization,
 * and benchmarking capabilities for the AutoTask SDK, designed to handle
 * enterprise workloads with thousands of entities and high-frequency operations.
 */
export { PerformanceMonitor } from './monitoring/PerformanceMonitor';
export { MetricsCollector } from './monitoring/MetricsCollector';
export { MemoryTracker } from './monitoring/MemoryTracker';
export { ConnectionPoolMonitor } from './monitoring/ConnectionPoolMonitor';
export { IntelligentCache } from './caching/IntelligentCache';
export { RequestOptimizer } from './optimization/RequestOptimizer';
export { BatchProcessor } from './optimization/BatchProcessor';
export { RequestDeduplicator } from './optimization/RequestDeduplicator';
export { CompressionManager } from './optimization/CompressionManager';
export { BenchmarkSuite } from './benchmarks/BenchmarkSuite';
export { ThroughputBenchmark } from './benchmarks/ThroughputBenchmark';
export { LatencyBenchmark } from './benchmarks/LatencyBenchmark';
export { MemoryBenchmark } from './benchmarks/MemoryBenchmark';
export { LoadTester } from './benchmarks/LoadTester';
export * from './types/PerformanceTypes';
export * from './types/CacheTypes';
export * from './types/OptimizationTypes';
export * from './types/BenchmarkTypes';
//# sourceMappingURL=index.d.ts.map