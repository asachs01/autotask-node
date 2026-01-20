"use strict";
/**
 * Memory Benchmark
 *
 * Comprehensive memory usage benchmarking with leak detection,
 * GC analysis, and memory pressure testing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryBenchmark = void 0;
const events_1 = require("events");
/**
 * Memory benchmark implementation
 */
class MemoryBenchmark extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.isRunning = false;
        this.samples = [];
        this.gcEvents = [];
        this.logger = logger;
    }
    /**
     * Run memory benchmark
     */
    async run(config) {
        if (this.isRunning) {
            throw new Error('Memory benchmark is already running');
        }
        this.isRunning = true;
        this.samples = [];
        this.gcEvents = [];
        this.logger.info('Starting memory benchmark', {
            iterations: config.iterations || 1000,
        });
        try {
            const startTime = Date.now();
            const initialMemory = this.captureMemorySnapshot();
            // Warm-up phase
            await this.runWarmup(config);
            // Main benchmark phase
            await this.runBenchmarkPhase(config);
            // Cool-down phase
            await this.runCooldown();
            const endTime = Date.now();
            const finalMemory = this.captureMemorySnapshot();
            // Calculate results
            const result = this.calculateResults(initialMemory, finalMemory, endTime - startTime);
            this.logger.info('Memory benchmark completed', {
                duration: endTime - startTime,
                peakUsage: result.peakUsage,
                growthRate: result.growthRate,
            });
            this.emit('benchmark_completed', result);
            return result;
        }
        catch (error) {
            this.logger.error('Memory benchmark error', { error });
            throw error;
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * Stop the benchmark
     */
    async stop() {
        this.isRunning = false;
        this.logger.info('Memory benchmark stopped');
    }
    /**
     * Run warmup phase
     */
    async runWarmup(config) {
        const warmupIterations = config.warmupIterations || Math.floor((config.iterations || 100) * 0.1);
        this.logger.debug('Running memory warmup', {
            iterations: warmupIterations,
        });
        // Allocate and release some memory to stabilize
        for (let i = 0; i < warmupIterations; i++) {
            const data = this.allocateTestData();
            this.captureMemorySnapshot();
            // Allow GC to clean up
            await new Promise(resolve => setImmediate(resolve));
        }
        // Force GC if available
        if (global.gc) {
            global.gc();
        }
    }
    /**
     * Run main benchmark phase
     */
    async runBenchmarkPhase(config) {
        const iterations = config.iterations || 1000;
        const sampleInterval = 10; // Sample every 10 iterations
        this.logger.debug('Running memory benchmark phase', { iterations });
        const allocations = [];
        for (let i = 0; i < iterations; i++) {
            // Simulate memory usage patterns
            if (i % 3 === 0) {
                // Allocate memory
                allocations.push(this.allocateTestData());
            }
            if (i % 5 === 0 && allocations.length > 0) {
                // Release some memory
                allocations.shift();
            }
            // Capture memory snapshot periodically
            if (i % sampleInterval === 0) {
                this.captureMemorySnapshot();
            }
            // Emit progress
            if (i % 100 === 0) {
                const progress = (i / iterations) * 100;
                this.emit('progress', progress);
            }
            // Allow event loop to process
            if (i % 50 === 0) {
                await new Promise(resolve => setImmediate(resolve));
            }
        }
        // Clear allocations
        allocations.length = 0;
    }
    /**
     * Run cooldown phase
     */
    async runCooldown() {
        this.logger.debug('Running memory cooldown');
        // Allow GC to run
        if (global.gc) {
            const beforeGC = this.captureMemorySnapshot();
            global.gc();
            const afterGC = this.captureMemorySnapshot();
            this.logger.debug('GC cleanup', {
                before: this.formatBytes(beforeGC.heapUsed),
                after: this.formatBytes(afterGC.heapUsed),
                freed: this.formatBytes(beforeGC.heapUsed - afterGC.heapUsed),
            });
        }
        // Wait for stabilization
        await new Promise(resolve => setTimeout(resolve, 100));
        this.captureMemorySnapshot();
    }
    /**
     * Capture memory snapshot
     */
    captureMemorySnapshot() {
        const mem = process.memoryUsage();
        const snapshot = {
            timestamp: Date.now(),
            heapUsed: mem.heapUsed,
            heapTotal: mem.heapTotal,
            rss: mem.rss,
            external: mem.external,
        };
        this.samples.push(snapshot);
        return snapshot;
    }
    /**
     * Calculate benchmark results
     */
    calculateResults(initialMemory, finalMemory, durationMs) {
        const toMB = (bytes) => bytes / (1024 * 1024);
        // Find peak usage
        const peakUsage = Math.max(...this.samples.map(s => toMB(s.heapUsed)));
        // Calculate average usage
        const averageUsage = this.samples.length > 0
            ? this.samples.reduce((sum, s) => sum + toMB(s.heapUsed), 0) /
                this.samples.length
            : 0;
        // Calculate growth rate (MB per minute)
        const durationMinutes = durationMs / 60000;
        const growthRate = durationMinutes > 0
            ? (toMB(finalMemory.heapUsed) - toMB(initialMemory.heapUsed)) /
                durationMinutes
            : 0;
        // Calculate GC statistics
        const gcStats = {
            count: this.gcEvents.length,
            totalTime: this.gcEvents.reduce((sum, e) => sum + e.duration, 0),
            averageTime: this.gcEvents.length > 0
                ? this.gcEvents.reduce((sum, e) => sum + e.duration, 0) /
                    this.gcEvents.length
                : 0,
            maxTime: this.gcEvents.length > 0
                ? Math.max(...this.gcEvents.map(e => e.duration))
                : 0,
        };
        // Build timeline
        const timeline = this.samples.map(s => ({
            timestamp: s.timestamp,
            heapUsed: toMB(s.heapUsed),
            heapTotal: toMB(s.heapTotal),
            rss: toMB(s.rss),
        }));
        // Detect memory leak indicators
        const leakIndicators = this.detectMemoryLeak(growthRate);
        return {
            initialUsage: toMB(initialMemory.heapUsed),
            peakUsage,
            finalUsage: toMB(finalMemory.heapUsed),
            averageUsage,
            growthRate,
            gcStats,
            timeline,
            leakIndicators,
        };
    }
    /**
     * Detect memory leak indicators
     */
    detectMemoryLeak(growthRate) {
        if (this.samples.length < 10) {
            return {
                suspected: false,
                growthTrend: 'stable',
                confidence: 0,
            };
        }
        // Analyze trend using linear regression
        const recentSamples = this.samples.slice(-20);
        const midPoint = Math.floor(recentSamples.length / 2);
        const firstHalf = recentSamples.slice(0, midPoint);
        const secondHalf = recentSamples.slice(midPoint);
        const avgFirst = firstHalf.reduce((sum, s) => sum + s.heapUsed, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((sum, s) => sum + s.heapUsed, 0) / secondHalf.length;
        const trendDiff = avgSecond - avgFirst;
        const trendPercent = (trendDiff / avgFirst) * 100;
        let growthTrend;
        if (trendPercent > 5) {
            growthTrend = 'growing';
        }
        else if (trendPercent < -5) {
            growthTrend = 'declining';
        }
        else {
            growthTrend = 'stable';
        }
        // Memory leak threshold: 1 MB/minute
        const leakThreshold = 1.0;
        const confidence = Math.min(Math.abs(growthRate) / leakThreshold, 1.0);
        const suspected = growthTrend === 'growing' && growthRate > leakThreshold;
        return {
            suspected,
            growthTrend,
            confidence,
        };
    }
    /**
     * Allocate test data
     */
    allocateTestData() {
        // Allocate various types of data structures
        return {
            buffer: Buffer.alloc(1024), // 1KB buffer
            array: new Array(100).fill(Math.random()),
            object: {
                timestamp: Date.now(),
                data: new Array(50).fill(null).map(() => ({
                    id: Math.random().toString(36),
                    value: Math.random() * 1000,
                })),
            },
            map: new Map(new Array(50).fill(null).map((_, i) => [i, Math.random()])),
            set: new Set(new Array(50).fill(null).map(() => Math.random())),
        };
    }
    /**
     * Format bytes to human readable string
     */
    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }
        return `${value.toFixed(2)} ${units[unitIndex]}`;
    }
}
exports.MemoryBenchmark = MemoryBenchmark;
//# sourceMappingURL=MemoryBenchmark.js.map