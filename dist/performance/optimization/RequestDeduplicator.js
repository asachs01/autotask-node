"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestDeduplicator = void 0;
const events_1 = require("events");
/**
 * Request deduplication system
 */
class RequestDeduplicator extends events_1.EventEmitter {
    constructor(logger, config) {
        super();
        this.logger = logger;
        this.config = config;
        this.cache = new Map();
    }
    async checkDuplication(request) {
        const hash = this.generateRequestHash(request);
        const entry = this.cache.get(hash);
        if (entry && entry.expiresAt > Date.now()) {
            entry.duplicateCount++;
            this.emit('cache_hit');
            try {
                return await entry.responsePromise;
            }
            catch (error) {
                // Remove failed entry
                this.cache.delete(hash);
                return null;
            }
        }
        return null;
    }
    generateRequestHash(request) {
        return `${request.method}:${request.endpoint}:${JSON.stringify(request.params)}`;
    }
}
exports.RequestDeduplicator = RequestDeduplicator;
//# sourceMappingURL=RequestDeduplicator.js.map