/**
 * Example Autotask Batch Processor
 * 
 * Demonstrates how to implement a batch processor for the Autotask REST API
 * that integrates with the BatchManager system.
 */

import { AxiosInstance } from 'axios';
import winston from 'winston';
import { QueueBatch } from '../../queue/types/QueueTypes';
import { IBatchProcessor, BatchResult, BatchRequest } from '../types';
import { BatchResultBuilder } from '../BatchResult';

/**
 * Autotask API response structure
 */
interface AutotaskResponse {
  items?: any[];
  errors?: Array<{
    message: string;
    field?: string;
    resourceId?: string;
  }>;
  pageDetails?: {
    count: number;
    requestCount: number;
    prevPageUrl?: string;
    nextPageUrl?: string;
  };
}

/**
 * Batch processor implementation for Autotask API
 */
export class AutotaskBatchProcessor implements IBatchProcessor {
  private readonly httpClient: AxiosInstance;
  private readonly logger: winston.Logger;
  private readonly baseUrl: string;
  private isHealthy = true;
  
  constructor(httpClient: AxiosInstance, baseUrl: string, logger: winston.Logger) {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
    this.logger = logger;
  }
  
  /**
   * Process a batch of requests to the Autotask API
   */
  async processBatch(batch: QueueBatch): Promise<BatchResult> {
    const startTime = Date.now();
    const resultBuilder = new BatchResultBuilder(batch.id, 'autotask-api');
    
    this.logger.info('Processing Autotask batch', {
      batchId: batch.id,
      size: batch.requests.length,
      endpoint: batch.endpoint,
      zone: batch.zone
    });
    
    try {
      // Group requests by HTTP method for efficient processing
      const methodGroups = this.groupRequestsByMethod(batch);
      
      // Process each method group
      for (const [method, requests] of methodGroups) {
        await this.processMethodGroup(method, requests, resultBuilder);
      }
      
      // Handle any optimizations that were applied
      if (batch.metadata.optimization) {
        resultBuilder.setOptimizations(batch.metadata.optimization.optimizations || []);
      }
      
      const result = resultBuilder.build();
      
      this.logger.info('Autotask batch processed', {
        batchId: batch.id,
        totalRequests: result.results.length,
        successfulRequests: result.results.filter(r => r.success).length,
        processingTime: result.metadata.processingTime,
        successRate: result.metadata.successRate
      });
      
      return result;
      
    } catch (error) {
      this.logger.error('Autotask batch processing failed', {
        batchId: batch.id,
        error: error instanceof Error ? error.message : error,
        processingTime: Date.now() - startTime
      });
      
      // Mark all requests as failed
      for (const request of batch.requests) {
        resultBuilder.addFailure(
          request.id,
          error as Error,
          500,
          (Date.now() - startTime) / batch.requests.length
        );
      }
      
      return resultBuilder.build();
    }
  }
  
  /**
   * Check if processor can handle the batch
   */
  canProcess(batch: QueueBatch): boolean {
    // Check if this is an Autotask API endpoint
    if (!batch.endpoint.startsWith('/')) {
      return false;
    }
    
    // Check if we have a valid zone
    if (!batch.zone || batch.zone.length === 0) {
      return false;
    }
    
    // Check supported methods
    const supportedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const hasValidMethods = batch.requests.every(req => 
      supportedMethods.includes(req.method)
    );
    
    return hasValidMethods && this.isHealthy;
  }
  
  /**
   * Get processor health status
   */
  async getHealth(): Promise<{ 
    status: 'healthy' | 'degraded' | 'offline'; 
    message?: string 
  }> {
    try {
      // Perform a simple health check API call
      const response = await this.httpClient.get('/version', {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 200) {
        this.isHealthy = true;
        return { status: 'healthy' };
      } else {
        this.isHealthy = false;
        return { 
          status: 'degraded', 
          message: `API returned status ${response.status}` 
        };
      }
      
    } catch (error) {
      this.isHealthy = false;
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          return { 
            status: 'degraded', 
            message: 'API timeout - performance degraded' 
          };
        } else if (error.message.includes('ECONNREFUSED') || 
                   error.message.includes('ENOTFOUND')) {
          return { 
            status: 'offline', 
            message: 'Cannot connect to Autotask API' 
          };
        }
      }
      
      return { 
        status: 'offline', 
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  /**
   * Group requests by HTTP method for batch processing
   */
  private groupRequestsByMethod(batch: QueueBatch): Map<string, BatchRequest[]> {
    const groups = new Map<string, BatchRequest[]>();
    
    for (const request of batch.requests) {
      // Type assertion: assumes all requests in batch are batchable
      const batchRequest = request as BatchRequest;
      const key = request.method;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(batchRequest);
    }
    
    return groups;
  }
  
  /**
   * Process a group of requests with the same HTTP method
   */
  private async processMethodGroup(
    method: string,
    requests: BatchRequest[],
    resultBuilder: BatchResultBuilder
  ): Promise<void> {
    switch (method.toLowerCase()) {
      case 'post':
        await this.processCreateRequests(requests, resultBuilder);
        break;
      case 'put':
      case 'patch':
        await this.processUpdateRequests(requests, resultBuilder);
        break;
      case 'get':
        await this.processQueryRequests(requests, resultBuilder);
        break;
      case 'delete':
        await this.processDeleteRequests(requests, resultBuilder);
        break;
      default:
        // Unsupported method - mark all as failed
        for (const request of requests) {
          resultBuilder.addFailure(
            request.id,
            new Error(`Unsupported HTTP method: ${method}`),
            400,
            0
          );
        }
    }
  }
  
  /**
   * Process CREATE (POST) requests
   */
  private async processCreateRequests(
    requests: any[],
    resultBuilder: BatchResultBuilder
  ): Promise<void> {
    if (requests.length === 0) return;
    
    const firstRequest = requests[0];
    const endpoint = firstRequest.endpoint;
    
    try {
      // For Autotask, we can batch multiple CREATE operations
      const batchData = requests.map(req => req.data);
      
      const startTime = Date.now();
      const response = await this.httpClient.post(endpoint, batchData);
      const processingTime = Date.now() - startTime;
      
      this.handleBatchResponse(
        response.data as AutotaskResponse,
        requests,
        resultBuilder,
        processingTime / requests.length
      );
      
    } catch (error) {
      this.logger.error('Batch CREATE operation failed', {
        endpoint,
        requestCount: requests.length,
        error: error instanceof Error ? error.message : error
      });
      
      // Mark all requests as failed
      const avgProcessingTime = 100; // Estimate for failed request
      for (const request of requests) {
        resultBuilder.addFailure(
          request.id,
          error as Error,
          this.extractStatusCode(error),
          avgProcessingTime
        );
      }
    }
  }
  
  /**
   * Process UPDATE (PUT/PATCH) requests
   */
  private async processUpdateRequests(
    requests: any[],
    resultBuilder: BatchResultBuilder
  ): Promise<void> {
    // Update operations typically need to be processed individually
    // as they target specific resource IDs
    
    const concurrentLimit = 5; // Process up to 5 updates concurrently
    const chunks = this.chunkArray(requests, concurrentLimit);
    
    for (const chunk of chunks) {
      const updatePromises = chunk.map(async (request) => {
        const startTime = Date.now();
        
        try {
          const response = await this.httpClient.put(
            `${request.endpoint}/${request.data.id}`,
            request.data
          );
          
          const processingTime = Date.now() - startTime;
          const responseSize = this.estimateResponseSize(response.data);
          
          resultBuilder.addSuccess(
            request.id,
            response.data,
            response.status,
            processingTime,
            responseSize
          );
          
        } catch (error) {
          const processingTime = Date.now() - startTime;
          
          resultBuilder.addFailure(
            request.id,
            error as Error,
            this.extractStatusCode(error),
            processingTime
          );
        }
      });
      
      // Wait for current chunk to complete before processing next chunk
      await Promise.all(updatePromises);
    }
  }
  
  /**
   * Process QUERY (GET) requests
   */
  private async processQueryRequests(
    requests: any[],
    resultBuilder: BatchResultBuilder
  ): Promise<void> {
    // Group GET requests by endpoint for potential optimization
    const endpointGroups = new Map<string, any[]>();
    
    for (const request of requests) {
      const key = request.endpoint;
      if (!endpointGroups.has(key)) {
        endpointGroups.set(key, []);
      }
      endpointGroups.get(key)!.push(request);
    }
    
    // Process each endpoint group
    for (const [endpoint, endpointRequests] of endpointGroups) {
      await this.processQueryGroup(endpoint, endpointRequests, resultBuilder);
    }
  }
  
  /**
   * Process a group of query requests for the same endpoint
   */
  private async processQueryGroup(
    endpoint: string,
    requests: any[],
    resultBuilder: BatchResultBuilder
  ): Promise<void> {
    // Check if requests can be combined into a single query with filters
    if (this.canCombineQueries(requests)) {
      await this.processCombinedQuery(endpoint, requests, resultBuilder);
    } else {
      // Process individually
      await this.processIndividualQueries(requests, resultBuilder);
    }
  }
  
  /**
   * Check if multiple query requests can be combined
   */
  private canCombineQueries(requests: any[]): boolean {
    // Simple heuristic: combine if all requests have similar filter patterns
    // This would need to be enhanced based on specific Autotask API capabilities
    
    if (requests.length <= 1) return false;
    
    // Check if all requests are for the same resource type without specific IDs
    const firstRequest = requests[0];
    return requests.every(req => 
      req.endpoint === firstRequest.endpoint &&
      !req.endpoint.includes('/') // No specific resource ID in path
    );
  }
  
  /**
   * Process combined query for multiple requests
   */
  private async processCombinedQuery(
    endpoint: string,
    requests: any[],
    resultBuilder: BatchResultBuilder
  ): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Combine filters from all requests
      const combinedFilters = this.combineQueryFilters(requests);
      
      const response = await this.httpClient.get(endpoint, {
        params: combinedFilters
      });
      
      const processingTime = Date.now() - startTime;
      
      // Distribute results back to individual requests
      this.distributeQueryResults(
        response.data as AutotaskResponse,
        requests,
        resultBuilder,
        processingTime / requests.length
      );
      
    } catch (error) {
      // Fall back to individual processing
      await this.processIndividualQueries(requests, resultBuilder);
    }
  }
  
  /**
   * Process query requests individually
   */
  private async processIndividualQueries(
    requests: any[],
    resultBuilder: BatchResultBuilder
  ): Promise<void> {
    const concurrentLimit = 3; // Limit concurrent GET requests
    const chunks = this.chunkArray(requests, concurrentLimit);
    
    for (const chunk of chunks) {
      const queryPromises = chunk.map(async (request) => {
        const startTime = Date.now();
        
        try {
          const response = await this.httpClient.get(request.endpoint, {
            params: request.data || {}
          });
          
          const processingTime = Date.now() - startTime;
          const responseSize = this.estimateResponseSize(response.data);
          
          resultBuilder.addSuccess(
            request.id,
            response.data,
            response.status,
            processingTime,
            responseSize
          );
          
        } catch (error) {
          const processingTime = Date.now() - startTime;
          
          resultBuilder.addFailure(
            request.id,
            error as Error,
            this.extractStatusCode(error),
            processingTime
          );
        }
      });
      
      await Promise.all(queryPromises);
    }
  }
  
  /**
   * Process DELETE requests
   */
  private async processDeleteRequests(
    requests: any[],
    resultBuilder: BatchResultBuilder
  ): Promise<void> {
    // DELETE operations are typically processed individually
    // but we can do them concurrently with careful rate limiting
    
    const concurrentLimit = 3; // Conservative limit for DELETE operations
    const chunks = this.chunkArray(requests, concurrentLimit);
    
    for (const chunk of chunks) {
      const deletePromises = chunk.map(async (request) => {
        const startTime = Date.now();
        
        try {
          const deleteUrl = request.data?.id ? 
            `${request.endpoint}/${request.data.id}` : 
            request.endpoint;
          
          const response = await this.httpClient.delete(deleteUrl);
          const processingTime = Date.now() - startTime;
          
          resultBuilder.addSuccess(
            request.id,
            response.data || { deleted: true },
            response.status,
            processingTime,
            this.estimateResponseSize(response.data)
          );
          
        } catch (error) {
          const processingTime = Date.now() - startTime;
          
          resultBuilder.addFailure(
            request.id,
            error as Error,
            this.extractStatusCode(error),
            processingTime
          );
        }
      });
      
      await Promise.all(deletePromises);
    }
  }
  
  /**
   * Handle Autotask API batch response
   */
  private handleBatchResponse(
    response: AutotaskResponse,
    requests: any[],
    resultBuilder: BatchResultBuilder,
    avgProcessingTime: number
  ): void {
    const items = response.items || [];
    const errors = response.errors || [];
    
    // Match items back to requests (assumes same order)
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      
      if (i < items.length && items[i]) {
        // Success case
        const responseSize = this.estimateResponseSize(items[i]);
        resultBuilder.addSuccess(
          request.id,
          items[i],
          200,
          avgProcessingTime,
          responseSize
        );
      } else {
        // Find corresponding error
        const error = errors.find(e => e.resourceId === request.id) || 
                     errors[i] || 
                     { message: 'Unknown error occurred' };
        
        resultBuilder.addFailure(
          request.id,
          new Error(error.message),
          400,
          avgProcessingTime
        );
      }
    }
  }
  
  /**
   * Distribute combined query results back to individual requests
   */
  private distributeQueryResults(
    response: AutotaskResponse,
    requests: any[],
    resultBuilder: BatchResultBuilder,
    avgProcessingTime: number
  ): void {
    const items = response.items || [];
    
    // Simple distribution strategy - each request gets relevant items
    // This would need to be enhanced based on specific filter logic
    
    for (const request of requests) {
      const relevantItems = items.filter(item => 
        this.isItemRelevantToRequest(item, request)
      );
      
      const responseSize = this.estimateResponseSize(relevantItems);
      
      resultBuilder.addSuccess(
        request.id,
        { items: relevantItems },
        200,
        avgProcessingTime,
        responseSize
      );
    }
  }
  
  // Utility helper methods
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  private extractStatusCode(error: any): number {
    if (error?.response?.status) {
      return error.response.status;
    }
    if (error?.status) {
      return error.status;
    }
    return 500; // Default to server error
  }
  
  private estimateResponseSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1000; // Default estimate
    }
  }
  
  private combineQueryFilters(requests: any[]): Record<string, any> {
    // Simple filter combination - would need enhancement for complex scenarios
    const combinedFilters: Record<string, any> = {};
    
    for (const request of requests) {
      if (request.data) {
        Object.assign(combinedFilters, request.data);
      }
    }
    
    return combinedFilters;
  }
  
  private isItemRelevantToRequest(item: any, request: any): boolean {
    // Simple relevance check - would need enhancement based on actual filter logic
    if (!request.data) return true;
    
    // Check if item matches request filters
    for (const [key, value] of Object.entries(request.data)) {
      if (item[key] && item[key] !== value) {
        return false;
      }
    }
    
    return true;
  }
}