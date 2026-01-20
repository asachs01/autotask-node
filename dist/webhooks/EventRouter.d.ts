/**
 * Event router with pattern-based routing system for webhook events
 */
import winston from 'winston';
import { EventEmitter } from 'events';
import { WebhookEvent, WebhookFilter } from './types/WebhookTypes';
import { EventRoute, RoutingResult, FilterEngine, CompiledFilter, FilterValidationResult } from './types/EventTypes';
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
export declare class EventRouter extends EventEmitter implements FilterEngine {
    private routes;
    private compiledFilters;
    private config;
    private logger;
    private metrics;
    private circuitBreakers;
    private activeHandlers;
    constructor(config?: Partial<RouterConfig>, logger?: winston.Logger);
    private createDefaultLogger;
    private initializeMetrics;
    addRoute(route: EventRoute): void;
    removeRoute(routeId: string): boolean;
    getRoutes(): EventRoute[];
    getRoute(routeId: string): EventRoute | undefined;
    updateRoute(routeId: string, updates: Partial<EventRoute>): boolean;
    route(event: WebhookEvent): Promise<RoutingResult>;
    private findMatchingRoutes;
    evaluate(event: WebhookEvent, filter: WebhookFilter): boolean;
    private evaluateCondition;
    private getNestedValue;
    compile(filter: WebhookFilter): CompiledFilter;
    private compileFilter;
    validateFilter(filter: WebhookFilter): FilterValidationResult;
    private generateFilterId;
    private executeHandler;
    private executeWithTimeout;
    private executeWithConcurrencyLimit;
    private isCircuitOpen;
    private updateCircuitBreaker;
    private resetCircuitBreaker;
    private initializeRouteMetrics;
    private updateRouteMetrics;
    private updateAverageRoutingTime;
    private updateAverageExecutionTime;
    private validateRoute;
    getMetrics(): RouterMetrics;
    getRouteMetrics(routeId: string): RouteMetrics | undefined;
    resetMetrics(): void;
    getCircuitBreakerState(routeId: string): CircuitBreakerState | undefined;
    setConfig(config: Partial<RouterConfig>): void;
    getConfig(): RouterConfig;
}
//# sourceMappingURL=EventRouter.d.ts.map