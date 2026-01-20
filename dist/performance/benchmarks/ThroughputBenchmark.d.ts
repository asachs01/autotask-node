import { EventEmitter } from 'events';
import winston from 'winston';
import { BenchmarkConfig, ThroughputResult } from '../types/BenchmarkTypes';
/**
 * Throughput benchmark implementation
 */
export declare class ThroughputBenchmark extends EventEmitter {
    private logger;
    private isRunning;
    constructor(logger: winston.Logger);
    run(config: BenchmarkConfig): Promise<ThroughputResult>;
    stop(): Promise<void>;
}
//# sourceMappingURL=ThroughputBenchmark.d.ts.map