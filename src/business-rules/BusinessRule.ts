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
export enum RulePriority {
  CRITICAL = 0,    // Must run first
  HIGH = 100,
  NORMAL = 500,
  LOW = 900,
  DEFERRED = 1000  // Run last
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
export abstract class BaseBusinessRule implements BusinessRule {
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
  }) {
    this.name = name;
    this.description = options?.description;
    this.priority = options?.priority ?? RulePriority.NORMAL;
    this.appliesTo = options?.appliesTo;
    this.tags = options?.tags;
    this.enabled = options?.enabled ?? true;
  }
  
  /**
   * Default condition - always apply the rule
   */
  condition(entity: any, context?: RuleContext): boolean | Promise<boolean> {
    return this.enabled;
  }
  
  /**
   * Abstract validation method - must be implemented by subclasses
   */
  abstract validate(entity: any, context?: RuleContext): ValidationResult | Promise<ValidationResult>;
}

/**
 * Rule for required fields
 */
export class RequiredFieldRule extends BaseBusinessRule {
  private fields: string[];
  private conditionalFields?: Map<string, (entity: any) => boolean>;
  
  constructor(
    name: string,
    fields: string[],
    options?: {
      description?: string;
      priority?: number;
      appliesTo?: string[];
      enabled?: boolean;
      conditionalFields?: Map<string, (entity: any) => boolean>;
    }
  ) {
    super(name, options);
    this.fields = fields;
    this.conditionalFields = options?.conditionalFields;
  }
  
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    
    for (const field of this.fields) {
      // Check if this field is conditionally required
      if (this.conditionalFields?.has(field)) {
        const condition = this.conditionalFields.get(field)!;
        if (!condition(entity)) {
          continue; // Skip this field if condition is not met
        }
      }
      
      const value = this.getFieldValue(entity, field);
      
      if (value === null || value === undefined || value === '') {
        result.addError(
          'REQUIRED_FIELD',
          `Field '${field}' is required`,
          [field],
          { entityType: context?.entityType }
        );
      }
    }
    
    return result;
  }
  
  private getFieldValue(entity: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}

/**
 * Rule for field value validation
 */
export class FieldValueRule extends BaseBusinessRule {
  private field: string;
  private validator: (value: any, entity: any) => boolean;
  private errorMessage: string;
  
  constructor(
    name: string,
    field: string,
    validator: (value: any, entity: any) => boolean,
    errorMessage: string,
    options?: {
      description?: string;
      priority?: number;
      appliesTo?: string[];
    }
  ) {
    super(name, options);
    this.field = field;
    this.validator = validator;
    this.errorMessage = errorMessage;
  }
  
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    const value = this.getFieldValue(entity, this.field);
    
    if (value !== undefined && value !== null && !this.validator(value, entity)) {
      result.addError(
        'INVALID_FIELD_VALUE',
        this.errorMessage,
        [this.field],
        { value, entityType: context?.entityType }
      );
    }
    
    return result;
  }
  
  private getFieldValue(entity: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}

/**
 * Rule for regex pattern validation
 */
export class PatternRule extends BaseBusinessRule {
  private field: string;
  private pattern: RegExp;
  private errorMessage: string;
  
  constructor(
    name: string,
    field: string,
    pattern: RegExp | string,
    errorMessage?: string,
    options?: {
      description?: string;
      priority?: number;
      appliesTo?: string[];
    }
  ) {
    super(name, options);
    this.field = field;
    this.pattern = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    this.errorMessage = errorMessage || `Field '${field}' does not match required pattern`;
  }
  
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    const value = this.getFieldValue(entity, this.field);
    
    if (value !== undefined && value !== null && value !== '') {
      const stringValue = String(value);
      if (!this.pattern.test(stringValue)) {
        result.addError(
          'PATTERN_MISMATCH',
          this.errorMessage,
          [this.field],
          { 
            value: stringValue,
            pattern: this.pattern.source,
            entityType: context?.entityType
          }
        );
      }
    }
    
    return result;
  }
  
  private getFieldValue(entity: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}

/**
 * Rule for range validation (numeric or date)
 */
export class RangeRule extends BaseBusinessRule {
  private field: string;
  private min?: number | Date;
  private max?: number | Date;
  private inclusive: boolean;
  
  constructor(
    name: string,
    field: string,
    options: {
      min?: number | Date;
      max?: number | Date;
      inclusive?: boolean;
      description?: string;
      priority?: number;
      appliesTo?: string[];
    }
  ) {
    super(name, options);
    this.field = field;
    this.min = options.min;
    this.max = options.max;
    this.inclusive = options.inclusive ?? true;
  }
  
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    const value = this.getFieldValue(entity, this.field);
    
    if (value === undefined || value === null) {
      return result;
    }
    
    const numericValue = value instanceof Date ? value.getTime() : Number(value);
    const minValue = this.min instanceof Date ? this.min.getTime() : this.min;
    const maxValue = this.max instanceof Date ? this.max.getTime() : this.max;
    
    if (isNaN(numericValue)) {
      result.addError(
        'INVALID_RANGE_VALUE',
        `Field '${this.field}' must be a valid number or date`,
        [this.field],
        { value, entityType: context?.entityType }
      );
      return result;
    }
    
    if (minValue !== undefined) {
      const comparison = this.inclusive ? numericValue < minValue : numericValue <= minValue;
      if (comparison) {
        result.addError(
          'BELOW_MINIMUM',
          `Field '${this.field}' must be ${this.inclusive ? '>=' : '>'} ${this.min}`,
          [this.field],
          { value, min: this.min, entityType: context?.entityType }
        );
      }
    }
    
    if (maxValue !== undefined) {
      const comparison = this.inclusive ? numericValue > maxValue : numericValue >= maxValue;
      if (comparison) {
        result.addError(
          'ABOVE_MAXIMUM',
          `Field '${this.field}' must be ${this.inclusive ? '<=' : '<'} ${this.max}`,
          [this.field],
          { value, max: this.max, entityType: context?.entityType }
        );
      }
    }
    
    return result;
  }
  
  private getFieldValue(entity: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}

/**
 * Composite rule that combines multiple rules with AND logic
 */
export class CompositeRule extends BaseBusinessRule {
  private rules: BusinessRule[];
  private stopOnFirstError: boolean;
  
  constructor(
    name: string,
    rules: BusinessRule[],
    options?: {
      stopOnFirstError?: boolean;
      description?: string;
      priority?: number;
      appliesTo?: string[];
    }
  ) {
    super(name, options);
    this.rules = rules;
    this.stopOnFirstError = options?.stopOnFirstError ?? false;
  }
  
  async condition(entity: any, context?: RuleContext): Promise<boolean> {
    if (!this.enabled) return false;
    
    // Check if all sub-rules should apply
    for (const rule of this.rules) {
      if (rule.condition) {
        const shouldApply = await rule.condition(entity, context);
        if (!shouldApply) return false;
      }
    }
    
    return true;
  }
  
  async validate(entity: any, context?: RuleContext): Promise<ValidationResult> {
    const result = new ValidationResult();
    
    for (const rule of this.rules) {
      // Check if rule should be applied
      if (rule.condition) {
        const shouldApply = await rule.condition(entity, context);
        if (!shouldApply) continue;
      }
      
      const ruleResult = await rule.validate(entity, context);
      result.merge(ruleResult);
      
      if (this.stopOnFirstError && ruleResult.hasErrors()) {
        break;
      }
    }
    
    return result;
  }
}