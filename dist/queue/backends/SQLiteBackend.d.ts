/**
 * SQLite Storage Backend
 *
 * Persistent queue storage using SQLite database.
 * Provides data persistence across restarts with excellent performance
 * and ACID transactions for reliability.
 */
import winston from 'winston';
import { QueueRequest, QueueBatch, QueueMetrics, QueueFilter, QueueStorageBackend, QueuePersistenceConfig } from '../types/QueueTypes';
export declare class SQLiteBackend implements QueueStorageBackend {
    private logger;
    private db;
    private dbPath;
    private options;
    private metricsCache;
    private lastMetricsUpdate;
    constructor(dbPath: string, options: QueuePersistenceConfig['options'], logger: winston.Logger);
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
     * Create database tables
     */
    private createTables;
    /**
     * Create database indexes
     */
    private createIndexes;
    /**
     * Convert database row to QueueRequest
     */
    private dbRowToRequest;
    /**
     * Map sort fields to database columns
     */
    private mapSortField;
    /**
     * Invalidate metrics cache
     */
    private invalidateMetricsCache;
}
//# sourceMappingURL=SQLiteBackend.d.ts.map