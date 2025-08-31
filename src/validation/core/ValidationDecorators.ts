import 'reflect-metadata';
import { ValidationRule, ValidationRules, ValidationSchema, EntityValidator } from './ValidationFramework';

// Decorator metadata keys
const VALIDATION_METADATA_KEY = Symbol('validation:rules');
const SCHEMA_METADATA_KEY = Symbol('validation:schema');

/**
 * Storage for validation metadata
 */
interface ValidationMetadata {
  target: any;
  propertyKey: string;
  rule: ValidationRule;
}

/**
 * Base decorator factory for validation rules
 */
function createValidationDecorator(
  ruleFactory: (options?: any) => ValidationRule
) {
  return (options?: any) => {
    return (target: any, propertyKey: string) => {
      const rule = ruleFactory(options);
      
      // Store metadata on the class prototype
      const existingRules: ValidationMetadata[] = 
        Reflect.getMetadata(VALIDATION_METADATA_KEY, target) || [];
      
      existingRules.push({
        target,
        propertyKey,
        rule: new ValidationRule(
          propertyKey,
          rule.validator,
          rule.message,
          rule.code,
          rule.severity
        )
      });
      
      Reflect.defineMetadata(
        VALIDATION_METADATA_KEY,
        existingRules,
        target
      );
    };
  };
}

/**
 * Required field decorator
 */
export const Required = createValidationDecorator((options?: { message?: string }) => {
  return ValidationRules.required(options?.message);
});

/**
 * String field decorator with optional length constraints
 */
export const IsString = createValidationDecorator((options?: { 
  minLength?: number;
  maxLength?: number;
  message?: string;
}) => {
  const rules: ValidationRule[] = [ValidationRules.string()];
  
  if (options?.minLength !== undefined) {
    rules.push(ValidationRules.minLength(options.minLength));
  }
  
  if (options?.maxLength !== undefined) {
    rules.push(ValidationRules.maxLength(options.maxLength));
  }
  
  // Combine rules into a single validator
  return new ValidationRule(
    '',
    async (value: any) => {
      for (const rule of rules) {
        if (!await rule.validator(value)) {
          return false;
        }
      }
      return true;
    },
    options?.message || 'Invalid string value',
    'string_validation'
  );
});

/**
 * Number field decorator with optional range constraints
 */
export const IsNumber = createValidationDecorator((options?: {
  min?: number;
  max?: number;
  integer?: boolean;
  message?: string;
}) => {
  const rules: ValidationRule[] = [ValidationRules.number()];
  
  if (options?.min !== undefined || options?.max !== undefined) {
    rules.push(ValidationRules.range('', { min: options?.min, max: options?.max }));
  }
  
  if (options?.integer) {
    rules.push(new ValidationRule(
      '',
      (value: any) => Number.isInteger(value),
      'Must be an integer',
      'integer_validation'
    ));
  }
  
  return new ValidationRule(
    '',
    async (value: any) => {
      for (const rule of rules) {
        if (!await rule.validator(value)) {
          return false;
        }
      }
      return true;
    },
    options?.message || 'Invalid number value',
    'number_validation'
  );
});

/**
 * Boolean field decorator
 */
export const IsBoolean = createValidationDecorator(() => {
  return ValidationRules.boolean();
});

/**
 * Date field decorator
 */
export const IsDate = createValidationDecorator((options?: {
  min?: Date;
  max?: Date;
  message?: string;
}) => {
  return new ValidationRule(
    '',
    (value: any) => {
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
    },
    options?.message || 'Invalid date value',
    'date_validation'
  );
});

/**
 * Email field decorator
 */
export const IsEmail = createValidationDecorator((options?: { message?: string }) => {
  return ValidationRules.email(options?.message);
});

/**
 * URL field decorator
 */
export const IsUrl = createValidationDecorator((options?: { message?: string }) => {
  return ValidationRules.url(options?.message);
});

/**
 * UUID field decorator
 */
export const IsUUID = createValidationDecorator((options?: { 
  version?: 4 | 5;
  message?: string;
}) => {
  return ValidationRules.uuid(options?.message);
});

/**
 * Enum field decorator
 */
export function IsEnum(enumType: any, options?: { message?: string }) {
  const values = Object.values(enumType);
  return createValidationDecorator(() => {
    return ValidationRules.enum(values, options?.message);
  })();
}

/**
 * Pattern field decorator
 */
export function Pattern(pattern: RegExp, options?: { message?: string }) {
  return createValidationDecorator(() => {
    return ValidationRules.pattern(pattern, options?.message);
  })();
}

/**
 * Custom validation decorator
 */
export function Validate(
  validator: (value: any, entity?: any) => boolean | Promise<boolean>,
  options?: {
    message?: string;
    code?: string;
  }
) {
  return createValidationDecorator(() => {
    return new ValidationRule(
      '',
      validator,
      options?.message || 'Validation failed',
      options?.code || 'custom_validation'
    );
  })();
}

/**
 * Array field decorator
 */
export const IsArray = createValidationDecorator((options?: {
  minLength?: number;
  maxLength?: number;
  itemValidator?: (item: any) => boolean | Promise<boolean>;
  message?: string;
}) => {
  return new ValidationRule(
    '',
    async (value: any) => {
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
    },
    options?.message || 'Invalid array value',
    'array_validation'
  );
});

/**
 * Nested object validation decorator
 */
export function ValidateNested(validationClass?: any) {
  return createValidationDecorator(() => {
    return new ValidationRule(
      '',
      async (value: any) => {
        if (!value || typeof value !== 'object') {
          return false;
        }
        
        if (validationClass) {
          const schema = getValidationSchema(validationClass);
          if (schema) {
            const validator = new EntityValidator();
            const result = await validator.validate(value, schema.allRules);
            return result.isValid;
          }
        }
        
        return true;
      },
      'Invalid nested object',
      'nested_validation'
    );
  })();
}

/**
 * Conditional validation decorator
 */
export function ValidateIf(
  condition: (entity: any) => boolean,
  validator: (value: any) => boolean | Promise<boolean>,
  options?: {
    message?: string;
    code?: string;
  }
) {
  return createValidationDecorator(() => {
    return new ValidationRule(
      '',
      async (value: any, entity?: any) => {
        if (!entity || !condition(entity)) {
          return true; // Skip validation if condition is not met
        }
        return validator(value);
      },
      options?.message || 'Conditional validation failed',
      options?.code || 'conditional_validation'
    );
  })();
}

/**
 * Get validation schema from decorated class
 */
export function getValidationSchema(target: any): ValidationSchema | null {
  // Check if schema is already cached
  const cachedSchema = Reflect.getMetadata(SCHEMA_METADATA_KEY, target.prototype || target);
  if (cachedSchema) {
    return cachedSchema;
  }
  
  const metadata: ValidationMetadata[] = 
    Reflect.getMetadata(VALIDATION_METADATA_KEY, target.prototype || target) || [];
  
  if (metadata.length === 0) {
    return null;
  }
  
  const schema = new ValidationSchema();
  
  // Group rules by field
  const rulesByField = new Map<string, ValidationRule[]>();
  
  for (const meta of metadata) {
    const field = meta.propertyKey;
    if (!rulesByField.has(field)) {
      rulesByField.set(field, []);
    }
    rulesByField.get(field)!.push(meta.rule);
  }
  
  // Add rules to schema
  for (const [field, rules] of rulesByField) {
    for (const rule of rules) {
      schema.addRule(new ValidationRule(
        field,
        rule.validator,
        rule.message,
        rule.code,
        rule.severity
      ));
    }
  }
  
  // Cache the schema
  Reflect.defineMetadata(
    SCHEMA_METADATA_KEY,
    schema,
    target.prototype || target
  );
  
  return schema;
}

/**
 * Validate a decorated class instance
 */
export async function validateEntity(entity: any): Promise<{
  isValid: boolean;
  errors: Array<{ field: string; message: string; code?: string }>;
}> {
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
export function Validatable<T extends new (...args: any[]) => object>(constructor: T) {
  // Add validation method to the prototype
  constructor.prototype.validate = async function() {
    return validateEntity(this);
  };
  
  // Add static validation method
  (constructor as any).validate = async function(entity: any) {
    return validateEntity(entity);
  };
  
  return constructor;
}

/**
 * Property transformer decorator for sanitization
 */
export function Transform(transformer: (value: any) => any) {
  return (target: any, propertyKey: string) => {
    const key = Symbol(propertyKey);
    
    Object.defineProperty(target, propertyKey, {
      get() {
        return this[key];
      },
      set(value: any) {
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
export const Transformers = {
  trim: (value: any) => typeof value === 'string' ? value.trim() : value,
  lowercase: (value: any) => typeof value === 'string' ? value.toLowerCase() : value,
  uppercase: (value: any) => typeof value === 'string' ? value.toUpperCase() : value,
  toNumber: (value: any) => Number(value),
  toBoolean: (value: any) => Boolean(value),
  toDate: (value: any) => value instanceof Date ? value : new Date(value),
  toArray: (value: any) => Array.isArray(value) ? value : [value],
  sanitizeHtml: (value: any) => {
    if (typeof value !== 'string') return value;
    // Basic HTML sanitization - in production use a proper library
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
};