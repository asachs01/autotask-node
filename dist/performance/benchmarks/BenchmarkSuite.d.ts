import { EventEmitter } from 'events';
import winston from 'winston';
import { BenchmarkConfig, LoadTestResult, BenchmarkComparison, BenchmarkProfile, PerformanceRegression } from '../types/BenchmarkTypes';
/**
 * Comprehensive benchmarking suite for enterprise performance testing
 *
 * Orchestrates throughput, latency, memory, and load testing with
 * detailed analysis and regression detection capabilities.
 */
export declare class BenchmarkSuite extends EventEmitter {
    private logger;
    private readonly throughputBenchmark;
    private readonly latencyBenchmark;
    private readonly memoryBenchmark;
    private readonly loadTester;
    private benchmarkHistory;
    private isRunning;
    private currentBenchmark?;
    constructor(logger: winston.Logger);
    /**
     * Run comprehensive benchmark suite
     */
    runBenchmark(config: BenchmarkConfig): Promise<LoadTestResult>;
    /**
     * Run benchmarks using a predefined profile
     */
    runProfile(profile: BenchmarkProfile): Promise<LoadTestResult>;
    /**
     * Compare two benchmark results
     */
    compareBenchmarks(baselineId: string, currentId: string): BenchmarkComparison | null;
    /**
     * Get benchmark history
     */
    getBenchmarkHistory(): LoadTestResult[];
    /**
     * Get current benchmark progress
     */
    getCurrentProgress(): {
        isRunning: boolean;
        progress: number;
        phase?: string;
        config?: BenchmarkConfig;
    };
    /**
     * Stop current benchmark
     */
    stopBenchmark(): Promise<void>;
    /**
     * Get performance recommendations based on latest results
     */
    getPerformanceRecommendations(): {
        critical: string[];
        major: string[];
        minor: string[];
        optimizations: string[];
    };
    /**
     * Detect performance regressions
     */
    detectRegressions(currentResult: LoadTestResult): PerformanceRegression[];
    private setupEventHandlers;
    private runWarmup;
    private updateProgress;
    private createScenariosFromProfile;
    private createSyntheticLoadTestResult;
    private createBenchmarkComparison;
    private calculatePercentageChange;
    private getSignificance;
    private calculateConfidence;
    private trimHistory;
}
//# sourceMappingURL=BenchmarkSuite.d.ts.map