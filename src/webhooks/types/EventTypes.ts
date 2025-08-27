/**
 * Event processing and transformation types
 */

import { WebhookEvent, WebhookHandler, WebhookFilter } from './WebhookTypes';

// Event processing pipeline types
export interface EventProcessor {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  process(event: WebhookEvent): Promise<ProcessedEvent>;
}

export interface ProcessedEvent extends WebhookEvent {
  processed: boolean;
  processedAt: Date;
  processingTime: number;
  transformations: EventTransformation[];
  enrichments: EventEnrichment[];
  errors?: ProcessingError[];
}

export interface EventTransformation {
  id: string;
  name: string;
  appliedAt: Date;
  originalValue: any;
  transformedValue: any;
  field: string;
}

export interface EventEnrichment {
  id: string;
  name: string;
  appliedAt: Date;
  data: any;
  source: string;
}

export interface ProcessingError {
  processorId: string;
  message: string;
  error: any;
  timestamp: Date;
  recoverable: boolean;
}

// Event filtering and routing
export interface EventRouter {
  addRoute(route: EventRoute): void;
  removeRoute(routeId: string): void;
  route(event: WebhookEvent): Promise<RoutingResult>;
  getRoutes(): EventRoute[];
}

export interface EventRoute {
  id: string;
  name: string;
  description?: string;
  priority: number;
  filter: WebhookFilter;
  handler: WebhookHandler;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface RoutingResult {
  matched: boolean;
  routes: MatchedRoute[];
  executionTime: number;
}

export interface MatchedRoute {
  route: EventRoute;
  matched: boolean;
  executionTime?: number;
  result?: any;
  error?: Error;
}

// Event filtering engine
export interface FilterEngine {
  evaluate(event: WebhookEvent, filter: WebhookFilter): boolean;
  compile(filter: WebhookFilter): CompiledFilter;
  validateFilter(filter: WebhookFilter): FilterValidationResult;
}

export interface CompiledFilter {
  id: string;
  originalFilter: WebhookFilter;
  compiledAt: Date;
  execute: (event: WebhookEvent) => boolean;
}

export interface FilterValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Event transformation engine
export interface TransformationEngine {
  addTransformer(transformer: EventTransformer): void;
  removeTransformer(transformerId: string): void;
  transform(event: WebhookEvent): Promise<WebhookEvent>;
  getTransformers(): EventTransformer[];
}

export interface EventTransformer {
  id: string;
  name: string;
  description?: string;
  priority: number;
  condition?: (event: WebhookEvent) => boolean;
  transform: (event: WebhookEvent) => Promise<WebhookEvent | WebhookEvent[]>;
  enabled: boolean;
}

// Event enrichment engine
export interface EnrichmentEngine {
  addEnricher(enricher: EventEnricher): void;
  removeEnricher(enricherId: string): void;
  enrich(event: WebhookEvent): Promise<WebhookEvent>;
  getEnrichers(): EventEnricher[];
}

export interface EventEnricher {
  id: string;
  name: string;
  description?: string;
  priority: number;
  condition?: (event: WebhookEvent) => boolean;
  enrich: (event: WebhookEvent) => Promise<EventEnrichmentData>;
  enabled: boolean;
  cacheResult?: boolean;
  cacheTtl?: number;
}

export interface EventEnrichmentData {
  field: string;
  value: any;
  source: string;
  metadata?: Record<string, any>;
}

// Event replay and reprocessing
export interface EventReplayEngine {
  replay(config: ReplayConfig): AsyncIterableIterator<ReplayResult>;
  getReplayStatus(replayId: string): Promise<ReplayStatus>;
  cancelReplay(replayId: string): Promise<void>;
}

export interface ReplayConfig {
  id: string;
  name?: string;
  fromTimestamp: Date;
  toTimestamp?: Date;
  filter?: WebhookFilter;
  batchSize?: number;
  delayBetweenBatches?: number;
  reprocessHandlers?: boolean;
  targetHandlers?: string[];
}

export interface ReplayResult {
  batchId: string;
  events: WebhookEvent[];
  processedCount: number;
  failedCount: number;
  errors: ReplayError[];
}

export interface ReplayError {
  eventId: string;
  error: string;
  timestamp: Date;
}

export interface ReplayStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    percentComplete: number;
  };
  startedAt: Date;
  completedAt?: Date;
  errors: ReplayError[];
}

// Event aggregation and analytics
export interface EventAggregator {
  aggregate(config: AggregationConfig): Promise<AggregationResult>;
  getAggregationHistory(aggregationId: string): Promise<AggregationResult[]>;
}

export interface AggregationConfig {
  id: string;
  name: string;
  timeWindow: {
    start: Date;
    end: Date;
    interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
  };
  groupBy: string[];
  metrics: AggregationMetric[];
  filter?: WebhookFilter;
}

export interface AggregationMetric {
  name: string;
  field: string;
  operation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
}

export interface AggregationResult {
  id: string;
  timestamp: Date;
  results: AggregationBucket[];
  metadata: {
    totalEvents: number;
    timeRange: {
      start: Date;
      end: Date;
    };
    executionTime: number;
  };
}

export interface AggregationBucket {
  key: Record<string, any>;
  count: number;
  metrics: Record<string, number>;
  timestamp: Date;
}

// Event schema validation
export interface EventSchemaValidator {
  validate(event: WebhookEvent): ValidationResult;
  getSchema(eventType: string): EventSchema;
  registerSchema(schema: EventSchema): void;
  updateSchema(schemaId: string, schema: EventSchema): void;
}

export interface EventSchema {
  id: string;
  eventType: string;
  version: string;
  description?: string;
  schema: any; // JSON Schema
  examples?: any[];
  deprecated?: boolean;
  replacedBy?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  schema: EventSchema;
}

export interface ValidationError {
  path: string;
  message: string;
  value: any;
  schema: any;
}

export interface ValidationWarning {
  path: string;
  message: string;
  value: any;
}

// Event pattern matching
export interface PatternMatcher {
  addPattern(pattern: EventPattern): void;
  removePattern(patternId: string): void;
  match(events: WebhookEvent[]): PatternMatch[];
  getPatterns(): EventPattern[];
}

export interface EventPattern {
  id: string;
  name: string;
  description?: string;
  pattern: PatternDefinition;
  timeWindow?: number; // milliseconds
  enabled: boolean;
}

export interface PatternDefinition {
  sequence?: SequencePattern[];
  conditions?: PatternCondition[];
  within?: number; // time window in milliseconds
}

export interface SequencePattern {
  step: number;
  eventType: string;
  action?: string;
  conditions?: PatternCondition[];
}

export interface PatternCondition {
  field: string;
  operator: string;
  value: any;
  required?: boolean;
}

export interface PatternMatch {
  pattern: EventPattern;
  events: WebhookEvent[];
  matchedAt: Date;
  confidence: number;
  metadata?: Record<string, any>;
}

// Event streaming and real-time processing
export interface EventStream {
  subscribe(filter?: WebhookFilter): EventSubscription;
  publish(event: WebhookEvent): Promise<void>;
  getSubscriptions(): EventSubscription[];
  close(): Promise<void>;
}

export interface EventSubscription {
  id: string;
  filter?: WebhookFilter;
  handler: (event: WebhookEvent) => Promise<void>;
  createdAt: Date;
  active: boolean;
  unsubscribe(): void;
}

// Event buffer and batching
export interface EventBuffer {
  add(event: WebhookEvent): void;
  flush(): Promise<WebhookEvent[]>;
  size(): number;
  clear(): void;
  isFull(): boolean;
}

export interface BatchProcessor {
  processBatch(events: WebhookEvent[]): Promise<BatchProcessingResult>;
  getProcessingStatus(): BatchProcessingStatus;
}

export interface BatchProcessingResult {
  batchId: string;
  totalEvents: number;
  processedEvents: number;
  failedEvents: number;
  processingTime: number;
  results: Array<{
    eventId: string;
    success: boolean;
    result?: any;
    error?: Error;
  }>;
}

export interface BatchProcessingStatus {
  activeJobs: number;
  queuedJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
}

// Event correlation and causality
export interface EventCorrelator {
  correlate(event: WebhookEvent): Promise<EventCorrelation>;
  addCorrelationRule(rule: CorrelationRule): void;
  removeCorrelationRule(ruleId: string): void;
}

export interface EventCorrelation {
  id: string;
  rootEvent: WebhookEvent;
  relatedEvents: WebhookEvent[];
  correlationType: 'causal' | 'temporal' | 'semantic' | 'custom';
  confidence: number;
  metadata?: Record<string, any>;
}

export interface CorrelationRule {
  id: string;
  name: string;
  description?: string;
  sourceEventType: string;
  targetEventType: string;
  correlationLogic: (
    sourceEvent: WebhookEvent,
    candidateEvent: WebhookEvent
  ) => number; // returns confidence 0-1
  timeWindow?: number; // milliseconds
  enabled: boolean;
}
