/**
 * Enhanced Autotask Client with integrated validation and sanitization
 * Uses composition instead of inheritance due to private constructor in AutotaskClient
 */

import { AxiosInstance } from 'axios';
import winston from 'winston';
import { AutotaskClient } from './AutotaskClient';
import { AutotaskAuth, PerformanceConfig, ApiResponse } from '../types';

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

export class ValidatedAutotaskClient {
  private client!: AutotaskClient;
  private config: ValidatedClientConfig;
  private logger: winston.Logger;
  private auditLog: Array<{
    timestamp: Date;
    operation: string;
    entityType: string;
    userId?: string;
    validationResult: boolean;
    securityResult: boolean;
    complianceResult: boolean;
    qualityScore: number;
    duration: number;
  }> = [];
  private initialized = false;

  constructor(config: ValidatedClientConfig, logger?: winston.Logger) {
    this.config = {
      enableValidation: true,
      enableSanitization: true,
      enableSecurityValidation: true,
      enableComplianceChecks: true,
      enableQualityAssurance: true,
      strictMode: false,
      ...config
    };

    this.logger = logger || this.createDefaultLogger();
  }

  /**
   * Initialize the client - must be called before use
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    this.client = await AutotaskClient.create(this.config.auth, this.config.performanceConfig);
    this.initialized = true;
  }

  private createDefaultLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
  }

  /**
   * Get the underlying client for direct access when needed
   */
  getClient(): AutotaskClient {
    if (!this.initialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * Validated entity creation
   */
  async createEntity<T>(entityType: string, entity: any, context?: {
    userId?: string;
    securityContext?: any;
    complianceContext?: any;
  }): Promise<ValidatedOperationResult<T>> {
    if (!this.initialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }
    
    const startTime = Date.now();
    const operationId = `create_${entityType}_${Date.now()}`;

    try {
      this.logger.info('Starting validated entity creation', {
        entityType,
        operationId,
        strictMode: this.config.strictMode
      });

      // Validate entity
      const validationResult = this.validateEntity(entity, entityType);
      
      // Security validation
      const securityResult = this.validateSecurity(entity, context?.securityContext);
      
      // Compliance validation
      const complianceResult = this.validateCompliance(entity, context?.complianceContext);

      if (this.config.strictMode && (!validationResult.passed || !securityResult.passed || !complianceResult.passed)) {
        throw new Error('Validation failed in strict mode');
      }

      // Sanitize data
      const sanitizedEntity = this.sanitizeEntity(entity);

      // Create through underlying client
      // Note: This is a simplified approach - the actual client would need proper entity creation methods
      const result = await this.performEntityOperation<T>('create', entityType, sanitizedEntity);

      const auditEntry = {
        timestamp: new Date(),
        operation: 'create',
        entityType,
        userId: context?.userId,
        validationResult: validationResult.passed,
        securityResult: securityResult.passed,
        complianceResult: complianceResult.passed,
        qualityScore: this.calculateQualityScore(validationResult, securityResult, complianceResult),
        duration: Date.now() - startTime
      };

      this.auditLog.push(auditEntry);

      return {
        success: true,
        data: result,
        originalData: entity,
        sanitizedData: sanitizedEntity,
        securityThreats: securityResult.threats,
        complianceIssues: complianceResult.issues,
        qualityScore: auditEntry.qualityScore,
        auditTrail: {
          timestamp: auditEntry.timestamp,
          operation: auditEntry.operation,
          userId: auditEntry.userId,
          entityType: auditEntry.entityType,
          validationPassed: auditEntry.validationResult,
          securityPassed: auditEntry.securityResult,
          compliancePassed: auditEntry.complianceResult,
          qualityScore: auditEntry.qualityScore
        }
      };

    } catch (error: unknown) {
      this.logger.error('Entity creation failed', {
        entityType,
        operationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        originalData: entity,
        qualityScore: 0
      };
    }
  }

  /**
   * Simplified entity validation
   */
  private validateEntity(entity: any, entityType: string): { passed: boolean; issues: string[] } {
    const issues: string[] = [];

    // Basic validation - can be extended
    if (!entity) {
      issues.push('Entity cannot be null or undefined');
    }

    if (entityType === 'Ticket' && !entity.title) {
      issues.push('Ticket must have a title');
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Simplified security validation
   */
  private validateSecurity(entity: any, context?: any): { passed: boolean; threats: any[] } {
    const threats: any[] = [];

    // Basic security checks - can be extended
    if (entity && typeof entity === 'object') {
      const entityString = JSON.stringify(entity);
      if (entityString.includes('<script>') || entityString.includes('javascript:')) {
        threats.push({
          type: 'XSS',
          severity: 'HIGH',
          description: 'Potential XSS content detected',
          field: 'unknown'
        });
      }
    }

    return {
      passed: threats.length === 0,
      threats
    };
  }

  /**
   * Simplified compliance validation
   */
  private validateCompliance(entity: any, context?: any): { passed: boolean; issues: any[] } {
    const issues: any[] = [];

    // Basic compliance checks - can be extended
    // This is a placeholder for actual compliance validation

    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Sanitize entity data
   */
  private sanitizeEntity(entity: any): any {
    if (!entity || typeof entity !== 'object') {
      return entity;
    }

    const sanitized = { ...entity };

    // Basic sanitization - can be extended
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        // Remove potential XSS
        sanitized[key] = sanitized[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized[key] = sanitized[key].replace(/javascript:/gi, '');
      }
    });

    return sanitized;
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(validationResult: any, securityResult: any, complianceResult: any): number {
    let score = 0;
    if (validationResult.passed) score += 40;
    if (securityResult.passed) score += 30;
    if (complianceResult.passed) score += 30;
    return score;
  }

  /**
   * Perform entity operation through underlying client
   * This is a simplified version - would need proper implementation
   */
  private async performEntityOperation<T>(operation: string, entityType: string, data: any): Promise<T> {
    // This is a placeholder - in reality, you'd route to appropriate client methods
    // For now, just return the data as-is
    return data as T;
  }

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
  }> {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }
}