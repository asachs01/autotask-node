# Advanced Query Builder

The Autotask API Wrapper now includes a powerful, type-safe query builder that revolutionizes how you interact with the Autotask API. This advanced system provides a fluent interface for building complex queries with full TypeScript support.

## 🚀 Key Features

- **Type-Safe Fluent API**: Build queries with full TypeScript intellisense and compile-time validation
- **Complex Filtering**: Support for all comparison operators with logical grouping (AND/OR)
- **Advanced Sorting**: Multi-field sorting with ascending/descending directions
- **Field Selection**: Optimize performance by selecting only needed fields
- **Related Entity Includes**: Fetch related data in a single query with field specification
- **Comprehensive Pagination**: Both offset-based and cursor-based pagination support
- **Performance Optimization**: Built-in memory management and efficient data handling
- **Robust Error Handling**: Structured error handling with retry logic
- **Extensive Testing**: 460+ tests ensuring reliability and correctness

## 📋 Quick Start

### Basic Usage

```typescript
import { TicketsEnhanced } from './src/entities/ticketsEnhanced';

const tickets = new TicketsEnhanced(axios, logger);

// Simple query
const openTickets = await tickets
  .query()
  .where('status', 'eq', 1)
  .where('priority', 'ne', 4)
  .orderBy('createdDate', 'desc')
  .limit(10)
  .execute();
```

### Complex Filtering

```typescript
// Complex query with logical grouping
const complexResults = await tickets
  .query()
  .where('accountId', 'eq', 123)
  .and(builder => {
    builder
      .where('priority', 'in', [1, 2]) // High priority
      .or(subBuilder => {
        subBuilder
          .where('status', 'eq', 1) // New tickets
          .where('estimatedHours', 'gt', 10); // Large tickets
      });
  })
  .execute();
```

## 🔍 Comparison Operators

The query builder supports all standard comparison operators:

| Operator     | Description              | Example                                                          |
| ------------ | ------------------------ | ---------------------------------------------------------------- |
| `eq`         | Equals                   | `.where('status', 'eq', 1)`                                      |
| `ne`         | Not equals               | `.where('priority', 'ne', 4)`                                    |
| `gt`         | Greater than             | `.where('estimatedHours', 'gt', 10)`                             |
| `gte`        | Greater than or equal    | `.where('createdDate', 'gte', '2024-01-01')`                     |
| `lt`         | Less than                | `.where('dueDate', 'lt', '2024-12-31')`                          |
| `lte`        | Less than or equal       | `.where('priority', 'lte', 2)`                                   |
| `contains`   | String contains          | `.where('title', 'contains', 'urgent')`                          |
| `startsWith` | String starts with       | `.where('title', 'startsWith', 'URGENT:')`                       |
| `endsWith`   | String ends with         | `.where('description', 'endsWith', 'resolved')`                  |
| `in`         | Value in array           | `.where('status', 'in', [1, 5, 8])`                              |
| `notIn`      | Value not in array       | `.where('priority', 'notIn', [3, 4])`                            |
| `isNull`     | Field is null            | `.where('assignedResourceId', 'isNull')`                         |
| `isNotNull`  | Field is not null        | `.where('dueDateTime', 'isNotNull')`                             |
| `between`    | Value between two values | `.where('createdDate', 'between', ['2024-01-01', '2024-12-31'])` |

## 🔗 Logical Grouping

Build complex logical conditions with nested AND/OR groups:

```typescript
const results = await tickets
  .query()
  .where('accountId', 'eq', 123)
  .and(builder => {
    builder
      .where('priority', 'eq', 1) // Critical priority
      .or(subBuilder => {
        subBuilder
          .where('status', 'eq', 1) // New status
          .where('estimatedHours', 'gt', 20); // Large effort
      });
  })
  .execute();
```

## 📊 Sorting and Field Selection

### Multi-field Sorting

```typescript
const sortedResults = await tickets
  .query()
  .orderBy('priority', 'asc') // Primary sort
  .orderBy('createdDate', 'desc') // Secondary sort
  .orderBy('id', 'asc') // Tertiary sort
  .execute();

// Convenience method for descending
const recentFirst = await tickets.query().orderByDesc('createdDate').execute();
```

### Field Selection

Optimize performance by selecting only needed fields:

```typescript
const optimizedResults = await tickets
  .query()
  .select('id', 'title', 'status', 'priority')
  .where('accountId', 'eq', 123)
  .execute();
```

## 🔄 Related Entity Includes

Fetch related data in a single query:

```typescript
const ticketsWithRelated = await tickets
  .query()
  .include('Account', ['name', 'email']) // Include account info
  .include('AssignedResource', ['firstName', 'lastName']) // Include assignee info
  .include('Project', ['name', 'status'], 'projectInfo') // Include with alias
  .where('status', 'in', [1, 5, 8])
  .execute();
```

## 📄 Pagination

### Offset-based Pagination

```typescript
// Page-based pagination
const page1 = await tickets
  .query()
  .where('accountId', 'eq', 123)
  .page(1)
  .pageSize(25)
  .execute();

// Offset-based pagination
const results = await tickets
  .query()
  .where('accountId', 'eq', 123)
  .offset(50)
  .limit(25)
  .execute();
```

### Cursor-based Pagination

For large datasets and better performance:

```typescript
const results = await tickets
  .query()
  .where('createdDate', 'gte', '2024-01-01')
  .orderBy('createdDate', 'asc')
  .cursor('eyJpZCI6MTIzfQ==') // Base64 encoded cursor
  .pageSize(100)
  .execute();
```

## ⚡ Query Execution Methods

### Execute Queries

```typescript
// Get all results
const allResults = await query.execute();

// Get first result only
const firstResult = await query.first();

// Get count of matching records
const count = await query.count();

// Check if any records exist
const exists = await query.exists();
```

## 🛠️ Query Utilities

### Clone and Modify Queries

```typescript
const baseQuery = tickets
  .query()
  .where('accountId', 'eq', 123)
  .orderBy('createdDate', 'desc');

// Clone for different variations
const openTickets = baseQuery.clone().where('status', 'in', [1, 5, 8]);

const closedTickets = baseQuery.clone().where('status', 'eq', 5);
```

### Reset Queries

```typescript
const query = tickets
  .query()
  .where('status', 'eq', 1)
  .orderBy('createdDate', 'desc');

// Reset to start over
query.reset();
query.where('priority', 'eq', 1);
```

### Query Specifications

Get the raw query specification for debugging:

```typescript
const querySpec = query.toQuerySpec();
console.log('Query Spec:', JSON.stringify(querySpec, null, 2));
```

## 🎯 Specialized Query Methods

The enhanced entities provide specialized methods for common operations:

```typescript
// High-level convenience methods
const highPriorityTickets = await tickets.findHighPriorityTickets();
const overdueTickets = await tickets.findOverdueTickets();
const ticketStats = await tickets.getTicketStats();
const searchResults = await tickets.searchTickets('urgent issue');

// Account-specific queries
const accountTickets = await tickets.findTicketsByAccount(123);
const openAccountTickets = await tickets.findOpenTicketsForResource(456);

// Date range queries
const recentTickets = await tickets.findTicketsInDateRange(
  '2024-01-01',
  '2024-12-31'
);

// Complex business logic
const complexTickets = await tickets.findTicketsWithComplexConditions({
  minPriority: 1,
  maxEstimatedHours: 40,
  excludeStatuses: [5, 6],
});
```

## 🏗️ Extending Entities with Query Builder

To add query builder capabilities to your entities, extend the `QueryableEntity` base class:

```typescript
import { QueryableEntity } from '../utils/queryableEntity';
import { IQueryBuilder } from '../types/queryBuilder';

export class MyEntity extends QueryableEntity<MyEntityType> {
  protected endpoint = '/MyEntities';
  protected entityName = 'MyEntity';

  constructor(axios: AxiosInstance, logger: winston.Logger) {
    super(axios, logger);
  }

  // Add specialized query methods
  async findActiveItems(): Promise<QueryResult<MyEntityType>> {
    return this.query()
      .where('isActive', 'eq', true)
      .orderBy('name', 'asc')
      .execute();
  }

  // Convenience method using base class
  async findByStatus(status: string): Promise<QueryResult<MyEntityType>> {
    return this.where('status', 'eq', status).execute();
  }
}
```

## 🔧 Error Handling

The query builder includes comprehensive error handling:

```typescript
try {
  const results = await tickets
    .query()
    .where('invalidField', 'eq', 'value') // This would be caught at compile time
    .execute();
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Query validation failed:', error.message);
  } else if (error instanceof RateLimitError) {
    console.log('Rate limit exceeded, retrying...');
  } else {
    console.log('Query execution failed:', error.message);
  }
}
```

## 📈 Performance Considerations

### Memory Optimization

The query builder includes built-in memory optimization:

```typescript
// Automatic memory management for large datasets
const largeDataset = await tickets
  .query()
  .where('createdDate', 'gte', '2020-01-01')
  .pageSize(1000) // Larger page size for efficiency
  .execute();

// Stream processing for very large datasets
for await (const batch of tickets.query().stream()) {
  // Process each batch
  console.log(`Processing batch of ${batch.length} tickets`);
}
```

### Field Selection for Performance

```typescript
// Only select needed fields to reduce payload size
const lightweightResults = await tickets
  .query()
  .select('id', 'title', 'status') // Minimal fields
  .where('accountId', 'eq', 123)
  .limit(1000)
  .execute();
```

## 🧪 Testing

The query builder is extensively tested with 460+ tests covering:

- All comparison operators
- Logical grouping scenarios
- Sorting and pagination
- Field selection and includes
- Error handling
- Performance optimization
- Type safety validation

Run the tests:

```bash
npm test -- test/utils/queryBuilder.test.ts
npm test -- test/entities/ticketsEnhanced.test.ts
```

## 📚 Examples

See the comprehensive demonstration script:

```bash
npx ts-node examples/query-builder-demo.ts
```

This script showcases all query builder features with real-world examples.

## 🔮 Future Enhancements

The query builder foundation enables future enhancements:

- **Query Caching**: Intelligent caching of frequently used queries
- **Query Optimization**: Automatic query optimization based on usage patterns
- **Real-time Subscriptions**: WebSocket-based real-time query subscriptions
- **Advanced Analytics**: Built-in analytics and reporting capabilities
- **GraphQL Integration**: GraphQL-style query capabilities

---

The Advanced Query Builder represents a major leap forward in developer experience and API interaction efficiency. With its type-safe design, comprehensive feature set, and extensive testing, it provides a solid foundation for building sophisticated Autotask integrations.
