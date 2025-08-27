/**
 * Business rules validation system
 */

export interface ValidationBusinessRule {
  name: string;
  description?: string;
  validate: (entity: any, context?: any) => boolean;
  errorMessage?: string;
}

export class BusinessRuleEngine {
  private rules: Map<string, ValidationBusinessRule[]> = new Map();

  registerRule(entityType: string, rule: ValidationBusinessRule): void {
    if (!this.rules.has(entityType)) {
      this.rules.set(entityType, []);
    }
    this.rules.get(entityType)!.push(rule);
  }

  validateRules(entityType: string, entity: any, context?: any): {
    isValid: boolean;
    violations: string[];
  } {
    const entityRules = this.rules.get(entityType) || [];
    const violations: string[] = [];

    for (const rule of entityRules) {
      try {
        if (!rule.validate(entity, context)) {
          violations.push(rule.errorMessage || `Rule violation: ${rule.name}`);
        }
      } catch (error) {
        violations.push(`Rule error in ${rule.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }
}

// Common business rule templates
export const CommonBusinessRules = {
  required: (fieldName: string): ValidationBusinessRule => ({
    name: `required_${fieldName}`,
    validate: (entity: any) => entity[fieldName] != null && entity[fieldName] !== '',
    errorMessage: `${fieldName} is required`
  }),

  minLength: (fieldName: string, min: number): ValidationBusinessRule => ({
    name: `min_length_${fieldName}`,
    validate: (entity: any) => !entity[fieldName] || entity[fieldName].length >= min,
    errorMessage: `${fieldName} must be at least ${min} characters long`
  }),

  maxLength: (fieldName: string, max: number): ValidationBusinessRule => ({
    name: `max_length_${fieldName}`,
    validate: (entity: any) => !entity[fieldName] || entity[fieldName].length <= max,
    errorMessage: `${fieldName} must be no more than ${max} characters long`
  })
};