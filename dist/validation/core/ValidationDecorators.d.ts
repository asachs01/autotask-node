import 'reflect-metadata';
import { ValidationSchema } from './ValidationFramework';
/**
 * Required field decorator
 */
export declare const Required: (options?: any) => (target: any, propertyKey: string) => void;
/**
 * String field decorator with optional length constraints
 */
export declare const IsString: (options?: any) => (target: any, propertyKey: string) => void;
/**
 * Number field decorator with optional range constraints
 */
export declare const IsNumber: (options?: any) => (target: any, propertyKey: string) => void;
/**
 * Boolean field decorator
 */
export declare const IsBoolean: (options?: any) => (target: any, propertyKey: string) => void;
/**
 * Date field decorator
 */
export declare const IsDate: (options?: any) => (target: any, propertyKey: string) => void;
/**
 * Email field decorator
 */
export declare const IsEmail: (options?: any) => (target: any, propertyKey: string) => void;
/**
 * URL field decorator
 */
export declare const IsUrl: (options?: any) => (target: any, propertyKey: string) => void;
/**
 * UUID field decorator
 */
export declare const IsUUID: (options?: any) => (target: any, propertyKey: string) => void;
/**
 * Enum field decorator
 */
export declare function IsEnum(enumType: any, options?: {
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Pattern field decorator
 */
export declare function Pattern(pattern: RegExp, options?: {
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Custom validation decorator
 */
export declare function Validate(validator: (value: any, entity?: any) => boolean | Promise<boolean>, options?: {
    message?: string;
    code?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Array field decorator
 */
export declare const IsArray: (options?: any) => (target: any, propertyKey: string) => void;
/**
 * Nested object validation decorator
 */
export declare function ValidateNested(validationClass?: any): (target: any, propertyKey: string) => void;
/**
 * Conditional validation decorator
 */
export declare function ValidateIf(condition: (entity: any) => boolean, validator: (value: any) => boolean | Promise<boolean>, options?: {
    message?: string;
    code?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Get validation schema from decorated class
 */
export declare function getValidationSchema(target: any): ValidationSchema | null;
/**
 * Validate a decorated class instance
 */
export declare function validateEntity(entity: any): Promise<{
    isValid: boolean;
    errors: Array<{
        field: string;
        message: string;
        code?: string;
    }>;
}>;
/**
 * Class decorator to enable validation
 */
export declare function Validatable<T extends new (...args: any[]) => object>(constructor: T): T;
/**
 * Property transformer decorator for sanitization
 */
export declare function Transform(transformer: (value: any) => any): (target: any, propertyKey: string) => void;
/**
 * Common transformers
 */
export declare const Transformers: {
    trim: (value: any) => any;
    lowercase: (value: any) => any;
    uppercase: (value: any) => any;
    toNumber: (value: any) => number;
    toBoolean: (value: any) => boolean;
    toDate: (value: any) => Date;
    toArray: (value: any) => any[];
    sanitizeHtml: (value: any) => any;
};
//# sourceMappingURL=ValidationDecorators.d.ts.map