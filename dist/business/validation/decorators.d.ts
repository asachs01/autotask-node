/**
 * Validation decorators for entity properties
 * Note: This requires reflect-metadata to be installed and configured
 */
export declare const VALIDATION_METADATA_KEY: unique symbol;
export interface ValidationMetadata {
    propertyKey: string;
    rules: ValidationRule[];
}
export interface ValidationRule {
    type: string;
    options?: any;
    message?: string;
}
/**
 * Required field decorator
 */
export declare function Required(message?: string): (target: any, propertyKey: string) => void;
/**
 * Email validation decorator
 */
export declare function Email(message?: string): (target: any, propertyKey: string) => void;
/**
 * Length validation decorator
 */
export declare function Length(min?: number, max?: number, message?: string): (target: any, propertyKey: string) => void;
/**
 * Range validation decorator
 */
export declare function Range(min?: number, max?: number, message?: string): (target: any, propertyKey: string) => void;
/**
 * Custom validation decorator
 */
export declare function ValidateWith(validator: (value: any, entity?: any) => boolean, message?: string): (target: any, propertyKey: string) => void;
/**
 * Helper function to extract validation metadata from a class
 */
export declare function getValidationMetadata(target: any): ValidationMetadata[];
/**
 * Validate an object using its decorators
 */
export declare function validateWithDecorators(obj: any): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=decorators.d.ts.map