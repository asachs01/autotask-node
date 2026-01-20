import { ValidationSchema, ValidationResult } from './ValidationFramework';
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
export declare class EntityValidator {
    private logger;
    private schemas;
    private validationCache;
    private readonly config;
    constructor(logger: winston.Logger, config?: EntityValidationConfig);
    /**
     * Register a validation schema for an entity type
     */
    registerSchema(entityType: string, schema: ValidationSchema): void;
    /**
     * Register a decorated class for validation
     */
    registerClass(entityType: string, entityClass: any): void;
    /**
     * Register a custom validator for an entity type
     */
    registerCustomValidator(entityType: string, validator: (entity: any) => Promise<ValidationResult>): void;
    /**
     * Validate an entity
     */
    validate(entity: any, context: ValidationContext): Promise<ValidationResult>;
    /**
     * Validate multiple entities
     */
    validateBatch(entities: any[], context: Omit<ValidationContext, 'entityId'>): Promise<Map<any, ValidationResult>>;
    /**
     * Validate and throw if invalid
     */
    validateOrThrow(entity: any, context: ValidationContext): Promise<void>;
    /**
     * Clear validation cache
     */
    clearCache(): void;
    /**
     * Get registered schema for an entity type
     */
    getSchema(entityType: string): ValidationSchema | undefined;
    /**
     * Check if an entity type has validation configured
     */
    hasValidation(entityType: string): boolean;
    private shouldValidate;
    private validateWithSchema;
    private combineResults;
    private normalizeValidationResult;
    private getCacheKey;
    private getCachedResult;
    private cacheResult;
    private startCacheCleanup;
}
//# sourceMappingURL=EntityValidator.d.ts.map