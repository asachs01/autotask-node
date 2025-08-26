# Autotask Entity Relationship and Cascade Operations System

## Overview

The Autotask Entity Relationship and Cascade Operations System is an advanced enterprise-grade extension to the Autotask Node.js SDK that provides intelligent relationship mapping, cascade operations, and data integrity management for complex Autotask PSA environments.

## Key Features

### 🗺️ Comprehensive Entity Relationship Mapping
- **Complete Coverage**: Maps all 178+ Autotask entities and their relationships
- **Multiple Relationship Types**: One-to-One, One-to-Many, Many-to-Many, Self-Referencing, Hierarchical, Polymorphic
- **Circular Dependency Detection**: Identifies and handles circular relationship dependencies
- **Hierarchical Organization**: Automatically organizes entities by dependency levels

### ⚡ Intelligent Cascade Operations
- **Smart Cascade Create**: Create entities with related data in proper dependency order
- **Safe Cascade Update**: Update entities while maintaining relationship integrity
- **Protected Cascade Delete**: Delete entities with comprehensive safety checks and impact analysis
- **Configurable Depth Control**: Limit cascade operations to prevent excessive data modification
- **Dry-Run Capability**: Test operations without making actual changes

### 🎯 Smart Loading Patterns
- **Multiple Strategies**: Eager, Lazy, Selective, Prefetch, and On-Demand loading
- **Performance Optimization**: Intelligent caching, query deduplication, and batch loading
- **Usage Pattern Analysis**: Learns from access patterns to optimize future queries
- **Configurable Profiles**: Pre-built loading profiles for different use cases

### 🔍 Data Integrity Management
- **Orphaned Record Detection**: Automatically finds records with missing parent references
- **Referential Integrity Validation**: Ensures all relationship references are valid
- **Business Rule Constraint Checking**: Validates custom business rules and constraints
- **Automated Repair Plans**: Generates and executes plans to fix integrity issues
- **Impact Analysis**: Provides detailed analysis of potential changes before execution

### 📊 Advanced Graph Traversal
- **Multiple Search Algorithms**: Breadth-first, Depth-first, Shortest path, All paths
- **Dependency Analysis**: Comprehensive analysis of entity dependencies and impacts
- **Risk Assessment**: Evaluates isolation risk and cascade impact for entities
- **Path Optimization**: Finds optimal relationship paths between entities

### 🚀 High-Performance Batch Processing
- **Dependency Resolution**: Automatically resolves operation dependencies
- **Parallel Processing**: Configurable concurrency with intelligent resource management
- **Memory Optimization**: Optimized for large-scale operations with memory monitoring
- **Rollback Capabilities**: Automatic rollback on failure with backup support

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                AutotaskRelationshipSystem                   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐   │
│ │Relationship │ │   Cascade    │ │   Graph Traversal   │   │
│ │   Mapper    │ │   Engine     │ │      Engine         │   │
│ └─────────────┘ └──────────────┘ └─────────────────────┘   │
│ ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐   │
│ │Smart Loading│ │Data Integrity│ │ Batch Relationship  │   │
│ │   Engine    │ │   Manager    │ │    Processor        │   │
│ └─────────────┘ └──────────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   AutotaskClient                            │
└─────────────────────────────────────────────────────────────┘
```

## Installation and Setup

### Basic Setup

```typescript
import { AutotaskClient, AutotaskRelationshipSystem } from 'autotask-node';

const client = new AutotaskClient({
  apiIntegrationCode: 'your-integration-code',
  username: 'your-username',
  password: 'your-password',
  serverBaseUrl: 'https://webservices2.autotask.net/atservices/1.6/atws.asmx'
});

const relationshipSystem = new AutotaskRelationshipSystem(client);
await relationshipSystem.initialize();
```

### Advanced Configuration

```typescript
const relationshipSystem = new AutotaskRelationshipSystem(client, {
  // Cascade operation limits
  maxCascadeDepth: 5,
  defaultBatchSize: 50,
  
  // Safety and validation
  enableCircularDependencyDetection: true,
  enableIntegrityValidation: true,
  
  // Performance optimization
  defaultLoadingStrategy: 'SELECTIVE',
  cacheEnabled: true,
  cacheTtl: 300000, // 5 minutes
  performanceMonitoring: true,
  
  // Error handling
  retryPolicy: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    exponentialBackoff: true
  },
  
  // Logging
  logLevel: 'INFO'
});
```

## Core Usage Patterns

### 1. Cascade Create Operations

Create a company with related contacts, locations, and configuration items:

```typescript
const companyData = {
  companyName: 'Tech Solutions Inc.',
  companyType: 'Customer',
  phone: '555-123-4567',
  city: 'New York',
  state: 'NY'
};

const relatedData = new Map([
  ['Contacts', [
    {
      firstName: 'John',
      lastName: 'Smith',
      emailAddress: 'john.smith@techsolutions.com',
      title: 'IT Manager',
      isActive: true
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      emailAddress: 'sarah.johnson@techsolutions.com',
      title: 'System Administrator',
      isActive: true
    }
  ]],
  ['CompanyLocations', [
    {
      name: 'Main Office',
      address1: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      isPrimary: true
    }
  ]],
  ['ConfigurationItems', [
    {
      configurationItemName: 'Primary Server',
      configurationItemType: 'Server',
      installDate: new Date(),
      isActive: true
    }
  ]]
]);

const result = await relationshipSystem.cascade.cascadeCreate(
  'Companies',
  companyData,
  relatedData,
  {
    maxDepth: 3,
    dryRun: false,
    continueOnError: false
  }
);

if (result.success) {
  console.log(`Created company with ${result.operationsCount} total operations`);
  console.log(`Execution time: ${result.executionTime}ms`);
  
  result.affectedEntities.forEach((entityResult, entityName) => {
    console.log(`Created ${entityResult.recordIds.length} ${entityName} records`);
  });
}
```

### 2. Smart Loading with Relationships

Load entities with optimized relationship loading:

```typescript
// Load a company with commonly accessed relationships
const result = await relationshipSystem.loading.loadWithRelationships(
  'Companies',
  123,
  {
    includeRelationships: ['contacts', 'tickets', 'projects', 'contracts'],
    loadingStrategy: 'SELECTIVE',
    maxDepth: 2,
    batchSize: 20,
    cacheResults: true
  }
);

console.log(`Primary entity: ${result.entity?.companyName}`);
console.log(`Relationships loaded: ${result.relatedData.size}`);
console.log(`Cache hit rate: ${result.loadingStatistics.cacheHitRate}%`);
console.log(`Query time: ${result.loadingStatistics.totalQueryTime}ms`);

// Access related data
const contacts = result.relatedData.get('contacts');
const tickets = result.relatedData.get('tickets');
const projects = result.relatedData.get('projects');
```

### 3. Data Integrity Management

Perform comprehensive data integrity checks and repairs:

```typescript
// Run integrity check
const integrityResult = await relationshipSystem.integrity.performIntegrityCheck({
  entities: ['Companies', 'Contacts', 'Tickets', 'Projects'],
  checkOrphans: true,
  checkReferences: true,
  checkCircularDependencies: true,
  checkConstraints: true,
  generateReport: true
});

console.log(`Found ${integrityResult.violations.length} integrity violations`);
console.log(`Orphaned records: ${integrityResult.orphanedRecords.length}`);
console.log(`Referential issues: ${integrityResult.referentialIssues.length}`);

// Execute repair plan if available
if (integrityResult.repairPlan) {
  console.log(`Repair plan has ${integrityResult.repairPlan.steps.length} steps`);
  console.log(`Risk assessment: ${integrityResult.repairPlan.riskAssessment}`);
  
  const repairResult = await relationshipSystem.integrity.executeRepairPlan(
    integrityResult.repairPlan.repairId,
    {
      dryRun: false,
      stepByStep: false,
      backupData: true
    }
  );
  
  console.log(`Repair ${repairResult.success ? 'successful' : 'failed'}`);
}
```

### 4. Batch Cascade Operations

Perform high-performance batch operations:

```typescript
// Batch cascade delete with safety checks
const ticketIds = [1001, 1002, 1003, 1004, 1005];

const batchResult = await relationshipSystem.batch.batchCascadeDelete(
  'Tickets',
  ticketIds,
  {
    maxConcurrency: 3,
    batchSize: 10,
    continueOnError: true,
    safetyChecks: true,
    rollbackOnFailure: true
  }
);

console.log(`Batch operation ${batchResult.success ? 'completed' : 'failed'}`);
console.log(`Execution time: ${batchResult.executionTime}ms`);

batchResult.processedEntities.forEach((stats, entityName) => {
  console.log(`${entityName}: ${stats.successful}/${stats.processed} successful`);
});
```

### 5. Entity Dependency Analysis

Analyze entity relationships and dependencies:

```typescript
// Analyze dependencies for a critical entity
const analysis = relationshipSystem.traversal.analyzeDependencies('Companies');

console.log(`${analysis.entityName} dependency analysis:`);
console.log(`- Direct dependencies: ${analysis.directDependencies.length}`);
console.log(`- Transitive dependencies: ${analysis.transiteDependencies.length}`);
console.log(`- Direct dependents: ${analysis.dependents.length}`);
console.log(`- Transitive dependents: ${analysis.transiteDependents.length}`);
console.log(`- Isolation risk: ${analysis.isolationRisk}`);

// Find relationship paths
const paths = relationshipSystem.traversal.findAllPaths('Companies', 'TimeEntries');
if (paths.length > 0) {
  const shortestPath = paths[0];
  console.log(`Shortest path: ${shortestPath.distance} steps, cost: ${shortestPath.cost}`);
}
```

### 6. System Health Monitoring

Monitor system health and performance:

```typescript
// Get current system health
const health = relationshipSystem.getSystemHealth();

console.log(`System status: ${health.status}`);
console.log(`Total relationships: ${health.metrics.totalRelationships}`);
console.log(`Cache hit rate: ${health.metrics.cacheHitRate}%`);
console.log(`Active operations: ${health.metrics.activeBatchOperations}`);

// Show warnings and errors
health.warnings.forEach(warning => console.log(`⚠️ ${warning}`));
health.errors.forEach(error => console.log(`❌ ${error}`));

// Perform full system validation
const validation = await relationshipSystem.validateSystem();
console.log(`System validation: ${validation.valid ? '✅ Valid' : '❌ Issues found'}`);

validation.issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.component} - ${issue.message}`);
});
```

## Advanced Features

### Custom Loading Patterns

Define custom loading patterns for specific use cases:

```typescript
// Customer service representative pattern
const customerServiceResult = await relationshipSystem.loading.loadSelective(
  'Companies',
  123,
  ['contacts', 'tickets', 'notes', 'alerts'], // Include patterns
  ['contracts', 'opportunities'] // Exclude patterns
);

// Sales representative pattern
const salesResult = await relationshipSystem.loading.loadSelective(
  'Companies', 
  123,
  ['contacts', 'opportunities', 'quotes', 'notes'],
  ['tickets', 'configurationItems']
);

// Technical analyst pattern
const technicalResult = await relationshipSystem.loading.loadSelective(
  'Companies',
  123,
  ['tickets', 'projects', 'configurationItems', 'contracts'],
  ['opportunities', 'quotes']
);
```

### Batch Relationship Operations

Handle complex batch operations with dependency resolution:

```typescript
// Create multiple companies with related data in batch
const companyRequests = [
  {
    entityName: 'Companies',
    data: { companyName: 'Company A', companyType: 'Customer' },
    relatedData: new Map([
      ['Contacts', [{ firstName: 'John', lastName: 'Doe' }]]
    ])
  },
  {
    entityName: 'Companies', 
    data: { companyName: 'Company B', companyType: 'Vendor' },
    relatedData: new Map([
      ['Contacts', [{ firstName: 'Jane', lastName: 'Smith' }]]
    ])
  }
];

const batchCreateResult = await relationshipSystem.batch.processBatchOperations(
  companyRequests.map(req => ({
    id: `create_${req.data.companyName}`,
    type: 'CASCADE_CREATE',
    entities: [{ entityName: req.entityName, recordIds: ['pending'], data: req.data }],
    status: 'PENDING'
  }))
);
```

### Relationship Path Analysis

Find and analyze relationship paths between entities:

```typescript
// Find all paths between two entity types
const allPaths = relationshipSystem.traversal.findAllPaths(
  'Companies', 
  'TimeEntries',
  { maxDepth: 5, strategy: 'ALL_PATHS' }
);

allPaths.forEach((path, index) => {
  console.log(`Path ${index + 1}: ${path.distance} steps, cost: ${path.cost}`);
  console.log(`Route: ${[path.source, ...path.path.map(rel => rel.targetEntity)].join(' → ')}`);
});

// Analyze strongly connected components (circular dependency groups)
const components = relationshipSystem.traversal.findStronglyConnectedComponents();
components.forEach((component, index) => {
  console.log(`Circular dependency group ${index + 1}: ${component.join(', ')}`);
});
```

## Performance Optimization

### Caching Strategy

```typescript
// Configure aggressive caching for read-heavy workloads
const system = new AutotaskRelationshipSystem(client, {
  cacheEnabled: true,
  cacheTtl: 600000, // 10 minutes
  defaultLoadingStrategy: 'PREFETCH'
});

// Prefetch commonly accessed relationships
await system.loading.prefetchRelationships(
  'Companies',
  [123, 124, 125], // Company IDs
  {
    relationships: ['contacts', 'tickets', 'projects'],
    priority: 'HIGH'
  }
);
```

### Memory Optimization

```typescript
// Configure for memory-constrained environments
const system = new AutotaskRelationshipSystem(client, {
  defaultBatchSize: 25, // Smaller batches
  maxCascadeDepth: 3,   // Limit depth
  cacheEnabled: false   // Disable caching to save memory
});
```

### Concurrency Control

```typescript
// High-performance batch processing
const batchResult = await system.batch.batchCascadeUpdate(
  'Tickets',
  updates,
  {
    maxConcurrency: 10,    // Higher concurrency
    batchSize: 100,        // Larger batches
    continueOnError: true, // Don't stop on individual failures
    rollbackOnFailure: false // Don't rollback for performance
  }
);
```

## Error Handling and Safety

### Comprehensive Error Information

```typescript
try {
  const result = await relationshipSystem.cascade.cascadeDelete(
    'Companies',
    123,
    { safetyChecks: true, dryRun: false }
  );
} catch (error) {
  console.error('Cascade delete failed:', error.message);
  
  if (error.context) {
    console.error('Error context:', error.context);
  }
  
  if (error.suggestedAction) {
    console.error('Suggested action:', error.suggestedAction);
  }
}
```

### Safe Delete Operations

```typescript
// Always perform safety checks before large delete operations
const deleteResult = await relationshipSystem.cascade.cascadeDelete(
  'Companies',
  123,
  {
    dryRun: true,        // Test first
    safetyChecks: true,  // Perform safety checks
    maxDepth: 3,         // Limit cascade depth
    force: false         // Require safety confirmation
  }
);

if (deleteResult.success && deleteResult.affectedEntities.size < 100) {
  // If test looks safe, perform actual delete
  const actualResult = await relationshipSystem.cascade.cascadeDelete(
    'Companies',
    123,
    { ...deleteOptions, dryRun: false }
  );
}
```

## Integration Examples

### With Existing Business Logic

```typescript
import { AutotaskClient, AutotaskRelationshipSystem } from 'autotask-node';

class EnhancedCompanyService {
  constructor(
    private client: AutotaskClient,
    private relationships: AutotaskRelationshipSystem
  ) {}

  async createCompanyWithSetup(companyData: any) {
    // Use relationship system for complete setup
    const result = await this.relationships.cascade.cascadeCreate(
      'Companies',
      companyData,
      this.buildInitialRelatedData(companyData)
    );

    if (result.success) {
      // Perform additional business logic
      await this.setupCompanyDefaults(result.affectedEntities);
      await this.notifyStakeholders(result);
    }

    return result;
  }

  async deleteCompanyWithCleanup(companyId: number) {
    // Check data integrity first
    const integrity = await this.relationships.integrity.performIntegrityCheck({
      entities: ['Companies'],
      generateReport: true
    });

    // Perform safe cascade delete
    return await this.relationships.cascade.cascadeDelete(
      'Companies',
      companyId,
      {
        safetyChecks: true,
        dryRun: false,
        maxDepth: 5
      }
    );
  }

  private buildInitialRelatedData(companyData: any): Map<string, any[]> {
    // Build related data based on company type and requirements
    return new Map([
      ['Contacts', this.getInitialContacts(companyData)],
      ['CompanyLocations', this.getInitialLocations(companyData)],
      ['CompanyNotes', this.getInitialNotes(companyData)]
    ]);
  }
}
```

### With Performance Monitoring

```typescript
class MonitoredRelationshipOperations {
  constructor(private relationships: AutotaskRelationshipSystem) {}

  async performMonitoredOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now();
    const startHealth = this.relationships.getSystemHealth();

    try {
      const result = await operation();
      
      const endTime = Date.now();
      const endHealth = this.relationships.getSystemHealth();
      
      this.logPerformanceMetrics(operationName, startTime, endTime, startHealth, endHealth);
      
      return result;
    } catch (error) {
      this.logOperationError(operationName, error);
      throw error;
    }
  }

  private logPerformanceMetrics(
    operationName: string,
    startTime: number,
    endTime: number,
    startHealth: any,
    endHealth: any
  ) {
    console.log(`Operation: ${operationName}`);
    console.log(`Duration: ${endTime - startTime}ms`);
    console.log(`Cache hit rate: ${endHealth.metrics.cacheHitRate}%`);
    console.log(`Active operations: ${endHealth.metrics.activeBatchOperations}`);
  }
}
```

## Best Practices

### 1. Always Test with Dry Run

```typescript
// Test destructive operations first
const testResult = await relationshipSystem.cascade.cascadeDelete(
  'Companies', 
  123, 
  { dryRun: true }
);

if (testResult.success && testResult.affectedEntities.size <= acceptableLimit) {
  const actualResult = await relationshipSystem.cascade.cascadeDelete(
    'Companies',
    123,
    { dryRun: false }
  );
}
```

### 2. Use Appropriate Loading Strategies

```typescript
// For read-heavy scenarios
const heavyReadSystem = new AutotaskRelationshipSystem(client, {
  defaultLoadingStrategy: 'PREFETCH',
  cacheEnabled: true,
  cacheTtl: 600000 // 10 minutes
});

// For write-heavy scenarios
const writeHeavySystem = new AutotaskRelationshipSystem(client, {
  defaultLoadingStrategy: 'LAZY',
  cacheEnabled: false // Avoid stale data
});
```

### 3. Monitor System Health

```typescript
// Regular health checks
setInterval(async () => {
  const health = relationshipSystem.getSystemHealth();
  
  if (health.status === 'ERROR') {
    console.error('Relationship system errors:', health.errors);
    // Alert operations team
  }
  
  if (health.status === 'DEGRADED') {
    console.warn('Relationship system warnings:', health.warnings);
    // Log for investigation
  }
}, 300000); // Check every 5 minutes
```

### 4. Implement Proper Error Handling

```typescript
class RobustRelationshipOperations {
  async safeOperation(operation: () => Promise<any>, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }
}
```

### 5. Use Batch Operations for Scale

```typescript
// Instead of individual operations
const individualResults = [];
for (const recordId of recordIds) {
  const result = await relationshipSystem.cascade.cascadeDelete('Tickets', recordId);
  individualResults.push(result);
}

// Use batch operations
const batchResult = await relationshipSystem.batch.batchCascadeDelete(
  'Tickets',
  recordIds,
  {
    maxConcurrency: 5,
    batchSize: 20,
    continueOnError: true
  }
);
```

## Troubleshooting

### Common Issues

1. **Performance Issues**: Enable caching, adjust batch sizes, monitor system health
2. **Memory Usage**: Reduce cascade depth, use smaller batches, disable caching if needed
3. **Circular Dependencies**: Use graph traversal tools to identify and break cycles
4. **Data Integrity Issues**: Run regular integrity checks and use automated repair plans

### Debug Mode

```typescript
const debugSystem = new AutotaskRelationshipSystem(client, {
  logLevel: 'DEBUG',
  performanceMonitoring: true
});
```

### Error Analysis

```typescript
const validation = await relationshipSystem.validateSystem();
validation.issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.component} - ${issue.message}`);
  if (issue.suggestion) {
    console.log(`Suggestion: ${issue.suggestion}`);
  }
});
```

This comprehensive relationship system provides enterprise-grade functionality for managing complex Autotask PSA environments with confidence, safety, and performance.