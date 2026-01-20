"use strict";
/**
 * Advanced Data Mapping Engine for PSA Migration
 * Handles field mapping, transformations, and AI-assisted suggestions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingEngine = void 0;
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
const MigrationTypes_1 = require("../types/MigrationTypes");
class MappingEngine extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.customFunctions = new Map();
        this.cache = new Map();
        this.config = config;
        this.logger = (0, logger_1.createLogger)('MappingEngine');
        this.stats = {
            totalRecords: 0,
            mappedRecords: 0,
            failedRecords: 0,
            transformedFields: 0,
            skippedFields: 0,
            validationErrors: 0,
        };
    }
    /**
     * Transform a batch of records using mapping rules
     */
    async transformBatch(entityType, records) {
        const startTime = Date.now();
        const mappingRule = this.getMappingRule(entityType);
        if (!mappingRule) {
            throw new Error(`No mapping rule found for entity type: ${entityType}`);
        }
        const transformedRecords = [];
        const context = {
            sourceSystem: mappingRule.sourceEntity,
            migrationId: 'current-migration',
            entityType,
            batch: records,
            dependencies: new Map(),
            cache: this.cache,
        };
        for (const record of records) {
            try {
                const transformedRecord = await this.transformRecord(mappingRule, record, context);
                transformedRecords.push(transformedRecord);
                this.stats.mappedRecords++;
            }
            catch (error) {
                this.logger.error('Record transformation failed', {
                    entityType,
                    record,
                    error,
                });
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
            processingTime,
        });
        this.emit('batchTransformed', {
            entityType,
            originalCount: records.length,
            transformedCount: transformedRecords.length,
            processingTime,
        });
        return transformedRecords;
    }
    /**
     * Transform a single record
     */
    async transformRecord(mappingRule, record, context) {
        const transformedRecord = {};
        // Process field mappings
        for (const fieldMapping of mappingRule.fieldMappings) {
            try {
                const value = await this.transformField(fieldMapping, record, context, mappingRule);
                if (value !== undefined) {
                    transformedRecord[fieldMapping.targetField] = value;
                    this.stats.transformedFields++;
                }
                else {
                    this.stats.skippedFields++;
                }
            }
            catch (error) {
                this.logger.error('Field transformation failed', {
                    sourceField: fieldMapping.sourceField,
                    targetField: fieldMapping.targetField,
                    error,
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
                    }
                    catch (error) {
                        this.logger.error('Custom transformation failed', {
                            customTransform: customTransform.name,
                            error,
                        });
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
    async transformField(fieldMapping, record, context, mappingRule) {
        let value = record[fieldMapping.sourceField];
        // Handle missing values
        if (value === undefined || value === null || value === '') {
            if (fieldMapping.defaultValue !== undefined) {
                value = fieldMapping.defaultValue;
            }
            else if (fieldMapping.required) {
                throw new Error(`Required field ${fieldMapping.sourceField} is missing`);
            }
            else {
                return undefined;
            }
        }
        // Apply transformations
        if (mappingRule.transformations) {
            const fieldTransformations = mappingRule.transformations.filter(t => t.field === fieldMapping.sourceField ||
                t.field === fieldMapping.targetField);
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
    async applyTransformation(transformation, value, context) {
        switch (transformation.type) {
            case MigrationTypes_1.TransformationType.FORMAT:
                return this.formatValue(value, transformation.parameters);
            case MigrationTypes_1.TransformationType.CONVERT:
                return this.convertValue(value, transformation.parameters);
            case MigrationTypes_1.TransformationType.SPLIT:
                return this.splitValue(value, transformation.parameters);
            case MigrationTypes_1.TransformationType.MERGE:
                return this.mergeValue(value, transformation.parameters, context);
            case MigrationTypes_1.TransformationType.LOOKUP:
                return await this.lookupValue(value, transformation.parameters, context);
            case MigrationTypes_1.TransformationType.CALCULATE:
                return this.calculateValue(value, transformation.parameters, context);
            case MigrationTypes_1.TransformationType.CUSTOM:
                return await this.applyCustomFunction(transformation.customFunction, value, context);
            default:
                return value;
        }
    }
    /**
     * Apply mapping conditions
     */
    async applyConditions(mappingRule, sourceRecord, targetRecord, context) {
        if (!mappingRule.conditions)
            return;
        for (const condition of mappingRule.conditions) {
            const fieldValue = sourceRecord[condition.field];
            const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value);
            if (conditionMet) {
                switch (condition.action) {
                    case MigrationTypes_1.MappingAction.EXCLUDE:
                        throw new Error('Record excluded by condition');
                    case MigrationTypes_1.MappingAction.SET_DEFAULT:
                        // Set default values for specified fields
                        if (condition.value && typeof condition.value === 'object') {
                            Object.assign(targetRecord, condition.value);
                        }
                        break;
                    case MigrationTypes_1.MappingAction.TRANSFORM:
                        // Apply additional transformations
                        break;
                }
            }
        }
    }
    /**
     * Evaluate a mapping condition
     */
    evaluateCondition(value, operator, conditionValue) {
        switch (operator) {
            case MigrationTypes_1.ConditionOperator.EQUALS:
                return value === conditionValue;
            case MigrationTypes_1.ConditionOperator.NOT_EQUALS:
                return value !== conditionValue;
            case MigrationTypes_1.ConditionOperator.CONTAINS:
                return typeof value === 'string' && value.includes(conditionValue);
            case MigrationTypes_1.ConditionOperator.STARTS_WITH:
                return typeof value === 'string' && value.startsWith(conditionValue);
            case MigrationTypes_1.ConditionOperator.ENDS_WITH:
                return typeof value === 'string' && value.endsWith(conditionValue);
            case MigrationTypes_1.ConditionOperator.GREATER_THAN:
                return Number(value) > Number(conditionValue);
            case MigrationTypes_1.ConditionOperator.LESS_THAN:
                return Number(value) < Number(conditionValue);
            case MigrationTypes_1.ConditionOperator.IN:
                return Array.isArray(conditionValue) && conditionValue.includes(value);
            case MigrationTypes_1.ConditionOperator.NOT_IN:
                return Array.isArray(conditionValue) && !conditionValue.includes(value);
            case MigrationTypes_1.ConditionOperator.IS_NULL:
                return value === null || value === undefined || value === '';
            case MigrationTypes_1.ConditionOperator.IS_NOT_NULL:
                return value !== null && value !== undefined && value !== '';
            default:
                return false;
        }
    }
    /**
     * Validate a field value
     */
    validateField(value, validationRules) {
        const errors = [];
        for (const rule of validationRules) {
            switch (rule) {
                case 'required':
                    if (value === null || value === undefined || value === '') {
                        errors.push({
                            field: 'unknown',
                            message: 'Field is required',
                            code: 'REQUIRED',
                            severity: MigrationTypes_1.ErrorSeverity.HIGH,
                        });
                    }
                    break;
                case 'email':
                    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        errors.push({
                            field: 'unknown',
                            message: 'Invalid email format',
                            code: 'INVALID_EMAIL',
                            severity: MigrationTypes_1.ErrorSeverity.MEDIUM,
                        });
                    }
                    break;
                case 'phone':
                    if (value &&
                        !/^[\+]?[1-9][\d]{0,15}$/.test(value.toString().replace(/\D/g, ''))) {
                        errors.push({
                            field: 'unknown',
                            message: 'Invalid phone format',
                            code: 'INVALID_PHONE',
                            severity: MigrationTypes_1.ErrorSeverity.MEDIUM,
                        });
                    }
                    break;
                case 'url':
                    if (value) {
                        try {
                            new URL(value);
                        }
                        catch {
                            errors.push({
                                field: 'unknown',
                                message: 'Invalid URL format',
                                code: 'INVALID_URL',
                                severity: MigrationTypes_1.ErrorSeverity.MEDIUM,
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
                            severity: MigrationTypes_1.ErrorSeverity.MEDIUM,
                        });
                    }
                    break;
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: [],
        };
    }
    /**
     * Validate a transformed record
     */
    async validateRecord(entityType, record) {
        const mappingRule = this.getMappingRule(entityType);
        if (!mappingRule) {
            return {
                isValid: false,
                errors: [
                    {
                        field: 'entity',
                        message: `No mapping rule found for entity type: ${entityType}`,
                        code: 'NO_MAPPING_RULE',
                        severity: MigrationTypes_1.ErrorSeverity.CRITICAL,
                    },
                ],
                warnings: [],
            };
        }
        const errors = [];
        // Validate required fields
        for (const fieldMapping of mappingRule.fieldMappings) {
            if (fieldMapping.required) {
                const value = record[fieldMapping.targetField];
                if (value === undefined || value === null || value === '') {
                    errors.push({
                        field: fieldMapping.targetField,
                        message: `Required field is missing or empty`,
                        code: 'REQUIRED_FIELD_MISSING',
                        severity: MigrationTypes_1.ErrorSeverity.HIGH,
                    });
                }
            }
            // Validate field format
            if (record[fieldMapping.targetField] !== undefined &&
                fieldMapping.validation) {
                const fieldValidation = this.validateField(record[fieldMapping.targetField], fieldMapping.validation);
                errors.push(...fieldValidation.errors);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: [],
        };
    }
    /**
     * Analyze source fields and suggest mappings
     */
    analyzeFields(entityType, sampleRecords) {
        if (sampleRecords.length === 0)
            return [];
        const sourceFields = Object.keys(sampleRecords[0]);
        const mappingRule = this.getMappingRule(entityType);
        const analyses = [];
        for (const sourceField of sourceFields) {
            const analysis = {
                sourceField,
                sourceType: this.inferDataType(sampleRecords, sourceField),
                confidence: 0,
                suggestions: [],
                issues: [],
            };
            // Find existing mapping
            const existingMapping = mappingRule?.fieldMappings.find(m => m.sourceField === sourceField);
            if (existingMapping) {
                analysis.targetField = existingMapping.targetField;
                analysis.targetType = existingMapping.dataType;
                analysis.confidence = 1.0;
            }
            else {
                // Generate suggestions
                analysis.suggestions = this.generateMappingSuggestions(sourceField, analysis.sourceType, entityType);
                analysis.confidence =
                    analysis.suggestions.length > 0
                        ? analysis.suggestions[0].confidence
                        : 0;
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
    generateMappingSuggestions(sourceField, sourceType, entityType) {
        const suggestions = [];
        // Common field name mappings
        const commonMappings = {
            companies: {
                company_name: 'companyName',
                name: 'companyName',
                address1: 'addressLine1',
                address: 'addressLine1',
                phone: 'phone',
                email: 'email',
                website: 'webAddress',
            },
            contacts: {
                first_name: 'firstName',
                firstname: 'firstName',
                last_name: 'lastName',
                lastname: 'lastName',
                email: 'emailAddress',
                phone: 'phone',
                title: 'title',
            },
            tickets: {
                subject: 'title',
                title: 'title',
                description: 'description',
                priority: 'priority',
                status: 'status',
                created_date: 'createDate',
                created: 'createDate',
            },
        };
        const entityMappings = commonMappings[entityType] || {};
        const lowerSourceField = sourceField.toLowerCase();
        // Direct name matches
        for (const [pattern, targetField] of Object.entries(entityMappings)) {
            if (lowerSourceField.includes(pattern) ||
                pattern.includes(lowerSourceField)) {
                suggestions.push({
                    targetField,
                    confidence: 0.9,
                    reason: 'Direct field name match',
                    transformation: this.suggestTransformation(sourceType, targetField),
                });
            }
        }
        // Pattern-based matches
        if (lowerSourceField.includes('email')) {
            suggestions.push({
                targetField: 'emailAddress',
                confidence: 0.8,
                reason: 'Email field pattern detected',
            });
        }
        if (lowerSourceField.includes('phone') ||
            lowerSourceField.includes('tel')) {
            suggestions.push({
                targetField: 'phone',
                confidence: 0.8,
                reason: 'Phone field pattern detected',
            });
        }
        if (lowerSourceField.includes('address')) {
            suggestions.push({
                targetField: 'addressLine1',
                confidence: 0.7,
                reason: 'Address field pattern detected',
            });
        }
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
    // Helper methods for transformations
    formatValue(value, parameters) {
        if (!parameters || !parameters.format)
            return value;
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
    convertValue(value, parameters) {
        if (!parameters || !parameters.to)
            return value;
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
    splitValue(value, parameters) {
        if (!parameters || !parameters.delimiter)
            return value;
        const str = value?.toString() || '';
        const parts = str.split(parameters.delimiter);
        if (parameters.index !== undefined) {
            return parts[parameters.index] || '';
        }
        return parts;
    }
    mergeValue(value, parameters, context) {
        if (!parameters || !parameters.fields)
            return value;
        const fields = parameters.fields;
        const delimiter = parameters.delimiter || ' ';
        const values = fields
            .map(field => context.batch[0]?.[field] || '')
            .filter(v => v);
        return values.join(delimiter);
    }
    async lookupValue(value, parameters, context) {
        if (!parameters || !parameters.table)
            return value;
        const lookupTable = parameters.table;
        return lookupTable[value] || parameters.default || value;
    }
    calculateValue(value, parameters, context) {
        if (!parameters || !parameters.expression)
            return value;
        // Simple expression evaluation (would be enhanced in production)
        const expression = parameters.expression;
        try {
            // Basic math expressions only for security
            if (/^[\d\+\-\*\/\(\)\s\.]+$/.test(expression)) {
                return eval(expression.replace(/\bvalue\b/g, value?.toString() || '0'));
            }
        }
        catch {
            // Fallback to original value
        }
        return value;
    }
    async applyCustomFunction(functionName, value, context) {
        const customFunction = this.customFunctions.get(functionName);
        if (!customFunction) {
            this.logger.warn('Custom function not found', { functionName });
            return value;
        }
        try {
            return await customFunction(value, context);
        }
        catch (error) {
            this.logger.error('Custom function execution failed', {
                functionName,
                error,
            });
            return value;
        }
    }
    convertDataType(value, targetType) {
        if (value === null || value === undefined)
            return null;
        switch (targetType) {
            case MigrationTypes_1.DataType.STRING:
                return value.toString();
            case MigrationTypes_1.DataType.NUMBER:
                return Number(value) || 0;
            case MigrationTypes_1.DataType.BOOLEAN:
                return Boolean(value);
            case MigrationTypes_1.DataType.DATE:
                return new Date(value).toISOString().split('T')[0];
            case MigrationTypes_1.DataType.DATETIME:
                return new Date(value).toISOString();
            default:
                return value;
        }
    }
    inferDataType(records, fieldName) {
        const sampleValues = records
            .slice(0, 10)
            .map(r => r[fieldName])
            .filter(v => v != null);
        if (sampleValues.length === 0)
            return MigrationTypes_1.DataType.STRING;
        const firstValue = sampleValues[0];
        if (typeof firstValue === 'boolean')
            return MigrationTypes_1.DataType.BOOLEAN;
        if (typeof firstValue === 'number')
            return MigrationTypes_1.DataType.NUMBER;
        if (typeof firstValue === 'string') {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(firstValue))
                return MigrationTypes_1.DataType.DATETIME;
            if (/^\d{4}-\d{2}-\d{2}$/.test(firstValue))
                return MigrationTypes_1.DataType.DATE;
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(firstValue))
                return MigrationTypes_1.DataType.EMAIL;
            if (/^[\+]?[1-9][\d]{0,15}$/.test(firstValue.replace(/\D/g, '')))
                return MigrationTypes_1.DataType.PHONE;
        }
        return MigrationTypes_1.DataType.STRING;
    }
    identifyMappingIssues(fieldName, sampleRecords) {
        const issues = [];
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
    suggestTransformation(sourceType, targetField) {
        // Suggest transformations based on field types and names
        if (targetField.includes('phone') || targetField.includes('Phone')) {
            return {
                field: targetField,
                type: MigrationTypes_1.TransformationType.FORMAT,
                parameters: { format: 'phone' },
            };
        }
        if (targetField.includes('email') || targetField.includes('Email')) {
            return {
                field: targetField,
                type: MigrationTypes_1.TransformationType.FORMAT,
                parameters: { format: 'lowercase' },
            };
        }
        return undefined;
    }
    getMappingRule(entityType) {
        return this.config.rules.find(rule => rule.targetEntity === entityType);
    }
    /**
     * Register a custom transformation function
     */
    registerCustomFunction(name, func) {
        this.customFunctions.set(name, func);
    }
    /**
     * Get mapping statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalRecords: 0,
            mappedRecords: 0,
            failedRecords: 0,
            transformedFields: 0,
            skippedFields: 0,
            validationErrors: 0,
        };
    }
}
exports.MappingEngine = MappingEngine;
//# sourceMappingURL=MappingEngine.js.map