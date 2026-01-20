/**
 * Cross-Field Validation Rules
 *
 * Implements validation rules that span multiple fields
 * and enforce relationships between field values.
 */
import { BaseBusinessRule, RuleContext } from './BusinessRule';
import { ValidationResult } from './ValidationResult';
/**
 * Rule that validates one field based on another field's value
 */
export declare class ConditionalRequiredRule extends BaseBusinessRule {
    private conditionField;
    private conditionValue;
    private requiredField;
    private operator;
    constructor(name: string, conditionField: string, operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan', conditionValue: any, requiredField: string, options?: {
        description?: string;
        priority?: number;
        appliesTo?: string[];
    });
    validate(entity: any, context?: RuleContext): ValidationResult;
    private getFieldValue;
}
/**
 * Rule that validates date ranges
 */
export declare class DateRangeRule extends BaseBusinessRule {
    private startDateField;
    private endDateField;
    private allowEqual;
    private maxDuration?;
    private minDuration?;
    constructor(name: string, startDateField: string, endDateField: string, options?: {
        allowEqual?: boolean;
        maxDuration?: number;
        minDuration?: number;
        description?: string;
        priority?: number;
        appliesTo?: string[];
    });
    validate(entity: any, context?: RuleContext): ValidationResult;
    private getDateValue;
    private getFieldValue;
}
/**
 * Rule that validates sum of fields
 */
export declare class SumValidationRule extends BaseBusinessRule {
    private fields;
    private targetField?;
    private targetValue?;
    private operator;
    constructor(name: string, fields: string[], operator: 'equals' | 'lessThan' | 'greaterThan' | 'lessThanOrEqual' | 'greaterThanOrEqual', target: {
        field: string;
    } | {
        value: number;
    }, options?: {
        description?: string;
        priority?: number;
        appliesTo?: string[];
    });
    validate(entity: any, context?: RuleContext): ValidationResult;
    private getFieldValue;
}
/**
 * Rule that validates mutually exclusive fields
 */
export declare class MutuallyExclusiveRule extends BaseBusinessRule {
    private fieldGroups;
    private requireOne;
    constructor(name: string, fieldGroups: string[][], options?: {
        requireOne?: boolean;
        description?: string;
        priority?: number;
        appliesTo?: string[];
    });
    validate(entity: any, context?: RuleContext): ValidationResult;
    private getFieldValue;
}
/**
 * Rule that validates field dependencies
 */
export declare class DependentFieldsRule extends BaseBusinessRule {
    private primaryField;
    private dependentFields;
    constructor(name: string, primaryField: string, dependentFields: string[], options?: {
        description?: string;
        priority?: number;
        appliesTo?: string[];
    });
    validate(entity: any, context?: RuleContext): ValidationResult;
    private getFieldValue;
}
/**
 * Rule for percentage fields that must sum to 100
 */
export declare class PercentageSumRule extends BaseBusinessRule {
    private percentageFields;
    private tolerance;
    constructor(name: string, percentageFields: string[], options?: {
        tolerance?: number;
        description?: string;
        priority?: number;
        appliesTo?: string[];
    });
    validate(entity: any, context?: RuleContext): ValidationResult;
    private getFieldValue;
}
//# sourceMappingURL=CrossFieldRules.d.ts.map