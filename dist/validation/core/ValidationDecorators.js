"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformers = exports.IsArray = exports.IsUUID = exports.IsUrl = exports.IsEmail = exports.IsDate = exports.IsBoolean = exports.IsNumber = exports.IsString = exports.Required = void 0;
exports.IsEnum = IsEnum;
exports.Pattern = Pattern;
exports.Validate = Validate;
exports.ValidateNested = ValidateNested;
exports.ValidateIf = ValidateIf;
exports.getValidationSchema = getValidationSchema;
exports.validateEntity = validateEntity;
exports.Validatable = Validatable;
exports.Transform = Transform;
require("reflect-metadata");
const ValidationFramework_1 = require("./ValidationFramework");
// Decorator metadata keys
const VALIDATION_METADATA_KEY = Symbol('validation:rules');
const SCHEMA_METADATA_KEY = Symbol('validation:schema');
/**
 * Base decorator factory for validation rules
 */
function createValidationDecorator(ruleFactory) {
    return (options) => {
        return (target, propertyKey) => {
            const rule = ruleFactory(options);
            // Store metadata on the class prototype
            const existingRules = Reflect.getMetadata(VALIDATION_METADATA_KEY, target) || [];
            existingRules.push({
                target,
                propertyKey,
                rule: new ValidationFramework_1.ValidationRule(propertyKey, rule.validator, rule.message, rule.code, rule.severity)
            });
            Reflect.defineMetadata(VALIDATION_METADATA_KEY, existingRules, target);
        };
    };
}
/**
 * Required field decorator
 */
exports.Required = createValidationDecorator((options) => {
    return ValidationFramework_1.ValidationRules.required(options?.message);
});
/**
 * String field decorator with optional length constraints
 */
exports.IsString = createValidationDecorator((options) => {
    const rules = [ValidationFramework_1.ValidationRules.string()];
    if (options?.minLength !== undefined) {
        rules.push(ValidationFramework_1.ValidationRules.minLength(options.minLength));
    }
    if (options?.maxLength !== undefined) {
        rules.push(ValidationFramework_1.ValidationRules.maxLength(options.maxLength));
    }
    // Combine rules into a single validator
    return new ValidationFramework_1.ValidationRule('', async (value) => {
        for (const rule of rules) {
            if (!await rule.validator(value)) {
                return false;
            }
        }
        return true;
    }, options?.message || 'Invalid string value', 'string_validation');
});
/**
 * Number field decorator with optional range constraints
 */
exports.IsNumber = createValidationDecorator((options) => {
    const rules = [ValidationFramework_1.ValidationRules.number()];
    if (options?.min !== undefined || options?.max !== undefined) {
        rules.push(ValidationFramework_1.ValidationRules.range('', { min: options?.min, max: options?.max }));
    }
    if (options?.integer) {
        rules.push(new ValidationFramework_1.ValidationRule('', (value) => Number.isInteger(value), 'Must be an integer', 'integer_validation'));
    }
    return new ValidationFramework_1.ValidationRule('', async (value) => {
        for (const rule of rules) {
            if (!await rule.validator(value)) {
                return false;
            }
        }
        return true;
    }, options?.message || 'Invalid number value', 'number_validation');
});
/**
 * Boolean field decorator
 */
exports.IsBoolean = createValidationDecorator(() => {
    return ValidationFramework_1.ValidationRules.boolean();
});
/**
 * Date field decorator
 */
exports.IsDate = createValidationDecorator((options) => {
    return new ValidationFramework_1.ValidationRule('', (value) => {
        if (!(value instanceof Date) && typeof value !== 'string') {
            return false;
        }
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
            return false;
        }
        if (options?.min && date < options.min) {
            return false;
        }
        if (options?.max && date > options.max) {
            return false;
        }
        return true;
    }, options?.message || 'Invalid date value', 'date_validation');
});
/**
 * Email field decorator
 */
exports.IsEmail = createValidationDecorator((options) => {
    return ValidationFramework_1.ValidationRules.email(options?.message);
});
/**
 * URL field decorator
 */
exports.IsUrl = createValidationDecorator((options) => {
    return ValidationFramework_1.ValidationRules.url(options?.message);
});
/**
 * UUID field decorator
 */
exports.IsUUID = createValidationDecorator((options) => {
    return ValidationFramework_1.ValidationRules.uuid(options?.message);
});
/**
 * Enum field decorator
 */
function IsEnum(enumType, options) {
    const values = Object.values(enumType);
    return createValidationDecorator(() => {
        return ValidationFramework_1.ValidationRules.enum(values, options?.message);
    })();
}
/**
 * Pattern field decorator
 */
function Pattern(pattern, options) {
    return createValidationDecorator(() => {
        return ValidationFramework_1.ValidationRules.pattern(pattern, options?.message);
    })();
}
/**
 * Custom validation decorator
 */
function Validate(validator, options) {
    return createValidationDecorator(() => {
        return new ValidationFramework_1.ValidationRule('', validator, options?.message || 'Validation failed', options?.code || 'custom_validation');
    })();
}
/**
 * Array field decorator
 */
exports.IsArray = createValidationDecorator((options) => {
    return new ValidationFramework_1.ValidationRule('', async (value) => {
        if (!Array.isArray(value)) {
            return false;
        }
        if (options?.minLength !== undefined && value.length < options.minLength) {
            return false;
        }
        if (options?.maxLength !== undefined && value.length > options.maxLength) {
            return false;
        }
        if (options?.itemValidator) {
            for (const item of value) {
                if (!await options.itemValidator(item)) {
                    return false;
                }
            }
        }
        return true;
    }, options?.message || 'Invalid array value', 'array_validation');
});
/**
 * Nested object validation decorator
 */
function ValidateNested(validationClass) {
    return createValidationDecorator(() => {
        return new ValidationFramework_1.ValidationRule('', async (value) => {
            if (!value || typeof value !== 'object') {
                return false;
            }
            if (validationClass) {
                const schema = getValidationSchema(validationClass);
                if (schema) {
                    const validator = new ValidationFramework_1.EntityValidator();
                    const result = await validator.validate(value, schema.allRules);
                    return result.isValid;
                }
            }
            return true;
        }, 'Invalid nested object', 'nested_validation');
    })();
}
/**
 * Conditional validation decorator
 */
function ValidateIf(condition, validator, options) {
    return createValidationDecorator(() => {
        return new ValidationFramework_1.ValidationRule('', async (value, entity) => {
            if (!entity || !condition(entity)) {
                return true; // Skip validation if condition is not met
            }
            return validator(value);
        }, options?.message || 'Conditional validation failed', options?.code || 'conditional_validation');
    })();
}
/**
 * Get validation schema from decorated class
 */
function getValidationSchema(target) {
    // Check if schema is already cached
    const cachedSchema = Reflect.getMetadata(SCHEMA_METADATA_KEY, target.prototype || target);
    if (cachedSchema) {
        return cachedSchema;
    }
    const metadata = Reflect.getMetadata(VALIDATION_METADATA_KEY, target.prototype || target) || [];
    if (metadata.length === 0) {
        return null;
    }
    const schema = new ValidationFramework_1.ValidationSchema();
    // Group rules by field
    const rulesByField = new Map();
    for (const meta of metadata) {
        const field = meta.propertyKey;
        if (!rulesByField.has(field)) {
            rulesByField.set(field, []);
        }
        rulesByField.get(field).push(meta.rule);
    }
    // Add rules to schema
    for (const [field, rules] of rulesByField) {
        for (const rule of rules) {
            schema.addRule(new ValidationFramework_1.ValidationRule(field, rule.validator, rule.message, rule.code, rule.severity));
        }
    }
    // Cache the schema
    Reflect.defineMetadata(SCHEMA_METADATA_KEY, schema, target.prototype || target);
    return schema;
}
/**
 * Validate a decorated class instance
 */
async function validateEntity(entity) {
    const schema = getValidationSchema(entity.constructor);
    if (!schema) {
        return { isValid: true, errors: [] };
    }
    const result = await schema.validate(entity);
    return {
        isValid: result.isValid,
        errors: result.getErrors().map(e => ({
            field: e.field,
            message: e.message,
            code: e.code
        }))
    };
}
/**
 * Class decorator to enable validation
 */
function Validatable(constructor) {
    // Add validation method to the prototype
    constructor.prototype.validate = async function () {
        return validateEntity(this);
    };
    // Add static validation method
    constructor.validate = async function (entity) {
        return validateEntity(entity);
    };
    return constructor;
}
/**
 * Property transformer decorator for sanitization
 */
function Transform(transformer) {
    return (target, propertyKey) => {
        const key = Symbol(propertyKey);
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[key];
            },
            set(value) {
                this[key] = transformer(value);
            },
            enumerable: true,
            configurable: true
        });
    };
}
/**
 * Common transformers
 */
exports.Transformers = {
    trim: (value) => typeof value === 'string' ? value.trim() : value,
    lowercase: (value) => typeof value === 'string' ? value.toLowerCase() : value,
    uppercase: (value) => typeof value === 'string' ? value.toUpperCase() : value,
    toNumber: (value) => Number(value),
    toBoolean: (value) => Boolean(value),
    toDate: (value) => value instanceof Date ? value : new Date(value),
    toArray: (value) => Array.isArray(value) ? value : [value],
    sanitizeHtml: (value) => {
        if (typeof value !== 'string')
            return value;
        // Basic HTML sanitization - in production use a proper library
        return value
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
};
//# sourceMappingURL=ValidationDecorators.js.map