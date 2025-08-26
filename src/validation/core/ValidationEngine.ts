/**
 * Core validation engine for Autotask entities
 * Orchestrates schema validation, business rules, security checks, and compliance validation
 */

import Joi from 'joi';
import winston from 'winston';
import { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  ValidationContext,
  ValidationConfig,
  ValidationEvent,
  ValidationEventHandler,
  EntitySchema,
  BusinessRule,
  SecurityRule,
  ComplianceRule,
  PerformanceMetrics,
  ValidationException
} from '../types/ValidationTypes';
import { SchemaRegistry } from './SchemaRegistry';
import { InputSanitizer } from '../sanitization/InputSanitizer';
import { SecurityValidator } from '../security/SecurityValidator';
import { ComplianceValidator } from '../compliance/ComplianceValidator';
import { QualityAssurance } from '../quality/QualityAssurance';

export class ValidationEngine {
  private schemaRegistry: SchemaRegistry;
  private sanitizer: InputSanitizer;
  private securityValidator: SecurityValidator;
  private complianceValidator: ComplianceValidator;
  private qualityAssurance: QualityAssurance;
  private logger: winston.Logger;
  private config: ValidationConfig;
  private eventHandlers: Map<string, ValidationEventHandler[]> = new Map();
  private metrics: Map<string, PerformanceMetrics[]> = new Map();

  constructor(
    schemaRegistry: SchemaRegistry,
    sanitizer: InputSanitizer,
    securityValidator: SecurityValidator,
    complianceValidator: ComplianceValidator,
    qualityAssurance: QualityAssurance,
    logger: winston.Logger,
    config: ValidationConfig
  ) {
    this.schemaRegistry = schemaRegistry;
    this.sanitizer = sanitizer;
    this.securityValidator = securityValidator;
    this.complianceValidator = complianceValidator;
    this.qualityAssurance = qualityAssurance;
    this.logger = logger;
    this.config = config;
  }

  /**
   * Validate an entity with comprehensive checks
   */
  public async validateEntity(
    entity: any,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const validationId = this.generateValidationId();
    
    try {
      // Emit validation started event
      this.emitEvent({
        type: 'validation-started',
        timestamp: new Date(),
        entityType: context.entityType,
        entityId: context.entityId,
        userId: context.userId
      });

      // Initialize result
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        metadata: {
          entityType: context.entityType,
          validatedAt: new Date(),
          validationVersion: '1.0.0',
          performanceMetrics: {
            validationTime: 0,
            sanitizationTime: 0,
            totalTime: 0,
            rulesExecuted: 0
          },
          auditTrail: []
        }
      };

      // Step 1: Schema validation
      const schemaResult = await this.validateSchema(entity, context);
      this.mergeResults(result, schemaResult);

      // Step 2: Sanitization (if enabled and no critical errors)
      if (this.config.enableSanitization && result.errors.filter(e => e.severity === 'critical').length === 0) {
        const sanitizationStart = Date.now();
        const sanitizedEntity = await this.sanitizer.sanitize(entity, context.entityType);
        result.sanitizedData = sanitizedEntity;
        result.metadata!.performanceMetrics!.sanitizationTime = Date.now() - sanitizationStart;
      }

      // Step 3: Business rules validation (if enabled)
      if (this.config.enableBusinessRules) {
        const businessResult = await this.validateBusinessRules(
          result.sanitizedData || entity, 
          context
        );
        this.mergeResults(result, businessResult);
      }

      // Step 4: Security validation (if enabled)
      if (this.config.enableSecurityValidation) {
        const securityResult = await this.securityValidator.validate(
          result.sanitizedData || entity,
          context
        );
        this.mergeResults(result, securityResult);
      }

      // Step 5: Compliance validation (if enabled)
      if (this.config.enableComplianceChecks) {
        const complianceResult = await this.complianceValidator.validate(
          result.sanitizedData || entity,
          context
        );
        this.mergeResults(result, complianceResult);
      }

      // Step 6: Quality assurance (if enabled)
      if (this.config.enableQualityAssurance) {
        const qualityResult = await this.qualityAssurance.validate(
          result.sanitizedData || entity,
          context
        );
        this.mergeResults(result, qualityResult);
      }

      // Finalize validation result
      result.isValid = result.errors.length === 0;
      const totalTime = Date.now() - startTime;
      result.metadata!.performanceMetrics!.totalTime = totalTime;
      result.metadata!.performanceMetrics!.validationTime = 
        totalTime - (result.metadata!.performanceMetrics!.sanitizationTime || 0);

      // Store performance metrics
      this.storeMetrics(context.entityType, result.metadata!.performanceMetrics!);

      // Check performance threshold
      if (this.config.maxValidationTime > 0 && totalTime > this.config.maxValidationTime) {
        result.warnings.push({
          field: '__validation__',
          code: 'PERFORMANCE_THRESHOLD_EXCEEDED',
          message: `Validation took ${totalTime}ms, exceeding threshold of ${this.config.maxValidationTime}ms`,
          recommendation: 'Consider optimizing validation rules or increasing threshold'
        });
      }

      // Emit validation completed event
      this.emitEvent({
        type: 'validation-completed',
        timestamp: new Date(),
        entityType: context.entityType,
        entityId: context.entityId,
        userId: context.userId,
        duration: totalTime,
        errors: result.errors,
        warnings: result.warnings
      });

      // Throw exception if validation failed in strict mode
      if (this.config.strictMode && !result.isValid) {
        throw new ValidationException(
          'Entity validation failed',
          result.errors,
          result.warnings,
          context.entityType,
          context.entityId
        );
      }

      return result;

    } catch (error) {
      // Emit validation failed event
      this.emitEvent({
        type: 'validation-failed',
        timestamp: new Date(),
        entityType: context.entityType,
        entityId: context.entityId,
        userId: context.userId,
        duration: Date.now() - startTime,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });

      if (error instanceof ValidationException) {
        throw error;
      }

      this.logger.error('Validation engine error:', error);
      throw new ValidationException(
        'Validation engine encountered an error',
        [{
          field: '__validation__',
          code: 'VALIDATION_ENGINE_ERROR',
          message: error instanceof Error ? error.message : String(error),
          severity: 'critical',
          category: 'data'
        }],
        [],
        context.entityType,
        context.entityId
      );
    }
  }

  /**
   * Validate multiple entities in batch
   */
  public async validateBatch(
    entities: { entity: any; context: ValidationContext }[]
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const batchSize = 10; // Process in batches to manage memory
    
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      const batchPromises = batch.map(({ entity, context }) => 
        this.validateEntity(entity, context)
      );
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            // Create error result for failed validation
            results.push({
              isValid: false,
              errors: [{
                field: '__validation__',
                code: 'BATCH_VALIDATION_ERROR',
                message: result.reason.message,
                severity: 'critical',
                category: 'data'
              }],
              warnings: []
            });
          }
        }
      } catch (error) {
        this.logger.error('Batch validation error:', error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Add event handler for validation lifecycle events
   */
  public addEventListener(eventType: string, handler: ValidationEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Remove event handler
   */
  public removeEventListener(eventType: string, handler: ValidationEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get performance metrics for an entity type
   */
  public getPerformanceMetrics(entityType: string): PerformanceMetrics[] {
    return this.metrics.get(entityType) || [];
  }

  /**
   * Get aggregated performance statistics
   */
  public getPerformanceStatistics(): {
    totalValidations: number;
    averageValidationTime: number;
    averageRulesExecuted: number;
    entityTypeStats: Record<string, {
      count: number;
      avgTime: number;
      avgRules: number;
    }>;
  } {
    let totalValidations = 0;
    let totalTime = 0;
    let totalRules = 0;
    const entityTypeStats: Record<string, { count: number; avgTime: number; avgRules: number }> = {};

    for (const [entityType, metrics] of this.metrics) {
      const count = metrics.length;
      const avgTime = metrics.reduce((sum, m) => sum + m.totalTime, 0) / count;
      const avgRules = metrics.reduce((sum, m) => sum + m.rulesExecuted, 0) / count;

      entityTypeStats[entityType] = { count, avgTime, avgRules };
      totalValidations += count;
      totalTime += metrics.reduce((sum, m) => sum + m.totalTime, 0);
      totalRules += metrics.reduce((sum, m) => sum + m.rulesExecuted, 0);
    }

    return {
      totalValidations,
      averageValidationTime: totalValidations > 0 ? totalTime / totalValidations : 0,
      averageRulesExecuted: totalValidations > 0 ? totalRules / totalValidations : 0,
      entityTypeStats
    };
  }

  /**
   * Clear performance metrics
   */
  public clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Validate against entity schema
   */
  private async validateSchema(entity: any, context: ValidationContext): Promise<ValidationResult> {
    const schema = this.schemaRegistry.getSchema(context.entityType);
    
    if (!schema) {
      return {
        isValid: false,
        errors: [{
          field: '__schema__',
          code: 'SCHEMA_NOT_FOUND',
          message: `Schema not found for entity type: ${context.entityType}`,
          severity: 'critical',
          category: 'data'
        }],
        warnings: []
      };
    }

    try {
      const { error, warning, value } = schema.schema.validate(entity, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: false
      });

      const result: ValidationResult = {
        isValid: !error,
        errors: [],
        warnings: []
      };

      if (error) {
        result.errors = error.details.map(detail => ({
          field: detail.path.join('.') || '__root__',
          code: 'SCHEMA_VALIDATION_ERROR',
          message: detail.message,
          value: detail.context?.value,
          severity: 'high' as const,
          category: 'data' as const
        }));
      }

      return result;
      
    } catch (error) {
      this.logger.error('Schema validation error:', error);
      return {
        isValid: false,
        errors: [{
          field: '__schema__',
          code: 'SCHEMA_VALIDATION_EXCEPTION',
          message: error instanceof Error ? error.message : String(error),
          severity: 'critical',
          category: 'data'
        }],
        warnings: []
      };
    }
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(entity: any, context: ValidationContext): Promise<ValidationResult> {
    const schema = this.schemaRegistry.getSchema(context.entityType);
    
    if (!schema || !schema.businessRules.length) {
      return { isValid: true, errors: [], warnings: [] };
    }

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const enabledRules = schema.businessRules.filter(rule => rule.enabled);
    const sortedRules = enabledRules.sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      try {
        const ruleResult = await this.evaluateBusinessRule(rule, entity, context);
        
        if (!ruleResult.passed) {
          if (rule.action === 'validate' || rule.action === 'reject') {
            result.errors.push({
              field: rule.name,
              code: rule.id,
              message: rule.errorMessage || `Business rule '${rule.name}' failed`,
              severity: 'high',
              category: 'business'
            });
          } else if (rule.action === 'warn') {
            result.warnings.push({
              field: rule.name,
              code: rule.id,
              message: rule.warningMessage || `Business rule '${rule.name}' triggered warning`,
              recommendation: 'Review business rule conditions'
            });
          }
        }
        
        if (result.metadata) {
          result.metadata.performanceMetrics!.rulesExecuted++;
        }
        
      } catch (error) {
        this.logger.error(`Business rule '${rule.id}' execution error:`, error);
        result.errors.push({
          field: rule.name,
          code: 'BUSINESS_RULE_ERROR',
          message: `Business rule execution failed: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'medium',
          category: 'business'
        });
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Evaluate a single business rule
   */
  private async evaluateBusinessRule(
    rule: BusinessRule, 
    entity: any, 
    context: ValidationContext
  ): Promise<{ passed: boolean; message?: string }> {
    if (typeof rule.condition === 'string') {
      // For string conditions, implement a simple expression evaluator
      // This is a simplified implementation - in production, use a proper expression engine
      try {
        const func = new Function('entity', 'context', `return ${rule.condition}`);
        const passed = await func(entity, context);
        return { passed: Boolean(passed) };
      } catch (error) {
        this.logger.error(`Business rule condition evaluation error: ${error instanceof Error ? error.message : String(error)}`);
        return { passed: false, message: error instanceof Error ? error.message : String(error) };
      }
    } else {
      // Function-based condition
      try {
        const passed = await rule.condition(entity, context);
        return { passed: Boolean(passed) };
      } catch (error) {
        this.logger.error(`Business rule function execution error: ${error instanceof Error ? error.message : String(error)}`);
        return { passed: false, message: error instanceof Error ? error.message : String(error) };
      }
    }
  }

  /**
   * Merge validation results
   */
  private mergeResults(target: ValidationResult, source: ValidationResult): void {
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
    target.isValid = target.isValid && source.isValid;
    
    if (source.sanitizedData && !target.sanitizedData) {
      target.sanitizedData = source.sanitizedData;
    }
  }

  /**
   * Store performance metrics
   */
  private storeMetrics(entityType: string, metrics: PerformanceMetrics): void {
    if (!this.metrics.has(entityType)) {
      this.metrics.set(entityType, []);
    }
    
    const entityMetrics = this.metrics.get(entityType)!;
    entityMetrics.push(metrics);
    
    // Keep only last 100 metrics per entity type to prevent memory leaks
    if (entityMetrics.length > 100) {
      entityMetrics.splice(0, entityMetrics.length - 100);
    }
  }

  /**
   * Emit validation event
   */
  private emitEvent(event: ValidationEvent): void {
    const handlers = this.eventHandlers.get(event.type) || [];
    
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        this.logger.error('Event handler error:', error);
      }
    }

    // Always log validation events
    if (this.config.auditAllValidations) {
      this.logger.info('Validation event', { event });
    }
  }

  /**
   * Generate unique validation ID
   */
  private generateValidationId(): string {
    return `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}