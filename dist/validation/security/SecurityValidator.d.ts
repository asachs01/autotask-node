/**
 * Comprehensive security validation system
 * Handles authentication, authorization, permissions, and security auditing
 */
import winston from 'winston';
import { ValidationResult, ValidationContext, SecurityContext, SecurityRule } from '../types/ValidationTypes';
export interface SecurityPolicy {
    name: string;
    version: string;
    rules: SecurityRule[];
    defaultAction: 'allow' | 'deny';
    auditLevel: 'none' | 'basic' | 'detailed' | 'comprehensive';
    encryptionRequired: string[];
    piiFields: string[];
    restrictedFields: string[];
}
export interface CredentialValidationResult {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong' | 'excellent';
    issues: string[];
    recommendations: string[];
}
export interface AccessControlResult {
    granted: boolean;
    reason: string;
    requiredPermissions: string[];
    grantedPermissions: string[];
    restrictions: string[];
}
export interface ThreatAnalysis {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    threats: ThreatInfo[];
    recommendations: string[];
    blockedFields: string[];
}
export interface ThreatInfo {
    type: 'injection' | 'xss' | 'csrf' | 'data-exposure' | 'privilege-escalation' | 'suspicious-pattern';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    field?: string;
    pattern?: string;
    confidence: number;
}
export declare class SecurityValidator {
    private logger;
    private securityPolicies;
    private auditLog;
    private suspiciousActivityThreshold;
    private encryptionKey;
    constructor(logger: winston.Logger, encryptionKey?: string);
    /**
     * Validate security for an entity
     */
    validate(entity: any, context: ValidationContext): Promise<ValidationResult>;
    /**
     * Validate credentials
     */
    validateCredentials(securityContext: SecurityContext): Promise<CredentialValidationResult>;
    /**
     * Validate access control
     */
    validateAccess(entity: any, context: ValidationContext): Promise<AccessControlResult>;
    /**
     * Analyze threats in entity data
     */
    analyzeThreat(entity: any, context: ValidationContext): Promise<ThreatAnalysis>;
    /**
     * Validate field-level security
     */
    private validateFieldSecurity;
    /**
     * Validate encryption requirements
     */
    private validateEncryption;
    /**
     * Detect injection threats
     */
    private detectInjectionThreats;
    /**
     * Detect XSS threats
     */
    private detectXSSThreats;
    /**
     * Detect data exposure threats
     */
    private detectDataExposureThreats;
    /**
     * Detect privilege escalation threats
     */
    private detectPrivilegeEscalationThreats;
    /**
     * Detect suspicious patterns
     */
    private detectSuspiciousPatterns;
    /**
     * Scan object for pattern matches
     */
    private scanObjectForPatterns;
    /**
     * Calculate overall risk level from threats
     */
    private calculateRiskLevel;
    /**
     * Evaluate security rule
     */
    private evaluateSecurityRule;
    /**
     * Get required permissions for operation
     */
    private getRequiredPermissions;
    /**
     * Check for resource-level restrictions
     */
    private hasResourceLevelRestrictions;
    /**
     * Check PII permission
     */
    private hasPIIPermission;
    /**
     * Check field permission
     */
    private hasFieldPermission;
    /**
     * Check if value is encrypted
     */
    private isEncrypted;
    /**
     * Encrypt value
     */
    private encrypt;
    /**
     * Audit security validation
     */
    private auditSecurityValidation;
    /**
     * Detect suspicious activity
     */
    private detectSuspiciousActivity;
    /**
     * Validate IP address format
     */
    private isValidIPAddress;
    /**
     * Check if IP is suspicious
     */
    private isSuspiciousIP;
    /**
     * Get security policy for entity type
     */
    private getSecurityPolicy;
    /**
     * Generate encryption key
     */
    private generateEncryptionKey;
    /**
     * Initialize default security policies
     */
    private initializeDefaultPolicies;
    /**
     * Get audit log
     */
    getAuditLog(): typeof this.auditLog;
    /**
     * Clear audit log
     */
    clearAuditLog(): void;
    /**
     * Add security policy
     */
    addSecurityPolicy(policy: SecurityPolicy): void;
    /**
     * Update security policy
     */
    updateSecurityPolicy(entityType: string, policy: Partial<SecurityPolicy>): void;
}
//# sourceMappingURL=SecurityValidator.d.ts.map