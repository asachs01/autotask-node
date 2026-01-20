import { EventEmitter } from 'events';
import winston from 'winston';
import { BenchmarkConfig, LoadTestResult } from '../types/BenchmarkTypes';
/**
 * Load testing implementation for concurrent user simulation
 */
export declare class LoadTester extends EventEmitter {
    private logger;
    private isRunning;
    constructor(logger: winston.Logger);
    runLoadTest(config: BenchmarkConfig): Promise<LoadTestResult>;
    stop(): Promise<void>;
    private executeLoadTest;
    private runWorker;
}
//# sourceMappingURL=LoadTester.d.ts.map