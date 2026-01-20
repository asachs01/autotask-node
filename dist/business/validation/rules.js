"use strict";
/**
 * Business rules validation system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonBusinessRules = exports.BusinessRuleEngine = void 0;
class BusinessRuleEngine {
    constructor() {
        this.rules = new Map();
    }
    registerRule(entityType, rule) {
        if (!this.rules.has(entityType)) {
            this.rules.set(entityType, []);
        }
        this.rules.get(entityType).push(rule);
    }
    validateRules(entityType, entity, context) {
        const entityRules = this.rules.get(entityType) || [];
        const violations = [];
        for (const rule of entityRules) {
            try {
                if (!rule.validate(entity, context)) {
                    violations.push(rule.errorMessage || `Rule violation: ${rule.name}`);
                }
            }
            catch (error) {
                violations.push(`Rule error in ${rule.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        return {
            isValid: violations.length === 0,
            violations
        };
    }
}
exports.BusinessRuleEngine = BusinessRuleEngine;
// Common business rule templates
exports.CommonBusinessRules = {
    required: (fieldName) => ({
        name: `required_${fieldName}`,
        validate: (entity) => entity[fieldName] != null && entity[fieldName] !== '',
        errorMessage: `${fieldName} is required`
    }),
    minLength: (fieldName, min) => ({
        name: `min_length_${fieldName}`,
        validate: (entity) => !entity[fieldName] || entity[fieldName].length >= min,
        errorMessage: `${fieldName} must be at least ${min} characters long`
    }),
    maxLength: (fieldName, max) => ({
        name: `max_length_${fieldName}`,
        validate: (entity) => !entity[fieldName] || entity[fieldName].length <= max,
        errorMessage: `${fieldName} must be no more than ${max} characters long`
    })
};
//# sourceMappingURL=rules.js.map