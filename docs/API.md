# Autotask Node SDK API Reference

A comprehensive TypeScript/Node.js client library for the Autotask REST API with 178 supported entities.

## Table of Contents

- [Client Overview](#client-overview)
- [Authentication](#authentication)
- [Core Entities](#core-entities)
- [Entity Categories](#entity-categories)
- [Query Builder](#query-builder)
- [Error Handling](#error-handling)
- [Performance & Configuration](#performance--configuration)

## Client Overview

The `AutotaskClient` is the main entry point for all API operations, providing automatic zone detection and comprehensive entity access.

### AutotaskClient Class

```typescript
class AutotaskClient {
  static async create(config: AutotaskClientConfig): Promise<AutotaskClient>
  
  // Core entities
  tickets: Tickets
  companies: Companies
  contacts: Contacts
  projects: Projects
  tasks: Tasks
  resources: Resources
  opportunities: Opportunities
  
  // Contract entities
  contracts: Contracts
  contractServices: ContractServices
  contractBillingRules: ContractBillingRules
  
  // Financial entities
  invoices: Invoices
  quotes: Quotes
  purchaseOrders: PurchaseOrders
  billingItems: BillingItems
  
  // Time tracking entities
  timeEntries: TimeEntries
  appointments: Appointments
  
  // Configuration entities
  configurationItems: ConfigurationItems
  
  // And 160+ more entities...
}
```

### Client Configuration

```typescript
interface AutotaskClientConfig {
  username: string
  integrationCode: string
  secret: string
  apiUrl?: string // Optional - auto-detected if not provided
  performanceConfig?: PerformanceConfig
  logger?: winston.Logger
}

interface PerformanceConfig {
  timeout?: number // Default: 30000ms
  retries?: number // Default: 3
  retryDelay?: number // Default: 1000ms
  rateLimitThreshold?: number // Default: 80
  concurrency?: number // Default: 5
}
```

## Authentication

The SDK handles authentication automatically using the provided credentials.

### Credential Setup

```typescript
import { AutotaskClient } from 'autotask-node'

const client = await AutotaskClient.create({
  username: 'your-api-user@domain.com',
  integrationCode: 'YOUR_INTEGRATION_CODE',
  secret: 'YOUR_SECRET'
})
```

### Environment Variables

Set these environment variables for automatic credential loading:

```bash
AUTOTASK_USERNAME=your-api-user@domain.com
AUTOTASK_INTEGRATION_CODE=YOUR_INTEGRATION_CODE
AUTOTASK_SECRET=YOUR_SECRET
AUTOTASK_API_URL=https://webservices.autotask.net/atservicesrest/v1.0 # Optional
```

### Zone Detection

The client automatically detects the correct API zone for your account:

```typescript
// Zone detection happens automatically during client creation
const client = await AutotaskClient.create({
  username: process.env.AUTOTASK_USERNAME!,
  integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
  secret: process.env.AUTOTASK_SECRET!
  // apiUrl is automatically detected
})
```

## Core Entities

### Tickets

The primary entity for support requests and service tickets.

```typescript
interface Ticket {
  id: number
  title: string
  description?: string
  status: number
  priority: number
  ticketType: number
  companyId: number
  contactId?: number
  assignedResourceId?: number
  dueDateTime?: string
  estimatedHours?: number
  completedDateTime?: string
  createDate: string
  lastActivityDate?: string
}

// CRUD Operations
const ticket = await client.tickets.create({
  title: 'Network connectivity issue',
  description: 'User cannot access shared drives',
  companyId: 123,
  status: 1, // New
  priority: 2 // High
})

const tickets = await client.tickets.query()
  .where('status', 'in', [1, 5, 8]) // New, In Progress, Waiting Customer
  .where('priority', 'lte', 2) // High or Critical priority
  .orderBy('dueDateTime', 'asc')
  .execute()

await client.tickets.update(ticket.id, {
  status: 5, // In Progress
  assignedResourceId: 456
})
```

### Companies

Customer organizations and accounts.

```typescript
interface Company {
  id: number
  companyName: string
  companyNumber?: string
  phone?: string
  fax?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  webAddress?: string
  companyType: number
  isActive: boolean
}

// Create a new company
const company = await client.companies.create({
  companyName: 'Acme Corporation',
  companyType: 1, // Customer
  phone: '555-0123',
  address1: '123 Business St',
  city: 'Business City',
  state: 'NY',
  postalCode: '12345',
  isActive: true
})

// Find companies by type
const activeCustomers = await client.companies.query()
  .where('companyType', 'eq', 1)
  .where('isActive', 'eq', true)
  .orderBy('companyName', 'asc')
  .execute()
```

### Contacts

Individual contacts within companies.

```typescript
interface Contact {
  id: number
  companyId: number
  firstName: string
  lastName: string
  title?: string
  emailAddress?: string
  phone?: string
  mobilePhone?: string
  isActive: boolean
  isPrimaryContact?: boolean
}

// Create a contact
const contact = await client.contacts.create({
  companyId: company.id,
  firstName: 'John',
  lastName: 'Doe',
  title: 'IT Manager',
  emailAddress: 'john.doe@acme.com',
  phone: '555-0124',
  isActive: true,
  isPrimaryContact: true
})

// Find contacts for a company
const companyContacts = await client.contacts.query()
  .where('companyId', 'eq', company.id)
  .where('isActive', 'eq', true)
  .execute()
```

### Projects

Client projects and work orders.

```typescript
interface Project {
  id: number
  projectName: string
  companyId: number
  projectNumber?: string
  description?: string
  startDateTime?: string
  endDateTime?: string
  projectManagerResourceId?: number
  status: number
  type: number
  estimatedHours?: number
  actualHours?: number
}

const project = await client.projects.create({
  projectName: 'Network Infrastructure Upgrade',
  companyId: company.id,
  status: 1, // Active
  type: 1, // Fixed Price
  startDateTime: '2024-01-01T00:00:00Z',
  endDateTime: '2024-06-30T23:59:59Z',
  estimatedHours: 200
})
```

### Tasks

Project tasks and work items.

```typescript
interface Task {
  id: number
  title: string
  projectId: number
  assignedResourceId?: number
  status: number
  priority: number
  estimatedHours?: number
  actualHours?: number
  startDateTime?: string
  endDateTime?: string
  description?: string
}

const task = await client.tasks.create({
  title: 'Configure new firewall',
  projectId: project.id,
  status: 1, // New
  priority: 2, // High
  estimatedHours: 8,
  startDateTime: '2024-01-15T09:00:00Z'
})
```

### Resources

Human resources and staff members.

```typescript
interface Resource {
  id: number
  firstName: string
  lastName: string
  userName: string
  email: string
  isActive: boolean
  resourceType: number
  title?: string
  phone?: string
  mobilePhone?: string
}

// Find active resources
const activeResources = await client.resources.query()
  .where('isActive', 'eq', true)
  .where('resourceType', 'eq', 1) // Employee
  .orderBy('lastName', 'asc')
  .orderBy('firstName', 'asc')
  .execute()
```

### Opportunities

Sales opportunities and pipeline management.

```typescript
interface Opportunity {
  id: number
  title: string
  companyId: number
  amount?: number
  cost?: number
  closeDate?: string
  stage: number
  status: number
  probability?: number
  contactId?: number
  ownerResourceId?: number
}

const opportunity = await client.opportunities.create({
  title: 'Managed Services Contract',
  companyId: company.id,
  amount: 50000,
  stage: 1, // Qualification
  status: 1, // Open
  probability: 25,
  closeDate: '2024-03-31'
})
```

## Entity Categories

The SDK organizes 178 entities into logical categories:

### Core Business Entities (7)
Primary entities for daily operations:
- Companies, Contacts, Tickets, Projects, Opportunities, Resources, Tasks

### Contract Management (24)
Contract and service-related entities:
- Contracts, ContractServices, ContractBillingRules, ContractRates, etc.

### Financial Management (19)
Billing, invoicing, and financial entities:
- Invoices, Quotes, PurchaseOrders, BillingItems, Taxes, etc.

### Configuration Management (9)
Asset and configuration management:
- ConfigurationItems, ConfigurationItemTypes, ConfigurationItemCategories, etc.

### Time Tracking (11)
Time management and scheduling:
- TimeEntries, Appointments, Holidays, TimeOffRequests, etc.

### Inventory Management (12)
Product and inventory management:
- Products, InventoryItems, InventoryLocations, ProductVendors, etc.

### Knowledge Management (19)
Documentation and knowledge base:
- Documents, Articles, KnowledgeBaseArticles, etc.

### Attachment Management (12)
File attachments for various entities:
- TicketAttachments, CompanyAttachments, ProjectAttachments, etc.

### Note Management (14)
Notes for various entities:
- TicketNotes, CompanyNotes, ProjectNotes, etc.

### Service Call Management (5)
Field service operations:
- ServiceCalls, ServiceCallTasks, ServiceCallTickets, etc.

### Ticketing Extensions (12)
Extended ticketing functionality:
- TicketCategories, TicketCharges, TicketHistory, etc.

### Organizational Structure (9)
Company and team organization:
- Departments, CompanyTeams, InternalLocations, etc.

### And 10 more categories covering surveys, tags, pricing, associations, etc.

## Query Builder

The SDK includes a powerful query builder for advanced data retrieval.

### Basic Queries

```typescript
// Simple filtering
const results = await client.tickets.query()
  .where('status', 'eq', 1)
  .where('priority', 'ne', 4)
  .execute()

// Multiple conditions
const tickets = await client.tickets.query()
  .where('companyId', 'eq', 123)
  .where('createDate', 'gte', '2024-01-01')
  .where('status', 'in', [1, 5, 8])
  .orderBy('priority', 'asc')
  .orderBy('createDate', 'desc')
  .limit(50)
  .execute()
```

### Advanced Queries

```typescript
// Complex logical grouping
const complexResults = await client.tickets.query()
  .where('companyId', 'eq', 123)
  .and(builder => {
    builder
      .where('priority', 'in', [1, 2]) // High priority
      .or(subBuilder => {
        subBuilder
          .where('status', 'eq', 1) // New tickets
          .where('estimatedHours', 'gt', 10) // Large tickets
      })
  })
  .execute()

// Field selection for performance
const lightweightTickets = await client.tickets.query()
  .select('id', 'title', 'status', 'priority')
  .where('companyId', 'eq', 123)
  .execute()

// Include related entities
const ticketsWithCompany = await client.tickets.query()
  .include('Company', ['companyName', 'phone'])
  .include('AssignedResource', ['firstName', 'lastName'])
  .where('status', 'in', [1, 5])
  .execute()
```

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `.where('status', 'eq', 1)` |
| `ne` | Not equals | `.where('priority', 'ne', 4)` |
| `gt` | Greater than | `.where('estimatedHours', 'gt', 10)` |
| `gte` | Greater than or equal | `.where('createDate', 'gte', '2024-01-01')` |
| `lt` | Less than | `.where('dueDate', 'lt', '2024-12-31')` |
| `lte` | Less than or equal | `.where('priority', 'lte', 2)` |
| `contains` | String contains | `.where('title', 'contains', 'urgent')` |
| `startsWith` | String starts with | `.where('title', 'startsWith', 'URGENT:')` |
| `endsWith` | String ends with | `.where('description', 'endsWith', 'resolved')` |
| `in` | Value in array | `.where('status', 'in', [1, 5, 8])` |
| `notIn` | Value not in array | `.where('priority', 'notIn', [3, 4])` |
| `isNull` | Field is null | `.where('assignedResourceId', 'isNull')` |
| `isNotNull` | Field is not null | `.where('dueDateTime', 'isNotNull')` |
| `between` | Value between two values | `.where('createDate', 'between', ['2024-01-01', '2024-12-31'])` |

### Query Execution Methods

```typescript
// Get all results
const allResults = await query.execute()

// Get first result only
const firstResult = await query.first()

// Get count of matching records
const count = await query.count()

// Check if any records exist
const exists = await query.exists()
```

### Pagination

```typescript
// Page-based pagination
const page1 = await client.tickets.query()
  .where('companyId', 'eq', 123)
  .page(1)
  .pageSize(25)
  .execute()

// Offset-based pagination
const results = await client.tickets.query()
  .offset(50)
  .limit(25)
  .execute()

// Cursor-based pagination (for large datasets)
const cursorResults = await client.tickets.query()
  .cursor('eyJpZCI6MTIzfQ==')
  .pageSize(100)
  .execute()
```

## Error Handling

The SDK provides comprehensive error handling with specific error types.

### Error Types

```typescript
// Configuration errors
try {
  const client = await AutotaskClient.create({
    username: 'invalid',
    integrationCode: 'invalid',
    secret: 'invalid'
  })
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.log('Configuration error:', error.message)
  }
}

// API errors
try {
  const ticket = await client.tickets.create({
    title: 'Test',
    // Missing required fields
  })
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.message)
    console.log('Field errors:', error.fieldErrors)
  } else if (error instanceof RateLimitError) {
    console.log('Rate limit exceeded, retry after:', error.retryAfter)
  } else if (error instanceof AuthenticationError) {
    console.log('Authentication failed:', error.message)
  }
}
```

### Retry Logic

The SDK includes automatic retry logic for transient failures:

```typescript
const client = await AutotaskClient.create({
  username: process.env.AUTOTASK_USERNAME!,
  integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
  secret: process.env.AUTOTASK_SECRET!,
  performanceConfig: {
    retries: 3,
    retryDelay: 1000,
    timeout: 30000
  }
})
```

## Performance & Configuration

### Performance Configuration

```typescript
interface PerformanceConfig {
  timeout: number // Request timeout in milliseconds (default: 30000)
  retries: number // Number of retry attempts (default: 3)
  retryDelay: number // Delay between retries in milliseconds (default: 1000)
  rateLimitThreshold: number // Rate limit threshold percentage (default: 80)
  concurrency: number // Maximum concurrent requests (default: 5)
  enableCompression: boolean // Enable gzip compression (default: true)
  enableCaching: boolean // Enable response caching (default: false)
}
```

### Memory Management

The SDK includes memory optimization for large datasets:

```typescript
// Stream processing for large datasets
for await (const batch of client.tickets.query().stream({ batchSize: 100 })) {
  console.log(`Processing batch of ${batch.length} tickets`)
  // Process each batch to avoid memory issues
}

// Field selection to reduce payload size
const lightweightData = await client.tickets.query()
  .select('id', 'title', 'status') // Only essential fields
  .where('companyId', 'eq', 123)
  .execute()
```

### Logging

Configure logging for debugging and monitoring:

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'autotask.log' })
  ]
})

const client = await AutotaskClient.create({
  username: process.env.AUTOTASK_USERNAME!,
  integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
  secret: process.env.AUTOTASK_SECRET!,
  logger
})
```

## Rate Limiting

The SDK automatically handles Autotask API rate limits:

- Monitors rate limit headers
- Implements exponential backoff
- Provides rate limit status information
- Queues requests when approaching limits

```typescript
// Rate limit information is available on the client
console.log('Rate limit status:', await client.getRateLimitStatus())

// Configure rate limit behavior
const client = await AutotaskClient.create({
  username: process.env.AUTOTASK_USERNAME!,
  integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
  secret: process.env.AUTOTASK_SECRET!,
  performanceConfig: {
    rateLimitThreshold: 80, // Start throttling at 80% of limit
    rateLimitBuffer: 10 // Keep 10% buffer
  }
})
```

---

This API reference covers the core functionality of the Autotask Node SDK. For more detailed examples and advanced usage patterns, see the [Examples documentation](./EXAMPLES.md) and [Query Builder guide](./QUERY_BUILDER.md).