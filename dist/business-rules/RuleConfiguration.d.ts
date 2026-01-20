/**
 * Business Rule Configuration System
 *
 * Provides configuration management for business rules,
 * including loading from files, environment variables, and runtime configuration.
 */
import { BusinessRuleEngine } from './BusinessRuleEngine';
import { ErrorLogger } from '../errors/ErrorLogger';
/**
 * Rule configuration structure
 */
export interface RuleConfig {
    /** Rule name */
    name: string;
    /** Whether the rule is enabled */
    enabled?: boolean;
    /** Rule priority override */
    priority?: number;
    /** Entity types to apply to */
    appliesTo?: string[];
    /** Rule-specific configuration */
    config?: Record<string, any>;
    /** Custom validation function (as string to be evaluated) */
    customValidation?: string;
}
/**
 * Engine configuration
 */
export interface EngineConfig {
    /** Enable caching */
    enableCache?: boolean;
    /** Cache TTL in milliseconds */
    cacheTTL?: number;
    /** Maximum cache size */
    maxCacheSize?: number;
    /** Enable parallel execution */
    enableParallelExecution?: boolean;
    /** Maximum parallel rules */
    maxParallelRules?: number;
    /** Enable performance tracking */
    enablePerformanceTracking?: boolean;
    /** Stop on first error */
    stopOnFirstError?: boolean;
}
/**
 * Complete configuration structure
 */
export interface BusinessRuleConfig {
    /** Engine configuration */
    engine?: EngineConfig;
    /** Global rules that apply to all entities */
    globalRules?: RuleConfig[];
    /** Entity-specific rule configurations */
    entityRules?: Record<string, RuleConfig[]>;
    /** Rule overrides */
    overrides?: Record<string, Partial<RuleConfig>>;
    /** Feature flags */
    features?: Record<string, boolean>;
}
/**
 * Configuration loader for business rules
 */
export declare class RuleConfigurationLoader {
    private config;
    private configPath?;
    private errorLogger?;
    constructor(errorLogger?: ErrorLogger);
    /**
     * Load configuration from file
     */
    loadFromFile(filePath: string): Promise<BusinessRuleConfig>;
    /**
     * Load configuration from environment variables
     */
    loadFromEnvironment(): BusinessRuleConfig;
    /**
     * Load configuration from object
     */
    loadFromObject(config: BusinessRuleConfig): BusinessRuleConfig;
    /**
     * Save configuration to file
     */
    saveToFile(filePath?: string): Promise<void>;
    /**
     * Get the current configuration
     */
    getConfiguration(): BusinessRuleConfig;
    /**
     * Create and configure a BusinessRuleEngine
     */
    createEngine(): BusinessRuleEngine;
    /**
     * Apply configuration to an existing engine
     */
    applyConfigurationToEngine(engine: BusinessRuleEngine): void;
    /**
     * Find rule configuration by name
     */
    private findRuleConfig;
    /**
     * Apply configuration to a rule
     */
    private applyRuleConfig;
    /**
     * Create a rule from configuration
     */
    private createRuleFromConfig;
    /**
     * Merge two configurations
     */
    private mergeConfigs;
    /**
     * Get environment variable as boolean
     */
    private getEnvBoolean;
    /**
     * Get environment variable as number
     */
    private getEnvNumber;
    private logInfo;
    private logWarn;
    private logError;
}
/**
 * Default configuration factory
 */
export declare class DefaultRuleConfiguration {
    /**
     * Create development configuration
     */
    static development(): BusinessRuleConfig;
    /**
     * Create production configuration
     */
    static production(): BusinessRuleConfig;
    /**
     * Create testing configuration
     */
    static testing(): BusinessRuleConfig;
    /**
     * Get configuration based on environment
     */
    static forEnvironment(env?: string): BusinessRuleConfig;
}
/**
 * Singleton rule configuration manager
 */
export declare class RuleConfigurationManager {
    private static instance;
    private loader;
    private engine?;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(errorLogger?: ErrorLogger): RuleConfigurationManager;
    /**
     * Initialize configuration
     */
    initialize(options?: {
        configFile?: string;
        loadEnvironment?: boolean;
        config?: BusinessRuleConfig;
    }): Promise<void>;
    /**
     * Get or create the rule engine
     */
    getEngine(): BusinessRuleEngine;
    /**
     * Get the configuration loader
     */
    getLoader(): RuleConfigurationLoader;
    /**
     * Reset the singleton instance (mainly for testing)
     */
    static reset(): void;
}
//# sourceMappingURL=RuleConfiguration.d.ts.map