/**
 * Business rules validation system
 */
export interface ValidationBusinessRule {
    name: string;
    description?: string;
    validate: (entity: any, context?: any) => boolean;
    errorMessage?: string;
}
export declare class BusinessRuleEngine {
    private rules;
    registerRule(entityType: string, rule: ValidationBusinessRule): void;
    validateRules(entityType: string, entity: any, context?: any): {
        isValid: boolean;
        violations: string[];
    };
}
export declare const CommonBusinessRules: {
    required: (fieldName: string) => ValidationBusinessRule;
    minLength: (fieldName: string, min: number) => ValidationBusinessRule;
    maxLength: (fieldName: string, max: number) => ValidationBusinessRule;
};
//# sourceMappingURL=rules.d.ts.map