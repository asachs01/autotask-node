/**
 * Memory Benchmark
 *
 * Comprehensive memory usage benchmarking with leak detection,
 * GC analysis, and memory pressure testing.
 */
import { EventEmitter } from 'events';
import winston from 'winston';
import { BenchmarkConfig, MemoryResult } from '../types/BenchmarkTypes';
/**
 * Memory benchmark implementation
 */
export declare class MemoryBenchmark extends EventEmitter {
    private logger;
    private isRunning;
    private samples;
    private gcEvents;
    constructor(logger: winston.Logger);
    /**
     * Run memory benchmark
     */
    run(config: BenchmarkConfig): Promise<MemoryResult>;
    /**
     * Stop the benchmark
     */
    stop(): Promise<void>;
    /**
     * Run warmup phase
     */
    private runWarmup;
    /**
     * Run main benchmark phase
     */
    private runBenchmarkPhase;
    /**
     * Run cooldown phase
     */
    private runCooldown;
    /**
     * Capture memory snapshot
     */
    private captureMemorySnapshot;
    /**
     * Calculate benchmark results
     */
    private calculateResults;
    /**
     * Detect memory leak indicators
     */
    private detectMemoryLeak;
    /**
     * Allocate test data
     */
    private allocateTestData;
    /**
     * Format bytes to human readable string
     */
    private formatBytes;
}
//# sourceMappingURL=MemoryBenchmark.d.ts.map