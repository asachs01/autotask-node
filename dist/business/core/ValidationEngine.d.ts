import { FieldValidator, EntityValidator, CrossEntityValidator, ValidationResult } from '../validation';
/**
 * Central validation engine that orchestrates all validation operations
 */
export declare class ValidationEngine {
    private fieldValidators;
    private entityValidators;
    private crossEntityValidators;
    /**
     * Register a field validator for a specific entity and field
     */
    registerFieldValidator(entityType: string, fieldName: string, validator: FieldValidator): void;
    /**
     * Register an entity validator for a specific entity type
     */
    registerEntityValidator(validator: EntityValidator): void;
    /**
     * Register a cross-entity validator
     */
    registerCrossEntityValidator(validator: CrossEntityValidator): void;
    /**
     * Validate a single field value
     */
    validateField(entityType: string, fieldName: string, value: any, context?: any): ValidationResult;
    /**
     * Validate an entire entity
     */
    validateEntity(entityType: string, entity: any, context?: any): ValidationResult;
    /**
     * Validate relationships between multiple entities
     */
    validateCrossEntity(entities: Record<string, any>, context?: any): ValidationResult;
    /**
     * Comprehensive validation that runs field, entity, and cross-entity validation
     */
    validateComplete(primaryEntityType: string, primaryEntity: any, relatedEntities?: Record<string, any>, context?: any): ValidationResult;
    /**
     * Get validation summary with counts and severity breakdown
     */
    getValidationSummary(result: ValidationResult): {
        isValid: boolean;
        totalErrors: number;
        totalWarnings: number;
        errorsBySeverity: Record<string, number>;
        errorsByCode: Record<string, number>;
    };
}
//# sourceMappingURL=ValidationEngine.d.ts.map