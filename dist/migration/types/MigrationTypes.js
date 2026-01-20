"use strict";
/**
 * Core types and interfaces for the Autotask Migration Framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskSeverity = exports.RiskType = exports.RiskLevel = exports.DependencyType = exports.ValidationRule = exports.BottleneckType = exports.DeduplicationStrategy = exports.IssueSeverity = exports.QualityIssueType = exports.ErrorSeverity = exports.MappingAction = exports.ConditionOperator = exports.TransformationType = exports.DataType = exports.MigrationStatus = exports.PSASystem = void 0;
// Enums
var PSASystem;
(function (PSASystem) {
    PSASystem["CONNECTWISE_MANAGE"] = "connectwise_manage";
    PSASystem["SERVICENOW"] = "servicenow";
    PSASystem["KASEYA_VSA"] = "kaseya_vsa";
    PSASystem["FRESHSERVICE"] = "freshservice";
    PSASystem["SERVICEDESK_PLUS"] = "servicedesk_plus";
    PSASystem["CSV_IMPORT"] = "csv_import";
    PSASystem["EXCEL_IMPORT"] = "excel_import";
})(PSASystem || (exports.PSASystem = PSASystem = {}));
var MigrationStatus;
(function (MigrationStatus) {
    MigrationStatus["PENDING"] = "pending";
    MigrationStatus["INITIALIZING"] = "initializing";
    MigrationStatus["VALIDATING"] = "validating";
    MigrationStatus["MAPPING"] = "mapping";
    MigrationStatus["PROCESSING"] = "processing";
    MigrationStatus["COMPLETED"] = "completed";
    MigrationStatus["FAILED"] = "failed";
    MigrationStatus["CANCELLED"] = "cancelled";
    MigrationStatus["PAUSED"] = "paused";
})(MigrationStatus || (exports.MigrationStatus = MigrationStatus = {}));
var DataType;
(function (DataType) {
    DataType["STRING"] = "string";
    DataType["NUMBER"] = "number";
    DataType["BOOLEAN"] = "boolean";
    DataType["DATE"] = "date";
    DataType["DATETIME"] = "datetime";
    DataType["ARRAY"] = "array";
    DataType["OBJECT"] = "object";
    DataType["EMAIL"] = "email";
    DataType["PHONE"] = "phone";
    DataType["URL"] = "url";
})(DataType || (exports.DataType = DataType = {}));
var TransformationType;
(function (TransformationType) {
    TransformationType["FORMAT"] = "format";
    TransformationType["CONVERT"] = "convert";
    TransformationType["SPLIT"] = "split";
    TransformationType["MERGE"] = "merge";
    TransformationType["LOOKUP"] = "lookup";
    TransformationType["CALCULATE"] = "calculate";
    TransformationType["CUSTOM"] = "custom";
})(TransformationType || (exports.TransformationType = TransformationType = {}));
var ConditionOperator;
(function (ConditionOperator) {
    ConditionOperator["EQUALS"] = "equals";
    ConditionOperator["NOT_EQUALS"] = "not_equals";
    ConditionOperator["CONTAINS"] = "contains";
    ConditionOperator["STARTS_WITH"] = "starts_with";
    ConditionOperator["ENDS_WITH"] = "ends_with";
    ConditionOperator["GREATER_THAN"] = "greater_than";
    ConditionOperator["LESS_THAN"] = "less_than";
    ConditionOperator["IN"] = "in";
    ConditionOperator["NOT_IN"] = "not_in";
    ConditionOperator["IS_NULL"] = "is_null";
    ConditionOperator["IS_NOT_NULL"] = "is_not_null";
})(ConditionOperator || (exports.ConditionOperator = ConditionOperator = {}));
var MappingAction;
(function (MappingAction) {
    MappingAction["INCLUDE"] = "include";
    MappingAction["EXCLUDE"] = "exclude";
    MappingAction["TRANSFORM"] = "transform";
    MappingAction["SET_DEFAULT"] = "set_default";
})(MappingAction || (exports.MappingAction = MappingAction = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
var QualityIssueType;
(function (QualityIssueType) {
    QualityIssueType["MISSING_VALUE"] = "missing_value";
    QualityIssueType["INVALID_FORMAT"] = "invalid_format";
    QualityIssueType["INCONSISTENT_DATA"] = "inconsistent_data";
    QualityIssueType["DUPLICATE_VALUE"] = "duplicate_value";
    QualityIssueType["OUTLIER"] = "outlier";
    QualityIssueType["REFERENCE_ERROR"] = "reference_error";
})(QualityIssueType || (exports.QualityIssueType = QualityIssueType = {}));
var IssueSeverity;
(function (IssueSeverity) {
    IssueSeverity["INFO"] = "info";
    IssueSeverity["WARNING"] = "warning";
    IssueSeverity["ERROR"] = "error";
    IssueSeverity["CRITICAL"] = "critical";
})(IssueSeverity || (exports.IssueSeverity = IssueSeverity = {}));
var DeduplicationStrategy;
(function (DeduplicationStrategy) {
    DeduplicationStrategy["EXACT_MATCH"] = "exact_match";
    DeduplicationStrategy["FUZZY_MATCH"] = "fuzzy_match";
    DeduplicationStrategy["BUSINESS_RULES"] = "business_rules";
    DeduplicationStrategy["AI_ASSISTED"] = "ai_assisted";
})(DeduplicationStrategy || (exports.DeduplicationStrategy = DeduplicationStrategy = {}));
var BottleneckType;
(function (BottleneckType) {
    BottleneckType["MEMORY"] = "memory";
    BottleneckType["CPU"] = "cpu";
    BottleneckType["NETWORK"] = "network";
    BottleneckType["STORAGE"] = "storage";
    BottleneckType["API_RATE_LIMIT"] = "api_rate_limit";
    BottleneckType["DATABASE"] = "database";
})(BottleneckType || (exports.BottleneckType = BottleneckType = {}));
var ValidationRule;
(function (ValidationRule) {
    ValidationRule["REQUIRED"] = "required";
    ValidationRule["MIN_LENGTH"] = "min_length";
    ValidationRule["MAX_LENGTH"] = "max_length";
    ValidationRule["PATTERN"] = "pattern";
    ValidationRule["EMAIL"] = "email";
    ValidationRule["PHONE"] = "phone";
    ValidationRule["URL"] = "url";
    ValidationRule["DATE"] = "date";
    ValidationRule["NUMBER"] = "number";
    ValidationRule["CUSTOM"] = "custom";
})(ValidationRule || (exports.ValidationRule = ValidationRule = {}));
var DependencyType;
(function (DependencyType) {
    DependencyType["HARD"] = "hard";
    DependencyType["SOFT"] = "soft";
    DependencyType["CIRCULAR"] = "circular";
})(DependencyType || (exports.DependencyType = DependencyType = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "low";
    RiskLevel["MEDIUM"] = "medium";
    RiskLevel["HIGH"] = "high";
    RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var RiskType;
(function (RiskType) {
    RiskType["DATA_LOSS"] = "data_loss";
    RiskType["DATA_CORRUPTION"] = "data_corruption";
    RiskType["PERFORMANCE"] = "performance";
    RiskType["DOWNTIME"] = "downtime";
    RiskType["COMPLIANCE"] = "compliance";
    RiskType["INTEGRATION"] = "integration";
})(RiskType || (exports.RiskType = RiskType = {}));
var RiskSeverity;
(function (RiskSeverity) {
    RiskSeverity["MINOR"] = "minor";
    RiskSeverity["MODERATE"] = "moderate";
    RiskSeverity["MAJOR"] = "major";
    RiskSeverity["CATASTROPHIC"] = "catastrophic";
})(RiskSeverity || (exports.RiskSeverity = RiskSeverity = {}));
//# sourceMappingURL=MigrationTypes.js.map