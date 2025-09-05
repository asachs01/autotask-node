/**
 * Business Rule Configuration System
 * 
 * Provides configuration management for business rules,
 * including loading from files, environment variables, and runtime configuration.
 */

import { BusinessRule, RulePriority } from './BusinessRule';
import { BusinessRuleEngine, RuleEngineOptions } from './BusinessRuleEngine';
import { EntityRuleFactory } from './EntityRules';
import { ErrorLogger } from '../errors/ErrorLogger';
import * as fs from 'fs';
import * as path from 'path';

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
export class RuleConfigurationLoader {
  private config: BusinessRuleConfig = {};
  private configPath?: string;
  private errorLogger?: ErrorLogger;
  
  constructor(errorLogger?: ErrorLogger) {
    this.errorLogger = errorLogger;
  }
  
  /**
   * Load configuration from file
   */
  async loadFromFile(filePath: string): Promise<BusinessRuleConfig> {
    try {
      const absolutePath = path.resolve(filePath);
      this.configPath = absolutePath;
      
      if (!fs.existsSync(absolutePath)) {
        this.logWarn(`Configuration file not found: ${absolutePath}`);
        return this.config;
      }
      
      const content = fs.readFileSync(absolutePath, 'utf-8');
      const fileConfig = JSON.parse(content) as BusinessRuleConfig;
      
      this.config = this.mergeConfigs(this.config, fileConfig);
      this.logInfo(`Loaded configuration from ${absolutePath}`);
      
      return this.config;
    } catch (error) {
      this.logError(`Failed to load configuration from file`, error as Error);
      throw error;
    }
  }
  
  /**
   * Load configuration from environment variables
   */
  loadFromEnvironment(): BusinessRuleConfig {
    const envConfig: BusinessRuleConfig = {
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
        envConfig.features![featureName] = process.env[key] === 'true';
      }
    });
    
    this.config = this.mergeConfigs(this.config, envConfig);
    this.logInfo('Loaded configuration from environment variables');
    
    return this.config;
  }
  
  /**
   * Load configuration from object
   */
  loadFromObject(config: BusinessRuleConfig): BusinessRuleConfig {
    this.config = this.mergeConfigs(this.config, config);
    this.logInfo('Loaded configuration from object');
    return this.config;
  }
  
  /**
   * Save configuration to file
   */
  async saveToFile(filePath?: string): Promise<void> {
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
    } catch (error) {
      this.logError('Failed to save configuration to file', error as Error);
      throw error;
    }
  }
  
  /**
   * Get the current configuration
   */
  getConfiguration(): BusinessRuleConfig {
    return { ...this.config };
  }
  
  /**
   * Create and configure a BusinessRuleEngine
   */
  createEngine(): BusinessRuleEngine {
    const engineOptions: RuleEngineOptions = {
      ...this.config.engine,
      errorLogger: this.errorLogger
    };
    
    const engine = new BusinessRuleEngine(engineOptions);
    
    // Apply configuration to engine
    this.applyConfigurationToEngine(engine);
    
    return engine;
  }
  
  /**
   * Apply configuration to an existing engine
   */
  applyConfigurationToEngine(engine: BusinessRuleEngine): void {
    // Load entity-specific rules
    const allEntityRules = EntityRuleFactory.getAllRules();
    
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
  private findRuleConfig(ruleName: string, configs: RuleConfig[]): RuleConfig | undefined {
    return configs.find(c => c.name === ruleName);
  }
  
  /**
   * Apply configuration to a rule
   */
  private applyRuleConfig(rule: BusinessRule, config: Partial<RuleConfig>): void {
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
  private createRuleFromConfig(config: RuleConfig): BusinessRule | null {
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
        priority: config.priority ?? RulePriority.NORMAL,
        appliesTo: config.appliesTo,
        validate: validationFunction as any
      };
    } catch (error) {
      this.logError(`Failed to create rule from config: ${config.name}`, error as Error);
      return null;
    }
  }
  
  /**
   * Merge two configurations
   */
  private mergeConfigs(base: BusinessRuleConfig, override: BusinessRuleConfig): BusinessRuleConfig {
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
  private getEnvBoolean(key: string): boolean | undefined {
    const value = process.env[key];
    if (value === undefined) return undefined;
    return value.toLowerCase() === 'true';
  }
  
  /**
   * Get environment variable as number
   */
  private getEnvNumber(key: string): number | undefined {
    const value = process.env[key];
    if (value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }
  
  // Logging helpers
  private logInfo(message: string): void {
    this.errorLogger?.info(message, { component: 'RuleConfigurationLoader' });
  }
  
  private logWarn(message: string): void {
    this.errorLogger?.warn(message, undefined, { component: 'RuleConfigurationLoader' });
  }
  
  private logError(message: string, error: Error): void {
    this.errorLogger?.error(message, error, { component: 'RuleConfigurationLoader' });
  }
}

/**
 * Default configuration factory
 */
export class DefaultRuleConfiguration {
  /**
   * Create development configuration
   */
  static development(): BusinessRuleConfig {
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
  static production(): BusinessRuleConfig {
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
  static testing(): BusinessRuleConfig {
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
  static forEnvironment(env?: string): BusinessRuleConfig {
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

/**
 * Singleton rule configuration manager
 */
export class RuleConfigurationManager {
  private static instance: RuleConfigurationManager;
  private loader: RuleConfigurationLoader;
  private engine?: BusinessRuleEngine;
  
  private constructor(errorLogger?: ErrorLogger) {
    this.loader = new RuleConfigurationLoader(errorLogger);
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(errorLogger?: ErrorLogger): RuleConfigurationManager {
    if (!this.instance) {
      this.instance = new RuleConfigurationManager(errorLogger);
    }
    return this.instance;
  }
  
  /**
   * Initialize configuration
   */
  async initialize(options?: {
    configFile?: string;
    loadEnvironment?: boolean;
    config?: BusinessRuleConfig;
  }): Promise<void> {
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
  getEngine(): BusinessRuleEngine {
    if (!this.engine) {
      this.engine = this.loader.createEngine();
    }
    return this.engine;
  }
  
  /**
   * Get the configuration loader
   */
  getLoader(): RuleConfigurationLoader {
    return this.loader;
  }
  
  /**
   * Reset the singleton instance (mainly for testing)
   */
  static reset(): void {
    this.instance = undefined as any;
  }
}