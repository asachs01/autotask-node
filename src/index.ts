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
  BatchManager,
  QueueMonitor,
  createQueueManager,
  createDefaultConfiguration,
} from './queue';
