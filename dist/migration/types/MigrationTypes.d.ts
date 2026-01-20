/**
 * Core types and interfaces for the Autotask Migration Framework
 */
export interface MigrationConfig {
    source: {
        system: PSASystem;
        connectionConfig: SourceConnectionConfig;
        entities: string[];
        batchSize?: number;
        parallelism?: number;
    };
    target: {
        autotaskConfig: AutotaskConnectionConfig;
        zoneId: string;
    };
    mapping: {
        rules: MappingRule[];
        customTransformations?: CustomTransformation[];
        aiAssisted?: boolean;
    };
    validation: {
        preValidation: boolean;
        postValidation: boolean;
        qualityChecks: boolean;
        duplicateDetection: boolean;
    };
    options: {
        incremental?: boolean;
        resumeFromCheckpoint?: string;
        dryRun?: boolean;
        skipErrors?: boolean;
        maxRetries?: number;
    };
}
export interface MigrationState {
    id: string;
    status: MigrationStatus;
    startTime: Date;
    endTime?: Date;
    progress: MigrationProgress;
    checkpoints: MigrationCheckpoint[];
    errors: MigrationError[];
    metrics: MigrationMetrics;
    config: MigrationConfig;
}
export interface MigrationProgress {
    totalEntities: number;
    processedEntities: number;
    successfulEntities: number;
    failedEntities: number;
    skippedEntities: number;
    currentEntity?: string;
    currentBatch?: number;
    totalBatches?: number;
    percentComplete: number;
    estimatedTimeRemaining?: number;
}
export interface MigrationCheckpoint {
    id: string;
    timestamp: Date;
    entityType: string;
    lastProcessedId: string;
    state: any;
    canRollback: boolean;
}
export interface MigrationError {
    id: string;
    timestamp: Date;
    entityType: string;
    entityId?: string;
    error: string;
    stack?: string;
    context?: any;
    retryCount: number;
    resolved: boolean;
}
export interface MigrationMetrics {
    recordsProcessed: number;
    recordsMigrated: number;
    recordsFailed: number;
    averageProcessingTime: number;
    peakMemoryUsage: number;
    networkRequests: number;
    cacheHitRate: number;
    dataTransferred: number;
}
export interface SourceConnectionConfig {
    baseUrl: string;
    credentials: {
        apiKey?: string;
        username?: string;
        password?: string;
        token?: string;
        clientId?: string;
        clientSecret?: string;
    };
    options?: {
        timeout?: number;
        retryAttempts?: number;
        rateLimit?: number;
        apiVersion?: string;
    };
}
export interface AutotaskConnectionConfig {
    baseUrl: string;
    username: string;
    secret: string;
    integrationCode: string;
    clientId?: string;
}
export interface MappingRule {
    sourceEntity: string;
    targetEntity: string;
    fieldMappings: FieldMapping[];
    conditions?: MappingCondition[];
    transformations?: FieldTransformation[];
}
export interface FieldMapping {
    sourceField: string;
    targetField: string;
    required: boolean;
    dataType: DataType;
    defaultValue?: any;
    validation?: ValidationRule[];
}
export interface FieldTransformation {
    field: string;
    type: TransformationType;
    parameters?: any;
    customFunction?: string;
}
export interface MappingCondition {
    field: string;
    operator: ConditionOperator;
    value: any;
    action: MappingAction;
}
export interface CustomTransformation {
    name: string;
    sourceEntity: string;
    targetEntity: string;
    function: (data: any, context: TransformationContext) => any;
    async?: boolean;
}
export interface TransformationContext {
    sourceSystem: PSASystem;
    migrationId: string;
    entityType: string;
    batch: any[];
    dependencies?: Map<string, any>;
    cache: Map<string, any>;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    score?: number;
    recommendations?: string[];
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: ErrorSeverity;
    context?: any;
}
export interface ValidationWarning {
    field: string;
    message: string;
    code: string;
    recommendation?: string;
}
export interface DataQualityReport {
    entityType: string;
    totalRecords: number;
    qualityScore: number;
    issues: DataQualityIssue[];
    recommendations: string[];
    metrics: {
        completeness: number;
        accuracy: number;
        consistency: number;
        validity: number;
    };
}
export interface DataQualityIssue {
    type: QualityIssueType;
    field: string;
    count: number;
    percentage: number;
    examples: any[];
    severity: IssueSeverity;
}
export interface DuplicateReport {
    entityType: string;
    totalRecords: number;
    duplicateGroups: DuplicateGroup[];
    deduplicationStrategy: DeduplicationStrategy;
    recommendedActions: DeduplicationAction[];
}
export interface DuplicateGroup {
    id: string;
    records: any[];
    similarity: number;
    conflictFields: string[];
    recommendedMaster?: any;
}
export interface DeduplicationAction {
    groupId: string;
    action: 'merge' | 'skip' | 'manual_review';
    masterRecord?: any;
    reason: string;
}
export interface MigrationReport {
    migrationId: string;
    summary: MigrationSummary;
    entityReports: EntityMigrationReport[];
    validationReport: ValidationReport;
    performanceReport: PerformanceReport;
    recommendations: string[];
    generatedAt: Date;
}
export interface MigrationSummary {
    totalEntities: number;
    successfulEntities: number;
    failedEntities: number;
    skippedEntities: number;
    duration: number;
    dataTransferred: number;
    errorRate: number;
    successRate: number;
}
export interface EntityMigrationReport {
    entityType: string;
    totalRecords: number;
    migratedRecords: number;
    failedRecords: number;
    skippedRecords: number;
    averageProcessingTime: number;
    errors: MigrationError[];
    dataQuality: DataQualityReport;
}
export interface ValidationReport {
    preValidation?: ValidationResult;
    postValidation?: ValidationResult;
    integrityCheck?: IntegrityCheckResult;
    qualityReport?: DataQualityReport;
    duplicateReport?: DuplicateReport;
}
export interface IntegrityCheckResult {
    referentialIntegrity: boolean;
    orphanedRecords: OrphanedRecord[];
    missingReferences: MissingReference[];
    constraintViolations: ConstraintViolation[];
}
export interface OrphanedRecord {
    entityType: string;
    recordId: string;
    parentEntityType: string;
    missingParentId: string;
}
export interface MissingReference {
    entityType: string;
    recordId: string;
    referencedEntityType: string;
    missingReferenceId: string;
    field: string;
}
export interface ConstraintViolation {
    entityType: string;
    recordId: string;
    constraint: string;
    violation: string;
    field?: string;
}
export interface PerformanceReport {
    duration: number;
    throughput: number;
    memoryUsage: MemoryUsageReport;
    networkMetrics: NetworkMetrics;
    bottlenecks: PerformanceBottleneck[];
}
export interface MemoryUsageReport {
    peak: number;
    average: number;
    gcEvents: number;
    memoryLeaks: boolean;
}
export interface NetworkMetrics {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    retryCount: number;
    dataTransferred: number;
}
export interface PerformanceBottleneck {
    type: BottleneckType;
    location: string;
    impact: number;
    recommendation: string;
}
export declare enum PSASystem {
    CONNECTWISE_MANAGE = "connectwise_manage",
    SERVICENOW = "servicenow",
    KASEYA_VSA = "kaseya_vsa",
    FRESHSERVICE = "freshservice",
    SERVICEDESK_PLUS = "servicedesk_plus",
    CSV_IMPORT = "csv_import",
    EXCEL_IMPORT = "excel_import"
}
export declare enum MigrationStatus {
    PENDING = "pending",
    INITIALIZING = "initializing",
    VALIDATING = "validating",
    MAPPING = "mapping",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    PAUSED = "paused"
}
export declare enum DataType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    DATE = "date",
    DATETIME = "datetime",
    ARRAY = "array",
    OBJECT = "object",
    EMAIL = "email",
    PHONE = "phone",
    URL = "url"
}
export declare enum TransformationType {
    FORMAT = "format",
    CONVERT = "convert",
    SPLIT = "split",
    MERGE = "merge",
    LOOKUP = "lookup",
    CALCULATE = "calculate",
    CUSTOM = "custom"
}
export declare enum ConditionOperator {
    EQUALS = "equals",
    NOT_EQUALS = "not_equals",
    CONTAINS = "contains",
    STARTS_WITH = "starts_with",
    ENDS_WITH = "ends_with",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    IN = "in",
    NOT_IN = "not_in",
    IS_NULL = "is_null",
    IS_NOT_NULL = "is_not_null"
}
export declare enum MappingAction {
    INCLUDE = "include",
    EXCLUDE = "exclude",
    TRANSFORM = "transform",
    SET_DEFAULT = "set_default"
}
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum QualityIssueType {
    MISSING_VALUE = "missing_value",
    INVALID_FORMAT = "invalid_format",
    INCONSISTENT_DATA = "inconsistent_data",
    DUPLICATE_VALUE = "duplicate_value",
    OUTLIER = "outlier",
    REFERENCE_ERROR = "reference_error"
}
export declare enum IssueSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
export declare enum DeduplicationStrategy {
    EXACT_MATCH = "exact_match",
    FUZZY_MATCH = "fuzzy_match",
    BUSINESS_RULES = "business_rules",
    AI_ASSISTED = "ai_assisted"
}
export declare enum BottleneckType {
    MEMORY = "memory",
    CPU = "cpu",
    NETWORK = "network",
    STORAGE = "storage",
    API_RATE_LIMIT = "api_rate_limit",
    DATABASE = "database"
}
export declare enum ValidationRule {
    REQUIRED = "required",
    MIN_LENGTH = "min_length",
    MAX_LENGTH = "max_length",
    PATTERN = "pattern",
    EMAIL = "email",
    PHONE = "phone",
    URL = "url",
    DATE = "date",
    NUMBER = "number",
    CUSTOM = "custom"
}
export interface ConnectorCapabilities {
    supportedEntities: string[];
    supportsIncrementalSync: boolean;
    supportsRealTimeSync: boolean;
    maxBatchSize: number;
    rateLimits: {
        requestsPerSecond: number;
        requestsPerHour: number;
    };
    authenticationTypes: string[];
    apiVersion?: string;
}
export interface MigrationPlan {
    phases: MigrationPhase[];
    dependencies: EntityDependency[];
    estimatedDuration: number;
    riskAssessment: RiskAssessment;
    resourceRequirements: ResourceRequirements;
}
export interface MigrationPhase {
    id: string;
    name: string;
    entities: string[];
    order: number;
    estimatedDuration: number;
    dependencies: string[];
    parallelizable: boolean;
}
export interface EntityDependency {
    entity: string;
    dependsOn: string[];
    dependencyType: DependencyType;
}
export declare enum DependencyType {
    HARD = "hard",
    SOFT = "soft",
    CIRCULAR = "circular"
}
export interface RiskAssessment {
    overallRisk: RiskLevel;
    risks: Risk[];
    mitigationStrategies: MitigationStrategy[];
}
export interface Risk {
    type: RiskType;
    severity: RiskSeverity;
    probability: number;
    description: string;
    impact: string;
}
export declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum RiskType {
    DATA_LOSS = "data_loss",
    DATA_CORRUPTION = "data_corruption",
    PERFORMANCE = "performance",
    DOWNTIME = "downtime",
    COMPLIANCE = "compliance",
    INTEGRATION = "integration"
}
export declare enum RiskSeverity {
    MINOR = "minor",
    MODERATE = "moderate",
    MAJOR = "major",
    CATASTROPHIC = "catastrophic"
}
export interface MitigationStrategy {
    riskType: RiskType;
    strategy: string;
    cost: number;
    effectiveness: number;
    implementationTime: number;
}
export interface ResourceRequirements {
    memory: number;
    cpu: number;
    storage: number;
    networkBandwidth: number;
    estimatedCost: number;
    duration: number;
}
//# sourceMappingURL=MigrationTypes.d.ts.map