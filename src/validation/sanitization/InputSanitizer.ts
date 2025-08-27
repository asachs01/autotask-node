/**
 * Comprehensive input sanitization system
 * Protects against SQL injection, XSS, script injection, and other security threats
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import validator from 'validator';
import winston from 'winston';
import { 
  SanitizationConfig, 
  CustomSanitizer, 
  ValidationResult,
  ValidationError,
  ValidationWarning,
  SanitizationException
} from '../types/ValidationTypes';

export class InputSanitizer {
  private config: SanitizationConfig;
  private logger: winston.Logger;
  private domPurify: any;
  private piiPatterns: RegExp[] = [];
  private sqlInjectionPatterns: RegExp[] = [];
  private xssPatterns: RegExp[] = [];
  private scriptInjectionPatterns: RegExp[] = [];

  constructor(config: SanitizationConfig, logger: winston.Logger) {
    this.config = config;
    this.logger = logger;
    
    // Initialize DOMPurify with JSDOM
    const window = new JSDOM('').window;
    this.domPurify = DOMPurify(window);
    
    this.initializeSecurityPatterns();
    this.configureDOMPurify();
  }

  /**
   * Sanitize entity data comprehensively
   */
  public async sanitize(entity: any, entityType: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      const sanitizedEntity = await this.deepSanitize(entity, entityType);
      
      this.logger.debug(`Entity sanitized in ${Date.now() - startTime}ms`, {
        entityType,
        originalSize: JSON.stringify(entity).length,
        sanitizedSize: JSON.stringify(sanitizedEntity).length
      });
      
      return sanitizedEntity;
      
    } catch (error) {
      this.logger.error('Sanitization error:', error);
      throw new SanitizationException(
        'Failed to sanitize entity data',
        '__root__',
        entity,
        null
      );
    }
  }

  /**
   * Validate and sanitize with detailed reporting
   */
  public async validateAndSanitize(entity: any, entityType: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedData: null
    };

    try {
      // First, detect threats
      const threats = await this.detectThreats(entity);
      
      // Add warnings for detected threats
      threats.forEach(threat => {
        result.warnings.push({
          field: threat.field,
          code: threat.type,
          message: threat.message,
          value: threat.value,
          recommendation: 'Value will be sanitized to remove security threats'
        });
      });

      // Sanitize the entity
      result.sanitizedData = await this.sanitize(entity, entityType);
      
      // Check for PII if enabled
      if (this.config.enablePIIDetection) {
        const piiDetection = await this.detectPII(entity);
        piiDetection.forEach(detection => {
          result.warnings.push({
            field: detection.field,
            code: 'PII_DETECTED',
            message: `Potential PII detected: ${detection.type}`,
            value: detection.maskedValue,
            recommendation: 'Ensure proper consent and data protection measures are in place'
          });
        });
      }

      return result;

    } catch (error) {
      result.isValid = false;
      result.errors.push({
        field: '__sanitization__',
        code: 'SANITIZATION_ERROR',
        message: error instanceof Error ? error.message : String(error),
        severity: 'high',
        category: 'security'
      });
      
      return result;
    }
  }

  /**
   * Deep sanitize object recursively
   */
  private async deepSanitize(obj: any, entityType: string, path: string = ''): Promise<any> {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj, path);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (obj instanceof Date) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return Promise.all(
        obj.map((item, index) => 
          this.deepSanitize(item, entityType, `${path}[${index}]`)
        )
      );
    }

    if (typeof obj === 'object') {
      const sanitizedObj: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = path ? `${path}.${key}` : key;
        sanitizedObj[key] = await this.deepSanitize(value, entityType, fieldPath);
      }
      
      return sanitizedObj;
    }

    return obj;
  }

  /**
   * Sanitize string value
   */
  private sanitizeString(value: string, path: string): string {
    let sanitized = value;

    // SQL Injection Protection
    if (this.config.enableSQLInjectionProtection) {
      sanitized = this.sanitizeSQLInjection(sanitized);
    }

    // XSS Protection
    if (this.config.enableXSSProtection) {
      sanitized = this.sanitizeXSS(sanitized);
    }

    // Script Injection Protection
    if (this.config.enableScriptInjectionProtection) {
      sanitized = this.sanitizeScriptInjection(sanitized);
    }

    // HTML Sanitization
    if (this.config.enableHTMLSanitization) {
      sanitized = this.sanitizeHTML(sanitized);
    }

    // Apply custom sanitizers
    for (const customSanitizer of this.config.customSanitizers) {
      if (customSanitizer.fields.length === 0 || customSanitizer.fields.includes(path)) {
        sanitized = this.applyCustomSanitizer(sanitized, customSanitizer);
      }
    }

    // Log if value was changed
    if (sanitized !== value) {
      this.logger.debug('String sanitized', {
        path,
        original: value.substring(0, 100),
        sanitized: sanitized.substring(0, 100),
        changed: true
      });
    }

    return sanitized;
  }

  /**
   * Sanitize SQL injection attempts
   */
  private sanitizeSQLInjection(value: string): string {
    let sanitized = value;

    // Remove or escape SQL injection patterns
    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(sanitized)) {
        // Replace with safe equivalent or remove
        sanitized = sanitized.replace(pattern, '');
        this.logger.warn('SQL injection pattern detected and removed', { 
          pattern: pattern.source,
          original: value.substring(0, 50)
        });
      }
    }

    // Escape SQL special characters
    sanitized = sanitized
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/;/g, '\\;')
      .replace(/--/g, '\\--')
      .replace(/\/\*/g, '\\/\\*')
      .replace(/\*\//g, '\\*\\/');

    return sanitized;
  }

  /**
   * Sanitize XSS attempts
   */
  private sanitizeXSS(value: string): string {
    let sanitized = value;

    // Use DOMPurify for HTML sanitization
    if (this.containsHTML(value)) {
      sanitized = this.domPurify.sanitize(value);
    }

    // Additional XSS pattern checks
    for (const pattern of this.xssPatterns) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '');
        this.logger.warn('XSS pattern detected and removed', { 
          pattern: pattern.source,
          original: value.substring(0, 50)
        });
      }
    }

    // URL encoding for dangerous characters
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  /**
   * Sanitize script injection attempts
   */
  private sanitizeScriptInjection(value: string): string {
    let sanitized = value;

    for (const pattern of this.scriptInjectionPatterns) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '');
        this.logger.warn('Script injection pattern detected and removed', { 
          pattern: pattern.source,
          original: value.substring(0, 50)
        });
      }
    }

    return sanitized;
  }

  /**
   * Sanitize HTML content
   */
  private sanitizeHTML(value: string): string {
    if (!this.containsHTML(value)) {
      return value;
    }

    return this.domPurify.sanitize(value);
  }

  /**
   * Apply custom sanitizer
   */
  private applyCustomSanitizer(value: string, sanitizer: CustomSanitizer): string {
    try {
      if (typeof sanitizer.replacement === 'string') {
        return value.replace(sanitizer.pattern, sanitizer.replacement);
      } else {
        return value.replace(sanitizer.pattern, sanitizer.replacement);
      }
    } catch (error) {
      this.logger.error(`Custom sanitizer '${sanitizer.name}' failed:`, error);
      return value;
    }
  }

  /**
   * Detect security threats in data
   */
  private async detectThreats(entity: any): Promise<Array<{
    field: string;
    type: string;
    message: string;
    value: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>> {
    const threats: Array<{
      field: string;
      type: string;
      message: string;
      value: any;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }> = [];

    await this.scanForThreats(entity, threats);
    return threats;
  }

  /**
   * Recursively scan for security threats
   */
  private async scanForThreats(
    obj: any, 
    threats: Array<{
      field: string;
      type: string;
      message: string;
      value: any;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>,
    path: string = ''
  ): Promise<void> {
    if (typeof obj === 'string') {
      // Check for SQL injection
      for (const pattern of this.sqlInjectionPatterns) {
        if (pattern.test(obj)) {
          threats.push({
            field: path || '__root__',
            type: 'SQL_INJECTION',
            message: 'Potential SQL injection detected',
            value: obj.substring(0, 100),
            severity: 'critical'
          });
          break;
        }
      }

      // Check for XSS
      for (const pattern of this.xssPatterns) {
        if (pattern.test(obj)) {
          threats.push({
            field: path || '__root__',
            type: 'XSS',
            message: 'Potential XSS attack detected',
            value: obj.substring(0, 100),
            severity: 'high'
          });
          break;
        }
      }

      // Check for script injection
      for (const pattern of this.scriptInjectionPatterns) {
        if (pattern.test(obj)) {
          threats.push({
            field: path || '__root__',
            type: 'SCRIPT_INJECTION',
            message: 'Potential script injection detected',
            value: obj.substring(0, 100),
            severity: 'high'
          });
          break;
        }
      }

    } else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        await this.scanForThreats(obj[i], threats, `${path}[${i}]`);
      }
    } else if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = path ? `${path}.${key}` : key;
        await this.scanForThreats(value, threats, fieldPath);
      }
    }
  }

  /**
   * Detect PII in data
   */
  private async detectPII(entity: any): Promise<Array<{
    field: string;
    type: string;
    maskedValue: string;
    confidence: number;
  }>> {
    const piiDetections: Array<{
      field: string;
      type: string;
      maskedValue: string;
      confidence: number;
    }> = [];

    await this.scanForPII(entity, piiDetections);
    return piiDetections;
  }

  /**
   * Recursively scan for PII
   */
  private async scanForPII(
    obj: any, 
    detections: Array<{
      field: string;
      type: string;
      maskedValue: string;
      confidence: number;
    }>,
    path: string = ''
  ): Promise<void> {
    if (typeof obj === 'string') {
      // Email detection
      if (validator.isEmail(obj)) {
        detections.push({
          field: path || '__root__',
          type: 'EMAIL',
          maskedValue: this.maskEmail(obj),
          confidence: 0.95
        });
      }

      // Phone number detection
      if (this.isPhoneNumber(obj)) {
        detections.push({
          field: path || '__root__',
          type: 'PHONE',
          maskedValue: this.maskPhoneNumber(obj),
          confidence: 0.85
        });
      }

      // Credit card detection
      if (validator.isCreditCard(obj)) {
        detections.push({
          field: path || '__root__',
          type: 'CREDIT_CARD',
          maskedValue: this.maskCreditCard(obj),
          confidence: 0.99
        });
      }

      // Social Security Number detection (US format)
      if (this.isSSN(obj)) {
        detections.push({
          field: path || '__root__',
          type: 'SSN',
          maskedValue: this.maskSSN(obj),
          confidence: 0.90
        });
      }

      // Additional PII pattern checks
      for (const pattern of this.piiPatterns) {
        if (pattern.test(obj)) {
          detections.push({
            field: path || '__root__',
            type: 'POTENTIAL_PII',
            maskedValue: this.maskGeneric(obj),
            confidence: 0.70
          });
          break;
        }
      }

    } else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        await this.scanForPII(obj[i], detections, `${path}[${i}]`);
      }
    } else if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = path ? `${path}.${key}` : key;
        await this.scanForPII(value, detections, fieldPath);
      }
    }
  }

  /**
   * Check if string contains HTML
   */
  private containsHTML(str: string): boolean {
    return /<[^>]*>/.test(str);
  }

  /**
   * Phone number detection
   */
  private isPhoneNumber(str: string): boolean {
    const phonePattern = /^[\+]?[1-9]?[\d\s\-\(\)]{7,15}$/;
    return phonePattern.test(str.replace(/\D/g, ''));
  }

  /**
   * SSN detection
   */
  private isSSN(str: string): boolean {
    const ssnPattern = /^\d{3}-?\d{2}-?\d{4}$/;
    return ssnPattern.test(str);
  }

  /**
   * Mask email
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Mask phone number
   */
  private maskPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return '*'.repeat(digits.length - 4) + digits.slice(-4);
  }

  /**
   * Mask credit card
   */
  private maskCreditCard(cc: string): string {
    const digits = cc.replace(/\D/g, '');
    return '*'.repeat(digits.length - 4) + digits.slice(-4);
  }

  /**
   * Mask SSN
   */
  private maskSSN(ssn: string): string {
    return '***-**-' + ssn.slice(-4);
  }

  /**
   * Generic masking
   */
  private maskGeneric(str: string): string {
    if (str.length <= 3) return '*'.repeat(str.length);
    return str.charAt(0) + '*'.repeat(str.length - 2) + str.charAt(str.length - 1);
  }

  /**
   * Initialize security patterns
   */
  private initializeSecurityPatterns(): void {
    // SQL Injection patterns
    this.sqlInjectionPatterns = [
      /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|MERGE|SELECT|UNION|UPDATE)\b)/gi,
      /((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,
      /(((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>))/gi,
      /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))/gi,
      /\b(and|or)\b\s*[^\w\s]*\s*(\w+\s*)*(=|like)/gi,
      /\b(union\s+(all\s+)?select|insert\s+into|delete\s+from|update\s+\w+\s+set)/gi
    ];

    // XSS patterns
    this.xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi
    ];

    // Script injection patterns
    this.scriptInjectionPatterns = [
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /Function\s*\(/gi,
      /new\s+Function/gi,
      /document\.write/gi,
      /document\.writeln/gi
    ];

    // PII patterns (basic examples)
    this.piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{16}\b/, // Credit card (simplified)
      /\b[A-Z]{2}\d{6,10}\b/, // Various ID patterns
    ];
  }

  /**
   * Configure DOMPurify
   */
  private configureDOMPurify(): void {
    // Configure allowed tags and attributes
    this.domPurify.setConfig({
      ALLOWED_TAGS: this.config.whitelistedTags || [
        'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'span', 'div'
      ],
      ALLOWED_ATTR: this.config.whitelistedAttributes || [
        'class', 'id'
      ],
      FORBID_SCRIPT: true,
      FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      SANITIZE_DOM: true
    });
  }
}