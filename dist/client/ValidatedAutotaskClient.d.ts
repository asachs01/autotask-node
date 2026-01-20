/**
 * Enhanced Autotask Client with integrated validation and sanitization
 * Uses composition instead of inheritance due to private constructor in AutotaskClient
 */
import winston from 'winston';
import { AutotaskClient } from './AutotaskClient';
import { AutotaskAuth, PerformanceConfig } from '../types';
export interface ValidatedClientConfig {
    auth: AutotaskAuth;
    performanceConfig?: PerformanceConfig;
    enableValidation?: boolean;
    enableSanitization?: boolean;
    enableSecurityValidation?: boolean;
    enableComplianceChecks?: boolean;
    enableQualityAssurance?: boolean;
    strictMode?: boolean;
}
export interface ValidatedOperationResult<T> {
    success: boolean;
    data?: T;
    originalData?: any;
    sanitizedData?: any;
    securityThreats?: Array<{
        type: string;
        severity: string;
        description: string;
        field?: string;
    }>;
    complianceIssues?: Array<{
        regulation: string;
        issue: string;
        severity: string;
        mandatory: boolean;
    }>;
    qualityScore?: number;
    qualityIssues?: string[];
    auditTrail?: {
        timestamp: Date;
        operation: string;
        userId?: string;
        entityType: string;
        validationPassed: boolean;
        securityPassed: boolean;
        compliancePassed: boolean;
        qualityScore: number;
    };
}
export declare class ValidatedAutotaskClient {
    private client;
    private config;
    private logger;
    private auditLog;
    private initialized;
    constructor(config: ValidatedClientConfig, logger?: winston.Logger);
    /**
     * Initialize the client - must be called before use
     */
    initialize(): Promise<void>;
    private createDefaultLogger;
    /**
     * Get the underlying client for direct access when needed
     */
    getClient(): AutotaskClient;
    /**
     * Validated entity creation
     */
    createEntity<T>(entityType: string, entity: any, context?: {
        userId?: string;
        securityContext?: any;
        complianceContext?: any;
    }): Promise<ValidatedOperationResult<T>>;
    /**
     * Simplified entity validation
     */
    private validateEntity;
    /**
     * Simplified security validation
     */
    private validateSecurity;
    /**
     * Simplified compliance validation
     */
    private validateCompliance;
    /**
     * Sanitize entity data
     */
    private sanitizeEntity;
    /**
     * Calculate quality score
     */
    private calculateQualityScore;
    /**
     * Perform entity operation through underlying client
     * This is a simplified version - would need proper implementation
     */
    private performEntityOperation;
    /**
     * Get audit log
     */
    getAuditLog(): Array<{
        timestamp: Date;
        operation: string;
        entityType: string;
        userId?: string;
        validationResult: boolean;
        securityResult: boolean;
        complianceResult: boolean;
        qualityScore: number;
        duration: number;
    }>;
    /**
     * Clear audit log
     */
    clearAuditLog(): void;
}
//# sourceMappingURL=ValidatedAutotaskClient.d.ts.map