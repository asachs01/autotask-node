import { ValidationSchema, ValidationResult, ValidationError } from './ValidationFramework';
import { getValidationSchema } from './ValidationDecorators';
import winston from 'winston';

/**
 * Configuration for entity validation
 */
export interface EntityValidationConfig {
  validateOnCreate?: boolean;
  validateOnUpdate?: boolean;
  validateOnSave?: boolean;
  stopOnFirstError?: boolean;
  enableAsyncValidation?: boolean;
  customValidators?: Map<string, (entity: any) => Promise<ValidationResult>>;
  cacheResults?: boolean;
  cacheTimeout?: number;
}

/**
 * Validation context containing metadata about the validation operation
 */
export interface ValidationContext {
  operation: 'create' | 'update' | 'delete' | 'save';
  entityType: string;
  entityId?: number | string;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Core entity validator for Autotask entities
 */
export class EntityValidator {
  private schemas: Map<string, ValidationSchema> = new Map();
  private validationCache: Map<string, { result: ValidationResult; expiry: number }> = new Map();
  private readonly config: Required<EntityValidationConfig>;
  
  constructor(
    private logger: winston.Logger,
    config: EntityValidationConfig = {}
  ) {
    this.config = {
      validateOnCreate: true,
      validateOnUpdate: true,
      validateOnSave: true,
      stopOnFirstError: false,
      enableAsyncValidation: true,
      customValidators: config.customValidators || new Map(),
      cacheResults: false,
      cacheTimeout: 60000, // 1 minute
      ...config
    };
    
    // Start cache cleanup interval if caching is enabled
    if (this.config.cacheResults) {
      this.startCacheCleanup();
    }
  }
  
  /**
   * Register a validation schema for an entity type
   */
  registerSchema(entityType: string, schema: ValidationSchema): void {
    this.schemas.set(entityType, schema);
    this.logger.debug(`Registered validation schema for entity type: ${entityType}`);
  }
  
  /**
   * Register a decorated class for validation
   */
  registerClass(entityType: string, entityClass: any): void {
    const schema = getValidationSchema(entityClass);
    if (schema) {
      this.registerSchema(entityType, schema);
    } else {
      this.logger.warn(`No validation decorators found for class: ${entityType}`);
    }
  }
  
  /**
   * Register a custom validator for an entity type
   */
  registerCustomValidator(
    entityType: string, 
    validator: (entity: any) => Promise<ValidationResult>
  ): void {
    this.config.customValidators.set(entityType, validator);
    this.logger.debug(`Registered custom validator for entity type: ${entityType}`);
  }
  
  /**
   * Validate an entity
   */
  async validate(
    entity: any,
    context: ValidationContext
  ): Promise<ValidationResult> {
    try {
      // Check cache if enabled
      if (this.config.cacheResults) {
        const cached = this.getCachedResult(entity, context);
        if (cached) {
          return cached;
        }
      }
      
      // Determine if validation should be performed
      if (!this.shouldValidate(context)) {
        return ValidationResult.success();
      }
      
      const entityType = context.entityType;
      const results: ValidationResult[] = [];
      
      // Run schema validation
      const schema = this.schemas.get(entityType);
      if (schema) {
        const schemaResult = await this.validateWithSchema(entity, schema, context);
        results.push(schemaResult);
        
        if (!schemaResult.isValid && this.config.stopOnFirstError) {
          return this.cacheResult(entity, context, schemaResult);
        }
      }
      
      // Run decorator-based validation if entity has decorators
      if (entity.constructor) {
        const decoratorSchema = getValidationSchema(entity.constructor);
        if (decoratorSchema) {
          const decoratorResult = await this.validateWithSchema(entity, decoratorSchema, context);
          results.push(decoratorResult);
          
          if (!decoratorResult.isValid && this.config.stopOnFirstError) {
            return this.cacheResult(entity, context, decoratorResult);
          }
        }
      }
      
      // Run custom validator
      const customValidator = this.config.customValidators.get(entityType);
      if (customValidator) {
        const customResult = await customValidator(entity);
        results.push(customResult);
        
        if (!customResult.isValid && this.config.stopOnFirstError) {
          return this.cacheResult(entity, context, customResult);
        }
      }
      
      // Run entity's own validate method if it exists
      if (typeof entity.validate === 'function') {
        const entityResult = await entity.validate();
        if (entityResult) {
          results.push(this.normalizeValidationResult(entityResult));
        }
      }
      
      // Combine all results
      const combinedResult = this.combineResults(results);
      
      // Log validation result
      if (!combinedResult.isValid) {
        this.logger.warn(`Validation failed for ${entityType}`, {
          context,
          errors: combinedResult.getErrors()
        });
      }
      
      return this.cacheResult(entity, context, combinedResult);
      
    } catch (error) {
      this.logger.error(`Error during validation`, error);
      return ValidationResult.failure([
        new ValidationError(
          'validation',
          'An error occurred during validation',
          'VALIDATION_ERROR'
        )
      ]);
    }
  }
  
  /**
   * Validate multiple entities
   */
  async validateBatch(
    entities: any[],
    context: Omit<ValidationContext, 'entityId'>
  ): Promise<Map<any, ValidationResult>> {
    const results = new Map<any, ValidationResult>();
    
    // Use async validation if enabled
    if (this.config.enableAsyncValidation) {
      const validations = entities.map(async entity => {
        const result = await this.validate(entity, {
          ...context,
          entityId: entity.id || entity.Id
        });
        return { entity, result };
      });
      
      const batchResults = await Promise.all(validations);
      batchResults.forEach(({ entity, result }) => {
        results.set(entity, result);
      });
    } else {
      // Sequential validation
      for (const entity of entities) {
        const result = await this.validate(entity, {
          ...context,
          entityId: entity.id || entity.Id
        });
        results.set(entity, result);
      }
    }
    
    return results;
  }
  
  /**
   * Validate and throw if invalid
   */
  async validateOrThrow(
    entity: any,
    context: ValidationContext
  ): Promise<void> {
    const result = await this.validate(entity, context);
    
    if (!result.isValid) {
      const error = new Error('Validation failed');
      (error as any).validationErrors = result.getErrors();
      throw error;
    }
  }
  
  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache.clear();
  }
  
  /**
   * Get registered schema for an entity type
   */
  getSchema(entityType: string): ValidationSchema | undefined {
    return this.schemas.get(entityType);
  }
  
  /**
   * Check if an entity type has validation configured
   */
  hasValidation(entityType: string): boolean {
    return this.schemas.has(entityType) || 
           this.config.customValidators.has(entityType);
  }
  
  private shouldValidate(context: ValidationContext): boolean {
    switch (context.operation) {
      case 'create':
        return this.config.validateOnCreate;
      case 'update':
        return this.config.validateOnUpdate;
      case 'save':
        return this.config.validateOnSave;
      default:
        return true;
    }
  }
  
  private async validateWithSchema(
    entity: any,
    schema: ValidationSchema,
    context: ValidationContext
  ): Promise<ValidationResult> {
    try {
      return await schema.validate(entity);
    } catch (error) {
      this.logger.error(`Schema validation error for ${context.entityType}`, error);
      return ValidationResult.failure([
        new ValidationError(
          'schema',
          'Schema validation failed',
          'SCHEMA_VALIDATION_ERROR'
        )
      ]);
    }
  }
  
  private combineResults(results: ValidationResult[]): ValidationResult {
    if (results.length === 0) {
      return ValidationResult.success();
    }
    
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    
    for (const result of results) {
      allErrors.push(...result.getErrors());
      allWarnings.push(...result.getWarnings());
    }
    
    if (allErrors.length > 0) {
      const result = ValidationResult.failure(allErrors);
      allWarnings.forEach(warning => result.addError(warning));
      return result;
    }
    
    if (allWarnings.length > 0) {
      return ValidationResult.warning(allWarnings);
    }
    
    return ValidationResult.success();
  }
  
  private normalizeValidationResult(result: any): ValidationResult {
    // Handle different result formats
    if (result instanceof ValidationResult) {
      return result;
    }
    
    if (result.isValid !== undefined && (result.getErrors || Array.isArray(result.errors))) {
      const errors = (result.getErrors ? result.getErrors() : result.errors).map((e: any) => 
        new ValidationError(
          e.field || 'unknown',
          e.message || 'Validation failed',
          e.code
        )
      );
      
      return result.isValid 
        ? ValidationResult.success() 
        : ValidationResult.failure(errors);
    }
    
    // Assume invalid if we can't parse the result
    return ValidationResult.failure([
      new ValidationError(
        'unknown',
        'Unknown validation result format',
        'UNKNOWN_RESULT_FORMAT'
      )
    ]);
  }
  
  private getCacheKey(entity: any, context: ValidationContext): string {
    const entityId = entity.id || entity.Id || JSON.stringify(entity);
    return `${context.entityType}:${context.operation}:${entityId}`;
  }
  
  private getCachedResult(
    entity: any,
    context: ValidationContext
  ): ValidationResult | null {
    if (!this.config.cacheResults) {
      return null;
    }
    
    const key = this.getCacheKey(entity, context);
    const cached = this.validationCache.get(key);
    
    if (cached && cached.expiry > Date.now()) {
      this.logger.debug(`Using cached validation result for ${context.entityType}`);
      return cached.result;
    }
    
    if (cached) {
      this.validationCache.delete(key);
    }
    
    return null;
  }
  
  private cacheResult(
    entity: any,
    context: ValidationContext,
    result: ValidationResult
  ): ValidationResult {
    if (!this.config.cacheResults) {
      return result;
    }
    
    const key = this.getCacheKey(entity, context);
    const expiry = Date.now() + this.config.cacheTimeout;
    
    this.validationCache.set(key, { result, expiry });
    
    return result;
  }
  
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      for (const [key, value] of this.validationCache) {
        if (value.expiry <= now) {
          keysToDelete.push(key);
        }
      }
      
      for (const key of keysToDelete) {
        this.validationCache.delete(key);
      }
      
      if (keysToDelete.length > 0) {
        this.logger.debug(`Cleaned up ${keysToDelete.length} expired validation cache entries`);
      }
    }, 60000); // Clean up every minute
  }
}