"use strict";
/**
 * Pre-Migration Validator
 * Performs comprehensive validation before migration begins
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreMigrationValidator = void 0;
const logger_1 = require("../../utils/logger");
const url_1 = require("url");
const MigrationTypes_1 = require("../types/MigrationTypes");
class PreMigrationValidator {
    constructor(sourceConnector) {
        this.sourceConnector = sourceConnector;
        this.logger = (0, logger_1.createLogger)('PreMigrationValidator');
    }
    /**
     * Perform comprehensive pre-migration validation
     */
    async validate(entities, config, options = {}) {
        const validationOptions = {
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
        const errors = [];
        const warnings = [];
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
                        const qualityReport = await this.assessDataQuality(entity, validationOptions.sampleSize);
                        const qualityValidation = this.processDataQualityReport(qualityReport);
                        errors.push(...qualityValidation.errors);
                        warnings.push(...qualityValidation.warnings);
                        score -= (100 - qualityReport.qualityScore) * 0.3;
                    }
                    catch (error) {
                        this.logger.warn('Data quality assessment failed for entity', { entity, error });
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        errors.push({
                            field: entity,
                            message: `Data quality assessment failed: ${errorMessage}`,
                            code: 'QUALITY_ASSESSMENT_FAILED',
                            severity: MigrationTypes_1.ErrorSeverity.MEDIUM
                        });
                    }
                }
            }
            // Cap score at minimum of 0
            score = Math.max(0, Math.round(score));
            const result = {
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
        }
        catch (error) {
            this.logger.error('Pre-migration validation failed', error);
            return {
                isValid: false,
                errors: [{
                        field: 'validation',
                        message: `Validation process failed: ${error instanceof Error ? error.message : String(error)}`,
                        code: 'VALIDATION_FAILED',
                        severity: MigrationTypes_1.ErrorSeverity.CRITICAL
                    }],
                warnings: []
            };
        }
    }
    /**
     * Test connectivity to source and target systems
     */
    async testConnectivity() {
        const result = {
            source: false,
            target: false
        };
        // Test source connectivity
        try {
            const startTime = Date.now();
            result.source = await this.sourceConnector.testConnection();
            result.sourceLatency = Date.now() - startTime;
        }
        catch (error) {
            result.sourceError = error instanceof Error ? error.message : String(error);
        }
        // Test target connectivity (would need target client)
        // For now, assume target is available
        result.target = true;
        return result;
    }
    /**
     * Validate entity schemas compatibility
     */
    async validateSchemas(entities, config) {
        const result = {
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
                const issues = [];
                const missingFields = [];
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
                }
                else {
                    result.compatibleEntities.push(entity);
                }
            }
            catch (error) {
                result.incompatibleEntities.push({
                    entity,
                    issues: [`Schema validation failed: ${error instanceof Error ? error.message : String(error)}`]
                });
            }
        }
        return result;
    }
    /**
     * Check entity dependencies
     */
    async checkDependencies(entities) {
        const result = {
            missingDependencies: [],
            circularDependencies: [],
            unresolvedReferences: []
        };
        // Build dependency graph
        const dependencyGraph = new Map();
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
            }
            catch (error) {
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
    async assessDataQuality(entity, sampleSize) {
        this.logger.info('Assessing data quality', { entity, sampleSize });
        try {
            // Use the connector's built-in data quality validation
            return await this.sourceConnector.validateDataQuality(entity);
        }
        catch (error) {
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
    performBasicQualityAssessment(entity, schema, records) {
        const issues = [];
        let qualityScore = 100;
        // Check completeness
        for (const field of schema.fields.filter((f) => f.required)) {
            const missingCount = records.filter(r => !r[field.name] || r[field.name] === '').length;
            const percentage = (missingCount / records.length) * 100;
            if (percentage > 0) {
                issues.push({
                    type: MigrationTypes_1.QualityIssueType.MISSING_VALUE,
                    field: field.name,
                    count: missingCount,
                    percentage,
                    examples: records.filter(r => !r[field.name]).slice(0, 5),
                    severity: percentage > 50 ? MigrationTypes_1.IssueSeverity.CRITICAL :
                        percentage > 20 ? MigrationTypes_1.IssueSeverity.ERROR : MigrationTypes_1.IssueSeverity.WARNING
                });
                qualityScore -= percentage * 0.5;
            }
        }
        // Check format validity
        for (const field of schema.fields.filter((f) => f.format)) {
            const invalidRecords = records.filter(r => r[field.name] && !this.validateFormat(r[field.name], field.format));
            const percentage = (invalidRecords.length / records.length) * 100;
            if (percentage > 0) {
                issues.push({
                    type: MigrationTypes_1.QualityIssueType.INVALID_FORMAT,
                    field: field.name,
                    count: invalidRecords.length,
                    percentage,
                    examples: invalidRecords.slice(0, 5),
                    severity: percentage > 30 ? MigrationTypes_1.IssueSeverity.ERROR : MigrationTypes_1.IssueSeverity.WARNING
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
                validity: 85 // Placeholder
            }
        };
    }
    // Helper methods
    validateConnectivity(result) {
        const errors = [];
        const warnings = [];
        if (!result.source) {
            errors.push({
                field: 'connectivity',
                message: `Source system connectivity failed: ${result.sourceError || 'Unknown error'}`,
                code: 'SOURCE_CONNECTIVITY_FAILED',
                severity: MigrationTypes_1.ErrorSeverity.CRITICAL
            });
        }
        if (!result.target) {
            errors.push({
                field: 'connectivity',
                message: `Target system connectivity failed: ${result.targetError || 'Unknown error'}`,
                code: 'TARGET_CONNECTIVITY_FAILED',
                severity: MigrationTypes_1.ErrorSeverity.CRITICAL
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
    processSchemaValidation(result) {
        const errors = [];
        const warnings = [];
        for (const incompatible of result.incompatibleEntities) {
            errors.push({
                field: incompatible.entity,
                message: `Schema incompatibility: ${incompatible.issues.join(', ')}`,
                code: 'SCHEMA_INCOMPATIBLE',
                severity: MigrationTypes_1.ErrorSeverity.HIGH
            });
        }
        for (const missing of result.missingFields) {
            errors.push({
                field: missing.entity,
                message: `Missing source fields: ${missing.fields.join(', ')}`,
                code: 'MISSING_SOURCE_FIELDS',
                severity: MigrationTypes_1.ErrorSeverity.HIGH
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
    processDependencyCheck(result) {
        const errors = [];
        const warnings = [];
        for (const missing of result.missingDependencies) {
            errors.push({
                field: 'dependencies',
                message: missing,
                code: 'MISSING_DEPENDENCY',
                severity: MigrationTypes_1.ErrorSeverity.HIGH
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
    processDataQualityReport(report) {
        const errors = [];
        const warnings = [];
        if (report.qualityScore < 50) {
            errors.push({
                field: report.entityType,
                message: `Poor data quality score: ${report.qualityScore}%`,
                code: 'POOR_DATA_QUALITY',
                severity: MigrationTypes_1.ErrorSeverity.HIGH,
                context: report
            });
        }
        else if (report.qualityScore < 80) {
            warnings.push({
                field: report.entityType,
                message: `Moderate data quality concerns: ${report.qualityScore}%`,
                code: 'MODERATE_DATA_QUALITY',
                recommendation: 'Review data quality issues before migration'
            });
        }
        // Process individual issues
        for (const issue of report.issues) {
            if (issue.severity === MigrationTypes_1.IssueSeverity.CRITICAL || issue.severity === MigrationTypes_1.IssueSeverity.ERROR) {
                errors.push({
                    field: `${report.entityType}.${issue.field}`,
                    message: `${issue.type}: ${issue.percentage.toFixed(1)}% of records affected`,
                    code: issue.type.toUpperCase(),
                    severity: issue.severity === MigrationTypes_1.IssueSeverity.CRITICAL ? MigrationTypes_1.ErrorSeverity.CRITICAL : MigrationTypes_1.ErrorSeverity.HIGH
                });
            }
            else {
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
    generateRecommendations(errors, warnings) {
        const recommendations = [];
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
    isTypeConflict(sourceType, targetType) {
        // Simple type compatibility check
        const compatibilityMap = {
            'string': ['string', 'email', 'phone', 'url'],
            'number': ['number', 'string'],
            'boolean': ['boolean', 'string'],
            'date': ['date', 'datetime', 'string'],
            'datetime': ['datetime', 'date', 'string']
        };
        const compatible = compatibilityMap[sourceType.toLowerCase()] || [];
        return !compatible.includes(targetType.toLowerCase());
    }
    findCircularDependencies(graph) {
        const circular = [];
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (entity, path) => {
            if (recursionStack.has(entity)) {
                const cycleStart = path.indexOf(entity);
                circular.push([...path.slice(cycleStart), entity]);
                return;
            }
            if (visited.has(entity))
                return;
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
    validateFormat(value, format) {
        if (!value)
            return true;
        const str = value.toString();
        switch (format) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
            case 'phone':
                return /^[+]?[1-9][\d]{0,15}$/.test(str.replace(/\D/g, ''));
            case 'url':
                try {
                    new url_1.URL(str);
                    return true;
                }
                catch {
                    return false;
                }
            case 'date':
                return !isNaN(Date.parse(str));
            default:
                return true;
        }
    }
    calculateCompleteness(schema, records) {
        const requiredFields = schema.fields.filter((f) => f.required);
        if (requiredFields.length === 0)
            return 100;
        const totalRequired = requiredFields.length * records.length;
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
    calculateAccuracy(schema, records) {
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
    generateQualityRecommendations(issues) {
        const recommendations = [];
        for (const issue of issues) {
            switch (issue.type) {
                case MigrationTypes_1.QualityIssueType.MISSING_VALUE:
                    recommendations.push(`Address missing values in ${issue.field} (${issue.percentage.toFixed(1)}% affected)`);
                    break;
                case MigrationTypes_1.QualityIssueType.INVALID_FORMAT:
                    recommendations.push(`Fix format issues in ${issue.field} (${issue.percentage.toFixed(1)}% affected)`);
                    break;
                case MigrationTypes_1.QualityIssueType.INCONSISTENT_DATA:
                    recommendations.push(`Standardize data format in ${issue.field}`);
                    break;
                default:
                    recommendations.push(`Review data quality for ${issue.field}`);
            }
        }
        return recommendations;
    }
}
exports.PreMigrationValidator = PreMigrationValidator;
//# sourceMappingURL=PreMigrationValidator.js.map