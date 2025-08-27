/**
 * Event router with pattern-based routing system for webhook events
 */

import winston from 'winston';
import { EventEmitter } from 'events';
import {
  WebhookEvent,
  WebhookHandlerResult,
  WebhookFilter,
  FilterCondition,
} from './types/WebhookTypes';
import {
  EventRoute,
  RoutingResult,
  MatchedRoute,
  FilterEngine,
  CompiledFilter,
  FilterValidationResult,
} from './types/EventTypes';

export interface RouterConfig {
  enableMetrics: boolean;
  maxConcurrentHandlers: number;
  handlerTimeout: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  enableRetries: boolean;
  maxRetries: number;
  retryDelay: number;
}

export interface RouterMetrics {
  totalEvents: number;
  routedEvents: number;
  failedRoutings: number;
  handlerExecutions: number;
  failedExecutions: number;
  averageRoutingTime: number;
  averageExecutionTime: number;
  routeMetrics: Map<string, RouteMetrics>;
}

export interface RouteMetrics {
  routeId: string;
  matchCount: number;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  lastExecuted?: Date;
  errors: Array<{
    timestamp: Date;
    error: string;
    eventId: string;
  }>;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half_open';
  failureCount: number;
  lastFailure?: Date;
  nextAttempt?: Date;
}

export class EventRouter extends EventEmitter implements FilterEngine {
  private routes: Map<string, EventRoute> = new Map();
  private compiledFilters: Map<string, CompiledFilter> = new Map();
  private config: RouterConfig;
  private logger: winston.Logger;
  private metrics: RouterMetrics;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private activeHandlers: Set<string> = new Set();

  constructor(config: Partial<RouterConfig> = {}, logger?: winston.Logger) {
    super();

    this.config = {
      enableMetrics: true,
      maxConcurrentHandlers: 10,
      handlerTimeout: 30000, // 30 seconds
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      enableRetries: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    this.logger = logger || this.createDefaultLogger();
    this.metrics = this.initializeMetrics();

    // Setup error handling
    this.on('error', error => {
      this.logger.error('EventRouter error', {
        error: error.message,
        stack: error.stack,
      });
    });
  }

  private createDefaultLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'event-router' },
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

  private initializeMetrics(): RouterMetrics {
    return {
      totalEvents: 0,
      routedEvents: 0,
      failedRoutings: 0,
      handlerExecutions: 0,
      failedExecutions: 0,
      averageRoutingTime: 0,
      averageExecutionTime: 0,
      routeMetrics: new Map(),
    };
  }

  // Route management methods
  public addRoute(route: EventRoute): void {
    this.validateRoute(route);

    this.routes.set(route.id, route);
    this.compileFilter(route.id, route.filter);

    if (this.config.enableMetrics) {
      this.initializeRouteMetrics(route.id);
    }

    this.logger.info('Route added', {
      routeId: route.id,
      routeName: route.name,
      handlerName: route.handler.name,
    });

    this.emit('route:added', route);
  }

  public removeRoute(routeId: string): boolean {
    const route = this.routes.get(routeId);
    if (!route) {
      return false;
    }

    this.routes.delete(routeId);
    this.compiledFilters.delete(routeId);
    this.metrics.routeMetrics.delete(routeId);
    this.circuitBreakers.delete(routeId);

    this.logger.info('Route removed', { routeId, routeName: route.name });
    this.emit('route:removed', route);

    return true;
  }

  public getRoutes(): EventRoute[] {
    return Array.from(this.routes.values());
  }

  public getRoute(routeId: string): EventRoute | undefined {
    return this.routes.get(routeId);
  }

  public updateRoute(routeId: string, updates: Partial<EventRoute>): boolean {
    const route = this.routes.get(routeId);
    if (!route) {
      return false;
    }

    const updatedRoute = { ...route, ...updates };
    this.validateRoute(updatedRoute);

    this.routes.set(routeId, updatedRoute);

    if (updates.filter) {
      this.compileFilter(routeId, updates.filter);
    }

    this.logger.info('Route updated', {
      routeId,
      routeName: updatedRoute.name,
    });
    this.emit('route:updated', updatedRoute);

    return true;
  }

  // Main routing method
  public async route(event: WebhookEvent): Promise<RoutingResult> {
    const startTime = Date.now();
    const matchedRoutes: MatchedRoute[] = [];

    try {
      if (this.config.enableMetrics) {
        this.metrics.totalEvents++;
      }

      this.logger.debug('Routing event', {
        eventId: event.id,
        eventType: event.type,
        entityType: event.entityType,
        action: event.action,
      });

      // Find matching routes
      const routes = this.findMatchingRoutes(event);

      if (routes.length === 0) {
        this.logger.debug('No matching routes found', { eventId: event.id });
        return {
          matched: false,
          routes: [],
          executionTime: Date.now() - startTime,
        };
      }

      // Sort routes by priority
      routes.sort((a, b) => b.priority - a.priority);

      // Execute handlers concurrently with limit
      const executionPromises = routes.map(route =>
        this.executeHandler(route, event)
      );
      const results = await this.executeWithConcurrencyLimit(executionPromises);

      // Process results
      for (let i = 0; i < results.length; i++) {
        const route = routes[i];
        const result = results[i];

        matchedRoutes.push({
          route,
          matched: true,
          executionTime: result.executionTime,
          result: result.success ? result.data : undefined,
          error: result.success
            ? undefined
            : new Error(
                result.errors?.[0]?.message || 'Handler execution failed'
              ),
        });

        if (this.config.enableMetrics) {
          this.updateRouteMetrics(route.id, result);
        }
      }

      if (this.config.enableMetrics) {
        this.metrics.routedEvents++;
        this.updateAverageRoutingTime(Date.now() - startTime);
      }

      this.logger.debug('Event routed successfully', {
        eventId: event.id,
        matchedRoutes: matchedRoutes.length,
        executionTime: Date.now() - startTime,
      });

      return {
        matched: true,
        routes: matchedRoutes,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      if (this.config.enableMetrics) {
        this.metrics.failedRoutings++;
      }

      this.logger.error('Error routing event', {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
      });

      this.emit('error', error);

      return {
        matched: false,
        routes: matchedRoutes,
        executionTime: Date.now() - startTime,
      };
    }
  }

  private findMatchingRoutes(event: WebhookEvent): EventRoute[] {
    const matchingRoutes: EventRoute[] = [];

    for (const route of this.routes.values()) {
      if (!route.enabled) {
        continue;
      }

      // Check circuit breaker
      if (this.config.enableCircuitBreaker && this.isCircuitOpen(route.id)) {
        continue;
      }

      // Check if event matches route filter
      if (this.evaluate(event, route.filter)) {
        matchingRoutes.push(route);
      }
    }

    return matchingRoutes;
  }

  // Filter evaluation implementation
  public evaluate(event: WebhookEvent, filter: WebhookFilter): boolean {
    try {
      // Check entity type filter
      if (filter.entityType) {
        const entityTypes = Array.isArray(filter.entityType)
          ? filter.entityType
          : [filter.entityType];
        if (!entityTypes.includes(event.entityType)) {
          return false;
        }
      }

      // Check action filter
      if (filter.action) {
        const actions = Array.isArray(filter.action)
          ? filter.action
          : [filter.action];
        if (!actions.includes(event.action)) {
          return false;
        }
      }

      // Check conditions
      if (filter.conditions && filter.conditions.length > 0) {
        const conditionsMatch = filter.conditions.every(condition =>
          this.evaluateCondition(event, condition)
        );
        if (!conditionsMatch) {
          return false;
        }
      }

      // Check custom filter
      if (filter.customFilter) {
        return filter.customFilter(event);
      }

      return true;
    } catch (error) {
      this.logger.error('Error evaluating filter', {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  private evaluateCondition(
    event: WebhookEvent,
    condition: FilterCondition
  ): boolean {
    const value = this.getNestedValue(event, condition.field);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value);
      case 'not_contains':
        return typeof value === 'string' && !value.includes(condition.value);
      case 'in':
        return (
          Array.isArray(condition.value) && condition.value.includes(value)
        );
      case 'not_in':
        return (
          Array.isArray(condition.value) && !condition.value.includes(value)
        );
      case 'exists':
        return value !== undefined && value !== null;
      case 'not_exists':
        return value === undefined || value === null;
      default:
        this.logger.warn('Unknown condition operator', {
          operator: condition.operator,
        });
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  public compile(filter: WebhookFilter): CompiledFilter {
    const id = this.generateFilterId(filter);
    const compiledAt = new Date();

    const compiledFilter: CompiledFilter = {
      id,
      originalFilter: filter,
      compiledAt,
      execute: (event: WebhookEvent) => this.evaluate(event, filter),
    };

    return compiledFilter;
  }

  private compileFilter(routeId: string, filter: WebhookFilter): void {
    const compiled = this.compile(filter);
    this.compiledFilters.set(routeId, compiled);
  }

  public validateFilter(filter: WebhookFilter): FilterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate conditions
    if (filter.conditions) {
      for (const condition of filter.conditions) {
        if (!condition.field) {
          errors.push('Condition field is required');
        }
        if (!condition.operator) {
          errors.push('Condition operator is required');
        }
        if (
          condition.value === undefined &&
          !['exists', 'not_exists'].includes(condition.operator)
        ) {
          errors.push(
            'Condition value is required for operator ' + condition.operator
          );
        }
      }
    }

    // Check for potentially inefficient filters
    if (
      !filter.entityType &&
      !filter.action &&
      (!filter.conditions || filter.conditions.length === 0)
    ) {
      warnings.push('Filter matches all events - this may impact performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private generateFilterId(filter: WebhookFilter): string {
    const filterString = JSON.stringify(filter, Object.keys(filter).sort());
    return `filter_${Date.now()}_${Buffer.from(filterString).toString('base64').slice(0, 8)}`;
  }

  // Handler execution
  private async executeHandler(
    route: EventRoute,
    event: WebhookEvent
  ): Promise<WebhookHandlerResult & { executionTime: number }> {
    const startTime = Date.now();
    const handlerId = `${route.id}_${event.id}`;

    try {
      // Check concurrent handler limit
      if (this.activeHandlers.size >= this.config.maxConcurrentHandlers) {
        throw new Error('Max concurrent handlers reached');
      }

      this.activeHandlers.add(handlerId);

      // Execute with timeout
      const result = await this.executeWithTimeout(
        route.handler.handle(event),
        this.config.handlerTimeout
      );

      // Reset circuit breaker on success
      if (this.config.enableCircuitBreaker) {
        this.resetCircuitBreaker(route.id);
      }

      if (this.config.enableMetrics) {
        this.metrics.handlerExecutions++;
        this.updateAverageExecutionTime(Date.now() - startTime);
      }

      return {
        ...result,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      // Update circuit breaker on failure
      if (this.config.enableCircuitBreaker) {
        this.updateCircuitBreaker(route.id);
      }

      if (this.config.enableMetrics) {
        this.metrics.failedExecutions++;
      }

      this.logger.error('Handler execution failed', {
        routeId: route.id,
        handlerName: route.handler.name,
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        errors: [
          {
            code: 'HANDLER_EXECUTION_ERROR',
            message: error instanceof Error ? error.message : String(error),
          },
        ],
        executionTime: Date.now() - startTime,
      };
    } finally {
      this.activeHandlers.delete(handlerId);
    }
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error('Handler execution timeout')),
          timeoutMs
        )
      ),
    ]);
  }

  private async executeWithConcurrencyLimit<T>(
    promises: Promise<T>[]
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < promises.length; i++) {
      const promise = promises[i].then(result => {
        results[i] = result;
      });

      executing.push(promise);

      if (executing.length >= this.config.maxConcurrentHandlers) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }

  // Circuit breaker implementation
  private isCircuitOpen(routeId: string): boolean {
    const state = this.circuitBreakers.get(routeId);
    if (!state) {
      return false;
    }

    if (state.state === 'open') {
      if (state.nextAttempt && Date.now() > state.nextAttempt.getTime()) {
        state.state = 'half_open';
        return false;
      }
      return true;
    }

    return false;
  }

  private updateCircuitBreaker(routeId: string): void {
    let state = this.circuitBreakers.get(routeId);
    if (!state) {
      state = { state: 'closed', failureCount: 0 };
      this.circuitBreakers.set(routeId, state);
    }

    state.failureCount++;
    state.lastFailure = new Date();

    if (state.failureCount >= this.config.circuitBreakerThreshold) {
      state.state = 'open';
      state.nextAttempt = new Date(Date.now() + 60000); // 1 minute

      this.logger.warn('Circuit breaker opened', {
        routeId,
        failureCount: state.failureCount,
      });
    }
  }

  private resetCircuitBreaker(routeId: string): void {
    const state = this.circuitBreakers.get(routeId);
    if (state) {
      state.failureCount = 0;
      state.state = 'closed';
      state.lastFailure = undefined;
      state.nextAttempt = undefined;
    }
  }

  // Metrics methods
  private initializeRouteMetrics(routeId: string): void {
    this.metrics.routeMetrics.set(routeId, {
      routeId,
      matchCount: 0,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageExecutionTime: 0,
      errors: [],
    });
  }

  private updateRouteMetrics(
    routeId: string,
    result: WebhookHandlerResult & { executionTime: number }
  ): void {
    const metrics = this.metrics.routeMetrics.get(routeId);
    if (!metrics) {
      return;
    }

    metrics.matchCount++;
    metrics.executionCount++;
    metrics.lastExecuted = new Date();

    if (result.success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
      if (result.errors) {
        metrics.errors.push({
          timestamp: new Date(),
          error: result.errors[0].message,
          eventId: '', // This would need to be passed in
        });

        // Keep only last 10 errors
        if (metrics.errors.length > 10) {
          metrics.errors = metrics.errors.slice(-10);
        }
      }
    }

    // Update average execution time
    const totalTime =
      metrics.averageExecutionTime * (metrics.executionCount - 1) +
      result.executionTime;
    metrics.averageExecutionTime = totalTime / metrics.executionCount;
  }

  private updateAverageRoutingTime(time: number): void {
    const totalTime =
      this.metrics.averageRoutingTime * (this.metrics.totalEvents - 1) + time;
    this.metrics.averageRoutingTime = totalTime / this.metrics.totalEvents;
  }

  private updateAverageExecutionTime(time: number): void {
    const totalTime =
      this.metrics.averageExecutionTime * (this.metrics.handlerExecutions - 1) +
      time;
    this.metrics.averageExecutionTime =
      totalTime / this.metrics.handlerExecutions;
  }

  // Validation methods
  private validateRoute(route: EventRoute): void {
    if (!route.id) {
      throw new Error('Route ID is required');
    }
    if (!route.name) {
      throw new Error('Route name is required');
    }
    if (!route.handler) {
      throw new Error('Route handler is required');
    }
    if (!route.filter) {
      throw new Error('Route filter is required');
    }
    if (typeof route.priority !== 'number' || route.priority < 0) {
      throw new Error('Route priority must be a non-negative number');
    }

    const filterValidation = this.validateFilter(route.filter);
    if (!filterValidation.valid) {
      throw new Error(`Invalid filter: ${filterValidation.errors.join(', ')}`);
    }
  }

  // Public utility methods
  public getMetrics(): RouterMetrics {
    return { ...this.metrics };
  }

  public getRouteMetrics(routeId: string): RouteMetrics | undefined {
    const metrics = this.metrics.routeMetrics.get(routeId);
    return metrics ? { ...metrics } : undefined;
  }

  public resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }

  public getCircuitBreakerState(
    routeId: string
  ): CircuitBreakerState | undefined {
    const state = this.circuitBreakers.get(routeId);
    return state ? { ...state } : undefined;
  }

  public setConfig(config: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): RouterConfig {
    return { ...this.config };
  }
}
