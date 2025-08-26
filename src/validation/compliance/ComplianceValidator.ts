/**
 * Comprehensive compliance validation system
 * Handles GDPR, SOX, HIPAA, PCI-DSS, CCPA, and other regulatory compliance
 */

import winston from 'winston';
import { 
  ValidationResult, 
  ValidationError,
  ValidationWarning,
  ValidationContext,
  ComplianceContext,
  ComplianceRule,
  ComplianceAction,
  RetentionPolicy,
  ComplianceViolationException
} from '../types/ValidationTypes';

export interface ComplianceFramework {
  name: string;
  version: string;
  jurisdiction: string[];
  rules: ComplianceRule[];
  auditRequirements: AuditRequirement[];
  retentionPolicies: RetentionPolicy[];
  consentRequirements: ConsentRequirement[];
}

export interface AuditRequirement {
  id: string;
  name: string;
  description: string;
  frequency: 'real-time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  dataPoints: string[];
  retentionPeriod: number; // days
  format: 'json' | 'csv' | 'xml' | 'pdf';
}

export interface ConsentRequirement {
  id: string;
  regulation: string;
  purpose: string[];
  lawfulBasis: string[];
  consentTypes: ('explicit' | 'implicit' | 'opt-in' | 'opt-out')[];
  withdrawalMethod: string;
  minimumAge?: number;
}

export interface DataSubjectRights {
  rightToAccess: boolean;
  rightToRectification: boolean;
  rightToErasure: boolean;
  rightToPortability: boolean;
  rightToRestriction: boolean;
  rightToObject: boolean;
  rightsRelatedToAutomation: boolean;
}

export interface ComplianceReport {
  framework: string;
  timestamp: Date;
  status: 'compliant' | 'non-compliant' | 'partial';
  violations: ComplianceViolation[];
  recommendations: string[];
  auditTrail: ComplianceAuditEntry[];
  dataSubjectRights: DataSubjectRights;
  retentionCompliance: RetentionCompliance[];
}

export interface ComplianceViolation {
  ruleId: string;
  regulation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  field?: string;
  remediation: string;
  timeline: string;
  riskScore: number;
}

export interface ComplianceAuditEntry {
  timestamp: Date;
  regulation: string;
  action: string;
  entityType: string;
  entityId?: string;
  dataSubject?: string;
  lawfulBasis?: string;
  purpose: string;
  result: 'compliant' | 'violation' | 'warning';
  details: any;
}

export interface RetentionCompliance {
  dataCategory: string;
  retentionPeriod: number;
  currentAge: number;
  status: 'compliant' | 'expired' | 'approaching-limit';
  action: 'retain' | 'archive' | 'delete' | 'anonymize';
  deadline?: Date;
}

export class ComplianceValidator {
  private logger: winston.Logger;
  private frameworks: Map<string, ComplianceFramework> = new Map();
  private auditLog: ComplianceAuditEntry[] = [];
  private dataSubjectRegistry: Map<string, DataSubjectInfo> = new Map();
  private consentRegistry: Map<string, ConsentRecord> = new Map();

  constructor(logger: winston.Logger) {
    this.logger = logger;
    this.initializeFrameworks();
  }

  /**
   * Validate compliance for an entity
   */
  public async validate(entity: any, context: ValidationContext): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
      };

      const complianceContext = context.complianceContext;
      if (!complianceContext) {
        result.warnings.push({
          field: '__compliance__',
          code: 'NO_COMPLIANCE_CONTEXT',
          message: 'No compliance context provided',
          recommendation: 'Provide compliance context for regulatory validation'
        });
        return result;
      }

      // Determine applicable frameworks
      const applicableFrameworks = this.getApplicableFrameworks(complianceContext);

      // Validate against each applicable framework
      for (const framework of applicableFrameworks) {
        const frameworkResult = await this.validateFramework(entity, context, framework);
        this.mergeResults(result, frameworkResult);
      }

      // GDPR-specific validation
      if (this.isGDPRApplicable(complianceContext)) {
        const gdprResult = await this.validateGDPR(entity, context);
        this.mergeResults(result, gdprResult);
      }

      // SOX-specific validation
      if (this.isSOXApplicable(complianceContext)) {
        const soxResult = await this.validateSOX(entity, context);
        this.mergeResults(result, soxResult);
      }

      // PCI-DSS validation
      if (this.isPCIApplicable(entity, context)) {
        const pciResult = await this.validatePCI(entity, context);
        this.mergeResults(result, pciResult);
      }

      // Data retention validation
      const retentionResult = await this.validateDataRetention(entity, context);
      this.mergeResults(result, retentionResult);

      // Consent validation
      const consentResult = await this.validateConsent(entity, context);
      this.mergeResults(result, consentResult);

      // Audit logging
      await this.auditComplianceValidation(context, result, Date.now() - startTime);

      result.isValid = result.errors.length === 0;

      return result;

    } catch (error) {
      this.logger.error('Compliance validation error:', error);
      throw new ComplianceViolationException(
        'Compliance validation failed due to system error',
        'SYSTEM_ERROR',
        'SYSTEM_ERROR',
        true,
        context.entityType,
        context.entityId
      );
    }
  }

  /**
   * Generate comprehensive compliance report
   */
  public async generateComplianceReport(
    entityType: string,
    jurisdiction: string = 'global'
  ): Promise<ComplianceReport> {
    const applicableFrameworks = Array.from(this.frameworks.values())
      .filter(f => f.jurisdiction.includes(jurisdiction) || f.jurisdiction.includes('global'));

    const violations: ComplianceViolation[] = [];
    const recommendations: string[] = [];
    const auditTrail = this.getAuditTrail();
    const retentionCompliance = await this.checkRetentionCompliance();

    // Check for violations in audit trail
    for (const entry of auditTrail) {
      if (entry.result === 'violation') {
        violations.push({
          ruleId: 'audit-violation',
          regulation: entry.regulation,
          severity: 'medium',
          description: `Compliance violation detected: ${entry.action}`,
          remediation: 'Review audit logs and implement corrective measures',
          timeline: '30 days',
          riskScore: 50
        });
      }
    }

    // Generate recommendations based on violations
    if (violations.length > 0) {
      recommendations.push('Implement automated compliance monitoring');
      recommendations.push('Provide staff training on data protection regulations');
      recommendations.push('Review and update data processing procedures');
    }

    const status: 'compliant' | 'non-compliant' | 'partial' = 
      violations.length === 0 ? 'compliant' : 
      violations.some(v => v.severity === 'critical') ? 'non-compliant' : 'partial';

    return {
      framework: applicableFrameworks.map(f => f.name).join(', '),
      timestamp: new Date(),
      status,
      violations,
      recommendations,
      auditTrail,
      dataSubjectRights: await this.assessDataSubjectRights(),
      retentionCompliance
    };
  }

  /**
   * Validate GDPR compliance
   */
  private async validateGDPR(entity: any, context: ValidationContext): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const complianceContext = context.complianceContext!;
    const gdprFramework = this.frameworks.get('GDPR');
    
    if (!gdprFramework) {
      result.warnings.push({
        field: '__gdpr__',
        code: 'GDPR_FRAMEWORK_NOT_FOUND',
        message: 'GDPR framework not configured',
        recommendation: 'Configure GDPR compliance framework'
      });
      return result;
    }

    // Article 6 - Lawfulness of processing
    if (!complianceContext.processingPurpose || complianceContext.processingPurpose.length === 0) {
      result.errors.push({
        field: '__gdpr__',
        code: 'GDPR_NO_LAWFUL_BASIS',
        message: 'No lawful basis for processing personal data',
        severity: 'critical',
        category: 'compliance'
      });
    }

    // Article 7 - Conditions for consent (if consent is the lawful basis)
    if (complianceContext.processingPurpose.includes('consent')) {
      if (complianceContext.consentStatus !== 'granted') {
        result.errors.push({
          field: '__gdpr__',
          code: 'GDPR_NO_VALID_CONSENT',
          message: 'Valid consent required for processing',
          severity: 'critical',
          category: 'compliance'
        });
      }
    }

    // Article 5 - Principles of processing
    const piiFields = this.identifyPIIFields(entity);
    if (piiFields.length > 0) {
      // Data minimization principle
      if (!this.isPurposeLimited(entity, complianceContext.processingPurpose)) {
        result.warnings.push({
          field: '__gdpr__',
          code: 'GDPR_DATA_MINIMIZATION',
          message: 'Consider if all personal data is necessary for the stated purpose',
          recommendation: 'Review data collection against processing purposes'
        });
      }

      // Storage limitation principle
      if (complianceContext.retentionPolicy) {
        const currentAge = this.calculateDataAge(entity);
        if (currentAge > complianceContext.retentionPolicy.retentionPeriod) {
          result.errors.push({
            field: '__gdpr__',
            code: 'GDPR_RETENTION_EXCEEDED',
            message: 'Personal data retained beyond allowed period',
            severity: 'high',
            category: 'compliance'
          });
        }
      }
    }

    // Article 25 - Data protection by design and by default
    if (!this.hasPrivacyByDesign(entity, context)) {
      result.warnings.push({
        field: '__gdpr__',
        code: 'GDPR_PRIVACY_BY_DESIGN',
        message: 'Consider implementing privacy by design measures',
        recommendation: 'Implement data protection measures by default'
      });
    }

    // Article 32 - Security of processing
    if (!this.hasAdequateSecurity(entity, context)) {
      result.errors.push({
        field: '__gdpr__',
        code: 'GDPR_SECURITY_MEASURES',
        message: 'Adequate security measures not implemented',
        severity: 'high',
        category: 'compliance'
      });
    }

    return result;
  }

  /**
   * Validate SOX compliance
   */
  private async validateSOX(entity: any, context: ValidationContext): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Section 302 - Corporate responsibility for financial reports
    if (this.isFinancialData(entity, context)) {
      if (!this.hasProperAuthorization(context)) {
        result.errors.push({
          field: '__sox__',
          code: 'SOX_UNAUTHORIZED_FINANCIAL_ACCESS',
          message: 'Unauthorized access to financial data',
          severity: 'critical',
          category: 'compliance'
        });
      }

      // Section 404 - Internal controls assessment
      if (!this.hasInternalControls(entity, context)) {
        result.errors.push({
          field: '__sox__',
          code: 'SOX_INTERNAL_CONTROLS',
          message: 'Adequate internal controls not in place',
          severity: 'high',
          category: 'compliance'
        });
      }

      // Audit trail requirement
      if (!this.hasCompleteAuditTrail(entity, context)) {
        result.errors.push({
          field: '__sox__',
          code: 'SOX_AUDIT_TRAIL',
          message: 'Complete audit trail required for financial data',
          severity: 'high',
          category: 'compliance'
        });
      }
    }

    return result;
  }

  /**
   * Validate PCI-DSS compliance
   */
  private async validatePCI(entity: any, context: ValidationContext): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const cardDataFields = this.identifyCardDataFields(entity);
    
    if (cardDataFields.length > 0) {
      // Requirement 3 - Protect stored cardholder data
      for (const field of cardDataFields) {
        if (!this.isCardDataEncrypted(entity[field])) {
          result.errors.push({
            field,
            code: 'PCI_UNENCRYPTED_CARD_DATA',
            message: 'Cardholder data must be encrypted',
            severity: 'critical',
            category: 'compliance'
          });
        }
      }

      // Requirement 4 - Encrypt transmission of cardholder data
      if (!this.hasSecureTransmission(context)) {
        result.errors.push({
          field: '__pci__',
          code: 'PCI_INSECURE_TRANSMISSION',
          message: 'Cardholder data transmission must use strong encryption',
          severity: 'critical',
          category: 'compliance'
        });
      }

      // Requirement 7 - Restrict access by business need-to-know
      if (!this.hasRestrictedAccess(entity, context)) {
        result.errors.push({
          field: '__pci__',
          code: 'PCI_EXCESSIVE_ACCESS',
          message: 'Access to cardholder data should be restricted to business need',
          severity: 'high',
          category: 'compliance'
        });
      }

      // Requirement 10 - Track and monitor access
      if (!this.hasAccessMonitoring(context)) {
        result.warnings.push({
          field: '__pci__',
          code: 'PCI_ACCESS_MONITORING',
          message: 'Implement monitoring for cardholder data access',
          recommendation: 'Enable comprehensive access logging and monitoring'
        });
      }
    }

    return result;
  }

  /**
   * Validate data retention compliance
   */
  private async validateDataRetention(entity: any, context: ValidationContext): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const complianceContext = context.complianceContext;
    if (!complianceContext?.retentionPolicy) {
      result.warnings.push({
        field: '__retention__',
        code: 'NO_RETENTION_POLICY',
        message: 'No data retention policy specified',
        recommendation: 'Define and implement data retention policies'
      });
      return result;
    }

    const dataAge = this.calculateDataAge(entity);
    const retentionPeriod = complianceContext.retentionPolicy.retentionPeriod;

    if (dataAge > retentionPeriod) {
      const severity = dataAge > retentionPeriod * 1.5 ? 'high' : 'medium';
      result.errors.push({
        field: '__retention__',
        code: 'RETENTION_PERIOD_EXCEEDED',
        message: `Data retained beyond policy limit (${dataAge} days > ${retentionPeriod} days)`,
        severity: severity as 'medium' | 'high',
        category: 'compliance'
      });
    } else if (dataAge > retentionPeriod * 0.9) {
      result.warnings.push({
        field: '__retention__',
        code: 'APPROACHING_RETENTION_LIMIT',
        message: `Data approaching retention limit in ${retentionPeriod - dataAge} days`,
        recommendation: 'Plan for data archival or deletion'
      });
    }

    return result;
  }

  /**
   * Validate consent requirements
   */
  private async validateConsent(entity: any, context: ValidationContext): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const complianceContext = context.complianceContext;
    if (!complianceContext) return result;

    const dataSubject = complianceContext.dataSubject;
    if (!dataSubject) {
      result.warnings.push({
        field: '__consent__',
        code: 'NO_DATA_SUBJECT',
        message: 'No data subject identified for consent validation',
        recommendation: 'Identify data subjects for proper consent management'
      });
      return result;
    }

    const consentRecord = this.consentRegistry.get(dataSubject);
    const piiFields = this.identifyPIIFields(entity);

    if (piiFields.length > 0) {
      if (!consentRecord) {
        result.errors.push({
          field: '__consent__',
          code: 'NO_CONSENT_RECORD',
          message: 'No consent record found for data subject',
          severity: 'high',
          category: 'compliance'
        });
      } else {
        // Check if consent covers the processing purpose
        const purposesCovered = consentRecord.purposes.filter(p => 
          complianceContext.processingPurpose?.includes(p)
        );

        if (purposesCovered.length === 0) {
          result.errors.push({
            field: '__consent__',
            code: 'CONSENT_PURPOSE_MISMATCH',
            message: 'Consent does not cover current processing purpose',
            severity: 'high',
            category: 'compliance'
          });
        }

        // Check if consent is still valid (not withdrawn)
        if (consentRecord.status === 'withdrawn') {
          result.errors.push({
            field: '__consent__',
            code: 'CONSENT_WITHDRAWN',
            message: 'Data subject has withdrawn consent',
            severity: 'critical',
            category: 'compliance'
          });
        }

        // Check consent expiry
        if (consentRecord.expiryDate && new Date() > consentRecord.expiryDate) {
          result.errors.push({
            field: '__consent__',
            code: 'CONSENT_EXPIRED',
            message: 'Consent has expired',
            severity: 'high',
            category: 'compliance'
          });
        }
      }
    }

    return result;
  }

  /**
   * Validate against a specific compliance framework
   */
  private async validateFramework(
    entity: any, 
    context: ValidationContext, 
    framework: ComplianceFramework
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    for (const rule of framework.rules) {
      try {
        const ruleResult = await this.evaluateComplianceRule(rule, entity, context);
        
        if (!ruleResult.compliant) {
          if (rule.mandatory) {
            result.errors.push({
              field: ruleResult.field || '__compliance__',
              code: rule.id,
              message: ruleResult.message || `Compliance rule '${rule.name}' violation`,
              severity: 'high',
              category: 'compliance'
            });
          } else {
            result.warnings.push({
              field: ruleResult.field || '__compliance__',
              code: rule.id,
              message: ruleResult.message || `Compliance rule '${rule.name}' warning`,
              recommendation: 'Review compliance requirements and implement necessary measures'
            });
          }
        }
      } catch (error) {
        this.logger.error(`Compliance rule '${rule.id}' evaluation error:`, error);
        result.errors.push({
          field: '__compliance__',
          code: 'RULE_EVALUATION_ERROR',
          message: `Failed to evaluate compliance rule: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'medium',
          category: 'compliance'
        });
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Evaluate a compliance rule
   */
  private async evaluateComplianceRule(
    rule: ComplianceRule,
    entity: any,
    context: ValidationContext
  ): Promise<{ compliant: boolean; message?: string; field?: string }> {
    if (typeof rule.condition === 'string') {
      const func = new Function('entity', 'context', `return ${rule.condition}`);
      const result = await func(entity, context.complianceContext);
      return { 
        compliant: Boolean(result),
        message: result ? undefined : `Compliance rule '${rule.name}' failed`
      };
    } else {
      const result = await rule.condition(entity, context.complianceContext);
      return { 
        compliant: Boolean(result),
        message: result ? undefined : `Compliance rule '${rule.name}' failed`
      };
    }
  }

  // Helper methods for specific compliance checks

  private getApplicableFrameworks(context: ComplianceContext): ComplianceFramework[] {
    return Array.from(this.frameworks.values()).filter(framework =>
      framework.jurisdiction.includes(context.jurisdiction) ||
      framework.jurisdiction.includes('global')
    );
  }

  private isGDPRApplicable(context: ComplianceContext): boolean {
    return context.jurisdiction === 'EU' || 
           context.jurisdiction === 'EEA' ||
           context.processingPurpose?.some(p => p.includes('personal_data')) || false;
  }

  private isSOXApplicable(context: ComplianceContext): boolean {
    return context.jurisdiction === 'US' ||
           context.processingPurpose?.some(p => p.includes('financial')) || false;
  }

  private isPCIApplicable(entity: any, context: ValidationContext): boolean {
    return this.identifyCardDataFields(entity).length > 0;
  }

  private identifyPIIFields(entity: any): string[] {
    const piiIndicators = [
      'name', 'email', 'phone', 'address', 'ssn', 'birthday',
      'firstName', 'lastName', 'personalEmail', 'homePhone'
    ];
    
    return Object.keys(entity).filter(key =>
      piiIndicators.some(indicator => 
        key.toLowerCase().includes(indicator.toLowerCase())
      )
    );
  }

  private identifyCardDataFields(entity: any): string[] {
    const cardDataIndicators = [
      'cardNumber', 'creditCard', 'pan', 'expiryDate', 'cvv', 'securityCode'
    ];
    
    return Object.keys(entity).filter(key =>
      cardDataIndicators.some(indicator => 
        key.toLowerCase().includes(indicator.toLowerCase())
      )
    );
  }

  private isFinancialData(entity: any, context: ValidationContext): boolean {
    const financialIndicators = [
      'amount', 'price', 'cost', 'revenue', 'expense', 'budget',
      'account', 'invoice', 'payment', 'transaction'
    ];
    
    return Object.keys(entity).some(key =>
      financialIndicators.some(indicator => 
        key.toLowerCase().includes(indicator.toLowerCase())
      )
    ) || context.entityType.toLowerCase().includes('financial');
  }

  private calculateDataAge(entity: any): number {
    const createdDate = entity.createDate || entity.createdAt || entity.created;
    if (!createdDate) return 0;
    
    const created = new Date(createdDate);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  private isPurposeLimited(entity: any, purposes: string[]): boolean {
    // Simplified check - in production, implement sophisticated purpose limitation logic
    return purposes && purposes.length > 0;
  }

  private hasPrivacyByDesign(entity: any, context: ValidationContext): boolean {
    // Check for privacy-enhancing features
    const privacyFeatures = ['anonymized', 'pseudonymized', 'encrypted', 'masked'];
    return Object.keys(entity).some(key => 
      privacyFeatures.some(feature => key.toLowerCase().includes(feature))
    );
  }

  private hasAdequateSecurity(entity: any, context: ValidationContext): boolean {
    // Basic security check - in production, implement comprehensive security assessment
    return context.securityContext !== undefined &&
           context.securityContext.userId !== undefined;
  }

  private hasProperAuthorization(context: ValidationContext): boolean {
    return context.securityContext?.permissions?.includes('financial.access') || false;
  }

  private hasInternalControls(entity: any, context: ValidationContext): boolean {
    // Check for internal control indicators
    return context.securityContext?.permissions?.includes('sox.controls') || false;
  }

  private hasCompleteAuditTrail(entity: any, context: ValidationContext): boolean {
    // Check for audit trail completeness
    return entity.createDate && entity.lastModifiedDate && context.userId;
  }

  private isCardDataEncrypted(value: any): boolean {
    if (typeof value !== 'string') return false;
    return value.startsWith('ENC:') || /^\*+\d{4}$/.test(value); // Masked card number
  }

  private hasSecureTransmission(context: ValidationContext): boolean {
    // Check for HTTPS or other secure transmission
    return true; // Assume secure transmission - implement actual check
  }

  private hasRestrictedAccess(entity: any, context: ValidationContext): boolean {
    return context.securityContext?.permissions?.includes('pci.access') || false;
  }

  private hasAccessMonitoring(context: ValidationContext): boolean {
    return context.requestId !== undefined; // Basic check for request tracking
  }

  private async checkRetentionCompliance(): Promise<RetentionCompliance[]> {
    // Simplified implementation
    return [{
      dataCategory: 'personal_data',
      retentionPeriod: 365,
      currentAge: 200,
      status: 'compliant',
      action: 'retain'
    }];
  }

  private async assessDataSubjectRights(): Promise<DataSubjectRights> {
    return {
      rightToAccess: true,
      rightToRectification: true,
      rightToErasure: true,
      rightToPortability: true,
      rightToRestriction: true,
      rightToObject: true,
      rightsRelatedToAutomation: false
    };
  }

  private mergeResults(target: ValidationResult, source: ValidationResult): void {
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
    target.isValid = target.isValid && source.isValid;
  }

  private async auditComplianceValidation(
    context: ValidationContext,
    result: ValidationResult,
    duration: number
  ): Promise<void> {
    const auditEntry: ComplianceAuditEntry = {
      timestamp: new Date(),
      regulation: 'MULTI',
      action: `compliance_validation_${context.operation}`,
      entityType: context.entityType,
      entityId: context.entityId ? String(context.entityId) : undefined,
      dataSubject: context.complianceContext?.dataSubject,
      lawfulBasis: context.complianceContext?.processingPurpose?.join(','),
      purpose: context.complianceContext?.processingPurpose?.join(',') || 'unknown',
      result: result.isValid ? 'compliant' : 'violation',
      details: {
        duration,
        errorCount: result.errors.length,
        warningCount: result.warnings.length
      }
    };

    this.auditLog.push(auditEntry);
    
    // Keep only last 10000 audit entries
    if (this.auditLog.length > 10000) {
      this.auditLog.splice(0, this.auditLog.length - 10000);
    }
  }

  private getAuditTrail(): ComplianceAuditEntry[] {
    return [...this.auditLog];
  }

  /**
   * Initialize compliance frameworks
   */
  private initializeFrameworks(): void {
    // GDPR Framework
    this.frameworks.set('GDPR', {
      name: 'General Data Protection Regulation',
      version: '2018-05-25',
      jurisdiction: ['EU', 'EEA', 'global'],
      rules: [
        {
          id: 'gdpr-article-6-lawfulness',
          name: 'Article 6 - Lawfulness of Processing',
          regulation: 'GDPR',
          type: 'data-protection',
          condition: (entity: any, context?: ComplianceContext) => {
            return Boolean(context?.processingPurpose && context.processingPurpose.length > 0);
          },
          action: {
            type: 'enforce',
            reportingRequired: true
          },
          mandatory: true
        }
      ],
      auditRequirements: [],
      retentionPolicies: [],
      consentRequirements: []
    });

    // SOX Framework
    this.frameworks.set('SOX', {
      name: 'Sarbanes-Oxley Act',
      version: '2002',
      jurisdiction: ['US'],
      rules: [
        {
          id: 'sox-section-302',
          name: 'Section 302 - Corporate Responsibility',
          regulation: 'SOX',
          type: 'audit',
          condition: (entity: any, context?: ComplianceContext) => {
            return true; // Simplified
          },
          action: {
            type: 'enforce',
            reportingRequired: true
          },
          mandatory: true
        }
      ],
      auditRequirements: [],
      retentionPolicies: [],
      consentRequirements: []
    });
  }

  /**
   * Get audit log
   */
  public getComplianceAuditLog(): ComplianceAuditEntry[] {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  public clearComplianceAuditLog(): void {
    this.auditLog.length = 0;
  }

  /**
   * Add compliance framework
   */
  public addComplianceFramework(framework: ComplianceFramework): void {
    this.frameworks.set(framework.name, framework);
  }
}

// Supporting interfaces
interface DataSubjectInfo {
  id: string;
  name: string;
  email: string;
  jurisdiction: string;
  dataCategories: string[];
  consentRecords: string[];
}

interface ConsentRecord {
  id: string;
  dataSubject: string;
  purposes: string[];
  consentType: 'explicit' | 'implicit' | 'opt-in' | 'opt-out';
  status: 'granted' | 'withdrawn' | 'pending';
  grantedDate: Date;
  expiryDate?: Date;
  withdrawnDate?: Date;
  lawfulBasis: string[];
}