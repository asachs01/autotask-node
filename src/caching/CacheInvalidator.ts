/**
 * Cache Invalidation System
 * 
 * Provides sophisticated cache invalidation patterns including single key,
 * batch, pattern-based, and intelligent dependency-aware invalidation.
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { ICacheStore, InvalidationPattern, CacheKeyContext, toError } from './types';
import { CacheKeyGenerator } from './CacheKeyGenerator';
import { CacheMetricsCollector } from './CacheMetrics';
import { ErrorLogger, LogContext, defaultErrorLogger } from '../errors/ErrorLogger';

/**
 * Invalidation rule configuration
 */
export interface InvalidationRule {
  /** Rule name/identifier */
  name: string;
  /** Entity type this rule applies to */
  entityType: string;
  /** Invalidation pattern to use */
  pattern: InvalidationPattern;
  /** Target for invalidation (key, pattern, or tag) */
  target: string | string[];
  /** Conditions that must be met for rule to apply */
  conditions?: InvalidationCondition[];
  /** Priority (higher numbers processed first) */
  priority: number;
  /** Whether rule is enabled */
  enabled: boolean;
  /** Delay before invalidation in milliseconds */
  delay?: number;
}

/**
 * Invalidation condition
 */
export interface InvalidationCondition {
  /** Field to check */
  field: string;
  /** Operator for comparison */
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains' | 'startswith' | 'endswith';
  /** Value to compare against */
  value: any;
}

/**
 * Invalidation event data
 */
export interface InvalidationEvent {
  /** Event type */
  type: 'before' | 'after' | 'error';
  /** Entity type affected */
  entityType: string;
  /** Invalidation pattern used */
  pattern: InvalidationPattern;
  /** Target that was invalidated */
  target: string | string[];
  /** Number of keys invalidated */
  invalidatedCount?: number;
  /** Error if invalidation failed */
  error?: Error;
  /** Timestamp */
  timestamp: number;
  /** Execution time */
  executionTime?: number;
}

/**
 * Dependency mapping for cascade invalidation
 */
export interface DependencyMap {
  /** Source entity type */
  source: string;
  /** Dependent entity types */
  dependents: string[];
  /** Fields that trigger dependency invalidation */
  fields?: string[];
  /** Invalidation delay for dependencies */
  delay?: number;
}

/**
 * Batch invalidation request
 */
export interface BatchInvalidationRequest {
  /** Batch identifier */
  batchId: string;
  /** Individual invalidation operations */
  operations: Array<{
    pattern: InvalidationPattern;
    target: string | string[];
    entityType?: string;
    delay?: number;
  }>;
  /** Execute operations in parallel or serial */
  parallel: boolean;
  /** Continue on error or stop */
  continueOnError: boolean;
}

/**
 * Smart invalidation based on data relationships
 */
export class CacheInvalidator extends EventEmitter {
  private store: ICacheStore;
  private keyGenerator: CacheKeyGenerator;
  private metrics: CacheMetricsCollector;
  private logger: ErrorLogger;

  // Invalidation rules and dependencies
  private rules: Map<string, InvalidationRule> = new Map();
  private dependencies: Map<string, DependencyMap[]> = new Map();
  private pendingInvalidations: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // Statistics
  private stats = {
    totalInvalidations: 0,
    invalidationsByPattern: new Map<InvalidationPattern, number>(),
    invalidationsByEntity: new Map<string, number>(),
    averageExecutionTime: 0,
    errors: 0
  };

  constructor(
    store: ICacheStore,
    keyGenerator: CacheKeyGenerator,
    metrics: CacheMetricsCollector,
    logger: ErrorLogger = defaultErrorLogger
  ) {
    super();
    
    this.store = store;
    this.keyGenerator = keyGenerator;
    this.metrics = metrics;
    this.logger = logger;

    this.initializeDefaultRules();
  }

  /**
   * Invalidate cache entries using specified pattern
   */
  async invalidate(
    pattern: InvalidationPattern,
    target: string | string[],
    entityType?: string,
    options?: {
      delay?: number;
      cascade?: boolean;
      dryRun?: boolean;
    }
  ): Promise<number> {
    const startTime = performance.now();
    const context: LogContext = {
      operation: 'cache_invalidate',
      correlationId: this.generateCorrelationId()
    };

    const event: InvalidationEvent = {
      type: 'before',
      entityType: entityType || 'unknown',
      pattern,
      target,
      timestamp: Date.now()
    };

    this.emit('invalidation', event);

    try {
      let invalidatedCount = 0;

      // Handle delayed invalidation
      if (options?.delay && options.delay > 0) {
        return this.scheduleDelayedInvalidation(pattern, target, entityType, options);
      }

      // Execute invalidation based on pattern
      switch (pattern) {
        case InvalidationPattern.SINGLE:
          invalidatedCount = await this.invalidateSingle(target as string, options?.dryRun);
          break;

        case InvalidationPattern.BATCH:
          invalidatedCount = await this.invalidateBatch(target as string[], options?.dryRun);
          break;

        case InvalidationPattern.PATTERN:
          invalidatedCount = await this.invalidatePattern(target as string, options?.dryRun);
          break;

        case InvalidationPattern.TAG_BASED:
          invalidatedCount = await this.invalidateByTags(target as string[], options?.dryRun);
          break;

        case InvalidationPattern.TTL:
          invalidatedCount = await this.invalidateExpired(options?.dryRun);
          break;

        default:
          throw new Error(`Unsupported invalidation pattern: ${pattern}`);
      }

      // Handle cascade invalidation
      if (options?.cascade && entityType) {
        const cascadeCount = await this.handleCascadeInvalidation(entityType, target, options?.dryRun);
        invalidatedCount += cascadeCount;
      }

      // Update statistics
      this.updateStats(pattern, entityType, invalidatedCount, performance.now() - startTime);

      // Emit success event
      const successEvent: InvalidationEvent = {
        type: 'after',
        entityType: entityType || 'unknown',
        pattern,
        target,
        invalidatedCount,
        timestamp: Date.now(),
        executionTime: performance.now() - startTime
      };

      this.emit('invalidation', successEvent);

      this.logger.info('Cache invalidation completed', {
        ...context,
        metadata: { pattern, entityType, invalidatedCount, executionTime: successEvent.executionTime }
      });

      return invalidatedCount;

    } catch (error) {
      this.stats.errors++;
      
      const errorEvent: InvalidationEvent = {
        type: 'error',
        entityType: entityType || 'unknown',
        pattern,
        target,
        error: error as Error,
        timestamp: Date.now(),
        executionTime: performance.now() - startTime
      };

      this.emit('invalidation', errorEvent);

      this.logger.error('Cache invalidation error', toError(error), {
        ...context,
        metadata: { pattern, entityType, target }
      });

      throw error;
    }
  }

  /**
   * Invalidate based on entity data changes
   */
  async invalidateByEntityChange(
    entityType: string,
    entityData: any,
    changeType: 'create' | 'update' | 'delete',
    entityId?: string
  ): Promise<number> {
    const context: LogContext = {
      operation: 'cache_invalidate_entity_change',
      correlationId: this.generateCorrelationId()
    };

    try {
      let totalInvalidated = 0;

      // Find applicable rules
      const applicableRules = this.findApplicableRules(entityType, entityData, changeType);

      // Process rules in priority order
      const sortedRules = applicableRules.sort((a, b) => b.priority - a.priority);

      for (const rule of sortedRules) {
        if (!rule.enabled) continue;

        try {
          const invalidatedCount = await this.invalidate(
            rule.pattern,
            rule.target,
            entityType,
            { delay: rule.delay, cascade: true }
          );
          
          totalInvalidated += invalidatedCount;

          this.logger.debug('Invalidation rule applied', {
            ...context,
            metadata: { 
              ruleName: rule.name, 
              entityType, 
              changeType, 
              invalidatedCount 
            }
          });

        } catch (ruleError) {
          this.logger.warn('Invalidation rule failed', toError(ruleError), {
            ...context,
            metadata: { ruleName: rule.name, entityType, changeType }
          });
        }
      }

      return totalInvalidated;

    } catch (error) {
      this.logger.error('Entity change invalidation error', toError(error), {
        ...context,
        metadata: { entityType, changeType, entityId }
      });
      throw error;
    }
  }

  /**
   * Execute batch invalidation
   */
  async executeBatch(request: BatchInvalidationRequest): Promise<{ 
    completed: number; 
    failed: number; 
    totalInvalidated: number 
  }> {
    const context: LogContext = {
      operation: 'cache_invalidate_batch',
      correlationId: this.generateCorrelationId()
    };

    let completed = 0;
    let failed = 0;
    let totalInvalidated = 0;

    try {
      this.logger.info('Starting batch invalidation', {
        ...context,
        metadata: { batchId: request.batchId, operationCount: request.operations.length }
      });

      if (request.parallel) {
        // Execute all operations in parallel
        const promises = request.operations.map(async (op) => {
          try {
            const count = await this.invalidate(op.pattern, op.target, op.entityType, {
              delay: op.delay
            });
            return { success: true, count };
          } catch (error) {
            if (!request.continueOnError) {
              throw error;
            }
            return { success: false, count: 0, error };
          }
        });

        const results = await Promise.allSettled(promises);
        
        for (const result of results) {
          if (result.status === 'fulfilled') {
            if (result.value.success) {
              completed++;
              totalInvalidated += result.value.count;
            } else {
              failed++;
            }
          } else {
            failed++;
          }
        }

      } else {
        // Execute operations sequentially
        for (const operation of request.operations) {
          try {
            const count = await this.invalidate(
              operation.pattern,
              operation.target,
              operation.entityType,
              { delay: operation.delay }
            );
            
            completed++;
            totalInvalidated += count;

          } catch (error) {
            failed++;
            
            if (!request.continueOnError) {
              throw error;
            }
            
            this.logger.warn('Batch operation failed, continuing', toError(error), {
              ...context,
              metadata: { batchId: request.batchId, operation: operation.pattern }
            });
          }
        }
      }

      this.logger.info('Batch invalidation completed', {
        ...context,
        metadata: { 
          batchId: request.batchId, 
          completed, 
          failed, 
          totalInvalidated 
        }
      });

      return { completed, failed, totalInvalidated };

    } catch (error) {
      this.logger.error('Batch invalidation error', toError(error), {
        ...context,
        metadata: { batchId: request.batchId }
      });
      throw error;
    }
  }

  /**
   * Add invalidation rule
   */
  addRule(rule: InvalidationRule): void {
    this.rules.set(rule.name, rule);
    
    this.logger.debug('Invalidation rule added', {
      operation: 'add_invalidation_rule',
      correlationId: this.generateCorrelationId(),
      metadata: { ruleName: rule.name, entityType: rule.entityType, pattern: rule.pattern }
    });
  }

  /**
   * Remove invalidation rule
   */
  removeRule(ruleName: string): boolean {
    const removed = this.rules.delete(ruleName);
    
    if (removed) {
      this.logger.debug('Invalidation rule removed', {
        operation: 'remove_invalidation_rule',
        correlationId: this.generateCorrelationId(),
        metadata: { ruleName }
      });
    }
    
    return removed;
  }

  /**
   * Add dependency mapping
   */
  addDependency(dependency: DependencyMap): void {
    if (!this.dependencies.has(dependency.source)) {
      this.dependencies.set(dependency.source, []);
    }
    
    this.dependencies.get(dependency.source)!.push(dependency);
  }

  /**
   * Get invalidation statistics
   */
  getStats(): typeof this.stats {
    return {
      ...this.stats,
      invalidationsByPattern: new Map(this.stats.invalidationsByPattern),
      invalidationsByEntity: new Map(this.stats.invalidationsByEntity)
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalInvalidations: 0,
      invalidationsByPattern: new Map(),
      invalidationsByEntity: new Map(),
      averageExecutionTime: 0,
      errors: 0
    };
  }

  /**
   * Shutdown invalidator
   */
  async shutdown(): Promise<void> {
    // Cancel pending invalidations
    for (const timer of this.pendingInvalidations.values()) {
      clearTimeout(timer);
    }
    this.pendingInvalidations.clear();

    this.logger.info('Cache invalidator shutdown completed', {
      operation: 'shutdown',
      correlationId: this.generateCorrelationId()
    });
  }

  /**
   * Invalidate single key
   */
  private async invalidateSingle(key: string, dryRun = false): Promise<number> {
    if (dryRun) {
      const exists = await this.store.exists(key);
      return exists ? 1 : 0;
    }
    
    const result = await this.store.delete(key);
    return result ? 1 : 0;
  }

  /**
   * Invalidate multiple keys
   */
  private async invalidateBatch(keys: string[], dryRun = false): Promise<number> {
    if (dryRun) {
      let count = 0;
      for (const key of keys) {
        if (await this.store.exists(key)) {
          count++;
        }
      }
      return count;
    }
    
    return await this.store.deleteMany(keys);
  }

  /**
   * Invalidate by pattern
   */
  private async invalidatePattern(pattern: string, dryRun = false): Promise<number> {
    if (dryRun) {
      const keys = await this.store.keys(pattern);
      return keys.length;
    }
    
    return await this.store.deletePattern(pattern);
  }

  /**
   * Invalidate by tags
   */
  private async invalidateByTags(tags: string[], dryRun = false): Promise<number> {
    if (dryRun) {
      // This is approximate for dry run
      const allKeys = await this.store.keys();
      return Math.floor(allKeys.length * 0.1); // Rough estimate
    }
    
    return await this.store.deleteByTags(tags);
  }

  /**
   * Invalidate expired entries
   */
  private async invalidateExpired(dryRun = false): Promise<number> {
    if (dryRun) {
      // This is approximate for dry run
      const size = await this.store.size();
      return Math.floor(size.entries * 0.05); // Rough estimate of expired entries
    }
    
    return await this.store.cleanup();
  }

  /**
   * Schedule delayed invalidation
   */
  private scheduleDelayedInvalidation(
    pattern: InvalidationPattern,
    target: string | string[],
    entityType?: string,
    options?: { cascade?: boolean; delay?: number }
  ): Promise<number> {
    const delay = options?.delay || 0;
    const invalidationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          this.pendingInvalidations.delete(invalidationId);
          const count = await this.invalidate(pattern, target, entityType, {
            cascade: options?.cascade
          });
          resolve(count);
        } catch (error) {
          reject(error);
        }
      }, delay);

      this.pendingInvalidations.set(invalidationId, timer);
    });
  }

  /**
   * Handle cascade invalidation based on dependencies
   */
  private async handleCascadeInvalidation(
    entityType: string,
    target: string | string[],
    dryRun = false
  ): Promise<number> {
    const dependencies = this.dependencies.get(entityType);
    if (!dependencies || dependencies.length === 0) {
      return 0;
    }

    let totalInvalidated = 0;

    for (const dep of dependencies) {
      for (const dependent of dep.dependents) {
        // Generate pattern for dependent entity type
        const pattern = this.keyGenerator.generatePatternKey(dependent);
        
        if (dep.delay && dep.delay > 0) {
          // Schedule delayed cascade invalidation (fire and forget)
          this.scheduleDelayedInvalidation(
            InvalidationPattern.PATTERN,
            pattern,
            dependent,
            {}
          ).catch(() => {
            // Ignore cascade errors
          });
        } else {
          try {
            const count = await this.invalidatePattern(pattern, dryRun);
            totalInvalidated += count;
          } catch (error) {
            // Log cascade error but continue
            this.logger.warn('Cascade invalidation failed', toError(error), {
              operation: 'cascade_invalidation',
              correlationId: this.generateCorrelationId(),
              metadata: { sourceEntity: entityType, dependentEntity: dependent }
            });
          }
        }
      }
    }

    return totalInvalidated;
  }

  /**
   * Find applicable rules for entity change
   */
  private findApplicableRules(
    entityType: string,
    entityData: any,
    changeType: string
  ): InvalidationRule[] {
    const applicableRules: InvalidationRule[] = [];

    for (const rule of this.rules.values()) {
      if (rule.entityType !== entityType && rule.entityType !== '*') {
        continue;
      }

      // Check conditions
      if (rule.conditions && !this.evaluateConditions(rule.conditions, entityData, changeType)) {
        continue;
      }

      applicableRules.push(rule);
    }

    return applicableRules;
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateConditions(
    conditions: InvalidationCondition[],
    entityData: any,
    changeType: string
  ): boolean {
    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(entityData, condition.field);
      
      if (!this.evaluateCondition(condition, fieldValue, changeType)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: InvalidationCondition, fieldValue: any, changeType: string): boolean {
    // Special field for change type
    if (condition.field === '__changeType') {
      fieldValue = changeType;
    }

    switch (condition.operator) {
      case 'eq':
        return fieldValue === condition.value;
      case 'ne':
        return fieldValue !== condition.value;
      case 'gt':
        return fieldValue > condition.value;
      case 'lt':
        return fieldValue < condition.value;
      case 'gte':
        return fieldValue >= condition.value;
      case 'lte':
        return fieldValue <= condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'startswith':
        return String(fieldValue).startsWith(String(condition.value));
      case 'endswith':
        return String(fieldValue).endsWith(String(condition.value));
      default:
        return false;
    }
  }

  /**
   * Get nested object value
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  }

  /**
   * Update statistics
   */
  private updateStats(
    pattern: InvalidationPattern,
    entityType: string | undefined,
    invalidatedCount: number,
    executionTime: number
  ): void {
    this.stats.totalInvalidations++;
    
    // Update pattern stats
    const patternCount = this.stats.invalidationsByPattern.get(pattern) || 0;
    this.stats.invalidationsByPattern.set(pattern, patternCount + 1);

    // Update entity stats
    if (entityType) {
      const entityCount = this.stats.invalidationsByEntity.get(entityType) || 0;
      this.stats.invalidationsByEntity.set(entityType, entityCount + 1);
    }

    // Update average execution time
    this.stats.averageExecutionTime = (
      (this.stats.averageExecutionTime * (this.stats.totalInvalidations - 1)) + executionTime
    ) / this.stats.totalInvalidations;
  }

  /**
   * Initialize default invalidation rules
   */
  private initializeDefaultRules(): void {
    // Rule: Invalidate company-related caches when company is updated
    this.addRule({
      name: 'company_update_cascade',
      entityType: 'companies',
      pattern: InvalidationPattern.TAG_BASED,
      target: ['company'],
      conditions: [
        { field: '__changeType', operator: 'in', value: ['update', 'delete'] }
      ],
      priority: 10,
      enabled: true
    });

    // Rule: Invalidate ticket lists when ticket status changes
    this.addRule({
      name: 'ticket_status_lists',
      entityType: 'tickets',
      pattern: InvalidationPattern.PATTERN,
      target: 'autotask:tickets:*:list*',
      conditions: [
        { field: 'status', operator: 'ne', value: null },
        { field: '__changeType', operator: 'eq', value: 'update' }
      ],
      priority: 8,
      enabled: true
    });

    // Rule: Invalidate project caches when project is completed
    this.addRule({
      name: 'project_completion',
      entityType: 'projects',
      pattern: InvalidationPattern.PATTERN,
      target: 'autotask:projects:*',
      conditions: [
        { field: 'status', operator: 'eq', value: 'Complete' },
        { field: '__changeType', operator: 'eq', value: 'update' }
      ],
      priority: 7,
      enabled: true,
      delay: 5000 // 5 second delay
    });

    // Add default dependencies
    this.addDependency({
      source: 'companies',
      dependents: ['contacts', 'tickets', 'projects', 'contracts'],
      delay: 1000
    });

    this.addDependency({
      source: 'contacts',
      dependents: ['tickets'],
      delay: 500
    });

    this.addDependency({
      source: 'projects',
      dependents: ['tasks', 'tickets'],
      delay: 2000
    });
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `invalidator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}