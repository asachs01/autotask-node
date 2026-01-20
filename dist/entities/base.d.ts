import { AxiosInstance } from 'axios';
import winston from 'winston';
import { RequestHandler, RequestOptions, ApiResponse } from '../types';
/**
 * Base class for all Autotask entities with enhanced error handling
 */
export declare abstract class BaseEntity {
    protected axios: AxiosInstance;
    protected logger: winston.Logger;
    protected requestHandler: RequestHandler;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    /**
     * Execute a request with enhanced error handling and retry logic
     */
    protected executeRequest<T>(requestFn: () => Promise<any>, endpoint: string, method: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * Execute a query request (for list operations) with special handling for Autotask API structure
     */
    protected executeQueryRequest<T>(requestFn: () => Promise<any>, endpoint: string, method: string, options?: RequestOptions): Promise<ApiResponse<T[]>>;
    /**
     * Legacy method for backward compatibility - enhanced with new error handling
     */
    protected requestWithRetry<T>(fn: () => Promise<T>, retries?: number, delay?: number, endpoint?: string, method?: string): Promise<T>;
}
//# sourceMappingURL=base.d.ts.map