/**
 * Core Validation Framework
 * Production-ready validation system for Autotask SDK
 */
import 'reflect-metadata';
/**
 * Represents a single validation error
 */
export declare class ValidationError {
    readonly field: string;
    readonly value: any;
    readonly message: string;
    readonly code?: string | undefined;
    readonly severity: 'error' | 'warning';
    constructor(field: string, value: any, message: string, code?: string | undefined, severity?: 'error' | 'warning');
    toString(): string;
}
/**
 * Represents the result of a validation operation
 */
export declare class ValidationResult {
    private errors;
    private warnings;
    /**
     * Create a successful validation result
     */
    static success(): ValidationResult;
    /**
     * Create a failed validation result with errors
     */
    static failure(errors: ValidationError[]): ValidationResult;
    /**
     * Create a validation result with warnings only
     */
    static warning(warnings: ValidationError[]): ValidationResult;
    /**
     * Add a validation error
     */
    addError(error: ValidationError): void;
    /**
     * Check if validation passed (no errors, warnings allowed)
     */
    get isValid(): boolean;
    /**
     * Check if validation has warnings
     */
    hasWarnings(): boolean;
    /**
     * Get all errors
     */
    getErrors(): ValidationError[];
    /**
     * Get all warnings
     */
    getWarnings(): ValidationError[];
    /**
     * Get errors for a specific field
     */
    getErrorsForField(field: string): ValidationError[];
    /**
     * Get warnings for a specific field
     */
    getWarningsForField(field: string): ValidationError[];
    /**
     * Merge another validation result into this one
     */
    merge(other: ValidationResult): void;
    /**
     * Get a summary of all issues
     */
    getSummary(): string;
    /**
     * Get detailed error messages
     */
    getDetailedMessages(): string[];
}
/**
 * Base validation rule
 */
export declare class ValidationRule {
    readonly field: string;
    readonly validator: (value: any, entity?: any) => boolean | Promise<boolean>;
    readonly message: string | ((value: any, field: string) => string);
    readonly code?: string | undefined;
    readonly severity: 'error' | 'warning';
    constructor(field: string, validator: (value: any, entity?: any) => boolean | Promise<boolean>, message: string | ((value: any, field: string) => string), code?: string | undefined, severity?: 'error' | 'warning');
    /**
     * Execute the validation rule
     */
    validate(value: any, entity?: any): Promise<ValidationError | null>;
}
/**
 * Standard validation rule factories
 */
export declare class ValidationRules {
    /**
     * Field is required (not null, undefined, or empty string)
     */
    static required(field?: string, message?: string): ValidationRule;
    /**
     * Field must be of specific type
     */
    static type(field: string, type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object', message?: string): ValidationRule;
    /**
     * String length constraints
     */
    static stringLength(field: string, options: {
        min?: number;
        max?: number;
        exact?: number;
    }, message?: string): ValidationRule;
    /**
     * String format validation
     */
    static format(field: string, format: 'email' | 'phone' | 'url' | 'uuid' | 'ipv4' | 'ipv6' | RegExp, message?: string): ValidationRule;
    /**
     * Numeric range validation
     */
    static range(field: string, options: {
        min?: number;
        max?: number;
    }, message?: string): ValidationRule;
    /**
     * Value must be one of allowed values
     */
    static enumeration<T>(field: string, allowedValues: T[], message?: string): ValidationRule;
    /**
     * Custom validation function
     */
    static custom(field: string, validator: (value: any, entity?: any) => boolean | Promise<boolean>, message: string, code?: string): ValidationRule;
    /**
     * Conditional validation - only validate if condition is met
     */
    static conditional(field: string, condition: (entity: any) => boolean, rule: ValidationRule): ValidationRule;
    /**
     * Array element validation
     */
    static arrayElements(field: string, elementRule: ValidationRule, message?: string): ValidationRule;
    /**
     * Convenience methods for common validations
     */
    static string(field?: string, message?: string): ValidationRule;
    static number(field?: string, message?: string): ValidationRule;
    static boolean(field?: string, message?: string): ValidationRule;
    static minLength(min: number, field?: string, message?: string): ValidationRule;
    static maxLength(max: number, field?: string, message?: string): ValidationRule;
    static email(field?: string, message?: string): ValidationRule;
    static url(field?: string, message?: string): ValidationRule;
    static uuid(field?: string, message?: string): ValidationRule;
    static enum(values: any[], field?: string, message?: string): ValidationRule;
    static pattern(pattern: RegExp, field?: string, message?: string): ValidationRule;
    /**
     * Nested object validation
     */
    static nested(field: string, rules: ValidationRule[], message?: string): ValidationRule;
}
/**
 * Main entity validator
 */
export declare class EntityValidator {
    /**
     * Validate an entity against a set of rules
     */
    validate(entity: any, rules: ValidationRule[]): Promise<ValidationResult>;
    /**
     * Get value from nested property path
     */
    private getNestedPropertyValue;
}
/**
 * Validation schema for defining rules programmatically
 */
export declare class ValidationSchema<T = any> {
    private rules;
    private entityRules;
    /**
     * Get all validation rules
     */
    get allRules(): ValidationRule[];
    /**
     * Add field validation rules
     */
    field(field: keyof T & string): FieldBuilder<T>;
    /**
     * Add a rule directly
     */
    addRule(rule: ValidationRule): this;
    /**
     * Add entity-level validation
     */
    addEntityRule(validator: (entity: T) => ValidationError[] | Promise<ValidationError[]>): this;
    /**
     * Validate an entity
     */
    validate(entity: T): Promise<ValidationResult>;
    /**
     * Get all rules
     */
    getRules(): ValidationRule[];
}
/**
 * Fluent builder for field validation rules
 */
export declare class FieldBuilder<T> {
    private schema;
    private field;
    constructor(schema: ValidationSchema<T>, field: string);
    required(message?: string): this;
    string(message?: string): this;
    number(message?: string): this;
    boolean(message?: string): this;
    date(message?: string): this;
    array(message?: string): this;
    object(message?: string): this;
    length(options: {
        min?: number;
        max?: number;
        exact?: number;
    }, message?: string): this;
    email(message?: string): this;
    phone(message?: string): this;
    url(message?: string): this;
    uuid(message?: string): this;
    pattern(pattern: RegExp, message: string): this;
    range(options: {
        min?: number;
        max?: number;
    }, message?: string): this;
    enum<V>(allowedValues: V[], message?: string): this;
    custom(validator: (value: any, entity?: T) => boolean | Promise<boolean>, message: string, code?: string): this;
    conditional(condition: (entity: T) => boolean, configureRule: (builder: FieldBuilder<T>) => void): this;
}
export * from './ValidationDecorators';
//# sourceMappingURL=ValidationFramework.d.ts.map