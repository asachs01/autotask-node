"use strict";
/**
 * Cache Key Generation System
 *
 * Generates consistent, collision-resistant cache keys based on request context,
 * with support for hierarchical keys and intelligent parameter handling.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeyGenerator = exports.DEFAULT_KEY_OPTIONS = exports.KeyStrategy = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Cache key generation strategies
 */
var KeyStrategy;
(function (KeyStrategy) {
    /** Simple string concatenation */
    KeyStrategy["SIMPLE"] = "simple";
    /** Hash-based key generation */
    KeyStrategy["HASH"] = "hash";
    /** Hierarchical key structure */
    KeyStrategy["HIERARCHICAL"] = "hierarchical";
    /** Semantic key with meaningful components */
    KeyStrategy["SEMANTIC"] = "semantic";
})(KeyStrategy || (exports.KeyStrategy = KeyStrategy = {}));
/**
 * Default key generation options
 */
exports.DEFAULT_KEY_OPTIONS = {
    strategy: KeyStrategy.HIERARCHICAL,
    maxLength: 250,
    includeUser: false,
    includeTimestamp: false,
    sortParams: true
};
/**
 * Cache key generator with multiple strategies for different use cases
 */
class CacheKeyGenerator {
    constructor(options = {}) {
        this.separator = ':';
        this.hashAlgorithm = 'sha256';
        this.options = { ...exports.DEFAULT_KEY_OPTIONS, ...options };
    }
    /**
     * Generate a cache key from request context
     */
    generateKey(context) {
        switch (this.options.strategy) {
            case KeyStrategy.SIMPLE:
                return this.generateSimpleKey(context);
            case KeyStrategy.HASH:
                return this.generateHashKey(context);
            case KeyStrategy.HIERARCHICAL:
                return this.generateHierarchicalKey(context);
            case KeyStrategy.SEMANTIC:
                return this.generateSemanticKey(context);
            default:
                return this.generateHierarchicalKey(context);
        }
    }
    /**
     * Generate multiple keys for batch operations
     */
    generateBatchKeys(contexts) {
        return contexts.map(context => this.generateKey(context));
    }
    /**
     * Generate a pattern key for invalidation
     */
    generatePatternKey(entityType, pattern) {
        const parts = [this.options.prefix, 'autotask', entityType];
        if (pattern) {
            parts.push(pattern);
        }
        else {
            parts.push('*');
        }
        return this.cleanKey(parts.join(this.separator));
    }
    /**
     * Generate keys for tag-based invalidation
     */
    generateTagKey(tag) {
        const parts = [this.options.prefix, 'tags', tag].filter(Boolean);
        return this.cleanKey(parts.join(this.separator));
    }
    /**
     * Extract entity type from cache key
     */
    extractEntityType(key) {
        const parts = key.split(this.separator);
        const autotaskIndex = parts.indexOf('autotask');
        if (autotaskIndex !== -1 && parts.length > autotaskIndex + 1) {
            return parts[autotaskIndex + 1];
        }
        return null;
    }
    /**
     * Simple string concatenation strategy
     */
    generateSimpleKey(context) {
        const parts = [
            this.options.prefix,
            context.entityType,
            context.method,
            this.normalizeEndpoint(context.endpoint)
        ].filter(Boolean);
        if (context.params) {
            parts.push(this.serializeParams(context.params));
        }
        if (context.body && ['POST', 'PUT', 'PATCH'].includes(context.method)) {
            parts.push(this.hashObject(context.body).substring(0, 8));
        }
        return this.cleanKey(parts.join('_'));
    }
    /**
     * Hash-based key generation for compact keys
     */
    generateHashKey(context) {
        const keyData = {
            entityType: context.entityType,
            method: context.method,
            endpoint: this.normalizeEndpoint(context.endpoint),
            params: this.normalizeParams(context.params),
            body: context.body,
            userContext: this.options.includeUser ? context.userContext : undefined
        };
        const keyString = JSON.stringify(keyData);
        const hash = this.hashString(keyString).substring(0, 16);
        const prefix = this.options.prefix || 'autotask';
        return `${prefix}:${context.entityType}:${hash}`;
    }
    /**
     * Hierarchical key structure for organization
     */
    generateHierarchicalKey(context) {
        const parts = [
            this.options.prefix || 'autotask',
            context.entityType,
            context.method.toLowerCase()
        ];
        // Add endpoint path segments
        const endpointParts = this.normalizeEndpoint(context.endpoint)
            .split('/')
            .filter(part => part && !part.match(/^v\d+$/)); // Remove version segments
        parts.push(...endpointParts.slice(0, 2)); // Limit depth
        // Add parameter signature
        if (context.params) {
            const paramSignature = this.generateParamSignature(context.params);
            if (paramSignature) {
                parts.push(paramSignature);
            }
        }
        // Add body signature for write operations
        if (context.body && ['POST', 'PUT', 'PATCH'].includes(context.method)) {
            parts.push('body', this.hashObject(context.body).substring(0, 8));
        }
        // Add user context if enabled
        if (this.options.includeUser && context.userContext) {
            parts.push('user', this.hashString(context.userContext).substring(0, 8));
        }
        // Add timestamp for time-sensitive operations
        if (this.options.includeTimestamp) {
            const timeWindow = Math.floor(Date.now() / 300000); // 5-minute windows
            parts.push('t', timeWindow.toString());
        }
        const key = parts.join(this.separator);
        return this.cleanKey(key);
    }
    /**
     * Semantic key generation with meaningful components
     */
    generateSemanticKey(context) {
        const parts = [this.options.prefix || 'autotask'];
        // Entity and operation
        parts.push(context.entityType, context.method.toLowerCase());
        // Semantic endpoint analysis
        const endpoint = this.normalizeEndpoint(context.endpoint);
        if (endpoint.includes('search')) {
            parts.push('search');
        }
        else if (endpoint.match(/\/\d+$/)) {
            parts.push('single');
        }
        else if (context.method === 'GET' && !context.params?.id) {
            parts.push('list');
        }
        // Key parameters that affect response
        if (context.params) {
            const semanticParams = this.extractSemanticParams(context.params);
            if (semanticParams.length > 0) {
                parts.push(...semanticParams);
            }
        }
        const key = parts.join(this.separator);
        return this.cleanKey(key);
    }
    /**
     * Generate a compact signature for parameters
     */
    generateParamSignature(params) {
        const filteredParams = { ...params };
        // Remove ignored parameters
        this.options.ignoreParams?.forEach(param => {
            delete filteredParams[param];
        });
        if (Object.keys(filteredParams).length === 0) {
            return '';
        }
        // Sort keys for consistency if enabled
        if (this.options.sortParams) {
            const sortedParams = {};
            Object.keys(filteredParams).sort().forEach(key => {
                sortedParams[key] = filteredParams[key];
            });
            return this.hashObject(sortedParams).substring(0, 12);
        }
        return this.hashObject(filteredParams).substring(0, 12);
    }
    /**
     * Extract semantically meaningful parameters
     */
    extractSemanticParams(params) {
        const semanticParams = [];
        // Common semantic parameters
        if (params.filter) {
            semanticParams.push('filtered');
        }
        if (params.search || params.query) {
            semanticParams.push('search');
        }
        if (params.orderby || params.sort) {
            semanticParams.push('sorted');
        }
        if (params.top || params.limit) {
            semanticParams.push(`top${params.top || params.limit}`);
        }
        if (params.skip || params.offset) {
            semanticParams.push('paged');
        }
        // Entity-specific parameters
        if (params.companyId || params.company_id) {
            semanticParams.push('byCompany');
        }
        if (params.status) {
            const statusHash = this.hashString(params.status.toString()).substring(0, 4);
            semanticParams.push(`status${statusHash}`);
        }
        return semanticParams;
    }
    /**
     * Normalize endpoint by removing variable parts
     */
    normalizeEndpoint(endpoint) {
        return endpoint
            .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
            .replace(/\/v\d+\//, '/') // Remove version
            .replace(/\/\d+/g, '/{id}') // Replace IDs with placeholder
            .replace(/\/[a-f0-9-]{36}/gi, '/{uuid}') // Replace UUIDs
            .toLowerCase();
    }
    /**
     * Normalize parameters by removing null/undefined values and sorting
     */
    normalizeParams(params) {
        if (!params)
            return undefined;
        const normalized = {};
        Object.entries(params)
            .filter(([_, value]) => value !== null && value !== undefined)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([key, value]) => {
            normalized[key] = value;
        });
        return Object.keys(normalized).length > 0 ? normalized : undefined;
    }
    /**
     * Serialize parameters to string
     */
    serializeParams(params) {
        const normalized = this.normalizeParams(params);
        if (!normalized)
            return '';
        return Object.entries(normalized)
            .map(([key, value]) => `${key}=${String(value)}`)
            .join('&');
    }
    /**
     * Hash a string using the configured algorithm
     */
    hashString(input) {
        return crypto_1.default.createHash(this.hashAlgorithm).update(input).digest('hex');
    }
    /**
     * Hash an object by stringifying it first
     */
    hashObject(obj) {
        const jsonString = JSON.stringify(obj, Object.keys(obj).sort());
        return this.hashString(jsonString);
    }
    /**
     * Clean and validate the generated key
     */
    cleanKey(key) {
        // Replace invalid characters
        let cleanedKey = key
            .replace(/[^a-zA-Z0-9:_\-.]/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_|_$/g, '');
        // Ensure key doesn't exceed max length
        if (cleanedKey.length > this.options.maxLength) {
            const hash = this.hashString(cleanedKey).substring(0, 8);
            const truncated = cleanedKey.substring(0, this.options.maxLength - 9);
            cleanedKey = `${truncated}_${hash}`;
        }
        return cleanedKey;
    }
    /**
     * Validate if a key follows the expected format
     */
    isValidKey(key) {
        return key.length > 0 &&
            key.length <= this.options.maxLength &&
            /^[a-zA-Z0-9:_\-.]+$/.test(key) &&
            !key.includes('__');
    }
    /**
     * Get configuration information
     */
    getConfig() {
        return { ...this.options };
    }
}
exports.CacheKeyGenerator = CacheKeyGenerator;
//# sourceMappingURL=CacheKeyGenerator.js.map