import { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import {
  AutotaskError,
  createAutotaskError,
  isRetryableError,
  getRetryDelay,
} from './errors';
import { PerformanceMonitor } from './performanceMonitor';

export interface RequestOptions {
  retries?: number;
  baseDelay?: number;
  timeout?: number;
  enableRequestLogging?: boolean;
  enableResponseLogging?: boolean;
  requestId?: string;
  enablePerformanceMonitoring?: boolean;
}

export interface RequestContext {
  requestId: string;
  endpoint: string;
  method: string;
  startTime: number;
  attempt: number;
}

/**
 * Enhanced request handler with structured error handling, retry logic, and logging
 */
export class RequestHandler {
  private defaultOptions: Required<RequestOptions> = {
    retries: 3,
    baseDelay: 1000,
    timeout: 30000,
    enableRequestLogging: true,
    enableResponseLogging: true,
    requestId: '',
    enablePerformanceMonitoring: true,
  };

  private performanceMonitor: PerformanceMonitor;

  constructor(
    private axios: AxiosInstance,
    private logger: winston.Logger,
    private globalOptions: Partial<RequestOptions> = {}
  ) {
    this.performanceMonitor = new PerformanceMonitor(this.logger);
    this.setupAxiosInterceptors();
  }

  /**
   * Setup axios interceptors for request/response logging and timeout handling
   */
  private setupAxiosInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      config => {
        // Add timeout if not already set
        if (!config.timeout && this.defaultOptions.timeout) {
          config.timeout = this.defaultOptions.timeout;
        }

        // Add request ID for tracking
        const requestId = uuidv4();
        config.metadata = { requestId, startTime: Date.now() };

        return config;
      },
      error => {
        this.logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      response => {
        const duration =
          Date.now() - (response.config.metadata?.startTime || 0);
        response.metadata = {
          ...response.config.metadata,
          duration,
          success: true,
        };
        return response;
      },
      error => {
        const duration = Date.now() - (error.config?.metadata?.startTime || 0);
        if (error.config) {
          error.config.metadata = {
            ...error.config.metadata,
            duration,
            success: false,
          };
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Execute a request with enhanced error handling and retry logic
   */
  async executeRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    endpoint: string,
    method: string,
    options: RequestOptions = {}
  ): Promise<AxiosResponse<T>> {
    const mergedOptions = {
      ...this.defaultOptions,
      ...this.globalOptions,
      ...options,
    };
    const requestId = options.requestId || uuidv4();

    const context: RequestContext = {
      requestId,
      endpoint,
      method,
      startTime: Date.now(),
      attempt: 0,
    };

    // Start performance monitoring if enabled
    let performanceTimer:
      | ((statusCode?: number, error?: string) => void)
      | undefined;
    if (mergedOptions.enablePerformanceMonitoring) {
      performanceTimer = this.performanceMonitor.startTimer(endpoint, method);
    }

    let lastError: AutotaskError | undefined;

    for (let attempt = 1; attempt <= mergedOptions.retries + 1; attempt++) {
      context.attempt = attempt;

      try {
        this.logRequest(context, mergedOptions, attempt > 1);

        const response = await requestFn();

        this.logResponse(context, response, mergedOptions);

        // Record successful performance metrics
        if (performanceTimer) {
          performanceTimer(response.status, undefined);
        }

        // Success - return the response
        return response;
      } catch (error) {
        const autotaskError = this.handleError(error, context);
        lastError = autotaskError;

        this.logError(context, autotaskError, mergedOptions);

        // Record error performance metrics
        if (performanceTimer && attempt === mergedOptions.retries + 1) {
          // Only record on final attempt to avoid duplicate metrics
          performanceTimer(autotaskError.statusCode, autotaskError.message);
        }

        // Check if we should retry
        if (
          attempt <= mergedOptions.retries &&
          isRetryableError(autotaskError)
        ) {
          const delay = getRetryDelay(
            autotaskError,
            attempt,
            mergedOptions.baseDelay
          );

          this.logger.warn(`Request failed, retrying in ${delay}ms`, {
            requestId: context.requestId,
            endpoint: context.endpoint,
            method: context.method,
            attempt,
            maxRetries: mergedOptions.retries,
            delay,
            errorType: autotaskError.constructor.name,
            statusCode: autotaskError.statusCode,
          });

          await this.sleep(delay);
          continue;
        }

        // No more retries or non-retryable error
        throw autotaskError;
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Unexpected error in request execution');
  }

  /**
   * Handle and classify errors
   */
  private handleError(error: any, context: RequestContext): AutotaskError {
    const requestDetails = {
      endpoint: context.endpoint,
      method: context.method,
      requestId: context.requestId,
    };

    if (error.isAxiosError) {
      return createAutotaskError(error as AxiosError, requestDetails);
    }

    if (error instanceof AutotaskError) {
      return error;
    }

    // Handle non-axios errors
    return createAutotaskError(
      {
        message: error.message || 'Unknown error',
        isAxiosError: false,
      } as AxiosError,
      requestDetails
    );
  }

  /**
   * Log request details
   */
  private logRequest(
    context: RequestContext,
    options: Required<RequestOptions>,
    isRetry: boolean = false
  ): void {
    if (!options.enableRequestLogging) return;

    const logData = {
      requestId: context.requestId,
      endpoint: context.endpoint,
      method: context.method,
      attempt: context.attempt,
      isRetry,
      timestamp: new Date().toISOString(),
    };

    if (isRetry) {
      this.logger.info('Retrying request', logData);
    } else {
      this.logger.info('Making request', logData);
    }
  }

  /**
   * Log response details
   */
  private logResponse<T>(
    context: RequestContext,
    response: AxiosResponse<T>,
    options: Required<RequestOptions>
  ): void {
    if (!options.enableResponseLogging) return;

    const duration = Date.now() - context.startTime;

    this.logger.info('Request completed successfully', {
      requestId: context.requestId,
      endpoint: context.endpoint,
      method: context.method,
      statusCode: response.status,
      statusText: response.statusText,
      duration,
      attempt: context.attempt,
      responseSize: JSON.stringify(response.data).length,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log error details
   */
  private logError(
    context: RequestContext,
    error: AutotaskError,
    options: Required<RequestOptions>
  ): void {
    const duration = Date.now() - context.startTime;

    const logData = {
      requestId: context.requestId,
      endpoint: context.endpoint,
      method: context.method,
      attempt: context.attempt,
      duration,
      errorType: error.constructor.name,
      errorMessage: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      isRetryable: isRetryableError(error),
    };

    if (error.statusCode && error.statusCode >= 500) {
      this.logger.error('Server error occurred', logData);
    } else if (error.statusCode && error.statusCode >= 400) {
      this.logger.warn('Client error occurred', logData);
    } else {
      this.logger.error('Network or unknown error occurred', logData);
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get performance monitor instance
   */
  getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }

  /**
   * Get detailed performance report
   */
  getPerformanceReport() {
    return this.performanceMonitor.getDetailedReport();
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics(): void {
    this.performanceMonitor.reset();
  }

  /**
   * Log performance summary
   */
  logPerformanceSummary(): void {
    this.performanceMonitor.logSummary();
  }

  /**
   * Update global options for all requests
   */
  updateGlobalOptions(options: Partial<RequestOptions>): void {
    Object.assign(this.globalOptions, options);
  }

  /**
   * Get current global options
   */
  getGlobalOptions(): Partial<RequestOptions> {
    return { ...this.globalOptions };
  }
}
