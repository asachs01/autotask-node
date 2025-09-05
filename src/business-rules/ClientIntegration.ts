/**
 * Business Rule Integration for AutotaskClient
 * 
 * Provides middleware and decorators to integrate business rules
 * with the Autotask SDK client operations.
 */

import { BusinessRuleEngine } from './BusinessRuleEngine';
import { RuleContext } from './BusinessRule';
import { ValidationResult } from './ValidationResult';
import { RuleConfigurationManager } from './RuleConfiguration';
import { ErrorLogger } from '../errors/ErrorLogger';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

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
export class BusinessRuleMiddleware {
  private engine: BusinessRuleEngine;
  private options: Required<BusinessRuleMiddlewareOptions>;
  private errorLogger: ErrorLogger;
  
  constructor(
    engine: BusinessRuleEngine,
    options?: BusinessRuleMiddlewareOptions
  ) {
    this.engine = engine;
    this.options = {
      validateOnCreate: options?.validateOnCreate ?? true,
      validateOnUpdate: options?.validateOnUpdate ?? true,
      validateOnDelete: options?.validateOnDelete ?? false,
      throwOnValidationFailure: options?.throwOnValidationFailure ?? true,
      enableAutoFix: options?.enableAutoFix ?? false,
      skipEntityTypes: options?.skipEntityTypes ?? [],
      onValidationError: options?.onValidationError ?? (() => {}),
      errorLogger: options?.errorLogger || new ErrorLogger()
    };
    this.errorLogger = options?.errorLogger || new ErrorLogger();
  }
  
  /**
   * Create request interceptor for Axios
   */
  createRequestInterceptor() {
    return async (config: any): Promise<any> => {
      // Only intercept for POST (create) and PATCH (update) requests
      if (!config.method || !['POST', 'PATCH', 'DELETE'].includes(config.method.toUpperCase())) {
        return config;
      }
      
      // Extract entity type from URL
      const entityType = this.extractEntityType(config.url || '');
      if (!entityType || this.options.skipEntityTypes.includes(entityType)) {
        return config;
      }
      
      // Determine operation type
      const operation = this.getOperationType(config.method);
      
      // Check if validation is enabled for this operation
      if (!this.shouldValidate(operation)) {
        return config;
      }
      
      // Validate the entity
      if (config.data) {
        const result = await this.validateEntity(
          entityType,
          config.data,
          operation,
          config
        );
        
        if (!result.isValid) {
          this.handleValidationFailure(result, entityType, operation);
        }
      }
      
      return config;
    };
  }
  
  /**
   * Create response interceptor for Axios
   */
  createResponseInterceptor() {
    return async (response: AxiosResponse): Promise<AxiosResponse> => {
      // Add validation metadata to response if available
      if (response.config && response.config.headers) {
        const validationResult = (response.config as any).__validationResult;
        if (validationResult) {
          response.data.__validation = validationResult;
        }
      }
      
      return response;
    };
  }
  
  /**
   * Extract entity type from URL
   */
  private extractEntityType(url: string): string | null {
    // Match patterns like /Companies, /Tickets, /Projects, etc.
    const match = url.match(/\/([A-Z][a-zA-Z]+)(?:\/|$)/);
    if (match) {
      // Convert to lowercase for consistency
      return match[1].toLowerCase();
    }
    return null;
  }
  
  /**
   * Get operation type from HTTP method
   */
  private getOperationType(method: string): 'create' | 'update' | 'delete' {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'create';
      case 'PATCH':
      case 'PUT':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'update';
    }
  }
  
  /**
   * Check if validation should be performed for operation
   */
  private shouldValidate(operation: 'create' | 'update' | 'delete'): boolean {
    switch (operation) {
      case 'create':
        return this.options.validateOnCreate;
      case 'update':
        return this.options.validateOnUpdate;
      case 'delete':
        return this.options.validateOnDelete;
      default:
        return false;
    }
  }
  
  /**
   * Validate an entity
   */
  private async validateEntity(
    entityType: string,
    entity: any,
    operation: 'create' | 'update' | 'delete',
    config: AxiosRequestConfig
  ): Promise<ValidationResult> {
    const context: RuleContext = {
      entityType,
      operation,
      sessionId: (config.headers as any)?.['X-Session-ID'],
      userId: (config.headers as any)?.['X-User-ID'],
      metadata: {
        requestId: (config.headers as any)?.['X-Request-ID'],
        timestamp: new Date().toISOString()
      }
    };
    
    // For updates, try to get the original entity
    if (operation === 'update' && config.url) {
      // Extract entity ID from URL
      const idMatch = config.url.match(/\/(\d+)$/);
      if (idMatch) {
        context.metadata!.entityId = idMatch[1];
      }
    }
    
    const result = await this.engine.validateEntity(entityType, entity, context);
    
    // Store result for response interceptor
    (config as any).__validationResult = result;
    
    return result;
  }
  
  /**
   * Handle validation failure
   */
  private handleValidationFailure(
    result: ValidationResult,
    entityType: string,
    operation: 'create' | 'update' | 'delete'
  ): void {
    const context: RuleContext = {
      entityType,
      operation
    };
    
    // Call custom error handler
    this.options.onValidationError(result, context);
    
    // Log validation failure
    if (this.errorLogger) {
      this.errorLogger.error(
        `Business rule validation failed for ${entityType} ${operation}`,
        new Error('Validation failed'),
        {
          entityType,
          operation,
          errors: result.getErrors(),
          warnings: result.getWarnings().map(w => w.message)
        }
      );
    }
    
    // Throw error if configured
    if (this.options.throwOnValidationFailure) {
      const error = new ValidationError(result);
      throw error;
    }
  }
}

/**
 * Validation error class
 */
export class ValidationError extends Error {
  public readonly validationResult: ValidationResult;
  
  constructor(result: ValidationResult) {
    const summary = result.getSummary();
    const message = `Validation failed with ${summary.errorCount} error(s) and ${summary.warningCount} warning(s)`;
    super(message);
    
    this.name = 'ValidationError';
    this.validationResult = result;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
  
  /**
   * Get formatted error message
   */
  getFormattedMessage(): string {
    const lines = [this.message];
    
    const errors = this.validationResult.getErrors();
    if (errors.length > 0) {
      lines.push('\nErrors:');
      errors.forEach(error => {
        const fields = error.fields ? ` [${error.fields.join(', ')}]` : '';
        lines.push(`  - ${error.code}: ${error.message}${fields}`);
      });
    }
    
    const warnings = this.validationResult.getWarnings();
    if (warnings.length > 0) {
      lines.push('\nWarnings:');
      warnings.forEach(warning => {
        const fields = warning.fields ? ` [${warning.fields.join(', ')}]` : '';
        lines.push(`  - ${warning.code}: ${warning.message}${fields}`);
      });
    }
    
    return lines.join('\n');
  }
}

/**
 * Decorator for method-level validation
 */
export function ValidateEntity(options?: {
  entityType?: string;
  operation?: 'create' | 'update' | 'delete';
  throwOnFailure?: boolean;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Get the business rule engine
      const manager = RuleConfigurationManager.getInstance();
      const engine = manager.getEngine();
      
      // Determine entity type
      const entityType = options?.entityType || this.constructor.name.replace(/Client$/, '').toLowerCase();
      const operation = options?.operation || 'update';
      
      // Validate the first argument (assumed to be the entity)
      if (args.length > 0 && typeof args[0] === 'object') {
        const context: RuleContext = {
          entityType,
          operation,
          metadata: {
            method: propertyKey,
            class: this.constructor.name
          }
        };
        
        const result = await engine.validateEntity(entityType, args[0], context);
        
        if (!result.isValid && options?.throwOnFailure !== false) {
          throw new ValidationError(result);
        }
        
        // Add validation result to entity metadata
        if (typeof args[0] === 'object') {
          args[0].__validation = result;
        }
      }
      
      // Call original method
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Enhanced AutotaskClient with business rules
 */
export class BusinessRuleEnhancedClient {
  private middleware: BusinessRuleMiddleware;
  
  constructor(
    private axiosInstance: AxiosInstance,
    private engine?: BusinessRuleEngine,
    options?: BusinessRuleMiddlewareOptions
  ) {
    // Get or create engine
    if (!engine) {
      const manager = RuleConfigurationManager.getInstance(options?.errorLogger);
      engine = manager.getEngine();
    }
    
    // Create middleware
    this.middleware = new BusinessRuleMiddleware(engine, options);
    
    // Setup interceptors
    this.setupInterceptors();
  }
  
  /**
   * Setup Axios interceptors
   */
  private setupInterceptors(): void {
    // Add request interceptor
    this.axiosInstance.interceptors.request.use(
      this.middleware.createRequestInterceptor(),
      error => Promise.reject(error)
    );
    
    // Add response interceptor
    this.axiosInstance.interceptors.response.use(
      this.middleware.createResponseInterceptor(),
      error => Promise.reject(error)
    );
  }
  
  /**
   * Get the business rule engine
   */
  getEngine(): BusinessRuleEngine {
    return this.middleware['engine'];
  }
  
  /**
   * Validate an entity manually
   */
  async validateEntity(
    entityType: string,
    entity: any,
    context?: RuleContext
  ): Promise<ValidationResult> {
    return this.middleware['engine'].validateEntity(entityType, entity, context);
  }
  
  /**
   * Get validation summary for recent operations
   */
  getValidationSummary(): {
    totalValidations: number;
    failedValidations: number;
    successRate: number;
  } {
    const stats = this.middleware['engine'].getStatistics();
    let total = 0;
    let failed = 0;
    
    for (const [, ruleStats] of stats) {
      for (const stat of ruleStats) {
        total++;
        if (!stat.passed) {
          failed++;
        }
      }
    }
    
    return {
      totalValidations: total,
      failedValidations: failed,
      successRate: total > 0 ? (total - failed) / total : 1
    };
  }
}