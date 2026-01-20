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
import { AxiosError } from 'axios';
import { AutotaskError } from '../utils/errors';
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
    estimatedRecoveryTime: number;
    successRate: number;
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
export declare class AutotaskErrorHandler extends EventEmitter {
    private logger;
    private errorMap;
    private errorPatterns;
    private recoveryStrategies;
    private errorHistory;
    private patternUpdateInterval?;
    private activeRecoveries;
    constructor(logger: winston.Logger);
    /**
     * Handle an error with full Autotask-specific processing
     */
    handleError(error: AxiosError | AutotaskError | Error, context: ErrorContext): Promise<AutotaskError>;
    /**
     * Get error classification and details
     */
    classifyError(error: AutotaskError, context: ErrorContext): AutotaskErrorDetails;
    /**
     * Suggest recovery actions for an error
     */
    suggestRecoveryActions(error: AutotaskError, context: ErrorContext): string[];
    /**
     * Get error patterns and analytics
     */
    getErrorPatterns(): Map<string, ErrorPattern>;
    /**
     * Get error statistics
     */
    getErrorStatistics(timeRange?: number): Record<string, any>;
    /**
     * Create AutotaskError from Axios error
     */
    private createAutotaskErrorFromAxios;
    /**
     * Create generic AutotaskError
     */
    private createGenericAutotaskError;
    /**
     * Extract Autotask-specific error details from response
     */
    private extractAutotaskErrorDetails;
    /**
     * Extract Autotask message from response data
     */
    private extractAutotaskMessage;
    /**
     * Extract error details from error message patterns
     */
    private extractFromErrorMessage;
    /**
     * Classify error by HTTP status code
     */
    private classifyByStatusCode;
    /**
     * Record error for pattern analysis
     */
    private recordError;
    /**
     * Select recovery strategy for error
     */
    private selectRecoveryStrategy;
    /**
     * Attempt automated recovery
     */
    private attemptRecovery;
    /**
     * Execute a single recovery step
     */
    private executeRecoveryStep;
    /**
     * Update error patterns based on history
     */
    private updateErrorPatterns;
    /**
     * Initialize error mappings
     */
    private initializeErrorMappings;
    /**
     * Initialize recovery strategies
     */
    private initializeRecoveryStrategies;
    /**
     * Start pattern analysis
     */
    private startPatternAnalysis;
    /**
     * Sleep utility
     */
    private sleep;
    /**
     * Cleanup and shutdown
     */
    destroy(): void;
}
//# sourceMappingURL=AutotaskErrorHandler.d.ts.map