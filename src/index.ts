export { AutotaskClient } from './client/AutotaskClient';
export { ValidatedAutotaskClient } from './client/ValidatedAutotaskClient';
export { AutotaskAuth } from './types';
export * from './entities';

// Enterprise Performance System
export { AutotaskPerformanceIntegration } from './performance/integration/AutotaskPerformanceIntegration';
// Note: Use individual exports instead of wildcard to avoid conflicts
export { 
  PerformanceMetrics,
  PerformanceReport,
  BatchProcessor
} from './performance';

// Entity Relationship and Cascade Operations System
// Note: Use individual exports instead of wildcard to avoid conflicts
export {
  AutotaskRelationshipSystem,
  RelationshipMapper,
  CascadeEngine,
  GraphTraversalEngine,
  SmartLoadingEngine,
  DataIntegrityManager,
  BatchRelationshipProcessor,
  IntegrityCheckResult
} from './relationships';

// Enterprise Validation and Sanitization System
// Note: Use individual exports instead of wildcard to avoid conflicts
export {
  ValidationEngine,
  SchemaRegistry,
  InputSanitizer,
  SecurityValidator,
  ComplianceValidator,
  QualityAssurance,
  ValidationFactory,
  ValidationUtils,
  ValidationDecorators,
  validationMiddleware,
  defaultValidationEngine,
  ValidationError,
  ValidationResult,
  ValidationWarning
} from './validation';

// Note: Response Caching System exports moved to avoid conflicts

// Webhook and Event Handling System  
// Note: Use individual exports instead of wildcard to avoid conflicts
export {
  WebhookManager,
  WebhookReceiver,
  EventParser,
  EventRouter,
  DeliveryManager,
  EventStore,
  SynchronizationEngine,
  FieldMapping,
  FieldTransformation
} from './webhooks';

// PSA Migration Framework
// Note: Use individual exports instead of wildcard to avoid conflicts
export {
  MigrationEngine,
  ConnectorFactory,
  MappingEngine,
  PreMigrationValidator,
  BaseConnector,
  ConnectWiseManageConnector,
  ServiceNowConnector,
  KaseyaVSAConnector,
  CSVImportConnector,
  createSimpleMigration,
  createCSVImport,
  MigrationConfigBuilder,
  DEFAULT_MAPPINGS,
} from './migration';

// Advanced Queue System with Error Recovery
// Note: Use individual exports instead of wildcard to avoid conflicts
export {
  QueueManager,
  MemoryBackend,
  SQLiteBackend,
  RedisBackend,
  PriorityScheduler,
  CircuitBreakerManager,
  QueueMonitor,
  createQueueManager,
  createDefaultConfiguration,
} from './queue';

// Business Rule Enforcement System
// Note: Use individual exports instead of wildcard to avoid conflicts
export {
  BusinessRule,
  BaseBusinessRule,
  RequiredFieldRule,
  PatternRule,
  RangeRule,
  CompositeRule,
  RulePriority,
  RuleContext,
  ValidationResult as BusinessValidationResult,
  ValidationSeverity,
  ValidationIssue,
  BusinessRuleEngine,
  RuleEngineOptions,
  RuleExecutionStats,
  ConditionalRequiredRule,
  DateRangeRule,
  SumValidationRule,
  MutuallyExclusiveRule,
  DependentFieldsRule,
  PercentageSumRule,
  EntityRuleFactory,
  TicketBusinessRules,
  CompanyBusinessRules,
  ContactBusinessRules,
  ProjectBusinessRules,
  ContractBusinessRules,
  TaskBusinessRules,
  TimeEntryBusinessRules,
  BusinessRuleConfig,
  RuleConfigurationManager,
  DefaultRuleConfiguration,
  BusinessRuleMiddleware,
  BusinessRuleEnhancedClient,
  ValidationError as BusinessValidationError,
  ValidateEntity
} from './business-rules';

// Error Handling System
export {
  ErrorLogger,
  LogLevel,
  LogDestination,
  LogContext,
  ErrorContext,
  defaultErrorLogger
} from './errors/ErrorLogger';

export {
  CircuitBreaker,
  CircuitBreakerState,
  CircuitBreakerOptions,
  CircuitBreakerMetrics
} from './errors/CircuitBreaker';

export {
  RetryStrategy,
  RetryOptions,
  ExponentialBackoffOptions,
  ExponentialBackoffStrategy,
  LinearBackoffStrategy,
  FixedDelayStrategy
} from './errors/RetryStrategy';

// Referential Integrity System
export {
  ReferentialIntegrityManager,
  defaultIntegrityManager,
  RelationshipType,
  ReferentialAction,
  EntityRelationship,
  IntegrityConstraint,
  IntegrityContext,
  IntegrityViolation,
  IntegrityManagerOptions,
  RelationshipGraph,
  GraphNode,
  GraphEdge,
  EntityPath,
  DependencyInfo,
  CycleInfo
} from './referential-integrity';

// Request Batching System
export {
  BatchManager,
  BatchQueue,
  BatchOptimizer,
  BatchMetricsCollector,
  SizeBasedStrategy,
  TimeBasedStrategy,
  HybridStrategy,
  PriorityAwareStrategy,
  AdaptiveStrategy,
  BatchStrategyFactory,
  BatchResultBuilder,
  BatchResultAnalyzer,
  createDefaultBatchConfig,
  createHighThroughputBatchConfig,
  createLowLatencyBatchConfig,
  createDevelopmentBatchConfig,
  createBatchRequest,
  calculateOptimalBatchSize,
  analyzeBatchPerformance
} from './batching';

// Response Caching System
export {
  CacheManager,
  ICacheStore,
  MemoryCacheStore,
  RedisCacheStore,
  FileCacheStore,
  CacheInvalidator,
  CacheKeyGenerator,
  CacheMetricsCollector,
  TTLManager,
  createAutotaskCacheManager,
  CacheConfigBuilder,
  CacheStrategyExecutor,
  KeyStrategy,
  TTLStrategy,
  VolatilityLevel,
  MetricEvent,
  cached,
  DEFAULT_ENTITY_CONFIGS
} from './caching';
