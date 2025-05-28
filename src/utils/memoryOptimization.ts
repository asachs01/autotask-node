import { AxiosInstance } from 'axios';
import winston from 'winston';

/**
 * Configuration for memory-optimized operations
 */
export interface MemoryOptimizationConfig {
  /** Maximum number of items to process in memory at once (default: 1000) */
  batchSize?: number;
  /** Enable streaming for large result sets (default: true) */
  enableStreaming?: boolean;
  /** Memory threshold in MB before triggering garbage collection hints (default: 100) */
  memoryThreshold?: number;
  /** Enable automatic pagination for list operations (default: true) */
  enableAutoPagination?: boolean;
}

/**
 * Memory-optimized pagination handler for large result sets
 */
export class PaginationHandler {
  private readonly defaultConfig: Required<MemoryOptimizationConfig> = {
    batchSize: 1000,
    enableStreaming: true,
    memoryThreshold: 100,
    enableAutoPagination: true,
  };

  constructor(
    private axios: AxiosInstance,
    private logger: winston.Logger,
    private config: MemoryOptimizationConfig = {}
  ) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * Stream large result sets with automatic pagination
   */
  async *streamResults<T>(
    endpoint: string,
    queryParams: Record<string, any> = {},
    pageSize: number = this.config.batchSize!
  ): AsyncGenerator<T[], void, unknown> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const params = {
          ...queryParams,
          pageSize,
          page,
        };

        this.logger.debug(`Fetching page ${page} from ${endpoint}`, { params });

        const response = await this.axios.get(endpoint, { params });
        const items = response.data?.items || response.data || [];

        if (items.length === 0) {
          hasMore = false;
          break;
        }

        // Check memory usage and suggest garbage collection if needed
        this.checkMemoryUsage();

        yield items;

        // Check if we have more pages
        hasMore = items.length === pageSize;
        page++;

        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        this.logger.error(
          `Error fetching page ${page} from ${endpoint}:`,
          error
        );
        throw error;
      }
    }
  }

  /**
   * Fetch all results with memory optimization
   */
  async fetchAllOptimized<T>(
    endpoint: string,
    queryParams: Record<string, any> = {},
    pageSize: number = this.config.batchSize!
  ): Promise<T[]> {
    const allResults: T[] = [];
    let processedCount = 0;

    for await (const batch of this.streamResults<T>(
      endpoint,
      queryParams,
      pageSize
    )) {
      allResults.push(...batch);
      processedCount += batch.length;

      this.logger.debug(`Processed ${processedCount} items from ${endpoint}`);

      // Check memory usage periodically
      if (processedCount % (pageSize * 5) === 0) {
        this.checkMemoryUsage();
      }
    }

    this.logger.info(
      `Fetched total of ${allResults.length} items from ${endpoint}`
    );
    return allResults;
  }

  /**
   * Process large result sets in batches with a callback function
   */
  async processBatches<T, R>(
    endpoint: string,
    processor: (batch: T[]) => Promise<R[]> | R[],
    queryParams: Record<string, any> = {},
    pageSize: number = this.config.batchSize!
  ): Promise<R[]> {
    const results: R[] = [];
    let processedBatches = 0;

    for await (const batch of this.streamResults<T>(
      endpoint,
      queryParams,
      pageSize
    )) {
      try {
        const batchResults = await processor(batch);
        results.push(...batchResults);
        processedBatches++;

        this.logger.debug(
          `Processed batch ${processedBatches} with ${batch.length} items`
        );

        // Memory management
        if (processedBatches % 10 === 0) {
          this.checkMemoryUsage();
        }
      } catch (error) {
        this.logger.error(`Error processing batch ${processedBatches}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Check memory usage and log warnings if threshold is exceeded
   */
  private checkMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024;

      if (heapUsedMB > this.config.memoryThreshold!) {
        this.logger.warn(
          `High memory usage detected: ${heapUsedMB.toFixed(2)}MB used of ${heapTotalMB.toFixed(2)}MB total`
        );

        // Suggest garbage collection (Node.js will decide if it's needed)
        if (global.gc) {
          global.gc();
          this.logger.debug('Garbage collection triggered');
        }
      }
    }
  }

  /**
   * Get current memory optimization configuration
   */
  getConfig(): Required<MemoryOptimizationConfig> {
    return { ...this.config } as Required<MemoryOptimizationConfig>;
  }

  /**
   * Update memory optimization configuration
   */
  updateConfig(newConfig: Partial<MemoryOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Utility function to estimate memory usage of an object
 */
export function estimateObjectSize(obj: any): number {
  const jsonString = JSON.stringify(obj);
  return new Blob([jsonString]).size;
}

/**
 * Utility function to chunk an array into smaller batches
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
