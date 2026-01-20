/**
 * Core validation engine for Autotask entities
 * Orchestrates schema validation, business rules, security checks, and compliance validation
 */
import winston from 'winston';
import { ValidationResult, ValidationContext, ValidationConfig, ValidationEventHandler, PerformanceMetrics } from '../types/ValidationTypes';
import { SchemaRegistry } from './SchemaRegistry';
import { InputSanitizer } from '../sanitization/InputSanitizer';
import { SecurityValidator } from '../security/SecurityValidator';
import { ComplianceValidator } from '../compliance/ComplianceValidator';
import { QualityAssurance } from '../quality/QualityAssurance';
export declare class ValidationEngine {
    private schemaRegistry;
    private sanitizer;
    private securityValidator;
    private complianceValidator;
    private qualityAssurance;
    private logger;
    private config;
    private eventHandlers;
    private metrics;
    constructor(schemaRegistry: SchemaRegistry, sanitizer: InputSanitizer, securityValidator: SecurityValidator, complianceValidator: ComplianceValidator, qualityAssurance: QualityAssurance, logger: winston.Logger, config: ValidationConfig);
    /**
     * Validate an entity with comprehensive checks
     */
    validateEntity(entity: any, context: ValidationContext): Promise<ValidationResult>;
    /**
     * Validate multiple entities in batch
     */
    validateBatch(entities: {
        entity: any;
        context: ValidationContext;
    }[]): Promise<ValidationResult[]>;
    /**
     * Add event handler for validation lifecycle events
     */
    addEventListener(eventType: string, handler: ValidationEventHandler): void;
    /**
     * Remove event handler
     */
    removeEventListener(eventType: string, handler: ValidationEventHandler): void;
    /**
     * Get performance metrics for an entity type
     */
    getPerformanceMetrics(entityType: string): PerformanceMetrics[];
    /**
     * Get aggregated performance statistics
     */
    getPerformanceStatistics(): {
        totalValidations: number;
        averageValidationTime: number;
        averageRulesExecuted: number;
        entityTypeStats: Record<string, {
            count: number;
            avgTime: number;
            avgRules: number;
        }>;
    };
    /**
     * Clear performance metrics
     */
    clearMetrics(): void;
    /**
     * Validate against entity schema
     */
    private validateSchema;
    /**
     * Validate business rules
     */
    private validateBusinessRules;
    /**
     * Evaluate a single business rule
     */
    private evaluateBusinessRule;
    /**
     * Merge validation results
     */
    private mergeResults;
    /**
     * Store performance metrics
     */
    private storeMetrics;
    /**
     * Emit validation event
     */
    private emitEvent;
    /**
     * Generate unique validation ID
     */
    private generateValidationId;
}
//# sourceMappingURL=ValidationEngine.d.ts.map