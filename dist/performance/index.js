"use strict";
/**
 * Enterprise Performance Optimization and Benchmarking System
 *
 * This module provides comprehensive performance monitoring, optimization,
 * and benchmarking capabilities for the AutoTask SDK, designed to handle
 * enterprise workloads with thousands of entities and high-frequency operations.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadTester = exports.MemoryBenchmark = exports.LatencyBenchmark = exports.ThroughputBenchmark = exports.BenchmarkSuite = exports.CompressionManager = exports.RequestDeduplicator = exports.BatchProcessor = exports.RequestOptimizer = exports.IntelligentCache = exports.ConnectionPoolMonitor = exports.MemoryTracker = exports.MetricsCollector = exports.PerformanceMonitor = void 0;
var PerformanceMonitor_1 = require("./monitoring/PerformanceMonitor");
Object.defineProperty(exports, "PerformanceMonitor", { enumerable: true, get: function () { return PerformanceMonitor_1.PerformanceMonitor; } });
var MetricsCollector_1 = require("./monitoring/MetricsCollector");
Object.defineProperty(exports, "MetricsCollector", { enumerable: true, get: function () { return MetricsCollector_1.MetricsCollector; } });
var MemoryTracker_1 = require("./monitoring/MemoryTracker");
Object.defineProperty(exports, "MemoryTracker", { enumerable: true, get: function () { return MemoryTracker_1.MemoryTracker; } });
var ConnectionPoolMonitor_1 = require("./monitoring/ConnectionPoolMonitor");
Object.defineProperty(exports, "ConnectionPoolMonitor", { enumerable: true, get: function () { return ConnectionPoolMonitor_1.ConnectionPoolMonitor; } });
var IntelligentCache_1 = require("./caching/IntelligentCache");
Object.defineProperty(exports, "IntelligentCache", { enumerable: true, get: function () { return IntelligentCache_1.IntelligentCache; } });
var RequestOptimizer_1 = require("./optimization/RequestOptimizer");
Object.defineProperty(exports, "RequestOptimizer", { enumerable: true, get: function () { return RequestOptimizer_1.RequestOptimizer; } });
var BatchProcessor_1 = require("./optimization/BatchProcessor");
Object.defineProperty(exports, "BatchProcessor", { enumerable: true, get: function () { return BatchProcessor_1.BatchProcessor; } });
var RequestDeduplicator_1 = require("./optimization/RequestDeduplicator");
Object.defineProperty(exports, "RequestDeduplicator", { enumerable: true, get: function () { return RequestDeduplicator_1.RequestDeduplicator; } });
var CompressionManager_1 = require("./optimization/CompressionManager");
Object.defineProperty(exports, "CompressionManager", { enumerable: true, get: function () { return CompressionManager_1.CompressionManager; } });
var BenchmarkSuite_1 = require("./benchmarks/BenchmarkSuite");
Object.defineProperty(exports, "BenchmarkSuite", { enumerable: true, get: function () { return BenchmarkSuite_1.BenchmarkSuite; } });
var ThroughputBenchmark_1 = require("./benchmarks/ThroughputBenchmark");
Object.defineProperty(exports, "ThroughputBenchmark", { enumerable: true, get: function () { return ThroughputBenchmark_1.ThroughputBenchmark; } });
var LatencyBenchmark_1 = require("./benchmarks/LatencyBenchmark");
Object.defineProperty(exports, "LatencyBenchmark", { enumerable: true, get: function () { return LatencyBenchmark_1.LatencyBenchmark; } });
var MemoryBenchmark_1 = require("./benchmarks/MemoryBenchmark");
Object.defineProperty(exports, "MemoryBenchmark", { enumerable: true, get: function () { return MemoryBenchmark_1.MemoryBenchmark; } });
var LoadTester_1 = require("./benchmarks/LoadTester");
Object.defineProperty(exports, "LoadTester", { enumerable: true, get: function () { return LoadTester_1.LoadTester; } });
// Streaming components (to be implemented)
// export { StreamProcessor } from './streaming/StreamProcessor';
// export { LazyLoader } from './streaming/LazyLoader';
// export { PaginationOptimizer } from './streaming/PaginationOptimizer';
__exportStar(require("./types/PerformanceTypes"), exports);
__exportStar(require("./types/CacheTypes"), exports);
__exportStar(require("./types/OptimizationTypes"), exports);
__exportStar(require("./types/BenchmarkTypes"), exports);
//# sourceMappingURL=index.js.map