/**
 * Cache Key Generation System
 *
 * Generates consistent, collision-resistant cache keys based on request context,
 * with support for hierarchical keys and intelligent parameter handling.
 */
import { CacheKeyContext } from './types';
/**
 * Cache key generation strategies
 */
export declare enum KeyStrategy {
    /** Simple string concatenation */
    SIMPLE = "simple",
    /** Hash-based key generation */
    HASH = "hash",
    /** Hierarchical key structure */
    HIERARCHICAL = "hierarchical",
    /** Semantic key with meaningful components */
    SEMANTIC = "semantic"
}
/**
 * Key generation options
 */
export interface KeyGenerationOptions {
    /** Strategy to use for key generation */
    strategy: KeyStrategy;
    /** Maximum key length */
    maxLength: number;
    /** Include user context in key */
    includeUser: boolean;
    /** Include timestamp for time-sensitive caching */
    includeTimestamp: boolean;
    /** Custom prefix */
    prefix?: string;
    /** Parameters to ignore in key generation */
    ignoreParams?: string[];
    /** Parameters to sort (for consistent ordering) */
    sortParams: boolean;
}
/**
 * Default key generation options
 */
export declare const DEFAULT_KEY_OPTIONS: KeyGenerationOptions;
/**
 * Cache key generator with multiple strategies for different use cases
 */
export declare class CacheKeyGenerator {
    private readonly options;
    private readonly separator;
    private readonly hashAlgorithm;
    constructor(options?: Partial<KeyGenerationOptions>);
    /**
     * Generate a cache key from request context
     */
    generateKey(context: CacheKeyContext): string;
    /**
     * Generate multiple keys for batch operations
     */
    generateBatchKeys(contexts: CacheKeyContext[]): string[];
    /**
     * Generate a pattern key for invalidation
     */
    generatePatternKey(entityType: string, pattern?: string): string;
    /**
     * Generate keys for tag-based invalidation
     */
    generateTagKey(tag: string): string;
    /**
     * Extract entity type from cache key
     */
    extractEntityType(key: string): string | null;
    /**
     * Simple string concatenation strategy
     */
    private generateSimpleKey;
    /**
     * Hash-based key generation for compact keys
     */
    private generateHashKey;
    /**
     * Hierarchical key structure for organization
     */
    private generateHierarchicalKey;
    /**
     * Semantic key generation with meaningful components
     */
    private generateSemanticKey;
    /**
     * Generate a compact signature for parameters
     */
    private generateParamSignature;
    /**
     * Extract semantically meaningful parameters
     */
    private extractSemanticParams;
    /**
     * Normalize endpoint by removing variable parts
     */
    private normalizeEndpoint;
    /**
     * Normalize parameters by removing null/undefined values and sorting
     */
    private normalizeParams;
    /**
     * Serialize parameters to string
     */
    private serializeParams;
    /**
     * Hash a string using the configured algorithm
     */
    private hashString;
    /**
     * Hash an object by stringifying it first
     */
    private hashObject;
    /**
     * Clean and validate the generated key
     */
    private cleanKey;
    /**
     * Validate if a key follows the expected format
     */
    isValidKey(key: string): boolean;
    /**
     * Get configuration information
     */
    getConfig(): KeyGenerationOptions;
}
//# sourceMappingURL=CacheKeyGenerator.d.ts.map