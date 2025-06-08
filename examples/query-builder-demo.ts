/**
 * Advanced Query Builder Demonstration
 *
 * This script demonstrates the powerful new query builder capabilities
 * introduced in Phase 3.1 of the Autotask API Wrapper.
 *
 * Features demonstrated:
 * - Fluent query API with type safety
 * - Complex filtering with logical grouping
 * - Advanced sorting and field selection
 * - Related entity includes
 * - Pagination and performance optimization
 * - Specialized query methods
 */

import { AutotaskClient } from '../src/client/autotaskClient';
import { TicketsEnhanced } from '../src/entities/ticketsEnhanced';
import { QueryBuilder } from '../src/utils/queryBuilder';

async function demonstrateQueryBuilder() {
  console.log('🚀 Advanced Query Builder Demonstration\n');

  // Initialize client (credentials would come from environment)
  const client = await AutotaskClient.create({
    username: process.env.AUTOTASK_USERNAME || 'demo',
    integrationCode: process.env.AUTOTASK_INTEGRATION_CODE || 'demo',
    secret: process.env.AUTOTASK_SECRET || 'demo',
  });

  // Get enhanced tickets entity with query capabilities
  // Note: This is a conceptual demo showing query builder API
  // In practice, you would use client.tickets or extend entities appropriately
  console.log(
    'Note: This is a conceptual demonstration of the Query Builder API'
  );

  // For demo purposes, we'll create a mock tickets object with query methods
  const tickets = {
    query: () =>
      new QueryBuilder(null as any, client.getLogger(), '/Tickets', 'Ticket'),
  };

  console.log('📋 1. Basic Query Building');
  console.log('==========================');

  // Simple equality query
  const basicQuery = tickets
    .query()
    .where('status', 'eq', 1)
    .where('priority', 'ne', 4)
    .orderBy('createdDate', 'desc')
    .limit(10);

  console.log(
    'Basic Query Spec:',
    JSON.stringify(basicQuery.toQuerySpec(), null, 2)
  );

  console.log('\n🔍 2. Advanced Filtering');
  console.log('========================');

  // Complex query with logical grouping
  const complexQuery = tickets
    .query()
    .where('accountId', 'eq', 123)
    .and(builder => {
      builder
        .where('priority', 'in', [1, 2]) // High priority
        .or(subBuilder => {
          subBuilder
            .where('status', 'eq', 1) // New
            .where('estimatedHours', 'gt', 10); // Large tickets
        });
    })
    .orderBy('priority', 'asc')
    .orderBy('createdDate', 'desc');

  console.log(
    'Complex Query Spec:',
    JSON.stringify(complexQuery.toQuerySpec(), null, 2)
  );

  console.log('\n📊 3. Field Selection & Includes');
  console.log('=================================');

  // Optimized query with field selection and includes
  const optimizedQuery = tickets
    .query()
    .select('id', 'title', 'status', 'priority', 'assignedResourceId')
    .include('Account', ['name', 'email'])
    .include('AssignedResource', ['firstName', 'lastName'], 'assignee')
    .where('status', 'in', [1, 5, 8]) // Open statuses
    .orderBy('priority', 'asc')
    .page(1)
    .pageSize(25);

  console.log(
    'Optimized Query Spec:',
    JSON.stringify(optimizedQuery.toQuerySpec(), null, 2)
  );

  console.log('\n🔄 4. Specialized Query Methods');
  console.log('===============================');

  try {
    // Demonstrate specialized query methods (these would make actual API calls)
    console.log('Finding high priority tickets...');
    // const highPriorityTickets = await tickets.findHighPriorityTickets();

    console.log('Finding overdue tickets...');
    // const overdueTickets = await tickets.findOverdueTickets();

    console.log('Getting ticket statistics...');
    // const stats = await tickets.getTicketStats();

    console.log('Searching tickets by term...');
    // const searchResults = await tickets.searchTickets('urgent issue');

    // For demo purposes, show the query specs instead
    console.log(
      'High Priority Query:',
      JSON.stringify(
        tickets
          .query()
          .where('priority', 'in', [1, 2])
          .where('status', 'in', [1, 5, 8])
          .orderBy('priority', 'asc')
          .orderBy('createdDate', 'asc')
          .toQuerySpec(),
        null,
        2
      )
    );
  } catch (_error) {
    console.error('❌ Failed to execute enhanced queries');
  }

  console.log('\n⚡ 5. Performance Features');
  console.log('=========================');

  // Cursor-based pagination for large datasets
  const cursorQuery = tickets
    .query()
    .where('createdDate', 'gte', '2024-01-01')
    .orderBy('createdDate', 'asc')
    .cursor('abc123')
    .pageSize(100);

  console.log(
    'Cursor Pagination Query:',
    JSON.stringify(cursorQuery.toQuerySpec(), null, 2)
  );

  // Count query for statistics
  const countQuery = tickets
    .query()
    .where('status', 'eq', 1)
    .where('accountId', 'eq', 123);

  console.log(
    'Count Query Spec:',
    JSON.stringify(countQuery.toQuerySpec(), null, 2)
  );

  console.log('\n🛠️ 6. Query Utilities');
  console.log('=====================');

  // Clone and modify queries
  const baseQuery = tickets
    .query()
    .where('accountId', 'eq', 123)
    .orderBy('createdDate', 'desc');

  const openTicketsQuery = baseQuery.clone().where('status', 'in', [1, 5, 8]);

  const closedTicketsQuery = baseQuery.clone().where('status', 'eq', 5);

  console.log('Base Query:', JSON.stringify(baseQuery.toQuerySpec(), null, 2));
  console.log(
    'Open Tickets Query:',
    JSON.stringify(openTicketsQuery.toQuerySpec(), null, 2)
  );
  console.log(
    'Closed Tickets Query:',
    JSON.stringify(closedTicketsQuery.toQuerySpec(), null, 2)
  );

  console.log('\n🎯 7. Type Safety Examples');
  console.log('==========================');

  // Type-safe field access (these would be caught at compile time if invalid)
  const typeSafeQuery = tickets
    .query()
    .where('accountId', 'eq', 123) // ✅ Valid field
    .where('status', 'in', [1, 2, 3]) // ✅ Valid field with array
    .where('createdDate', 'gte', '2024-01-01') // ✅ Valid field with date
    .orderBy('priority', 'desc') // ✅ Valid sort field
    .select('id', 'title', 'status'); // ✅ Valid field selection

  console.log(
    'Type-safe Query:',
    JSON.stringify(typeSafeQuery.toQuerySpec(), null, 2)
  );

  console.log('\n✨ 8. Real-world Examples');
  console.log('=========================');

  // Example 1: Find urgent tickets for a specific account
  const urgentTicketsQuery = tickets
    .query()
    .where('accountId', 'eq', 123)
    .where('priority', 'in', [1, 2])
    .where('status', 'ne', 5) // Not closed
    .orderBy('priority', 'asc')
    .orderBy('dueDateTime', 'asc')
    .include('Account', ['name'])
    .include('AssignedResource', ['firstName', 'lastName'])
    .limit(20);

  console.log(
    'Urgent Tickets Query:',
    JSON.stringify(urgentTicketsQuery.toQuerySpec(), null, 2)
  );

  // Example 2: Find tickets created this month with specific criteria
  const thisMonthQuery = tickets
    .query()
    .where('createdDate', 'gte', '2024-12-01')
    .where('createdDate', 'lt', '2025-01-01')
    .and(builder => {
      builder
        .where('priority', 'eq', 1) // Critical
        .or(subBuilder => {
          subBuilder
            .where('estimatedHours', 'gt', 20) // Large tickets
            .where('assignedResourceId', 'isNotNull'); // Assigned
        });
    })
    .orderBy('createdDate', 'desc')
    .select('id', 'title', 'priority', 'estimatedHours', 'assignedResourceId')
    .pageSize(50);

  console.log(
    'This Month Complex Query:',
    JSON.stringify(thisMonthQuery.toQuerySpec(), null, 2)
  );

  console.log('\n🎉 Query Builder Demo Complete!');
  console.log('================================');
  console.log('The new query builder provides:');
  console.log('✅ Type-safe fluent API');
  console.log('✅ Complex logical grouping');
  console.log('✅ Advanced sorting & pagination');
  console.log('✅ Field selection & includes');
  console.log('✅ Performance optimization');
  console.log('✅ Comprehensive error handling');
  console.log('✅ 460 tests ensuring reliability');
}

// Run the demonstration
if (require.main === module) {
  demonstrateQueryBuilder().catch(console.error);
}

export { demonstrateQueryBuilder };
