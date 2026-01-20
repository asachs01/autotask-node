/**
 * Comprehensive input sanitization system
 * Protects against SQL injection, XSS, script injection, and other security threats
 */
import winston from 'winston';
import { SanitizationConfig, ValidationResult } from '../types/ValidationTypes';
export declare class InputSanitizer {
    private config;
    private logger;
    private domPurify;
    private piiPatterns;
    private sqlInjectionPatterns;
    private xssPatterns;
    private scriptInjectionPatterns;
    constructor(config: SanitizationConfig, logger: winston.Logger);
    /**
     * Sanitize entity data comprehensively
     */
    sanitize(entity: any, entityType: string): Promise<any>;
    /**
     * Validate and sanitize with detailed reporting
     */
    validateAndSanitize(entity: any, entityType: string): Promise<ValidationResult>;
    /**
     * Deep sanitize object recursively
     */
    private deepSanitize;
    /**
     * Sanitize string value
     */
    private sanitizeString;
    /**
     * Sanitize SQL injection attempts
     */
    private sanitizeSQLInjection;
    /**
     * Sanitize XSS attempts
     */
    private sanitizeXSS;
    /**
     * Sanitize script injection attempts
     */
    private sanitizeScriptInjection;
    /**
     * Sanitize HTML content
     */
    private sanitizeHTML;
    /**
     * Apply custom sanitizer
     */
    private applyCustomSanitizer;
    /**
     * Detect security threats in data
     */
    private detectThreats;
    /**
     * Recursively scan for security threats
     */
    private scanForThreats;
    /**
     * Detect PII in data
     */
    private detectPII;
    /**
     * Recursively scan for PII
     */
    private scanForPII;
    /**
     * Check if string contains HTML
     */
    private containsHTML;
    /**
     * Phone number detection
     */
    private isPhoneNumber;
    /**
     * SSN detection
     */
    private isSSN;
    /**
     * Mask email
     */
    private maskEmail;
    /**
     * Mask phone number
     */
    private maskPhoneNumber;
    /**
     * Mask credit card
     */
    private maskCreditCard;
    /**
     * Mask SSN
     */
    private maskSSN;
    /**
     * Generic masking
     */
    private maskGeneric;
    /**
     * Initialize security patterns
     */
    private initializeSecurityPatterns;
    /**
     * Configure DOMPurify
     */
    private configureDOMPurify;
}
//# sourceMappingURL=InputSanitizer.d.ts.map