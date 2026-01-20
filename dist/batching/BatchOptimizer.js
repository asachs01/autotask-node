"use strict";
/**
 * Batch Optimizer Implementation
 *
 * Optimizes batch requests before processing through:
 * - Request deduplication
 * - Request coalescing (combining similar requests)
 * - Priority-based reordering
 * - Size optimization
 * - Zone-aware grouping
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchOptimizer = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * BatchOptimizer optimizes batches for better performance and efficiency
 */
class BatchOptimizer {
    constructor(config, logger) {
        // Optimization statistics
        this.stats = {
            totalOptimizations: 0,
            deduplicationCount: 0,
            coalescingCount: 0,
            sizeReductions: 0,
            totalTimesSaved: 0,
            averageOptimizationTime: 0
        };
        // Request fingerprint cache for deduplication
        this.fingerprintCache = new Map();
        // Similarity analysis cache
        this.similarityCache = new Map();
        this.config = {
            enableCoalescing: config.enableCoalescing ?? true,
            enableDeduplication: config.enableDeduplication ?? true,
            enablePriorityOptimization: config.enablePriorityOptimization ?? true,
            enableZoneOptimization: config.enableZoneOptimization ?? true,
            enableAdaptiveSizing: config.enableAdaptiveSizing ?? true,
            thresholds: {
                coalescingThreshold: config.thresholds?.coalescingThreshold ?? 3,
                similarityThreshold: config.thresholds?.similarityThreshold ?? 0.8,
                performanceThreshold: config.thresholds?.performanceThreshold ?? 0.9,
                ...config.thresholds
            },
            ...config
        };
        this.logger = logger;
    }
    /**
     * Optimize a batch before processing
     */
    async optimize(batch) {
        const startTime = Date.now();
        const originalSize = batch.requests.length;
        this.logger.debug('Starting batch optimization', {
            batchId: batch.id,
            originalSize,
            optimizations: this.getEnabledOptimizations()
        });
        let optimizedBatch = { ...batch };
        const optimizations = [];
        let duplicatesRemoved = 0;
        let requestsCoalesced = 0;
        try {
            // Step 1: Deduplication
            if (this.config.enableDeduplication) {
                const deduplicatedResult = this.deduplicateRequests(optimizedBatch);
                optimizedBatch = deduplicatedResult.batch;
                duplicatesRemoved = deduplicatedResult.duplicatesRemoved;
                if (duplicatesRemoved > 0) {
                    optimizations.push('deduplication');
                    this.stats.deduplicationCount += duplicatesRemoved;
                }
            }
            // Step 2: Request coalescing
            if (this.config.enableCoalescing && optimizedBatch.requests.length >= this.config.thresholds.coalescingThreshold) {
                const coalescedResult = this.coalesceRequests(optimizedBatch);
                optimizedBatch = coalescedResult.batch;
                requestsCoalesced = coalescedResult.requestsCoalesced;
                if (requestsCoalesced > 0) {
                    optimizations.push('coalescing');
                    this.stats.coalescingCount += requestsCoalesced;
                }
            }
            // Step 3: Priority optimization
            if (this.config.enablePriorityOptimization) {
                optimizedBatch = this.optimizePriorities(optimizedBatch);
                optimizations.push('priority-optimization');
            }
            // Step 4: Zone optimization
            if (this.config.enableZoneOptimization) {
                optimizedBatch = this.optimizeZoneOrdering(optimizedBatch);
                optimizations.push('zone-optimization');
            }
            // Step 5: Adaptive sizing
            if (this.config.enableAdaptiveSizing) {
                const sizingResult = this.adaptiveSize(optimizedBatch);
                if (sizingResult.optimized) {
                    optimizedBatch = sizingResult.batch;
                    optimizations.push('adaptive-sizing');
                }
            }
            // Update batch metadata with optimization info
            optimizedBatch.metadata = {
                ...optimizedBatch.metadata,
                optimization: {
                    original_size: originalSize,
                    optimized_size: optimizedBatch.requests.length,
                    duplicates_removed: duplicatesRemoved,
                    requests_coalesced: requestsCoalesced,
                    optimizations,
                    optimization_time: Date.now() - startTime
                }
            };
            // Update statistics
            this.updateStats(startTime, originalSize, optimizedBatch.requests.length, optimizations);
            this.logger.debug('Batch optimization completed', {
                batchId: batch.id,
                originalSize,
                optimizedSize: optimizedBatch.requests.length,
                duplicatesRemoved,
                requestsCoalesced,
                optimizations,
                processingTime: Date.now() - startTime
            });
            return optimizedBatch;
        }
        catch (error) {
            this.logger.error('Batch optimization failed', {
                batchId: batch.id,
                error: error instanceof Error ? error.message : error,
                processingTime: Date.now() - startTime
            });
            // Return original batch on optimization failure
            return batch;
        }
    }
    /**
     * Get optimization statistics
     */
    getStats() {
        return {
            totalOptimizations: this.stats.totalOptimizations,
            deduplicationCount: this.stats.deduplicationCount,
            coalescingCount: this.stats.coalescingCount,
            sizeReductions: this.stats.sizeReductions
        };
    }
    /**
     * Clear optimization caches
     */
    clearCaches() {
        this.fingerprintCache.clear();
        this.similarityCache.clear();
        this.logger.debug('Optimization caches cleared');
    }
    /**
     * Deduplicate requests in the batch
     */
    deduplicateRequests(batch) {
        const seen = new Set();
        const uniqueRequests = [];
        let duplicatesRemoved = 0;
        for (const request of batch.requests) {
            const fingerprint = this.getRequestFingerprint(request);
            if (!seen.has(fingerprint)) {
                seen.add(fingerprint);
                uniqueRequests.push(request);
            }
            else {
                duplicatesRemoved++;
                this.logger.debug('Duplicate request removed', {
                    requestId: request.id,
                    fingerprint,
                    batchId: batch.id
                });
            }
        }
        return {
            batch: {
                ...batch,
                requests: uniqueRequests
            },
            duplicatesRemoved
        };
    }
    /**
     * Coalesce similar requests
     */
    coalesceRequests(batch) {
        const coalescedRequests = [];
        const processed = new Set();
        let requestsCoalesced = 0;
        for (const request of batch.requests) {
            if (processed.has(request.id)) {
                continue;
            }
            // Find similar requests that can be coalesced
            const similarRequests = this.findSimilarRequests(request, batch.requests);
            const coalesceable = similarRequests.filter(s => s.coalesceable &&
                s.score >= this.config.thresholds.similarityThreshold &&
                !processed.has(s.request.id));
            if (coalesceable.length > 0) {
                // Create coalesced request
                const coalescedRequest = this.createCoalescedRequest(request, coalesceable.map(c => c.request));
                coalescedRequests.push(coalescedRequest);
                // Mark all coalesced requests as processed
                processed.add(request.id);
                coalesceable.forEach(c => {
                    processed.add(c.request.id);
                    requestsCoalesced++;
                });
                this.logger.debug('Requests coalesced', {
                    mainRequestId: request.id,
                    coalescedRequestIds: coalesceable.map(c => c.request.id),
                    batchId: batch.id
                });
            }
            else {
                // Keep request as-is
                coalescedRequests.push(request);
                processed.add(request.id);
            }
        }
        return {
            batch: {
                ...batch,
                requests: coalescedRequests
            },
            requestsCoalesced
        };
    }
    /**
     * Optimize request priorities within batch
     */
    optimizePriorities(batch) {
        // Sort requests by priority (highest first) and then by creation time
        const sortedRequests = [...batch.requests].sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority; // Higher priority first
            }
            return a.createdAt.getTime() - b.createdAt.getTime(); // Older first for same priority
        });
        return {
            ...batch,
            requests: sortedRequests,
            priority: Math.max(...sortedRequests.map(r => r.priority))
        };
    }
    /**
     * Optimize zone ordering for better processing efficiency
     */
    optimizeZoneOrdering(batch) {
        // Group requests by zone and sort within each zone
        const zoneGroups = new Map();
        for (const request of batch.requests) {
            if (!zoneGroups.has(request.zone)) {
                zoneGroups.set(request.zone, []);
            }
            zoneGroups.get(request.zone).push(request);
        }
        // Sort requests within each zone by priority and endpoint
        const optimizedRequests = [];
        for (const [zone, zoneRequests] of zoneGroups) {
            const sortedZoneRequests = zoneRequests.sort((a, b) => {
                // First by priority
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                // Then by endpoint for better batching
                if (a.endpoint !== b.endpoint) {
                    return a.endpoint.localeCompare(b.endpoint);
                }
                // Finally by creation time
                return a.createdAt.getTime() - b.createdAt.getTime();
            });
            optimizedRequests.push(...sortedZoneRequests);
        }
        return {
            ...batch,
            requests: optimizedRequests
        };
    }
    /**
     * Apply adaptive sizing based on performance characteristics
     */
    adaptiveSize(batch) {
        const currentSize = batch.requests.length;
        // Check if batch size should be adjusted based on endpoint characteristics
        const endpointSizes = this.getOptimalEndpointSizes(batch.requests);
        if (endpointSizes.recommendedSize && endpointSizes.recommendedSize < currentSize) {
            // Split batch if it's larger than recommended
            const optimizedRequests = batch.requests.slice(0, endpointSizes.recommendedSize);
            this.logger.debug('Batch size adapted', {
                batchId: batch.id,
                originalSize: currentSize,
                adaptedSize: optimizedRequests.length,
                reason: endpointSizes.reason
            });
            return {
                batch: {
                    ...batch,
                    requests: optimizedRequests,
                    maxSize: endpointSizes.recommendedSize
                },
                optimized: true
            };
        }
        return {
            batch,
            optimized: false
        };
    }
    /**
     * Generate request fingerprint for deduplication
     */
    getRequestFingerprint(request) {
        const cacheKey = request.id;
        if (this.fingerprintCache.has(cacheKey)) {
            return this.fingerprintCache.get(cacheKey);
        }
        // Use existing fingerprint if available
        if (request.fingerprint) {
            this.fingerprintCache.set(cacheKey, request.fingerprint);
            return request.fingerprint;
        }
        // Generate fingerprint from request characteristics
        const fingerprintData = {
            endpoint: request.endpoint,
            method: request.method,
            zone: request.zone,
            data: request.data ? JSON.stringify(request.data) : null,
            headers: request.headers ? JSON.stringify(request.headers) : null
        };
        const fingerprint = crypto_1.default
            .createHash('sha256')
            .update(JSON.stringify(fingerprintData))
            .digest('hex')
            .substring(0, 16);
        this.fingerprintCache.set(cacheKey, fingerprint);
        return fingerprint;
    }
    /**
     * Find similar requests for coalescing
     */
    findSimilarRequests(targetRequest, allRequests) {
        const similarities = [];
        for (const request of allRequests) {
            if (request.id === targetRequest.id) {
                continue;
            }
            const similarity = this.calculateRequestSimilarity(targetRequest, request);
            if (similarity.score > 0) {
                similarities.push(similarity);
            }
        }
        return similarities.sort((a, b) => b.score - a.score);
    }
    /**
     * Calculate similarity between two requests
     */
    calculateRequestSimilarity(request1, request2) {
        const matchingFields = [];
        let score = 0;
        // Exact matches (high weight)
        if (request1.endpoint === request2.endpoint) {
            matchingFields.push('endpoint');
            score += 0.3;
        }
        if (request1.method === request2.method) {
            matchingFields.push('method');
            score += 0.2;
        }
        if (request1.zone === request2.zone) {
            matchingFields.push('zone');
            score += 0.2;
        }
        // Data similarity (medium weight)
        if (this.areDataSimilar(request1.data, request2.data)) {
            matchingFields.push('data');
            score += 0.2;
        }
        // Headers similarity (low weight)
        if (this.areHeadersSimilar(request1.headers, request2.headers)) {
            matchingFields.push('headers');
            score += 0.1;
        }
        // Determine if requests can be coalesced
        const coalesceable = this.canCoalesceRequests(request1, request2);
        return {
            request: request2,
            score,
            matchingFields,
            coalesceable
        };
    }
    /**
     * Create a coalesced request from multiple similar requests
     */
    createCoalescedRequest(mainRequest, similarRequests) {
        // Combine data from all requests
        const coalescedData = this.combineRequestData(mainRequest, similarRequests);
        // Use highest priority
        const maxPriority = Math.max(mainRequest.priority, ...similarRequests.map(r => r.priority));
        // Combine metadata
        const coalescedMetadata = {
            ...mainRequest.metadata,
            coalesced_from: [mainRequest.id, ...similarRequests.map(r => r.id)],
            coalesced_count: similarRequests.length + 1,
            original_priorities: [mainRequest.priority, ...similarRequests.map(r => r.priority)]
        };
        return {
            ...mainRequest,
            id: `coalesced_${mainRequest.id}_${Date.now()}`,
            priority: maxPriority,
            data: coalescedData,
            metadata: coalescedMetadata
        };
    }
    /**
     * Check if two data objects are similar enough for coalescing
     */
    areDataSimilar(data1, data2) {
        if (!data1 && !data2)
            return true;
        if (!data1 || !data2)
            return false;
        // Simple similarity check - can be enhanced
        try {
            const str1 = JSON.stringify(data1);
            const str2 = JSON.stringify(data2);
            return str1 === str2;
        }
        catch {
            return false;
        }
    }
    /**
     * Check if two header objects are similar
     */
    areHeadersSimilar(headers1, headers2) {
        if (!headers1 && !headers2)
            return true;
        if (!headers1 || !headers2)
            return false;
        const keys1 = Object.keys(headers1);
        const keys2 = Object.keys(headers2);
        if (keys1.length !== keys2.length)
            return false;
        return keys1.every(key => headers1[key] === headers2[key]);
    }
    /**
     * Determine if two requests can be coalesced
     */
    canCoalesceRequests(request1, request2) {
        // Basic coalescing rules
        if (request1.endpoint !== request2.endpoint)
            return false;
        if (request1.method !== request2.method)
            return false;
        if (request1.zone !== request2.zone)
            return false;
        // Check if either request specifically prohibits batching
        if (!request1.batchable || !request2.batchable)
            return false;
        // Check batch hints if available
        const hints1 = request1.batchHints;
        const hints2 = request2.batchHints;
        if (hints1?.coalesceable === false || hints2?.coalesceable === false) {
            return false;
        }
        return true;
    }
    /**
     * Combine data from multiple requests for coalescing
     */
    combineRequestData(mainRequest, similarRequests) {
        // Simple combination strategy - can be enhanced based on specific needs
        if (!mainRequest.data)
            return mainRequest.data;
        // If main request has array data, combine arrays
        if (Array.isArray(mainRequest.data)) {
            const combinedArray = [...mainRequest.data];
            for (const request of similarRequests) {
                if (Array.isArray(request.data)) {
                    combinedArray.push(...request.data);
                }
            }
            return combinedArray;
        }
        // For object data, merge objects (simple merge)
        if (typeof mainRequest.data === 'object') {
            const combinedObject = { ...mainRequest.data };
            for (const request of similarRequests) {
                if (typeof request.data === 'object' && request.data !== null) {
                    Object.assign(combinedObject, request.data);
                }
            }
            return combinedObject;
        }
        // For primitive data, return main request data
        return mainRequest.data;
    }
    /**
     * Get optimal batch sizes for different endpoints
     */
    getOptimalEndpointSizes(requests) {
        // Group by endpoint
        const endpointGroups = new Map();
        for (const request of requests) {
            const count = endpointGroups.get(request.endpoint) || 0;
            endpointGroups.set(request.endpoint, count + 1);
        }
        // Check for endpoints that perform better with smaller batches
        const problematicEndpoints = [
            '/tickets', // Complex ticket operations
            '/projects', // Project operations with dependencies
            '/companies' // Company operations with relationships
        ];
        for (const [endpoint, count] of endpointGroups) {
            if (problematicEndpoints.some(pe => endpoint.includes(pe))) {
                if (count > 50) {
                    return {
                        recommendedSize: 50,
                        reason: `Endpoint ${endpoint} performs better with smaller batches`
                    };
                }
            }
        }
        return {};
    }
    /**
     * Update optimization statistics
     */
    updateStats(startTime, originalSize, optimizedSize, optimizations) {
        const processingTime = Date.now() - startTime;
        this.stats.totalOptimizations++;
        if (optimizedSize < originalSize) {
            this.stats.sizeReductions++;
            this.stats.totalTimesSaved += (originalSize - optimizedSize) * 10; // Estimated ms saved per request
        }
        // Update average optimization time
        const alpha = 0.1; // Smoothing factor
        if (this.stats.averageOptimizationTime === 0) {
            this.stats.averageOptimizationTime = processingTime;
        }
        else {
            this.stats.averageOptimizationTime =
                alpha * processingTime + (1 - alpha) * this.stats.averageOptimizationTime;
        }
    }
    /**
     * Get list of enabled optimizations
     */
    getEnabledOptimizations() {
        const enabled = [];
        if (this.config.enableDeduplication)
            enabled.push('deduplication');
        if (this.config.enableCoalescing)
            enabled.push('coalescing');
        if (this.config.enablePriorityOptimization)
            enabled.push('priority-optimization');
        if (this.config.enableZoneOptimization)
            enabled.push('zone-optimization');
        if (this.config.enableAdaptiveSizing)
            enabled.push('adaptive-sizing');
        return enabled;
    }
}
exports.BatchOptimizer = BatchOptimizer;
//# sourceMappingURL=BatchOptimizer.js.map