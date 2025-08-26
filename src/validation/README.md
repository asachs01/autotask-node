# Autotask SDK Validation & Sanitization Layer

## Overview

The Autotask SDK Validation & Sanitization Layer is a comprehensive enterprise-grade security system that protects against vulnerabilities, ensures data quality, and maintains regulatory compliance. It provides multi-layered validation including schema validation, data sanitization, security checks, compliance validation, and quality assurance.

## 🔒 Security Features

### Data Sanitization
- **XSS Protection**: Removes malicious scripts and HTML injections
- **SQL Injection Prevention**: Sanitizes database query attempts
- **Script Injection Protection**: Blocks JavaScript execution attempts
- **HTML Sanitization**: Cleanses HTML content while preserving safe formatting
- **PII Detection**: Identifies and masks personally identifiable information

### Security Validation
- **Authentication & Authorization**: Validates API credentials and user permissions
- **Field-Level Access Control**: Restricts access to sensitive fields based on roles
- **Threat Analysis**: Detects suspicious patterns and potential attacks
- **Security Auditing**: Comprehensive logging of all security events
- **IP Address Validation**: Identifies suspicious IP addresses and locations

## 📋 Compliance & Governance

### Regulatory Compliance
- **GDPR Compliance**: Data protection, consent management, right to be forgotten
- **SOX Compliance**: Financial data integrity, audit trails, internal controls
- **PCI-DSS**: Credit card data protection and encryption requirements
- **HIPAA**: Healthcare data privacy and security (configurable)
- **CCPA**: California consumer privacy protection

### Data Governance
- **Retention Policies**: Automated data lifecycle management
- **Consent Tracking**: Granular consent management and withdrawal handling
- **Audit Trails**: Complete data access and modification history
- **Data Subject Rights**: Support for access, rectification, and erasure requests

## 📊 Data Quality Assurance

### Quality Metrics
- **Completeness**: Validates required fields and data population
- **Accuracy**: Checks data format, type, and business rule compliance
- **Consistency**: Ensures uniform formatting and standardization
- **Validity**: Validates against business rules and constraints
- **Uniqueness**: Detects and prevents duplicate records
- **Timeliness**: Assesses data freshness and currency

### Quality Reporting
- **Real-time Quality Scoring**: Instant assessment of data quality
- **Quality Trends**: Historical quality metrics and improvement tracking
- **Issue Identification**: Automatic detection of data quality problems
- **Recommendations**: Actionable suggestions for quality improvements

## 🚀 Quick Start

### Basic Usage

```typescript
import { ValidationFactory, ValidationUtils } from './validation';

// Quick validation for a single entity
const account = {
  accountName: 'Acme Corporation',
  accountType: 1,
  address1: '123 Business St',
  city: 'Business City',
  state: 'BC',
  postalCode: '12345',
  country: 'United States',
  ownerResourceId: 123
};

const result = await ValidationUtils.validateEntity(account, 'Account', 'create');

if (result.isValid) {
  console.log('✅ Validation passed');
  // Use result.sanitizedData for the cleaned entity
} else {
  console.log('❌ Validation failed:', result.errors);
}
```

### Advanced Configuration

```typescript
import { ValidationFactory } from './validation';

const validationEngine = ValidationFactory.createWithConfig({
  strictMode: true,
  enableBusinessRules: true,
  enableSecurityValidation: true,
  enableComplianceChecks: true,
  enableQualityAssurance: true,
  enableSanitization: true,
  maxValidationTime: 5000,
  auditAllValidations: true
}, {
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  enablePIIDetection: true,
  customSanitizers: [
    {
      name: 'phone-normalizer',
      pattern: /\D/g,
      replacement: '',
      fields: ['phone', 'fax', 'mobilePhone']
    }
  ]
});
```

### Security Context

```typescript
import { ValidationContext, SecurityContext } from './validation/types/ValidationTypes';

const securityContext: SecurityContext = {
  userId: 'user-123',
  roles: ['account_manager'],
  permissions: ['account.create', 'account.read', 'pii.access'],
  ipAddress: '192.168.1.100',
  sessionId: 'session-abc123'
};

const context: ValidationContext = {
  operation: 'create',
  entityType: 'Account',
  userId: 'user-123',
  requestId: 'req-456',
  securityContext
};

const result = await validationEngine.validateEntity(account, context);
```

### Compliance Context

```typescript
import { ComplianceContext } from './validation/types/ValidationTypes';

const complianceContext: ComplianceContext = {
  jurisdiction: 'EU',
  dataSubject: 'john.doe@example.com',
  consentStatus: 'granted',
  processingPurpose: ['business_contact', 'service_delivery'],
  retentionPolicy: {
    retentionPeriod: 365, // days
    deletionMethod: 'hard',
    archiveRequired: true
  }
};

const context: ValidationContext = {
  operation: 'create',
  entityType: 'Contact',
  userId: 'user-123',
  complianceContext
};
```

## 🛡️ Security Examples

### XSS Protection

```typescript
const maliciousEntity = {
  accountName: 'Test <script>alert("XSS")</script> Company',
  description: 'Click <a href="javascript:alert(\'XSS\')">here</a>'
};

const result = await ValidationUtils.validateEntity(maliciousEntity, 'Account');

// result.sanitizedData.accountName = 'Test  Company'
// result.sanitizedData.description = 'Click here' (safe version)
```

### SQL Injection Protection

```typescript
const suspiciousEntity = {
  accountName: "Robert'; DROP TABLE accounts; --",
  searchQuery: "1' OR '1'='1"
};

const result = await ValidationUtils.validateEntity(suspiciousEntity, 'Account');

// SQL injection attempts are sanitized and logged as security threats
```

### PII Detection

```typescript
const entityWithPII = {
  description: 'Contact John Doe at john.doe@example.com or 555-123-4567',
  notes: 'SSN: 123-45-6789, Credit Card: 4532-1234-5678-9012'
};

const result = await ValidationUtils.validateEntity(entityWithPII, 'Account');

// PII is detected and warnings are generated:
// - Email detected: j***.doe@example.com
// - Phone detected: ***-***-4567
// - SSN detected: ***-**-6789
// - Credit card detected: ****-****-****-9012
```

## 📈 Quality Assurance Examples

### Quality Assessment

```typescript
const qualityCheck = await ValidationUtils.checkQuality(entity, 'Account', 80);

console.log(`Quality Score: ${qualityCheck.score}%`);
console.log(`Quality Check: ${qualityCheck.passed ? 'PASSED' : 'FAILED'}`);

if (qualityCheck.issues.length > 0) {
  console.log('Quality Issues:');
  qualityCheck.issues.forEach(issue => console.log(`- ${issue}`));
}
```

### Duplicate Detection

```typescript
import { QualityAssurance } from './validation/quality/QualityAssurance';

const accounts = [
  { accountName: 'Acme Corp', email: 'contact@acme.com' },
  { accountName: 'ACME Corporation', email: 'info@acme.com' },
  { accountName: 'Acme Inc.', email: 'contact@acme.com' }
];

const duplicateConfig = {
  fuzzyMatching: true,
  similarityThreshold: 0.8,
  fields: ['accountName', 'email'],
  algorithms: ['levenshtein', 'jaccard'],
  caseSensitive: false,
  ignoreWhitespace: true
};

const qualityAssurance = new QualityAssurance(logger);
const duplicates = await qualityAssurance.detectDuplicates(accounts, duplicateConfig);

console.log(`Found ${duplicates.length} potential duplicates`);
```

## 🌍 Compliance Examples

### GDPR Compliance

```typescript
// Validate GDPR compliance for EU data subjects
const personalData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+49-123-456-7890',
  address: 'Hauptstraße 1, Berlin, Germany'
};

const gdprContext: ComplianceContext = {
  jurisdiction: 'EU',
  dataSubject: 'john.doe@example.com',
  consentStatus: 'granted',
  processingPurpose: ['service_delivery', 'customer_support'],
  retentionPolicy: {
    retentionPeriod: 365,
    deletionMethod: 'anonymize',
    archiveRequired: false
  }
};

const result = await ValidationUtils.checkCompliance(
  personalData, 
  'Contact', 
  'EU', 
  ['service_delivery']
);

if (!result.compliant) {
  console.log('GDPR Violations:');
  result.violations.forEach(v => 
    console.log(`- ${v.regulation}: ${v.issue} (${v.severity})`)
  );
}
```

### SOX Compliance

```typescript
// Financial data requires SOX compliance
const financialData = {
  revenue: 1000000,
  expenses: 750000,
  accountingPeriod: '2024-Q1',
  approvedBy: 'cfo-user-123',
  auditTrail: {
    createdBy: 'finance-user-456',
    reviewedBy: 'manager-user-789',
    approvedBy: 'cfo-user-123'
  }
};

const soxContext: ComplianceContext = {
  jurisdiction: 'US',
  processingPurpose: ['financial_reporting', 'audit_compliance']
};

// SOX compliance automatically validated for financial entities
```

## 🔧 Configuration

### Environment Variables

```bash
# Validation Configuration
VALIDATION_STRICT_MODE=false
VALIDATION_MAX_TIME=5000
VALIDATION_CACHE_ENABLED=true
VALIDATION_AUDIT_ALL=true

# Security Configuration
SECURITY_ENCRYPTION_KEY=your-256-bit-key-here
SECURITY_SUSPICIOUS_IP_THRESHOLD=5
SECURITY_MAX_FAILED_ATTEMPTS=10

# Compliance Configuration
COMPLIANCE_DEFAULT_JURISDICTION=global
COMPLIANCE_RETENTION_DEFAULT=365
COMPLIANCE_AUDIT_RETENTION=2555

# Quality Configuration
QUALITY_MINIMUM_SCORE=80
QUALITY_ENABLE_PROFILING=true
QUALITY_DUPLICATE_THRESHOLD=0.85
```

### Custom Validation Rules

```typescript
import { BusinessRule, SecurityRule, ComplianceRule } from './validation/types/ValidationTypes';

// Custom business rule
const customBusinessRule: BusinessRule = {
  id: 'account-revenue-check',
  name: 'Account Revenue Validation',
  description: 'Ensures account revenue is within reasonable bounds',
  condition: (entity) => {
    return entity.revenue >= 0 && entity.revenue <= 1000000000;
  },
  action: 'validate',
  priority: 100,
  enabled: true,
  errorMessage: 'Account revenue must be between $0 and $1B'
};

// Custom security rule
const customSecurityRule: SecurityRule = {
  id: 'financial-data-encryption',
  name: 'Financial Data Encryption Requirement',
  type: 'encryption',
  condition: (entity, context) => {
    const financialFields = ['revenue', 'bankAccount', 'taxId'];
    return financialFields.every(field => {
      if (entity[field]) {
        return typeof entity[field] === 'string' && entity[field].startsWith('ENC:');
      }
      return true;
    });
  },
  action: {
    type: 'enforce',
    logLevel: 'warn'
  },
  riskLevel: 'high'
};

// Custom compliance rule
const customComplianceRule: ComplianceRule = {
  id: 'data-minimization',
  name: 'GDPR Data Minimization Principle',
  regulation: 'GDPR',
  type: 'data-protection',
  condition: (entity, context) => {
    // Check if data collection is limited to stated purposes
    const collectedFields = Object.keys(entity);
    const necessaryFields = context?.processingPurpose?.includes('marketing') 
      ? ['name', 'email', 'preferences']
      : ['name', 'email'];
    
    return collectedFields.every(field => necessaryFields.includes(field));
  },
  action: {
    type: 'warn',
    reportingRequired: true
  },
  mandatory: false
};
```

## 📚 API Reference

### ValidationEngine

```typescript
class ValidationEngine {
  validateEntity(entity: any, context: ValidationContext): Promise<ValidationResult>
  validateBatch(entities: Array<{entity: any, context: ValidationContext}>): Promise<ValidationResult[]>
  addEventListener(eventType: string, handler: ValidationEventHandler): void
  getPerformanceMetrics(entityType: string): PerformanceMetrics[]
  getPerformanceStatistics(): PerformanceStatistics
}
```

### ValidationUtils

```typescript
class ValidationUtils {
  static validateEntity(entity: any, entityType: string, operation?: string, userId?: string): Promise<ValidationResult>
  static validateBatch(entities: Array<{entity: any, entityType: string, operation?: string}>, userId?: string): Promise<ValidationResult[]>
  static sanitizeInput(data: any, entityType?: string): Promise<any>
  static checkQuality(entity: any, entityType: string, minScore?: number): Promise<QualityResult>
  static detectThreats(data: any): Promise<ThreatInfo[]>
  static checkCompliance(entity: any, entityType: string, jurisdiction?: string, purposes?: string[]): Promise<ComplianceResult>
}
```

### Middleware Integration

```typescript
// Express.js middleware
import { validationMiddleware } from './validation';

app.post('/api/accounts', 
  validationMiddleware({
    entityType: 'Account',
    operation: 'create',
    strict: true
  }),
  (req, res) => {
    // req.body is now validated and sanitized
    // req.validationResult contains validation details
  }
);

// Custom middleware
app.use((req, res, next) => {
  if (req.validationResult && !req.validationResult.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: req.validationResult.errors
    });
  }
  next();
});
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Unit tests
npm run test src/validation

# Integration tests  
npm run test:integration -- --testNamePattern="validation"

# Security tests
npm run test src/validation/security

# Compliance tests
npm run test src/validation/compliance

# Performance tests
npm run test:performance validation
```

Example test output:
```
✓ Schema validation for Account entities (15ms)
✓ XSS protection and sanitization (8ms)
✓ SQL injection prevention (12ms) 
✓ PII detection and masking (25ms)
✓ GDPR compliance validation (18ms)
✓ SOX audit trail requirements (22ms)
✓ Data quality assessment (31ms)
✓ Security threat detection (19ms)
✓ Performance threshold compliance (45ms)
```

## 🔍 Monitoring & Observability

### Audit Logging

```typescript
// Access comprehensive audit logs
const securityAuditLog = securityValidator.getAuditLog();
const complianceAuditLog = complianceValidator.getComplianceAuditLog();

// Filter by criteria
const recentSecurityEvents = securityAuditLog.filter(entry => 
  entry.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
);

const gdprViolations = complianceAuditLog.filter(entry =>
  entry.regulation === 'GDPR' && entry.result === 'violation'
);
```

### Performance Monitoring

```typescript
// Get detailed performance metrics
const performanceStats = validationEngine.getPerformanceStatistics();

console.log(`Average validation time: ${performanceStats.averageValidationTime}ms`);
console.log(`Total validations: ${performanceStats.totalValidations}`);
console.log(`Entity type breakdown:`);

Object.entries(performanceStats.entityTypeStats).forEach(([type, stats]) => {
  console.log(`- ${type}: ${stats.avgTime}ms avg, ${stats.count} validations`);
});
```

### Quality Reporting

```typescript
// Generate comprehensive quality report
const qualityReport = await qualityAssurance.generateQualityReport(
  entities, 
  'Account'
);

console.log(`Overall quality score: ${qualityReport.metrics.overall}%`);
console.log(`Sample size: ${qualityReport.sampleSize}`);
console.log(`Issues identified: ${qualityReport.issues.length}`);
console.log(`Recommendations: ${qualityReport.recommendations.length}`);
```

## 🚨 Error Handling

The validation system provides detailed error information for troubleshooting:

```typescript
try {
  const result = await validationEngine.validateEntity(entity, context);
  
  if (!result.isValid) {
    // Handle validation errors
    for (const error of result.errors) {
      console.error(`Validation Error: ${error.message}`);
      console.error(`Field: ${error.field}, Code: ${error.code}`);
      console.error(`Severity: ${error.severity}, Category: ${error.category}`);
      
      if (error.context) {
        console.error('Additional context:', error.context);
      }
    }
    
    // Handle warnings
    for (const warning of result.warnings) {
      console.warn(`Warning: ${warning.message}`);
      if (warning.recommendation) {
        console.warn(`Recommendation: ${warning.recommendation}`);
      }
    }
  }
} catch (error) {
  if (error.name === 'ValidationException') {
    console.error('Validation Exception:', error.message);
    console.error('Errors:', error.errors);
    console.error('Warnings:', error.warnings);
  } else if (error.name === 'SecurityViolationException') {
    console.error('Security Violation:', error.message);
    console.error('Risk Level:', error.riskLevel);
    console.error('Violation Type:', error.violationType);
  } else if (error.name === 'ComplianceViolationException') {
    console.error('Compliance Violation:', error.message);
    console.error('Regulation:', error.regulation);
    console.error('Mandatory:', error.mandatory);
  }
}
```

## 🤝 Contributing

When extending the validation system:

1. **Add new entity schemas** to `SchemaRegistry`
2. **Create custom sanitizers** for specific data types
3. **Implement business rules** for domain-specific validation
4. **Add compliance rules** for new regulations
5. **Extend quality metrics** for additional quality dimensions

```typescript
// Example: Adding a new entity schema
const customEntitySchema: EntitySchema = {
  entityType: 'CustomEntity',
  version: '1.0.0',
  schema: Joi.object({
    id: Joi.number().integer().positive().optional(),
    name: Joi.string().min(1).max(100).required(),
    // ... more fields
  }),
  businessRules: [/* custom business rules */],
  securityRules: [/* custom security rules */],
  complianceRules: [/* custom compliance rules */],
  metadata: {
    description: 'Custom entity for specialized use cases',
    primaryKey: 'id',
    requiredFields: ['name'],
    readOnlyFields: ['id'],
    piiFields: ['name'],
    auditedFields: ['name'],
    relationships: [],
    tags: ['custom']
  }
};

// Register the schema
schemaRegistry.registerSchema(customEntitySchema);
```

## 📞 Support

For technical support or questions about the validation system:

1. Review the comprehensive test suite in `test/validation/`
2. Check the implementation examples above
3. Consult the API documentation in each module
4. Review audit logs for troubleshooting validation issues

The validation system is designed to be enterprise-ready with comprehensive security, compliance, and quality assurance capabilities while maintaining high performance and ease of use.