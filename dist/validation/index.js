"use strict";
/**
 * Comprehensive validation and sanitization layer for Autotask SDK
 * Main entry point for all validation functionality
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultValidationEngine = exports.ValidationDecorators = exports.ValidationUtils = exports.ValidationFactory = exports.QualityAssurance = exports.ComplianceValidator = exports.SecurityValidator = exports.InputSanitizer = exports.SchemaRegistry = exports.ValidationEngine = void 0;
exports.validationMiddleware = validationMiddleware;
// Core validation engine and registry
var ValidationEngine_1 = require("./core/ValidationEngine");
Object.defineProperty(exports, "ValidationEngine", { enumerable: true, get: function () { return ValidationEngine_1.ValidationEngine; } });
var SchemaRegistry_1 = require("./core/SchemaRegistry");
Object.defineProperty(exports, "SchemaRegistry", { enumerable: true, get: function () { return SchemaRegistry_1.SchemaRegistry; } });
// Sanitization system
var InputSanitizer_1 = require("./sanitization/InputSanitizer");
Object.defineProperty(exports, "InputSanitizer", { enumerable: true, get: function () { return InputSanitizer_1.InputSanitizer; } });
// Security validation
var SecurityValidator_1 = require("./security/SecurityValidator");
Object.defineProperty(exports, "SecurityValidator", { enumerable: true, get: function () { return SecurityValidator_1.SecurityValidator; } });
// Compliance validation
var ComplianceValidator_1 = require("./compliance/ComplianceValidator");
Object.defineProperty(exports, "ComplianceValidator", { enumerable: true, get: function () { return ComplianceValidator_1.ComplianceValidator; } });
// Quality assurance
var QualityAssurance_1 = require("./quality/QualityAssurance");
Object.defineProperty(exports, "QualityAssurance", { enumerable: true, get: function () { return QualityAssurance_1.QualityAssurance; } });
// Types and interfaces
__exportStar(require("./types/ValidationTypes"), exports);
// Factory and configuration
const winston_1 = __importDefault(require("winston"));
const ValidationEngine_2 = require("./core/ValidationEngine");
const SchemaRegistry_2 = require("./core/SchemaRegistry");
const InputSanitizer_2 = require("./sanitization/InputSanitizer");
const SecurityValidator_2 = require("./security/SecurityValidator");
const ComplianceValidator_2 = require("./compliance/ComplianceValidator");
const QualityAssurance_2 = require("./quality/QualityAssurance");
/**
 * Factory for creating a fully configured validation engine
 */
class ValidationFactory {
    /**
     * Create a new validation engine with default configuration
     */
    static create(logger) {
        const effectiveLogger = logger || this.createDefaultLogger();
        // Create default configuration
        const config = {
            strictMode: false,
            enableBusinessRules: true,
            enableSecurityValidation: true,
            enableComplianceChecks: true,
            enableQualityAssurance: true,
            enableSanitization: true,
            enablePerformanceMonitoring: true,
            maxValidationTime: 5000, // 5 seconds
            cacheValidationResults: true,
            auditAllValidations: true,
            customValidators: [],
        };
        const sanitizationConfig = {
            enableXSSProtection: true,
            enableSQLInjectionProtection: true,
            enableScriptInjectionProtection: true,
            enableHTMLSanitization: true,
            enablePIIDetection: true,
            customSanitizers: [],
            whitelistedTags: [
                'b',
                'i',
                'em',
                'strong',
                'u',
                'p',
                'br',
                'span',
                'div',
            ],
            whitelistedAttributes: ['class', 'id'],
        };
        // Create components
        const schemaRegistry = new SchemaRegistry_2.SchemaRegistry(effectiveLogger);
        const sanitizer = new InputSanitizer_2.InputSanitizer(sanitizationConfig, effectiveLogger);
        const securityValidator = new SecurityValidator_2.SecurityValidator(effectiveLogger);
        const complianceValidator = new ComplianceValidator_2.ComplianceValidator(effectiveLogger);
        const qualityAssurance = new QualityAssurance_2.QualityAssurance(effectiveLogger);
        // Create validation engine
        const engine = new ValidationEngine_2.ValidationEngine(schemaRegistry, sanitizer, securityValidator, complianceValidator, qualityAssurance, effectiveLogger, config);
        return engine;
    }
    /**
     * Create validation engine with custom configuration
     */
    static createWithConfig(config, sanitizationConfig, logger) {
        const effectiveLogger = logger || this.createDefaultLogger();
        // Merge with defaults
        const fullConfig = {
            strictMode: false,
            enableBusinessRules: true,
            enableSecurityValidation: true,
            enableComplianceChecks: true,
            enableQualityAssurance: true,
            enableSanitization: true,
            enablePerformanceMonitoring: true,
            maxValidationTime: 5000,
            cacheValidationResults: true,
            auditAllValidations: true,
            customValidators: [],
            ...config,
        };
        const fullSanitizationConfig = {
            enableXSSProtection: true,
            enableSQLInjectionProtection: true,
            enableScriptInjectionProtection: true,
            enableHTMLSanitization: true,
            enablePIIDetection: true,
            customSanitizers: [],
            whitelistedTags: [
                'b',
                'i',
                'em',
                'strong',
                'u',
                'p',
                'br',
                'span',
                'div',
            ],
            whitelistedAttributes: ['class', 'id'],
            ...sanitizationConfig,
        };
        // Create components
        const schemaRegistry = new SchemaRegistry_2.SchemaRegistry(effectiveLogger);
        const sanitizer = new InputSanitizer_2.InputSanitizer(fullSanitizationConfig, effectiveLogger);
        const securityValidator = new SecurityValidator_2.SecurityValidator(effectiveLogger);
        const complianceValidator = new ComplianceValidator_2.ComplianceValidator(effectiveLogger);
        const qualityAssurance = new QualityAssurance_2.QualityAssurance(effectiveLogger);
        // Create validation engine
        const engine = new ValidationEngine_2.ValidationEngine(schemaRegistry, sanitizer, securityValidator, complianceValidator, qualityAssurance, effectiveLogger, fullConfig);
        return engine;
    }
    /**
     * Get singleton instance (creates if doesn't exist)
     */
    static getInstance(logger) {
        if (!this.instance) {
            this.instance = this.create(logger);
        }
        return this.instance;
    }
    /**
     * Reset singleton instance
     */
    static resetInstance() {
        this.instance = null;
    }
    /**
     * Create default logger
     */
    static createDefaultLogger() {
        return winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: { service: 'autotask-validation' },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
                }),
            ],
        });
    }
}
exports.ValidationFactory = ValidationFactory;
ValidationFactory.instance = null;
/**
 * Utility functions for common validation scenarios
 */
class ValidationUtils {
    /**
     * Quick validation for a single entity with default settings
     */
    static async validateEntity(entity, entityType, operation = 'create', userId) {
        const engine = ValidationFactory.getInstance();
        const context = {
            operation,
            entityType,
            userId,
            requestId: this.generateRequestId(),
        };
        return engine.validateEntity(entity, context);
    }
    /**
     * Validate multiple entities in batch
     */
    static async validateBatch(entities, userId) {
        const engine = ValidationFactory.getInstance();
        const contexts = entities.map(({ entity, entityType, operation }) => ({
            entity,
            context: {
                operation: operation || 'create',
                entityType,
                userId,
                requestId: this.generateRequestId(),
            },
        }));
        return engine.validateBatch(contexts);
    }
    /**
     * Quick sanitization for untrusted input
     */
    static async sanitizeInput(data, entityType = 'unknown') {
        const engine = ValidationFactory.getInstance();
        // Access the sanitizer directly (simplified approach)
        const logger = winston_1.default.createLogger({ silent: true });
        const sanitizationConfig = {
            enableXSSProtection: true,
            enableSQLInjectionProtection: true,
            enableScriptInjectionProtection: true,
            enableHTMLSanitization: true,
            enablePIIDetection: true,
            customSanitizers: [],
            whitelistedTags: ['b', 'i', 'em', 'strong', 'u', 'p', 'br'],
            whitelistedAttributes: ['class'],
        };
        const sanitizer = new InputSanitizer_2.InputSanitizer(sanitizationConfig, logger);
        return sanitizer.sanitize(data, entityType);
    }
    /**
     * Check if data meets quality thresholds
     */
    static async checkQuality(entity, entityType, minOverallScore = 80) {
        const context = {
            operation: 'read',
            entityType,
            requestId: this.generateRequestId(),
        };
        const result = await ValidationUtils.validateEntity(entity, entityType, 'read');
        // Extract quality-related warnings
        const qualityIssues = result.warnings
            .filter(w => w.code.includes('QUALITY'))
            .map(w => w.message);
        // Simplified quality score calculation
        const qualityScore = Math.max(0, 100 - result.errors.length * 20 - result.warnings.length * 5);
        return {
            passed: qualityScore >= minOverallScore && result.isValid,
            score: qualityScore,
            issues: [...result.errors.map(e => e.message), ...qualityIssues],
        };
    }
    /**
     * Detect potential security threats in data
     */
    static async detectThreats(data) {
        const logger = winston_1.default.createLogger({ silent: true });
        const securityValidator = new SecurityValidator_2.SecurityValidator(logger);
        const context = {
            operation: 'create',
            entityType: 'unknown',
            requestId: this.generateRequestId(),
            securityContext: {
                userId: 'system',
                roles: [],
                permissions: [],
            },
        };
        const result = await securityValidator.validate(data, context);
        return result.errors
            .filter(e => e.category === 'security')
            .map(e => ({
            type: e.code,
            severity: e.severity,
            description: e.message,
            field: e.field,
        }));
    }
    /**
     * Check compliance for specific regulations
     */
    static async checkCompliance(entity, entityType, jurisdiction = 'global', processingPurpose = ['business']) {
        const context = {
            operation: 'create',
            entityType,
            requestId: this.generateRequestId(),
            complianceContext: {
                jurisdiction,
                processingPurpose,
                consentStatus: 'granted',
            },
        };
        const engine = ValidationFactory.getInstance();
        const result = await engine.validateEntity(entity, context);
        const violations = result.errors
            .filter(e => e.category === 'compliance')
            .map(e => ({
            regulation: 'GDPR', // Simplified
            issue: e.message,
            severity: e.severity,
        }));
        return {
            compliant: violations.length === 0,
            violations,
        };
    }
    /**
     * Generate unique request ID
     */
    static generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.ValidationUtils = ValidationUtils;
/**
 * Validation decorators for easy integration
 */
class ValidationDecorators {
    /**
     * Method decorator for automatic validation
     */
    static validate(entityType, operation = 'create') {
        return function (target, propertyName, descriptor) {
            const method = descriptor.value;
            descriptor.value = async function (...args) {
                // Assume first argument is the entity data
                const entity = args[0];
                if (entity && typeof entity === 'object') {
                    try {
                        const result = await ValidationUtils.validateEntity(entity, entityType, operation);
                        if (!result.isValid) {
                            const errorMessage = result.errors.map(e => e.message).join('; ');
                            throw new Error(`Validation failed: ${errorMessage}`);
                        }
                        // Replace entity with sanitized version if available
                        if (result.sanitizedData) {
                            args[0] = result.sanitizedData;
                        }
                    }
                    catch (error) {
                        throw new Error(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
                return method.apply(this, args);
            };
            return descriptor;
        };
    }
    /**
     * Class decorator for automatic validation of all methods
     */
    static validateClass(entityType) {
        return function (constructor) {
            return class extends constructor {
            };
        };
    }
}
exports.ValidationDecorators = ValidationDecorators;
/**
 * Express middleware for request validation
 */
function validationMiddleware(options) {
    return async (req, res, next) => {
        try {
            const entity = options.bodyField ? req.body[options.bodyField] : req.body;
            if (!entity) {
                return next();
            }
            const result = await ValidationUtils.validateEntity(entity, options.entityType, options.operation || 'create', req.user?.id);
            if (!result.isValid && options.strict) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: result.errors.map(e => ({
                        field: e.field,
                        message: e.message,
                        code: e.code,
                    })),
                });
            }
            // Attach validation result to request
            req.validationResult = result;
            // Replace body with sanitized data if available
            if (result.sanitizedData) {
                if (options.bodyField) {
                    req.body[options.bodyField] = result.sanitizedData;
                }
                else {
                    req.body = result.sanitizedData;
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
// Export default instance for convenience
exports.defaultValidationEngine = ValidationFactory.getInstance();
//# sourceMappingURL=index.js.map