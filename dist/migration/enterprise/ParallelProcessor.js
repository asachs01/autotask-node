"use strict";
/**
 * Parallel processor for enterprise scaling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallelProcessor = void 0;
class ParallelProcessor {
    constructor(options) {
        this.options = options;
    }
    async processInParallel(items, processor) {
        const results = [];
        for (let i = 0; i < items.length; i += this.options.maxConcurrency) {
            const batch = items.slice(i, i + this.options.maxConcurrency);
            const batchResults = await Promise.all(batch.map(processor));
            results.push(...batchResults);
        }
        return results;
    }
}
exports.ParallelProcessor = ParallelProcessor;
//# sourceMappingURL=ParallelProcessor.js.map