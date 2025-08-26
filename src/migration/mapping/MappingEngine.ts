/**
 * Advanced Data Mapping Engine for PSA Migration
 * Handles field mapping, transformations, and AI-assisted suggestions
 */

import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { createLogger } from '../../utils/logger';

import {
  MappingRule,
  FieldMapping,
  FieldTransformation,
  MappingCondition,
  CustomTransformation,
  TransformationContext,
  ValidationResult,
  ValidationError,
  DataType,
  TransformationType,
  ConditionOperator,
  MappingAction
} from '../types/MigrationTypes';

export interface MappingConfig {
  rules: MappingRule[];
  customTransformations?: CustomTransformation[];
  aiAssisted?: boolean;
  strictValidation?: boolean;
  allowPartialMapping?: boolean;
}

export interface MappingStats {
  totalRecords: number;
  mappedRecords: number;
  failedRecords: number;
  transformedFields: number;
  skippedFields: number;
  validationErrors: number;
}

export interface FieldAnalysis {
  sourceField: string;
  sourceType: DataType;
  targetField?: string;
  targetType?: DataType;
  confidence: number;
  suggestions: MappingSuggestion[];
  issues: string[];
}

export interface MappingSuggestion {
  targetField: string;
  confidence: number;
  reason: string;
  transformation?: FieldTransformation;
}

export class MappingEngine extends EventEmitter {
  private config: MappingConfig;
  private logger: Logger;
  private customFunctions: Map<string, Function> = new Map();
  private cache: Map<string, any> = new Map();
  private stats: MappingStats;

  constructor(config: MappingConfig) {
    super();
    this.config = config;
    this.logger = createLogger('MappingEngine');
    this.stats = {
      totalRecords: 0,
      mappedRecords: 0,
      failedRecords: 0,
      transformedFields: 0,
      skippedFields: 0,
      validationErrors: 0
    };
  }

  /**
   * Transform a batch of records using mapping rules
   */
  async transformBatch(entityType: string, records: any[]): Promise<any[]> {
    const startTime = Date.now();
    const mappingRule = this.getMappingRule(entityType);
    
    if (!mappingRule) {
      throw new Error(`No mapping rule found for entity type: ${entityType}`);
    }

    const transformedRecords: any[] = [];
    const context: TransformationContext = {
      sourceSystem: mappingRule.sourceEntity as any,
      migrationId: 'current-migration',
      entityType,
      batch: records,
      dependencies: new Map(),
      cache: this.cache
    };

    for (const record of records) {
      try {
        const transformedRecord = await this.transformRecord(mappingRule, record, context);
        transformedRecords.push(transformedRecord);
        this.stats.mappedRecords++;
      } catch (error) {
        this.logger.error('Record transformation failed', { entityType, record, error });
        this.stats.failedRecords++;
        
        if (!this.config.allowPartialMapping) {
          throw error;
        }
      }
    }

    const processingTime = Date.now() - startTime;
    this.logger.info('Batch transformation completed', {
      entityType,
      recordCount: records.length,
      successCount: transformedRecords.length,
      processingTime
    });

    this.emit('batchTransformed', {
      entityType,
      originalCount: records.length,
      transformedCount: transformedRecords.length,
      processingTime
    });

    return transformedRecords;
  }

  /**
   * Transform a single record
   */
  async transformRecord(
    mappingRule: MappingRule,
    record: any,
    context: TransformationContext
  ): Promise<any> {
    const transformedRecord: any = {};

    // Process field mappings
    for (const fieldMapping of mappingRule.fieldMappings) {
      try {
        const value = await this.transformField(fieldMapping, record, context, mappingRule);
        if (value !== undefined) {
          transformedRecord[fieldMapping.targetField] = value;
          this.stats.transformedFields++;
        } else {
          this.stats.skippedFields++;
        }
      } catch (error) {
        this.logger.error('Field transformation failed', {
          sourceField: fieldMapping.sourceField,
          targetField: fieldMapping.targetField,
          error
        });
        
        if (fieldMapping.required) {
          throw error;
        }
      }
    }

    // Apply custom transformations
    if (this.config.customTransformations) {
      for (const customTransform of this.config.customTransformations) {
        if (customTransform.sourceEntity === mappingRule.sourceEntity &&
            customTransform.targetEntity === mappingRule.targetEntity) {
          try {
            const customResult = await customTransform.function(transformedRecord, context);
            Object.assign(transformedRecord, customResult);
          } catch (error) {
            this.logger.error('Custom transformation failed', { customTransform: customTransform.name, error });
          }
        }
      }
    }

    // Apply conditions and conditional transformations
    await this.applyConditions(mappingRule, record, transformedRecord, context);

    return transformedRecord;
  }

  /**
   * Transform a single field
   */
  private async transformField(
    fieldMapping: FieldMapping,
    record: any,
    context: TransformationContext,
    mappingRule: MappingRule
  ): Promise<any> {
    let value = record[fieldMapping.sourceField];

    // Handle missing values
    if (value === undefined || value === null || value === '') {
      if (fieldMapping.defaultValue !== undefined) {
        value = fieldMapping.defaultValue;
      } else if (fieldMapping.required) {
        throw new Error(`Required field ${fieldMapping.sourceField} is missing`);
      } else {
        return undefined;
      }
    }

    // Apply transformations
    if (mappingRule.transformations) {
      const fieldTransformations = mappingRule.transformations.filter(
        t => t.field === fieldMapping.sourceField || t.field === fieldMapping.targetField
      );

      for (const transformation of fieldTransformations) {
        value = await this.applyTransformation(transformation, value, context);
      }
    }

    // Convert data type
    value = this.convertDataType(value, fieldMapping.dataType);

    // Validate field
    if (fieldMapping.validation && fieldMapping.validation.length > 0) {
      const validationResult = this.validateField(value, fieldMapping.validation);
      if (!validationResult.isValid) {
        this.stats.validationErrors++;
        if (this.config.strictValidation) {
          throw new Error(`Validation failed for field ${fieldMapping.targetField}: ${validationResult.errors.join(', ')}`);
        }
      }
    }

    return value;
  }

  /**
   * Apply a transformation to a value
   */
  private async applyTransformation(
    transformation: FieldTransformation,
    value: any,
    context: TransformationContext
  ): Promise<any> {
    switch (transformation.type) {
      case TransformationType.FORMAT:
        return this.formatValue(value, transformation.parameters);
        
      case TransformationType.CONVERT:
        return this.convertValue(value, transformation.parameters);
        
      case TransformationType.SPLIT:
        return this.splitValue(value, transformation.parameters);
        
      case TransformationType.MERGE:
        return this.mergeValue(value, transformation.parameters, context);
        
      case TransformationType.LOOKUP:
        return await this.lookupValue(value, transformation.parameters, context);
        
      case TransformationType.CALCULATE:
        return this.calculateValue(value, transformation.parameters, context);
        
      case TransformationType.CUSTOM:
        return await this.applyCustomFunction(transformation.customFunction!, value, context);
        
      default:
        return value;
    }
  }

  /**
   * Apply mapping conditions
   */
  private async applyConditions(
    mappingRule: MappingRule,
    sourceRecord: any,
    targetRecord: any,
    context: TransformationContext
  ): Promise<void> {
    if (!mappingRule.conditions) return;

    for (const condition of mappingRule.conditions) {
      const fieldValue = sourceRecord[condition.field];
      const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value);

      if (conditionMet) {
        switch (condition.action) {
          case MappingAction.EXCLUDE:
            throw new Error('Record excluded by condition');
            
          case MappingAction.SET_DEFAULT:
            // Set default values for specified fields
            if (condition.value && typeof condition.value === 'object') {
              Object.assign(targetRecord, condition.value);
            }
            break;
            
          case MappingAction.TRANSFORM:
            // Apply additional transformations
            break;
        }
      }
    }
  }

  /**
   * Evaluate a mapping condition
   */
  private evaluateCondition(value: any, operator: ConditionOperator, conditionValue: any): boolean {
    switch (operator) {
      case ConditionOperator.EQUALS:
        return value === conditionValue;
        
      case ConditionOperator.NOT_EQUALS:
        return value !== conditionValue;
        
      case ConditionOperator.CONTAINS:
        return typeof value === 'string' && value.includes(conditionValue);
        
      case ConditionOperator.STARTS_WITH:
        return typeof value === 'string' && value.startsWith(conditionValue);
        
      case ConditionOperator.ENDS_WITH:
        return typeof value === 'string' && value.endsWith(conditionValue);
        
      case ConditionOperator.GREATER_THAN:
        return Number(value) > Number(conditionValue);
        
      case ConditionOperator.LESS_THAN:
        return Number(value) < Number(conditionValue);
        
      case ConditionOperator.IN:
        return Array.isArray(conditionValue) && conditionValue.includes(value);
        
      case ConditionOperator.NOT_IN:
        return Array.isArray(conditionValue) && !conditionValue.includes(value);
        
      case ConditionOperator.IS_NULL:
        return value === null || value === undefined || value === '';
        
      case ConditionOperator.IS_NOT_NULL:
        return value !== null && value !== undefined && value !== '';
        
      default:
        return false;
    }
  }

  /**
   * Validate a field value
   */
  validateField(value: any, validationRules: any[]): ValidationResult {
    const errors: ValidationError[] = [];

    for (const rule of validationRules) {
      switch (rule) {
        case 'required':
          if (value === null || value === undefined || value === '') {
            errors.push({
              field: 'unknown',
              message: 'Field is required',
              code: 'REQUIRED',
              severity: 'high'
            });
          }
          break;
          
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push({
              field: 'unknown',
              message: 'Invalid email format',
              code: 'INVALID_EMAIL',
              severity: 'medium'
            });
          }
          break;
          
        case 'phone':
          if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.toString().replace(/\D/g, ''))) {
            errors.push({
              field: 'unknown',
              message: 'Invalid phone format',
              code: 'INVALID_PHONE',
              severity: 'medium'
            });
          }
          break;
          
        case 'url':
          if (value) {
            try {
              new URL(value);
            } catch {
              errors.push({
                field: 'unknown',
                message: 'Invalid URL format',
                code: 'INVALID_URL',
                severity: 'medium'
              });
            }
          }
          break;
          
        case 'date':
          if (value && isNaN(Date.parse(value))) {
            errors.push({
              field: 'unknown',
              message: 'Invalid date format',
              code: 'INVALID_DATE',
              severity: 'medium'
            });
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Validate a transformed record
   */
  async validateRecord(entityType: string, record: any): Promise<ValidationResult> {
    const mappingRule = this.getMappingRule(entityType);
    if (!mappingRule) {
      return {
        isValid: false,
        errors: [{
          field: 'entity',
          message: `No mapping rule found for entity type: ${entityType}`,
          code: 'NO_MAPPING_RULE',
          severity: 'critical'
        }],
        warnings: []
      };
    }

    const errors: ValidationError[] = [];

    // Validate required fields
    for (const fieldMapping of mappingRule.fieldMappings) {
      if (fieldMapping.required) {
        const value = record[fieldMapping.targetField];
        if (value === undefined || value === null || value === '') {
          errors.push({
            field: fieldMapping.targetField,
            message: `Required field is missing or empty`,
            code: 'REQUIRED_FIELD_MISSING',
            severity: 'high'
          });
        }
      }

      // Validate field format
      if (record[fieldMapping.targetField] !== undefined && fieldMapping.validation) {
        const fieldValidation = this.validateField(record[fieldMapping.targetField], fieldMapping.validation);
        errors.push(...fieldValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Analyze source fields and suggest mappings
   */
  analyzeFields(entityType: string, sampleRecords: any[]): FieldAnalysis[] {
    if (sampleRecords.length === 0) return [];

    const sourceFields = Object.keys(sampleRecords[0]);
    const mappingRule = this.getMappingRule(entityType);
    const analyses: FieldAnalysis[] = [];

    for (const sourceField of sourceFields) {
      const analysis: FieldAnalysis = {
        sourceField,
        sourceType: this.inferDataType(sampleRecords, sourceField),
        confidence: 0,
        suggestions: [],
        issues: []
      };

      // Find existing mapping
      const existingMapping = mappingRule?.fieldMappings.find(m => m.sourceField === sourceField);
      if (existingMapping) {
        analysis.targetField = existingMapping.targetField;
        analysis.targetType = existingMapping.dataType;
        analysis.confidence = 1.0;
      } else {
        // Generate suggestions
        analysis.suggestions = this.generateMappingSuggestions(sourceField, analysis.sourceType, entityType);
        analysis.confidence = analysis.suggestions.length > 0 ? analysis.suggestions[0].confidence : 0;
      }

      // Identify potential issues
      analysis.issues = this.identifyMappingIssues(sourceField, sampleRecords);

      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * Generate AI-assisted mapping suggestions
   */
  private generateMappingSuggestions(
    sourceField: string,
    sourceType: DataType,
    entityType: string
  ): MappingSuggestion[] {
    const suggestions: MappingSuggestion[] = [];

    // Common field name mappings
    const commonMappings: Record<string, Record<string, string>> = {
      companies: {
        'company_name': 'companyName',
        'name': 'companyName',
        'address1': 'addressLine1',
        'address': 'addressLine1',
        'phone': 'phone',
        'email': 'email',
        'website': 'webAddress'
      },
      contacts: {
        'first_name': 'firstName',
        'firstname': 'firstName',
        'last_name': 'lastName',
        'lastname': 'lastName',
        'email': 'emailAddress',
        'phone': 'phone',
        'title': 'title'
      },
      tickets: {
        'subject': 'title',
        'title': 'title',
        'description': 'description',
        'priority': 'priority',
        'status': 'status',
        'created_date': 'createDate',
        'created': 'createDate'
      }
    };

    const entityMappings = commonMappings[entityType] || {};
    const lowerSourceField = sourceField.toLowerCase();

    // Direct name matches
    for (const [pattern, targetField] of Object.entries(entityMappings)) {
      if (lowerSourceField.includes(pattern) || pattern.includes(lowerSourceField)) {
        suggestions.push({
          targetField,
          confidence: 0.9,
          reason: 'Direct field name match',
          transformation: this.suggestTransformation(sourceType, targetField)
        });
      }
    }

    // Pattern-based matches
    if (lowerSourceField.includes('email')) {
      suggestions.push({
        targetField: 'emailAddress',
        confidence: 0.8,
        reason: 'Email field pattern detected'
      });
    }

    if (lowerSourceField.includes('phone') || lowerSourceField.includes('tel')) {
      suggestions.push({
        targetField: 'phone',
        confidence: 0.8,
        reason: 'Phone field pattern detected'
      });
    }

    if (lowerSourceField.includes('address')) {
      suggestions.push({
        targetField: 'addressLine1',
        confidence: 0.7,
        reason: 'Address field pattern detected'
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Helper methods for transformations

  private formatValue(value: any, parameters: any): any {
    if (!parameters || !parameters.format) return value;
    
    const format = parameters.format;
    const str = value?.toString() || '';
    
    switch (format) {
      case 'uppercase':
        return str.toUpperCase();
      case 'lowercase':
        return str.toLowerCase();
      case 'trim':
        return str.trim();
      case 'phone':
        return str.replace(/\D/g, '');
      default:
        return value;
    }
  }

  private convertValue(value: any, parameters: any): any {
    if (!parameters || !parameters.to) return value;
    
    const targetType = parameters.to;
    
    switch (targetType) {
      case 'string':
        return value?.toString() || '';
      case 'number':
        return Number(value) || 0;
      case 'boolean':
        return Boolean(value);
      case 'date':
        return new Date(value).toISOString();
      default:
        return value;
    }
  }

  private splitValue(value: any, parameters: any): any {
    if (!parameters || !parameters.delimiter) return value;
    
    const str = value?.toString() || '';
    const parts = str.split(parameters.delimiter);
    
    if (parameters.index !== undefined) {
      return parts[parameters.index] || '';
    }
    
    return parts;
  }

  private mergeValue(value: any, parameters: any, context: TransformationContext): any {
    if (!parameters || !parameters.fields) return value;
    
    const fields = parameters.fields as string[];
    const delimiter = parameters.delimiter || ' ';
    
    const values = fields.map(field => context.batch[0]?.[field] || '').filter(v => v);
    return values.join(delimiter);
  }

  private async lookupValue(value: any, parameters: any, context: TransformationContext): Promise<any> {
    if (!parameters || !parameters.table) return value;
    
    const lookupTable = parameters.table as Record<string, any>;
    return lookupTable[value] || parameters.default || value;
  }

  private calculateValue(value: any, parameters: any, context: TransformationContext): any {
    if (!parameters || !parameters.expression) return value;
    
    // Simple expression evaluation (would be enhanced in production)
    const expression = parameters.expression as string;
    
    try {
      // Basic math expressions only for security
      if (/^[\d\+\-\*\/\(\)\s\.]+$/.test(expression)) {
        return eval(expression.replace(/\bvalue\b/g, value?.toString() || '0'));
      }
    } catch {
      // Fallback to original value
    }
    
    return value;
  }

  private async applyCustomFunction(functionName: string, value: any, context: TransformationContext): Promise<any> {
    const customFunction = this.customFunctions.get(functionName);
    if (!customFunction) {
      this.logger.warn('Custom function not found', { functionName });
      return value;
    }
    
    try {
      return await customFunction(value, context);
    } catch (error) {
      this.logger.error('Custom function execution failed', { functionName, error });
      return value;
    }
  }

  private convertDataType(value: any, targetType: DataType): any {
    if (value === null || value === undefined) return null;
    
    switch (targetType) {
      case DataType.STRING:
        return value.toString();
      case DataType.NUMBER:
        return Number(value) || 0;
      case DataType.BOOLEAN:
        return Boolean(value);
      case DataType.DATE:
        return new Date(value).toISOString().split('T')[0];
      case DataType.DATETIME:
        return new Date(value).toISOString();
      default:
        return value;
    }
  }

  private inferDataType(records: any[], fieldName: string): DataType {
    const sampleValues = records.slice(0, 10).map(r => r[fieldName]).filter(v => v != null);
    
    if (sampleValues.length === 0) return DataType.STRING;
    
    const firstValue = sampleValues[0];
    
    if (typeof firstValue === 'boolean') return DataType.BOOLEAN;
    if (typeof firstValue === 'number') return DataType.NUMBER;
    
    if (typeof firstValue === 'string') {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(firstValue)) return DataType.DATETIME;
      if (/^\d{4}-\d{2}-\d{2}$/.test(firstValue)) return DataType.DATE;
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(firstValue)) return DataType.EMAIL;
      if (/^[\+]?[1-9][\d]{0,15}$/.test(firstValue.replace(/\D/g, ''))) return DataType.PHONE;
    }
    
    return DataType.STRING;
  }

  private identifyMappingIssues(fieldName: string, sampleRecords: any[]): string[] {
    const issues: string[] = [];
    const values = sampleRecords.map(r => r[fieldName]);
    
    // Check for high null rate
    const nullCount = values.filter(v => v == null || v === '').length;
    const nullRate = nullCount / values.length;
    
    if (nullRate > 0.5) {
      issues.push(`High null rate (${Math.round(nullRate * 100)}%)`);
    }
    
    // Check for inconsistent data types
    const types = new Set(values.filter(v => v != null).map(v => typeof v));
    if (types.size > 1) {
      issues.push('Inconsistent data types');
    }
    
    return issues;
  }

  private suggestTransformation(sourceType: DataType, targetField: string): FieldTransformation | undefined {
    // Suggest transformations based on field types and names
    if (targetField.includes('phone') || targetField.includes('Phone')) {
      return {
        field: targetField,
        type: TransformationType.FORMAT,
        parameters: { format: 'phone' }
      };
    }
    
    if (targetField.includes('email') || targetField.includes('Email')) {
      return {
        field: targetField,
        type: TransformationType.FORMAT,
        parameters: { format: 'lowercase' }
      };
    }
    
    return undefined;
  }

  private getMappingRule(entityType: string): MappingRule | undefined {
    return this.config.rules.find(rule => rule.targetEntity === entityType);
  }

  /**
   * Register a custom transformation function
   */
  registerCustomFunction(name: string, func: Function): void {
    this.customFunctions.set(name, func);
  }

  /**
   * Get mapping statistics
   */
  getStats(): MappingStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalRecords: 0,
      mappedRecords: 0,
      failedRecords: 0,
      transformedFields: 0,
      skippedFields: 0,
      validationErrors: 0
    };
  }
}