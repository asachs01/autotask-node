import { EventEmitter } from 'events';
import winston from 'winston';
import { OptimizationConfig, BatchResponse, CompressionResult } from '../types/OptimizationTypes';
/**
 * Response compression management system
 */
export declare class CompressionManager extends EventEmitter {
    private logger;
    private config;
    constructor(logger: winston.Logger, config: Required<OptimizationConfig>);
    compressResponse(response: BatchResponse): Promise<CompressionResult>;
}
//# sourceMappingURL=CompressionManager.d.ts.map