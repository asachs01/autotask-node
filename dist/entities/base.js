"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
const types_1 = require("../types");
/**
 * Base class for all Autotask entities with enhanced error handling
 */
class BaseEntity {
    constructor(axios, logger, requestHandler) {
        this.axios = axios;
        this.logger = logger;
        // If no request handler is provided, create a basic one
        this.requestHandler =
            requestHandler || new types_1.RequestHandler(this.axios, this.logger);
    }
    /**
     * Execute a request with enhanced error handling and retry logic
     */
    async executeRequest(requestFn, endpoint, method, options = {}) {
        const response = await this.requestHandler.executeRequest(requestFn, endpoint, method, options);
        // Handle Autotask API's behavior of returning {item: null} for non-existent resources
        if (response.data &&
            typeof response.data === 'object' &&
            'item' in response.data) {
            if (response.data.item === null) {
                // Import and throw NotFoundError
                const { NotFoundError } = await Promise.resolve().then(() => __importStar(require('../utils/errors')));
                const resourceType = endpoint.split('/')[1] || 'resource';
                throw new NotFoundError(`Resource not found`, resourceType, undefined, 404, undefined, { endpoint, method });
            }
            return { data: response.data.item };
        }
        return { data: response.data };
    }
    /**
     * Execute a query request (for list operations) with special handling for Autotask API structure
     */
    async executeQueryRequest(requestFn, endpoint, method, options = {}) {
        const response = await this.requestHandler.executeRequest(requestFn, endpoint, method, options);
        // Autotask API returns list data in { items: [...], pageDetails: {...} } format
        if (response.data &&
            typeof response.data === 'object' &&
            'items' in response.data) {
            return { data: response.data.items };
        }
        // Fallback for direct array responses or other formats
        return { data: response.data };
    }
    /**
     * Legacy method for backward compatibility - enhanced with new error handling
     */
    async requestWithRetry(fn, retries = 3, delay = 500, endpoint = 'unknown', method = 'unknown') {
        const response = await this.requestHandler.executeRequest(async () => {
            const result = await fn();
            // Wrap non-axios responses to match expected format
            return { data: result };
        }, endpoint, method, {
            retries,
            baseDelay: delay,
            enableRequestLogging: false, // Disable for legacy compatibility
            enableResponseLogging: false,
        });
        return response.data;
    }
}
exports.BaseEntity = BaseEntity;
//# sourceMappingURL=base.js.map