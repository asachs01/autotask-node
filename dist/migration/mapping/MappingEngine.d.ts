/**
 * Advanced Data Mapping Engine for PSA Migration
 * Handles field mapping, transformations, and AI-assisted suggestions
 */
import { EventEmitter } from 'events';
import { MappingRule, FieldTransformation, CustomTransformation, TransformationContext, ValidationResult, DataType } from '../types/MigrationTypes';
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
export declare class MappingEngine extends EventEmitter {
    private config;
    private logger;
    private customFunctions;
    private cache;
    private stats;
    constructor(config: MappingConfig);
    /**
     * Transform a batch of records using mapping rules
     */
    transformBatch(entityType: string, records: any[]): Promise<any[]>;
    /**
     * Transform a single record
     */
    transformRecord(mappingRule: MappingRule, record: any, context: TransformationContext): Promise<any>;
    /**
     * Transform a single field
     */
    private transformField;
    /**
     * Apply a transformation to a value
     */
    private applyTransformation;
    /**
     * Apply mapping conditions
     */
    private applyConditions;
    /**
     * Evaluate a mapping condition
     */
    private evaluateCondition;
    /**
     * Validate a field value
     */
    validateField(value: any, validationRules: any[]): ValidationResult;
    /**
     * Validate a transformed record
     */
    validateRecord(entityType: string, record: any): Promise<ValidationResult>;
    /**
     * Analyze source fields and suggest mappings
     */
    analyzeFields(entityType: string, sampleRecords: any[]): FieldAnalysis[];
    /**
     * Generate AI-assisted mapping suggestions
     */
    private generateMappingSuggestions;
    private formatValue;
    private convertValue;
    private splitValue;
    private mergeValue;
    private lookupValue;
    private calculateValue;
    private applyCustomFunction;
    private convertDataType;
    private inferDataType;
    private identifyMappingIssues;
    private suggestTransformation;
    private getMappingRule;
    /**
     * Register a custom transformation function
     */
    registerCustomFunction(name: string, func: (...args: any[]) => any): void;
    /**
     * Get mapping statistics
     */
    getStats(): MappingStats;
    /**
     * Reset statistics
     */
    resetStats(): void;
}
//# sourceMappingURL=MappingEngine.d.ts.map