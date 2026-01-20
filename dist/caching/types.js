"use strict";
/**
 * Core types for the Autotask SDK caching system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidationPattern = exports.CacheStrategy = exports.CacheStorageType = void 0;
exports.toError = toError;
/**
 * Cache storage backends supported
 */
var CacheStorageType;
(function (CacheStorageType) {
    CacheStorageType["MEMORY"] = "memory";
    CacheStorageType["REDIS"] = "redis";
    CacheStorageType["FILE"] = "file";
})(CacheStorageType || (exports.CacheStorageType = CacheStorageType = {}));
/**
 * Cache strategies for different scenarios
 */
var CacheStrategy;
(function (CacheStrategy) {
    /** Cache all responses for specified TTL */
    CacheStrategy["WRITE_THROUGH"] = "write_through";
    /** Cache on read, write through on update */
    CacheStrategy["LAZY_LOADING"] = "lazy_loading";
    /** Cache with background refresh */
    CacheStrategy["REFRESH_AHEAD"] = "refresh_ahead";
    /** Cache with write-behind persistence */
    CacheStrategy["WRITE_BEHIND"] = "write_behind";
    /** No caching */
    CacheStrategy["NONE"] = "none";
})(CacheStrategy || (exports.CacheStrategy = CacheStrategy = {}));
/**
 * Cache invalidation patterns
 */
var InvalidationPattern;
(function (InvalidationPattern) {
    /** Invalidate single key */
    InvalidationPattern["SINGLE"] = "single";
    /** Invalidate multiple keys */
    InvalidationPattern["BATCH"] = "batch";
    /** Invalidate by pattern matching */
    InvalidationPattern["PATTERN"] = "pattern";
    /** Invalidate by tags */
    InvalidationPattern["TAG_BASED"] = "tag_based";
    /** Time-based invalidation */
    InvalidationPattern["TTL"] = "ttl";
})(InvalidationPattern || (exports.InvalidationPattern = InvalidationPattern = {}));
/**
 * Utility function to safely convert unknown errors to Error objects
 */
function toError(error) {
    if (error instanceof Error) {
        return error;
    }
    return new Error(String(error));
}
//# sourceMappingURL=types.js.map