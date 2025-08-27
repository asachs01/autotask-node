# Autotask PSA Migration Framework

A comprehensive migration framework for moving data from various PSA (Professional Services Automation) systems to Autotask. This enterprise-grade solution provides data mapping, validation, and migration capabilities with support for multiple source systems.

## 🚀 Features

### **Supported PSA Systems**
- **ConnectWise Manage** - Complete entity mapping and data extraction
- **ServiceNow ITSM** - Full service management integration
- **Kaseya VSA** - RMM and PSA data migration
- **FreshService** - IT service management migration
- **ServiceDesk Plus** - ManageEngine ITSM migration
- **CSV/Excel Import** - Generic file-based data import

### **Core Capabilities**
- **Universal Migration Engine** - Single framework for all PSA sources
- **Data Mapping & Transformation** - Intelligent field mapping with AI assistance
- **Validation & Quality Checks** - Pre/post migration validation with data quality scoring
- **Enterprise Scaling** - Parallel processing, checkpoints, and rollback capabilities
- **CLI Tools** - Interactive wizards and command-line utilities
- **Progress Monitoring** - Real-time progress tracking and reporting

## 📦 Installation

```bash
npm install autotask-node
```

## 🏗️ Quick Start

### 1. Basic Migration Setup

```typescript
import { 
  MigrationEngine, 
  MigrationConfigBuilder, 
  PSASystem 
} from 'autotask-node/migration';

// Build configuration
const config = new MigrationConfigBuilder()
  .sourceSystem(PSASystem.CONNECTWISE_MANAGE)
  .sourceConnection({
    baseUrl: 'https://api-na.myconnectwise.net',
    credentials: {
      username: 'your-username',
      password: 'your-password',
      clientId: 'your-client-id'
    }
  })
  .autotaskConfig({
    baseUrl: 'https://webservices2.autotask.net',
    username: 'your-username',
    secret: 'your-secret',
    integrationCode: 'your-integration-code'
  })
  .entities(['companies', 'contacts', 'tickets'])
  .build();

// Execute migration
const engine = new MigrationEngine();
await engine.initialize(config);
const report = await engine.execute();

console.log(`Migration completed: ${report.summary.successRate}% success rate`);
```

### 2. CSV Import Migration

```typescript
import { createCSVImport } from 'autotask-node/migration';

const migration = await createCSVImport({
  filePath: './companies.csv',
  targetEntity: 'companies',
  fieldMapping: {
    'Company Name': 'companyName',
    'Phone': 'phone',
    'Email': 'email',
    'Address': 'addressLine1'
  },
  autotaskConfig: {
    baseUrl: 'https://webservices2.autotask.net',
    username: 'your-username',
    secret: 'your-secret',
    integrationCode: 'your-integration-code'
  }
});

const report = await migration.execute();
```

### 3. Using the CLI

```bash
# Initialize migration configuration
npx autotask-migrate init --interactive

# Validate configuration and data
npx autotask-migrate validate

# Preview data transformations
npx autotask-migrate preview --entity companies --limit 5

# Execute migration
npx autotask-migrate migrate

# Check migration status
npx autotask-migrate status

# View migration report
npx autotask-migrate report migration-report.json
```

## 🔧 Configuration

### Migration Configuration Structure

```typescript
interface MigrationConfig {
  source: {
    system: PSASystem;
    connectionConfig: SourceConnectionConfig;
    entities: string[];
    batchSize?: number;
    parallelism?: number;
  };
  target: {
    autotaskConfig: AutotaskConnectionConfig;
    zoneId: string;
  };
  mapping: {
    rules: MappingRule[];
    customTransformations?: CustomTransformation[];
    aiAssisted?: boolean;
  };
  validation: {
    preValidation: boolean;
    postValidation: boolean;
    qualityChecks: boolean;
    duplicateDetection: boolean;
  };
  options: {
    incremental?: boolean;
    resumeFromCheckpoint?: string;
    dryRun?: boolean;
    skipErrors?: boolean;
    maxRetries?: number;
  };
}
```

### Connection Configurations

#### ConnectWise Manage
```typescript
{
  baseUrl: 'https://api-na.myconnectwise.net',
  credentials: {
    username: 'company+username',
    password: 'password',
    clientId: 'your-client-id'
  },
  options: {
    apiVersion: 'v4_6_release',
    timeout: 30000
  }
}
```

#### ServiceNow
```typescript
{
  baseUrl: 'https://your-instance.service-now.com',
  credentials: {
    username: 'your-username',
    password: 'your-password'
  },
  options: {
    timeout: 30000
  }
}
```

#### CSV Import
```typescript
{
  baseUrl: '', // Not needed for file import
  credentials: {}, // Not needed for file import
  filePath: './data/companies.csv',
  format: 'csv',
  hasHeaders: true,
  delimiter: ',',
  encoding: 'utf8',
  mapping: {
    'Company Name': 'companyName',
    'Phone Number': 'phone'
  }
}
```

## 🗺️ Data Mapping

### Default Field Mappings

The framework provides default field mappings for common entities:

```typescript
import { DEFAULT_MAPPINGS } from 'autotask-node/migration';

// ConnectWise to Autotask company mapping
const companyMapping = DEFAULT_MAPPINGS.connectwise.companies;
// {
//   'name': 'companyName',
//   'identifier': 'companyNumber',
//   'addressLine1': 'addressLine1',
//   'phoneNumber': 'phone'
// }
```

### Custom Mapping Rules

```typescript
const mappingRule: MappingRule = {
  sourceEntity: 'companies',
  targetEntity: 'companies',
  fieldMappings: [
    {
      sourceField: 'name',
      targetField: 'companyName',
      required: true,
      dataType: DataType.STRING
    },
    {
      sourceField: 'phone',
      targetField: 'phone',
      required: false,
      dataType: DataType.PHONE,
      validation: ['phone']
    }
  ],
  transformations: [
    {
      field: 'phone',
      type: TransformationType.FORMAT,
      parameters: { format: 'phone' }
    }
  ],
  conditions: [
    {
      field: 'status',
      operator: ConditionOperator.EQUALS,
      value: 'Active',
      action: MappingAction.INCLUDE
    }
  ]
};
```

### Advanced Transformations

```typescript
// Custom transformation function
const customTransformation: CustomTransformation = {
  name: 'formatCompanyName',
  sourceEntity: 'companies',
  targetEntity: 'companies',
  function: (data, context) => {
    // Custom business logic
    data.companyName = data.companyName?.toUpperCase();
    return data;
  }
};

// Register custom transformation
mappingEngine.registerCustomFunction('formatCompanyName', customTransformation.function);
```

## 🔍 Validation & Quality Checks

### Pre-Migration Validation

```typescript
import { PreMigrationValidator } from 'autotask-node/migration';

const validator = new PreMigrationValidator(sourceConnector);
const result = await validator.validate(entities, config);

if (!result.isValid) {
  console.error('Validation failed:', result.errors);
  return;
}

console.log(`Data quality score: ${result.score}%`);
```

### Data Quality Assessment

```typescript
// Assess data quality for an entity
const qualityReport = await sourceConnector.validateDataQuality('companies');

console.log(`Quality Score: ${qualityReport.qualityScore}%`);
console.log('Issues found:', qualityReport.issues);
console.log('Recommendations:', qualityReport.recommendations);
```

## 🏢 Enterprise Features

### Parallel Processing

```typescript
const config = {
  source: {
    batchSize: 500,
    parallelism: 5  // Process 5 batches in parallel
  },
  // ...
};
```

### Checkpoints & Resume

```typescript
// Migration automatically creates checkpoints
// Resume from a specific checkpoint
const config = {
  options: {
    resumeFromCheckpoint: 'checkpoint-id-12345'
  }
};
```

### Progress Monitoring

```typescript
const engine = new MigrationEngine();

engine.on('progress', (progress) => {
  console.log(`Progress: ${progress.percentComplete}%`);
  console.log(`Processed: ${progress.processedEntities}/${progress.totalEntities}`);
});

engine.on('completed', (state, report) => {
  console.log('Migration completed!');
  console.log('Final report:', report);
});
```

## 📊 Reporting

### Migration Reports

```typescript
// Reports include:
interface MigrationReport {
  summary: {
    totalEntities: number;
    successfulEntities: number;
    failedEntities: number;
    successRate: number;
    duration: number;
  };
  entityReports: EntityMigrationReport[];
  validationReport: ValidationReport;
  performanceReport: PerformanceReport;
  recommendations: string[];
}
```

### CLI Report Viewing

```bash
# View summary
npx autotask-migrate report migration-report.json

# View as table
npx autotask-migrate report migration-report.json --format table

# View raw JSON
npx autotask-migrate report migration-report.json --format json
```

## 🛠️ Advanced Usage

### Custom Connectors

```typescript
import { BaseConnector } from 'autotask-node/migration';

class CustomPSAConnector extends BaseConnector {
  async connect(): Promise<void> {
    // Custom connection logic
  }

  async fetchBatch(entityType: string, offset: number, limit: number): Promise<any[]> {
    // Custom data fetching logic
    return [];
  }

  // Implement other required methods...
}

// Register custom connector
ConnectorFactory.registerConnector(PSASystem.CUSTOM, CustomPSAConnector);
```

### Migration Workflows

```typescript
// Complex migration workflow
const workflow = async () => {
  // 1. Pre-validation
  const validationResult = await preValidator.validate(entities, config);
  if (!validationResult.isValid) throw new Error('Validation failed');

  // 2. Data quality check
  for (const entity of entities) {
    const quality = await connector.validateDataQuality(entity);
    if (quality.qualityScore < 70) {
      console.warn(`Low data quality for ${entity}: ${quality.qualityScore}%`);
    }
  }

  // 3. Execute migration with monitoring
  const engine = new MigrationEngine();
  engine.on('progress', logProgress);
  
  const report = await engine.execute();

  // 4. Post-migration validation
  const postValidation = await postValidator.validate(entities, migrationState);
  
  return { migrationReport: report, validation: postValidation };
};
```

## 🔐 Security & Compliance

### Secure Credential Management

```typescript
// Use environment variables
const config = createConfigFromEnv();

// Or use encrypted credential stores
const credentials = await credentialStore.retrieve('connectwise-prod');
```

### Data Sanitization

```typescript
const mappingRule = {
  fieldMappings: [
    {
      sourceField: 'notes',
      targetField: 'description',
      required: false,
      dataType: DataType.STRING,
      validation: ['sanitize_html'] // Automatically sanitize HTML
    }
  ]
};
```

## 📈 Performance Optimization

### Recommended Settings by System

| PSA System | Batch Size | Parallelism | Notes |
|------------|------------|-------------|-------|
| ConnectWise Manage | 500 | 3 | API rate limits apply |
| ServiceNow | 1000 | 5 | Higher throughput supported |
| Kaseya VSA | 250 | 2 | Conservative for stability |
| CSV Import | 1000 | 5 | No network limitations |

### Memory Management

```typescript
const config = {
  source: {
    batchSize: 100, // Smaller batches for large records
  },
  options: {
    memoryLimit: '2GB' // Set memory limits
  }
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Rate Limiting**: Reduce batch size and parallelism
```typescript
const config = {
  source: {
    batchSize: 50,
    parallelism: 1
  }
};
```

2. **Data Quality Issues**: Use quality checks
```bash
npx autotask-migrate validate --sample-size 1000
```

3. **Field Mapping Errors**: Preview transformations
```bash
npx autotask-migrate preview --entity companies
```

### Debug Mode

```bash
# Enable debug logging
DEBUG_MIGRATION=true npx autotask-migrate migrate

# Or programmatically
process.env.LOG_LEVEL = 'debug';
```

## 📚 API Reference

### Core Classes

- **`MigrationEngine`** - Main orchestration engine
- **`ConnectorFactory`** - Creates PSA system connectors
- **`MappingEngine`** - Handles data transformations
- **`PreMigrationValidator`** - Validates before migration
- **`PostMigrationValidator`** - Validates after migration

### Utility Functions

- **`createSimpleMigration(options)`** - Quick migration setup
- **`createCSVImport(options)`** - CSV import helper
- **`createMigrationConfig(options)`** - Configuration builder
- **`validateMigrationConfig(config)`** - Configuration validator

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/asachs01/autotask-node/issues)
- 💬 [Discussions](https://github.com/asachs01/autotask-node/discussions)

---

**Made with ❤️ for the MSP community**