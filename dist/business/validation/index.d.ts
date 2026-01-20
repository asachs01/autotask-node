/**
 * Validation Framework for Autotask Business Logic
 *
 * Provides comprehensive validation capabilities including:
 * - Field-level validators (required, format, range, dependencies)
 * - Entity-level validators (business rules, state consistency)
 * - Cross-entity validators (relationships, referential integrity)
 */
export * from './validators';
export * from './rules';
export * from './decorators';
export * from './errors';
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
    suggestedFix?: string;
    context?: Record<string, any>;
}
export interface ValidationWarning {
    field: string;
    message: string;
    code: string;
    suggestedAction?: string;
}
export interface ValidatorConfig {
    enabled: boolean;
    severity: 'error' | 'warning';
    customMessage?: string;
    context?: Record<string, any>;
}
export interface FieldValidator {
    name: string;
    validate: (value: any, context?: any) => ValidationResult;
    config?: any;
}
export interface EntityValidator {
    name: string;
    entityType: string;
    validate: (entity: any, context?: any) => ValidationResult;
    config?: ValidatorConfig;
}
export interface CrossEntityValidator {
    name: string;
    entities: string[];
    validate: (entities: Record<string, any>, context?: any) => ValidationResult;
    config?: ValidatorConfig;
}
//# sourceMappingURL=index.d.ts.map