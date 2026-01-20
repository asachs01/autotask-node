/**
 * In-Memory Storage Backend
 *
 * Fast in-memory queue storage for development and testing.
 * Provides full QueueStorageBackend implementation without external dependencies.
 */
import winston from 'winston';
import { QueueRequest, QueueBatch, QueueMetrics, QueueFilter, QueueStorageBackend } from '../types/QueueTypes';
/**
 * In-memory queue storage backend
 */
export declare class MemoryBackend implements QueueStorageBackend {
    private logger;
    private requests;
    private batches;
    private priorityQueues;
    private statusIndexes;
    private zoneIndexes;
    private fingerprintMap;
    private initialized;
    constructor(logger: winston.Logger);
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
    private initializeIndexes;
    private getQueueKey;
    private addToStatusIndex;
    private removeFromStatusIndex;
    private addToZoneIndex;
    private removeFromZoneIndex;
}
//# sourceMappingURL=MemoryBackend.d.ts.map