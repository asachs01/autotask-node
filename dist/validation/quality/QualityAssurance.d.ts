/**
 * Comprehensive data quality assurance system
 * Validates data completeness, accuracy, consistency, validity, uniqueness, and timeliness
 */
import winston from 'winston';
import { ValidationResult, ValidationContext, QualityMetrics, QualityRule, QualityIssue } from '../types/ValidationTypes';
export interface QualityProfile {
    entityType: string;
    version: string;
    rules: QualityRule[];
    thresholds: QualityThresholds;
    weights: QualityWeights;
    benchmarks: QualityBenchmarks;
}
export interface QualityThresholds {
    completeness: number;
    accuracy: number;
    consistency: number;
    validity: number;
    uniqueness: number;
    timeliness: number;
    overall: number;
}
export interface QualityWeights {
    completeness: number;
    accuracy: number;
    consistency: number;
    validity: number;
    uniqueness: number;
    timeliness: number;
}
export interface QualityBenchmarks {
    industry: Record<string, number>;
    historical: Record<string, number>;
    targets: Record<string, number>;
}
export interface QualityReport {
    entityType: string;
    timestamp: Date;
    sampleSize: number;
    metrics: QualityMetrics;
    issues: QualityIssue[];
    recommendations: QualityRecommendation[];
    trends: QualityTrend[];
    benchmark: QualityBenchmarkComparison;
}
export interface QualityRecommendation {
    category: 'completeness' | 'accuracy' | 'consistency' | 'validity' | 'uniqueness' | 'timeliness';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    action: string;
    estimatedImpact: number;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
}
export interface QualityTrend {
    metric: string;
    direction: 'improving' | 'declining' | 'stable';
    changeRate: number;
    period: string;
    significance: 'low' | 'medium' | 'high';
}
export interface QualityBenchmarkComparison {
    vsIndustry: Record<string, number>;
    vsHistorical: Record<string, number>;
    vsTargets: Record<string, number>;
}
export interface DuplicateDetectionConfig {
    fuzzyMatching: boolean;
    similarityThreshold: number;
    fields: string[];
    algorithms: ('exact' | 'levenshtein' | 'jaccard' | 'cosine')[];
    caseSensitive: boolean;
    ignoreWhitespace: boolean;
}
export interface DataProfilingResult {
    field: string;
    dataType: string;
    nullCount: number;
    nullPercentage: number;
    uniqueCount: number;
    uniquePercentage: number;
    minLength?: number;
    maxLength?: number;
    avgLength?: number;
    commonValues: Array<{
        value: any;
        count: number;
        percentage: number;
    }>;
    patterns: Array<{
        pattern: string;
        count: number;
        percentage: number;
    }>;
    qualityScore: number;
    issues: string[];
}
export declare class QualityAssurance {
    private logger;
    private qualityProfiles;
    private qualityHistory;
    private duplicateCache;
    private profilingCache;
    constructor(logger: winston.Logger);
    /**
     * Validate data quality for an entity
     */
    validate(entity: any, context: ValidationContext): Promise<ValidationResult>;
    /**
     * Generate comprehensive quality report
     */
    generateQualityReport(entities: any[], entityType: string): Promise<QualityReport>;
    /**
     * Detect duplicate records
     */
    detectDuplicates(entities: any[], config: DuplicateDetectionConfig): Promise<Array<{
        record1: any;
        record2: any;
        similarity: number;
        matchingFields: string[];
        algorithm: string;
    }>>;
    /**
     * Profile data to understand structure and quality characteristics
     */
    profileData(entities: any[], entityType: string): Promise<DataProfilingResult[]>;
    /**
     * Calculate quality metrics for an entity
     */
    private calculateQualityMetrics;
    /**
     * Calculate completeness score
     */
    private calculateCompleteness;
    /**
     * Calculate accuracy score
     */
    private calculateAccuracy;
    /**
     * Calculate consistency score
     */
    private calculateConsistency;
    /**
     * Calculate validity score
     */
    private calculateValidity;
    /**
     * Calculate uniqueness score (placeholder - requires database access for real implementation)
     */
    private calculateUniqueness;
    /**
     * Calculate timeliness score
     */
    private calculateTimeliness;
    /**
     * Calculate overall quality score using weighted average
     */
    private calculateOverallScore;
    /**
     * Check quality metrics against thresholds
     */
    private checkThresholds;
    /**
     * Execute a quality rule
     */
    private executeQualityRule;
    /**
     * Create quality result from rule execution
     */
    private createQualityResult;
    private calculateBatchQualityMetrics;
    private identifyQualityIssues;
    private generateRecommendations;
    private analyzeTrends;
    private performBenchmarkComparison;
    private calculateSimilarity;
    private getMatchingFields;
    private profileField;
    private inferDataType;
    private getCommonValues;
    private identifyPatterns;
    private calculateFieldQualityScore;
    private identifyFieldIssues;
    private getQualityProfile;
    private storeQualityMetrics;
    /**
     * Initialize default quality profiles
     */
    private initializeDefaultProfiles;
    /**
     * Add quality profile
     */
    addQualityProfile(profile: QualityProfile): void;
    /**
     * Get quality history
     */
    getQualityHistory(entityType: string): QualityMetrics[];
    /**
     * Clear quality history
     */
    clearQualityHistory(): void;
}
//# sourceMappingURL=QualityAssurance.d.ts.map