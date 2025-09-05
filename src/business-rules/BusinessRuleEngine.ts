/**
 * Business Rule Engine
 * 
 * Manages registration and execution of business rules for entity validation.
 * Supports rule prioritization, caching, and performance optimization.
 */

import { BusinessRule, RuleContext, RulePriority } from './BusinessRule';
import { ValidationResult, ValidationSeverity } from './ValidationResult';
import { ErrorLogger, LogLevel } from '../errors/ErrorLogger';

/**
 * Options for rule engine configuration
 */
export interface RuleEngineOptions {
  /** Enable caching of rule results */
  enableCache?: boolean;
  
  /** Cache TTL in milliseconds */
  cacheTTL?: number;
  
  /** Maximum cache size */
  maxCacheSize?: number;
  
  /** Enable parallel rule execution */
  enableParallelExecution?: boolean;
  
  /** Maximum parallel rules to execute */
  maxParallelRules?: number;
  
  /** Enable performance tracking */
  enablePerformanceTracking?: boolean;
  
  /** Stop validation on first error */
  stopOnFirstError?: boolean;
  
  /** Error logger instance */
  errorLogger?: ErrorLogger;
}

/**
 * Rule execution statistics
 */
export interface RuleExecutionStats {
  ruleName: string;
  executionTime: number;
  passed: boolean;
  errorCount: number;
  warningCount: number;
}

/**
 * Cache entry for validation results
 */
interface CacheEntry {
  result: ValidationResult;
  timestamp: number;
  hash: string;
}

/**
 * Business Rule Engine
 */
export class BusinessRuleEngine {
  private rules: Map<string, BusinessRule[]> = new Map();
  private globalRules: BusinessRule[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private stats: Map<string, RuleExecutionStats[]> = new Map();
  private options: Required<Omit<RuleEngineOptions, 'errorLogger'>> & { errorLogger?: ErrorLogger };
  private errorLogger?: ErrorLogger;
  
  constructor(options: RuleEngineOptions = {}) {
    this.options = {
      enableCache: options.enableCache ?? false,
      cacheTTL: options.cacheTTL ?? 5 * 60 * 1000, // 5 minutes
      maxCacheSize: options.maxCacheSize ?? 1000,
      enableParallelExecution: options.enableParallelExecution ?? false,
      maxParallelRules: options.maxParallelRules ?? 5,
      enablePerformanceTracking: options.enablePerformanceTracking ?? false,
      stopOnFirstError: options.stopOnFirstError ?? false,
      errorLogger: options.errorLogger
    };
    
    this.errorLogger = options.errorLogger;
  }
  
  /**
   * Register a rule for specific entity type(s)
   */
  registerRule(entityType: string | string[], rule: BusinessRule): void {
    const types = Array.isArray(entityType) ? entityType : [entityType];
    
    for (const type of types) {
      if (!this.rules.has(type)) {
        this.rules.set(type, []);
      }
      
      const rules = this.rules.get(type)!;
      
      // Check for duplicate rule names
      const existingIndex = rules.findIndex(r => r.name === rule.name);
      if (existingIndex >= 0) {
        // Replace existing rule
        rules[existingIndex] = rule;
        this.logDebug(`Replaced rule '${rule.name}' for entity type '${type}'`);
      } else {
        rules.push(rule);
        this.logDebug(`Registered rule '${rule.name}' for entity type '${type}'`);
      }
      
      // Sort rules by priority
      rules.sort((a, b) => {
        const priorityA = a.priority ?? RulePriority.NORMAL;
        const priorityB = b.priority ?? RulePriority.NORMAL;
        return priorityA - priorityB;
      });
    }
    
    // If rule has appliesTo, register for those types as well
    if (rule.appliesTo && rule.appliesTo.length > 0) {
      for (const type of rule.appliesTo) {
        if (!types.includes(type)) {
          this.registerRule(type, rule);
        }
      }
    }
  }
  
  /**
   * Register a global rule that applies to all entity types
   */
  registerGlobalRule(rule: BusinessRule): void {
    const existingIndex = this.globalRules.findIndex(r => r.name === rule.name);
    
    if (existingIndex >= 0) {
      this.globalRules[existingIndex] = rule;
      this.logDebug(`Replaced global rule '${rule.name}'`);
    } else {
      this.globalRules.push(rule);
      this.logDebug(`Registered global rule '${rule.name}'`);
    }
    
    // Sort by priority
    this.globalRules.sort((a, b) => {
      const priorityA = a.priority ?? RulePriority.NORMAL;
      const priorityB = b.priority ?? RulePriority.NORMAL;
      return priorityA - priorityB;
    });
  }
  
  /**
   * Unregister a rule
   */
  unregisterRule(entityType: string, ruleName: string): boolean {
    const rules = this.rules.get(entityType);
    if (!rules) return false;
    
    const index = rules.findIndex(r => r.name === ruleName);
    if (index >= 0) {
      rules.splice(index, 1);
      this.logDebug(`Unregistered rule '${ruleName}' for entity type '${entityType}'`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Unregister a global rule
   */
  unregisterGlobalRule(ruleName: string): boolean {
    const index = this.globalRules.findIndex(r => r.name === ruleName);
    if (index >= 0) {
      this.globalRules.splice(index, 1);
      this.logDebug(`Unregistered global rule '${ruleName}'`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all rules for an entity type
   */
  getRules(entityType: string): BusinessRule[] {
    const typeRules = this.rules.get(entityType) || [];
    return [...this.globalRules, ...typeRules];
  }
  
  /**
   * Get a specific rule by name
   */
  getRule(entityType: string, ruleName: string): BusinessRule | undefined {
    const rules = this.getRules(entityType);
    return rules.find(r => r.name === ruleName);
  }
  
  /**
   * List all registered entity types
   */
  getEntityTypes(): string[] {
    return Array.from(this.rules.keys());
  }
  
  /**
   * Validate an entity
   */
  async validateEntity(
    entityType: string,
    entity: any,
    context?: RuleContext
  ): Promise<ValidationResult> {
    const correlationId = this.errorLogger?.generateCorrelationId();
    const startTime = Date.now();
    
    try {
      // Check cache if enabled
      if (this.options.enableCache) {
        const cached = this.getCachedResult(entityType, entity);
        if (cached) {
          this.logDebug(`Cache hit for entity type '${entityType}'`, { correlationId });
          return cached;
        }
      }
      
      // Get applicable rules
      const rules = this.getRules(entityType);
      
      if (rules.length === 0) {
        this.logDebug(`No rules found for entity type '${entityType}'`, { correlationId });
        return ValidationResult.success();
      }
      
      // Create context with entity type
      const fullContext: RuleContext = {
        ...context,
        entityType
      };
      
      // Execute rules
      const result = await this.executeRules(rules, entity, fullContext, correlationId);
      
      // Cache result if enabled
      if (this.options.enableCache) {
        this.cacheResult(entityType, entity, result);
      }
      
      // Log validation summary
      const summary = result.getSummary();
      const duration = Date.now() - startTime;
      
      if (result.isValid) {
        this.logInfo(
          `Validation passed for entity type '${entityType}'`,
          { correlationId, duration, summary }
        );
      } else {
        this.logWarn(
          `Validation failed for entity type '${entityType}'`,
          { correlationId, duration, summary }
        );
      }
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logError(
        `Error validating entity type '${entityType}'`,
        error as Error,
        { correlationId, duration }
      );
      
      // Return error result
      const result = new ValidationResult();
      result.addError(
        'VALIDATION_ERROR',
        `Validation failed: ${(error as Error).message}`,
        undefined,
        { entityType, error: (error as Error).message }
      );
      return result;
    }
  }
  
  /**
   * Execute rules
   */
  private async executeRules(
    rules: BusinessRule[],
    entity: any,
    context: RuleContext,
    correlationId?: string
  ): Promise<ValidationResult> {
    const result = new ValidationResult();
    const stats: RuleExecutionStats[] = [];
    
    if (this.options.enableParallelExecution) {
      // Execute rules in parallel batches
      const batches = this.createRuleBatches(rules);
      
      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(rule => this.executeRule(rule, entity, context, stats))
        );
        
        for (const ruleResult of batchResults) {
          if (ruleResult) {
            result.merge(ruleResult);
            
            if (this.options.stopOnFirstError && ruleResult.hasErrors()) {
              break;
            }
          }
        }
        
        if (this.options.stopOnFirstError && result.hasErrors()) {
          break;
        }
      }
    } else {
      // Execute rules sequentially
      for (const rule of rules) {
        const ruleResult = await this.executeRule(rule, entity, context, stats);
        
        if (ruleResult) {
          result.merge(ruleResult);
          
          if (this.options.stopOnFirstError && ruleResult.hasErrors()) {
            break;
          }
        }
      }
    }
    
    // Store stats if tracking is enabled
    if (this.options.enablePerformanceTracking && stats.length > 0) {
      const key = `${context.entityType}-${correlationId}`;
      this.stats.set(key, stats);
    }
    
    return result;
  }
  
  /**
   * Execute a single rule
   */
  private async executeRule(
    rule: BusinessRule,
    entity: any,
    context: RuleContext,
    stats: RuleExecutionStats[]
  ): Promise<ValidationResult | null> {
    const startTime = Date.now();
    
    try {
      // Check if rule is enabled
      if (rule.enabled === false) {
        return null;
      }
      
      // Check condition
      if (rule.condition) {
        const shouldApply = await rule.condition(entity, context);
        if (!shouldApply) {
          return null;
        }
      }
      
      // Execute validation
      const result = await rule.validate(entity, context);
      
      // Add rule name to issues
      const issues = result.getIssues();
      issues.forEach(issue => {
        if (!issue.ruleName) {
          issue.ruleName = rule.name;
        }
      });
      
      // Track stats
      if (this.options.enablePerformanceTracking) {
        stats.push({
          ruleName: rule.name,
          executionTime: Date.now() - startTime,
          passed: !result.hasErrors(),
          errorCount: result.getErrors().length,
          warningCount: result.getWarnings().length
        });
      }
      
      return result;
      
    } catch (error) {
      this.logError(
        `Error executing rule '${rule.name}'`,
        error as Error,
        { entityType: context.entityType }
      );
      
      // Return error result
      const result = new ValidationResult();
      result.addError(
        'RULE_EXECUTION_ERROR',
        `Rule '${rule.name}' failed: ${(error as Error).message}`,
        undefined,
        { ruleName: rule.name, error: (error as Error).message }
      );
      
      // Track stats
      if (this.options.enablePerformanceTracking) {
        stats.push({
          ruleName: rule.name,
          executionTime: Date.now() - startTime,
          passed: false,
          errorCount: 1,
          warningCount: 0
        });
      }
      
      return result;
    }
  }
  
  /**
   * Create rule batches for parallel execution
   */
  private createRuleBatches(rules: BusinessRule[]): BusinessRule[][] {
    const batches: BusinessRule[][] = [];
    const batchSize = this.options.maxParallelRules;
    
    for (let i = 0; i < rules.length; i += batchSize) {
      batches.push(rules.slice(i, i + batchSize));
    }
    
    return batches;
  }
  
  /**
   * Get cached validation result
   */
  private getCachedResult(entityType: string, entity: any): ValidationResult | null {
    const key = this.createCacheKey(entityType, entity);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if cache entry is still valid
    const age = Date.now() - entry.timestamp;
    if (age > this.options.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    // Verify hash matches
    const currentHash = this.hashEntity(entity);
    if (currentHash !== entry.hash) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result;
  }
  
  /**
   * Cache validation result
   */
  private cacheResult(entityType: string, entity: any, result: ValidationResult): void {
    // Check cache size limit
    if (this.cache.size >= this.options.maxCacheSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    const key = this.createCacheKey(entityType, entity);
    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      hash: this.hashEntity(entity)
    };
    
    this.cache.set(key, entry);
  }
  
  /**
   * Create cache key for entity
   */
  private createCacheKey(entityType: string, entity: any): string {
    const id = entity.id || entity.Id || entity._id || JSON.stringify(entity);
    return `${entityType}:${id}`;
  }
  
  /**
   * Create hash of entity for cache validation
   */
  private hashEntity(entity: any): string {
    // Simple hash using JSON stringification
    // In production, consider using a proper hash function
    return JSON.stringify(entity);
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logDebug('Cache cleared');
  }
  
  /**
   * Get performance statistics
   */
  getStatistics(): Map<string, RuleExecutionStats[]> {
    return new Map(this.stats);
  }
  
  /**
   * Clear performance statistics
   */
  clearStatistics(): void {
    this.stats.clear();
    this.logDebug('Statistics cleared');
  }
  
  /**
   * Get rule execution summary
   */
  getRuleSummary(entityType?: string): {
    totalRules: number;
    enabledRules: number;
    globalRules: number;
    entityTypeRules: Map<string, number>;
  } {
    const summary = {
      totalRules: this.globalRules.length,
      enabledRules: this.globalRules.filter(r => r.enabled !== false).length,
      globalRules: this.globalRules.length,
      entityTypeRules: new Map<string, number>()
    };
    
    if (entityType) {
      const rules = this.rules.get(entityType) || [];
      summary.totalRules += rules.length;
      summary.enabledRules += rules.filter(r => r.enabled !== false).length;
      summary.entityTypeRules.set(entityType, rules.length);
    } else {
      for (const [type, rules] of this.rules) {
        summary.totalRules += rules.length;
        summary.enabledRules += rules.filter(r => r.enabled !== false).length;
        summary.entityTypeRules.set(type, rules.length);
      }
    }
    
    return summary;
  }
  
  // Logging helpers
  private logDebug(message: string, context?: any): void {
    this.errorLogger?.debug(message, { component: 'BusinessRuleEngine', ...context });
  }
  
  private logInfo(message: string, context?: any): void {
    this.errorLogger?.info(message, { component: 'BusinessRuleEngine', ...context });
  }
  
  private logWarn(message: string, context?: any): void {
    this.errorLogger?.warn(message, undefined, { component: 'BusinessRuleEngine', ...context });
  }
  
  private logError(message: string, error: Error, context?: any): void {
    this.errorLogger?.error(message, error, { component: 'BusinessRuleEngine', ...context });
  }
}