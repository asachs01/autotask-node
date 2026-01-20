import { FieldValidator, ValidationResult } from '../index';
/**
 * Field-level validators for common validation scenarios
 */
export declare class RequiredValidator implements FieldValidator {
    name: string;
    config?: {
        customMessage?: string;
    };
    constructor(config?: {
        customMessage?: string;
    });
    validate(value: any): ValidationResult;
}
export declare class EmailValidator implements FieldValidator {
    name: string;
    private emailRegex;
    config?: {
        customMessage?: string;
    };
    constructor(config?: {
        customMessage?: string;
    });
    validate(value: any): ValidationResult;
}
export declare class PhoneValidator implements FieldValidator {
    name: string;
    private phoneRegex;
    config?: {
        customMessage?: string;
    };
    constructor(config?: {
        customMessage?: string;
    });
    validate(value: any): ValidationResult;
}
export declare class DateRangeValidator implements FieldValidator {
    name: string;
    config?: {
        minDate?: Date;
        maxDate?: Date;
        customMessage?: string;
    };
    constructor(config?: {
        minDate?: Date;
        maxDate?: Date;
        customMessage?: string;
    });
    validate(value: any): ValidationResult;
}
export declare class NumericRangeValidator implements FieldValidator {
    name: string;
    config?: {
        min?: number;
        max?: number;
        customMessage?: string;
    };
    constructor(config?: {
        min?: number;
        max?: number;
        customMessage?: string;
    });
    validate(value: any): ValidationResult;
}
export declare class LengthValidator implements FieldValidator {
    name: string;
    config?: {
        minLength?: number;
        maxLength?: number;
        customMessage?: string;
    };
    constructor(config?: {
        minLength?: number;
        maxLength?: number;
        customMessage?: string;
    });
    validate(value: any): ValidationResult;
}
export declare class RegexValidator implements FieldValidator {
    name: string;
    config?: {
        pattern: RegExp;
        customMessage?: string;
    };
    constructor(config: {
        pattern: RegExp;
        customMessage?: string;
    });
    validate(value: any): ValidationResult;
}
export declare class DependsOnValidator implements FieldValidator {
    name: string;
    config?: {
        dependentField: string;
        condition: (dependentValue: any, currentValue: any) => boolean;
        customMessage?: string;
    };
    constructor(config: {
        dependentField: string;
        condition: (dependentValue: any, currentValue: any) => boolean;
        customMessage?: string;
    });
    validate(value: any, context?: any): ValidationResult;
}
//# sourceMappingURL=FieldValidators.d.ts.map