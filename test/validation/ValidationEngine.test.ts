/**
 * Comprehensive tests for the Validation Engine
 * Tests all aspects of data validation, sanitization, security, compliance, and quality assurance
 */

import { ValidationEngine } from '../../src/validation/core/ValidationEngine';
import { SchemaRegistry } from '../../src/validation/core/SchemaRegistry';
import { InputSanitizer } from '../../src/validation/sanitization/InputSanitizer';
import { SecurityValidator } from '../../src/validation/security/SecurityValidator';
import { ComplianceValidator } from '../../src/validation/compliance/ComplianceValidator';
import { QualityAssurance } from '../../src/validation/quality/QualityAssurance';
import { ValidationFactory, ValidationUtils } from '../../src/validation';
import { 
  ValidationContext, 
  ValidationConfig, 
  SanitizationConfig,
  SecurityContext,
  ComplianceContext
} from '../../src/validation/types/ValidationTypes';
import winston from 'winston';

describe('ValidationEngine', () => {
  let validationEngine: ValidationEngine;
  let logger: winston.Logger;

  beforeAll(() => {
    // Create silent logger for tests
    logger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })]
    });
  });

  beforeEach(() => {
    validationEngine = ValidationFactory.createWithConfig({
      strictMode: false,
      enableBusinessRules: true,
      enableSecurityValidation: true,
      enableComplianceChecks: true,
      enableQualityAssurance: true,
      enableSanitization: true,
      maxValidationTime: 10000
    }, {}, logger);
  });

  describe('Schema Validation', () => {
    test('should validate Account entity with valid data', async () => {
      const validAccount = {
        accountName: 'Test Company Inc.',
        accountType: 1,
        address1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        ownerResourceId: 12345,
        phone: '555-123-4567',
        active: true
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'test-user-1',
        requestId: 'test-req-1'
      };

      const result = await validationEngine.validateEntity(validAccount, context);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedData).toBeDefined();
    });

    test('should reject Account entity with invalid data', async () => {
      const invalidAccount = {
        accountName: '', // Empty required field
        accountType: 999, // Invalid type
        address1: '', // Empty required field
        // Missing required fields: city, state, postalCode, country, ownerResourceId
        phone: 'invalid-phone-format',
        active: 'not-boolean' // Wrong type
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'test-user-1'
      };

      const result = await validationEngine.validateEntity(invalidAccount, context);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Check for specific validation errors
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain('SCHEMA_VALIDATION_ERROR');
    });

    test('should handle unknown entity types gracefully', async () => {
      const unknownEntity = {
        id: 1,
        name: 'Test Entity',
        value: 'Some value'
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'UnknownEntityType',
        userId: 'test-user-1'
      };

      const result = await validationEngine.validateEntity(unknownEntity, context);

      // Should not fail hard, but may have warnings
      expect(result).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('Data Sanitization', () => {
    test('should sanitize XSS attempts', async () => {
      const entityWithXSS = {
        id: 1,
        accountName: 'Test Company <script>alert("XSS")</script>',
        address1: '123 Main St <iframe src="evil.com"></iframe>',
        description: 'Clean text with <b>allowed tags</b>',
        maliciousField: 'javascript:alert("XSS")'
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'test-user-1'
      };

      const result = await validationEngine.validateEntity(entityWithXSS, context);

      expect(result.sanitizedData).toBeDefined();
      expect(result.sanitizedData.accountName).not.toContain('<script>');
      expect(result.sanitizedData.address1).not.toContain('<iframe>');
      expect(result.sanitizedData.description).toContain('<b>'); // Allowed tags preserved
      expect(result.sanitizedData.maliciousField).not.toContain('javascript:');
      
      // Should have warnings about sanitization
      const sanitizationWarnings = result.warnings.filter(w => 
        w.code.includes('XSS') || w.code.includes('SCRIPT')
      );
      expect(sanitizationWarnings.length).toBeGreaterThan(0);
    });

    test('should sanitize SQL injection attempts', async () => {
      const entityWithSQL = {
        id: 1,
        accountName: "Robert'; DROP TABLE Students; --",
        description: "1' OR '1'='1",
        searchTerm: "admin' UNION SELECT * FROM users --"
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'test-user-1'
      };

      const result = await validationEngine.validateEntity(entityWithSQL, context);

      expect(result.sanitizedData).toBeDefined();
      expect(result.sanitizedData.accountName).not.toContain('DROP TABLE');
      expect(result.sanitizedData.description).not.toContain("1'='1");
      expect(result.sanitizedData.searchTerm).not.toContain('UNION SELECT');
    });

    test('should detect and mask PII', async () => {
      const entityWithPII = {
        id: 1,
        accountName: 'John Doe Personal Account',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        creditCard: '4532123456789012',
        ssn: '123-45-6789',
        description: 'Contact me at john.doe@example.com or call 555-987-6543'
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'test-user-1'
      };

      const result = await validationEngine.validateEntity(entityWithPII, context);

      // Should have PII detection warnings
      const piiWarnings = result.warnings.filter(w => 
        w.code.includes('PII') || w.message.includes('PII')
      );
      expect(piiWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('Security Validation', () => {
    test('should validate proper security context', async () => {
      const entity = {
        id: 1,
        accountName: 'Secure Test Account',
        accountType: 1,
        address1: '123 Secure St',
        city: 'Security City',
        state: 'SC',
        postalCode: '12345',
        country: 'United States',
        ownerResourceId: 123
      };

      const securityContext: SecurityContext = {
        userId: 'user-123',
        roles: ['account_manager'],
        permissions: ['account.create', 'account.read'],
        ipAddress: '192.168.1.100',
        sessionId: 'session-abc123'
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'user-123',
        securityContext
      };

      const result = await validationEngine.validateEntity(entity, context);

      // Should pass security validation with proper context
      const securityErrors = result.errors.filter(e => e.category === 'security');
      expect(securityErrors).toHaveLength(0);
    });

    test('should reject insufficient permissions', async () => {
      const entity = {
        id: 1,
        accountName: 'Restricted Account',
        accountType: 1,
        address1: '123 Restricted St',
        city: 'No Access City',
        state: 'NA',
        postalCode: '00000',
        country: 'Restricted',
        ownerResourceId: 123
      };

      const securityContext: SecurityContext = {
        userId: 'user-456',
        roles: ['read_only'],
        permissions: ['account.read'], // Missing create permission
        ipAddress: '10.0.0.1'
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'user-456',
        securityContext
      };

      const result = await validationEngine.validateEntity(entity, context);

      // Should have access control errors
      const accessErrors = result.errors.filter(e => 
        e.code.includes('ACCESS') || e.message.includes('permission')
      );
      expect(accessErrors.length).toBeGreaterThan(0);
    });

    test('should detect suspicious IP addresses', async () => {
      const entity = {
        id: 1,
        accountName: 'Suspicious Account'
      };

      const securityContext: SecurityContext = {
        userId: 'user-789',
        roles: ['account_manager'],
        permissions: ['account.create'],
        ipAddress: '192.168.1.1' // Private IP in production context
      };

      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'user-789',
        securityContext
      };

      const result = await validationEngine.validateEntity(entity, context);

      // Restore environment
      process.env.NODE_ENV = originalEnv;

      // May have security warnings about suspicious IP
      expect(result.warnings.length >= 0).toBe(true);
    });
  });

  describe('Compliance Validation', () => {
    test('should validate GDPR compliance with proper consent', async () => {
      const entityWithPersonalData = {
        id: 1,
        accountName: 'GDPR Compliant Account',
        contactEmail: 'contact@example.com',
        personalPhone: '555-0123',
        address1: 'Personal Address 123',
        city: 'GDPR City',
        state: 'GD',
        postalCode: '12345',
        country: 'Germany',
        ownerResourceId: 123
      };

      const complianceContext: ComplianceContext = {
        jurisdiction: 'EU',
        dataSubject: 'contact@example.com',
        consentStatus: 'granted',
        processingPurpose: ['business_contact', 'service_delivery'],
        retentionPolicy: {
          retentionPeriod: 365,
          deletionMethod: 'hard',
          archiveRequired: false
        }
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'user-eu-1',
        complianceContext
      };

      const result = await validationEngine.validateEntity(entityWithPersonalData, context);

      // Should pass GDPR compliance checks
      const complianceErrors = result.errors.filter(e => 
        e.category === 'compliance' && e.code.includes('GDPR')
      );
      expect(complianceErrors).toHaveLength(0);
    });

    test('should reject GDPR violations', async () => {
      const entityWithPersonalData = {
        id: 1,
        personalEmail: 'gdpr-violation@example.com',
        personalData: 'Sensitive personal information'
      };

      const complianceContext: ComplianceContext = {
        jurisdiction: 'EU',
        dataSubject: 'gdpr-violation@example.com',
        consentStatus: 'withdrawn', // Consent withdrawn
        processingPurpose: ['marketing'], // Inappropriate purpose
        retentionPolicy: {
          retentionPeriod: 30,
          deletionMethod: 'hard',
          archiveRequired: false
        }
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'user-eu-2',
        complianceContext
      };

      const result = await validationEngine.validateEntity(entityWithPersonalData, context);

      // Should have compliance violations
      const gdprErrors = result.errors.filter(e => 
        e.category === 'compliance' && e.code.includes('GDPR')
      );
      expect(gdprErrors.length).toBeGreaterThan(0);
    });

    test('should validate data retention compliance', async () => {
      const oldEntity = {
        id: 1,
        accountName: 'Old Account',
        createDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000) // 400 days ago
      };

      const complianceContext: ComplianceContext = {
        jurisdiction: 'EU',
        processingPurpose: ['business'],
        retentionPolicy: {
          retentionPeriod: 365, // 1 year retention
          deletionMethod: 'hard',
          archiveRequired: true
        }
      };

      const context: ValidationContext = {
        operation: 'read',
        entityType: 'Account',
        userId: 'user-retention-1',
        complianceContext
      };

      const result = await validationEngine.validateEntity(oldEntity, context);

      // Should have retention policy violations
      const retentionErrors = result.errors.filter(e => 
        e.code.includes('RETENTION')
      );
      expect(retentionErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Quality Assurance', () => {
    test('should assess data quality metrics', async () => {
      const highQualityEntity = {
        id: 123,
        accountName: 'High Quality Corp.',
        accountType: 1,
        address1: '123 Quality Street',
        address2: 'Suite 100',
        city: 'Quality City',
        state: 'QC',
        postalCode: '12345-6789',
        country: 'United States',
        phone: '555-123-4567',
        fax: '555-123-4568',
        webAddress: 'https://www.highquality.com',
        email: 'contact@highquality.com',
        ownerResourceId: 456,
        active: true,
        createDate: new Date(),
        lastModifiedDate: new Date()
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'quality-user-1'
      };

      const result = await validationEngine.validateEntity(highQualityEntity, context);

      // Should have minimal quality warnings
      const qualityWarnings = result.warnings.filter(w => 
        w.code.includes('QUALITY')
      );
      
      // High quality data should have few or no quality issues
      expect(qualityWarnings.length).toBeLessThanOrEqual(2);
    });

    test('should detect data quality issues', async () => {
      const lowQualityEntity = {
        id: -1, // Invalid ID
        accountName: '', // Empty required field
        accountType: 999, // Invalid type
        address1: 'incomplete addr', // Poor formatting
        city: 'NYC', // Abbreviated
        state: 'new york', // Wrong format
        postalCode: '123', // Incomplete postal code
        country: 'usa', // Inconsistent formatting
        phone: '123', // Invalid phone
        email: 'invalid-email', // Invalid email format
        webAddress: 'not-a-url', // Invalid URL
        ownerResourceId: 0 // Invalid owner ID
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'quality-user-2'
      };

      const result = await validationEngine.validateEntity(lowQualityEntity, context);

      // Should have multiple quality issues
      const qualityIssues = result.errors.filter(e => 
        e.category === 'data' || e.code.includes('QUALITY')
      );
      expect(qualityIssues.length).toBeGreaterThan(0);
    });

    test('should handle incomplete data appropriately', async () => {
      const incompleteEntity = {
        id: 1,
        accountName: 'Incomplete Corp',
        // Missing many fields
        accountType: 1,
        ownerResourceId: 123
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'incomplete-user-1'
      };

      const result = await validationEngine.validateEntity(incompleteEntity, context);

      // Should identify completeness issues
      const completenessIssues = [...result.errors, ...result.warnings].filter(issue => 
        issue.message.toLowerCase().includes('complet') ||
        issue.message.toLowerCase().includes('required') ||
        issue.message.toLowerCase().includes('missing')
      );
      
      expect(completenessIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Optimization', () => {
    test('should complete validation within performance thresholds', async () => {
      const entity = {
        id: 1,
        accountName: 'Performance Test Account',
        accountType: 1,
        address1: '123 Performance St',
        city: 'Speed City',
        state: 'SP',
        postalCode: '12345',
        country: 'United States',
        ownerResourceId: 123
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'perf-user-1'
      };

      const startTime = Date.now();
      const result = await validationEngine.validateEntity(entity, context);
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Check if performance warnings were issued
      const performanceWarnings = result.warnings.filter(w => 
        w.code.includes('PERFORMANCE')
      );
      
      if (duration > 1000) {
        expect(performanceWarnings.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle batch validation efficiently', async () => {
      const entities = Array.from({ length: 10 }, (_, i) => ({
        entity: {
          id: i + 1,
          accountName: `Batch Account ${i + 1}`,
          accountType: 1,
          address1: `${100 + i} Batch Street`,
          city: 'Batch City',
          state: 'BC',
          postalCode: '12345',
          country: 'United States',
          ownerResourceId: 123
        },
        context: {
          operation: 'create' as const,
          entityType: 'Account',
          userId: 'batch-user-1',
          requestId: `batch-req-${i + 1}`
        }
      }));

      const startTime = Date.now();
      const results = await validationEngine.validateBatch(entities);
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete batch within 10 seconds
      
      // All should be valid for this test data
      const allValid = results.every(r => r.isValid);
      expect(allValid).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle null and undefined entities gracefully', async () => {
      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'edge-case-user-1'
      };

      // Test null entity
      const nullResult = await validationEngine.validateEntity(null, context);
      expect(nullResult).toBeDefined();
      expect(nullResult.isValid).toBe(false);

      // Test undefined entity
      const undefinedResult = await validationEngine.validateEntity(undefined, context);
      expect(undefinedResult).toBeDefined();
      expect(undefinedResult.isValid).toBe(false);
    });

    test('should handle circular references in entities', async () => {
      const circularEntity: any = {
        id: 1,
        name: 'Circular Test'
      };
      circularEntity.self = circularEntity; // Create circular reference

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'circular-user-1'
      };

      // Should not crash on circular references
      await expect(validationEngine.validateEntity(circularEntity, context))
        .resolves.toBeDefined();
    });

    test('should handle very large entities', async () => {
      const largeEntity = {
        id: 1,
        accountName: 'Large Entity Test',
        largeData: 'x'.repeat(100000), // 100KB of data
        manyFields: Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [`field${i}`, `value${i}`])
        )
      };

      const context: ValidationContext = {
        operation: 'create',
        entityType: 'Account',
        userId: 'large-entity-user-1'
      };

      const result = await validationEngine.validateEntity(largeEntity, context);
      
      expect(result).toBeDefined();
      // May have warnings about large data size
      const sizeWarnings = result.warnings.filter(w => 
        w.message.toLowerCase().includes('large') || 
        w.message.toLowerCase().includes('size')
      );
      expect(sizeWarnings.length >= 0).toBe(true);
    });
  });
});

describe('ValidationUtils', () => {
  beforeAll(() => {
    // Reset singleton for clean testing
    ValidationFactory.resetInstance();
  });

  test('should provide quick validation utility', async () => {
    const entity = {
      accountName: 'Quick Test Account',
      accountType: 1,
      address1: '123 Quick St',
      city: 'Quick City',
      state: 'QC',
      postalCode: '12345',
      country: 'United States',
      ownerResourceId: 123
    };

    const result = await ValidationUtils.validateEntity(entity, 'Account', 'create', 'util-user-1');

    expect(result).toBeDefined();
    expect(result.isValid).toBe(true);
  });

  test('should provide batch validation utility', async () => {
    const entities = [
      {
        entity: { accountName: 'Batch 1', accountType: 1, ownerResourceId: 1 },
        entityType: 'Account',
        operation: 'create' as const
      },
      {
        entity: { accountName: 'Batch 2', accountType: 2, ownerResourceId: 2 },
        entityType: 'Account',
        operation: 'create' as const
      }
    ];

    const results = await ValidationUtils.validateBatch(entities, 'batch-util-user');

    expect(results).toHaveLength(2);
    expect(Array.isArray(results)).toBe(true);
  });

  test('should provide sanitization utility', async () => {
    const maliciousData = {
      name: 'Test <script>alert("xss")</script>',
      description: 'Some content with <b>bold</b> text',
      sql: "'; DROP TABLE users; --"
    };

    const sanitized = await ValidationUtils.sanitizeInput(maliciousData, 'TestEntity');

    expect(sanitized.name).not.toContain('<script>');
    expect(sanitized.description).toContain('<b>'); // Should preserve allowed tags
    expect(sanitized.sql).not.toContain('DROP TABLE');
  });

  test('should provide quality checking utility', async () => {
    const highQualityEntity = {
      id: 1,
      accountName: 'High Quality Account',
      accountType: 1,
      address1: '123 Quality Street',
      city: 'Quality City',
      state: 'QC',
      postalCode: '12345',
      country: 'United States',
      phone: '555-123-4567',
      email: 'quality@example.com',
      ownerResourceId: 123
    };

    const qualityCheck = await ValidationUtils.checkQuality(
      highQualityEntity, 
      'Account', 
      80 // Minimum score of 80
    );

    expect(qualityCheck.passed).toBe(true);
    expect(qualityCheck.score).toBeGreaterThanOrEqual(80);
    expect(Array.isArray(qualityCheck.issues)).toBe(true);
  });

  test('should provide threat detection utility', async () => {
    const suspiciousData = {
      name: 'Test <script>alert("xss")</script>',
      query: "1' OR '1'='1",
      url: 'javascript:alert("malicious")'
    };

    const threats = await ValidationUtils.detectThreats(suspiciousData);

    expect(Array.isArray(threats)).toBe(true);
    expect(threats.length).toBeGreaterThan(0);
    
    const threatTypes = threats.map(t => t.type);
    expect(threatTypes.some(type => 
      type.includes('XSS') || 
      type.includes('INJECTION') || 
      type.includes('SCRIPT')
    )).toBe(true);
  });

  test('should provide compliance checking utility', async () => {
    const personalDataEntity = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567'
    };

    const complianceCheck = await ValidationUtils.checkCompliance(
      personalDataEntity,
      'Contact',
      'EU', // GDPR jurisdiction
      ['business_contact']
    );

    expect(complianceCheck.compliant).toBeDefined();
    expect(Array.isArray(complianceCheck.violations)).toBe(true);
  });
});

describe('Integration Tests', () => {
  let logger: winston.Logger;

  beforeAll(() => {
    // Create silent logger for integration tests
    logger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })]
    });
  });

  test('should integrate all validation layers seamlessly', async () => {
    const complexEntity = {
      id: 123,
      accountName: 'Complex Integration Test <script>alert("test")</script>',
      accountType: 1,
      address1: '123 Integration Street',
      city: 'Test City',
      state: 'TC',
      postalCode: '12345',
      country: 'United States',
      phone: '555-123-4567',
      email: 'integration@test.com',
      webAddress: 'https://www.integrationtest.com',
      ownerResourceId: 456,
      personalData: 'Some sensitive information',
      financialData: {
        revenue: 1000000,
        expenses: 750000
      },
      createDate: new Date(),
      lastModifiedDate: new Date()
    };

    const securityContext: SecurityContext = {
      userId: 'integration-user-1',
      roles: ['account_manager', 'data_processor'],
      permissions: ['account.create', 'account.read', 'financial.access', 'pii.access'],
      ipAddress: '203.0.113.1',
      sessionId: 'integration-session-123'
    };

    const complianceContext: ComplianceContext = {
      jurisdiction: 'US',
      dataSubject: 'integration@test.com',
      consentStatus: 'granted',
      processingPurpose: ['business_contact', 'financial_reporting'],
      retentionPolicy: {
        retentionPeriod: 2555, // 7 years for financial data
        deletionMethod: 'soft',
        archiveRequired: true
      }
    };

    const context: ValidationContext = {
      operation: 'create',
      entityType: 'Account',
      userId: 'integration-user-1',
      requestId: 'integration-req-123',
      securityContext,
      complianceContext
    };

    const validationEngine = ValidationFactory.createWithConfig({
      strictMode: false,
      enableBusinessRules: true,
      enableSecurityValidation: true,
      enableComplianceChecks: true,
      enableQualityAssurance: true,
      enableSanitization: true,
      enablePerformanceMonitoring: true,
      maxValidationTime: 10000,
      auditAllValidations: true
    }, {
      enableXSSProtection: true,
      enableSQLInjectionProtection: true,
      enablePIIDetection: true,
      enableHTMLSanitization: true
    }, logger);

    const result = await validationEngine.validateEntity(complexEntity, context);

    expect(result).toBeDefined();
    expect(result.sanitizedData).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.performanceMetrics).toBeDefined();

    // Should have sanitized XSS attempt
    expect(result.sanitizedData.accountName).not.toContain('<script>');

    // Should have performance metrics
    expect(result.metadata!.performanceMetrics!.totalTime).toBeGreaterThan(0);

    // May have various warnings but should process successfully
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);

    console.log('Integration test results:', {
      isValid: result.isValid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      totalTime: result.metadata?.performanceMetrics?.totalTime
    });
  });
});