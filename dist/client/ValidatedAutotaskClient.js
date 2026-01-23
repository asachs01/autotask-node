"use strict";
/**
 * Enhanced Autotask Client with integrated validation and sanitization
 * Uses composition instead of inheritance due to private constructor in AutotaskClient
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatedAutotaskClient = void 0;
const winston_1 = __importDefault(require("winston"));
const AutotaskClient_1 = require("./AutotaskClient");
class ValidatedAutotaskClient {
    constructor(config, logger) {
        this.auditLog = [];
        this.initialized = false;
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
    async initialize() {
        if (this.initialized)
            return;
        this.client = await AutotaskClient_1.AutotaskClient.create(this.config.auth, this.config.performanceConfig);
        this.initialized = true;
    }
    createDefaultLogger() {
        return winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            transports: [
                new winston_1.default.transports.Console({
                    stderrLevels: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
                })
            ]
        });
    }
    /**
     * Get the underlying client for direct access when needed
     */
    getClient() {
        if (!this.initialized) {
            throw new Error('Client not initialized. Call initialize() first.');
        }
        return this.client;
    }
    /**
     * Validated entity creation
     */
    async createEntity(entityType, entity, context) {
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
            const result = await this.performEntityOperation('create', entityType, sanitizedEntity);
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
        }
        catch (error) {
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
    validateEntity(entity, entityType) {
        const issues = [];
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
    validateSecurity(entity, context) {
        const threats = [];
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
    validateCompliance(entity, context) {
        const issues = [];
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
    sanitizeEntity(entity) {
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
    calculateQualityScore(validationResult, securityResult, complianceResult) {
        let score = 0;
        if (validationResult.passed)
            score += 40;
        if (securityResult.passed)
            score += 30;
        if (complianceResult.passed)
            score += 30;
        return score;
    }
    /**
     * Perform entity operation through underlying client
     * This is a simplified version - would need proper implementation
     */
    async performEntityOperation(operation, entityType, data) {
        // This is a placeholder - in reality, you'd route to appropriate client methods
        // For now, just return the data as-is
        return data;
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
        this.auditLog = [];
    }
}
exports.ValidatedAutotaskClient = ValidatedAutotaskClient;
//# sourceMappingURL=ValidatedAutotaskClient.js.map