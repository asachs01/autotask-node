/**
 * Comprehensive webhook manager that orchestrates all webhook system components
 */

import winston from 'winston';
import { EventEmitter } from 'events';
import { WebhookReceiver } from './WebhookReceiver';
import { EventParser, ParsedWebhookResult } from './EventParser';
import { EventRouter } from './EventRouter';
import { DeliveryManager } from './reliability/DeliveryManager';
import { EventStore } from './reliability/EventStore';
import { SynchronizationEngine } from './patterns/SynchronizationPatterns';
import {
  WebhookSystemConfig,
  WebhookHandler,
  WebhookEvent,
  WebhookMiddleware,
  WebhookMetrics,
} from './types/WebhookTypes';
import { AutotaskWebhookEvent } from '../events/types/AutotaskEvents';

export interface WebhookManagerConfig extends WebhookSystemConfig {
  autoStart?: boolean;
  enableHealthCheck?: boolean;
  healthCheckInterval?: number;
}

export interface WebhookSystemMetrics {
  receiver: {
    isRunning: boolean;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastRequestAt?: Date;
  };
  parser: {
    totalParsed: number;
    successfulParsed: number;
    failedParsed: number;
    averageParsingTime: number;
  };
  router: WebhookMetrics;
  delivery: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    retryingJobs: number;
    deadLetterJobs: number;
    averageProcessingTime: number;
  };
  eventStore: {
    totalEvents: number;
    storageSize: number;
    memoryEvents: number;
    redisEvents: number;
  };
  sync?: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageSyncTime: number;
  };
}

export interface WebhookSystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  components: {
    receiver: 'healthy' | 'unhealthy';
    parser: 'healthy' | 'unhealthy';
    router: 'healthy' | 'unhealthy';
    delivery: 'healthy' | 'unhealthy';
    eventStore: 'healthy' | 'unhealthy';
    sync: 'healthy' | 'unhealthy' | 'disabled';
  };
  lastHealthCheck: Date;
  issues: string[];
}

export class WebhookManager extends EventEmitter {
  private config: WebhookManagerConfig;
  private logger: winston.Logger;

  // Core components
  private receiver?: WebhookReceiver;
  private parser: EventParser;
  private router: EventRouter;
  private deliveryManager?: DeliveryManager;
  private eventStore?: EventStore;
  private syncEngine?: SynchronizationEngine;

  // State management
  private isInitialized: boolean = false;
  private isRunning: boolean = false;
  private startTime?: Date;
  private healthCheckTimer?: ReturnType<typeof setTimeout>;
  private lastHealth?: WebhookSystemHealth;

  // Metrics
  private metrics: WebhookSystemMetrics;

  constructor(config: WebhookManagerConfig, logger?: winston.Logger) {
    super();

    this.config = config;
    this.logger = logger || this.createDefaultLogger();
    this.metrics = this.initializeMetrics();

    // Initialize core components
    this.parser = new EventParser(
      {
        validateSchema: true,
        enrichEvents: true,
        generateIds: true,
        preserveRawData: false,
      },
      this.logger
    );

    this.router = new EventRouter(
      {
        enableMetrics: true,
        maxConcurrentHandlers: 20,
        handlerTimeout: 30000,
        enableCircuitBreaker: true,
        circuitBreakerThreshold: 5,
      },
      this.logger
    );

    this.setupEventHandlers();
  }

  private createDefaultLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'webhook-manager' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  private initializeMetrics(): WebhookSystemMetrics {
    return {
      receiver: {
        isRunning: false,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
      },
      parser: {
        totalParsed: 0,
        successfulParsed: 0,
        failedParsed: 0,
        averageParsingTime: 0,
      },
      router: {
        totalEvents: 0,
        processedEvents: 0,
        failedEvents: 0,
        averageProcessingTime: 0,
        eventsByType: {},
        eventsByAction: {},
        handlerMetrics: {},
      },
      delivery: {
        totalJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        retryingJobs: 0,
        deadLetterJobs: 0,
        averageProcessingTime: 0,
      },
      eventStore: {
        totalEvents: 0,
        storageSize: 0,
        memoryEvents: 0,
        redisEvents: 0,
      },
    };
  }

  private setupEventHandlers(): void {
    // Router events
    this.router.on('error', error => {
      this.logger.error('Router error', { error: error.message });
      this.emit('error', error);
    });

    // Parser events
    this.on('webhook:parsed', (result: ParsedWebhookResult) => {
      this.updateParserMetrics(result);
    });

    // Generic error handling
    this.on('error', error => {
      this.logger.error('Webhook manager error', {
        error: error.message,
        stack: error.stack,
      });
    });
  }

  // Initialization and lifecycle methods
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.logger.info('Initializing webhook manager...');

      // Initialize webhook receiver
      if (this.config.server) {
        this.receiver = new WebhookReceiver(
          this.config.server,
          this.config.security,
          this.logger
        );

        // Set up receiver to process webhooks through our pipeline
        this.receiver
          .getApp()
          .post(
            this.config.server.path || '/webhook',
            async (req: any, res: any) => {
              try {
                const result = await this.processWebhook(req.body, req);
                res.status(result.success ? 200 : 400).json(result);
              } catch (error) {
                this.logger.error('Webhook processing error', {
                  error: error instanceof Error ? error.message : String(error),
                });
                res.status(500).json({
                  success: false,
                  message: 'Internal server error',
                });
              }
            }
          );
      }

      // Initialize delivery manager
      if (this.config.delivery && this.config.eventStore?.type === 'redis') {
        this.deliveryManager = new DeliveryManager(
          {
            redis: this.config.eventStore.config,
            defaultDeliveryOptions: this.config.delivery,
            queuePrefix: 'webhooks',
            enableMetrics: true,
            cleanupInterval: 60000,
            maxJobAge: 24 * 60 * 60 * 1000, // 24 hours
          },
          this.logger
        );

        this.deliveryManager.on('job:completed', job => {
          this.logger.debug('Job completed', { jobId: job.id });
        });

        this.deliveryManager.on('job:failed', (job, error) => {
          this.logger.warn('Job failed', {
            jobId: job.id,
            error: error.message,
          });
        });
      }

      // Initialize event store
      if (this.config.eventStore) {
        this.eventStore = new EventStore(
          {
            redis: this.config.eventStore.config,
            keyPrefix: 'webhook_events',
            maxEventAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            batchSize: 100,
            enableCompression: true,
            enableIndexing: true,
            persistenceMode: this.config.eventStore.type as any,
          },
          this.logger
        );
      }

      // Initialize synchronization engine
      this.syncEngine = new SynchronizationEngine(this.logger);

      this.syncEngine.on('sync:completed', result => {
        this.logger.info('Sync completed', {
          syncId: result.syncId,
          entityType: result.entityType,
          success: result.success,
        });
      });

      this.syncEngine.on('sync:failed', (result, error) => {
        this.logger.error('Sync failed', {
          syncId: result.syncId,
          error: error.message,
        });
      });

      // Setup health monitoring
      if (this.config.enableHealthCheck) {
        this.setupHealthMonitoring();
      }

      this.isInitialized = true;
      this.logger.info('Webhook manager initialized successfully');
      this.emit('initialized');

      // Auto start if configured
      if (this.config.autoStart) {
        await this.start();
      }
    } catch (error) {
      this.logger.error('Failed to initialize webhook manager', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  public async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isRunning) {
      return;
    }

    try {
      this.logger.info('Starting webhook manager...');

      // Start receiver
      if (this.receiver) {
        await this.receiver.start();
        this.metrics.receiver.isRunning = true;
      }

      this.isRunning = true;
      this.startTime = new Date();

      this.logger.info('Webhook manager started successfully');
      this.emit('started');
    } catch (error) {
      this.logger.error('Failed to start webhook manager', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      this.logger.info('Stopping webhook manager...');

      // Stop health monitoring
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
      }

      // Stop components
      if (this.receiver) {
        await this.receiver.stop();
        this.metrics.receiver.isRunning = false;
      }

      if (this.deliveryManager) {
        await this.deliveryManager.shutdown();
      }

      if (this.eventStore) {
        await this.eventStore.shutdown();
      }

      this.isRunning = false;

      this.logger.info('Webhook manager stopped successfully');
      this.emit('stopped');
    } catch (error) {
      this.logger.error('Failed to stop webhook manager', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // Core webhook processing pipeline
  private async processWebhook(payload: any, request?: any): Promise<any> {
    const startTime = Date.now();
    let parsedEvent: WebhookEvent | undefined;

    try {
      // Step 1: Parse the webhook payload
      const parseResult = await this.parser.parse(payload, {
        userAgent: request?.get('User-Agent'),
        ipAddress: request?.ip,
      });

      this.emit('webhook:parsed', parseResult);

      if (!parseResult.success || !parseResult.event) {
        return {
          success: false,
          message: 'Failed to parse webhook payload',
          errors: parseResult.errors,
        };
      }

      parsedEvent = parseResult.event;

      // Step 2: Store the event if event store is configured
      if (this.eventStore) {
        await this.eventStore.save(parsedEvent);
      }

      // Step 3: Route the event to handlers
      const routingResult = await this.router.route(parsedEvent);

      // Step 4: Handle delivery if delivery manager is configured
      if (this.deliveryManager && routingResult.matched) {
        for (const matchedRoute of routingResult.routes) {
          if (matchedRoute.matched && !matchedRoute.error) {
            await this.deliveryManager.deliver(
              parsedEvent,
              matchedRoute.route.handler,
              this.config.delivery
            );
          }
        }
      }

      // Step 5: Handle synchronization if sync engine is configured
      if (this.syncEngine && parsedEvent.type !== 'system.event') {
        await this.syncEngine.syncFromAutotask(
          parsedEvent as AutotaskWebhookEvent
        );
      }

      // Update metrics
      this.updateReceiverMetrics(true, Date.now() - startTime);

      return {
        success: true,
        message: 'Webhook processed successfully',
        eventId: parsedEvent.id,
        processedAt: new Date(),
        routingResult: {
          matched: routingResult.matched,
          handlersExecuted: routingResult.routes.length,
          executionTime: routingResult.executionTime,
        },
      };
    } catch (error) {
      this.updateReceiverMetrics(false, Date.now() - startTime);

      this.logger.error('Webhook processing error', {
        error: error instanceof Error ? error.message : String(error),
        eventId: parsedEvent?.id,
        processingTime: Date.now() - startTime,
      });

      return {
        success: false,
        message: 'Webhook processing failed',
        eventId: parsedEvent?.id,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Handler management
  public addHandler(handler: WebhookHandler): void {
    // Create a route for the handler
    const route = {
      id: `route_${handler.id}`,
      name: `Route for ${handler.name}`,
      description: handler.description,
      priority: handler.priority || 0,
      filter: handler.filter || {},
      handler,
      enabled: handler.enabled !== false,
    };

    this.router.addRoute(route);

    this.logger.info('Handler added', {
      handlerId: handler.id,
      handlerName: handler.name,
    });
  }

  public removeHandler(handlerId: string): boolean {
    const routeId = `route_${handlerId}`;
    const removed = this.router.removeRoute(routeId);

    if (removed) {
      this.logger.info('Handler removed', { handlerId });
    }

    return removed;
  }

  public getHandlers(): WebhookHandler[] {
    return this.router.getRoutes().map(route => route.handler);
  }

  // Middleware management
  public addMiddleware(middleware: WebhookMiddleware): void {
    if (this.receiver) {
      this.receiver.addMiddleware(middleware);
    }
  }

  public removeMiddleware(name: string): boolean {
    if (this.receiver) {
      return this.receiver.removeMiddleware(name);
    }
    return false;
  }

  // Synchronization management
  public getSyncEngine(): SynchronizationEngine | undefined {
    return this.syncEngine;
  }

  // Health monitoring
  private setupHealthMonitoring(): void {
    const interval = this.config.healthCheckInterval || 30000; // 30 seconds

    this.healthCheckTimer = setInterval(async () => {
      try {
        const health = await this.checkHealth();
        this.lastHealth = health;
        this.emit('health:check', health);

        if (health.status !== 'healthy') {
          this.logger.warn('System health degraded', {
            status: health.status,
            issues: health.issues,
          });
        }
      } catch (error) {
        this.logger.error('Health check failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, interval);
  }

  public async checkHealth(): Promise<WebhookSystemHealth> {
    const issues: string[] = [];

    const components = {
      receiver: this.receiver?.isListening()
        ? ('healthy' as const)
        : ('unhealthy' as const),
      parser: 'healthy' as const, // Parser is stateless
      router: 'healthy' as const, // Router is always healthy if initialized
      delivery: this.deliveryManager
        ? ('healthy' as const)
        : ('unhealthy' as const),
      eventStore: this.eventStore
        ? ('healthy' as const)
        : ('unhealthy' as const),
      sync: this.syncEngine ? ('healthy' as const) : ('disabled' as const),
    };

    // Check for issues
    if (components.receiver === 'unhealthy') {
      issues.push('Webhook receiver is not running');
    }
    if (components.delivery === 'unhealthy') {
      issues.push('Delivery manager is not initialized');
    }
    if (components.eventStore === 'unhealthy') {
      issues.push('Event store is not initialized');
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (issues.length === 0) {
      status = 'healthy';
    } else if (issues.length <= 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      components,
      lastHealthCheck: new Date(),
      issues,
    };
  }

  // Metrics methods
  private updateReceiverMetrics(
    success: boolean,
    processingTime: number
  ): void {
    this.metrics.receiver.totalRequests++;

    if (success) {
      this.metrics.receiver.successfulRequests++;
    } else {
      this.metrics.receiver.failedRequests++;
    }

    const total = this.metrics.receiver.totalRequests;
    const currentAvg = this.metrics.receiver.averageResponseTime;
    this.metrics.receiver.averageResponseTime =
      (currentAvg * (total - 1) + processingTime) / total;
    this.metrics.receiver.lastRequestAt = new Date();
  }

  private updateParserMetrics(result: ParsedWebhookResult): void {
    this.metrics.parser.totalParsed++;

    if (result.success) {
      this.metrics.parser.successfulParsed++;
    } else {
      this.metrics.parser.failedParsed++;
    }

    if (result.metadata?.parsingTime) {
      const total = this.metrics.parser.totalParsed;
      const currentAvg = this.metrics.parser.averageParsingTime;
      this.metrics.parser.averageParsingTime =
        (currentAvg * (total - 1) + result.metadata.parsingTime) / total;
    }
  }

  public getMetrics(): WebhookSystemMetrics {
    // Get fresh metrics from components
    const routerMetrics = this.router.getMetrics();
    const deliveryMetrics = this.deliveryManager?.getMetrics();
    const storeMetrics = this.eventStore?.getMetrics();
    const syncMetrics = this.syncEngine?.getStats();

    return {
      ...this.metrics,
      router: {
        totalEvents: routerMetrics.totalEvents,
        processedEvents: routerMetrics.routedEvents,
        failedEvents: routerMetrics.failedRoutings,
        averageProcessingTime: routerMetrics.averageExecutionTime,
        eventsByType: {},
        eventsByAction: {},
        handlerMetrics: {}
      },
      delivery: deliveryMetrics
        ? {
            totalJobs: deliveryMetrics.totalJobs,
            completedJobs: deliveryMetrics.completedJobs,
            failedJobs: deliveryMetrics.failedJobs,
            retryingJobs: deliveryMetrics.retryingJobs,
            deadLetterJobs: deliveryMetrics.deadLetterJobs,
            averageProcessingTime: deliveryMetrics.averageProcessingTime,
          }
        : this.metrics.delivery,
      eventStore: storeMetrics
        ? {
            totalEvents: storeMetrics.totalEvents,
            storageSize: storeMetrics.storageSize,
            memoryEvents: 0, // Would need to be implemented in EventStore
            redisEvents: 0, // Would need to be implemented in EventStore
          }
        : this.metrics.eventStore,
      sync: syncMetrics
        ? {
            totalSyncs: syncMetrics.totalSyncs,
            successfulSyncs: syncMetrics.successfulSyncs,
            failedSyncs: syncMetrics.failedSyncs,
            averageSyncTime: syncMetrics.averageSyncTime,
          }
        : undefined,
    };
  }

  public getHealth(): WebhookSystemHealth | undefined {
    return this.lastHealth;
  }

  public resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.router.resetMetrics();
    this.syncEngine?.resetStats();
  }

  // Utility methods
  public isHealthy(): boolean {
    return this.isRunning && this.isInitialized;
  }

  public getConfig(): WebhookManagerConfig {
    return { ...this.config };
  }

  public getUptime(): number {
    return this.startTime ? Date.now() - this.startTime.getTime() : 0;
  }
}
