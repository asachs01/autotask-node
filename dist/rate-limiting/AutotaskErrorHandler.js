"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutotaskErrorHandler = void 0;
const events_1 = require("events");
const errors_1 = require("../utils/errors");
/**
 * Advanced error handling system for Autotask APIs
 */
class AutotaskErrorHandler extends events_1.EventEmitter {
    constructor(logger) {
        super();
        // Error classification and mapping
        this.errorMap = new Map();
        this.errorPatterns = new Map();
        this.recoveryStrategies = new Map();
        // Error tracking and learning
        this.errorHistory = [];
        // Recovery tracking
        this.activeRecoveries = new Map();
        this.logger = logger;
        this.initializeErrorMappings();
        this.initializeRecoveryStrategies();
        this.startPatternAnalysis();
        this.logger.info('AutotaskErrorHandler initialized');
    }
    /**
     * Handle an error with full Autotask-specific processing
     */
    async handleError(error, context) {
        let autotaskError;
        // Convert to AutotaskError if needed
        if (error instanceof errors_1.AutotaskError) {
            autotaskError = error;
        }
        else if ('isAxiosError' in error) {
            autotaskError = this.createAutotaskErrorFromAxios(error, context);
        }
        else {
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
            recoveryStrategy: recoveryStrategy?.strategyId,
        });
        return autotaskError;
    }
    /**
     * Get error classification and details
     */
    classifyError(error, context) {
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
    suggestRecoveryActions(error, context) {
        const errorDetails = this.classifyError(error, context);
        const strategy = this.selectRecoveryStrategy(error, context);
        const suggestions = [];
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
        if (error instanceof errors_1.RateLimitError) {
            suggestions.push('Implement request queuing and throttling');
            suggestions.push('Review API usage patterns and optimize batch operations');
        }
        return suggestions;
    }
    /**
     * Get error patterns and analytics
     */
    getErrorPatterns() {
        this.updateErrorPatterns();
        return new Map(this.errorPatterns);
    }
    /**
     * Get error statistics
     */
    getErrorStatistics(timeRange = 3600000) {
        const cutoff = new Date(Date.now() - timeRange);
        const recentErrors = this.errorHistory.filter(entry => entry.timestamp > cutoff);
        const stats = {
            totalErrors: recentErrors.length,
            errorsByType: new Map(),
            errorsByEndpoint: new Map(),
            errorsByZone: new Map(),
            averageErrorsPerHour: 0,
            topErrors: [],
            recoverySuccessRate: 0,
            criticalErrors: 0,
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
            percentage: (count / stats.totalErrors) * 100,
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
    createAutotaskErrorFromAxios(axiosError, context) {
        const status = axiosError.response?.status || 0;
        const responseData = axiosError.response?.data;
        // Extract Autotask-specific error information
        const autotaskMessage = this.extractAutotaskMessage(responseData);
        const message = autotaskMessage || axiosError.message || 'Request failed';
        // Create specific error type based on status code
        switch (status) {
            case 400:
                return new errors_1.ValidationError(message, responseData?.errors || responseData?.validationErrors, status, axiosError, context);
            case 401:
            case 403:
                return new errors_1.AuthError(message, status, axiosError, context);
            case 404:
                return new errors_1.NotFoundError(message, context.entityType, context.entityId, status, axiosError, context);
            case 429: {
                const retryAfter = axiosError.response?.headers['retry-after']
                    ? parseInt(axiosError.response.headers['retry-after'], 10)
                    : undefined;
                return new errors_1.RateLimitError(message, retryAfter, status, axiosError, context);
            }
            case 500:
            case 502:
            case 503:
            case 504:
                return new errors_1.ServerError(message, status, axiosError, context);
            default:
                if (!axiosError.response) {
                    const isTimeout = axiosError.code === 'ECONNABORTED' ||
                        axiosError.message.includes('timeout');
                    return new errors_1.NetworkError(message, isTimeout, axiosError, context);
                }
                return new errors_1.ServerError(message, status, axiosError, context);
        }
    }
    /**
     * Create generic AutotaskError
     */
    createGenericAutotaskError(error, context) {
        return new errors_1.ServerError(error.message || 'Unknown error occurred', undefined, error, context);
    }
    /**
     * Extract Autotask-specific error details from response
     */
    extractAutotaskErrorDetails(error, context) {
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
                    zone: context.zone,
                },
            };
        }
        // Try to extract from error message patterns
        return this.extractFromErrorMessage(error, context);
    }
    /**
     * Extract Autotask message from response data
     */
    extractAutotaskMessage(responseData) {
        if (!responseData)
            return null;
        // Common Autotask error response formats
        if (responseData.message)
            return responseData.message;
        if (responseData.error)
            return responseData.error;
        if (responseData.errorMessage)
            return responseData.errorMessage;
        if (responseData.Message)
            return responseData.Message;
        // Check for validation errors
        if (responseData.errors && Array.isArray(responseData.errors)) {
            return responseData.errors
                .map((err) => err.message || err)
                .join(', ');
        }
        return null;
    }
    /**
     * Extract error details from error message patterns
     */
    extractFromErrorMessage(error, context) {
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
                autotaskSpecific: true,
            };
        }
        // Authentication/authorization patterns
        if (message.includes('unauthorized') ||
            message.includes('invalid credentials')) {
            return {
                errorCode: 'AT_AUTH_FAILED',
                errorMessage: error.message,
                errorType: 'AUTH',
                severity: 'HIGH',
                category: 'AUTHENTICATION',
                isRetryable: false,
                recommendedAction: 'Check credentials and API integration settings',
                autotaskSpecific: true,
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
                autotaskSpecific: true,
            };
        }
        // Entity validation patterns
        if (message.includes('required field') ||
            message.includes('invalid value')) {
            return {
                errorCode: 'AT_VALIDATION',
                errorMessage: error.message,
                errorType: 'VALIDATION',
                severity: 'MEDIUM',
                category: 'DATA_VALIDATION',
                isRetryable: false,
                recommendedAction: 'Review entity data and fix validation errors',
                autotaskSpecific: true,
            };
        }
        return null;
    }
    /**
     * Classify error by HTTP status code
     */
    classifyByStatusCode(error, context) {
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
                autotaskSpecific: false,
            };
        }
        else if (statusCode === 429) {
            return {
                errorCode: 'HTTP_429',
                errorMessage: error.message,
                errorType: 'RATE_LIMIT',
                severity: 'HIGH',
                category: 'RATE_LIMITING',
                isRetryable: true,
                recommendedAction: 'Implement rate limiting and request queuing',
                autotaskSpecific: false,
            };
        }
        else if (statusCode >= 400) {
            return {
                errorCode: `HTTP_${statusCode}`,
                errorMessage: error.message,
                errorType: 'BUSINESS',
                severity: 'MEDIUM',
                category: 'CLIENT_ERROR',
                isRetryable: false,
                recommendedAction: 'Review request data and fix client-side issues',
                autotaskSpecific: false,
            };
        }
        else {
            return {
                errorCode: 'UNKNOWN',
                errorMessage: error.message,
                errorType: 'SYSTEM',
                severity: 'HIGH',
                category: 'UNKNOWN',
                isRetryable: true,
                recommendedAction: 'Review error details and implement appropriate handling',
                autotaskSpecific: false,
            };
        }
    }
    /**
     * Record error for pattern analysis
     */
    recordError(error, context) {
        this.errorHistory.push({
            error,
            context,
            timestamp: new Date(),
        });
        // Keep only recent errors (last 24 hours)
        const cutoff = new Date(Date.now() - 86400000);
        this.errorHistory = this.errorHistory.filter(entry => entry.timestamp > cutoff);
    }
    /**
     * Select recovery strategy for error
     */
    selectRecoveryStrategy(error, context) {
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
    async attemptRecovery(error, context, strategy) {
        const recoveryId = `${context.requestId}-${Date.now()}`;
        this.activeRecoveries.set(recoveryId, {
            strategy,
            startTime: new Date(),
            step: 0,
        });
        this.emit('recoveryStarted', { recoveryId, error, context, strategy });
        try {
            for (let i = 0; i < strategy.recoverySteps.length; i++) {
                const step = strategy.recoverySteps[i];
                const recovery = this.activeRecoveries.get(recoveryId);
                recovery.step = i;
                this.emit('recoveryStepStarted', { recoveryId, step, stepIndex: i });
                const success = await this.executeRecoveryStep(step, error, context);
                if (!success && !step.optional) {
                    this.emit('recoveryFailed', { recoveryId, failedStep: i, step });
                    return false;
                }
                this.emit('recoveryStepCompleted', {
                    recoveryId,
                    step,
                    stepIndex: i,
                    success,
                });
            }
            this.emit('recoveryCompleted', { recoveryId, error, context });
            return true;
        }
        catch (recoveryError) {
            this.emit('recoveryError', { recoveryId, error: recoveryError });
            return false;
        }
        finally {
            this.activeRecoveries.delete(recoveryId);
        }
    }
    /**
     * Execute a single recovery step
     */
    async executeRecoveryStep(step, error, context) {
        switch (step.action) {
            case 'WAIT':
                await this.sleep(step.parameters.delay || 1000);
                return true;
            case 'RETRY':
                // This would need to be implemented based on your specific retry logic
                return true;
            case 'FAILOVER':
                this.emit('failoverRequested', {
                    error,
                    context,
                    parameters: step.parameters,
                });
                return true;
            case 'REFRESH_AUTH':
                this.emit('authRefreshRequested', { error, context });
                return true;
            case 'ALERT':
                this.emit('alertRequested', {
                    error,
                    context,
                    alertType: step.parameters.alertType || 'ERROR',
                    message: step.parameters.message || error.message,
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
    updateErrorPatterns() {
        const now = new Date();
        const oneHour = 3600000;
        const recentErrors = this.errorHistory.filter(entry => now.getTime() - entry.timestamp.getTime() < oneHour);
        // Group errors by type
        const errorGroups = new Map();
        recentErrors.forEach(entry => {
            const errorType = entry.error.constructor.name;
            if (!errorGroups.has(errorType)) {
                errorGroups.set(errorType, []);
            }
            errorGroups.get(errorType).push(entry);
        });
        // Update patterns
        for (const [errorType, entries] of errorGroups.entries()) {
            const pattern = this.errorPatterns.get(errorType) || {
                errorType,
                frequency: 0,
                lastOccurrence: new Date(0),
                affectedEndpoints: new Set(),
                possibleCauses: [],
                resolutionSteps: [],
                escalationRequired: false,
            };
            pattern.frequency = entries.length;
            pattern.lastOccurrence = entries[entries.length - 1].context.timestamp;
            entries.forEach(entry => {
                pattern.affectedEndpoints.add(entry.context.endpoint);
            });
            // Determine if escalation is required
            pattern.escalationRequired =
                pattern.frequency > 10 ||
                    entries.some(entry => this.classifyError(entry.error, entry.context).severity ===
                        'CRITICAL');
            this.errorPatterns.set(errorType, pattern);
        }
    }
    /**
     * Initialize error mappings
     */
    initializeErrorMappings() {
        // Add known Autotask error patterns
        this.errorMap.set('RateLimitError:429', {
            errorCode: 'AT_RATE_LIMIT_EXCEEDED',
            errorMessage: 'API rate limit exceeded',
            errorType: 'RATE_LIMIT',
            severity: 'HIGH',
            category: 'API_LIMITS',
            isRetryable: true,
            recommendedAction: 'Implement exponential backoff and request throttling',
            autotaskSpecific: true,
        });
        this.errorMap.set('AuthError:401', {
            errorCode: 'AT_AUTH_INVALID',
            errorMessage: 'Authentication credentials invalid',
            errorType: 'AUTH',
            severity: 'CRITICAL',
            category: 'AUTHENTICATION',
            isRetryable: false,
            recommendedAction: 'Check API credentials and integration code',
            autotaskSpecific: true,
        });
        this.errorMap.set('ServerError:503', {
            errorCode: 'AT_SERVICE_UNAVAILABLE',
            errorMessage: 'Autotask service temporarily unavailable',
            errorType: 'SYSTEM',
            severity: 'HIGH',
            category: 'SERVICE_AVAILABILITY',
            isRetryable: true,
            recommendedAction: 'Retry with exponential backoff, consider failover to backup zone',
            autotaskSpecific: true,
        });
    }
    /**
     * Initialize recovery strategies
     */
    initializeRecoveryStrategies() {
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
                    optional: false,
                },
                {
                    stepId: 'REDUCE_RATE_LIMIT',
                    description: 'Reduce request rate',
                    action: 'ALERT',
                    parameters: { alertType: 'RATE_LIMIT_ADJUSTMENT' },
                    timeout: 1000,
                    optional: true,
                },
            ],
            estimatedRecoveryTime: 60000,
            successRate: 0.9,
            requiresManualIntervention: false,
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
                    optional: false,
                },
                {
                    stepId: 'ATTEMPT_FAILOVER',
                    description: 'Try different zone if available',
                    action: 'FAILOVER',
                    parameters: { requireHealthyZone: true },
                    timeout: 30000,
                    optional: true,
                },
            ],
            estimatedRecoveryTime: 35000,
            successRate: 0.7,
            requiresManualIntervention: false,
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
                    optional: false,
                },
                {
                    stepId: 'MANUAL_INTERVENTION',
                    description: 'Manual credential verification required',
                    action: 'MANUAL',
                    parameters: { alertType: 'AUTH_FAILURE' },
                    timeout: 0,
                    optional: false,
                },
            ],
            estimatedRecoveryTime: 0,
            successRate: 0.3,
            requiresManualIntervention: true,
        });
    }
    /**
     * Start pattern analysis
     */
    startPatternAnalysis() {
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
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Cleanup and shutdown
     */
    destroy() {
        if (this.patternUpdateInterval) {
            clearInterval(this.patternUpdateInterval);
        }
        this.activeRecoveries.clear();
        this.removeAllListeners();
        this.logger.info('AutotaskErrorHandler destroyed');
    }
}
exports.AutotaskErrorHandler = AutotaskErrorHandler;
//# sourceMappingURL=AutotaskErrorHandler.js.map