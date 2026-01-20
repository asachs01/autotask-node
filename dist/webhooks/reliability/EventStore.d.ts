/**
 * Event store implementation for webhook events with persistence and replay capabilities
 */
import winston from 'winston';
import { EventEmitter } from 'events';
import { WebhookEvent, WebhookHandlerResult, EventStore as IEventStore, EventStoreFilter } from '../types/WebhookTypes';
export interface EventStoreConfig {
    redis: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    };
    keyPrefix: string;
    maxEventAge: number;
    batchSize: number;
    enableCompression: boolean;
    enableIndexing: boolean;
    persistenceMode: 'memory' | 'redis' | 'hybrid';
}
export interface StoredEvent {
    id: string;
    event: WebhookEvent;
    storedAt: Date;
    expiresAt?: Date;
    processingResults?: Array<{
        handlerId: string;
        result: WebhookHandlerResult;
        processedAt: Date;
    }>;
    metadata: {
        size: number;
        compressed: boolean;
        indexed: boolean;
    };
}
export interface EventStoreMetrics {
    totalEvents: number;
    eventsPerHour: number;
    storageSize: number;
    indexSize: number;
    compressionRatio: number;
    averageEventSize: number;
    oldestEvent?: Date;
    newestEvent?: Date;
}
export interface EventIndex {
    byEntityType: Map<string, Set<string>>;
    byAction: Map<string, Set<string>>;
    byTimestamp: Map<string, Set<string>>;
    bySource: Map<string, Set<string>>;
}
export declare class EventStore extends EventEmitter implements IEventStore {
    private config;
    private logger;
    private redis?;
    private memoryStore;
    private index;
    private metrics;
    constructor(config: EventStoreConfig, logger?: winston.Logger);
    private createDefaultLogger;
    private initializeIndex;
    private initializeMetrics;
    private setupRedis;
    private setupCleanup;
    save(event: WebhookEvent): Promise<void>;
    private saveToMemory;
    private saveToRedis;
    get(eventId: string): Promise<WebhookEvent | null>;
    private getFromRedis;
    getByFilter(filter: EventStoreFilter): Promise<WebhookEvent[]>;
    private filterByIndex;
    private scanAllEvents;
    private eventMatchesFilter;
    delete(eventId: string): Promise<void>;
    markProcessed(eventId: string, result: WebhookHandlerResult): Promise<void>;
    private updateIndex;
    private removeFromIndex;
    private getEventIdsByDateRange;
    private intersect;
    private getTimestampKey;
    private parseTimestampKey;
    private getEventKey;
    private getEventMetaKey;
    private getEventProcessingKey;
    private extractEventIdFromKey;
    private serializeEvent;
    private deserializeEvent;
    private compressData;
    private decompressData;
    private updateMetrics;
    private cleanup;
    getMetrics(): EventStoreMetrics;
    getStorageInfo(): Promise<{
        totalEvents: number;
        memoryEvents: number;
        redisEvents: number;
        indexSize: number;
        storageSize: number;
    }>;
    private calculateIndexSize;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=EventStore.d.ts.map