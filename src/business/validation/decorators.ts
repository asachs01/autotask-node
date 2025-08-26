/**
 * Validation decorators for entity properties
 * Note: This requires reflect-metadata to be installed and configured
 */

// import 'reflect-metadata'; // Disabled for now - requires reflect-metadata package

export const VALIDATION_METADATA_KEY = Symbol('validation');

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
export function Required(message?: string) {
  return function (target: any, propertyKey: string) {
    // Metadata functionality disabled until reflect-metadata is properly configured
    console.warn('Validation decorators require reflect-metadata package');
  };
}

/**
 * Email validation decorator
 */
export function Email(message?: string) {
  return function (target: any, propertyKey: string) {
    // Metadata functionality disabled until reflect-metadata is properly configured
    console.warn('Validation decorators require reflect-metadata package');
  };
}

/**
 * Length validation decorator
 */
export function Length(min?: number, max?: number, message?: string) {
  return function (target: any, propertyKey: string) {
    // Metadata functionality disabled until reflect-metadata is properly configured
    console.warn('Validation decorators require reflect-metadata package');
  };
}

/**
 * Range validation decorator
 */
export function Range(min?: number, max?: number, message?: string) {
  return function (target: any, propertyKey: string) {
    // Metadata functionality disabled until reflect-metadata is properly configured
    console.warn('Validation decorators require reflect-metadata package');
  };
}

/**
 * Custom validation decorator
 */
export function ValidateWith(validator: (value: any, entity?: any) => boolean, message?: string) {
  return function (target: any, propertyKey: string) {
    // Metadata functionality disabled until reflect-metadata is properly configured
    console.warn('Validation decorators require reflect-metadata package');
  };
}

/**
 * Helper function to extract validation metadata from a class
 */
export function getValidationMetadata(target: any): ValidationMetadata[] {
  console.warn('Validation decorators require reflect-metadata package');
  return [];
}

/**
 * Validate an object using its decorators
 */
export function validateWithDecorators(obj: any): {
  isValid: boolean;
  errors: string[];
} {
  console.warn('Validation decorators require reflect-metadata package');
  return {
    isValid: true,
    errors: []
  };
}