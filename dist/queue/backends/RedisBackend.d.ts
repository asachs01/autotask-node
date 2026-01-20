/**
 * Redis Storage Backend
 *
 * Distributed queue storage using Redis for high-performance
 * and scalable queue operations across multiple instances.
 */
import winston from 'winston';
import { QueueRequest, QueueBatch, QueueMetrics, QueueFilter, QueueStorageBackend } from '../types/QueueTypes';
interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    maxRetriesPerRequest?: number;
    retryDelayOnFailover?: number;
}
export declare class RedisBackend implements QueueStorageBackend {
    private logger;
    private redis;
    private config;
    private keyPrefix;
    private keys;
    constructor(config: Partial<RedisConfig> | undefined, logger: winston.Logger);
    initialize(): Promise<void>;
    enqueue(request: QueueRequest): Promise<void>;
    dequeue(zone?: string): Promise<QueueRequest | null>;
    peek(zone?: string): Promise<QueueRequest | null>;
    updateRequest(id: string, updates: Partial<QueueRequest>): Promise<void>;
    remove(id: string): Promise<boolean>;
    getRequest(id: string): Promise<QueueRequest | null>;
    getRequests(filter: QueueFilter): Promise<QueueRequest[]>;
    size(zone?: string): Promise<number>;
    clear(zone?: string): Promise<number>;
    storeBatch(batch: QueueBatch): Promise<void>;
    getReadyBatches(): Promise<QueueBatch[]>;
    updateBatch(id: string, updates: Partial<QueueBatch>): Promise<void>;
    getMetrics(): Promise<QueueMetrics>;
    maintenance(): Promise<void>;
    close(): Promise<void>;
    /**
     * Load Lua scripts for atomic operations
     */
    private loadLuaScripts;
    /**
     * Parse Redis hash data into QueueRequest
     */
    private parseRedisData;
    /**
     * Parse Redis hash data into QueueBatch
     */
    private parseBatchData;
}
export {};
//# sourceMappingURL=RedisBackend.d.ts.map