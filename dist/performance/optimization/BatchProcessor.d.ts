import { EventEmitter } from 'events';
import winston from 'winston';
import { OptimizationConfig, BatchRequest, BatchResponse } from '../types/OptimizationTypes';
/**
 * Batch processor for optimizing multiple requests
 */
export declare class BatchProcessor extends EventEmitter {
    private logger;
    private config;
    private batchQueue;
    private batchTimeout?;
    private isProcessing;
    constructor(logger: winston.Logger, config: Required<OptimizationConfig>);
    start(): void;
    stop(): void;
    processRequest(request: BatchRequest): Promise<BatchResponse>;
    processBatch(requests: BatchRequest[]): Promise<BatchResponse[]>;
    private processSingleRequest;
}
//# sourceMappingURL=BatchProcessor.d.ts.map