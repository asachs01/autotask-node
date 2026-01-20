/**
 * Core Business Rule Interface and Types
 *
 * Defines the contract for business rules and provides
 * context for rule execution.
 */
import { ValidationResult } from './ValidationResult';
/**
 * Context provided to business rules during execution
 */
export interface RuleContext {
    /** Entity type being validated */
    entityType: string;
    /** Operation being performed (create, update, delete) */
    operation?: 'create' | 'update' | 'delete';
    /** Original entity state (for updates) */
    originalEntity?: any;
    /** Current user performing the operation */
    userId?: string;
    /** Current session or request ID */
    sessionId?: string;
    /** Additional context data */
    metadata?: Record<string, any>;
    /** Function to load related entities */
    loadRelatedEntity?: (type: string, id: string) => Promise<any>;
    /** Function to check if a feature is enabled */
    isFeatureEnabled?: (feature: string) => boolean;
    /** Current environment (development, staging, production) */
    environment?: string;
}
/**
 * Priority levels for rule execution order
 */
export declare enum RulePriority {
    CRITICAL = 0,// Must run first
    HIGH = 100,
    NORMAL = 500,
    LOW = 900,
    DEFERRED = 1000
}
/**
 * Base interface for all business rules
 */
export interface BusinessRule {
    /** Unique name for the rule */
    name: string;
    /** Description of what the rule validates */
    description?: string;
    /** Priority for execution order (lower numbers run first) */
    priority?: number;
    /** Entity types this rule applies to */
    appliesTo?: string[];
    /** Tags for categorizing rules */
    tags?: string[];
    /** Whether the rule is currently enabled */
    enabled?: boolean;
    /**
     * Condition to determine if the rule should be applied
     * @param entity The entity to check
     * @param context Rule execution context
     * @returns True if the rule should be validated
     */
    condition?(entity: any, context?: RuleContext): boolean | Promise<boolean>;
    /**
     * Validate the entity according to this rule
     * @param entity The entity to validate
     * @param context Rule execution context
     * @returns Validation result
     */
    validate(entity: any, context?: RuleContext): ValidationResult | Promise<ValidationResult>;
    /**
     * Optional method to fix issues automatically
     * @param entity The entity to fix
     * @param context Rule execution context
     * @returns Fixed entity or null if cannot be fixed
     */
    autoFix?(entity: any, context?: RuleContext): any | Promise<any>;
}
/**
 * Abstract base class for business rules
 */
export declare abstract class BaseBusinessRule implements BusinessRule {
    name: string;
    description?: string;
    priority: number;
    appliesTo?: string[];
    tags?: string[];
    enabled: boolean;
    constructor(name: string, options?: {
        description?: string;
        priority?: number;
        appliesTo?: string[];
        tags?: string[];
        enabled?: boolean;
    });
    /**
     * Default condition - always apply the rule
     */
    condition(entity: any, context?: RuleContext): boolean | Promise<boolean>;
    /**
     * Abstract validation method - must be implemented by subclasses
     */
    abstract validate(entity: any, context?: RuleContext): ValidationResult | Promise<ValidationResult>;
}
/**
 * Rule for required fields
 */
export declare class RequiredFieldRule extends BaseBusinessRule {
    private fields;
    private conditionalFields?;
    constructor(name: string, fields: string[], options?: {
        description?: string;
        priority?: number;
        appliesTo?: string[];
        enabled?: boolean;
        conditionalFields?: Map<string, (entity: any) => boolean>;
    });
    validate(entity: any, context?: RuleContext): ValidationResult;
    private getFieldValue;
}
/**
 * Rule for field value validation
 */
export declare class FieldValueRule extends BaseBusinessRule {
    private field;
    private validator;
    private errorMessage;
    constructor(name: string, field: string, validator: (value: any, entity: any) => boolean, errorMessage: string, options?: {
        description?: string;
        priority?: number;
        appliesTo?: string[];
    });
    validate(entity: any, context?: RuleContext): ValidationResult;
    private getFieldValue;
}
/**
 * Rule for regex pattern validation
 */
export declare class PatternRule extends BaseBusinessRule {
    private field;
    private pattern;
    private errorMessage;
    constructor(name: string, field: string, pattern: RegExp | string, errorMessage?: string, options?: {
        description?: string;
        priority?: number;
        appliesTo?: string[];
    });
    validate(entity: any, context?: RuleContext): ValidationResult;
    private getFieldValue;
}
/**
 * Rule for range validation (numeric or date)
 */
export declare class RangeRule extends BaseBusinessRule {
    private field;
    private min?;
    private max?;
    private inclusive;
    constructor(name: string, field: string, options: {
        min?: number | Date;
        max?: number | Date;
        inclusive?: boolean;
        description?: string;
        priority?: number;
        appliesTo?: string[];
    });
    validate(entity: any, context?: RuleContext): ValidationResult;
    private getFieldValue;
}
/**
 * Composite rule that combines multiple rules with AND logic
 */
export declare class CompositeRule extends BaseBusinessRule {
    private rules;
    private stopOnFirstError;
    constructor(name: string, rules: BusinessRule[], options?: {
        stopOnFirstError?: boolean;
        description?: string;
        priority?: number;
        appliesTo?: string[];
    });
    condition(entity: any, context?: RuleContext): Promise<boolean>;
    validate(entity: any, context?: RuleContext): Promise<ValidationResult>;
}
//# sourceMappingURL=BusinessRule.d.ts.map