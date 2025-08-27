/**
 * Core validation types and interfaces for the Autotask SDK
 */

import Joi from 'joi';

// Validation Result Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  sanitizedData?: any;
  metadata?: ValidationMetadata;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'business' | 'data' | 'compliance';
  context?: Record<string, any>;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  value?: any;
  recommendation?: string;
}

export interface ValidationMetadata {
  entityType: string;
  validatedAt: Date;
  validationVersion: string;
  performanceMetrics?: PerformanceMetrics;
  auditTrail?: AuditEntry[];
}

export interface PerformanceMetrics {
  validationTime: number;
  sanitizationTime: number;
  totalTime: number;
  rulesExecuted: number;
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  userId?: string;
  changes?: FieldChange[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface FieldChange {
  field: string;
  oldValue?: any;
  newValue?: any;
  sanitized: boolean;
  reason?: string;
}

// Schema Types
export interface EntitySchema {
  entityType: string;
  version: string;
  schema: Joi.ObjectSchema;
  businessRules: BusinessRule[];
  securityRules: SecurityRule[];
  complianceRules: ComplianceRule[];
  metadata: EntityMetadata;
}

export interface EntityMetadata {
  description: string;
  primaryKey: string;
  requiredFields: string[];
  readOnlyFields: string[];
  piiFields: string[];
  auditedFields: string[];
  relationships: RelationshipInfo[];
  tags: string[];
}

export interface RelationshipInfo {
  field: string;
  relatedEntity: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  cascadeRules?: CascadeRule[];
}

export interface CascadeRule {
  operation: 'create' | 'update' | 'delete';
  action: 'cascade' | 'restrict' | 'setNull' | 'validate';
}

// Rule Types
export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  condition: string | ((entity: any, context?: any) => boolean);
  action: 'validate' | 'transform' | 'warn' | 'reject';
  priority: number;
  enabled: boolean;
  errorMessage?: string;
  warningMessage?: string;
}

export interface SecurityRule {
  id: string;
  name: string;
  type: 'authorization' | 'sanitization' | 'encryption' | 'audit';
  condition: string | ((entity: any, context?: SecurityContext) => boolean);
  action: SecurityAction;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityAction {
  type: 'allow' | 'deny' | 'sanitize' | 'encrypt' | 'audit';
  parameters?: Record<string, any>;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface SecurityContext {
  userId: string;
  roles: string[];
  permissions: string[];
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface ComplianceRule {
  id: string;
  name: string;
  regulation: 'GDPR' | 'SOX' | 'HIPAA' | 'PCI-DSS' | 'CCPA' | 'ISO27001' | 'Custom';
  type: 'data-protection' | 'retention' | 'consent' | 'audit' | 'access-control';
  condition: string | ((entity: any, context?: ComplianceContext) => boolean);
  action: ComplianceAction;
  mandatory: boolean;
}

export interface ComplianceAction {
  type: 'enforce' | 'warn' | 'report' | 'block';
  parameters?: Record<string, any>;
  reportingRequired: boolean;
}

export interface ComplianceContext {
  jurisdiction: string;
  dataSubject?: string;
  consentStatus?: 'granted' | 'withdrawn' | 'pending';
  retentionPolicy?: RetentionPolicy;
  processingPurpose: string[];
}

export interface RetentionPolicy {
  retentionPeriod: number; // in days
  deletionMethod: 'soft' | 'hard' | 'anonymize';
  archiveRequired: boolean;
}

// Sanitization Types
export interface SanitizationConfig {
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enableScriptInjectionProtection: boolean;
  enableHTMLSanitization: boolean;
  enablePIIDetection: boolean;
  customSanitizers: CustomSanitizer[];
  whitelistedTags?: string[];
  whitelistedAttributes?: string[];
}

export interface CustomSanitizer {
  name: string;
  pattern: RegExp;
  replacement: string | ((match: string) => string);
  fields: string[];
}

// Quality Assurance Types
export interface QualityMetrics {
  completeness: number; // 0-100%
  accuracy: number; // 0-100%
  consistency: number; // 0-100%
  validity: number; // 0-100%
  uniqueness: number; // 0-100%
  timeliness: number; // 0-100%
  overall: number; // 0-100%
}

export interface QualityRule {
  id: string;
  name: string;
  type: 'completeness' | 'accuracy' | 'consistency' | 'validity' | 'uniqueness' | 'timeliness';
  field: string;
  condition: string | ((value: any, entity: any) => QualityResult);
  weight: number; // Impact on overall quality score
  threshold: number; // Minimum acceptable score
}

export interface QualityResult {
  score: number;
  passed: boolean;
  issues: QualityIssue[];
}

export interface QualityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  field: string;
  recommendation?: string;
}

// Validation Configuration
export interface ValidationConfig {
  strictMode: boolean;
  enableBusinessRules: boolean;
  enableSecurityValidation: boolean;
  enableComplianceChecks: boolean;
  enableQualityAssurance: boolean;
  enableSanitization: boolean;
  enablePerformanceMonitoring: boolean;
  maxValidationTime: number; // milliseconds
  cacheValidationResults: boolean;
  auditAllValidations: boolean;
  customValidators: CustomValidator[];
}

export interface CustomValidator {
  name: string;
  entityTypes: string[];
  validator: (entity: any, context?: any) => Promise<ValidationResult>;
  priority: number;
}

// Validation Context
export interface ValidationContext {
  operation: 'create' | 'update' | 'delete' | 'read';
  userId?: string;
  sessionId?: string;
  requestId?: string;
  entityType: string;
  entityId?: string | number;
  parentEntity?: any;
  relatedEntities?: Record<string, any>;
  securityContext?: SecurityContext;
  complianceContext?: ComplianceContext;
  customContext?: Record<string, any>;
}

// Factory Types
export type ValidatorFactory<T = any> = (config?: any) => Validator<T>;

export interface Validator<T = any> {
  name: string;
  version: string;
  validate(entity: T, context?: ValidationContext): Promise<ValidationResult>;
  sanitize?(entity: T, config?: SanitizationConfig): Promise<T>;
  getSchema?(): Joi.ObjectSchema;
}

// Event Types for Validation Lifecycle
export interface ValidationEvent {
  type: 'validation-started' | 'validation-completed' | 'validation-failed' | 'sanitization-applied';
  timestamp: Date;
  entityType: string;
  entityId?: string | number;
  userId?: string;
  duration?: number;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  metadata?: Record<string, any>;
}

export type ValidationEventHandler = (event: ValidationEvent) => void;

// Error Types
export class ValidationException extends Error {
  constructor(
    message: string,
    public errors: ValidationError[],
    public warnings: ValidationWarning[],
    public entityType?: string,
    public entityId?: string | number
  ) {
    super(message);
    this.name = 'ValidationException';
  }
}

export class SanitizationException extends Error {
  constructor(
    message: string,
    public field: string,
    public originalValue: any,
    public sanitizedValue?: any
  ) {
    super(message);
    this.name = 'SanitizationException';
  }
}

export class SecurityViolationException extends Error {
  constructor(
    message: string,
    public violationType: string,
    public riskLevel: 'low' | 'medium' | 'high' | 'critical',
    public userId?: string,
    public ipAddress?: string
  ) {
    super(message);
    this.name = 'SecurityViolationException';
  }
}

export class ComplianceViolationException extends Error {
  constructor(
    message: string,
    public regulation: string,
    public violationType: string,
    public mandatory: boolean,
    public entityType?: string,
    public entityId?: string | number
  ) {
    super(message);
    this.name = 'ComplianceViolationException';
  }
}