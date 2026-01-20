"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationHandler = void 0;
exports.estimateObjectSize = estimateObjectSize;
exports.chunkArray = chunkArray;
/**
 * Memory-optimized pagination handler for large result sets
 */
class PaginationHandler {
    constructor(axios, logger, config = {}) {
        this.axios = axios;
        this.logger = logger;
        this.config = config;
        this.defaultConfig = {
            batchSize: 1000,
            enableStreaming: true,
            memoryThreshold: 100,
            enableAutoPagination: true,
        };
        this.config = { ...this.defaultConfig, ...config };
    }
    /**
     * Stream large result sets with automatic pagination
     */
    async *streamResults(endpoint, queryParams = {}, pageSize = this.config.batchSize) {
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
            }
            catch (error) {
                this.logger.error(`Error fetching page ${page} from ${endpoint}:`, error);
                throw error;
            }
        }
    }
    /**
     * Fetch all results with memory optimization
     */
    async fetchAllOptimized(endpoint, queryParams = {}, pageSize = this.config.batchSize) {
        const allResults = [];
        let processedCount = 0;
        for await (const batch of this.streamResults(endpoint, queryParams, pageSize)) {
            allResults.push(...batch);
            processedCount += batch.length;
            this.logger.debug(`Processed ${processedCount} items from ${endpoint}`);
            // Check memory usage periodically
            if (processedCount % (pageSize * 5) === 0) {
                this.checkMemoryUsage();
            }
        }
        this.logger.info(`Fetched total of ${allResults.length} items from ${endpoint}`);
        return allResults;
    }
    /**
     * Process large result sets in batches with a callback function
     */
    async processBatches(endpoint, processor, queryParams = {}, pageSize = this.config.batchSize) {
        const results = [];
        let processedBatches = 0;
        for await (const batch of this.streamResults(endpoint, queryParams, pageSize)) {
            try {
                const batchResults = await processor(batch);
                results.push(...batchResults);
                processedBatches++;
                this.logger.debug(`Processed batch ${processedBatches} with ${batch.length} items`);
                // Memory management
                if (processedBatches % 10 === 0) {
                    this.checkMemoryUsage();
                }
            }
            catch (error) {
                this.logger.error(`Error processing batch ${processedBatches}:`, error);
                throw error;
            }
        }
        return results;
    }
    /**
     * Check memory usage and log warnings if threshold is exceeded
     */
    checkMemoryUsage() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const memUsage = process.memoryUsage();
            const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
            const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
            if (heapUsedMB > this.config.memoryThreshold) {
                this.logger.warn(`High memory usage detected: ${heapUsedMB.toFixed(2)}MB used of ${heapTotalMB.toFixed(2)}MB total`);
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
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update memory optimization configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}
exports.PaginationHandler = PaginationHandler;
/**
 * Utility function to estimate memory usage of an object
 */
function estimateObjectSize(obj) {
    const jsonString = JSON.stringify(obj);
    return new Blob([jsonString]).size;
}
/**
 * Utility function to chunk an array into smaller batches
 */
function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}
//# sourceMappingURL=memoryOptimization.js.map