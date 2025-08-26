import { FieldValidator, ValidationResult, ValidationError } from '../index';

/**
 * Field-level validators for common validation scenarios
 */

export class RequiredValidator implements FieldValidator {
  name = 'required';
  config?: { customMessage?: string };
  
  constructor(config: { customMessage?: string } = {}) {
    this.config = config;
  }
  
  validate(value: any): ValidationResult {
    const isValid = value !== null && value !== undefined && value !== '';
    
    return {
      isValid,
      errors: isValid ? [] : [{
        field: '',
        message: this.config?.customMessage || 'This field is required',
        code: 'FIELD_REQUIRED',
        severity: 'error' as const
      }],
      warnings: []
    };
  }
}

export class EmailValidator implements FieldValidator {
  name = 'email';
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  config?: { customMessage?: string };
  
  constructor(config: { customMessage?: string } = {}) {
    this.config = config;
  }
  
  validate(value: any): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const isValid = this.emailRegex.test(String(value));
    
    return {
      isValid,
      errors: isValid ? [] : [{
        field: '',
        message: this.config?.customMessage || 'Please enter a valid email address',
        code: 'FIELD_INVALID_EMAIL',
        severity: 'error' as const,
        suggestedFix: 'Ensure email follows format: user@domain.com'
      }],
      warnings: []
    };
  }
}

export class PhoneValidator implements FieldValidator {
  name = 'phone';
  private phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  config?: { customMessage?: string };
  
  constructor(config: { customMessage?: string } = {}) {
    this.config = config;
  }
  
  validate(value: any): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const cleanValue = String(value).replace(/[\s\-().]/g, '');
    const isValid = this.phoneRegex.test(cleanValue);
    
    return {
      isValid,
      errors: isValid ? [] : [{
        field: '',
        message: this.config?.customMessage || 'Please enter a valid phone number',
        code: 'FIELD_INVALID_PHONE',
        severity: 'error' as const,
        suggestedFix: 'Use format: +1234567890 or (123) 456-7890'
      }],
      warnings: []
    };
  }
}

export class DateRangeValidator implements FieldValidator {
  name = 'dateRange';
  config?: {
    minDate?: Date;
    maxDate?: Date;
    customMessage?: string;
  };
  
  constructor(
    config: {
      minDate?: Date;
      maxDate?: Date;
      customMessage?: string;
    } = {}
  ) {
    this.config = config;
  }
  
  validate(value: any): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        errors: [{
          field: '',
          message: 'Please enter a valid date',
          code: 'FIELD_INVALID_DATE',
          severity: 'error' as const
        }],
        warnings: []
      };
    }
    
    const errors: ValidationError[] = [];
    
    if (this.config?.minDate && date < this.config.minDate) {
      errors.push({
        field: '',
        message: `Date must be on or after ${this.config.minDate.toDateString()}`,
        code: 'FIELD_DATE_TOO_EARLY',
        severity: 'error' as const
      });
    }
    
    if (this.config?.maxDate && date > this.config.maxDate) {
      errors.push({
        field: '',
        message: `Date must be on or before ${this.config.maxDate.toDateString()}`,
        code: 'FIELD_DATE_TOO_LATE',
        severity: 'error' as const
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}

export class NumericRangeValidator implements FieldValidator {
  name = 'numericRange';
  config?: {
    min?: number;
    max?: number;
    customMessage?: string;
  };
  
  constructor(
    config: {
      min?: number;
      max?: number;
      customMessage?: string;
    } = {}
  ) {
    this.config = config;
  }
  
  validate(value: any): ValidationResult {
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
          severity: 'error' as const
        }],
        warnings: []
      };
    }
    
    const errors: ValidationError[] = [];
    
    if (this.config?.min !== undefined && numValue < this.config.min) {
      errors.push({
        field: '',
        message: `Value must be at least ${this.config.min}`,
        code: 'FIELD_VALUE_TOO_LOW',
        severity: 'error' as const
      });
    }
    
    if (this.config?.max !== undefined && numValue > this.config.max) {
      errors.push({
        field: '',
        message: `Value must be no more than ${this.config.max}`,
        code: 'FIELD_VALUE_TOO_HIGH',
        severity: 'error' as const
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}

export class LengthValidator implements FieldValidator {
  name = 'length';
  config?: {
    minLength?: number;
    maxLength?: number;
    customMessage?: string;
  };
  
  constructor(
    config: {
      minLength?: number;
      maxLength?: number;
      customMessage?: string;
    } = {}
  ) {
    this.config = config;
  }
  
  validate(value: any): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const length = String(value).length;
    const errors: ValidationError[] = [];
    
    if (this.config?.minLength && length < this.config.minLength) {
      errors.push({
        field: '',
        message: `Must be at least ${this.config.minLength} characters long`,
        code: 'FIELD_TOO_SHORT',
        severity: 'error' as const
      });
    }
    
    if (this.config?.maxLength && length > this.config.maxLength) {
      errors.push({
        field: '',
        message: `Must be no more than ${this.config.maxLength} characters long`,
        code: 'FIELD_TOO_LONG',
        severity: 'error' as const
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}

export class RegexValidator implements FieldValidator {
  name = 'regex';
  config?: {
    pattern: RegExp;
    customMessage?: string;
  };
  
  constructor(
    config: {
      pattern: RegExp;
      customMessage?: string;
    }
  ) {
    this.config = config;
  }
  
  validate(value: any): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const isValid = this.config!.pattern.test(String(value));
    
    return {
      isValid,
      errors: isValid ? [] : [{
        field: '',
        message: this.config?.customMessage || 'Value does not match required format',
        code: 'FIELD_INVALID_FORMAT',
        severity: 'error' as const
      }],
      warnings: []
    };
  }
}

export class DependsOnValidator implements FieldValidator {
  name = 'dependsOn';
  config?: {
    dependentField: string;
    condition: (dependentValue: any, currentValue: any) => boolean;
    customMessage?: string;
  };
  
  constructor(
    config: {
      dependentField: string;
      condition: (dependentValue: any, currentValue: any) => boolean;
      customMessage?: string;
    }
  ) {
    this.config = config;
  }
  
  validate(value: any, context?: any): ValidationResult {
    if (!context) return { isValid: true, errors: [], warnings: [] };
    
    const dependentValue = context[this.config!.dependentField];
    const isValid = this.config!.condition(dependentValue, value);
    
    return {
      isValid,
      errors: isValid ? [] : [{
        field: '',
        message: this.config?.customMessage || 
          `This field depends on ${this.config!.dependentField}`,
        code: 'FIELD_DEPENDENCY_VIOLATION',
        severity: 'error' as const,
        context: {
          dependentField: this.config!.dependentField,
          dependentValue
        }
      }],
      warnings: []
    };
  }
}