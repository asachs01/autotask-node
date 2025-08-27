#!/usr/bin/env ts-node

/**
 * Autotask Migration Framework - Example Implementation
 * 
 * This example demonstrates how to set up and execute a migration
 * from ConnectWise Manage to Autotask using the migration framework.
 */

import * as dotenv from 'dotenv';
import {
  MigrationEngine,
  MigrationConfigBuilder,
  PSASystem,
  ConnectorFactory,
  MappingEngine,
  PreMigrationValidator,
  createSimpleMigration,
  createCSVImport,
  DEFAULT_MAPPINGS
} from '../src/migration';

// Load environment variables
dotenv.config();

/**
 * Example 1: ConnectWise Manage to Autotask Migration
 */
async function connectWiseMigrationExample() {
  console.log('🚀 Starting ConnectWise Manage Migration Example');

  try {
    // Build migration configuration
    const config = new MigrationConfigBuilder()
      .sourceSystem(PSASystem.CONNECTWISE_MANAGE)
      .sourceConnection({
        baseUrl: process.env.CW_BASE_URL || 'https://api-na.myconnectwise.net',
        credentials: {
          username: process.env.CW_USERNAME,
          password: process.env.CW_PASSWORD,
          clientId: process.env.CW_CLIENT_ID
        },
        options: {
          apiVersion: 'v4_6_release',
          timeout: 30000
        }
      })
      .autotaskConfig({
        baseUrl: process.env.AUTOTASK_BASE_URL || 'https://webservices2.autotask.net',
        username: process.env.AUTOTASK_USERNAME,
        secret: process.env.AUTOTASK_SECRET,
        integrationCode: process.env.AUTOTASK_INTEGRATION_CODE,
        clientId: process.env.AUTOTASK_CLIENT_ID
      })
      .entities(['companies', 'contacts', 'tickets'])
      .mappingRules([
        {
          sourceEntity: 'companies',
          targetEntity: 'companies',
          fieldMappings: [
            {
              sourceField: 'name',
              targetField: 'companyName',
              required: true,
              dataType: 'string' as any
            },
            {
              sourceField: 'identifier',
              targetField: 'companyNumber',
              required: false,
              dataType: 'string' as any
            },
            {
              sourceField: 'addressLine1',
              targetField: 'addressLine1',
              required: false,
              dataType: 'string' as any
            },
            {
              sourceField: 'phoneNumber',
              targetField: 'phone',
              required: false,
              dataType: 'phone' as any,
              validation: ['phone']
            }
          ],
          conditions: [],
          transformations: [
            {
              field: 'phoneNumber',
              type: 'format' as any,
              parameters: { format: 'phone' }
            }
          ]
        }
      ])
      .validation({
        preValidation: true,
        postValidation: true,
        qualityChecks: true,
        duplicateDetection: true
      })
      .options({
        dryRun: process.env.DRY_RUN === 'true',
        skipErrors: false,
        maxRetries: 3
      })
      .build();

    console.log('📋 Configuration created successfully');

    // Initialize migration engine
    const engine = new MigrationEngine();

    // Set up event listeners
    engine.on('initialized', (state) => {
      console.log('✅ Migration engine initialized');
      console.log(`Migration ID: ${state.id}`);
    });

    engine.on('started', (state) => {
      console.log('🏁 Migration started');
      if (state.config.options?.dryRun) {
        console.log('⚠️  Running in DRY RUN mode');
      }
    });

    engine.on('progress', (progress) => {
      console.log(`📊 Progress: ${progress.percentComplete.toFixed(1)}% (${progress.processedEntities}/${progress.totalEntities})`);
    });

    engine.on('completed', (state, report) => {
      console.log('🎉 Migration completed successfully!');
      console.log(`📈 Success Rate: ${report.summary.successRate.toFixed(1)}%`);
      console.log(`⏱️  Duration: ${Math.round(report.summary.duration / 1000)}s`);
      console.log(`📝 Records Processed: ${report.summary.totalEntities}`);
    });

    engine.on('failed', (state, error) => {
      console.error('❌ Migration failed:', error.message);
    });

    // Execute migration
    await engine.initialize(config);
    const report = await engine.execute();

    console.log('📊 Final Report:', {
      summary: report.summary,
      recommendations: report.recommendations
    });

  } catch (error) {
    console.error('❌ Migration example failed:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
  }
}

/**
 * Example 2: CSV Import to Autotask
 */
async function csvImportExample() {
  console.log('📂 Starting CSV Import Example');

  try {
    const migration = await createCSVImport({
      filePath: './examples/sample-companies.csv',
      targetEntity: 'companies',
      fieldMapping: {
        'Company Name': 'companyName',
        'Phone': 'phone',
        'Email': 'email',
        'Address': 'addressLine1',
        'City': 'city',
        'State': 'state',
        'ZIP': 'postalCode'
      },
      autotaskConfig: {
        baseUrl: process.env.AUTOTASK_BASE_URL || 'https://webservices2.autotask.net',
        username: process.env.AUTOTASK_USERNAME!,
        secret: process.env.AUTOTASK_SECRET!,
        integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!
      },
      hasHeaders: true,
      delimiter: ','
    });

    // Execute the migration
    const report = await migration.execute();

    console.log('📊 CSV Import Results:', {
      totalRecords: report.summary.totalEntities,
      successful: report.summary.successfulEntities,
      failed: report.summary.failedEntities,
      successRate: `${report.summary.successRate.toFixed(1)}%`
    });

  } catch (error) {
    console.error('❌ CSV Import failed:', error.message);
  }
}

/**
 * Example 3: Data Preview and Validation
 */
async function dataPreviewExample() {
  console.log('🔍 Starting Data Preview Example');

  try {
    // Create a connector for data preview
    const connector = ConnectorFactory.createConnector(
      PSASystem.CONNECTWISE_MANAGE,
      {
        baseUrl: process.env.CW_BASE_URL || 'https://api-na.myconnectwise.net',
        credentials: {
          username: process.env.CW_USERNAME,
          password: process.env.CW_PASSWORD,
          clientId: process.env.CW_CLIENT_ID
        }
      }
    );

    await connector.connect();

    // Get available entities
    const entities = await connector.getAvailableEntities();
    console.log('📋 Available entities:', entities.slice(0, 5));

    // Preview sample data
    const sampleCompanies = await connector.fetchBatch('companies', 0, 5);
    console.log('🏢 Sample companies:');
    sampleCompanies.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} (${company.identifier})`);
    });

    // Check data quality
    const qualityReport = await connector.validateDataQuality('companies');
    console.log('📊 Data Quality Report:');
    console.log(`  Overall Score: ${qualityReport.qualityScore}%`);
    console.log(`  Issues Found: ${qualityReport.issues.length}`);
    
    if (qualityReport.issues.length > 0) {
      console.log('  Top Issues:');
      qualityReport.issues.slice(0, 3).forEach(issue => {
        console.log(`    - ${issue.type}: ${issue.field} (${issue.percentage.toFixed(1)}% affected)`);
      });
    }

    await connector.disconnect();

  } catch (error) {
    console.error('❌ Data preview failed:', error.message);
  }
}

/**
 * Example 4: Advanced Mapping with Transformations
 */
async function advancedMappingExample() {
  console.log('🔄 Starting Advanced Mapping Example');

  try {
    const mappingEngine = new MappingEngine({
      rules: [
        {
          sourceEntity: 'companies',
          targetEntity: 'companies',
          fieldMappings: [
            {
              sourceField: 'name',
              targetField: 'companyName',
              required: true,
              dataType: 'string' as any
            },
            {
              sourceField: 'phoneNumber',
              targetField: 'phone',
              required: false,
              dataType: 'phone' as any
            }
          ],
          transformations: [
            {
              field: 'companyName',
              type: 'format' as any,
              parameters: { format: 'uppercase' }
            },
            {
              field: 'phoneNumber',
              type: 'format' as any,
              parameters: { format: 'phone' }
            }
          ],
          conditions: [
            {
              field: 'deletedFlag',
              operator: 'equals' as any,
              value: false,
              action: 'include' as any
            }
          ]
        }
      ],
      aiAssisted: false
    });

    // Sample data transformation
    const sampleData = [
      {
        name: 'acme corporation',
        phoneNumber: '1234567890',
        deletedFlag: false
      },
      {
        name: 'test company inc',
        phoneNumber: '(555) 123-4567',
        deletedFlag: true
      }
    ];

    const transformedData = await mappingEngine.transformBatch('companies', sampleData);
    
    console.log('🔄 Transformation Results:');
    console.log('Original:', sampleData);
    console.log('Transformed:', transformedData);

  } catch (error) {
    console.error('❌ Advanced mapping example failed:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  const examples = {
    'connectwise': connectWiseMigrationExample,
    'csv': csvImportExample,
    'preview': dataPreviewExample,
    'mapping': advancedMappingExample
  };

  const exampleType = process.argv[2] || 'preview';

  if (examples[exampleType]) {
    console.log(`\n🌟 Running ${exampleType} example...\n`);
    await examples[exampleType]();
  } else {
    console.log('📚 Available examples:');
    Object.keys(examples).forEach(key => {
      console.log(`  - ${key}`);
    });
    console.log('\nUsage: ts-node examples/migration-example.ts <example-type>');
  }
}

// Run the example
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Example failed:', error);
    process.exit(1);
  });
}

export {
  connectWiseMigrationExample,
  csvImportExample,
  dataPreviewExample,
  advancedMappingExample
};