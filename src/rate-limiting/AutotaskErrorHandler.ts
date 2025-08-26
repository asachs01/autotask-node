/**
 * Advanced Autotask Error Handler
 * 
 * Comprehensive error handling system specifically designed for Autotask API patterns:
 * - Autotask-specific error code mapping and classification
 * - Business logic vs system error differentiation
 * - Intelligent recovery strategies per error type
 * - Error pattern learning and prediction
 * - Comprehensive error reporting with context
 * 
 * Features:
 * - Deep integration with Autotask API error responses
 * - Context-aware error recovery strategies
 * - Error aggregation and pattern analysis
 * - Automated error reporting and alerting
 * - Recovery action recommendations
 */

import { EventEmitter } from 'events';
import winston from 'winston';
import { AxiosError, AxiosResponse } from 'axios';
import { 
  AutotaskError, 
  RateLimitError, 
  ServerError, 
  NetworkError, 
  AuthError, 
  ValidationError, 
  NotFoundError 
} from '../utils/errors';

export interface AutotaskErrorDetails {
  errorCode: string;
  errorMessage: string;
  errorType: 'SYSTEM' | 'BUSINESS' | 'VALIDATION' | 'AUTH' | 'RATE_LIMIT' | 'NETWORK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  subcategory?: string;
  isRetryable: boolean;
  recommendedAction: string;
  context?: Record<string, any>;
  autotaskSpecific: boolean;
}

export interface ErrorPattern {
  errorType: string;
  frequency: number;
  lastOccurrence: Date;
  affectedEndpoints: Set<string>;
  possibleCauses: string[];
  resolutionSteps: string[];
  escalationRequired: boolean;
}

export interface ErrorRecoveryStrategy {
  strategyId: string;
  applicableErrors: string[];
  recoverySteps: RecoveryStep[];
  estimatedRecoveryTime: number; // milliseconds
  successRate: number; // 0.0 to 1.0
  requiresManualIntervention: boolean;
}

export interface RecoveryStep {
  stepId: string;
  description: string;
  action: 'RETRY' | 'WAIT' | 'FAILOVER' | 'REFRESH_AUTH' | 'MANUAL' | 'ALERT';
  parameters: Record<string, any>;
  timeout: number;
  optional: boolean;
}

export interface ErrorContext {
  endpoint: string;
  method: string;
  requestId: string;
  zone: string;
  timestamp: Date;
  requestData?: any;
  userAgent?: string;
  integration?: string;
  entityType?: string;
  entityId?: string | number;
}

/**
 * Advanced error handling system for Autotask APIs
 */
export class AutotaskErrorHandler extends EventEmitter {
  private logger: winston.Logger;
  
  // Error classification and mapping
  private errorMap: Map<string, AutotaskErrorDetails> = new Map();
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private recoveryStrategies: Map<string, ErrorRecoveryStrategy> = new Map();
  
  // Error tracking and learning
  private errorHistory: Array<{ error: AutotaskError; context: ErrorContext; timestamp: Date }> = [];
  private patternUpdateInterval?: ReturnType<typeof setTimeout>;
  
  // Recovery tracking
  private activeRecoveries: Map<string, { strategy: ErrorRecoveryStrategy; startTime: Date; step: number }> = new Map();
  
  constructor(logger: winston.Logger) {
    super();
    
    this.logger = logger;
    this.initializeErrorMappings();
    this.initializeRecoveryStrategies();
    this.startPatternAnalysis();
    
    this.logger.info('AutotaskErrorHandler initialized');
  }
  
  /**
   * Handle an error with full Autotask-specific processing
   */
  async handleError(
    error: AxiosError | AutotaskError | Error,
    context: ErrorContext
  ): Promise<AutotaskError> {
    let autotaskError: AutotaskError;
    
    // Convert to AutotaskError if needed
    if (error instanceof AutotaskError) {
      autotaskError = error;
    } else if ('isAxiosError' in error) {
      autotaskError = this.createAutotaskErrorFromAxios(error as AxiosError, context);
    } else {
      autotaskError = this.createGenericAutotaskError(error, context);
    }
    
    // Enhance with Autotask-specific details
    const errorDetails = this.classifyError(autotaskError, context);
    
    // Record error for learning
    this.recordError(autotaskError, context);
    
    // Attempt automated recovery if applicable
    const recoveryStrategy = this.selectRecoveryStrategy(autotaskError, context);
    if (recoveryStrategy && !recoveryStrategy.requiresManualIntervention) {
      this.attemptRecovery(autotaskError, context, recoveryStrategy);
    }
    
    // Emit error event for monitoring
    this.emit('errorHandled', {
      error: autotaskError,
      context,
      errorDetails,
      recoveryStrategy: recoveryStrategy?.strategyId
    });
    
    return autotaskError;
  }
  
  /**
   * Get error classification and details
   */
  classifyError(error: AutotaskError, context: ErrorContext): AutotaskErrorDetails {
    // Check for specific Autotask error patterns first
    const autotaskDetails = this.extractAutotaskErrorDetails(error, context);
    if (autotaskDetails) {
      return autotaskDetails;
    }
    
    // Fall back to HTTP status code classification
    return this.classifyByStatusCode(error, context);
  }
  
  /**
   * Suggest recovery actions for an error
   */
  suggestRecoveryActions(error: AutotaskError, context: ErrorContext): string[] {
    const errorDetails = this.classifyError(error, context);
    const strategy = this.selectRecoveryStrategy(error, context);
    
    const suggestions: string[] = [];
    
    // Add specific recommendations based on error type
    suggestions.push(errorDetails.recommendedAction);
    
    if (strategy) {
      strategy.recoverySteps.forEach(step => {
        suggestions.push(`${step.description} (${step.action})`);
      });
    }
    
    // Add context-specific suggestions
    if (context.entityType) {
      suggestions.push(`Review ${context.entityType} configuration and permissions`);
    }
    
    if (error instanceof RateLimitError) {
      suggestions.push('Implement request queuing and throttling');
      suggestions.push('Review API usage patterns and optimize batch operations');
    }
    
    return suggestions;
  }
  
  /**
   * Get error patterns and analytics
   */
  getErrorPatterns(): Map<string, ErrorPattern> {
    this.updateErrorPatterns();
    return new Map(this.errorPatterns);
  }
  
  /**
   * Get error statistics
   */
  getErrorStatistics(timeRange: number = 3600000): Record<string, any> {
    const cutoff = new Date(Date.now() - timeRange);
    const recentErrors = this.errorHistory.filter(entry => entry.timestamp > cutoff);
    
    const stats = {
      totalErrors: recentErrors.length,
      errorsByType: new Map<string, number>(),
      errorsByEndpoint: new Map<string, number>(),
      errorsByZone: new Map<string, number>(),
      averageErrorsPerHour: 0,
      topErrors: [] as Array<{ type: string; count: number; percentage: number }>,
      recoverySuccessRate: 0,
      criticalErrors: 0
    };
    
    // Count errors by type
    recentErrors.forEach(entry => {
      const errorType = entry.error.constructor.name;
      const endpoint = entry.context.endpoint;
      const zone = entry.context.zone;
      
      stats.errorsByType.set(errorType, (stats.errorsByType.get(errorType) || 0) + 1);
      stats.errorsByEndpoint.set(endpoint, (stats.errorsByEndpoint.get(endpoint) || 0) + 1);
      stats.errorsByZone.set(zone, (stats.errorsByZone.get(zone) || 0) + 1);
      
      const details = this.classifyError(entry.error, entry.context);
      if (details.severity === 'CRITICAL') {
        stats.criticalErrors++;
      }
    });
    
    // Calculate top errors
    stats.topErrors = Array.from(stats.errorsByType.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / stats.totalErrors) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate average errors per hour
    const hoursInRange = timeRange / 3600000;
    stats.averageErrorsPerHour = stats.totalErrors / hoursInRange;
    
    return stats;
  }
  
  /**
   * Create AutotaskError from Axios error
   */
  private createAutotaskErrorFromAxios(axiosError: AxiosError, context: ErrorContext): AutotaskError {
    const status = axiosError.response?.status || 0;
    const responseData = axiosError.response?.data as any;
    
    // Extract Autotask-specific error information
    const autotaskMessage = this.extractAutotaskMessage(responseData);
    const message = autotaskMessage || axiosError.message || 'Request failed';
    
    // Create specific error type based on status code
    switch (status) {
      case 400:
        return new ValidationError(
          message,
          responseData?.errors || responseData?.validationErrors,
          status,
          axiosError,
          context
        );
        
      case 401:
      case 403:
        return new AuthError(message, status, axiosError, context);
        
      case 404:
        return new NotFoundError(
          message,
          context.entityType,
          context.entityId,
          status,
          axiosError,
          context
        );
        
      case 429:
        const retryAfter = axiosError.response?.headers['retry-after'] 
          ? parseInt(axiosError.response.headers['retry-after'], 10) 
          : undefined;
        return new RateLimitError(message, retryAfter, status, axiosError, context);
        
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, status, axiosError, context);
        
      default:
        if (!axiosError.response) {
          const isTimeout = axiosError.code === 'ECONNABORTED' || 
                           axiosError.message.includes('timeout');
          return new NetworkError(message, isTimeout, axiosError, context);
        }
        
        return new ServerError(message, status, axiosError, context);
    }
  }
  
  /**
   * Create generic AutotaskError
   */
  private createGenericAutotaskError(error: Error, context: ErrorContext): AutotaskError {
    return new ServerError(
      error.message || 'Unknown error occurred',
      undefined,
      error,
      context
    );
  }
  
  /**
   * Extract Autotask-specific error details from response
   */
  private extractAutotaskErrorDetails(
    error: AutotaskError, 
    context: ErrorContext
  ): AutotaskErrorDetails | null {
    // Check if this is a known Autotask error pattern
    const errorKey = `${error.constructor.name}:${error.statusCode}`;
    const mappedError = this.errorMap.get(errorKey);
    
    if (mappedError) {
      return {
        ...mappedError,
        context: {
          endpoint: context.endpoint,
          method: context.method,
          requestId: context.requestId,
          zone: context.zone
        }
      };
    }
    
    // Try to extract from error message patterns
    return this.extractFromErrorMessage(error, context);
  }
  
  /**
   * Extract Autotask message from response data
   */
  private extractAutotaskMessage(responseData: any): string | null {
    if (!responseData) return null;
    
    // Common Autotask error response formats
    if (responseData.message) return responseData.message;
    if (responseData.error) return responseData.error;
    if (responseData.errorMessage) return responseData.errorMessage;
    if (responseData.Message) return responseData.Message;
    
    // Check for validation errors
    if (responseData.errors && Array.isArray(responseData.errors)) {
      return responseData.errors.map((err: any) => err.message || err).join(', ');
    }
    
    return null;
  }
  
  /**
   * Extract error details from error message patterns
   */
  private extractFromErrorMessage(error: AutotaskError, context: ErrorContext): AutotaskErrorDetails | null {
    const message = error.message.toLowerCase();
    
    // API limit exceeded patterns
    if (message.includes('api threshold') || message.includes('rate limit')) {
      return {
        errorCode: 'AT_RATE_LIMIT',
        errorMessage: error.message,
        errorType: 'RATE_LIMIT',
        severity: 'HIGH',
        category: 'API_LIMITS',
        isRetryable: true,
        recommendedAction: 'Implement exponential backoff and reduce request frequency',
        autotaskSpecific: true
      };
    }
    
    // Authentication/authorization patterns
    if (message.includes('unauthorized') || message.includes('invalid credentials')) {
      return {
        errorCode: 'AT_AUTH_FAILED',
        errorMessage: error.message,
        errorType: 'AUTH',
        severity: 'HIGH',
        category: 'AUTHENTICATION',
        isRetryable: false,
        recommendedAction: 'Check credentials and API integration settings',
        autotaskSpecific: true
      };
    }
    
    // Zone detection patterns
    if (message.includes('zone') || message.includes('webservice')) {
      return {
        errorCode: 'AT_ZONE_ERROR',
        errorMessage: error.message,
        errorType: 'SYSTEM',
        severity: 'HIGH',
        category: 'ZONE_MANAGEMENT',
        isRetryable: true,
        recommendedAction: 'Retry zone detection or use manual zone configuration',
        autotaskSpecific: true
      };
    }
    
    // Entity validation patterns
    if (message.includes('required field') || message.includes('invalid value')) {
      return {
        errorCode: 'AT_VALIDATION',
        errorMessage: error.message,
        errorType: 'VALIDATION',
        severity: 'MEDIUM',
        category: 'DATA_VALIDATION',
        isRetryable: false,
        recommendedAction: 'Review entity data and fix validation errors',
        autotaskSpecific: true
      };
    }
    
    return null;
  }
  
  /**
   * Classify error by HTTP status code
   */
  private classifyByStatusCode(error: AutotaskError, context: ErrorContext): AutotaskErrorDetails {
    const statusCode = error.statusCode || 0;
    
    if (statusCode >= 500) {
      return {
        errorCode: `HTTP_${statusCode}`,
        errorMessage: error.message,
        errorType: 'SYSTEM',
        severity: 'HIGH',
        category: 'SERVER_ERROR',
        isRetryable: true,
        recommendedAction: 'Retry request with exponential backoff',
        autotaskSpecific: false
      };
    } else if (statusCode === 429) {
      return {
        errorCode: 'HTTP_429',
        errorMessage: error.message,
        errorType: 'RATE_LIMIT',
        severity: 'HIGH',
        category: 'RATE_LIMITING',
        isRetryable: true,
        recommendedAction: 'Implement rate limiting and request queuing',
        autotaskSpecific: false
      };
    } else if (statusCode >= 400) {
      return {
        errorCode: `HTTP_${statusCode}`,
        errorMessage: error.message,
        errorType: 'BUSINESS',
        severity: 'MEDIUM',
        category: 'CLIENT_ERROR',
        isRetryable: false,
        recommendedAction: 'Review request data and fix client-side issues',
        autotaskSpecific: false
      };
    } else {
      return {
        errorCode: 'UNKNOWN',
        errorMessage: error.message,
        errorType: 'SYSTEM',
        severity: 'HIGH',
        category: 'UNKNOWN',
        isRetryable: true,
        recommendedAction: 'Review error details and implement appropriate handling',
        autotaskSpecific: false
      };
    }
  }
  
  /**
   * Record error for pattern analysis
   */
  private recordError(error: AutotaskError, context: ErrorContext): void {
    this.errorHistory.push({
      error,
      context,
      timestamp: new Date()
    });
    
    // Keep only recent errors (last 24 hours)
    const cutoff = new Date(Date.now() - 86400000);
    this.errorHistory = this.errorHistory.filter(entry => entry.timestamp > cutoff);
  }
  
  /**
   * Select recovery strategy for error
   */
  private selectRecoveryStrategy(
    error: AutotaskError, 
    context: ErrorContext
  ): ErrorRecoveryStrategy | null {
    const errorType = error.constructor.name;
    
    for (const strategy of this.recoveryStrategies.values()) {
      if (strategy.applicableErrors.includes(errorType)) {
        return strategy;
      }
    }
    
    return null;
  }
  
  /**
   * Attempt automated recovery
   */
  private async attemptRecovery(
    error: AutotaskError,
    context: ErrorContext,
    strategy: ErrorRecoveryStrategy
  ): Promise<boolean> {
    const recoveryId = `${context.requestId}-${Date.now()}`;
    
    this.activeRecoveries.set(recoveryId, {
      strategy,
      startTime: new Date(),
      step: 0
    });
    
    this.emit('recoveryStarted', { recoveryId, error, context, strategy });
    
    try {
      for (let i = 0; i < strategy.recoverySteps.length; i++) {
        const step = strategy.recoverySteps[i];
        const recovery = this.activeRecoveries.get(recoveryId)!;
        recovery.step = i;
        
        this.emit('recoveryStepStarted', { recoveryId, step, stepIndex: i });
        
        const success = await this.executeRecoveryStep(step, error, context);
        
        if (!success && !step.optional) {
          this.emit('recoveryFailed', { recoveryId, failedStep: i, step });
          return false;
        }
        
        this.emit('recoveryStepCompleted', { recoveryId, step, stepIndex: i, success });
      }
      
      this.emit('recoveryCompleted', { recoveryId, error, context });
      return true;
      
    } catch (recoveryError) {
      this.emit('recoveryError', { recoveryId, error: recoveryError });
      return false;
      
    } finally {
      this.activeRecoveries.delete(recoveryId);
    }
  }
  
  /**
   * Execute a single recovery step
   */
  private async executeRecoveryStep(
    step: RecoveryStep,
    error: AutotaskError,
    context: ErrorContext
  ): Promise<boolean> {
    switch (step.action) {
      case 'WAIT':
        await this.sleep(step.parameters.delay || 1000);
        return true;
        
      case 'RETRY':
        // This would need to be implemented based on your specific retry logic
        return true;
        
      case 'FAILOVER':
        this.emit('failoverRequested', { error, context, parameters: step.parameters });
        return true;
        
      case 'REFRESH_AUTH':
        this.emit('authRefreshRequested', { error, context });
        return true;
        
      case 'ALERT':
        this.emit('alertRequested', { 
          error, 
          context, 
          alertType: step.parameters.alertType || 'ERROR',
          message: step.parameters.message || error.message
        });
        return true;
        
      case 'MANUAL':
        this.emit('manualInterventionRequired', { error, context, step });
        return false;
        
      default:
        return false;
    }
  }
  
  /**
   * Update error patterns based on history
   */
  private updateErrorPatterns(): void {
    const now = new Date();
    const oneHour = 3600000;
    const recentErrors = this.errorHistory.filter(
      entry => now.getTime() - entry.timestamp.getTime() < oneHour
    );
    
    // Group errors by type
    const errorGroups = new Map<string, Array<{ error: AutotaskError; context: ErrorContext }>>();
    
    recentErrors.forEach(entry => {
      const errorType = entry.error.constructor.name;
      if (!errorGroups.has(errorType)) {
        errorGroups.set(errorType, []);
      }
      errorGroups.get(errorType)!.push(entry);
    });
    
    // Update patterns
    for (const [errorType, entries] of errorGroups.entries()) {
      const pattern: ErrorPattern = this.errorPatterns.get(errorType) || {
        errorType,
        frequency: 0,
        lastOccurrence: new Date(0),
        affectedEndpoints: new Set(),
        possibleCauses: [],
        resolutionSteps: [],
        escalationRequired: false
      };
      
      pattern.frequency = entries.length;
      pattern.lastOccurrence = entries[entries.length - 1].context.timestamp;
      
      entries.forEach(entry => {
        pattern.affectedEndpoints.add(entry.context.endpoint);
      });
      
      // Determine if escalation is required
      pattern.escalationRequired = pattern.frequency > 10 || 
        entries.some(entry => this.classifyError(entry.error, entry.context).severity === 'CRITICAL');
      
      this.errorPatterns.set(errorType, pattern);
    }
  }
  
  /**
   * Initialize error mappings
   */
  private initializeErrorMappings(): void {
    // Add known Autotask error patterns
    this.errorMap.set('RateLimitError:429', {
      errorCode: 'AT_RATE_LIMIT_EXCEEDED',
      errorMessage: 'API rate limit exceeded',
      errorType: 'RATE_LIMIT',
      severity: 'HIGH',
      category: 'API_LIMITS',
      isRetryable: true,
      recommendedAction: 'Implement exponential backoff and request throttling',
      autotaskSpecific: true
    });
    
    this.errorMap.set('AuthError:401', {
      errorCode: 'AT_AUTH_INVALID',
      errorMessage: 'Authentication credentials invalid',
      errorType: 'AUTH',
      severity: 'CRITICAL',
      category: 'AUTHENTICATION',
      isRetryable: false,
      recommendedAction: 'Check API credentials and integration code',
      autotaskSpecific: true
    });
    
    this.errorMap.set('ServerError:503', {
      errorCode: 'AT_SERVICE_UNAVAILABLE',
      errorMessage: 'Autotask service temporarily unavailable',
      errorType: 'SYSTEM',
      severity: 'HIGH',
      category: 'SERVICE_AVAILABILITY',
      isRetryable: true,
      recommendedAction: 'Retry with exponential backoff, consider failover to backup zone',
      autotaskSpecific: true
    });
  }
  
  /**
   * Initialize recovery strategies
   */
  private initializeRecoveryStrategies(): void {
    // Rate limit recovery strategy
    this.recoveryStrategies.set('RATE_LIMIT_RECOVERY', {
      strategyId: 'RATE_LIMIT_RECOVERY',
      applicableErrors: ['RateLimitError'],
      recoverySteps: [
        {
          stepId: 'WAIT_RETRY_AFTER',
          description: 'Wait for retry-after period',
          action: 'WAIT',
          parameters: { useRetryAfter: true },
          timeout: 60000,
          optional: false
        },
        {
          stepId: 'REDUCE_RATE_LIMIT',
          description: 'Reduce request rate',
          action: 'ALERT',
          parameters: { alertType: 'RATE_LIMIT_ADJUSTMENT' },
          timeout: 1000,
          optional: true
        }
      ],
      estimatedRecoveryTime: 60000,
      successRate: 0.9,
      requiresManualIntervention: false
    });
    
    // Server error recovery strategy
    this.recoveryStrategies.set('SERVER_ERROR_RECOVERY', {
      strategyId: 'SERVER_ERROR_RECOVERY',
      applicableErrors: ['ServerError'],
      recoverySteps: [
        {
          stepId: 'WAIT_AND_RETRY',
          description: 'Wait before retry',
          action: 'WAIT',
          parameters: { delay: 5000 },
          timeout: 10000,
          optional: false
        },
        {
          stepId: 'ATTEMPT_FAILOVER',
          description: 'Try different zone if available',
          action: 'FAILOVER',
          parameters: { requireHealthyZone: true },
          timeout: 30000,
          optional: true
        }
      ],
      estimatedRecoveryTime: 35000,
      successRate: 0.7,
      requiresManualIntervention: false
    });
    
    // Auth error recovery strategy
    this.recoveryStrategies.set('AUTH_ERROR_RECOVERY', {
      strategyId: 'AUTH_ERROR_RECOVERY',
      applicableErrors: ['AuthError'],
      recoverySteps: [
        {
          stepId: 'REFRESH_CREDENTIALS',
          description: 'Attempt to refresh authentication',
          action: 'REFRESH_AUTH',
          parameters: {},
          timeout: 10000,
          optional: false
        },
        {
          stepId: 'MANUAL_INTERVENTION',
          description: 'Manual credential verification required',
          action: 'MANUAL',
          parameters: { alertType: 'AUTH_FAILURE' },
          timeout: 0,
          optional: false
        }
      ],
      estimatedRecoveryTime: 0,
      successRate: 0.3,
      requiresManualIntervention: true
    });
  }
  
  /**
   * Start pattern analysis
   */
  private startPatternAnalysis(): void {
    this.patternUpdateInterval = setInterval(() => {
      this.updateErrorPatterns();
      
      // Check for critical patterns that need immediate attention
      for (const pattern of this.errorPatterns.values()) {
        if (pattern.escalationRequired) {
          this.emit('criticalPatternDetected', pattern);
        }
      }
    }, 300000); // Update every 5 minutes
  }
  
  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Cleanup and shutdown
   */
  destroy(): void {
    if (this.patternUpdateInterval) {
      clearInterval(this.patternUpdateInterval);
    }
    
    this.activeRecoveries.clear();
    this.removeAllListeners();
    
    this.logger.info('AutotaskErrorHandler destroyed');
  }
}