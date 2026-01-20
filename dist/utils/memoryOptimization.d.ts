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
export declare class PaginationHandler {
    private axios;
    private logger;
    private config;
    private readonly defaultConfig;
    constructor(axios: AxiosInstance, logger: winston.Logger, config?: MemoryOptimizationConfig);
    /**
     * Stream large result sets with automatic pagination
     */
    streamResults<T>(endpoint: string, queryParams?: Record<string, any>, pageSize?: number): AsyncGenerator<T[], void, unknown>;
    /**
     * Fetch all results with memory optimization
     */
    fetchAllOptimized<T>(endpoint: string, queryParams?: Record<string, any>, pageSize?: number): Promise<T[]>;
    /**
     * Process large result sets in batches with a callback function
     */
    processBatches<T, R>(endpoint: string, processor: (batch: T[]) => Promise<R[]> | R[], queryParams?: Record<string, any>, pageSize?: number): Promise<R[]>;
    /**
     * Check memory usage and log warnings if threshold is exceeded
     */
    private checkMemoryUsage;
    /**
     * Get current memory optimization configuration
     */
    getConfig(): Required<MemoryOptimizationConfig>;
    /**
     * Update memory optimization configuration
     */
    updateConfig(newConfig: Partial<MemoryOptimizationConfig>): void;
}
/**
 * Utility function to estimate memory usage of an object
 */
export declare function estimateObjectSize(obj: any): number;
/**
 * Utility function to chunk an array into smaller batches
 */
export declare function chunkArray<T>(array: T[], chunkSize: number): T[][];
//# sourceMappingURL=memoryOptimization.d.ts.map