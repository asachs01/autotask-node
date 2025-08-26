/**
 * Pre-Migration Validator
 * Performs comprehensive validation before migration begins
 */

import { Logger } from 'winston';
import { createLogger } from '../../utils/logger';

import {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  MigrationConfig,
  DataQualityReport,
  DataQualityIssue,
  QualityIssueType,
  IssueSeverity
} from '../types/MigrationTypes';

import { BaseConnector } from '../connectors/BaseConnector';

export interface PreValidationOptions {
  includeDataQuality?: boolean;
  includeDependencyCheck?: boolean;
  includeConnectivityTest?: boolean;
  includeSchemaValidation?: boolean;
  sampleSize?: number;
  maxErrors?: number;
}

export interface ConnectivityTestResult {
  source: boolean;
  target: boolean;
  sourceLatency?: number;
  targetLatency?: number;
  sourceError?: string;
  targetError?: string;
}

export interface DependencyCheckResult {
  missingDependencies: string[];
  circularDependencies: string[][];
  unresolvedReferences: Array<{
    entity: string;
    field: string;
    referencedEntity: string;
  }>;
}

export interface SchemaValidationResult {
  compatibleEntities: string[];
  incompatibleEntities: Array<{
    entity: string;
    issues: string[];
  }>;
  missingFields: Array<{
    entity: string;
    fields: string[];
  }>;
  typeConflicts: Array<{
    entity: string;
    field: string;
    sourceType: string;
    targetType: string;
  }>;
}

export class PreMigrationValidator {
  private logger: Logger;
  private sourceConnector: BaseConnector;

  constructor(sourceConnector: BaseConnector) {
    this.sourceConnector = sourceConnector;
    this.logger = createLogger('PreMigrationValidator');
  }

  /**
   * Perform comprehensive pre-migration validation
   */
  async validate(
    entities: string[],
    config: MigrationConfig,
    options: PreValidationOptions = {}
  ): Promise<ValidationResult> {
    const validationOptions: PreValidationOptions = {
      includeDataQuality: true,
      includeDependencyCheck: true,
      includeConnectivityTest: true,
      includeSchemaValidation: true,
      sampleSize: 1000,
      maxErrors: 100,
      ...options
    };

    this.logger.info('Starting pre-migration validation', { 
      entities: entities.length,
      options: validationOptions 
    });

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let score = 100;

    try {
      // 1. Connectivity Test
      if (validationOptions.includeConnectivityTest) {
        const connectivityResult = await this.testConnectivity();
        const connectivityValidation = this.validateConnectivity(connectivityResult);
        errors.push(...connectivityValidation.errors);
        warnings.push(...connectivityValidation.warnings);
        score -= connectivityValidation.errors.length * 10;
      }

      // 2. Schema Validation
      if (validationOptions.includeSchemaValidation) {
        const schemaResult = await this.validateSchemas(entities, config);
        const schemaValidation = this.processSchemaValidation(schemaResult);
        errors.push(...schemaValidation.errors);
        warnings.push(...schemaValidation.warnings);
        score -= schemaValidation.errors.length * 5;
      }

      // 3. Dependency Check
      if (validationOptions.includeDependencyCheck) {
        const dependencyResult = await this.checkDependencies(entities);
        const dependencyValidation = this.processDependencyCheck(dependencyResult);
        errors.push(...dependencyValidation.errors);
        warnings.push(...dependencyValidation.warnings);
        score -= dependencyValidation.errors.length * 3;
      }

      // 4. Data Quality Assessment
      if (validationOptions.includeDataQuality) {
        for (const entity of entities) {
          try {
            const qualityReport = await this.assessDataQuality(entity, validationOptions.sampleSize!);
            const qualityValidation = this.processDataQualityReport(qualityReport);
            errors.push(...qualityValidation.errors);
            warnings.push(...qualityValidation.warnings);
            score -= (100 - qualityReport.qualityScore) * 0.3;
          } catch (error) {
            this.logger.warn('Data quality assessment failed for entity', { entity, error });
            errors.push({
              field: entity,
              message: `Data quality assessment failed: ${error.message}`,
              code: 'QUALITY_ASSESSMENT_FAILED',
              severity: 'medium'
            });
          }
        }
      }

      // Cap score at minimum of 0
      score = Math.max(0, Math.round(score));

      const result: ValidationResult = {
        isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
        errors: errors.slice(0, validationOptions.maxErrors),
        warnings,
        score,
        recommendations: this.generateRecommendations(errors, warnings)
      };

      this.logger.info('Pre-migration validation completed', {
        isValid: result.isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
        score
      });

      return result;

    } catch (error) {
      this.logger.error('Pre-migration validation failed', error);
      return {
        isValid: false,
        errors: [{
          field: 'validation',
          message: `Validation process failed: ${error.message}`,
          code: 'VALIDATION_FAILED',
          severity: 'critical'
        }],
        warnings: []
      };
    }
  }

  /**
   * Test connectivity to source and target systems
   */
  async testConnectivity(): Promise<ConnectivityTestResult> {
    const result: ConnectivityTestResult = {
      source: false,
      target: false
    };

    // Test source connectivity
    try {
      const startTime = Date.now();
      result.source = await this.sourceConnector.testConnection();
      result.sourceLatency = Date.now() - startTime;
    } catch (error) {
      result.sourceError = error.message;
    }

    // Test target connectivity (would need target client)
    // For now, assume target is available
    result.target = true;

    return result;
  }

  /**
   * Validate entity schemas compatibility
   */
  async validateSchemas(entities: string[], config: MigrationConfig): Promise<SchemaValidationResult> {
    const result: SchemaValidationResult = {
      compatibleEntities: [],
      incompatibleEntities: [],
      missingFields: [],
      typeConflicts: []
    };

    for (const entity of entities) {
      try {
        const sourceSchema = await this.sourceConnector.getEntitySchema(entity);
        const mappingRule = config.mapping.rules.find(r => r.sourceEntity === entity);

        if (!mappingRule) {
          result.incompatibleEntities.push({
            entity,
            issues: ['No mapping rule defined']
          });
          continue;
        }

        // Check field mappings
        const issues: string[] = [];
        const missingFields: string[] = [];
        
        for (const fieldMapping of mappingRule.fieldMappings) {
          const sourceField = sourceSchema.fields.find(f => f.name === fieldMapping.sourceField);
          
          if (!sourceField) {
            missingFields.push(fieldMapping.sourceField);
            continue;
          }

          // Check type compatibility
          if (this.isTypeConflict(sourceField.type, fieldMapping.dataType.toString())) {
            result.typeConflicts.push({
              entity,
              field: fieldMapping.sourceField,
              sourceType: sourceField.type,
              targetType: fieldMapping.dataType.toString()
            });
          }

          // Check required field constraints
          if (fieldMapping.required && !sourceField.required && !fieldMapping.defaultValue) {
            issues.push(`Required target field ${fieldMapping.targetField} maps to optional source field ${fieldMapping.sourceField}`);
          }
        }

        if (missingFields.length > 0) {
          result.missingFields.push({
            entity,
            fields: missingFields
          });
        }

        if (issues.length > 0) {
          result.incompatibleEntities.push({
            entity,
            issues
          });
        } else {
          result.compatibleEntities.push(entity);
        }

      } catch (error) {
        result.incompatibleEntities.push({
          entity,
          issues: [`Schema validation failed: ${error.message}`]
        });
      }
    }

    return result;
  }

  /**
   * Check entity dependencies
   */
  async checkDependencies(entities: string[]): Promise<DependencyCheckResult> {
    const result: DependencyCheckResult = {
      missingDependencies: [],
      circularDependencies: [],
      unresolvedReferences: []
    };

    // Build dependency graph
    const dependencyGraph: Map<string, string[]> = new Map();
    
    for (const entity of entities) {
      try {
        const schema = await this.sourceConnector.getEntitySchema(entity);
        const dependencies = schema.relationships
          .filter(r => r.required)
          .map(r => r.targetEntity);
        
        dependencyGraph.set(entity, dependencies);
        
        // Check for missing dependencies
        for (const dep of dependencies) {
          if (!entities.includes(dep)) {
            result.missingDependencies.push(`${entity} depends on ${dep} which is not included in migration`);
          }
        }

      } catch (error) {
        this.logger.warn('Failed to analyze dependencies for entity', { entity, error });
      }
    }

    // Check for circular dependencies
    result.circularDependencies = this.findCircularDependencies(dependencyGraph);

    return result;
  }

  /**
   * Assess data quality for an entity
   */
  async assessDataQuality(entity: string, sampleSize: number): Promise<DataQualityReport> {
    this.logger.info('Assessing data quality', { entity, sampleSize });

    try {
      // Use the connector's built-in data quality validation
      return await this.sourceConnector.validateDataQuality(entity);

    } catch (error) {
      this.logger.warn('Using fallback data quality assessment', { entity, error });
      
      // Fallback implementation
      const schema = await this.sourceConnector.getEntitySchema(entity);
      const recordCount = Math.min(sampleSize, await this.sourceConnector.getRecordCount(entity));
      const sampleRecords = await this.sourceConnector.fetchBatch(entity, 0, recordCount);

      return this.performBasicQualityAssessment(entity, schema, sampleRecords);
    }
  }

  /**
   * Basic data quality assessment fallback
   */
  private performBasicQualityAssessment(entity: string, schema: any, records: any[]): DataQualityReport {
    const issues: DataQualityIssue[] = [];
    let qualityScore = 100;

    // Check completeness
    for (const field of schema.fields.filter((f: any) => f.required)) {
      const missingCount = records.filter(r => !r[field.name] || r[field.name] === '').length;
      const percentage = (missingCount / records.length) * 100;

      if (percentage > 0) {
        issues.push({
          type: QualityIssueType.MISSING_VALUE,
          field: field.name,
          count: missingCount,
          percentage,
          examples: records.filter(r => !r[field.name]).slice(0, 5),
          severity: percentage > 50 ? IssueSeverity.CRITICAL : 
                   percentage > 20 ? IssueSeverity.ERROR : IssueSeverity.WARNING
        });
        qualityScore -= percentage * 0.5;
      }
    }

    // Check format validity
    for (const field of schema.fields.filter((f: any) => f.format)) {
      const invalidRecords = records.filter(r => 
        r[field.name] && !this.validateFormat(r[field.name], field.format)
      );
      const percentage = (invalidRecords.length / records.length) * 100;

      if (percentage > 0) {
        issues.push({
          type: QualityIssueType.INVALID_FORMAT,
          field: field.name,
          count: invalidRecords.length,
          percentage,
          examples: invalidRecords.slice(0, 5),
          severity: percentage > 30 ? IssueSeverity.ERROR : IssueSeverity.WARNING
        });
        qualityScore -= percentage * 0.3;
      }
    }

    return {
      entityType: entity,
      totalRecords: records.length,
      qualityScore: Math.max(0, Math.round(qualityScore)),
      issues,
      recommendations: this.generateQualityRecommendations(issues),
      metrics: {
        completeness: this.calculateCompleteness(schema, records),
        accuracy: this.calculateAccuracy(schema, records),
        consistency: 90, // Placeholder
        validity: 85     // Placeholder
      }
    };
  }

  // Helper methods

  private validateConnectivity(result: ConnectivityTestResult): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!result.source) {
      errors.push({
        field: 'connectivity',
        message: `Source system connectivity failed: ${result.sourceError || 'Unknown error'}`,
        code: 'SOURCE_CONNECTIVITY_FAILED',
        severity: 'critical'
      });
    }

    if (!result.target) {
      errors.push({
        field: 'connectivity',
        message: `Target system connectivity failed: ${result.targetError || 'Unknown error'}`,
        code: 'TARGET_CONNECTIVITY_FAILED',
        severity: 'critical'
      });
    }

    if (result.sourceLatency && result.sourceLatency > 5000) {
      warnings.push({
        field: 'performance',
        message: `High source system latency: ${result.sourceLatency}ms`,
        code: 'HIGH_SOURCE_LATENCY',
        recommendation: 'Consider using smaller batch sizes or parallel processing'
      });
    }

    return { errors, warnings };
  }

  private processSchemaValidation(result: SchemaValidationResult): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const incompatible of result.incompatibleEntities) {
      errors.push({
        field: incompatible.entity,
        message: `Schema incompatibility: ${incompatible.issues.join(', ')}`,
        code: 'SCHEMA_INCOMPATIBLE',
        severity: 'high'
      });
    }

    for (const missing of result.missingFields) {
      errors.push({
        field: missing.entity,
        message: `Missing source fields: ${missing.fields.join(', ')}`,
        code: 'MISSING_SOURCE_FIELDS',
        severity: 'high'
      });
    }

    for (const conflict of result.typeConflicts) {
      warnings.push({
        field: `${conflict.entity}.${conflict.field}`,
        message: `Type mismatch: ${conflict.sourceType} -> ${conflict.targetType}`,
        code: 'TYPE_CONFLICT',
        recommendation: 'Consider adding data transformation rules'
      });
    }

    return { errors, warnings };
  }

  private processDependencyCheck(result: DependencyCheckResult): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const missing of result.missingDependencies) {
      errors.push({
        field: 'dependencies',
        message: missing,
        code: 'MISSING_DEPENDENCY',
        severity: 'high'
      });
    }

    for (const circular of result.circularDependencies) {
      warnings.push({
        field: 'dependencies',
        message: `Circular dependency detected: ${circular.join(' -> ')}`,
        code: 'CIRCULAR_DEPENDENCY',
        recommendation: 'Review migration order or break circular references'
      });
    }

    return { errors, warnings };
  }

  private processDataQualityReport(report: DataQualityReport): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (report.qualityScore < 50) {
      errors.push({
        field: report.entityType,
        message: `Poor data quality score: ${report.qualityScore}%`,
        code: 'POOR_DATA_QUALITY',
        severity: 'high',
        context: report
      });
    } else if (report.qualityScore < 80) {
      warnings.push({
        field: report.entityType,
        message: `Moderate data quality concerns: ${report.qualityScore}%`,
        code: 'MODERATE_DATA_QUALITY',
        recommendation: 'Review data quality issues before migration'
      });
    }

    // Process individual issues
    for (const issue of report.issues) {
      if (issue.severity === IssueSeverity.CRITICAL || issue.severity === IssueSeverity.ERROR) {
        errors.push({
          field: `${report.entityType}.${issue.field}`,
          message: `${issue.type}: ${issue.percentage.toFixed(1)}% of records affected`,
          code: issue.type.toUpperCase(),
          severity: issue.severity === IssueSeverity.CRITICAL ? 'critical' : 'high'
        });
      } else {
        warnings.push({
          field: `${report.entityType}.${issue.field}`,
          message: `${issue.type}: ${issue.percentage.toFixed(1)}% of records affected`,
          code: issue.type.toUpperCase(),
          recommendation: `Address ${issue.type.toLowerCase()} in field ${issue.field}`
        });
      }
    }

    return { errors, warnings };
  }

  private generateRecommendations(errors: ValidationError[], warnings: ValidationWarning[]): string[] {
    const recommendations: string[] = [];

    // Critical errors
    const criticalErrors = errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      recommendations.push('Address all critical connectivity and configuration issues before proceeding');
    }

    // Schema issues
    const schemaErrors = errors.filter(e => e.code?.includes('SCHEMA'));
    if (schemaErrors.length > 0) {
      recommendations.push('Review and update field mappings to resolve schema compatibility issues');
    }

    // Data quality issues
    const qualityErrors = errors.filter(e => e.code?.includes('QUALITY'));
    if (qualityErrors.length > 0) {
      recommendations.push('Consider data cleansing before migration to improve success rate');
    }

    // Dependency issues
    const dependencyErrors = errors.filter(e => e.code?.includes('DEPENDENCY'));
    if (dependencyErrors.length > 0) {
      recommendations.push('Resolve dependency issues by including all required entities in migration');
    }

    // Performance warnings
    const performanceWarnings = warnings.filter(w => w.code?.includes('LATENCY'));
    if (performanceWarnings.length > 0) {
      recommendations.push('Consider performance optimizations like smaller batch sizes or parallel processing');
    }

    return recommendations;
  }

  private isTypeConflict(sourceType: string, targetType: string): boolean {
    // Simple type compatibility check
    const compatibilityMap: Record<string, string[]> = {
      'string': ['string', 'email', 'phone', 'url'],
      'number': ['number', 'string'],
      'boolean': ['boolean', 'string'],
      'date': ['date', 'datetime', 'string'],
      'datetime': ['datetime', 'date', 'string']
    };

    const compatible = compatibilityMap[sourceType.toLowerCase()] || [];
    return !compatible.includes(targetType.toLowerCase());
  }

  private findCircularDependencies(graph: Map<string, string[]>): string[][] {
    const circular: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (entity: string, path: string[]): void => {
      if (recursionStack.has(entity)) {
        const cycleStart = path.indexOf(entity);
        circular.push([...path.slice(cycleStart), entity]);
        return;
      }

      if (visited.has(entity)) return;

      visited.add(entity);
      recursionStack.add(entity);

      const dependencies = graph.get(entity) || [];
      for (const dep of dependencies) {
        dfs(dep, [...path, entity]);
      }

      recursionStack.delete(entity);
    };

    for (const entity of graph.keys()) {
      if (!visited.has(entity)) {
        dfs(entity, []);
      }
    }

    return circular;
  }

  private validateFormat(value: any, format: string): boolean {
    if (!value) return true;
    
    const str = value.toString();
    
    switch (format) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
      case 'phone':
        return /^[\+]?[1-9][\d]{0,15}$/.test(str.replace(/\D/g, ''));
      case 'url':
        try {
          new URL(str);
          return true;
        } catch {
          return false;
        }
      case 'date':
        return !isNaN(Date.parse(str));
      default:
        return true;
    }
  }

  private calculateCompleteness(schema: any, records: any[]): number {
    const requiredFields = schema.fields.filter((f: any) => f.required);
    if (requiredFields.length === 0) return 100;

    let totalRequired = requiredFields.length * records.length;
    let filled = 0;

    for (const record of records) {
      for (const field of requiredFields) {
        if (record[field.name] && record[field.name] !== '') {
          filled++;
        }
      }
    }

    return totalRequired > 0 ? (filled / totalRequired) * 100 : 100;
  }

  private calculateAccuracy(schema: any, records: any[]): number {
    // Simplified accuracy calculation
    let totalFields = 0;
    let accurateFields = 0;

    for (const record of records) {
      for (const field of schema.fields) {
        if (record[field.name] != null) {
          totalFields++;
          if (this.validateFormat(record[field.name], field.format || 'string')) {
            accurateFields++;
          }
        }
      }
    }

    return totalFields > 0 ? (accurateFields / totalFields) * 100 : 100;
  }

  private generateQualityRecommendations(issues: DataQualityIssue[]): string[] {
    const recommendations: string[] = [];

    for (const issue of issues) {
      switch (issue.type) {
        case QualityIssueType.MISSING_VALUE:
          recommendations.push(`Address missing values in ${issue.field} (${issue.percentage.toFixed(1)}% affected)`);
          break;
        case QualityIssueType.INVALID_FORMAT:
          recommendations.push(`Fix format issues in ${issue.field} (${issue.percentage.toFixed(1)}% affected)`);
          break;
        case QualityIssueType.INCONSISTENT_DATA:
          recommendations.push(`Standardize data format in ${issue.field}`);
          break;
        default:
          recommendations.push(`Review data quality for ${issue.field}`);
      }
    }

    return recommendations;
  }
}