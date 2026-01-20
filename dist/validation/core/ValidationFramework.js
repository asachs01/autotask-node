"use strict";
/**
 * Core Validation Framework
 * Production-ready validation system for Autotask SDK
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldBuilder = exports.ValidationSchema = exports.EntityValidator = exports.ValidationRules = exports.ValidationRule = exports.ValidationResult = exports.ValidationError = void 0;
require("reflect-metadata");
/**
 * Represents a single validation error
 */
class ValidationError {
    constructor(field, value, message, code, severity = 'error') {
        this.field = field;
        this.value = value;
        this.message = message;
        this.code = code;
        this.severity = severity;
    }
    toString() {
        return `${this.field}: ${this.message}`;
    }
}
exports.ValidationError = ValidationError;
/**
 * Represents the result of a validation operation
 */
class ValidationResult {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }
    /**
     * Create a successful validation result
     */
    static success() {
        return new ValidationResult();
    }
    /**
     * Create a failed validation result with errors
     */
    static failure(errors) {
        const result = new ValidationResult();
        errors.forEach(error => result.addError(error));
        return result;
    }
    /**
     * Create a validation result with warnings only
     */
    static warning(warnings) {
        const result = new ValidationResult();
        warnings.forEach(warning => result.addError(warning));
        return result;
    }
    /**
     * Add a validation error
     */
    addError(error) {
        if (error.severity === 'warning') {
            this.warnings.push(error);
        }
        else {
            this.errors.push(error);
        }
    }
    /**
     * Check if validation passed (no errors, warnings allowed)
     */
    get isValid() {
        return this.errors.length === 0;
    }
    /**
     * Check if validation has warnings
     */
    hasWarnings() {
        return this.warnings.length > 0;
    }
    /**
     * Get all errors
     */
    getErrors() {
        return [...this.errors];
    }
    /**
     * Get all warnings
     */
    getWarnings() {
        return [...this.warnings];
    }
    /**
     * Get errors for a specific field
     */
    getErrorsForField(field) {
        return this.errors.filter(error => error.field === field);
    }
    /**
     * Get warnings for a specific field
     */
    getWarningsForField(field) {
        return this.warnings.filter(warning => warning.field === field);
    }
    /**
     * Merge another validation result into this one
     */
    merge(other) {
        other.getErrors().forEach(error => this.addError(error));
        other.getWarnings().forEach(warning => this.addError(warning));
    }
    /**
     * Get a summary of all issues
     */
    getSummary() {
        const errorCount = this.errors.length;
        const warningCount = this.warnings.length;
        if (errorCount === 0 && warningCount === 0) {
            return 'Validation passed';
        }
        const parts = [];
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
    getDetailedMessages() {
        const messages = [];
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
exports.ValidationResult = ValidationResult;
/**
 * Base validation rule
 */
class ValidationRule {
    constructor(field, validator, message, code, severity = 'error') {
        this.field = field;
        this.validator = validator;
        this.message = message;
        this.code = code;
        this.severity = severity;
    }
    /**
     * Execute the validation rule
     */
    async validate(value, entity) {
        try {
            const isValid = await this.validator(value, entity);
            if (!isValid) {
                const errorMessage = typeof this.message === 'function'
                    ? this.message(value, this.field)
                    : this.message;
                return new ValidationError(this.field, value, errorMessage, this.code, this.severity);
            }
            return null;
        }
        catch (error) {
            // If validator throws, treat as validation failure
            return new ValidationError(this.field, value, `Validation error: ${error instanceof Error ? error.message : String(error)}`, 'VALIDATION_ERROR', 'error');
        }
    }
}
exports.ValidationRule = ValidationRule;
/**
 * Standard validation rule factories
 */
class ValidationRules {
    /**
     * Field is required (not null, undefined, or empty string)
     */
    static required(field = '', message) {
        return new ValidationRule(field, value => value !== null && value !== undefined && value !== '', message || `${field} is required`, 'REQUIRED');
    }
    /**
     * Field must be of specific type
     */
    static type(field, type, message) {
        return new ValidationRule(field, value => {
            if (value === null || value === undefined)
                return true;
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
        }, message || `${field} must be a valid ${type}`, `TYPE_${type.toUpperCase()}`);
    }
    /**
     * String length constraints
     */
    static stringLength(field, options, message) {
        return new ValidationRule(field, value => {
            if (value === null || value === undefined)
                return true;
            if (typeof value !== 'string')
                return false;
            const { min, max, exact } = options;
            if (exact !== undefined) {
                return value.length === exact;
            }
            let valid = true;
            if (min !== undefined)
                valid = valid && value.length >= min;
            if (max !== undefined)
                valid = valid && value.length <= max;
            return valid;
        }, message || (() => {
            const { min, max, exact } = options;
            if (exact !== undefined) {
                return `${field} must be exactly ${exact} characters`;
            }
            const parts = [];
            if (min !== undefined)
                parts.push(`at least ${min}`);
            if (max !== undefined)
                parts.push(`at most ${max}`);
            return `${field} must be ${parts.join(' and ')} characters`;
        })(), 'LENGTH');
    }
    /**
     * String format validation
     */
    static format(field, format, message) {
        const patterns = {
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            phone: /^\+?[1-9]\d{1,14}$/,
            url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
            uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            ipv4: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            ipv6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
        };
        const pattern = format instanceof RegExp ? format : patterns[format];
        const formatName = format instanceof RegExp ? 'pattern' : format;
        return new ValidationRule(field, value => {
            if (value === null || value === undefined || value === '')
                return true;
            if (typeof value !== 'string')
                return false;
            return pattern.test(value);
        }, message || `${field} must be a valid ${formatName}`, `FORMAT_${formatName.toUpperCase()}`);
    }
    /**
     * Numeric range validation
     */
    static range(field, options, message) {
        return new ValidationRule(field, value => {
            if (value === null || value === undefined)
                return true;
            if (typeof value !== 'number' || isNaN(value))
                return false;
            const { min, max } = options;
            let valid = true;
            if (min !== undefined)
                valid = valid && value >= min;
            if (max !== undefined)
                valid = valid && value <= max;
            return valid;
        }, message || (() => {
            const { min, max } = options;
            const parts = [];
            if (min !== undefined)
                parts.push(`at least ${min}`);
            if (max !== undefined)
                parts.push(`at most ${max}`);
            return `${field} must be ${parts.join(' and ')}`;
        })(), 'RANGE');
    }
    /**
     * Value must be one of allowed values
     */
    static enumeration(field, allowedValues, message) {
        return new ValidationRule(field, value => {
            if (value === null || value === undefined)
                return true;
            return allowedValues.includes(value);
        }, message || `${field} must be one of: ${allowedValues.map(v => String(v)).join(', ')}`, 'ENUM');
    }
    /**
     * Custom validation function
     */
    static custom(field, validator, message, code) {
        return new ValidationRule(field, validator, message, code || 'CUSTOM');
    }
    /**
     * Conditional validation - only validate if condition is met
     */
    static conditional(field, condition, rule) {
        return new ValidationRule(field, async (value, entity) => {
            if (!condition(entity))
                return true;
            const error = await rule.validate(value, entity);
            return error === null;
        }, rule.message, rule.code);
    }
    /**
     * Array element validation
     */
    static arrayElements(field, elementRule, message) {
        return new ValidationRule(field, async (value, entity) => {
            if (!Array.isArray(value))
                return true;
            for (const element of value) {
                const error = await elementRule.validate(element, entity);
                if (error !== null)
                    return false;
            }
            return true;
        }, message || `All elements in ${field} must be valid`, 'ARRAY_ELEMENTS');
    }
    /**
     * Convenience methods for common validations
     */
    static string(field = '', message) {
        return ValidationRules.type(field, 'string', message);
    }
    static number(field = '', message) {
        return ValidationRules.type(field, 'number', message);
    }
    static boolean(field = '', message) {
        return ValidationRules.type(field, 'boolean', message);
    }
    static minLength(min, field = '', message) {
        return ValidationRules.stringLength(field, { min }, message);
    }
    static maxLength(max, field = '', message) {
        return ValidationRules.stringLength(field, { max }, message);
    }
    static email(field = '', message) {
        return ValidationRules.format(field, 'email', message);
    }
    static url(field = '', message) {
        return ValidationRules.format(field, 'url', message);
    }
    static uuid(field = '', message) {
        return ValidationRules.format(field, 'uuid', message);
    }
    static enum(values, field = '', message) {
        return new ValidationRule(field, value => {
            if (value === null || value === undefined)
                return true;
            return values.includes(value);
        }, message || `${field} must be one of: ${values.join(', ')}`, 'ENUM');
    }
    static pattern(pattern, field = '', message) {
        return ValidationRules.format(field, pattern, message);
    }
    /**
     * Nested object validation
     */
    static nested(field, rules, message) {
        return new ValidationRule(field, async (value, _entity) => {
            if (value === null || value === undefined)
                return true;
            if (typeof value !== 'object')
                return false;
            const validator = new EntityValidator();
            const result = await validator.validate(value, rules);
            return result.isValid;
        }, message || `${field} contains invalid data`, 'NESTED');
    }
}
exports.ValidationRules = ValidationRules;
/**
 * Main entity validator
 */
class EntityValidator {
    /**
     * Validate an entity against a set of rules
     */
    async validate(entity, rules) {
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
    getNestedPropertyValue(obj, path) {
        if (!obj)
            return undefined;
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
                }
                else {
                    return undefined;
                }
            }
            else {
                current = current[key];
            }
        }
        return current;
    }
}
exports.EntityValidator = EntityValidator;
/**
 * Validation schema for defining rules programmatically
 */
class ValidationSchema {
    constructor() {
        this.rules = new Map();
        this.entityRules = [];
    }
    /**
     * Get all validation rules
     */
    get allRules() {
        const allRules = [];
        for (const fieldRules of this.rules.values()) {
            allRules.push(...fieldRules);
        }
        return allRules;
    }
    /**
     * Add field validation rules
     */
    field(field) {
        return new FieldBuilder(this, field);
    }
    /**
     * Add a rule directly
     */
    addRule(rule) {
        const field = rule.field;
        if (!this.rules.has(field)) {
            this.rules.set(field, []);
        }
        this.rules.get(field).push(rule);
        return this;
    }
    /**
     * Add entity-level validation
     */
    addEntityRule(validator) {
        this.entityRules.push(validator);
        return this;
    }
    /**
     * Validate an entity
     */
    async validate(entity) {
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
    getRules() {
        const allRules = [];
        for (const fieldRules of this.rules.values()) {
            allRules.push(...fieldRules);
        }
        return allRules;
    }
}
exports.ValidationSchema = ValidationSchema;
/**
 * Fluent builder for field validation rules
 */
class FieldBuilder {
    constructor(schema, field) {
        this.schema = schema;
        this.field = field;
    }
    required(message) {
        this.schema.addRule(ValidationRules.required(this.field, message));
        return this;
    }
    string(message) {
        this.schema.addRule(ValidationRules.type(this.field, 'string', message));
        return this;
    }
    number(message) {
        this.schema.addRule(ValidationRules.type(this.field, 'number', message));
        return this;
    }
    boolean(message) {
        this.schema.addRule(ValidationRules.type(this.field, 'boolean', message));
        return this;
    }
    date(message) {
        this.schema.addRule(ValidationRules.type(this.field, 'date', message));
        return this;
    }
    array(message) {
        this.schema.addRule(ValidationRules.type(this.field, 'array', message));
        return this;
    }
    object(message) {
        this.schema.addRule(ValidationRules.type(this.field, 'object', message));
        return this;
    }
    length(options, message) {
        this.schema.addRule(ValidationRules.stringLength(this.field, options, message));
        return this;
    }
    email(message) {
        this.schema.addRule(ValidationRules.format(this.field, 'email', message));
        return this;
    }
    phone(message) {
        this.schema.addRule(ValidationRules.format(this.field, 'phone', message));
        return this;
    }
    url(message) {
        this.schema.addRule(ValidationRules.format(this.field, 'url', message));
        return this;
    }
    uuid(message) {
        this.schema.addRule(ValidationRules.format(this.field, 'uuid', message));
        return this;
    }
    pattern(pattern, message) {
        this.schema.addRule(ValidationRules.format(this.field, pattern, message));
        return this;
    }
    range(options, message) {
        this.schema.addRule(ValidationRules.range(this.field, options, message));
        return this;
    }
    enum(allowedValues, message) {
        this.schema.addRule(ValidationRules.enumeration(this.field, allowedValues, message));
        return this;
    }
    custom(validator, message, code) {
        this.schema.addRule(ValidationRules.custom(this.field, validator, message, code));
        return this;
    }
    conditional(condition, configureRule) {
        const tempSchema = new ValidationSchema();
        const tempBuilder = new FieldBuilder(tempSchema, this.field);
        configureRule(tempBuilder);
        const rules = tempSchema.allRules;
        for (const rule of rules) {
            this.schema.addRule(ValidationRules.conditional(this.field, condition, rule));
        }
        return this;
    }
}
exports.FieldBuilder = FieldBuilder;
// Export decorator-based validation support
__exportStar(require("./ValidationDecorators"), exports);
//# sourceMappingURL=ValidationFramework.js.map