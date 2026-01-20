/**
 * TTL (Time-To-Live) Management System
 *
 * Manages intelligent TTL calculation based on entity types, request patterns,
 * and adaptive algorithms that adjust TTL based on data volatility.
 */
import { EntityCacheConfig } from './types';
/**
 * TTL calculation strategies
 */
export declare enum TTLStrategy {
    /** Fixed TTL based on entity configuration */
    FIXED = "fixed",
    /** Adaptive TTL based on update frequency */
    ADAPTIVE = "adaptive",
    /** TTL based on time of day patterns */
    TIME_AWARE = "time_aware",
    /** TTL based on content volatility */
    VOLATILITY_BASED = "volatility_based",
    /** TTL based on business rules */
    BUSINESS_RULES = "business_rules"
}
/**
 * Entity volatility levels affecting TTL
 */
export declare enum VolatilityLevel {
    VERY_LOW = "very_low",// Companies, configuration items
    LOW = "low",// Contracts, projects
    MEDIUM = "medium",// Resources, contacts
    HIGH = "high",// Tasks, opportunities
    VERY_HIGH = "very_high"
}
/**
 * TTL calculation context
 */
export interface TTLContext {
    /** Entity type */
    entityType: string;
    /** HTTP method */
    method: string;
    /** Response data for analysis */
    responseData?: any;
    /** Request parameters */
    requestParams?: Record<string, any>;
    /** Current time */
    timestamp: number;
    /** User/session context */
    userContext?: string;
    /** Historical update frequency data */
    updateFrequency?: UpdateFrequencyData;
}
/**
 * Update frequency tracking data
 */
export interface UpdateFrequencyData {
    /** Entity type */
    entityType: string;
    /** Last update timestamp */
    lastUpdate: number;
    /** Average time between updates (ms) */
    avgUpdateInterval: number;
    /** Standard deviation of update intervals */
    updateVariance: number;
    /** Number of updates in tracking window */
    updateCount: number;
    /** Tracking window start */
    windowStart: number;
}
/**
 * TTL calculation result
 */
export interface TTLResult {
    /** Calculated TTL in milliseconds */
    ttl: number;
    /** Strategy used for calculation */
    strategy: TTLStrategy;
    /** Confidence level in the TTL (0-1) */
    confidence: number;
    /** Reasoning for the TTL value */
    reason: string;
    /** Minimum TTL applied */
    minTtl: number;
    /** Maximum TTL applied */
    maxTtl: number;
}
/**
 * Business hours configuration
 */
export interface BusinessHoursConfig {
    /** Start hour (24-hour format) */
    startHour: number;
    /** End hour (24-hour format) */
    endHour: number;
    /** Working days (0 = Sunday, 6 = Saturday) */
    workingDays: number[];
    /** Timezone */
    timezone: string;
}
/**
 * TTL Manager for intelligent time-to-live calculations
 */
export declare class TTLManager {
    private readonly entityConfigs;
    private readonly volatilityMap;
    private readonly updateFrequencyMap;
    private readonly businessHours;
    private readonly DEFAULT_TTLS;
    constructor(entityConfigs: Map<string, EntityCacheConfig>, businessHours?: BusinessHoursConfig);
    /**
     * Calculate TTL for a cache entry
     */
    calculateTTL(context: TTLContext, strategy?: TTLStrategy): TTLResult;
    /**
     * Update frequency tracking for adaptive TTL
     */
    trackUpdate(entityType: string, timestamp?: number): void;
    /**
     * Get update frequency data for an entity
     */
    getUpdateFrequency(entityType: string): UpdateFrequencyData | undefined;
    /**
     * Clear update frequency data
     */
    clearUpdateFrequency(entityType?: string): void;
    /**
     * Calculate fixed TTL based on configuration
     */
    private calculateFixedTTL;
    /**
     * Calculate adaptive TTL based on update patterns
     */
    private calculateAdaptiveTTL;
    /**
     * Calculate time-aware TTL based on business hours
     */
    private calculateTimeAwareTTL;
    /**
     * Calculate TTL based purely on volatility
     */
    private calculateVolatilityBasedTTL;
    /**
     * Calculate TTL based on business rules
     */
    private calculateBusinessRulesTTL;
    /**
     * Initialize volatility mapping for different entity types
     */
    private initializeVolatilityMap;
    /**
     * Get volatility level for an entity type
     */
    getVolatilityLevel(entityType: string): VolatilityLevel;
    /**
     * Update volatility level for an entity type
     */
    setVolatilityLevel(entityType: string, level: VolatilityLevel): void;
    /**
     * Get all volatility mappings
     */
    getVolatilityMappings(): Map<string, VolatilityLevel>;
}
//# sourceMappingURL=TTLManager.d.ts.map