/**
 * Circuit Breaker Manager
 *
 * Advanced circuit breaker implementation with adaptive thresholds:
 * - Per-zone circuit breakers to isolate failures
 * - Exponential backoff with jitter
 * - Health monitoring and automatic recovery
 * - Failure pattern analysis and prediction
 * - Dynamic threshold adjustment based on system load
 */

import { EventEmitter } from 'events';
import winston from 'winston';

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  nextRetryTime?: Date;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

export interface CircuitBreakerMetrics {
  zone: string;
  state: CircuitBreakerState;
  failureRate: number;
  averageResponseTime: number;
  requestsPerSecond: number;
  lastStateChange: Date;
  timeInCurrentState: number;
  recoveryAttempts: number;
}

export class CircuitBreakerManager extends EventEmitter {
  private config: CircuitBreakerConfig;
  private logger: winston.Logger;
  private breakers = new Map<string, CircuitBreakerState>();
  private responseTimeHistory = new Map<string, number[]>();
  private requestHistory = new Map<
    string,
    Array<{ timestamp: Date; success: boolean; responseTime: number }>
  >();
  private stateChangeHistory = new Map<
    string,
    Array<{ timestamp: Date; state: string; reason: string }>
  >();

  // Adaptive thresholds
  private adaptiveThresholds = new Map<
    string,
    {
      failureThreshold: number;
      successThreshold: number;
      lastAdjustment: Date;
    }
  >();

  // Health monitoring
  private healthCheckInterval?: ReturnType<typeof setTimeout>;
  private monitoringEnabled = true;

  constructor(config: CircuitBreakerConfig, logger: winston.Logger) {
    super();

    this.config = config;
    this.logger = logger;

    if (this.config.enabled) {
      this.startHealthMonitoring();
    }
  }

  /**
   * Check if requests can be executed for a zone
   */
  canExecute(zone: string): boolean {
    if (!this.config.enabled) {
      return true;
    }

    const breaker = this.getOrCreateBreaker(zone);

    switch (breaker.state) {
      case 'CLOSED':
        return true;

      case 'OPEN':
        // Check if enough time has passed to attempt recovery
        if (breaker.nextRetryTime && new Date() >= breaker.nextRetryTime) {
          this.transitionToHalfOpen(
            zone,
            'Timeout expired, attempting recovery'
          );
          return true;
        }
        return false;

      case 'HALF_OPEN':
        // Allow limited requests to test recovery
        return breaker.successCount < this.getAdaptiveSuccessThreshold(zone);

      default:
        return true;
    }
  }

  /**
   * Record a successful request
   */
  recordSuccess(zone: string, responseTime?: number): void {
    if (!this.config.enabled) {
      return;
    }

    const breaker = this.getOrCreateBreaker(zone);

    breaker.totalRequests++;
    breaker.totalSuccesses++;
    breaker.successCount++;
    breaker.failureCount = Math.max(0, breaker.failureCount - 0.5); // Gradual recovery
    breaker.lastSuccessTime = new Date();

    // Record response time
    if (responseTime !== undefined) {
      this.recordResponseTime(zone, responseTime);
    }

    // Record in history
    this.recordRequestHistory(zone, true, responseTime || 0);

    switch (breaker.state) {
      case 'HALF_OPEN': {
        const successThreshold = this.getAdaptiveSuccessThreshold(zone);
        if (breaker.successCount >= successThreshold) {
          this.transitionToClosed(
            zone,
            `Recovery successful (${breaker.successCount}/${successThreshold})`
          );
        }
        break;
      }

      case 'OPEN':
        // This shouldn't happen normally, but handle gracefully
        this.logger.warn('Received success for OPEN circuit breaker', { zone });
        break;

      case 'CLOSED':
        // Continue normal operation
        break;
    }

    this.emit('success', { zone, responseTime, state: breaker.state });
  }

  /**
   * Record a failed request
   */
  recordFailure(zone: string, error?: Error, responseTime?: number): void {
    if (!this.config.enabled) {
      return;
    }

    const breaker = this.getOrCreateBreaker(zone);

    breaker.totalRequests++;
    breaker.totalFailures++;
    breaker.failureCount++;
    breaker.successCount = 0; // Reset success streak
    breaker.lastFailureTime = new Date();

    // Record response time even for failures
    if (responseTime !== undefined) {
      this.recordResponseTime(zone, responseTime);
    }

    // Record in history
    this.recordRequestHistory(zone, false, responseTime || 0);

    const failureThreshold = this.getAdaptiveFailureThreshold(zone);

    switch (breaker.state) {
      case 'CLOSED':
        if (breaker.failureCount >= failureThreshold) {
          this.transitionToOpen(
            zone,
            `Failure threshold exceeded (${breaker.failureCount}/${failureThreshold})`
          );
        }
        break;

      case 'HALF_OPEN':
        // Any failure during half-open immediately returns to open
        this.transitionToOpen(zone, 'Failure during recovery attempt');
        break;

      case 'OPEN':
        // Reset retry time on continued failures (exponential backoff)
        this.updateRetryTime(zone);
        break;
    }

    this.emit('failure', { zone, error, responseTime, state: breaker.state });
  }

  /**
   * Get circuit breaker metrics for a zone
   */
  getMetrics(zone: string): CircuitBreakerMetrics | null {
    const breaker = this.breakers.get(zone);
    if (!breaker) {
      return null;
    }

    const recentHistory = this.getRecentRequestHistory(zone, 300000); // Last 5 minutes

    const failureRate =
      breaker.totalRequests > 0
        ? breaker.totalFailures / breaker.totalRequests
        : 0;

    const averageResponseTime = this.calculateAverageResponseTime(zone);
    const requestsPerSecond = this.calculateRequestsPerSecond(zone);

    const stateHistory = this.stateChangeHistory.get(zone) || [];
    const lastStateChange =
      stateHistory.length > 0
        ? stateHistory[stateHistory.length - 1].timestamp
        : new Date();

    const timeInCurrentState = Date.now() - lastStateChange.getTime();

    return {
      zone,
      state: { ...breaker },
      failureRate,
      averageResponseTime,
      requestsPerSecond,
      lastStateChange,
      timeInCurrentState,
      recoveryAttempts: stateHistory.filter(
        entry => entry.state === 'HALF_OPEN'
      ).length,
    };
  }

  /**
   * Get metrics for all zones
   */
  getAllMetrics(): CircuitBreakerMetrics[] {
    return Array.from(this.breakers.keys())
      .map(zone => this.getMetrics(zone))
      .filter((metrics): metrics is CircuitBreakerMetrics => metrics !== null);
  }

  /**
   * Manually open circuit breaker for a zone
   */
  forceOpen(zone: string, reason: string): void {
    this.transitionToOpen(zone, `Manually opened: ${reason}`);
  }

  /**
   * Manually close circuit breaker for a zone
   */
  forceClose(zone: string, reason: string): void {
    this.transitionToClosed(zone, `Manually closed: ${reason}`);
  }

  /**
   * Reset circuit breaker for a zone
   */
  reset(zone: string): void {
    const breaker = this.breakers.get(zone);
    if (breaker) {
      breaker.failureCount = 0;
      breaker.successCount = 0;
      breaker.nextRetryTime = undefined;
      this.transitionToClosed(zone, 'Manual reset');
    }

    // Clear history
    this.responseTimeHistory.delete(zone);
    this.requestHistory.delete(zone);
    this.stateChangeHistory.delete(zone);
    this.adaptiveThresholds.delete(zone);
  }

  /**
   * Get current state for all zones
   */
  getStates(): Map<string, CircuitBreakerState> {
    return new Map(this.breakers);
  }

  /**
   * Enable or disable monitoring
   */
  setMonitoring(enabled: boolean): void {
    this.monitoringEnabled = enabled;

    if (enabled && !this.healthCheckInterval) {
      this.startHealthMonitoring();
    } else if (!enabled && this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Shutdown circuit breaker manager
   */
  shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    this.removeAllListeners();
  }

  /**
   * Get or create circuit breaker for zone
   */
  private getOrCreateBreaker(zone: string): CircuitBreakerState {
    let breaker = this.breakers.get(zone);

    if (!breaker) {
      breaker = {
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        totalRequests: 0,
        totalFailures: 0,
        totalSuccesses: 0,
      };

      this.breakers.set(zone, breaker);
      this.recordStateChange(zone, 'CLOSED', 'Initial state');

      this.logger.debug('Created new circuit breaker', { zone });
    }

    return breaker;
  }

  /**
   * Transition to OPEN state
   */
  private transitionToOpen(zone: string, reason: string): void {
    const breaker = this.getOrCreateBreaker(zone);

    if (breaker.state === 'OPEN') {
      return; // Already open
    }

    breaker.state = 'OPEN';
    breaker.successCount = 0;
    this.updateRetryTime(zone);

    this.recordStateChange(zone, 'OPEN', reason);

    this.logger.warn('Circuit breaker opened', { zone, reason });
    this.emit('stateChanged', { zone, state: 'OPEN', reason });
  }

  /**
   * Transition to HALF_OPEN state
   */
  private transitionToHalfOpen(zone: string, reason: string): void {
    const breaker = this.getOrCreateBreaker(zone);

    breaker.state = 'HALF_OPEN';
    breaker.successCount = 0;
    breaker.failureCount = 0;
    breaker.nextRetryTime = undefined;

    this.recordStateChange(zone, 'HALF_OPEN', reason);

    this.logger.info('Circuit breaker half-opened', { zone, reason });
    this.emit('stateChanged', { zone, state: 'HALF_OPEN', reason });
  }

  /**
   * Transition to CLOSED state
   */
  private transitionToClosed(zone: string, reason: string): void {
    const breaker = this.getOrCreateBreaker(zone);

    breaker.state = 'CLOSED';
    breaker.failureCount = 0;
    breaker.successCount = 0;
    breaker.nextRetryTime = undefined;

    this.recordStateChange(zone, 'CLOSED', reason);

    this.logger.info('Circuit breaker closed', { zone, reason });
    this.emit('stateChanged', { zone, state: 'CLOSED', reason });
  }

  /**
   * Update retry time with exponential backoff
   */
  private updateRetryTime(zone: string): void {
    const breaker = this.getOrCreateBreaker(zone);
    const stateHistory = this.stateChangeHistory.get(zone) || [];

    // Count recent failures to determine backoff level
    const recentOpenStates = stateHistory
      .filter(entry => entry.state === 'OPEN')
      .filter(entry => Date.now() - entry.timestamp.getTime() < 3600000); // Last hour

    const backoffLevel = Math.min(recentOpenStates.length, 6); // Max 6 levels
    const baseDelay = this.config.timeout;
    const delay = baseDelay * Math.pow(2, backoffLevel);

    // Add jitter (±25%)
    const jitter = 0.25;
    const jitterDelay = delay * (1 + (Math.random() - 0.5) * 2 * jitter);

    breaker.nextRetryTime = new Date(Date.now() + jitterDelay);

    this.logger.debug('Updated circuit breaker retry time', {
      zone,
      backoffLevel,
      delay: jitterDelay,
      retryTime: breaker.nextRetryTime,
    });
  }

  /**
   * Record response time for adaptive monitoring
   */
  private recordResponseTime(zone: string, responseTime: number): void {
    let history = this.responseTimeHistory.get(zone);
    if (!history) {
      history = [];
      this.responseTimeHistory.set(zone, history);
    }

    history.push(responseTime);

    // Keep only recent history (last 100 requests)
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  /**
   * Record request history for analytics
   */
  private recordRequestHistory(
    zone: string,
    success: boolean,
    responseTime: number
  ): void {
    let history = this.requestHistory.get(zone);
    if (!history) {
      history = [];
      this.requestHistory.set(zone, history);
    }

    history.push({
      timestamp: new Date(),
      success,
      responseTime,
    });

    // Keep only recent history (last 500 requests or 1 hour)
    const oneHourAgo = new Date(Date.now() - 3600000);
    while (
      history.length > 500 ||
      (history.length > 0 && history[0].timestamp < oneHourAgo)
    ) {
      history.shift();
    }
  }

  /**
   * Record state change for analysis
   */
  private recordStateChange(zone: string, state: string, reason: string): void {
    let history = this.stateChangeHistory.get(zone);
    if (!history) {
      history = [];
      this.stateChangeHistory.set(zone, history);
    }

    history.push({
      timestamp: new Date(),
      state,
      reason,
    });

    // Keep only recent history (last 50 changes)
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  /**
   * Get recent request history
   */
  private getRecentRequestHistory(
    zone: string,
    timeWindowMs: number
  ): Array<{ timestamp: Date; success: boolean; responseTime: number }> {
    const history = this.requestHistory.get(zone) || [];
    const cutoff = new Date(Date.now() - timeWindowMs);

    return history.filter(entry => entry.timestamp >= cutoff);
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(zone: string): number {
    const history = this.responseTimeHistory.get(zone) || [];

    if (history.length === 0) {
      return 0;
    }

    const sum = history.reduce((total, time) => total + time, 0);
    return sum / history.length;
  }

  /**
   * Calculate requests per second
   */
  private calculateRequestsPerSecond(zone: string): number {
    const recentHistory = this.getRecentRequestHistory(zone, 60000); // Last minute
    return recentHistory.length / 60;
  }

  /**
   * Get adaptive failure threshold
   */
  private getAdaptiveFailureThreshold(zone: string): number {
    const adaptive = this.adaptiveThresholds.get(zone);
    return adaptive ? adaptive.failureThreshold : this.config.failureThreshold;
  }

  /**
   * Get adaptive success threshold
   */
  private getAdaptiveSuccessThreshold(zone: string): number {
    const adaptive = this.adaptiveThresholds.get(zone);
    return adaptive ? adaptive.successThreshold : this.config.successThreshold;
  }

  /**
   * Update adaptive thresholds based on system behavior
   */
  private updateAdaptiveThresholds(): void {
    for (const zone of this.breakers.keys()) {
      const recentHistory = this.getRecentRequestHistory(zone, 300000); // 5 minutes

      if (recentHistory.length < 10) {
        continue; // Not enough data
      }

      const failureRate =
        recentHistory.filter(entry => !entry.success).length /
        recentHistory.length;
      const avgResponseTime =
        recentHistory.reduce((sum, entry) => sum + entry.responseTime, 0) /
        recentHistory.length;

      let adaptive = this.adaptiveThresholds.get(zone);
      if (!adaptive) {
        adaptive = {
          failureThreshold: this.config.failureThreshold,
          successThreshold: this.config.successThreshold,
          lastAdjustment: new Date(),
        };
        this.adaptiveThresholds.set(zone, adaptive);
      }

      // Adjust thresholds based on observed behavior
      if (failureRate > 0.2) {
        // High failure rate - be more aggressive
        adaptive.failureThreshold = Math.max(2, adaptive.failureThreshold - 1);
        adaptive.successThreshold = Math.min(10, adaptive.successThreshold + 1);
      } else if (failureRate < 0.05) {
        // Low failure rate - be more tolerant
        adaptive.failureThreshold = Math.min(15, adaptive.failureThreshold + 1);
        adaptive.successThreshold = Math.max(2, adaptive.successThreshold - 1);
      }

      // Adjust for response time
      if (avgResponseTime > 10000) {
        // 10 seconds
        // High response time - be more sensitive
        adaptive.failureThreshold = Math.max(2, adaptive.failureThreshold - 1);
      }

      adaptive.lastAdjustment = new Date();
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      return;
    }

    this.healthCheckInterval = setInterval(() => {
      if (!this.monitoringEnabled) {
        return;
      }

      try {
        this.updateAdaptiveThresholds();
        this.performHealthChecks();
        this.cleanupOldData();
      } catch (error) {
        this.logger.error('Circuit breaker health monitoring failed', error);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Perform health checks on all circuit breakers
   */
  private performHealthChecks(): void {
    for (const [zone, breaker] of this.breakers) {
      // Check for stuck OPEN breakers
      if (breaker.state === 'OPEN' && breaker.lastFailureTime) {
        const timeSinceLastFailure =
          Date.now() - breaker.lastFailureTime.getTime();
        const maxOpenTime = this.config.timeout * 10; // 10x normal timeout

        if (timeSinceLastFailure > maxOpenTime) {
          this.logger.warn(
            'Circuit breaker stuck open, forcing recovery attempt',
            { zone, timeSinceLastFailure }
          );
          this.transitionToHalfOpen(zone, 'Health check recovery - stuck open');
        }
      }

      // Check for breakers with no recent activity
      const recentHistory = this.getRecentRequestHistory(zone, 900000); // 15 minutes
      if (recentHistory.length === 0 && breaker.state === 'OPEN') {
        this.logger.info(
          'No recent activity for open circuit breaker, resetting',
          { zone }
        );
        this.transitionToClosed(
          zone,
          'Health check recovery - no recent activity'
        );
      }
    }
  }

  /**
   * Clean up old data to prevent memory leaks
   */
  private cleanupOldData(): void {
    const cutoff = new Date(Date.now() - 3600000); // 1 hour ago

    // Clean up old request history
    for (const [zone, history] of this.requestHistory) {
      const filtered = history.filter(entry => entry.timestamp >= cutoff);
      if (filtered.length !== history.length) {
        this.requestHistory.set(zone, filtered);
      }
    }

    // Clean up unused zones
    const activeZones = new Set(this.breakers.keys());
    for (const zone of this.responseTimeHistory.keys()) {
      if (!activeZones.has(zone)) {
        this.responseTimeHistory.delete(zone);
        this.requestHistory.delete(zone);
        this.stateChangeHistory.delete(zone);
        this.adaptiveThresholds.delete(zone);
      }
    }
  }
}
