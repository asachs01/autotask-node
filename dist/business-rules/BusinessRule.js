"use strict";
/**
 * Core Business Rule Interface and Types
 *
 * Defines the contract for business rules and provides
 * context for rule execution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeRule = exports.RangeRule = exports.PatternRule = exports.FieldValueRule = exports.RequiredFieldRule = exports.BaseBusinessRule = exports.RulePriority = void 0;
const ValidationResult_1 = require("./ValidationResult");
/**
 * Priority levels for rule execution order
 */
var RulePriority;
(function (RulePriority) {
    RulePriority[RulePriority["CRITICAL"] = 0] = "CRITICAL";
    RulePriority[RulePriority["HIGH"] = 100] = "HIGH";
    RulePriority[RulePriority["NORMAL"] = 500] = "NORMAL";
    RulePriority[RulePriority["LOW"] = 900] = "LOW";
    RulePriority[RulePriority["DEFERRED"] = 1000] = "DEFERRED"; // Run last
})(RulePriority || (exports.RulePriority = RulePriority = {}));
/**
 * Abstract base class for business rules
 */
class BaseBusinessRule {
    constructor(name, options) {
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
    condition(entity, context) {
        return this.enabled;
    }
}
exports.BaseBusinessRule = BaseBusinessRule;
/**
 * Rule for required fields
 */
class RequiredFieldRule extends BaseBusinessRule {
    constructor(name, fields, options) {
        super(name, options);
        this.fields = fields;
        this.conditionalFields = options?.conditionalFields;
    }
    validate(entity, context) {
        const result = new ValidationResult_1.ValidationResult();
        for (const field of this.fields) {
            // Check if this field is conditionally required
            if (this.conditionalFields?.has(field)) {
                const condition = this.conditionalFields.get(field);
                if (!condition(entity)) {
                    continue; // Skip this field if condition is not met
                }
            }
            const value = this.getFieldValue(entity, field);
            if (value === null || value === undefined || value === '') {
                result.addError('REQUIRED_FIELD', `Field '${field}' is required`, [field], { entityType: context?.entityType });
            }
        }
        return result;
    }
    getFieldValue(entity, fieldPath) {
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
exports.RequiredFieldRule = RequiredFieldRule;
/**
 * Rule for field value validation
 */
class FieldValueRule extends BaseBusinessRule {
    constructor(name, field, validator, errorMessage, options) {
        super(name, options);
        this.field = field;
        this.validator = validator;
        this.errorMessage = errorMessage;
    }
    validate(entity, context) {
        const result = new ValidationResult_1.ValidationResult();
        const value = this.getFieldValue(entity, this.field);
        if (value !== undefined && value !== null && !this.validator(value, entity)) {
            result.addError('INVALID_FIELD_VALUE', this.errorMessage, [this.field], { value, entityType: context?.entityType });
        }
        return result;
    }
    getFieldValue(entity, fieldPath) {
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
exports.FieldValueRule = FieldValueRule;
/**
 * Rule for regex pattern validation
 */
class PatternRule extends BaseBusinessRule {
    constructor(name, field, pattern, errorMessage, options) {
        super(name, options);
        this.field = field;
        this.pattern = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        this.errorMessage = errorMessage || `Field '${field}' does not match required pattern`;
    }
    validate(entity, context) {
        const result = new ValidationResult_1.ValidationResult();
        const value = this.getFieldValue(entity, this.field);
        if (value !== undefined && value !== null && value !== '') {
            const stringValue = String(value);
            if (!this.pattern.test(stringValue)) {
                result.addError('PATTERN_MISMATCH', this.errorMessage, [this.field], {
                    value: stringValue,
                    pattern: this.pattern.source,
                    entityType: context?.entityType
                });
            }
        }
        return result;
    }
    getFieldValue(entity, fieldPath) {
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
exports.PatternRule = PatternRule;
/**
 * Rule for range validation (numeric or date)
 */
class RangeRule extends BaseBusinessRule {
    constructor(name, field, options) {
        super(name, options);
        this.field = field;
        this.min = options.min;
        this.max = options.max;
        this.inclusive = options.inclusive ?? true;
    }
    validate(entity, context) {
        const result = new ValidationResult_1.ValidationResult();
        const value = this.getFieldValue(entity, this.field);
        if (value === undefined || value === null) {
            return result;
        }
        const numericValue = value instanceof Date ? value.getTime() : Number(value);
        const minValue = this.min instanceof Date ? this.min.getTime() : this.min;
        const maxValue = this.max instanceof Date ? this.max.getTime() : this.max;
        if (isNaN(numericValue)) {
            result.addError('INVALID_RANGE_VALUE', `Field '${this.field}' must be a valid number or date`, [this.field], { value, entityType: context?.entityType });
            return result;
        }
        if (minValue !== undefined) {
            const comparison = this.inclusive ? numericValue < minValue : numericValue <= minValue;
            if (comparison) {
                result.addError('BELOW_MINIMUM', `Field '${this.field}' must be ${this.inclusive ? '>=' : '>'} ${this.min}`, [this.field], { value, min: this.min, entityType: context?.entityType });
            }
        }
        if (maxValue !== undefined) {
            const comparison = this.inclusive ? numericValue > maxValue : numericValue >= maxValue;
            if (comparison) {
                result.addError('ABOVE_MAXIMUM', `Field '${this.field}' must be ${this.inclusive ? '<=' : '<'} ${this.max}`, [this.field], { value, max: this.max, entityType: context?.entityType });
            }
        }
        return result;
    }
    getFieldValue(entity, fieldPath) {
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
exports.RangeRule = RangeRule;
/**
 * Composite rule that combines multiple rules with AND logic
 */
class CompositeRule extends BaseBusinessRule {
    constructor(name, rules, options) {
        super(name, options);
        this.rules = rules;
        this.stopOnFirstError = options?.stopOnFirstError ?? false;
    }
    async condition(entity, context) {
        if (!this.enabled)
            return false;
        // Check if all sub-rules should apply
        for (const rule of this.rules) {
            if (rule.condition) {
                const shouldApply = await rule.condition(entity, context);
                if (!shouldApply)
                    return false;
            }
        }
        return true;
    }
    async validate(entity, context) {
        const result = new ValidationResult_1.ValidationResult();
        for (const rule of this.rules) {
            // Check if rule should be applied
            if (rule.condition) {
                const shouldApply = await rule.condition(entity, context);
                if (!shouldApply)
                    continue;
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
exports.CompositeRule = CompositeRule;
//# sourceMappingURL=BusinessRule.js.map