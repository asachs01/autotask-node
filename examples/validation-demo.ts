/**
 * Comprehensive demonstration of the Validation & Sanitization Layer
 * Shows all major features: validation, sanitization, security, compliance, and quality assurance
 */

import { ValidatedAutotaskClient } from '../src/client/ValidatedAutotaskClient';
import { ValidationUtils, ValidationFactory } from '../src/validation';
import { 
  SecurityContext, 
  ComplianceContext,
  SanitizationConfig 
} from '../src/validation/types/ValidationTypes';
import winston from 'winston';

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * Demo 1: Basic Validation and Sanitization
 */
async function demoBasicValidation() {
  console.log('\n=== Demo 1: Basic Validation and Sanitization ===\n');
  
  // Example with clean data
  const cleanAccount = {
    accountName: 'Clean Corp Inc.',
    accountType: 1,
    address1: '123 Business Street',
    city: 'Business City',
    state: 'BC',
    postalCode: '12345',
    country: 'United States',
    phone: '555-123-4567',
    email: 'contact@cleancorp.com',
    ownerResourceId: 123
  };

  console.log('✅ Validating clean data...');
  const cleanResult = await ValidationUtils.validateEntity(cleanAccount, 'Account', 'create');
  
  console.log(`Validation result: ${cleanResult.isValid ? 'PASSED' : 'FAILED'}`);
  console.log(`Errors: ${cleanResult.errors.length}`);
  console.log(`Warnings: ${cleanResult.warnings.length}`);

  // Example with malicious data
  const maliciousAccount = {
    accountName: 'Evil Corp <script>alert("XSS Attack!")</script>',
    accountType: 1,
    address1: '123 Hacker St <iframe src="http://evil.com"></iframe>',
    city: 'Malware City',
    state: 'ML',
    postalCode: '66666',
    country: 'Hackistan',
    phone: '555-666-EVIL',
    email: 'hacker@evil.com',
    ownerResourceId: 123,
    description: "'; DROP TABLE accounts; --",
    notes: 'Visit javascript:alert("More XSS") for details'
  };

  console.log('\n🚨 Validating malicious data...');
  const maliciousResult = await ValidationUtils.validateEntity(maliciousAccount, 'Account', 'create');
  
  console.log(`Validation result: ${maliciousResult.isValid ? 'PASSED' : 'FAILED'}`);
  console.log(`Errors: ${maliciousResult.errors.length}`);
  console.log(`Warnings: ${maliciousResult.warnings.length}`);
  
  if (maliciousResult.sanitizedData) {
    console.log('\n🧹 Sanitized data:');
    console.log(`Original: ${maliciousAccount.accountName}`);
    console.log(`Sanitized: ${maliciousResult.sanitizedData.accountName}`);
    console.log(`Original: ${maliciousAccount.description}`);
    console.log(`Sanitized: ${maliciousResult.sanitizedData.description}`);
  }

  // Show validation errors and warnings
  if (maliciousResult.errors.length > 0) {
    console.log('\n❌ Validation Errors:');
    maliciousResult.errors.forEach((error, i) => {
      console.log(`${i + 1}. [${error.severity}] ${error.message} (${error.code})`);
    });
  }

  if (maliciousResult.warnings.length > 0) {
    console.log('\n⚠️  Validation Warnings:');
    maliciousResult.warnings.forEach((warning, i) => {
      console.log(`${i + 1}. ${warning.message} (${warning.code})`);
      if (warning.recommendation) {
        console.log(`   Recommendation: ${warning.recommendation}`);
      }
    });
  }
}

/**
 * Demo 2: Security Validation
 */
async function demoSecurityValidation() {
  console.log('\n=== Demo 2: Security Validation ===\n');
  
  const sensitiveAccount = {
    accountName: 'Financial Services Corp',
    accountType: 1,
    address1: '123 Wall Street',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
    phone: '555-FINANCE',
    email: 'admin@finance.com',
    ownerResourceId: 123,
    bankAccount: '1234567890123456', // Sensitive financial data
    taxId: '12-3456789', // PII
    creditRating: 'AAA',
    annualRevenue: 50000000
  };

  // Define security context
  const securityContext: SecurityContext = {
    userId: 'user-123',
    roles: ['account_manager'],
    permissions: ['account.create', 'account.read', 'financial.access'],
    ipAddress: '203.0.113.42',
    sessionId: 'session-abc123',
    userAgent: 'Mozilla/5.0 (Demo Client)'
  };

  console.log('🔐 Validating with proper security context...');
  const authorizedResult = await ValidationUtils.validateEntity(sensitiveAccount, 'Account', 'create');
  
  console.log(`Security validation: ${authorizedResult.isValid ? 'PASSED' : 'FAILED'}`);

  // Test insufficient permissions
  const limitedSecurityContext: SecurityContext = {
    userId: 'user-456',
    roles: ['read_only'],
    permissions: ['account.read'], // Missing create and financial access
    ipAddress: '192.168.1.100',
    sessionId: 'session-def456'
  };

  console.log('\n🚫 Testing insufficient permissions...');
  const unauthorizedEngine = ValidationFactory.createWithConfig({
    enableSecurityValidation: true,
    strictMode: true
  });

  try {
    const unauthorizedResult = await unauthorizedEngine.validateEntity(sensitiveAccount, {
      operation: 'create',
      entityType: 'Account',
      userId: 'user-456',
      securityContext: limitedSecurityContext
    });

    console.log(`Unauthorized validation: ${unauthorizedResult.isValid ? 'PASSED' : 'FAILED'}`);
    
    if (!unauthorizedResult.isValid) {
      console.log('Security errors detected:');
      unauthorizedResult.errors
        .filter(e => e.category === 'security')
        .forEach(error => console.log(`- ${error.message}`));
    }
  } catch (error) {
    console.log(`Security violation caught: ${error.message}`);
  }

  // Detect threats in data
  console.log('\n🕵️ Detecting security threats...');
  const threatsInData = {
    name: 'Test Corp <script>alert("threat")</script>',
    description: "1' OR '1'='1 --",
    website: 'javascript:alert("XSS")',
    notes: 'UNION SELECT password FROM users'
  };

  const threats = await ValidationUtils.detectThreats(threatsInData);
  
  console.log(`Threats detected: ${threats.length}`);
  threats.forEach((threat, i) => {
    console.log(`${i + 1}. [${threat.severity}] ${threat.type}: ${threat.description}`);
  });
}

/**
 * Demo 3: Compliance Validation
 */
async function demoComplianceValidation() {
  console.log('\n=== Demo 3: Compliance Validation ===\n');
  
  const personalDataEntity = {
    firstName: 'Johann',
    lastName: 'Schmidt',
    email: 'johann.schmidt@example.de',
    phone: '+49-30-12345678',
    address1: 'Unter den Linden 1',
    city: 'Berlin',
    postalCode: '10117',
    country: 'Germany',
    dateOfBirth: '1985-06-15',
    nationality: 'German',
    personalNotes: 'Prefers communication in German'
  };

  // GDPR compliant scenario
  console.log('🇪🇺 Testing GDPR compliance (EU jurisdiction)...');
  const gdprCompliantResult = await ValidationUtils.checkCompliance(
    personalDataEntity,
    'Contact',
    'EU',
    ['service_delivery', 'customer_support']
  );

  console.log(`GDPR compliance: ${gdprCompliantResult.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`);
  
  if (!gdprCompliantResult.compliant) {
    console.log('GDPR violations:');
    gdprCompliantResult.violations.forEach(violation => {
      console.log(`- [${violation.severity}] ${violation.issue}`);
    });
  }

  // Test data retention compliance
  const oldPersonalData = {
    ...personalDataEntity,
    createDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // 400 days old
    lastContactDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) // 200 days since last contact
  };

  const complianceContext: ComplianceContext = {
    jurisdiction: 'EU',
    dataSubject: 'johann.schmidt@example.de',
    consentStatus: 'granted',
    processingPurpose: ['customer_support'],
    retentionPolicy: {
      retentionPeriod: 365, // 1 year retention policy
      deletionMethod: 'anonymize',
      archiveRequired: false
    }
  };

  console.log('\n📅 Testing data retention compliance...');
  const retentionEngine = ValidationFactory.createWithConfig({
    enableComplianceChecks: true
  });

  const retentionResult = await retentionEngine.validateEntity(oldPersonalData, {
    operation: 'read',
    entityType: 'Contact',
    userId: 'compliance-officer-1',
    complianceContext
  });

  console.log(`Data retention compliance: ${retentionResult.isValid ? 'COMPLIANT' : 'NON-COMPLIANT'}`);
  
  if (!retentionResult.isValid) {
    const retentionErrors = retentionResult.errors.filter(e => 
      e.code.includes('RETENTION') || e.code.includes('GDPR')
    );
    
    console.log('Data retention violations:');
    retentionErrors.forEach(error => {
      console.log(`- [${error.severity}] ${error.message}`);
    });
  }
}

/**
 * Demo 4: Data Quality Assurance
 */
async function demoQualityAssurance() {
  console.log('\n=== Demo 4: Data Quality Assurance ===\n');
  
  // High quality data
  const highQualityAccount = {
    id: 12345,
    accountName: 'Premium Quality Corp.',
    accountType: 1,
    address1: '123 Excellence Boulevard',
    address2: 'Suite 100',
    city: 'Quality City',
    state: 'QC',
    postalCode: '12345-6789',
    country: 'United States',
    phone: '555-123-4567',
    fax: '555-123-4568',
    email: 'contact@premiumquality.com',
    webAddress: 'https://www.premiumquality.com',
    ownerResourceId: 789,
    parentAccountId: null,
    active: true,
    createDate: new Date('2024-01-15'),
    lastModifiedDate: new Date('2024-02-10')
  };

  console.log('⭐ Assessing high-quality data...');
  const highQualityResult = await ValidationUtils.checkQuality(highQualityAccount, 'Account', 85);
  
  console.log(`Quality score: ${highQualityResult.score}%`);
  console.log(`Quality check: ${highQualityResult.passed ? 'PASSED' : 'FAILED'}`);
  console.log(`Issues found: ${highQualityResult.issues.length}`);

  // Low quality data
  const lowQualityAccount = {
    id: -1, // Invalid ID
    accountName: '', // Empty required field
    accountType: 999, // Invalid type
    address1: 'incomplete', // Incomplete address
    city: 'nyc', // Inconsistent formatting
    state: 'new york', // Wrong format
    postalCode: '123', // Incomplete postal code
    country: 'usa', // Inconsistent formatting
    phone: '123', // Invalid phone
    email: 'not-an-email', // Invalid email
    webAddress: 'not-a-url', // Invalid URL
    ownerResourceId: 0, // Invalid owner
    createDate: 'invalid-date', // Invalid date format
    lastModifiedDate: null
  };

  console.log('\n📉 Assessing low-quality data...');
  const lowQualityResult = await ValidationUtils.checkQuality(lowQualityAccount, 'Account', 80);
  
  console.log(`Quality score: ${lowQualityResult.score}%`);
  console.log(`Quality check: ${lowQualityResult.passed ? 'PASSED' : 'FAILED'}`);
  console.log(`Issues found: ${lowQualityResult.issues.length}`);
  
  if (lowQualityResult.issues.length > 0) {
    console.log('\nQuality issues detected:');
    lowQualityResult.issues.slice(0, 5).forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    
    if (lowQualityResult.issues.length > 5) {
      console.log(`... and ${lowQualityResult.issues.length - 5} more issues`);
    }
  }

  // Test completeness
  const incompleteAccount = {
    accountName: 'Incomplete Corp',
    // Missing many required fields
    accountType: 1
  };

  console.log('\n🔍 Testing data completeness...');
  const completenessResult = await ValidationUtils.checkQuality(incompleteAccount, 'Account', 70);
  
  console.log(`Completeness score: ${completenessResult.score}%`);
  console.log(`Completeness issues: ${completenessResult.issues.filter(i => i.toLowerCase().includes('complet')).length}`);
}

/**
 * Demo 5: Full Integration with ValidatedAutotaskClient
 */
async function demoFullIntegration() {
  console.log('\n=== Demo 5: Full Integration with ValidatedAutotaskClient ===\n');
  
  // Note: This demo shows the API structure but won't make actual API calls
  // In a real scenario, you would provide valid Autotask credentials
  
  const mockAuth = {
    username: 'demo-user',
    integrationCode: 'demo-integration',
    secret: 'demo-secret',
    apiUrl: 'https://demo.autotask.net'
  };

  const securityContext: SecurityContext = {
    userId: 'integration-demo-user',
    roles: ['account_manager', 'data_processor'],
    permissions: ['account.create', 'account.read', 'account.update', 'pii.access'],
    ipAddress: '203.0.113.100',
    sessionId: 'integration-demo-session'
  };

  const complianceContext: ComplianceContext = {
    jurisdiction: 'global',
    processingPurpose: ['business_operations', 'customer_service'],
    consentStatus: 'granted',
    retentionPolicy: {
      retentionPeriod: 2555, // 7 years
      deletionMethod: 'archive',
      archiveRequired: true
    }
  };

  // Create validated client
  console.log('🔧 Creating ValidatedAutotaskClient...');
  const validatedClient = new ValidatedAutotaskClient({
    auth: mockAuth,
    enableValidation: true,
    enableSanitization: true,
    enableSecurityValidation: true,
    enableComplianceChecks: true,
    enableQualityAssurance: true,
    strictMode: false,
    defaultSecurityContext: securityContext,
    defaultComplianceContext: complianceContext,
    validationConfig: {
      maxValidationTime: 5000,
      auditAllValidations: true
    },
    sanitizationConfig: {
      enableXSSProtection: true,
      enableSQLInjectionProtection: true,
      enablePIIDetection: true,
      customSanitizers: [
        {
          name: 'phone-normalizer',
          pattern: /\D/g,
          replacement: '',
          fields: ['phone', 'fax', 'alternatePhone1', 'alternatePhone2']
        }
      ]
    }
  }, logger);

  // Simulate creating an account with full validation
  const newAccount = {
    accountName: 'Integration Test Corp <script>alert("test")</script>',
    accountType: 1,
    address1: '123 Integration Street',
    city: 'Test City',
    state: 'TC',
    postalCode: '12345',
    country: 'United States',
    phone: '(555) 123-4567',
    email: 'integration@testcorp.com',
    ownerResourceId: 456,
    personalData: 'Some sensitive information for testing',
    createDate: new Date(),
    lastModifiedDate: new Date()
  };

  console.log('📝 Simulating account creation with full validation...');
  
  // This would normally make an API call, but for demo purposes we'll just show validation
  try {
    // Simulate the validation that would occur
    const mockValidationResult = await ValidationUtils.validateEntity(newAccount, 'Account', 'create');
    
    console.log('Validation Summary:');
    console.log(`- Overall result: ${mockValidationResult.isValid ? 'VALID' : 'INVALID'}`);
    console.log(`- Errors detected: ${mockValidationResult.errors.length}`);
    console.log(`- Warnings issued: ${mockValidationResult.warnings.length}`);
    console.log(`- Data sanitized: ${mockValidationResult.sanitizedData ? 'YES' : 'NO'}`);
    
    if (mockValidationResult.sanitizedData) {
      console.log('\nSanitization Results:');
      console.log(`- Original: ${newAccount.accountName}`);
      console.log(`- Sanitized: ${mockValidationResult.sanitizedData.accountName}`);
    }

    // Show threats detected
    const threats = await ValidationUtils.detectThreats(newAccount);
    console.log(`\nSecurity threats detected: ${threats.length}`);
    threats.forEach(threat => {
      console.log(`- [${threat.severity}] ${threat.type}: ${threat.description}`);
    });

    // Show compliance check
    const compliance = await ValidationUtils.checkCompliance(newAccount, 'Account', 'global', ['business_operations']);
    console.log(`\nCompliance status: ${compliance.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`);
    
    if (!compliance.compliant) {
      compliance.violations.forEach(violation => {
        console.log(`- ${violation.regulation}: ${violation.issue}`);
      });
    }

    // Show quality assessment
    const quality = await ValidationUtils.checkQuality(newAccount, 'Account', 75);
    console.log(`\nData quality score: ${quality.score}%`);
    console.log(`Quality check: ${quality.passed ? 'PASSED' : 'FAILED'}`);

  } catch (error) {
    console.error('Integration demo error:', error.message);
  }

  // Show audit capabilities
  const auditLog = validatedClient.getAuditLog();
  console.log(`\nAudit log entries: ${auditLog.length}`);

  // Show performance statistics
  const validationStats = validatedClient.getValidationStatistics();
  console.log('\nValidation Performance Statistics:');
  console.log(`- Total validations: ${validationStats.totalValidations}`);
  console.log(`- Average validation time: ${validationStats.averageValidationTime}ms`);
  console.log(`- Average rules executed: ${validationStats.averageRulesExecuted}`);
}

/**
 * Demo 6: Batch Processing with Validation
 */
async function demoBatchProcessing() {
  console.log('\n=== Demo 6: Batch Processing with Validation ===\n');
  
  // Generate sample batch data with mixed quality
  const batchAccounts = [
    {
      accountName: 'Good Quality Corp',
      accountType: 1,
      address1: '123 Quality St',
      city: 'Good City',
      state: 'GC',
      postalCode: '12345',
      country: 'United States',
      phone: '555-123-4567',
      email: 'contact@goodquality.com',
      ownerResourceId: 123
    },
    {
      accountName: 'Malicious Corp <script>alert("batch xss")</script>',
      accountType: 1,
      address1: '456 Hacker Ave <iframe src="evil.com"></iframe>',
      city: 'Malware City',
      state: 'MC',
      postalCode: '66666',
      country: 'Hackistan',
      phone: '555-666-EVIL',
      email: 'hacker@evil.com',
      ownerResourceId: 456,
      sqlInjection: "'; DROP TABLE accounts; --"
    },
    {
      accountName: '', // Invalid - empty name
      accountType: 999, // Invalid type
      address1: 'incomplete',
      city: 'nyc', // Poor formatting
      state: 'new york', // Wrong format
      postalCode: '123', // Incomplete
      country: 'usa', // Poor formatting
      phone: '123', // Invalid
      email: 'not-email', // Invalid
      ownerResourceId: 0 // Invalid
    }
  ];

  console.log(`📦 Processing batch of ${batchAccounts.length} accounts...`);
  
  const batchResults = await ValidationUtils.validateBatch(
    batchAccounts.map(account => ({
      entity: account,
      entityType: 'Account',
      operation: 'create' as const
    })),
    'batch-demo-user'
  );

  console.log('\nBatch Processing Results:');
  batchResults.forEach((result, index) => {
    console.log(`\nAccount ${index + 1}:`);
    console.log(`- Valid: ${result.isValid}`);
    console.log(`- Errors: ${result.errors.length}`);
    console.log(`- Warnings: ${result.warnings.length}`);
    
    if (result.errors.length > 0) {
      console.log('  Errors:');
      result.errors.slice(0, 3).forEach(error => {
        console.log(`    - [${error.severity}] ${error.message}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('  Warnings:');
      result.warnings.slice(0, 2).forEach(warning => {
        console.log(`    - ${warning.message}`);
      });
    }
  });

  // Summary statistics
  const validCount = batchResults.filter(r => r.isValid).length;
  const totalErrors = batchResults.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = batchResults.reduce((sum, r) => sum + r.warnings.length, 0);
  
  console.log('\nBatch Summary:');
  console.log(`- Valid entities: ${validCount}/${batchResults.length}`);
  console.log(`- Total errors: ${totalErrors}`);
  console.log(`- Total warnings: ${totalWarnings}`);
  console.log(`- Success rate: ${Math.round((validCount / batchResults.length) * 100)}%`);
}

/**
 * Main demo function
 */
async function runAllDemos() {
  console.log('🚀 Starting Autotask SDK Validation & Sanitization Demo\n');
  console.log('This demonstration shows all major features of the enterprise-grade');
  console.log('validation and sanitization layer including:');
  console.log('- Schema validation and data sanitization');
  console.log('- Security threat detection and prevention');
  console.log('- Regulatory compliance validation (GDPR, SOX, etc.)');
  console.log('- Data quality assurance and scoring');
  console.log('- Full integration with the Autotask client');
  console.log('- Batch processing capabilities');
  
  try {
    await demoBasicValidation();
    await demoSecurityValidation();
    await demoComplianceValidation();
    await demoQualityAssurance();
    await demoFullIntegration();
    await demoBatchProcessing();
    
    console.log('\n✅ All demos completed successfully!');
    console.log('\nThe validation layer provides comprehensive protection against:');
    console.log('- XSS and script injection attacks');
    console.log('- SQL injection attempts');
    console.log('- Data quality issues');
    console.log('- Compliance violations');
    console.log('- Security threats');
    console.log('- Unauthorized data access');
    
    console.log('\nIt ensures:');
    console.log('- Clean, sanitized data');
    console.log('- Regulatory compliance');
    console.log('- High data quality');
    console.log('- Comprehensive audit trails');
    console.log('- Enterprise-grade security');
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.error(error.stack);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runAllDemos().catch(console.error);
}

export {
  runAllDemos,
  demoBasicValidation,
  demoSecurityValidation,
  demoComplianceValidation,
  demoQualityAssurance,
  demoFullIntegration,
  demoBatchProcessing
};