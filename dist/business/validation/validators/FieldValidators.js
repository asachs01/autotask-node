"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependsOnValidator = exports.RegexValidator = exports.LengthValidator = exports.NumericRangeValidator = exports.DateRangeValidator = exports.PhoneValidator = exports.EmailValidator = exports.RequiredValidator = void 0;
/**
 * Field-level validators for common validation scenarios
 */
class RequiredValidator {
    constructor(config = {}) {
        this.name = 'required';
        this.config = config;
    }
    validate(value) {
        const isValid = value !== null && value !== undefined && value !== '';
        return {
            isValid,
            errors: isValid ? [] : [{
                    field: '',
                    message: this.config?.customMessage || 'This field is required',
                    code: 'FIELD_REQUIRED',
                    severity: 'error'
                }],
            warnings: []
        };
    }
}
exports.RequiredValidator = RequiredValidator;
class EmailValidator {
    constructor(config = {}) {
        this.name = 'email';
        this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.config = config;
    }
    validate(value) {
        if (!value)
            return { isValid: true, errors: [], warnings: [] };
        const isValid = this.emailRegex.test(String(value));
        return {
            isValid,
            errors: isValid ? [] : [{
                    field: '',
                    message: this.config?.customMessage || 'Please enter a valid email address',
                    code: 'FIELD_INVALID_EMAIL',
                    severity: 'error',
                    suggestedFix: 'Ensure email follows format: user@domain.com'
                }],
            warnings: []
        };
    }
}
exports.EmailValidator = EmailValidator;
class PhoneValidator {
    constructor(config = {}) {
        this.name = 'phone';
        this.phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        this.config = config;
    }
    validate(value) {
        if (!value)
            return { isValid: true, errors: [], warnings: [] };
        const cleanValue = String(value).replace(/[\s\-().]/g, '');
        const isValid = this.phoneRegex.test(cleanValue);
        return {
            isValid,
            errors: isValid ? [] : [{
                    field: '',
                    message: this.config?.customMessage || 'Please enter a valid phone number',
                    code: 'FIELD_INVALID_PHONE',
                    severity: 'error',
                    suggestedFix: 'Use format: +1234567890 or (123) 456-7890'
                }],
            warnings: []
        };
    }
}
exports.PhoneValidator = PhoneValidator;
class DateRangeValidator {
    constructor(config = {}) {
        this.name = 'dateRange';
        this.config = config;
    }
    validate(value) {
        if (!value)
            return { isValid: true, errors: [], warnings: [] };
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return {
                isValid: false,
                errors: [{
                        field: '',
                        message: 'Please enter a valid date',
                        code: 'FIELD_INVALID_DATE',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
        const errors = [];
        if (this.config?.minDate && date < this.config.minDate) {
            errors.push({
                field: '',
                message: `Date must be on or after ${this.config.minDate.toDateString()}`,
                code: 'FIELD_DATE_TOO_EARLY',
                severity: 'error'
            });
        }
        if (this.config?.maxDate && date > this.config.maxDate) {
            errors.push({
                field: '',
                message: `Date must be on or before ${this.config.maxDate.toDateString()}`,
                code: 'FIELD_DATE_TOO_LATE',
                severity: 'error'
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: []
        };
    }
}
exports.DateRangeValidator = DateRangeValidator;
class NumericRangeValidator {
    constructor(config = {}) {
        this.name = 'numericRange';
        this.config = config;
    }
    validate(value) {
        if (value === null || value === undefined || value === '') {
            return { isValid: true, errors: [], warnings: [] };
        }
        const numValue = Number(value);
        if (isNaN(numValue)) {
            return {
                isValid: false,
                errors: [{
                        field: '',
                        message: 'Please enter a valid number',
                        code: 'FIELD_INVALID_NUMBER',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
        const errors = [];
        if (this.config?.min !== undefined && numValue < this.config.min) {
            errors.push({
                field: '',
                message: `Value must be at least ${this.config.min}`,
                code: 'FIELD_VALUE_TOO_LOW',
                severity: 'error'
            });
        }
        if (this.config?.max !== undefined && numValue > this.config.max) {
            errors.push({
                field: '',
                message: `Value must be no more than ${this.config.max}`,
                code: 'FIELD_VALUE_TOO_HIGH',
                severity: 'error'
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: []
        };
    }
}
exports.NumericRangeValidator = NumericRangeValidator;
class LengthValidator {
    constructor(config = {}) {
        this.name = 'length';
        this.config = config;
    }
    validate(value) {
        if (!value)
            return { isValid: true, errors: [], warnings: [] };
        const length = String(value).length;
        const errors = [];
        if (this.config?.minLength && length < this.config.minLength) {
            errors.push({
                field: '',
                message: `Must be at least ${this.config.minLength} characters long`,
                code: 'FIELD_TOO_SHORT',
                severity: 'error'
            });
        }
        if (this.config?.maxLength && length > this.config.maxLength) {
            errors.push({
                field: '',
                message: `Must be no more than ${this.config.maxLength} characters long`,
                code: 'FIELD_TOO_LONG',
                severity: 'error'
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: []
        };
    }
}
exports.LengthValidator = LengthValidator;
class RegexValidator {
    constructor(config) {
        this.name = 'regex';
        this.config = config;
    }
    validate(value) {
        if (!value)
            return { isValid: true, errors: [], warnings: [] };
        const isValid = this.config.pattern.test(String(value));
        return {
            isValid,
            errors: isValid ? [] : [{
                    field: '',
                    message: this.config?.customMessage || 'Value does not match required format',
                    code: 'FIELD_INVALID_FORMAT',
                    severity: 'error'
                }],
            warnings: []
        };
    }
}
exports.RegexValidator = RegexValidator;
class DependsOnValidator {
    constructor(config) {
        this.name = 'dependsOn';
        this.config = config;
    }
    validate(value, context) {
        if (!context)
            return { isValid: true, errors: [], warnings: [] };
        const dependentValue = context[this.config.dependentField];
        const isValid = this.config.condition(dependentValue, value);
        return {
            isValid,
            errors: isValid ? [] : [{
                    field: '',
                    message: this.config?.customMessage ||
                        `This field depends on ${this.config.dependentField}`,
                    code: 'FIELD_DEPENDENCY_VIOLATION',
                    severity: 'error',
                    context: {
                        dependentField: this.config.dependentField,
                        dependentValue
                    }
                }],
            warnings: []
        };
    }
}
exports.DependsOnValidator = DependsOnValidator;
//# sourceMappingURL=FieldValidators.js.map