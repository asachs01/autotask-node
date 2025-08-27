# Autotask Relationship System

A comprehensive entity relationship mapping and cascade operations system for the Autotask Node.js SDK. This system provides intelligent relationship discovery, smart loading patterns, cascade operations, data integrity management, and batch processing capabilities.

## Overview

The Autotask Relationship System understands the complex entity relationships within Autotask PSA and provides advanced functionality for:

- **Relationship Mapping**: Complete mapping of all Autotask entity relationships
- **Cascade Operations**: Intelligent create, update, and delete operations with relationship awareness
- **Smart Loading**: Optimized loading patterns with caching and performance optimization
- **Data Integrity**: Automated integrity checks, orphaned record detection, and repair plans
- **Graph Traversal**: Advanced relationship path finding and dependency analysis
- **Batch Processing**: High-performance batch operations with dependency resolution

## Key Features

### 🗺️ Comprehensive Relationship Mapping
- Maps all 178 Autotask entities and their relationships
- Supports all relationship types (One-to-One, One-to-Many, Many-to-Many, etc.)
- Circular dependency detection and handling
- Hierarchical entity organization

### ⚡ Smart Cascade Operations
- Intelligent cascade create, update, and delete operations
- Safety checks and validation before destructive operations
- Configurable cascade depth and batch sizes
- Dry-run capability for testing operations

### 🎯 Smart Loading Patterns
- Eager, lazy, selective, and on-demand loading strategies
- Automatic relationship caching and optimization
- Usage pattern analysis for intelligent prefetching
- Configurable loading profiles (lightweight, balanced, comprehensive)

### 🔍 Data Integrity Management
- Automated orphaned record detection
- Referential integrity validation
- Business rule constraint checking
- Automated repair plan generation and execution

### 📊 Graph Traversal & Analysis
- Breadth-first and depth-first search algorithms
- Shortest path finding between entities
- Dependency analysis and risk assessment
- Strongly connected component detection

### 🚀 High-Performance Batch Processing
- Intelligent dependency resolution for batch operations
- Parallel processing with configurable concurrency
- Memory optimization for large datasets
- Rollback capabilities for failed operations

## Architecture

```
src/relationships/
├── types/                     # TypeScript type definitions
│   └── RelationshipTypes.ts
├── mapping/                   # Relationship definitions
│   └── AutotaskRelationshipDefinitions.ts
├── core/                      # Core relationship mapping
│   └── RelationshipMapper.ts
├── cascade/                   # Cascade operations
│   └── CascadeEngine.ts
├── graph/                     # Graph traversal
│   └── GraphTraversalEngine.ts
├── loading/                   # Smart loading patterns
│   └── SmartLoadingEngine.ts
├── integrity/                 # Data integrity
│   └── DataIntegrityManager.ts
├── batch/                     # Batch processing
│   └── BatchRelationshipProcessor.ts
├── examples/                  # Usage examples
│   └── RelationshipUsageExamples.ts
└── index.ts                   # Main entry point
```

## Quick Start

```typescript
import { AutotaskClient } from '../client/AutotaskClient';
import { AutotaskRelationshipSystem } from './relationships';

// Initialize the client and relationship system
const client = new AutotaskClient({
  apiIntegrationCode: 'your-integration-code',
  username: 'your-username',
  password: 'your-password',
  serverBaseUrl: 'https://webservices2.autotask.net/atservices/1.6/atws.asmx'
});

const relationshipSystem = new AutotaskRelationshipSystem(client, {
  maxCascadeDepth: 5,
  defaultBatchSize: 50,
  enableIntegrityValidation: true,
  cacheEnabled: true
});

await relationshipSystem.initialize();
```

## Usage Examples

### Cascade Create with Related Data

```typescript
// Create a company with related contacts and locations
const companyData = {
  companyName: 'Tech Solutions Inc.',
  companyType: 'Customer',
  phone: '555-123-4567'
};

const relatedData = new Map([
  ['Contacts', [
    {
      firstName: 'John',
      lastName: 'Smith',
      emailAddress: 'john@techsolutions.com',
      title: 'IT Manager'
    }
  ]],
  ['CompanyLocations', [
    {
      name: 'Main Office',
      address1: '123 Business Ave',
      city: 'New York',
      isPrimary: true
    }
  ]]
]);

const result = await relationshipSystem.cascade.cascadeCreate(
  'Companies',
  companyData,
  relatedData
);
```

### Smart Loading with Relationships

```typescript
// Load entity with optimized relationship loading
const result = await relationshipSystem.loading.loadWithRelationships(
  'Companies',
  123,
  {
    includeRelationships: ['contacts', 'tickets', 'projects'],
    loadingStrategy: 'SELECTIVE',
    maxDepth: 2,
    cacheResults: true
  }
);

console.log(`Loaded ${result.relatedData.size} relationships in ${result.loadingStatistics.totalQueryTime}ms`);
```

### Data Integrity Check

```typescript
// Perform comprehensive integrity check
const integrityResult = await relationshipSystem.integrity.performIntegrityCheck({
  entities: ['Companies', 'Contacts', 'Tickets'],
  checkOrphans: true,
  checkReferences: true,
  generateReport: true
});

console.log(`Found ${integrityResult.violations.length} integrity violations`);

// Execute repair plan if issues found
if (integrityResult.repairPlan) {
  await relationshipSystem.integrity.executeRepairPlan(
    integrityResult.repairPlan.repairId,
    { dryRun: false, backupData: true }
  );
}
```

### Batch Operations

```typescript
// Batch delete with cascade operations
const result = await relationshipSystem.batch.batchCascadeDelete(
  'Tickets',
  [1001, 1002, 1003],
  {
    maxConcurrency: 3,
    batchSize: 10,
    safetyChecks: true,
    rollbackOnFailure: true
  }
);
```

### Dependency Analysis

```typescript
// Analyze entity dependencies
const analysis = relationshipSystem.traversal.analyzeDependencies('Companies');

console.log(`${analysis.entityName} has:`);
console.log(`- ${analysis.dependents.length} direct dependents`);
console.log(`- ${analysis.transiteDependents.length} transitive dependents`);
console.log(`- Isolation risk: ${analysis.isolationRisk}`);

// Find shortest path between entities
const paths = relationshipSystem.traversal.findAllPaths('Companies', 'TimeEntries');
console.log(`Found ${paths.length} paths, shortest: ${paths[0]?.distance} steps`);
```

## Configuration

```typescript
const config = {
  // Maximum depth for cascade operations
  maxCascadeDepth: 10,
  
  // Default batch size for operations
  defaultBatchSize: 50,
  
  // Enable circular dependency detection
  enableCircularDependencyDetection: true,
  
  // Enable integrity validation
  enableIntegrityValidation: true,
  
  // Default loading strategy
  defaultLoadingStrategy: 'SELECTIVE' as LoadingStrategy,
  
  // Enable caching
  cacheEnabled: true,
  
  // Cache TTL in milliseconds
  cacheTtl: 300000, // 5 minutes
  
  // Performance monitoring
  performanceMonitoring: true,
  
  // Logging level
  logLevel: 'INFO' as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
  
  // Retry policy
  retryPolicy: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    exponentialBackoff: true
  }
};
```

## Relationship Types Supported

- **ONE_TO_ONE**: Single entity relationships
- **ONE_TO_MANY**: Parent to children relationships (e.g., Company → Contacts)
- **MANY_TO_ONE**: Child to parent relationships (e.g., Contact → Company)
- **MANY_TO_MANY**: Complex relationships through junction entities
- **SELF_REFERENCING**: Entities that reference themselves
- **HIERARCHICAL**: Parent-child hierarchies
- **POLYMORPHIC**: Relationships to multiple entity types

## Loading Strategies

- **EAGER**: Load all relationships immediately
- **LAZY**: Load only high-priority relationships
- **SELECTIVE**: Load specific requested relationships
- **PREFETCH**: Pre-load likely-to-be-accessed relationships
- **ON_DEMAND**: Load relationships when first accessed

## Safety Features

### Cascade Delete Safety Checks
- Validates impact before deletion
- Prevents accidental large-scale deletions
- Provides impact estimates and warnings
- Supports dry-run mode for testing

### Data Integrity Protection
- Detects orphaned records
- Validates referential integrity
- Checks business rule constraints
- Provides automated repair suggestions

### Performance Optimization
- Intelligent batching and concurrency control
- Memory usage optimization
- Query deduplication and caching
- Connection pooling and rate limiting integration

## Monitoring and Metrics

```typescript
// Get system health
const health = relationshipSystem.getSystemHealth();
console.log(`System status: ${health.status}`);
console.log(`Cache hit rate: ${health.metrics.cacheHitRate}%`);

// Validate entire system
const validation = await relationshipSystem.validateSystem();
if (!validation.valid) {
  console.log('Issues found:', validation.issues);
}
```

## Error Handling

The system provides comprehensive error handling with:
- Detailed error codes and messages
- Context-aware error information
- Suggested remediation actions
- Rollback capabilities for failed operations

## Performance Considerations

- **Batch Size**: Adjust based on available memory and network latency
- **Cascade Depth**: Limit depth to prevent excessive operations
- **Concurrency**: Balance between speed and resource usage
- **Caching**: Enable for frequently accessed relationships
- **Loading Strategy**: Choose appropriate strategy for use case

## Integration with Existing Code

The relationship system integrates seamlessly with the existing Autotask client:

```typescript
// Use with existing client methods
const company = await client.get('Companies', 123);

// Enhance with relationship functionality
const enhanced = await relationshipSystem.loading.loadWithRelationships(
  'Companies', 
  123,
  { includeRelationships: ['contacts', 'tickets'] }
);
```

## Testing

The system includes comprehensive examples and can be tested with:

```typescript
import { RelationshipUsageExamples } from './examples/RelationshipUsageExamples';

const examples = new RelationshipUsageExamples(client);
await examples.runAllExamples();
```

## Best Practices

1. **Always use dry-run mode** when testing cascade delete operations
2. **Monitor system health** regularly in production environments
3. **Enable caching** for frequently accessed relationships
4. **Use appropriate loading strategies** based on your access patterns
5. **Run integrity checks** periodically to maintain data quality
6. **Set reasonable cascade depths** to prevent excessive operations
7. **Use batch operations** for high-volume data operations
8. **Implement proper error handling** for all relationship operations

## Troubleshooting

### Common Issues

1. **Circular Dependencies**: Check relationship definitions and use the graph traversal tools to identify cycles
2. **Performance Issues**: Adjust batch sizes, enable caching, and optimize loading strategies
3. **Memory Usage**: Reduce cascade depth and batch sizes for memory-intensive operations
4. **Integrity Violations**: Run regular integrity checks and use automated repair plans

### Debugging

Enable debug logging to get detailed information:

```typescript
const relationshipSystem = new AutotaskRelationshipSystem(client, {
  logLevel: 'DEBUG'
});
```

## Contributing

When adding new relationship definitions:

1. Update `AutotaskRelationshipDefinitions.ts` with new relationships
2. Add appropriate tests for new functionality
3. Update documentation and examples
4. Ensure backward compatibility

## License

This relationship system is part of the Autotask Node.js SDK and follows the same licensing terms.