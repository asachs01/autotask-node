/**
 * Comprehensive compliance validation system
 * Handles GDPR, SOX, HIPAA, PCI-DSS, CCPA, and other regulatory compliance
 */
import winston from 'winston';
import { ValidationResult, ValidationContext, ComplianceRule, RetentionPolicy } from '../types/ValidationTypes';
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
    retentionPeriod: number;
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
export declare class ComplianceValidator {
    private logger;
    private frameworks;
    private auditLog;
    private dataSubjectRegistry;
    private consentRegistry;
    constructor(logger: winston.Logger);
    /**
     * Validate compliance for an entity
     */
    validate(entity: any, context: ValidationContext): Promise<ValidationResult>;
    /**
     * Generate comprehensive compliance report
     */
    generateComplianceReport(entityType: string, jurisdiction?: string): Promise<ComplianceReport>;
    /**
     * Validate GDPR compliance
     */
    private validateGDPR;
    /**
     * Validate SOX compliance
     */
    private validateSOX;
    /**
     * Validate PCI-DSS compliance
     */
    private validatePCI;
    /**
     * Validate data retention compliance
     */
    private validateDataRetention;
    /**
     * Validate consent requirements
     */
    private validateConsent;
    /**
     * Validate against a specific compliance framework
     */
    private validateFramework;
    /**
     * Evaluate a compliance rule
     */
    private evaluateComplianceRule;
    private getApplicableFrameworks;
    private isGDPRApplicable;
    private isSOXApplicable;
    private isPCIApplicable;
    private identifyPIIFields;
    private identifyCardDataFields;
    private isFinancialData;
    private calculateDataAge;
    private isPurposeLimited;
    private hasPrivacyByDesign;
    private hasAdequateSecurity;
    private hasProperAuthorization;
    private hasInternalControls;
    private hasCompleteAuditTrail;
    private isCardDataEncrypted;
    private hasSecureTransmission;
    private hasRestrictedAccess;
    private hasAccessMonitoring;
    private checkRetentionCompliance;
    private assessDataSubjectRights;
    private mergeResults;
    private auditComplianceValidation;
    private getAuditTrail;
    /**
     * Initialize compliance frameworks
     */
    private initializeFrameworks;
    /**
     * Get audit log
     */
    getComplianceAuditLog(): ComplianceAuditEntry[];
    /**
     * Clear audit log
     */
    clearComplianceAuditLog(): void;
    /**
     * Add compliance framework
     */
    addComplianceFramework(framework: ComplianceFramework): void;
}
//# sourceMappingURL=ComplianceValidator.d.ts.map