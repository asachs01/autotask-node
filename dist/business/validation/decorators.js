"use strict";
/**
 * Validation decorators for entity properties
 * Note: This requires reflect-metadata to be installed and configured
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATION_METADATA_KEY = void 0;
exports.Required = Required;
exports.Email = Email;
exports.Length = Length;
exports.Range = Range;
exports.ValidateWith = ValidateWith;
exports.getValidationMetadata = getValidationMetadata;
exports.validateWithDecorators = validateWithDecorators;
// import 'reflect-metadata'; // Disabled for now - requires reflect-metadata package
exports.VALIDATION_METADATA_KEY = Symbol('validation');
/**
 * Required field decorator
 */
function Required(message) {
    return function (target, propertyKey) {
        // Metadata functionality disabled until reflect-metadata is properly configured
        console.warn('Validation decorators require reflect-metadata package');
    };
}
/**
 * Email validation decorator
 */
function Email(message) {
    return function (target, propertyKey) {
        // Metadata functionality disabled until reflect-metadata is properly configured
        console.warn('Validation decorators require reflect-metadata package');
    };
}
/**
 * Length validation decorator
 */
function Length(min, max, message) {
    return function (target, propertyKey) {
        // Metadata functionality disabled until reflect-metadata is properly configured
        console.warn('Validation decorators require reflect-metadata package');
    };
}
/**
 * Range validation decorator
 */
function Range(min, max, message) {
    return function (target, propertyKey) {
        // Metadata functionality disabled until reflect-metadata is properly configured
        console.warn('Validation decorators require reflect-metadata package');
    };
}
/**
 * Custom validation decorator
 */
function ValidateWith(validator, message) {
    return function (target, propertyKey) {
        // Metadata functionality disabled until reflect-metadata is properly configured
        console.warn('Validation decorators require reflect-metadata package');
    };
}
/**
 * Helper function to extract validation metadata from a class
 */
function getValidationMetadata(target) {
    console.warn('Validation decorators require reflect-metadata package');
    return [];
}
/**
 * Validate an object using its decorators
 */
function validateWithDecorators(obj) {
    console.warn('Validation decorators require reflect-metadata package');
    return {
        isValid: true,
        errors: []
    };
}
//# sourceMappingURL=decorators.js.map