"use strict";
/**
 * Business Rule Configuration System
 *
 * Provides configuration management for business rules,
 * including loading from files, environment variables, and runtime configuration.
 */
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
exports.RuleConfigurationManager = exports.DefaultRuleConfiguration = exports.RuleConfigurationLoader = void 0;
const BusinessRule_1 = require("./BusinessRule");
const BusinessRuleEngine_1 = require("./BusinessRuleEngine");
const EntityRules_1 = require("./EntityRules");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Configuration loader for business rules
 */
class RuleConfigurationLoader {
    constructor(errorLogger) {
        this.config = {};
        this.errorLogger = errorLogger;
    }
    /**
     * Load configuration from file
     */
    async loadFromFile(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            this.configPath = absolutePath;
            if (!fs.existsSync(absolutePath)) {
                this.logWarn(`Configuration file not found: ${absolutePath}`);
                return this.config;
            }
            const content = fs.readFileSync(absolutePath, 'utf-8');
            const fileConfig = JSON.parse(content);
            this.config = this.mergeConfigs(this.config, fileConfig);
            this.logInfo(`Loaded configuration from ${absolutePath}`);
            return this.config;
        }
        catch (error) {
            this.logError(`Failed to load configuration from file`, error);
            throw error;
        }
    }
    /**
     * Load configuration from environment variables
     */
    loadFromEnvironment() {
        const envConfig = {
            engine: {
                enableCache: this.getEnvBoolean('BUSINESS_RULES_ENABLE_CACHE'),
                cacheTTL: this.getEnvNumber('BUSINESS_RULES_CACHE_TTL'),
                maxCacheSize: this.getEnvNumber('BUSINESS_RULES_MAX_CACHE_SIZE'),
                enableParallelExecution: this.getEnvBoolean('BUSINESS_RULES_PARALLEL_EXECUTION'),
                maxParallelRules: this.getEnvNumber('BUSINESS_RULES_MAX_PARALLEL'),
                enablePerformanceTracking: this.getEnvBoolean('BUSINESS_RULES_PERFORMANCE_TRACKING'),
                stopOnFirstError: this.getEnvBoolean('BUSINESS_RULES_STOP_ON_ERROR')
            },
            features: {}
        };
        // Load feature flags
        const featurePrefix = 'BUSINESS_RULES_FEATURE_';
        Object.keys(process.env).forEach(key => {
            if (key.startsWith(featurePrefix)) {
                const featureName = key.substring(featurePrefix.length).toLowerCase();
                envConfig.features[featureName] = process.env[key] === 'true';
            }
        });
        this.config = this.mergeConfigs(this.config, envConfig);
        this.logInfo('Loaded configuration from environment variables');
        return this.config;
    }
    /**
     * Load configuration from object
     */
    loadFromObject(config) {
        this.config = this.mergeConfigs(this.config, config);
        this.logInfo('Loaded configuration from object');
        return this.config;
    }
    /**
     * Save configuration to file
     */
    async saveToFile(filePath) {
        try {
            const targetPath = filePath || this.configPath;
            if (!targetPath) {
                throw new Error('No file path specified for saving configuration');
            }
            const absolutePath = path.resolve(targetPath);
            const dir = path.dirname(absolutePath);
            // Create directory if it doesn't exist
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const content = JSON.stringify(this.config, null, 2);
            fs.writeFileSync(absolutePath, content, 'utf-8');
            this.logInfo(`Saved configuration to ${absolutePath}`);
        }
        catch (error) {
            this.logError('Failed to save configuration to file', error);
            throw error;
        }
    }
    /**
     * Get the current configuration
     */
    getConfiguration() {
        return { ...this.config };
    }
    /**
     * Create and configure a BusinessRuleEngine
     */
    createEngine() {
        const engineOptions = {
            ...this.config.engine,
            errorLogger: this.errorLogger
        };
        const engine = new BusinessRuleEngine_1.BusinessRuleEngine(engineOptions);
        // Apply configuration to engine
        this.applyConfigurationToEngine(engine);
        return engine;
    }
    /**
     * Apply configuration to an existing engine
     */
    applyConfigurationToEngine(engine) {
        // Load entity-specific rules
        const allEntityRules = EntityRules_1.EntityRuleFactory.getAllRules();
        for (const [entityType, rules] of allEntityRules) {
            // Get entity-specific configuration
            const entityConfig = this.config.entityRules?.[entityType] || [];
            for (const rule of rules) {
                // Check if rule should be loaded
                const ruleConfig = this.findRuleConfig(rule.name, entityConfig);
                if (ruleConfig && ruleConfig.enabled === false) {
                    continue; // Skip disabled rules
                }
                // Apply configuration overrides
                if (ruleConfig) {
                    this.applyRuleConfig(rule, ruleConfig);
                }
                // Check global overrides
                const override = this.config.overrides?.[rule.name];
                if (override) {
                    this.applyRuleConfig(rule, override);
                }
                // Register the rule
                engine.registerRule(entityType, rule);
            }
        }
        // Load global rules from configuration
        if (this.config.globalRules) {
            for (const ruleConfig of this.config.globalRules) {
                if (ruleConfig.enabled === false) {
                    continue;
                }
                const rule = this.createRuleFromConfig(ruleConfig);
                if (rule) {
                    engine.registerGlobalRule(rule);
                }
            }
        }
        this.logInfo('Applied configuration to business rule engine');
    }
    /**
     * Find rule configuration by name
     */
    findRuleConfig(ruleName, configs) {
        return configs.find(c => c.name === ruleName);
    }
    /**
     * Apply configuration to a rule
     */
    applyRuleConfig(rule, config) {
        if (config.enabled !== undefined) {
            rule.enabled = config.enabled;
        }
        if (config.priority !== undefined) {
            rule.priority = config.priority;
        }
        if (config.appliesTo !== undefined) {
            rule.appliesTo = config.appliesTo;
        }
        // Apply custom configuration
        if (config.config) {
            Object.assign(rule, config.config);
        }
    }
    /**
     * Create a rule from configuration
     */
    createRuleFromConfig(config) {
        if (!config.customValidation) {
            this.logWarn(`No custom validation for rule: ${config.name}`);
            return null;
        }
        try {
            // Create a custom rule from configuration
            // Note: In production, be very careful with eval()
            // Consider using a safer alternative like a rule DSL
            const validationFunction = new Function('entity', 'context', config.customValidation);
            return {
                name: config.name,
                enabled: config.enabled ?? true,
                priority: config.priority ?? BusinessRule_1.RulePriority.NORMAL,
                appliesTo: config.appliesTo,
                validate: validationFunction
            };
        }
        catch (error) {
            this.logError(`Failed to create rule from config: ${config.name}`, error);
            return null;
        }
    }
    /**
     * Merge two configurations
     */
    mergeConfigs(base, override) {
        return {
            engine: { ...base.engine, ...override.engine },
            globalRules: override.globalRules || base.globalRules,
            entityRules: { ...base.entityRules, ...override.entityRules },
            overrides: { ...base.overrides, ...override.overrides },
            features: { ...base.features, ...override.features }
        };
    }
    /**
     * Get environment variable as boolean
     */
    getEnvBoolean(key) {
        const value = process.env[key];
        if (value === undefined)
            return undefined;
        return value.toLowerCase() === 'true';
    }
    /**
     * Get environment variable as number
     */
    getEnvNumber(key) {
        const value = process.env[key];
        if (value === undefined)
            return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
    }
    // Logging helpers
    logInfo(message) {
        this.errorLogger?.info(message, { component: 'RuleConfigurationLoader' });
    }
    logWarn(message) {
        this.errorLogger?.warn(message, undefined, { component: 'RuleConfigurationLoader' });
    }
    logError(message, error) {
        this.errorLogger?.error(message, error, { component: 'RuleConfigurationLoader' });
    }
}
exports.RuleConfigurationLoader = RuleConfigurationLoader;
/**
 * Default configuration factory
 */
class DefaultRuleConfiguration {
    /**
     * Create development configuration
     */
    static development() {
        return {
            engine: {
                enableCache: false,
                cacheTTL: 60000, // 1 minute
                maxCacheSize: 100,
                enableParallelExecution: false,
                maxParallelRules: 5,
                enablePerformanceTracking: true,
                stopOnFirstError: false
            },
            features: {
                strictValidation: true,
                warningsAsErrors: false,
                autoFix: false
            }
        };
    }
    /**
     * Create production configuration
     */
    static production() {
        return {
            engine: {
                enableCache: true,
                cacheTTL: 300000, // 5 minutes
                maxCacheSize: 1000,
                enableParallelExecution: true,
                maxParallelRules: 10,
                enablePerformanceTracking: false,
                stopOnFirstError: false
            },
            features: {
                strictValidation: true,
                warningsAsErrors: false,
                autoFix: false
            }
        };
    }
    /**
     * Create testing configuration
     */
    static testing() {
        return {
            engine: {
                enableCache: false,
                cacheTTL: 0,
                maxCacheSize: 10,
                enableParallelExecution: false,
                maxParallelRules: 1,
                enablePerformanceTracking: false,
                stopOnFirstError: true
            },
            features: {
                strictValidation: true,
                warningsAsErrors: true,
                autoFix: false
            }
        };
    }
    /**
     * Get configuration based on environment
     */
    static forEnvironment(env) {
        const environment = env || process.env.NODE_ENV || 'development';
        switch (environment.toLowerCase()) {
            case 'production':
            case 'prod':
                return this.production();
            case 'test':
            case 'testing':
                return this.testing();
            case 'development':
            case 'dev':
            default:
                return this.development();
        }
    }
}
exports.DefaultRuleConfiguration = DefaultRuleConfiguration;
/**
 * Singleton rule configuration manager
 */
class RuleConfigurationManager {
    constructor(errorLogger) {
        this.loader = new RuleConfigurationLoader(errorLogger);
    }
    /**
     * Get singleton instance
     */
    static getInstance(errorLogger) {
        if (!this.instance) {
            this.instance = new RuleConfigurationManager(errorLogger);
        }
        return this.instance;
    }
    /**
     * Initialize configuration
     */
    async initialize(options) {
        // Load default configuration for environment
        const defaultConfig = DefaultRuleConfiguration.forEnvironment();
        this.loader.loadFromObject(defaultConfig);
        // Load from file if specified
        if (options?.configFile) {
            await this.loader.loadFromFile(options.configFile);
        }
        // Load from environment if requested
        if (options?.loadEnvironment !== false) {
            this.loader.loadFromEnvironment();
        }
        // Apply additional configuration if provided
        if (options?.config) {
            this.loader.loadFromObject(options.config);
        }
    }
    /**
     * Get or create the rule engine
     */
    getEngine() {
        if (!this.engine) {
            this.engine = this.loader.createEngine();
        }
        return this.engine;
    }
    /**
     * Get the configuration loader
     */
    getLoader() {
        return this.loader;
    }
    /**
     * Reset the singleton instance (mainly for testing)
     */
    static reset() {
        this.instance = undefined;
    }
}
exports.RuleConfigurationManager = RuleConfigurationManager;
//# sourceMappingURL=RuleConfiguration.js.map