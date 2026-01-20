/**
 * Comprehensive validation and sanitization layer for Autotask SDK
 * Main entry point for all validation functionality
 */
export { ValidationEngine } from './core/ValidationEngine';
export { SchemaRegistry } from './core/SchemaRegistry';
export { InputSanitizer } from './sanitization/InputSanitizer';
export { SecurityValidator } from './security/SecurityValidator';
export { ComplianceValidator } from './compliance/ComplianceValidator';
export { QualityAssurance } from './quality/QualityAssurance';
export * from './types/ValidationTypes';
import winston from 'winston';
import { ValidationEngine } from './core/ValidationEngine';
import { ValidationConfig, SanitizationConfig, ValidationResult } from './types/ValidationTypes';
/**
 * Factory for creating a fully configured validation engine
 */
export declare class ValidationFactory {
    private static instance;
    /**
     * Create a new validation engine with default configuration
     */
    static create(logger?: winston.Logger): ValidationEngine;
    /**
     * Create validation engine with custom configuration
     */
    static createWithConfig(config: Partial<ValidationConfig>, sanitizationConfig?: Partial<SanitizationConfig>, logger?: winston.Logger): ValidationEngine;
    /**
     * Get singleton instance (creates if doesn't exist)
     */
    static getInstance(logger?: winston.Logger): ValidationEngine;
    /**
     * Reset singleton instance
     */
    static resetInstance(): void;
    /**
     * Create default logger
     */
    private static createDefaultLogger;
}
/**
 * Utility functions for common validation scenarios
 */
export declare class ValidationUtils {
    /**
     * Quick validation for a single entity with default settings
     */
    static validateEntity(entity: any, entityType: string, operation?: 'create' | 'update' | 'delete' | 'read', userId?: string): Promise<ValidationResult>;
    /**
     * Validate multiple entities in batch
     */
    static validateBatch(entities: Array<{
        entity: any;
        entityType: string;
        operation?: 'create' | 'update' | 'delete' | 'read';
    }>, userId?: string): Promise<ValidationResult[]>;
    /**
     * Quick sanitization for untrusted input
     */
    static sanitizeInput(data: any, entityType?: string): Promise<any>;
    /**
     * Check if data meets quality thresholds
     */
    static checkQuality(entity: any, entityType: string, minOverallScore?: number): Promise<{
        passed: boolean;
        score: number;
        issues: string[];
    }>;
    /**
     * Detect potential security threats in data
     */
    static detectThreats(data: any): Promise<Array<{
        type: string;
        severity: string;
        description: string;
        field?: string;
    }>>;
    /**
     * Check compliance for specific regulations
     */
    static checkCompliance(entity: any, entityType: string, jurisdiction?: string, processingPurpose?: string[]): Promise<{
        compliant: boolean;
        violations: Array<{
            regulation: string;
            issue: string;
            severity: string;
        }>;
    }>;
    /**
     * Generate unique request ID
     */
    private static generateRequestId;
}
/**
 * Validation decorators for easy integration
 */
export declare class ValidationDecorators {
    /**
     * Method decorator for automatic validation
     */
    static validate(entityType: string, operation?: 'create' | 'update' | 'delete' | 'read'): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    /**
     * Class decorator for automatic validation of all methods
     */
    static validateClass(entityType: string): <T extends {
        new (...args: any[]): object;
    }>(constructor: T) => {
        new (...args: any[]): {};
    } & T;
}
/**
 * Express middleware for request validation
 */
export declare function validationMiddleware(options: {
    entityType: string;
    operation?: 'create' | 'update' | 'delete' | 'read';
    bodyField?: string;
    strict?: boolean;
}): (req: any, res: any, next: any) => Promise<any>;
export declare const defaultValidationEngine: ValidationEngine;
//# sourceMappingURL=index.d.ts.map