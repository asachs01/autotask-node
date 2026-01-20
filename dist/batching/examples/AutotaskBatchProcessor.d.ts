/**
 * Example Autotask Batch Processor
 *
 * Demonstrates how to implement a batch processor for the Autotask REST API
 * that integrates with the BatchManager system.
 */
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { QueueBatch } from '../../queue/types/QueueTypes';
import { IBatchProcessor, BatchResult } from '../types';
/**
 * Batch processor implementation for Autotask API
 */
export declare class AutotaskBatchProcessor implements IBatchProcessor {
    private readonly httpClient;
    private readonly logger;
    private readonly baseUrl;
    private isHealthy;
    constructor(httpClient: AxiosInstance, baseUrl: string, logger: winston.Logger);
    /**
     * Process a batch of requests to the Autotask API
     */
    processBatch(batch: QueueBatch): Promise<BatchResult>;
    /**
     * Check if processor can handle the batch
     */
    canProcess(batch: QueueBatch): boolean;
    /**
     * Get processor health status
     */
    getHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'offline';
        message?: string;
    }>;
    /**
     * Group requests by HTTP method for batch processing
     */
    private groupRequestsByMethod;
    /**
     * Process a group of requests with the same HTTP method
     */
    private processMethodGroup;
    /**
     * Process CREATE (POST) requests
     */
    private processCreateRequests;
    /**
     * Process UPDATE (PUT/PATCH) requests
     */
    private processUpdateRequests;
    /**
     * Process QUERY (GET) requests
     */
    private processQueryRequests;
    /**
     * Process a group of query requests for the same endpoint
     */
    private processQueryGroup;
    /**
     * Check if multiple query requests can be combined
     */
    private canCombineQueries;
    /**
     * Process combined query for multiple requests
     */
    private processCombinedQuery;
    /**
     * Process query requests individually
     */
    private processIndividualQueries;
    /**
     * Process DELETE requests
     */
    private processDeleteRequests;
    /**
     * Handle Autotask API batch response
     */
    private handleBatchResponse;
    /**
     * Distribute combined query results back to individual requests
     */
    private distributeQueryResults;
    private chunkArray;
    private extractStatusCode;
    private estimateResponseSize;
    private combineQueryFilters;
    private isItemRelevantToRequest;
}
//# sourceMappingURL=AutotaskBatchProcessor.d.ts.map