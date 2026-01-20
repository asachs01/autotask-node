import { EventEmitter } from 'events';
import winston from 'winston';
import { OptimizationConfig, BatchRequest, BatchResponse } from '../types/OptimizationTypes';
/**
 * Request deduplication system
 */
export declare class RequestDeduplicator extends EventEmitter {
    private logger;
    private config;
    private cache;
    constructor(logger: winston.Logger, config: Required<OptimizationConfig>);
    checkDuplication(request: BatchRequest): Promise<BatchResponse | null>;
    private generateRequestHash;
}
//# sourceMappingURL=RequestDeduplicator.d.ts.map