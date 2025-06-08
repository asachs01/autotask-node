import { AxiosInstance } from 'axios';
import winston from 'winston';
import { RequestHandler, RequestOptions, ApiResponse } from '../types';

/**
 * Base class for all Autotask entities with enhanced error handling
 */
export abstract class BaseEntity {
  protected requestHandler: RequestHandler;

  constructor(
    protected axios: AxiosInstance,
    protected logger: winston.Logger,
    requestHandler?: RequestHandler
  ) {
    // If no request handler is provided, create a basic one
    this.requestHandler =
      requestHandler || new RequestHandler(this.axios, this.logger);
  }

  /**
   * Execute a request with enhanced error handling and retry logic
   */
  protected async executeRequest<T>(
    requestFn: () => Promise<any>,
    endpoint: string,
    method: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const response = await this.requestHandler.executeRequest(
      requestFn,
      endpoint,
      method,
      options
    );

    // Handle Autotask API's behavior of returning {item: null} for non-existent resources
    if (
      response.data &&
      typeof response.data === 'object' &&
      'item' in response.data
    ) {
      if (response.data.item === null) {
        // Import and throw NotFoundError
        const { NotFoundError } = await import('../utils/errors');
        const resourceType = endpoint.split('/')[1] || 'resource';
        throw new NotFoundError(
          `Resource not found`,
          resourceType,
          undefined,
          404,
          undefined,
          { endpoint, method }
        );
      }
      return { data: response.data.item as T };
    }

    return { data: response.data as T };
  }

  /**
   * Execute a query request (for list operations) with special handling for Autotask API structure
   */
  protected async executeQueryRequest<T>(
    requestFn: () => Promise<any>,
    endpoint: string,
    method: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T[]>> {
    const response = await this.requestHandler.executeRequest(
      requestFn,
      endpoint,
      method,
      options
    );

    // Autotask API returns list data in { items: [...], pageDetails: {...} } format
    if (
      response.data &&
      typeof response.data === 'object' &&
      'items' in response.data
    ) {
      return { data: response.data.items as T[] };
    }

    // Fallback for direct array responses or other formats
    return { data: response.data as T[] };
  }

  /**
   * Legacy method for backward compatibility - enhanced with new error handling
   */
  protected async requestWithRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 500,
    endpoint = 'unknown',
    method = 'unknown'
  ): Promise<T> {
    const response = await this.requestHandler.executeRequest(
      async () => {
        const result = await fn();
        // Wrap non-axios responses to match expected format
        return { data: result } as any;
      },
      endpoint,
      method,
      {
        retries,
        baseDelay: delay,
        enableRequestLogging: false, // Disable for legacy compatibility
        enableResponseLogging: false,
      }
    );

    return response.data as T;
  }
}
