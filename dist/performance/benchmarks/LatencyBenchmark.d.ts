import { EventEmitter } from 'events';
import winston from 'winston';
import { BenchmarkConfig, LatencyResult } from '../types/BenchmarkTypes';
/**
 * Latency benchmark implementation
 */
export declare class LatencyBenchmark extends EventEmitter {
    private logger;
    private isRunning;
    constructor(logger: winston.Logger);
    run(config: BenchmarkConfig): Promise<LatencyResult>;
    stop(): Promise<void>;
    private calculatePercentile;
    private calculateStandardDeviation;
    private calculateDistribution;
}
//# sourceMappingURL=LatencyBenchmark.d.ts.map