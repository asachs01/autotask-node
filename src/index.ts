export { AutotaskClient } from './client/AutotaskClient';
export { ValidatedAutotaskClient } from './client/ValidatedAutotaskClient';
export { AutotaskAuth } from './types';
export * from './entities';

// Enterprise Performance System
export * from './performance';
export { AutotaskPerformanceIntegration } from './performance/integration/AutotaskPerformanceIntegration';

// Entity Relationship and Cascade Operations System
export * from './relationships';
export {
  AutotaskRelationshipSystem,
  RelationshipMapper,
  CascadeEngine,
  GraphTraversalEngine,
  SmartLoadingEngine,
  DataIntegrityManager,
  BatchRelationshipProcessor,
} from './relationships';

// Enterprise Validation and Sanitization System
export * from './validation';
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
} from './validation';

// Webhook and Event Handling System
export * from './webhooks';
export {
  WebhookManager,
  WebhookReceiver,
  EventParser,
  EventRouter,
  DeliveryManager,
  EventStore,
  SynchronizationEngine,
  WebhookSimulator,
} from './webhooks';

// PSA Migration Framework
export * from './migration';
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
