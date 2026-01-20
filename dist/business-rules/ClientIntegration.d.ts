/**
 * Business Rule Integration for AutotaskClient
 *
 * Provides middleware and decorators to integrate business rules
 * with the Autotask SDK client operations.
 */
import { BusinessRuleEngine } from './BusinessRuleEngine';
import { RuleContext } from './BusinessRule';
import { ValidationResult } from './ValidationResult';
import { ErrorLogger } from '../errors/ErrorLogger';
import { AxiosInstance, AxiosResponse } from 'axios';
/**
 * Options for business rule middleware
 */
export interface BusinessRuleMiddlewareOptions {
    /** Enable validation on create operations */
    validateOnCreate?: boolean;
    /** Enable validation on update operations */
    validateOnUpdate?: boolean;
    /** Enable validation on delete operations */
    validateOnDelete?: boolean;
    /** Throw error on validation failure */
    throwOnValidationFailure?: boolean;
    /** Auto-fix issues if possible */
    enableAutoFix?: boolean;
    /** Skip validation for specific entity types */
    skipEntityTypes?: string[];
    /** Custom error handler */
    onValidationError?: (result: ValidationResult, context: RuleContext) => void;
    /** Error logger instance */
    errorLogger?: ErrorLogger;
}
/**
 * Business rule middleware for Axios
 */
export declare class BusinessRuleMiddleware {
    private engine;
    private options;
    private errorLogger;
    constructor(engine: BusinessRuleEngine, options?: BusinessRuleMiddlewareOptions);
    /**
     * Create request interceptor for Axios
     */
    createRequestInterceptor(): (config: any) => Promise<any>;
    /**
     * Create response interceptor for Axios
     */
    createResponseInterceptor(): (response: AxiosResponse) => Promise<AxiosResponse>;
    /**
     * Extract entity type from URL
     */
    private extractEntityType;
    /**
     * Get operation type from HTTP method
     */
    private getOperationType;
    /**
     * Check if validation should be performed for operation
     */
    private shouldValidate;
    /**
     * Validate an entity
     */
    private validateEntity;
    /**
     * Handle validation failure
     */
    private handleValidationFailure;
}
/**
 * Validation error class
 */
export declare class ValidationError extends Error {
    readonly validationResult: ValidationResult;
    constructor(result: ValidationResult);
    /**
     * Get formatted error message
     */
    getFormattedMessage(): string;
}
/**
 * Decorator for method-level validation
 */
export declare function ValidateEntity(options?: {
    entityType?: string;
    operation?: 'create' | 'update' | 'delete';
    throwOnFailure?: boolean;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Enhanced AutotaskClient with business rules
 */
export declare class BusinessRuleEnhancedClient {
    private axiosInstance;
    private engine?;
    private middleware;
    constructor(axiosInstance: AxiosInstance, engine?: BusinessRuleEngine | undefined, options?: BusinessRuleMiddlewareOptions);
    /**
     * Setup Axios interceptors
     */
    private setupInterceptors;
    /**
     * Get the business rule engine
     */
    getEngine(): BusinessRuleEngine;
    /**
     * Validate an entity manually
     */
    validateEntity(entityType: string, entity: any, context?: RuleContext): Promise<ValidationResult>;
    /**
     * Get validation summary for recent operations
     */
    getValidationSummary(): {
        totalValidations: number;
        failedValidations: number;
        successRate: number;
    };
}
//# sourceMappingURL=ClientIntegration.d.ts.map