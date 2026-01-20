/**
 * Pre-Migration Validator
 * Performs comprehensive validation before migration begins
 */
import { ValidationResult, MigrationConfig, DataQualityReport } from '../types/MigrationTypes';
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
export declare class PreMigrationValidator {
    private logger;
    private sourceConnector;
    constructor(sourceConnector: BaseConnector);
    /**
     * Perform comprehensive pre-migration validation
     */
    validate(entities: string[], config: MigrationConfig, options?: PreValidationOptions): Promise<ValidationResult>;
    /**
     * Test connectivity to source and target systems
     */
    testConnectivity(): Promise<ConnectivityTestResult>;
    /**
     * Validate entity schemas compatibility
     */
    validateSchemas(entities: string[], config: MigrationConfig): Promise<SchemaValidationResult>;
    /**
     * Check entity dependencies
     */
    checkDependencies(entities: string[]): Promise<DependencyCheckResult>;
    /**
     * Assess data quality for an entity
     */
    assessDataQuality(entity: string, sampleSize: number): Promise<DataQualityReport>;
    /**
     * Basic data quality assessment fallback
     */
    private performBasicQualityAssessment;
    private validateConnectivity;
    private processSchemaValidation;
    private processDependencyCheck;
    private processDataQualityReport;
    private generateRecommendations;
    private isTypeConflict;
    private findCircularDependencies;
    private validateFormat;
    private calculateCompleteness;
    private calculateAccuracy;
    private generateQualityRecommendations;
}
//# sourceMappingURL=PreMigrationValidator.d.ts.map