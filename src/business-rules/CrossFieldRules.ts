/**
 * Cross-Field Validation Rules
 * 
 * Implements validation rules that span multiple fields
 * and enforce relationships between field values.
 */

import { BaseBusinessRule, BusinessRule, RuleContext, RulePriority } from './BusinessRule';
import { ValidationResult } from './ValidationResult';

/**
 * Rule that validates one field based on another field's value
 */
export class ConditionalRequiredRule extends BaseBusinessRule {
  private conditionField: string;
  private conditionValue: any;
  private requiredField: string;
  private operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  
  constructor(
    name: string,
    conditionField: string,
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan',
    conditionValue: any,
    requiredField: string,
    options?: {
      description?: string;
      priority?: number;
      appliesTo?: string[];
    }
  ) {
    super(name, options);
    this.conditionField = conditionField;
    this.operator = operator;
    this.conditionValue = conditionValue;
    this.requiredField = requiredField;
  }
  
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    const conditionFieldValue = this.getFieldValue(entity, this.conditionField);
    
    let conditionMet = false;
    
    switch (this.operator) {
      case 'equals':
        conditionMet = conditionFieldValue === this.conditionValue;
        break;
      case 'notEquals':
        conditionMet = conditionFieldValue !== this.conditionValue;
        break;
      case 'contains':
        conditionMet = String(conditionFieldValue).includes(String(this.conditionValue));
        break;
      case 'greaterThan':
        conditionMet = Number(conditionFieldValue) > Number(this.conditionValue);
        break;
      case 'lessThan':
        conditionMet = Number(conditionFieldValue) < Number(this.conditionValue);
        break;
    }
    
    if (conditionMet) {
      const requiredFieldValue = this.getFieldValue(entity, this.requiredField);
      
      if (requiredFieldValue === null || requiredFieldValue === undefined || requiredFieldValue === '') {
        result.addError(
          'CONDITIONAL_REQUIRED_FIELD',
          `Field '${this.requiredField}' is required when '${this.conditionField}' ${this.operator} '${this.conditionValue}'`,
          [this.requiredField, this.conditionField],
          { entityType: context?.entityType }
        );
      }
    }
    
    return result;
  }
  
  private getFieldValue(entity: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}

/**
 * Rule that validates date ranges
 */
export class DateRangeRule extends BaseBusinessRule {
  private startDateField: string;
  private endDateField: string;
  private allowEqual: boolean;
  private maxDuration?: number; // In days
  private minDuration?: number; // In days
  
  constructor(
    name: string,
    startDateField: string,
    endDateField: string,
    options?: {
      allowEqual?: boolean;
      maxDuration?: number;
      minDuration?: number;
      description?: string;
      priority?: number;
      appliesTo?: string[];
    }
  ) {
    super(name, options);
    this.startDateField = startDateField;
    this.endDateField = endDateField;
    this.allowEqual = options?.allowEqual ?? true;
    this.maxDuration = options?.maxDuration;
    this.minDuration = options?.minDuration;
  }
  
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    
    const startDate = this.getDateValue(entity, this.startDateField);
    const endDate = this.getDateValue(entity, this.endDateField);
    
    if (!startDate || !endDate) {
      return result; // Skip validation if dates are not present
    }
    
    // Check date order
    if (this.allowEqual) {
      if (endDate < startDate) {
        result.addError(
          'INVALID_DATE_RANGE',
          `End date must be after or equal to start date`,
          [this.startDateField, this.endDateField],
          { startDate, endDate, entityType: context?.entityType }
        );
      }
    } else {
      if (endDate <= startDate) {
        result.addError(
          'INVALID_DATE_RANGE',
          `End date must be after start date`,
          [this.startDateField, this.endDateField],
          { startDate, endDate, entityType: context?.entityType }
        );
      }
    }
    
    // Check duration constraints
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);
    
    if (this.maxDuration !== undefined && durationDays > this.maxDuration) {
      result.addError(
        'DURATION_TOO_LONG',
        `Duration between dates exceeds maximum of ${this.maxDuration} days`,
        [this.startDateField, this.endDateField],
        { durationDays, maxDuration: this.maxDuration, entityType: context?.entityType }
      );
    }
    
    if (this.minDuration !== undefined && durationDays < this.minDuration) {
      result.addError(
        'DURATION_TOO_SHORT',
        `Duration between dates is less than minimum of ${this.minDuration} days`,
        [this.startDateField, this.endDateField],
        { durationDays, minDuration: this.minDuration, entityType: context?.entityType }
      );
    }
    
    return result;
  }
  
  private getDateValue(entity: any, fieldPath: string): Date | null {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return null;
      }
      value = value[part];
    }
    
    if (!value) return null;
    
    // Convert to Date if it's a string
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return value instanceof Date ? value : null;
  }
  
  private getFieldValue(entity: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}

/**
 * Rule that validates sum of fields
 */
export class SumValidationRule extends BaseBusinessRule {
  private fields: string[];
  private targetField?: string;
  private targetValue?: number;
  private operator: 'equals' | 'lessThan' | 'greaterThan' | 'lessThanOrEqual' | 'greaterThanOrEqual';
  
  constructor(
    name: string,
    fields: string[],
    operator: 'equals' | 'lessThan' | 'greaterThan' | 'lessThanOrEqual' | 'greaterThanOrEqual',
    target: { field: string } | { value: number },
    options?: {
      description?: string;
      priority?: number;
      appliesTo?: string[];
    }
  ) {
    super(name, options);
    this.fields = fields;
    this.operator = operator;
    
    if ('field' in target) {
      this.targetField = target.field;
    } else {
      this.targetValue = target.value;
    }
  }
  
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    
    // Calculate sum of fields
    let sum = 0;
    const missingFields: string[] = [];
    
    for (const field of this.fields) {
      const value = this.getFieldValue(entity, field);
      if (value === null || value === undefined) {
        missingFields.push(field);
      } else {
        sum += Number(value) || 0;
      }
    }
    
    if (missingFields.length > 0) {
      result.addWarning(
        'MISSING_SUM_FIELDS',
        `Some fields are missing for sum validation: ${missingFields.join(', ')}`,
        missingFields,
        { entityType: context?.entityType }
      );
      return result;
    }
    
    // Get target value
    const target = this.targetField 
      ? Number(this.getFieldValue(entity, this.targetField)) || 0
      : this.targetValue!;
    
    // Validate sum against target
    let valid = false;
    let errorMessage = '';
    
    switch (this.operator) {
      case 'equals':
        valid = sum === target;
        errorMessage = `Sum of fields (${sum}) must equal ${target}`;
        break;
      case 'lessThan':
        valid = sum < target;
        errorMessage = `Sum of fields (${sum}) must be less than ${target}`;
        break;
      case 'greaterThan':
        valid = sum > target;
        errorMessage = `Sum of fields (${sum}) must be greater than ${target}`;
        break;
      case 'lessThanOrEqual':
        valid = sum <= target;
        errorMessage = `Sum of fields (${sum}) must be less than or equal to ${target}`;
        break;
      case 'greaterThanOrEqual':
        valid = sum >= target;
        errorMessage = `Sum of fields (${sum}) must be greater than or equal to ${target}`;
        break;
    }
    
    if (!valid) {
      result.addError(
        'INVALID_SUM',
        errorMessage,
        this.fields,
        { sum, target, operator: this.operator, entityType: context?.entityType }
      );
    }
    
    return result;
  }
  
  private getFieldValue(entity: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}

/**
 * Rule that validates mutually exclusive fields
 */
export class MutuallyExclusiveRule extends BaseBusinessRule {
  private fieldGroups: string[][];
  private requireOne: boolean;
  
  constructor(
    name: string,
    fieldGroups: string[][],
    options?: {
      requireOne?: boolean;
      description?: string;
      priority?: number;
      appliesTo?: string[];
    }
  ) {
    super(name, options);
    this.fieldGroups = fieldGroups;
    this.requireOne = options?.requireOne ?? false;
  }
  
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    
    const populatedGroups: number[] = [];
    
    for (let i = 0; i < this.fieldGroups.length; i++) {
      const group = this.fieldGroups[i];
      const hasValue = group.some(field => {
        const value = this.getFieldValue(entity, field);
        return value !== null && value !== undefined && value !== '';
      });
      
      if (hasValue) {
        populatedGroups.push(i);
      }
    }
    
    if (populatedGroups.length > 1) {
      const conflictingFields = populatedGroups
        .map(i => this.fieldGroups[i])
        .flat();
      
      result.addError(
        'MUTUALLY_EXCLUSIVE_FIELDS',
        `Only one of these field groups can have values: ${this.fieldGroups.map(g => `[${g.join(', ')}]`).join(' OR ')}`,
        conflictingFields,
        { populatedGroups, entityType: context?.entityType }
      );
    } else if (this.requireOne && populatedGroups.length === 0) {
      const allFields = this.fieldGroups.flat();
      
      result.addError(
        'REQUIRED_EXCLUSIVE_FIELD',
        `At least one of these field groups must have values: ${this.fieldGroups.map(g => `[${g.join(', ')}]`).join(' OR ')}`,
        allFields,
        { entityType: context?.entityType }
      );
    }
    
    return result;
  }
  
  private getFieldValue(entity: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}

/**
 * Rule that validates field dependencies
 */
export class DependentFieldsRule extends BaseBusinessRule {
  private primaryField: string;
  private dependentFields: string[];
  
  constructor(
    name: string,
    primaryField: string,
    dependentFields: string[],
    options?: {
      description?: string;
      priority?: number;
      appliesTo?: string[];
    }
  ) {
    super(name, options);
    this.primaryField = primaryField;
    this.dependentFields = dependentFields;
  }
  
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    
    const primaryValue = this.getFieldValue(entity, this.primaryField);
    const hasPrimary = primaryValue !== null && primaryValue !== undefined && primaryValue !== '';
    
    for (const field of this.dependentFields) {
      const value = this.getFieldValue(entity, field);
      const hasValue = value !== null && value !== undefined && value !== '';
      
      if (hasValue && !hasPrimary) {
        result.addError(
          'MISSING_PRIMARY_FIELD',
          `Field '${field}' requires '${this.primaryField}' to be set`,
          [field, this.primaryField],
          { entityType: context?.entityType }
        );
      }
    }
    
    return result;
  }
  
  private getFieldValue(entity: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}

/**
 * Rule for percentage fields that must sum to 100
 */
export class PercentageSumRule extends BaseBusinessRule {
  private percentageFields: string[];
  private tolerance: number;
  
  constructor(
    name: string,
    percentageFields: string[],
    options?: {
      tolerance?: number;
      description?: string;
      priority?: number;
      appliesTo?: string[];
    }
  ) {
    super(name, options);
    this.percentageFields = percentageFields;
    this.tolerance = options?.tolerance ?? 0.01; // Default to 0.01% tolerance
  }
  
  validate(entity: any, context?: RuleContext): ValidationResult {
    const result = new ValidationResult();
    
    let sum = 0;
    const populatedFields: string[] = [];
    
    for (const field of this.percentageFields) {
      const value = this.getFieldValue(entity, field);
      if (value !== null && value !== undefined && value !== '') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          sum += numValue;
          populatedFields.push(field);
        }
      }
    }
    
    // Only validate if at least one field has a value
    if (populatedFields.length > 0) {
      const difference = Math.abs(sum - 100);
      
      if (difference > this.tolerance) {
        result.addError(
          'INVALID_PERCENTAGE_SUM',
          `Percentage fields must sum to 100% (current sum: ${sum}%)`,
          populatedFields,
          { sum, difference, tolerance: this.tolerance, entityType: context?.entityType }
        );
      }
    }
    
    return result;
  }
  
  private getFieldValue(entity: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = entity;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}