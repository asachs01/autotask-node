"use strict";
/**
 * Core validation types and interfaces for the Autotask SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceViolationException = exports.SecurityViolationException = exports.SanitizationException = exports.ValidationException = void 0;
// Error Types
class ValidationException extends Error {
    constructor(message, errors, warnings, entityType, entityId) {
        super(message);
        this.errors = errors;
        this.warnings = warnings;
        this.entityType = entityType;
        this.entityId = entityId;
        this.name = 'ValidationException';
    }
}
exports.ValidationException = ValidationException;
class SanitizationException extends Error {
    constructor(message, field, originalValue, sanitizedValue) {
        super(message);
        this.field = field;
        this.originalValue = originalValue;
        this.sanitizedValue = sanitizedValue;
        this.name = 'SanitizationException';
    }
}
exports.SanitizationException = SanitizationException;
class SecurityViolationException extends Error {
    constructor(message, violationType, riskLevel, userId, ipAddress) {
        super(message);
        this.violationType = violationType;
        this.riskLevel = riskLevel;
        this.userId = userId;
        this.ipAddress = ipAddress;
        this.name = 'SecurityViolationException';
    }
}
exports.SecurityViolationException = SecurityViolationException;
class ComplianceViolationException extends Error {
    constructor(message, regulation, violationType, mandatory, entityType, entityId) {
        super(message);
        this.regulation = regulation;
        this.violationType = violationType;
        this.mandatory = mandatory;
        this.entityType = entityType;
        this.entityId = entityId;
        this.name = 'ComplianceViolationException';
    }
}
exports.ComplianceViolationException = ComplianceViolationException;
//# sourceMappingURL=ValidationTypes.js.map