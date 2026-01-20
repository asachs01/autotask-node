"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityValidator = void 0;
const ValidationFramework_1 = require("./ValidationFramework");
const ValidationDecorators_1 = require("./ValidationDecorators");
/**
 * Core entity validator for Autotask entities
 */
class EntityValidator {
    constructor(logger, config = {}) {
        this.logger = logger;
        this.schemas = new Map();
        this.validationCache = new Map();
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
    registerSchema(entityType, schema) {
        this.schemas.set(entityType, schema);
        this.logger.debug(`Registered validation schema for entity type: ${entityType}`);
    }
    /**
     * Register a decorated class for validation
     */
    registerClass(entityType, entityClass) {
        const schema = (0, ValidationDecorators_1.getValidationSchema)(entityClass);
        if (schema) {
            this.registerSchema(entityType, schema);
        }
        else {
            this.logger.warn(`No validation decorators found for class: ${entityType}`);
        }
    }
    /**
     * Register a custom validator for an entity type
     */
    registerCustomValidator(entityType, validator) {
        this.config.customValidators.set(entityType, validator);
        this.logger.debug(`Registered custom validator for entity type: ${entityType}`);
    }
    /**
     * Validate an entity
     */
    async validate(entity, context) {
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
                return ValidationFramework_1.ValidationResult.success();
            }
            const entityType = context.entityType;
            const results = [];
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
                const decoratorSchema = (0, ValidationDecorators_1.getValidationSchema)(entity.constructor);
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
        }
        catch (error) {
            this.logger.error(`Error during validation`, error);
            return ValidationFramework_1.ValidationResult.failure([
                new ValidationFramework_1.ValidationError('validation', 'An error occurred during validation', 'VALIDATION_ERROR')
            ]);
        }
    }
    /**
     * Validate multiple entities
     */
    async validateBatch(entities, context) {
        const results = new Map();
        // Use async validation if enabled
        if (this.config.enableAsyncValidation) {
            const validations = entities.map(async (entity) => {
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
        }
        else {
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
    async validateOrThrow(entity, context) {
        const result = await this.validate(entity, context);
        if (!result.isValid) {
            const error = new Error('Validation failed');
            error.validationErrors = result.getErrors();
            throw error;
        }
    }
    /**
     * Clear validation cache
     */
    clearCache() {
        this.validationCache.clear();
    }
    /**
     * Get registered schema for an entity type
     */
    getSchema(entityType) {
        return this.schemas.get(entityType);
    }
    /**
     * Check if an entity type has validation configured
     */
    hasValidation(entityType) {
        return this.schemas.has(entityType) ||
            this.config.customValidators.has(entityType);
    }
    shouldValidate(context) {
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
    async validateWithSchema(entity, schema, context) {
        try {
            return await schema.validate(entity);
        }
        catch (error) {
            this.logger.error(`Schema validation error for ${context.entityType}`, error);
            return ValidationFramework_1.ValidationResult.failure([
                new ValidationFramework_1.ValidationError('schema', 'Schema validation failed', 'SCHEMA_VALIDATION_ERROR')
            ]);
        }
    }
    combineResults(results) {
        if (results.length === 0) {
            return ValidationFramework_1.ValidationResult.success();
        }
        const allErrors = [];
        const allWarnings = [];
        for (const result of results) {
            allErrors.push(...result.getErrors());
            allWarnings.push(...result.getWarnings());
        }
        if (allErrors.length > 0) {
            const result = ValidationFramework_1.ValidationResult.failure(allErrors);
            allWarnings.forEach(warning => result.addError(warning));
            return result;
        }
        if (allWarnings.length > 0) {
            return ValidationFramework_1.ValidationResult.warning(allWarnings);
        }
        return ValidationFramework_1.ValidationResult.success();
    }
    normalizeValidationResult(result) {
        // Handle different result formats
        if (result instanceof ValidationFramework_1.ValidationResult) {
            return result;
        }
        if (result.isValid !== undefined && (result.getErrors || Array.isArray(result.errors))) {
            const errors = (result.getErrors ? result.getErrors() : result.errors).map((e) => new ValidationFramework_1.ValidationError(e.field || 'unknown', e.message || 'Validation failed', e.code));
            return result.isValid
                ? ValidationFramework_1.ValidationResult.success()
                : ValidationFramework_1.ValidationResult.failure(errors);
        }
        // Assume invalid if we can't parse the result
        return ValidationFramework_1.ValidationResult.failure([
            new ValidationFramework_1.ValidationError('unknown', 'Unknown validation result format', 'UNKNOWN_RESULT_FORMAT')
        ]);
    }
    getCacheKey(entity, context) {
        const entityId = entity.id || entity.Id || JSON.stringify(entity);
        return `${context.entityType}:${context.operation}:${entityId}`;
    }
    getCachedResult(entity, context) {
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
    cacheResult(entity, context, result) {
        if (!this.config.cacheResults) {
            return result;
        }
        const key = this.getCacheKey(entity, context);
        const expiry = Date.now() + this.config.cacheTimeout;
        this.validationCache.set(key, { result, expiry });
        return result;
    }
    startCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            const keysToDelete = [];
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
exports.EntityValidator = EntityValidator;
//# sourceMappingURL=EntityValidator.js.map