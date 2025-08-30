/**
 * Core Validation Framework
 * Production-ready validation system for Autotask SDK
 */

import 'reflect-metadata';

/**
 * Represents a single validation error
 */
export class ValidationError {
  constructor(
    public readonly field: string,
    public readonly value: any,
    public readonly message: string,
    public readonly code?: string,
    public readonly severity: 'error' | 'warning' = 'error'
  ) {}

  toString(): string {
    return `${this.field}: ${this.message}`;
  }
}

/**
 * Represents the result of a validation operation
 */
export class ValidationResult {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];

  /**
   * Add a validation error
   */
  addError(error: ValidationError): void {
    if (error.severity === 'warning') {
      this.warnings.push(error);
    } else {
      this.errors.push(error);
    }
  }

  /**
   * Check if validation passed (no errors, warnings allowed)
   */
  isValid(): boolean {
    return this.errors.length === 0;
  }

  /**
   * Check if validation has warnings
   */
  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  /**
   * Get all errors
   */
  getErrors(): ValidationError[] {
    return [...this.errors];
  }

  /**
   * Get all warnings
   */
  getWarnings(): ValidationError[] {
    return [...this.warnings];
  }

  /**
   * Get errors for a specific field
   */
  getErrorsForField(field: string): ValidationError[] {
    return this.errors.filter(error => error.field === field);
  }

  /**
   * Get warnings for a specific field
   */
  getWarningsForField(field: string): ValidationError[] {
    return this.warnings.filter(warning => warning.field === field);
  }

  /**
   * Merge another validation result into this one
   */
  merge(other: ValidationResult): void {
    other.getErrors().forEach(error => this.addError(error));
    other.getWarnings().forEach(warning => this.addError(warning));
  }

  /**
   * Get a summary of all issues
   */
  getSummary(): string {
    const errorCount = this.errors.length;
    const warningCount = this.warnings.length;
    
    if (errorCount === 0 && warningCount === 0) {
      return 'Validation passed';
    }
    
    const parts: string[] = [];
    if (errorCount > 0) {
      parts.push(`${errorCount} error${errorCount !== 1 ? 's' : ''}`);
    }
    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`);
    }
    
    return `Validation failed with ${parts.join(' and ')}`;
  }

  /**
   * Get detailed error messages
   */
  getDetailedMessages(): string[] {
    const messages: string[] = [];
    
    if (this.errors.length > 0) {
      messages.push('Errors:');
      this.errors.forEach(error => {
        messages.push(`  - ${error.toString()}`);
      });
    }
    
    if (this.warnings.length > 0) {
      messages.push('Warnings:');
      this.warnings.forEach(warning => {
        messages.push(`  - ${warning.toString()}`);
      });
    }
    
    return messages;
  }
}

/**
 * Base validation rule
 */
export class ValidationRule {
  constructor(
    public readonly field: string,
    public readonly validator: (value: any, entity?: any) => boolean | Promise<boolean>,
    public readonly message: string | ((value: any, field: string) => string),
    public readonly code?: string,
    public readonly severity: 'error' | 'warning' = 'error'
  ) {}

  /**
   * Execute the validation rule
   */
  async validate(value: any, entity?: any): Promise<ValidationError | null> {
    try {
      const isValid = await this.validator(value, entity);
      
      if (!isValid) {
        const errorMessage = typeof this.message === 'function' 
          ? this.message(value, this.field)
          : this.message;
          
        return new ValidationError(
          this.field,
          value,
          errorMessage,
          this.code,
          this.severity
        );
      }
      
      return null;
    } catch (error) {
      // If validator throws, treat as validation failure
      return new ValidationError(
        this.field,
        value,
        `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        'VALIDATION_ERROR',
        'error'
      );
    }
  }
}

/**
 * Standard validation rule factories
 */
export class ValidationRules {
  /**
   * Field is required (not null, undefined, or empty string)
   */
  static required(field: string, message?: string): ValidationRule {
    return new ValidationRule(
      field,
      value => value !== null && value !== undefined && value !== '',
      message || `${field} is required`,
      'REQUIRED'
    );
  }

  /**
   * Field must be of specific type
   */
  static type(field: string, type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object', message?: string): ValidationRule {
    return new ValidationRule(
      field,
      value => {
        if (value === null || value === undefined) return true;
        
        switch (type) {
          case 'string': 
            return typeof value === 'string';
          case 'number': 
            return typeof value === 'number' && !isNaN(value) && isFinite(value);
          case 'boolean': 
            return typeof value === 'boolean';
          case 'date': 
            return value instanceof Date && !isNaN(value.getTime());
          case 'array':
            return Array.isArray(value);
          case 'object':
            return typeof value === 'object' && !Array.isArray(value);
          default: 
            return false;
        }
      },
      message || `${field} must be a valid ${type}`,
      `TYPE_${type.toUpperCase()}`
    );
  }

  /**
   * String length constraints
   */
  static length(field: string, options: { min?: number, max?: number, exact?: number }, message?: string): ValidationRule {
    return new ValidationRule(
      field,
      value => {
        if (value === null || value === undefined) return true;
        if (typeof value !== 'string') return false;
        
        const { min, max, exact } = options;
        
        if (exact !== undefined) {
          return value.length === exact;
        }
        
        let valid = true;
        if (min !== undefined) valid = valid && value.length >= min;
        if (max !== undefined) valid = valid && value.length <= max;
        
        return valid;
      },
      message || (() => {
        const { min, max, exact } = options;
        if (exact !== undefined) {
          return `${field} must be exactly ${exact} characters`;
        }
        const parts: string[] = [];
        if (min !== undefined) parts.push(`at least ${min}`);
        if (max !== undefined) parts.push(`at most ${max}`);
        return `${field} must be ${parts.join(' and ')} characters`;
      })(),
      'LENGTH'
    );
  }

  /**
   * String format validation
   */
  static format(field: string, format: 'email' | 'phone' | 'url' | 'uuid' | 'ipv4' | 'ipv6' | RegExp, message?: string): ValidationRule {
    const patterns: Record<string, RegExp> = {
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      phone: /^\+?[1-9]\d{1,14}$/,
      url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
      uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ipv4: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      ipv6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
    };
    
    const pattern = format instanceof RegExp ? format : patterns[format];
    const formatName = format instanceof RegExp ? 'pattern' : format;
    
    return new ValidationRule(
      field,
      value => {
        if (value === null || value === undefined || value === '') return true;
        if (typeof value !== 'string') return false;
        return pattern.test(value);
      },
      message || `${field} must be a valid ${formatName}`,
      `FORMAT_${formatName.toUpperCase()}`
    );
  }

  /**
   * Numeric range validation
   */
  static range(field: string, options: { min?: number, max?: number }, message?: string): ValidationRule {
    return new ValidationRule(
      field,
      value => {
        if (value === null || value === undefined) return true;
        if (typeof value !== 'number' || isNaN(value)) return false;
        
        const { min, max } = options;
        let valid = true;
        
        if (min !== undefined) valid = valid && value >= min;
        if (max !== undefined) valid = valid && value <= max;
        
        return valid;
      },
      message || (() => {
        const { min, max } = options;
        const parts: string[] = [];
        if (min !== undefined) parts.push(`at least ${min}`);
        if (max !== undefined) parts.push(`at most ${max}`);
        return `${field} must be ${parts.join(' and ')}`;
      })(),
      'RANGE'
    );
  }

  /**
   * Value must be one of allowed values
   */
  static enumeration<T>(field: string, allowedValues: T[], message?: string): ValidationRule {
    return new ValidationRule(
      field,
      value => {
        if (value === null || value === undefined) return true;
        return allowedValues.includes(value);
      },
      message || `${field} must be one of: ${allowedValues.map(v => String(v)).join(', ')}`,
      'ENUM'
    );
  }

  /**
   * Custom validation function
   */
  static custom(field: string, validator: (value: any, entity?: any) => boolean | Promise<boolean>, message: string, code?: string): ValidationRule {
    return new ValidationRule(field, validator, message, code || 'CUSTOM');
  }

  /**
   * Conditional validation - only validate if condition is met
   */
  static conditional(field: string, condition: (entity: any) => boolean, rule: ValidationRule): ValidationRule {
    return new ValidationRule(
      field,
      async (value, entity) => {
        if (!condition(entity)) return true;
        const error = await rule.validate(value, entity);
        return error === null;
      },
      rule.message,
      rule.code
    );
  }

  /**
   * Array element validation
   */
  static arrayElements(field: string, elementRule: ValidationRule, message?: string): ValidationRule {
    return new ValidationRule(
      field,
      async (value, entity) => {
        if (!Array.isArray(value)) return true;
        
        for (const element of value) {
          const error = await elementRule.validate(element, entity);
          if (error !== null) return false;
        }
        
        return true;
      },
      message || `All elements in ${field} must be valid`,
      'ARRAY_ELEMENTS'
    );
  }

  /**
   * Nested object validation
   */
  static nested(field: string, rules: ValidationRule[], message?: string): ValidationRule {
    return new ValidationRule(
      field,
      async (value, _entity) => {
        if (value === null || value === undefined) return true;
        if (typeof value !== 'object') return false;
        
        const validator = new EntityValidator();
        const result = await validator.validate(value, rules);
        return result.isValid();
      },
      message || `${field} contains invalid data`,
      'NESTED'
    );
  }
}

/**
 * Main entity validator
 */
export class EntityValidator {
  /**
   * Validate an entity against a set of rules
   */
  async validate(entity: any, rules: ValidationRule[]): Promise<ValidationResult> {
    const result = new ValidationResult();
    
    for (const rule of rules) {
      const value = this.getNestedPropertyValue(entity, rule.field);
      const error = await rule.validate(value, entity);
      
      if (error) {
        result.addError(error);
      }
    }
    
    return result;
  }

  /**
   * Get value from nested property path
   */
  private getNestedPropertyValue(obj: any, path: string): any {
    if (!obj) return undefined;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      // Handle array index notation like items[0]
      const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, propName, index] = arrayMatch;
        current = current[propName];
        if (Array.isArray(current)) {
          current = current[parseInt(index, 10)];
        } else {
          return undefined;
        }
      } else {
        current = current[key];
      }
    }
    
    return current;
  }
}

/**
 * Validation schema for defining rules programmatically
 */
export class ValidationSchema<T = any> {
  private rules: Map<string, ValidationRule[]> = new Map();
  private entityRules: ((entity: T) => ValidationError[] | Promise<ValidationError[]>)[] = [];

  /**
   * Add field validation rules
   */
  field(field: keyof T & string): FieldBuilder<T> {
    return new FieldBuilder<T>(this, field);
  }

  /**
   * Add a rule directly
   */
  addRule(field: string, rule: ValidationRule): this {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    this.rules.get(field)!.push(rule);
    return this;
  }

  /**
   * Add entity-level validation
   */
  addEntityRule(validator: (entity: T) => ValidationError[] | Promise<ValidationError[]>): this {
    this.entityRules.push(validator);
    return this;
  }

  /**
   * Validate an entity
   */
  async validate(entity: T): Promise<ValidationResult> {
    const validator = new EntityValidator();
    const result = new ValidationResult();
    
    // Validate field-level rules
    for (const [_field, fieldRules] of this.rules) {
      const fieldResult = await validator.validate(entity, fieldRules);
      result.merge(fieldResult);
    }
    
    // Validate entity-level rules
    for (const entityRule of this.entityRules) {
      const errors = await entityRule(entity);
      for (const error of errors) {
        result.addError(error);
      }
    }
    
    return result;
  }

  /**
   * Get all rules
   */
  getRules(): ValidationRule[] {
    const allRules: ValidationRule[] = [];
    for (const fieldRules of this.rules.values()) {
      allRules.push(...fieldRules);
    }
    return allRules;
  }
}

/**
 * Fluent builder for field validation rules
 */
export class FieldBuilder<T> {
  constructor(
    private schema: ValidationSchema<T>,
    private field: string
  ) {}

  required(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.required(this.field, message));
    return this;
  }

  string(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.type(this.field, 'string', message));
    return this;
  }

  number(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.type(this.field, 'number', message));
    return this;
  }

  boolean(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.type(this.field, 'boolean', message));
    return this;
  }

  date(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.type(this.field, 'date', message));
    return this;
  }

  array(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.type(this.field, 'array', message));
    return this;
  }

  object(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.type(this.field, 'object', message));
    return this;
  }

  length(options: { min?: number, max?: number, exact?: number }, message?: string): this {
    this.schema.addRule(this.field, ValidationRules.length(this.field, options, message));
    return this;
  }

  email(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.format(this.field, 'email', message));
    return this;
  }

  phone(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.format(this.field, 'phone', message));
    return this;
  }

  url(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.format(this.field, 'url', message));
    return this;
  }

  uuid(message?: string): this {
    this.schema.addRule(this.field, ValidationRules.format(this.field, 'uuid', message));
    return this;
  }

  pattern(pattern: RegExp, message: string): this {
    this.schema.addRule(this.field, ValidationRules.format(this.field, pattern, message));
    return this;
  }

  range(options: { min?: number, max?: number }, message?: string): this {
    this.schema.addRule(this.field, ValidationRules.range(this.field, options, message));
    return this;
  }

  enum<V>(allowedValues: V[], message?: string): this {
    this.schema.addRule(this.field, ValidationRules.enumeration(this.field, allowedValues, message));
    return this;
  }

  custom(validator: (value: any, entity?: T) => boolean | Promise<boolean>, message: string, code?: string): this {
    this.schema.addRule(this.field, ValidationRules.custom(this.field, validator, message, code));
    return this;
  }

  conditional(condition: (entity: T) => boolean, configureRule: (builder: FieldBuilder<T>) => void): this {
    const tempSchema = new ValidationSchema<T>();
    const tempBuilder = new FieldBuilder<T>(tempSchema, this.field);
    configureRule(tempBuilder);
    
    const rules = tempSchema.getRules();
    for (const rule of rules) {
      this.schema.addRule(this.field, ValidationRules.conditional(this.field, condition, rule));
    }
    
    return this;
  }
}

// Export decorator-based validation support
export * from './ValidationDecorators';