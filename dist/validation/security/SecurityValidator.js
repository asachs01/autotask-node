"use strict";
/**
 * Comprehensive security validation system
 * Handles authentication, authorization, permissions, and security auditing
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityValidator = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const ValidationTypes_1 = require("../types/ValidationTypes");
class SecurityValidator {
    constructor(logger, encryptionKey) {
        this.securityPolicies = new Map();
        this.auditLog = [];
        this.suspiciousActivityThreshold = 5;
        this.logger = logger;
        this.encryptionKey = encryptionKey || this.generateEncryptionKey();
        this.initializeDefaultPolicies();
    }
    /**
     * Validate security for an entity
     */
    async validate(entity, context) {
        const startTime = Date.now();
        try {
            const result = {
                isValid: true,
                errors: [],
                warnings: []
            };
            // Step 1: Credential validation
            if (context.securityContext) {
                const credentialResult = await this.validateCredentials(context.securityContext);
                if (!credentialResult.isValid) {
                    result.errors.push({
                        field: '__credentials__',
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid or insufficient credentials',
                        severity: 'critical',
                        category: 'security',
                        context: { issues: credentialResult.issues }
                    });
                }
            }
            // Step 2: Access control validation
            const accessResult = await this.validateAccess(entity, context);
            if (!accessResult.granted) {
                result.errors.push({
                    field: '__access__',
                    code: 'ACCESS_DENIED',
                    message: accessResult.reason,
                    severity: 'critical',
                    category: 'security',
                    context: {
                        required: accessResult.requiredPermissions,
                        granted: accessResult.grantedPermissions
                    }
                });
            }
            // Step 3: Threat analysis
            const threatAnalysis = await this.analyzeThreat(entity, context);
            if (threatAnalysis.riskLevel === 'critical' || threatAnalysis.riskLevel === 'high') {
                threatAnalysis.threats.forEach(threat => {
                    if (threat.severity === 'critical' || threat.severity === 'high') {
                        result.errors.push({
                            field: threat.field || '__threat__',
                            code: `SECURITY_THREAT_${threat.type.toUpperCase()}`,
                            message: threat.description,
                            severity: threat.severity,
                            category: 'security',
                            context: {
                                threatType: threat.type,
                                confidence: threat.confidence,
                                pattern: threat.pattern
                            }
                        });
                    }
                    else {
                        result.warnings.push({
                            field: threat.field || '__threat__',
                            code: `SECURITY_WARNING_${threat.type.toUpperCase()}`,
                            message: threat.description,
                            recommendation: threatAnalysis.recommendations.join('; ')
                        });
                    }
                });
            }
            // Step 4: Field-level security validation
            const fieldSecurityResult = await this.validateFieldSecurity(entity, context);
            result.errors.push(...fieldSecurityResult.errors);
            result.warnings.push(...fieldSecurityResult.warnings);
            // Step 5: Encryption validation
            const encryptionResult = await this.validateEncryption(entity, context);
            result.errors.push(...encryptionResult.errors);
            result.warnings.push(...encryptionResult.warnings);
            // Step 6: Audit logging
            await this.auditSecurityValidation(context, result, Date.now() - startTime);
            // Step 7: Suspicious activity detection
            await this.detectSuspiciousActivity(context, result);
            result.isValid = result.errors.length === 0;
            return result;
        }
        catch (error) {
            this.logger.error('Security validation error:', error);
            throw new ValidationTypes_1.SecurityViolationException('Security validation failed due to system error', 'SYSTEM_ERROR', 'critical', context.userId, context.securityContext?.ipAddress);
        }
    }
    /**
     * Validate credentials
     */
    async validateCredentials(securityContext) {
        const result = {
            isValid: false,
            strength: 'weak',
            issues: [],
            recommendations: []
        };
        // Basic user validation
        if (!securityContext.userId) {
            result.issues.push('No user ID provided');
            result.recommendations.push('Ensure proper authentication');
            return result;
        }
        // Role validation
        if (!securityContext.roles || securityContext.roles.length === 0) {
            result.issues.push('No roles assigned to user');
            result.recommendations.push('Assign appropriate roles to user');
        }
        // Permission validation
        if (!securityContext.permissions || securityContext.permissions.length === 0) {
            result.issues.push('No permissions assigned to user');
            result.recommendations.push('Grant necessary permissions');
        }
        // Session validation
        if (!securityContext.sessionId) {
            result.issues.push('No session ID provided');
            result.recommendations.push('Implement proper session management');
        }
        // IP address validation
        if (securityContext.ipAddress) {
            if (!this.isValidIPAddress(securityContext.ipAddress)) {
                result.issues.push('Invalid IP address format');
            }
            // Check for suspicious IP patterns
            if (await this.isSuspiciousIP(securityContext.ipAddress)) {
                result.issues.push('IP address flagged as suspicious');
                result.recommendations.push('Verify user identity and location');
            }
        }
        // Calculate credential strength
        let strengthScore = 0;
        if (securityContext.roles.length > 0)
            strengthScore += 25;
        if (securityContext.permissions.length > 0)
            strengthScore += 25;
        if (securityContext.sessionId)
            strengthScore += 25;
        if (securityContext.ipAddress && this.isValidIPAddress(securityContext.ipAddress))
            strengthScore += 25;
        if (strengthScore >= 100)
            result.strength = 'excellent';
        else if (strengthScore >= 75)
            result.strength = 'strong';
        else if (strengthScore >= 50)
            result.strength = 'medium';
        else
            result.strength = 'weak';
        result.isValid = result.issues.length === 0 && strengthScore >= 50;
        return result;
    }
    /**
     * Validate access control
     */
    async validateAccess(entity, context) {
        const policy = this.getSecurityPolicy(context.entityType);
        const securityContext = context.securityContext;
        if (!securityContext) {
            return {
                granted: policy?.defaultAction === 'allow',
                reason: 'No security context provided',
                requiredPermissions: [],
                grantedPermissions: [],
                restrictions: []
            };
        }
        const requiredPermissions = this.getRequiredPermissions(context.operation, context.entityType);
        const grantedPermissions = securityContext.permissions || [];
        const hasRequiredPermissions = requiredPermissions.every(perm => grantedPermissions.includes(perm) || grantedPermissions.includes('*'));
        const result = {
            granted: hasRequiredPermissions,
            reason: hasRequiredPermissions ? 'Access granted' : 'Insufficient permissions',
            requiredPermissions,
            grantedPermissions,
            restrictions: []
        };
        // Additional security rule checks
        if (policy) {
            for (const rule of policy.rules) {
                if (rule.type === 'authorization') {
                    try {
                        const ruleResult = await this.evaluateSecurityRule(rule, entity, securityContext);
                        if (!ruleResult.allowed) {
                            result.granted = false;
                            result.reason = ruleResult.reason || 'Security rule violation';
                            result.restrictions.push(ruleResult.restriction || 'Unknown restriction');
                        }
                    }
                    catch (error) {
                        this.logger.error('Security rule evaluation error:', error);
                        result.granted = false;
                        result.reason = 'Security rule evaluation failed';
                    }
                }
            }
        }
        // Resource-level access control
        if (context.entityId && await this.hasResourceLevelRestrictions(context.entityType, context.entityId, securityContext)) {
            result.granted = false;
            result.reason = 'Resource-level access denied';
            result.restrictions.push('Resource access restriction');
        }
        return result;
    }
    /**
     * Analyze threats in entity data
     */
    async analyzeThreat(entity, context) {
        const threats = [];
        const recommendations = [];
        const blockedFields = [];
        // Analyze for injection attacks
        const injectionThreats = await this.detectInjectionThreats(entity);
        threats.push(...injectionThreats);
        // Analyze for XSS attacks
        const xssThreats = await this.detectXSSThreats(entity);
        threats.push(...xssThreats);
        // Analyze for data exposure risks
        const exposureThreats = await this.detectDataExposureThreats(entity, context);
        threats.push(...exposureThreats);
        // Analyze for privilege escalation attempts
        const privilegeThreats = await this.detectPrivilegeEscalationThreats(entity, context);
        threats.push(...privilegeThreats);
        // Analyze for suspicious patterns
        const patternThreats = await this.detectSuspiciousPatterns(entity, context);
        threats.push(...patternThreats);
        // Calculate overall risk level
        const riskLevel = this.calculateRiskLevel(threats);
        // Generate recommendations
        if (threats.length > 0) {
            recommendations.push('Review and sanitize input data');
            recommendations.push('Implement additional access controls');
            recommendations.push('Monitor for suspicious activity');
        }
        if (riskLevel === 'critical' || riskLevel === 'high') {
            recommendations.push('Block or quarantine suspicious data');
            recommendations.push('Alert security team');
            recommendations.push('Implement enhanced logging');
        }
        return {
            riskLevel,
            threats,
            recommendations,
            blockedFields
        };
    }
    /**
     * Validate field-level security
     */
    async validateFieldSecurity(entity, context) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };
        const policy = this.getSecurityPolicy(context.entityType);
        if (!policy)
            return result;
        // Check PII fields
        for (const field of policy.piiFields) {
            if (entity[field] !== undefined) {
                if (!await this.hasPIIPermission(context.securityContext, field)) {
                    result.errors.push({
                        field,
                        code: 'PII_ACCESS_DENIED',
                        message: 'Access to PII field denied',
                        severity: 'high',
                        category: 'security'
                    });
                }
            }
        }
        // Check restricted fields
        for (const field of policy.restrictedFields) {
            if (entity[field] !== undefined) {
                if (!await this.hasFieldPermission(context.securityContext, field)) {
                    result.errors.push({
                        field,
                        code: 'RESTRICTED_FIELD_ACCESS',
                        message: 'Access to restricted field denied',
                        severity: 'medium',
                        category: 'security'
                    });
                }
            }
        }
        result.isValid = result.errors.length === 0;
        return result;
    }
    /**
     * Validate encryption requirements
     */
    async validateEncryption(entity, context) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };
        const policy = this.getSecurityPolicy(context.entityType);
        if (!policy)
            return result;
        for (const field of policy.encryptionRequired) {
            if (entity[field] !== undefined) {
                if (!this.isEncrypted(entity[field])) {
                    if (context.operation === 'create' || context.operation === 'update') {
                        // Auto-encrypt if possible
                        try {
                            entity[field] = this.encrypt(entity[field]);
                            result.warnings.push({
                                field,
                                code: 'FIELD_AUTO_ENCRYPTED',
                                message: 'Field automatically encrypted for security',
                                recommendation: 'Consider encrypting data before transmission'
                            });
                        }
                        catch (error) {
                            result.errors.push({
                                field,
                                code: 'ENCRYPTION_REQUIRED',
                                message: 'Field requires encryption but encryption failed',
                                severity: 'high',
                                category: 'security'
                            });
                        }
                    }
                    else {
                        result.errors.push({
                            field,
                            code: 'ENCRYPTION_REQUIRED',
                            message: 'Field requires encryption',
                            severity: 'high',
                            category: 'security'
                        });
                    }
                }
            }
        }
        result.isValid = result.errors.length === 0;
        return result;
    }
    /**
     * Detect injection threats
     */
    async detectInjectionThreats(entity) {
        const threats = [];
        const injectionPatterns = [
            { pattern: /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|MERGE|SELECT|UNION|UPDATE)\b)/gi, type: 'SQL' },
            { pattern: /((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi, type: 'SQL' },
            { pattern: /\b(and|or)\b\s*[^\w\s]*\s*(\w+\s*)*(=|like)/gi, type: 'SQL' },
            { pattern: /<script[^>]*>.*?<\/script>/gi, type: 'XSS' },
            { pattern: /javascript:/gi, type: 'XSS' },
            { pattern: /on\w+\s*=/gi, type: 'XSS' }
        ];
        await this.scanObjectForPatterns(entity, injectionPatterns, threats, 'injection');
        return threats;
    }
    /**
     * Detect XSS threats
     */
    async detectXSSThreats(entity) {
        const threats = [];
        const xssPatterns = [
            { pattern: /<script[^>]*>.*?<\/script>/gi, confidence: 0.9 },
            { pattern: /javascript:/gi, confidence: 0.8 },
            { pattern: /on\w+\s*=/gi, confidence: 0.7 },
            { pattern: /<iframe[^>]*>.*?<\/iframe>/gi, confidence: 0.85 },
            { pattern: /<object[^>]*>.*?<\/object>/gi, confidence: 0.8 }
        ];
        await this.scanObjectForPatterns(entity, xssPatterns, threats, 'xss');
        return threats;
    }
    /**
     * Detect data exposure threats
     */
    async detectDataExposureThreats(entity, context) {
        const threats = [];
        // Check for sensitive data in unexpected fields
        const sensitivePatterns = [
            { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: 'SSN', confidence: 0.9 },
            { pattern: /\b\d{16}\b/, type: 'Credit Card', confidence: 0.8 },
            { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, type: 'Email', confidence: 0.7 }
        ];
        for (const [field, value] of Object.entries(entity)) {
            if (typeof value === 'string') {
                for (const { pattern, type, confidence } of sensitivePatterns) {
                    if (pattern.test(value)) {
                        threats.push({
                            type: 'data-exposure',
                            severity: 'medium',
                            description: `Potential ${type} detected in field that may not be designed for sensitive data`,
                            field,
                            confidence
                        });
                    }
                }
            }
        }
        return threats;
    }
    /**
     * Detect privilege escalation threats
     */
    async detectPrivilegeEscalationThreats(entity, context) {
        const threats = [];
        // Check for attempts to modify user roles or permissions
        const privilegeFields = ['roles', 'permissions', 'access_level', 'admin', 'superuser'];
        for (const field of privilegeFields) {
            if (entity[field] !== undefined) {
                if (!context.securityContext?.permissions?.includes('admin') &&
                    !context.securityContext?.permissions?.includes('manage_permissions')) {
                    threats.push({
                        type: 'privilege-escalation',
                        severity: 'high',
                        description: 'Attempt to modify privilege-related field without appropriate permissions',
                        field,
                        confidence: 0.9
                    });
                }
            }
        }
        return threats;
    }
    /**
     * Detect suspicious patterns
     */
    async detectSuspiciousPatterns(entity, context) {
        const threats = [];
        // Check for unusual data sizes
        const jsonSize = JSON.stringify(entity).length;
        if (jsonSize > 1000000) { // 1MB
            threats.push({
                type: 'suspicious-pattern',
                severity: 'medium',
                description: 'Unusually large data payload detected',
                confidence: 0.6
            });
        }
        // Check for high frequency of special characters
        const text = JSON.stringify(entity);
        const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
        const specialCharRatio = specialCharCount / text.length;
        if (specialCharRatio > 0.3) {
            threats.push({
                type: 'suspicious-pattern',
                severity: 'low',
                description: 'High ratio of special characters detected',
                confidence: 0.5
            });
        }
        return threats;
    }
    /**
     * Scan object for pattern matches
     */
    async scanObjectForPatterns(obj, patterns, threats, threatType, path = '') {
        if (typeof obj === 'string') {
            for (const { pattern, type, confidence } of patterns) {
                if (pattern.test(obj)) {
                    threats.push({
                        type: threatType,
                        severity: 'high',
                        description: `Potential ${threatType} attack detected${type ? ` (${type})` : ''}`,
                        field: path || '__root__',
                        pattern: pattern.source,
                        confidence: confidence || 0.8
                    });
                }
            }
        }
        else if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                await this.scanObjectForPatterns(obj[i], patterns, threats, threatType, `${path}[${i}]`);
            }
        }
        else if (obj && typeof obj === 'object') {
            for (const [key, value] of Object.entries(obj)) {
                const fieldPath = path ? `${path}.${key}` : key;
                await this.scanObjectForPatterns(value, patterns, threats, threatType, fieldPath);
            }
        }
    }
    /**
     * Calculate overall risk level from threats
     */
    calculateRiskLevel(threats) {
        if (threats.some(t => t.severity === 'critical'))
            return 'critical';
        if (threats.some(t => t.severity === 'high'))
            return 'high';
        if (threats.some(t => t.severity === 'medium'))
            return 'medium';
        return 'low';
    }
    /**
     * Evaluate security rule
     */
    async evaluateSecurityRule(rule, entity, securityContext) {
        try {
            if (typeof rule.condition === 'string') {
                const func = new Function('entity', 'context', `return ${rule.condition}`);
                const result = await func(entity, securityContext);
                return {
                    allowed: Boolean(result),
                    reason: result ? undefined : `Security rule '${rule.name}' failed`,
                    restriction: rule.name
                };
            }
            else {
                const result = await rule.condition(entity, securityContext);
                return {
                    allowed: Boolean(result),
                    reason: result ? undefined : `Security rule '${rule.name}' failed`,
                    restriction: rule.name
                };
            }
        }
        catch (error) {
            this.logger.error(`Security rule '${rule.id}' evaluation error:`, error);
            return { allowed: false, reason: 'Security rule evaluation failed', restriction: rule.name };
        }
    }
    /**
     * Get required permissions for operation
     */
    getRequiredPermissions(operation, entityType) {
        const basePermissions = {
            create: [`${entityType.toLowerCase()}.create`, 'create'],
            read: [`${entityType.toLowerCase()}.read`, 'read'],
            update: [`${entityType.toLowerCase()}.update`, 'update'],
            delete: [`${entityType.toLowerCase()}.delete`, 'delete']
        };
        return basePermissions[operation] || [];
    }
    /**
     * Check for resource-level restrictions
     */
    async hasResourceLevelRestrictions(entityType, entityId, securityContext) {
        // Implement resource-level access control logic
        // This would typically check ownership, organizational boundaries, etc.
        return false; // Simplified for now
    }
    /**
     * Check PII permission
     */
    async hasPIIPermission(securityContext, field) {
        return securityContext?.permissions?.includes('pii.access') ||
            securityContext?.permissions?.includes('*') ||
            false;
    }
    /**
     * Check field permission
     */
    async hasFieldPermission(securityContext, field) {
        return securityContext?.permissions?.includes(`field.${field}`) ||
            securityContext?.permissions?.includes('field.*') ||
            securityContext?.permissions?.includes('*') ||
            false;
    }
    /**
     * Check if value is encrypted
     */
    isEncrypted(value) {
        if (typeof value !== 'string')
            return false;
        // Simple check for encrypted data pattern
        // In production, use more sophisticated detection
        return value.startsWith('ENC:') || /^[A-Za-z0-9+/=]{16,}$/.test(value);
    }
    /**
     * Encrypt value
     */
    encrypt(value) {
        try {
            return 'ENC:' + crypto_js_1.default.AES.encrypt(value, this.encryptionKey).toString();
        }
        catch (error) {
            this.logger.error('Encryption error:', error);
            throw new Error('Failed to encrypt value');
        }
    }
    /**
     * Audit security validation
     */
    async auditSecurityValidation(context, result, duration) {
        const auditEntry = {
            timestamp: new Date(),
            userId: context.userId,
            action: `security_validation_${context.operation}`,
            entityType: context.entityType,
            entityId: context.entityId ? String(context.entityId) : undefined,
            result: result.isValid ? 'allowed' : 'denied',
            details: {
                duration,
                errorCount: result.errors.length,
                warningCount: result.warnings.length,
                ipAddress: context.securityContext?.ipAddress,
                userAgent: context.securityContext?.userAgent
            }
        };
        this.auditLog.push(auditEntry);
        // Keep only last 1000 audit entries to prevent memory leaks
        if (this.auditLog.length > 1000) {
            this.auditLog.splice(0, this.auditLog.length - 1000);
        }
        // Log critical security events
        if (!result.isValid && result.errors.some(e => e.severity === 'critical')) {
            this.logger.warn('Critical security validation failure', auditEntry);
        }
    }
    /**
     * Detect suspicious activity
     */
    async detectSuspiciousActivity(context, result) {
        if (!context.userId)
            return;
        // Count recent failed validations for this user
        const recentTime = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes
        const recentFailures = this.auditLog.filter(entry => entry.userId === context.userId &&
            entry.result === 'denied' &&
            entry.timestamp > recentTime).length;
        if (recentFailures >= this.suspiciousActivityThreshold) {
            this.logger.warn('Suspicious activity detected', {
                userId: context.userId,
                failureCount: recentFailures,
                timeWindow: '5 minutes',
                ipAddress: context.securityContext?.ipAddress
            });
            // Add security warning
            result.warnings.push({
                field: '__security__',
                code: 'SUSPICIOUS_ACTIVITY',
                message: 'Multiple security validation failures detected',
                recommendation: 'Review user activity and consider additional security measures'
            });
        }
    }
    /**
     * Validate IP address format
     */
    isValidIPAddress(ip) {
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }
    /**
     * Check if IP is suspicious
     */
    async isSuspiciousIP(ip) {
        // In production, check against threat intelligence databases
        // For now, just check for obvious local/private IPs in production
        const privateRanges = [
            /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./
        ];
        return privateRanges.some(range => range.test(ip)) && process.env.NODE_ENV === 'production';
    }
    /**
     * Get security policy for entity type
     */
    getSecurityPolicy(entityType) {
        return this.securityPolicies.get(entityType) || this.securityPolicies.get('default');
    }
    /**
     * Generate encryption key
     */
    generateEncryptionKey() {
        return crypto_js_1.default.lib.WordArray.random(32).toString();
    }
    /**
     * Initialize default security policies
     */
    initializeDefaultPolicies() {
        // Default security policy
        this.securityPolicies.set('default', {
            name: 'Default Security Policy',
            version: '1.0.0',
            rules: [],
            defaultAction: 'allow',
            auditLevel: 'basic',
            encryptionRequired: [],
            piiFields: [],
            restrictedFields: []
        });
        // Account security policy
        this.securityPolicies.set('Account', {
            name: 'Account Security Policy',
            version: '1.0.0',
            rules: [
                {
                    id: 'account-owner-access',
                    name: 'Account Owner Access Control',
                    type: 'authorization',
                    condition: (entity, context) => {
                        return context?.permissions?.includes('account.manage') || false;
                    },
                    action: {
                        type: 'allow',
                        logLevel: 'info'
                    },
                    riskLevel: 'medium'
                }
            ],
            defaultAction: 'deny',
            auditLevel: 'detailed',
            encryptionRequired: ['taxID', 'bankAccount'],
            piiFields: ['accountName', 'address1', 'address2', 'phone', 'fax'],
            restrictedFields: ['ownerResourceId', 'parentAccountId']
        });
    }
    /**
     * Get audit log
     */
    getAuditLog() {
        return [...this.auditLog];
    }
    /**
     * Clear audit log
     */
    clearAuditLog() {
        this.auditLog.length = 0;
    }
    /**
     * Add security policy
     */
    addSecurityPolicy(policy) {
        this.securityPolicies.set(policy.name, policy);
    }
    /**
     * Update security policy
     */
    updateSecurityPolicy(entityType, policy) {
        const existing = this.securityPolicies.get(entityType);
        if (existing) {
            this.securityPolicies.set(entityType, { ...existing, ...policy });
        }
    }
}
exports.SecurityValidator = SecurityValidator;
//# sourceMappingURL=SecurityValidator.js.map