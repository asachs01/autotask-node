"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultConfiguration = exports.createQueueManager = exports.QueueMonitor = exports.CircuitBreakerManager = exports.PriorityScheduler = exports.RedisBackend = exports.SQLiteBackend = exports.MemoryBackend = exports.QueueManager = exports.DEFAULT_MAPPINGS = exports.MigrationConfigBuilder = exports.createCSVImport = exports.createSimpleMigration = exports.CSVImportConnector = exports.KaseyaVSAConnector = exports.ServiceNowConnector = exports.ConnectWiseManageConnector = exports.BaseConnector = exports.PreMigrationValidator = exports.MappingEngine = exports.ConnectorFactory = exports.MigrationEngine = exports.SynchronizationEngine = exports.DeliveryManager = exports.EventRouter = exports.EventParser = exports.WebhookReceiver = exports.WebhookManager = exports.defaultValidationEngine = exports.validationMiddleware = exports.ValidationDecorators = exports.ValidationUtils = exports.ValidationFactory = exports.QualityAssurance = exports.ComplianceValidator = exports.SecurityValidator = exports.InputSanitizer = exports.SchemaRegistry = exports.ValidationEngine = exports.BatchRelationshipProcessor = exports.DataIntegrityManager = exports.SmartLoadingEngine = exports.GraphTraversalEngine = exports.CascadeEngine = exports.RelationshipMapper = exports.AutotaskRelationshipSystem = exports.BatchProcessor = exports.AutotaskPerformanceIntegration = exports.ValidatedAutotaskClient = exports.AutotaskClient = void 0;
exports.AdaptiveStrategy = exports.PriorityAwareStrategy = exports.HybridStrategy = exports.TimeBasedStrategy = exports.SizeBasedStrategy = exports.BatchMetricsCollector = exports.BatchOptimizer = exports.BatchQueue = exports.BatchManager = exports.RelationshipGraph = exports.ReferentialAction = exports.RelationshipType = exports.defaultIntegrityManager = exports.ReferentialIntegrityManager = exports.RetryStrategy = exports.CircuitBreakerState = exports.CircuitBreaker = exports.defaultErrorLogger = exports.LogDestination = exports.LogLevel = exports.ErrorLogger = exports.ValidateEntity = exports.BusinessValidationError = exports.BusinessRuleEnhancedClient = exports.BusinessRuleMiddleware = exports.DefaultRuleConfiguration = exports.RuleConfigurationManager = exports.TimeEntryBusinessRules = exports.TaskBusinessRules = exports.ContractBusinessRules = exports.ProjectBusinessRules = exports.ContactBusinessRules = exports.CompanyBusinessRules = exports.TicketBusinessRules = exports.EntityRuleFactory = exports.PercentageSumRule = exports.DependentFieldsRule = exports.MutuallyExclusiveRule = exports.SumValidationRule = exports.DateRangeRule = exports.ConditionalRequiredRule = exports.BusinessRuleEngine = exports.ValidationSeverity = exports.BusinessValidationResult = exports.RulePriority = exports.CompositeRule = exports.RangeRule = exports.PatternRule = exports.RequiredFieldRule = exports.BaseBusinessRule = void 0;
exports.DEFAULT_ENTITY_CONFIGS = exports.cached = exports.MetricEvent = exports.VolatilityLevel = exports.TTLStrategy = exports.KeyStrategy = exports.CacheStrategyExecutor = exports.CacheConfigBuilder = exports.createAutotaskCacheManager = exports.TTLManager = exports.CacheMetricsCollector = exports.CacheKeyGenerator = exports.CacheInvalidator = exports.FileCacheStore = exports.RedisCacheStore = exports.MemoryCacheStore = exports.CacheManager = exports.analyzeBatchPerformance = exports.calculateOptimalBatchSize = exports.createBatchRequest = exports.createDevelopmentBatchConfig = exports.createLowLatencyBatchConfig = exports.createHighThroughputBatchConfig = exports.createDefaultBatchConfig = exports.BatchResultAnalyzer = exports.BatchResultBuilder = exports.BatchStrategyFactory = void 0;
var AutotaskClient_1 = require("./client/AutotaskClient");
Object.defineProperty(exports, "AutotaskClient", { enumerable: true, get: function () { return AutotaskClient_1.AutotaskClient; } });
var ValidatedAutotaskClient_1 = require("./client/ValidatedAutotaskClient");
Object.defineProperty(exports, "ValidatedAutotaskClient", { enumerable: true, get: function () { return ValidatedAutotaskClient_1.ValidatedAutotaskClient; } });
__exportStar(require("./entities"), exports);
// Enterprise Performance System
var AutotaskPerformanceIntegration_1 = require("./performance/integration/AutotaskPerformanceIntegration");
Object.defineProperty(exports, "AutotaskPerformanceIntegration", { enumerable: true, get: function () { return AutotaskPerformanceIntegration_1.AutotaskPerformanceIntegration; } });
// Note: Use individual exports instead of wildcard to avoid conflicts
var performance_1 = require("./performance");
Object.defineProperty(exports, "BatchProcessor", { enumerable: true, get: function () { return performance_1.BatchProcessor; } });
// Entity Relationship and Cascade Operations System
// Note: Use individual exports instead of wildcard to avoid conflicts
var relationships_1 = require("./relationships");
Object.defineProperty(exports, "AutotaskRelationshipSystem", { enumerable: true, get: function () { return relationships_1.AutotaskRelationshipSystem; } });
Object.defineProperty(exports, "RelationshipMapper", { enumerable: true, get: function () { return relationships_1.RelationshipMapper; } });
Object.defineProperty(exports, "CascadeEngine", { enumerable: true, get: function () { return relationships_1.CascadeEngine; } });
Object.defineProperty(exports, "GraphTraversalEngine", { enumerable: true, get: function () { return relationships_1.GraphTraversalEngine; } });
Object.defineProperty(exports, "SmartLoadingEngine", { enumerable: true, get: function () { return relationships_1.SmartLoadingEngine; } });
Object.defineProperty(exports, "DataIntegrityManager", { enumerable: true, get: function () { return relationships_1.DataIntegrityManager; } });
Object.defineProperty(exports, "BatchRelationshipProcessor", { enumerable: true, get: function () { return relationships_1.BatchRelationshipProcessor; } });
// Enterprise Validation and Sanitization System
// Note: Use individual exports instead of wildcard to avoid conflicts
var validation_1 = require("./validation");
Object.defineProperty(exports, "ValidationEngine", { enumerable: true, get: function () { return validation_1.ValidationEngine; } });
Object.defineProperty(exports, "SchemaRegistry", { enumerable: true, get: function () { return validation_1.SchemaRegistry; } });
Object.defineProperty(exports, "InputSanitizer", { enumerable: true, get: function () { return validation_1.InputSanitizer; } });
Object.defineProperty(exports, "SecurityValidator", { enumerable: true, get: function () { return validation_1.SecurityValidator; } });
Object.defineProperty(exports, "ComplianceValidator", { enumerable: true, get: function () { return validation_1.ComplianceValidator; } });
Object.defineProperty(exports, "QualityAssurance", { enumerable: true, get: function () { return validation_1.QualityAssurance; } });
Object.defineProperty(exports, "ValidationFactory", { enumerable: true, get: function () { return validation_1.ValidationFactory; } });
Object.defineProperty(exports, "ValidationUtils", { enumerable: true, get: function () { return validation_1.ValidationUtils; } });
Object.defineProperty(exports, "ValidationDecorators", { enumerable: true, get: function () { return validation_1.ValidationDecorators; } });
Object.defineProperty(exports, "validationMiddleware", { enumerable: true, get: function () { return validation_1.validationMiddleware; } });
Object.defineProperty(exports, "defaultValidationEngine", { enumerable: true, get: function () { return validation_1.defaultValidationEngine; } });
// Note: Response Caching System exports moved to avoid conflicts
// Webhook and Event Handling System  
// Note: Use individual exports instead of wildcard to avoid conflicts
var webhooks_1 = require("./webhooks");
Object.defineProperty(exports, "WebhookManager", { enumerable: true, get: function () { return webhooks_1.WebhookManager; } });
Object.defineProperty(exports, "WebhookReceiver", { enumerable: true, get: function () { return webhooks_1.WebhookReceiver; } });
Object.defineProperty(exports, "EventParser", { enumerable: true, get: function () { return webhooks_1.EventParser; } });
Object.defineProperty(exports, "EventRouter", { enumerable: true, get: function () { return webhooks_1.EventRouter; } });
Object.defineProperty(exports, "DeliveryManager", { enumerable: true, get: function () { return webhooks_1.DeliveryManager; } });
Object.defineProperty(exports, "SynchronizationEngine", { enumerable: true, get: function () { return webhooks_1.SynchronizationEngine; } });
// PSA Migration Framework
// Note: Use individual exports instead of wildcard to avoid conflicts
var migration_1 = require("./migration");
Object.defineProperty(exports, "MigrationEngine", { enumerable: true, get: function () { return migration_1.MigrationEngine; } });
Object.defineProperty(exports, "ConnectorFactory", { enumerable: true, get: function () { return migration_1.ConnectorFactory; } });
Object.defineProperty(exports, "MappingEngine", { enumerable: true, get: function () { return migration_1.MappingEngine; } });
Object.defineProperty(exports, "PreMigrationValidator", { enumerable: true, get: function () { return migration_1.PreMigrationValidator; } });
Object.defineProperty(exports, "BaseConnector", { enumerable: true, get: function () { return migration_1.BaseConnector; } });
Object.defineProperty(exports, "ConnectWiseManageConnector", { enumerable: true, get: function () { return migration_1.ConnectWiseManageConnector; } });
Object.defineProperty(exports, "ServiceNowConnector", { enumerable: true, get: function () { return migration_1.ServiceNowConnector; } });
Object.defineProperty(exports, "KaseyaVSAConnector", { enumerable: true, get: function () { return migration_1.KaseyaVSAConnector; } });
Object.defineProperty(exports, "CSVImportConnector", { enumerable: true, get: function () { return migration_1.CSVImportConnector; } });
Object.defineProperty(exports, "createSimpleMigration", { enumerable: true, get: function () { return migration_1.createSimpleMigration; } });
Object.defineProperty(exports, "createCSVImport", { enumerable: true, get: function () { return migration_1.createCSVImport; } });
Object.defineProperty(exports, "MigrationConfigBuilder", { enumerable: true, get: function () { return migration_1.MigrationConfigBuilder; } });
Object.defineProperty(exports, "DEFAULT_MAPPINGS", { enumerable: true, get: function () { return migration_1.DEFAULT_MAPPINGS; } });
// Advanced Queue System with Error Recovery
// Note: Use individual exports instead of wildcard to avoid conflicts
var queue_1 = require("./queue");
Object.defineProperty(exports, "QueueManager", { enumerable: true, get: function () { return queue_1.QueueManager; } });
Object.defineProperty(exports, "MemoryBackend", { enumerable: true, get: function () { return queue_1.MemoryBackend; } });
Object.defineProperty(exports, "SQLiteBackend", { enumerable: true, get: function () { return queue_1.SQLiteBackend; } });
Object.defineProperty(exports, "RedisBackend", { enumerable: true, get: function () { return queue_1.RedisBackend; } });
Object.defineProperty(exports, "PriorityScheduler", { enumerable: true, get: function () { return queue_1.PriorityScheduler; } });
Object.defineProperty(exports, "CircuitBreakerManager", { enumerable: true, get: function () { return queue_1.CircuitBreakerManager; } });
Object.defineProperty(exports, "QueueMonitor", { enumerable: true, get: function () { return queue_1.QueueMonitor; } });
Object.defineProperty(exports, "createQueueManager", { enumerable: true, get: function () { return queue_1.createQueueManager; } });
Object.defineProperty(exports, "createDefaultConfiguration", { enumerable: true, get: function () { return queue_1.createDefaultConfiguration; } });
// Business Rule Enforcement System
// Note: Use individual exports instead of wildcard to avoid conflicts
var business_rules_1 = require("./business-rules");
Object.defineProperty(exports, "BaseBusinessRule", { enumerable: true, get: function () { return business_rules_1.BaseBusinessRule; } });
Object.defineProperty(exports, "RequiredFieldRule", { enumerable: true, get: function () { return business_rules_1.RequiredFieldRule; } });
Object.defineProperty(exports, "PatternRule", { enumerable: true, get: function () { return business_rules_1.PatternRule; } });
Object.defineProperty(exports, "RangeRule", { enumerable: true, get: function () { return business_rules_1.RangeRule; } });
Object.defineProperty(exports, "CompositeRule", { enumerable: true, get: function () { return business_rules_1.CompositeRule; } });
Object.defineProperty(exports, "RulePriority", { enumerable: true, get: function () { return business_rules_1.RulePriority; } });
Object.defineProperty(exports, "BusinessValidationResult", { enumerable: true, get: function () { return business_rules_1.ValidationResult; } });
Object.defineProperty(exports, "ValidationSeverity", { enumerable: true, get: function () { return business_rules_1.ValidationSeverity; } });
Object.defineProperty(exports, "BusinessRuleEngine", { enumerable: true, get: function () { return business_rules_1.BusinessRuleEngine; } });
Object.defineProperty(exports, "ConditionalRequiredRule", { enumerable: true, get: function () { return business_rules_1.ConditionalRequiredRule; } });
Object.defineProperty(exports, "DateRangeRule", { enumerable: true, get: function () { return business_rules_1.DateRangeRule; } });
Object.defineProperty(exports, "SumValidationRule", { enumerable: true, get: function () { return business_rules_1.SumValidationRule; } });
Object.defineProperty(exports, "MutuallyExclusiveRule", { enumerable: true, get: function () { return business_rules_1.MutuallyExclusiveRule; } });
Object.defineProperty(exports, "DependentFieldsRule", { enumerable: true, get: function () { return business_rules_1.DependentFieldsRule; } });
Object.defineProperty(exports, "PercentageSumRule", { enumerable: true, get: function () { return business_rules_1.PercentageSumRule; } });
Object.defineProperty(exports, "EntityRuleFactory", { enumerable: true, get: function () { return business_rules_1.EntityRuleFactory; } });
Object.defineProperty(exports, "TicketBusinessRules", { enumerable: true, get: function () { return business_rules_1.TicketBusinessRules; } });
Object.defineProperty(exports, "CompanyBusinessRules", { enumerable: true, get: function () { return business_rules_1.CompanyBusinessRules; } });
Object.defineProperty(exports, "ContactBusinessRules", { enumerable: true, get: function () { return business_rules_1.ContactBusinessRules; } });
Object.defineProperty(exports, "ProjectBusinessRules", { enumerable: true, get: function () { return business_rules_1.ProjectBusinessRules; } });
Object.defineProperty(exports, "ContractBusinessRules", { enumerable: true, get: function () { return business_rules_1.ContractBusinessRules; } });
Object.defineProperty(exports, "TaskBusinessRules", { enumerable: true, get: function () { return business_rules_1.TaskBusinessRules; } });
Object.defineProperty(exports, "TimeEntryBusinessRules", { enumerable: true, get: function () { return business_rules_1.TimeEntryBusinessRules; } });
Object.defineProperty(exports, "RuleConfigurationManager", { enumerable: true, get: function () { return business_rules_1.RuleConfigurationManager; } });
Object.defineProperty(exports, "DefaultRuleConfiguration", { enumerable: true, get: function () { return business_rules_1.DefaultRuleConfiguration; } });
Object.defineProperty(exports, "BusinessRuleMiddleware", { enumerable: true, get: function () { return business_rules_1.BusinessRuleMiddleware; } });
Object.defineProperty(exports, "BusinessRuleEnhancedClient", { enumerable: true, get: function () { return business_rules_1.BusinessRuleEnhancedClient; } });
Object.defineProperty(exports, "BusinessValidationError", { enumerable: true, get: function () { return business_rules_1.ValidationError; } });
Object.defineProperty(exports, "ValidateEntity", { enumerable: true, get: function () { return business_rules_1.ValidateEntity; } });
// Error Handling System
var ErrorLogger_1 = require("./errors/ErrorLogger");
Object.defineProperty(exports, "ErrorLogger", { enumerable: true, get: function () { return ErrorLogger_1.ErrorLogger; } });
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return ErrorLogger_1.LogLevel; } });
Object.defineProperty(exports, "LogDestination", { enumerable: true, get: function () { return ErrorLogger_1.LogDestination; } });
Object.defineProperty(exports, "defaultErrorLogger", { enumerable: true, get: function () { return ErrorLogger_1.defaultErrorLogger; } });
var CircuitBreaker_1 = require("./errors/CircuitBreaker");
Object.defineProperty(exports, "CircuitBreaker", { enumerable: true, get: function () { return CircuitBreaker_1.CircuitBreaker; } });
Object.defineProperty(exports, "CircuitBreakerState", { enumerable: true, get: function () { return CircuitBreaker_1.CircuitBreakerState; } });
var RetryStrategy_1 = require("./errors/RetryStrategy");
Object.defineProperty(exports, "RetryStrategy", { enumerable: true, get: function () { return RetryStrategy_1.RetryStrategy; } });
// Referential Integrity System
var referential_integrity_1 = require("./referential-integrity");
Object.defineProperty(exports, "ReferentialIntegrityManager", { enumerable: true, get: function () { return referential_integrity_1.ReferentialIntegrityManager; } });
Object.defineProperty(exports, "defaultIntegrityManager", { enumerable: true, get: function () { return referential_integrity_1.defaultIntegrityManager; } });
Object.defineProperty(exports, "RelationshipType", { enumerable: true, get: function () { return referential_integrity_1.RelationshipType; } });
Object.defineProperty(exports, "ReferentialAction", { enumerable: true, get: function () { return referential_integrity_1.ReferentialAction; } });
Object.defineProperty(exports, "RelationshipGraph", { enumerable: true, get: function () { return referential_integrity_1.RelationshipGraph; } });
// Request Batching System
var batching_1 = require("./batching");
Object.defineProperty(exports, "BatchManager", { enumerable: true, get: function () { return batching_1.BatchManager; } });
Object.defineProperty(exports, "BatchQueue", { enumerable: true, get: function () { return batching_1.BatchQueue; } });
Object.defineProperty(exports, "BatchOptimizer", { enumerable: true, get: function () { return batching_1.BatchOptimizer; } });
Object.defineProperty(exports, "BatchMetricsCollector", { enumerable: true, get: function () { return batching_1.BatchMetricsCollector; } });
Object.defineProperty(exports, "SizeBasedStrategy", { enumerable: true, get: function () { return batching_1.SizeBasedStrategy; } });
Object.defineProperty(exports, "TimeBasedStrategy", { enumerable: true, get: function () { return batching_1.TimeBasedStrategy; } });
Object.defineProperty(exports, "HybridStrategy", { enumerable: true, get: function () { return batching_1.HybridStrategy; } });
Object.defineProperty(exports, "PriorityAwareStrategy", { enumerable: true, get: function () { return batching_1.PriorityAwareStrategy; } });
Object.defineProperty(exports, "AdaptiveStrategy", { enumerable: true, get: function () { return batching_1.AdaptiveStrategy; } });
Object.defineProperty(exports, "BatchStrategyFactory", { enumerable: true, get: function () { return batching_1.BatchStrategyFactory; } });
Object.defineProperty(exports, "BatchResultBuilder", { enumerable: true, get: function () { return batching_1.BatchResultBuilder; } });
Object.defineProperty(exports, "BatchResultAnalyzer", { enumerable: true, get: function () { return batching_1.BatchResultAnalyzer; } });
Object.defineProperty(exports, "createDefaultBatchConfig", { enumerable: true, get: function () { return batching_1.createDefaultBatchConfig; } });
Object.defineProperty(exports, "createHighThroughputBatchConfig", { enumerable: true, get: function () { return batching_1.createHighThroughputBatchConfig; } });
Object.defineProperty(exports, "createLowLatencyBatchConfig", { enumerable: true, get: function () { return batching_1.createLowLatencyBatchConfig; } });
Object.defineProperty(exports, "createDevelopmentBatchConfig", { enumerable: true, get: function () { return batching_1.createDevelopmentBatchConfig; } });
Object.defineProperty(exports, "createBatchRequest", { enumerable: true, get: function () { return batching_1.createBatchRequest; } });
Object.defineProperty(exports, "calculateOptimalBatchSize", { enumerable: true, get: function () { return batching_1.calculateOptimalBatchSize; } });
Object.defineProperty(exports, "analyzeBatchPerformance", { enumerable: true, get: function () { return batching_1.analyzeBatchPerformance; } });
// Response Caching System
var caching_1 = require("./caching");
Object.defineProperty(exports, "CacheManager", { enumerable: true, get: function () { return caching_1.CacheManager; } });
Object.defineProperty(exports, "MemoryCacheStore", { enumerable: true, get: function () { return caching_1.MemoryCacheStore; } });
Object.defineProperty(exports, "RedisCacheStore", { enumerable: true, get: function () { return caching_1.RedisCacheStore; } });
Object.defineProperty(exports, "FileCacheStore", { enumerable: true, get: function () { return caching_1.FileCacheStore; } });
Object.defineProperty(exports, "CacheInvalidator", { enumerable: true, get: function () { return caching_1.CacheInvalidator; } });
Object.defineProperty(exports, "CacheKeyGenerator", { enumerable: true, get: function () { return caching_1.CacheKeyGenerator; } });
Object.defineProperty(exports, "CacheMetricsCollector", { enumerable: true, get: function () { return caching_1.CacheMetricsCollector; } });
Object.defineProperty(exports, "TTLManager", { enumerable: true, get: function () { return caching_1.TTLManager; } });
Object.defineProperty(exports, "createAutotaskCacheManager", { enumerable: true, get: function () { return caching_1.createAutotaskCacheManager; } });
Object.defineProperty(exports, "CacheConfigBuilder", { enumerable: true, get: function () { return caching_1.CacheConfigBuilder; } });
Object.defineProperty(exports, "CacheStrategyExecutor", { enumerable: true, get: function () { return caching_1.CacheStrategyExecutor; } });
Object.defineProperty(exports, "KeyStrategy", { enumerable: true, get: function () { return caching_1.KeyStrategy; } });
Object.defineProperty(exports, "TTLStrategy", { enumerable: true, get: function () { return caching_1.TTLStrategy; } });
Object.defineProperty(exports, "VolatilityLevel", { enumerable: true, get: function () { return caching_1.VolatilityLevel; } });
Object.defineProperty(exports, "MetricEvent", { enumerable: true, get: function () { return caching_1.MetricEvent; } });
Object.defineProperty(exports, "cached", { enumerable: true, get: function () { return caching_1.cached; } });
Object.defineProperty(exports, "DEFAULT_ENTITY_CONFIGS", { enumerable: true, get: function () { return caching_1.DEFAULT_ENTITY_CONFIGS; } });
//# sourceMappingURL=index.js.map