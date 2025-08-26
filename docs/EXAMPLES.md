# Autotask Node SDK Examples

This document provides real-world examples and common usage patterns for the Autotask Node SDK.

## Table of Contents

- [Setup and Authentication](#setup-and-authentication)
- [Basic CRUD Operations](#basic-crud-operations)
- [Advanced Query Examples](#advanced-query-examples)
- [Real-World Scenarios](#real-world-scenarios)
- [Integration Patterns](#integration-patterns)
- [Error Handling Examples](#error-handling-examples)
- [Performance Optimization](#performance-optimization)
- [CLI Usage Examples](#cli-usage-examples)

## Setup and Authentication

### Basic Setup

```typescript
import { AutotaskClient } from 'autotask-node'

// Using environment variables (recommended)
const client = await AutotaskClient.create({
  username: process.env.AUTOTASK_USERNAME!,
  integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
  secret: process.env.AUTOTASK_SECRET!
})

// Direct configuration
const client = await AutotaskClient.create({
  username: 'api-user@yourcompany.com',
  integrationCode: 'ABC123DEF456',
  secret: 'your-secret-key'
})
```

### Advanced Configuration

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'autotask.log' })
  ]
})

const client = await AutotaskClient.create({
  username: process.env.AUTOTASK_USERNAME!,
  integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
  secret: process.env.AUTOTASK_SECRET!,
  performanceConfig: {
    timeout: 45000, // 45 second timeout
    retries: 5, // More retry attempts
    retryDelay: 2000, // 2 second delay between retries
    rateLimitThreshold: 70, // More conservative rate limiting
    concurrency: 3 // Limit concurrent requests
  },
  logger
})
```

## Basic CRUD Operations

### Companies

```typescript
// Create a new company
const company = await client.companies.create({
  companyName: 'Acme Corporation',
  companyType: 1, // Customer
  phone: '555-123-4567',
  address1: '123 Business Street',
  city: 'Business City',
  state: 'NY',
  postalCode: '10001',
  isActive: true
})

// Update company information
const updatedCompany = await client.companies.update(company.id, {
  phone: '555-987-6543',
  webAddress: 'https://www.acme.com'
})

// Find companies by type
const customers = await client.companies.query()
  .where('companyType', 'eq', 1)
  .where('isActive', 'eq', true)
  .orderBy('companyName', 'asc')
  .execute()

// Get company with related data
const companyWithTickets = await client.companies.query()
  .where('id', 'eq', company.id)
  .include('Tickets', ['id', 'title', 'status'])
  .first()
```

### Contacts

```typescript
// Create contacts for the company
const contacts = [
  {
    companyId: company.id,
    firstName: 'John',
    lastName: 'Doe',
    title: 'IT Manager',
    emailAddress: 'john.doe@acme.com',
    phone: '555-123-4567',
    isActive: true,
    isPrimaryContact: true
  },
  {
    companyId: company.id,
    firstName: 'Jane',
    lastName: 'Smith',
    title: 'CFO',
    emailAddress: 'jane.smith@acme.com',
    phone: '555-123-4568',
    isActive: true,
    isPrimaryContact: false
  }
]

const createdContacts = await Promise.all(
  contacts.map(contact => client.contacts.create(contact))
)

// Find primary contacts across all companies
const primaryContacts = await client.contacts.query()
  .where('isPrimaryContact', 'eq', true)
  .where('isActive', 'eq', true)
  .include('Company', ['companyName', 'phone'])
  .orderBy('lastName', 'asc')
  .execute()
```

### Tickets

```typescript
// Create a high-priority ticket
const urgentTicket = await client.tickets.create({
  title: 'Critical server outage',
  description: 'The main file server is down. Users cannot access shared files.',
  companyId: company.id,
  contactId: createdContacts[0].id,
  status: 1, // New
  priority: 1, // Critical
  ticketType: 1, // Service Request
  dueDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // Due in 2 hours
})

// Assign ticket to a resource
const assignedTicket = await client.tickets.update(urgentTicket.id, {
  status: 5, // In Progress
  assignedResourceId: 123 // Resource ID
})

// Create a routine maintenance ticket
const maintenanceTicket = await client.tickets.create({
  title: 'Monthly server maintenance',
  description: 'Perform routine maintenance on all servers',
  companyId: company.id,
  status: 1,
  priority: 3, // Medium
  ticketType: 2, // Change Request
  estimatedHours: 4
})
```

## Advanced Query Examples

### Complex Filtering

```typescript
// Find high-priority open tickets assigned to specific resources
const criticalTickets = await client.tickets.query()
  .where('priority', 'lte', 2) // Critical or High priority
  .where('status', 'in', [1, 5, 8]) // New, In Progress, or Waiting Customer
  .where('assignedResourceId', 'in', [123, 456, 789])
  .and(builder => {
    builder
      .where('dueDateTime', 'isNotNull')
      .where('dueDateTime', 'gte', new Date().toISOString())
  })
  .orderBy('priority', 'asc')
  .orderBy('dueDateTime', 'asc')
  .execute()

// Find overdue tickets with complex conditions
const overdueTickets = await client.tickets.query()
  .where('dueDateTime', 'lt', new Date().toISOString())
  .where('status', 'ne', 5) // Not Complete
  .and(builder => {
    builder
      .where('priority', 'lte', 2) // High priority
      .or(subBuilder => {
        subBuilder
          .where('companyId', 'in', [123, 456]) // Important customers
          .where('estimatedHours', 'gt', 8) // Large tickets
      })
  })
  .include('Company', ['companyName'])
  .include('AssignedResource', ['firstName', 'lastName'])
  .execute()
```

### Reporting Queries

```typescript
// Ticket statistics by company
const ticketStats = await client.tickets.query()
  .where('createDate', 'gte', '2024-01-01')
  .where('createDate', 'lt', '2024-02-01')
  .select('companyId', 'status', 'priority')
  .execute()

// Group by company and status (client-side processing)
const statsByCompany = ticketStats.reduce((acc, ticket) => {
  const key = `${ticket.companyId}-${ticket.status}`
  acc[key] = (acc[key] || 0) + 1
  return acc
}, {} as Record<string, number>)

// Time entry summary for billing
const timeEntries = await client.timeEntries.query()
  .where('dateWorked', 'between', ['2024-01-01', '2024-01-31'])
  .where('billableToAccount', 'eq', true)
  .select('resourceId', 'hoursWorked', 'billingCodeId', 'taskId', 'ticketId')
  .include('Resource', ['firstName', 'lastName'])
  .execute()

const billableHoursByResource = timeEntries.reduce((acc, entry) => {
  const resourceId = entry.resourceId
  acc[resourceId] = (acc[resourceId] || 0) + entry.hoursWorked
  return acc
}, {} as Record<number, number>)
```

### Pagination Examples

```typescript
// Process all tickets in batches
let page = 1
const pageSize = 100
let hasMore = true

while (hasMore) {
  const tickets = await client.tickets.query()
    .where('status', 'in', [1, 5, 8])
    .page(page)
    .pageSize(pageSize)
    .execute()
  
  console.log(`Processing page ${page}: ${tickets.items.length} tickets`)
  
  // Process tickets
  for (const ticket of tickets.items) {
    console.log(`Processing ticket ${ticket.id}: ${ticket.title}`)
  }
  
  hasMore = tickets.pageDetails.nextPageUrl != null
  page++
}

// Stream processing for large datasets
for await (const batch of client.tickets.query()
  .where('createDate', 'gte', '2023-01-01')
  .stream({ batchSize: 250 })) {
  
  console.log(`Processing batch of ${batch.length} tickets`)
  
  // Process each batch to avoid memory issues
  await processBatch(batch)
}

async function processBatch(tickets: any[]) {
  // Your batch processing logic here
  return Promise.all(tickets.map(ticket => processTicket(ticket)))
}
```

## Real-World Scenarios

### Customer Onboarding

```typescript
async function onboardNewCustomer(customerData: {
  companyName: string
  primaryContact: {
    firstName: string
    lastName: string
    email: string
    phone: string
    title: string
  }
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
}) {
  try {
    // 1. Create the company
    const company = await client.companies.create({
      companyName: customerData.companyName,
      companyType: 1, // Customer
      address1: customerData.address.street,
      city: customerData.address.city,
      state: customerData.address.state,
      postalCode: customerData.address.zip,
      isActive: true
    })

    // 2. Create the primary contact
    const contact = await client.contacts.create({
      companyId: company.id,
      firstName: customerData.primaryContact.firstName,
      lastName: customerData.primaryContact.lastName,
      emailAddress: customerData.primaryContact.email,
      phone: customerData.primaryContact.phone,
      title: customerData.primaryContact.title,
      isActive: true,
      isPrimaryContact: true
    })

    // 3. Create welcome ticket
    const welcomeTicket = await client.tickets.create({
      title: `Welcome to our services - ${customerData.companyName}`,
      description: 'Initial setup and onboarding tasks',
      companyId: company.id,
      contactId: contact.id,
      status: 1, // New
      priority: 3, // Medium
      ticketType: 4 // Internal
    })

    // 4. Create onboarding project
    const onboardingProject = await client.projects.create({
      projectName: `${customerData.companyName} - Onboarding`,
      companyId: company.id,
      status: 1, // Active
      type: 2, // Time & Materials
      startDateTime: new Date().toISOString()
    })

    console.log(`Successfully onboarded ${customerData.companyName}`)
    console.log(`Company ID: ${company.id}`)
    console.log(`Contact ID: ${contact.id}`)
    console.log(`Welcome Ticket ID: ${welcomeTicket.id}`)
    console.log(`Onboarding Project ID: ${onboardingProject.id}`)

    return {
      company,
      contact,
      welcomeTicket,
      onboardingProject
    }
  } catch (error) {
    console.error('Failed to onboard customer:', error)
    throw error
  }
}

// Usage
await onboardNewCustomer({
  companyName: 'TechStart Inc',
  primaryContact: {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@techstart.com',
    phone: '555-999-0000',
    title: 'IT Director'
  },
  address: {
    street: '456 Innovation Drive',
    city: 'Tech City',
    state: 'CA',
    zip: '94101'
  }
})
```

### Ticket Escalation Workflow

```typescript
async function escalateTickets() {
  // Find tickets that should be escalated
  const candidateTickets = await client.tickets.query()
    .where('status', 'in', [1, 8]) // New or Waiting Customer
    .where('priority', 'gte', 2) // High or Critical priority
    .where('createDate', 'lt', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // Older than 2 hours
    .include('Company', ['companyName'])
    .include('Contact', ['firstName', 'lastName', 'emailAddress'])
    .execute()

  for (const ticket of candidateTickets.items) {
    try {
      // Check if ticket already has escalation note
      const existingNotes = await client.ticketNotes.query()
        .where('ticketId', 'eq', ticket.id)
        .where('title', 'contains', 'ESCALATED')
        .execute()

      if (existingNotes.items.length > 0) {
        continue // Already escalated
      }

      // Escalate the ticket
      await client.tickets.update(ticket.id, {
        priority: Math.max(1, ticket.priority - 1), // Increase priority
        status: 5 // In Progress
      })

      // Add escalation note
      await client.ticketNotes.create({
        ticketId: ticket.id,
        title: 'ESCALATED - Automatic Priority Increase',
        description: `This ticket has been automatically escalated due to age (${Math.round((Date.now() - new Date(ticket.createDate).getTime()) / (1000 * 60 * 60))} hours old) and priority level.`,
        noteType: 1, // Internal
        publish: 2 // Internal only
      })

      console.log(`Escalated ticket ${ticket.id}: ${ticket.title}`)
    } catch (error) {
      console.error(`Failed to escalate ticket ${ticket.id}:`, error)
    }
  }
}

// Run escalation check every 30 minutes
setInterval(escalateTickets, 30 * 60 * 1000)
```

### Automated Time Entry Reporting

```typescript
async function generateTimeReport(startDate: string, endDate: string, resourceId?: number) {
  try {
    const query = client.timeEntries.query()
      .where('dateWorked', 'between', [startDate, endDate])
      .include('Resource', ['firstName', 'lastName'])
      .include('Task', ['title', 'projectId'])
      .include('Ticket', ['title', 'companyId'])

    if (resourceId) {
      query.where('resourceId', 'eq', resourceId)
    }

    const timeEntries = await query.execute()

    // Process and categorize time entries
    const report = {
      totalHours: 0,
      billableHours: 0,
      nonBillableHours: 0,
      byResource: {} as Record<string, any>,
      byProject: {} as Record<string, number>,
      byCompany: {} as Record<string, number>
    }

    for (const entry of timeEntries.items) {
      const resourceName = `${entry.Resource?.firstName} ${entry.Resource?.lastName}`
      
      report.totalHours += entry.hoursWorked
      
      if (entry.billableToAccount) {
        report.billableHours += entry.hoursToBill || entry.hoursWorked
      } else {
        report.nonBillableHours += entry.hoursWorked
      }

      // Group by resource
      if (!report.byResource[resourceName]) {
        report.byResource[resourceName] = {
          totalHours: 0,
          billableHours: 0,
          entries: []
        }
      }
      report.byResource[resourceName].totalHours += entry.hoursWorked
      report.byResource[resourceName].billableHours += entry.billableToAccount ? (entry.hoursToBill || entry.hoursWorked) : 0
      report.byResource[resourceName].entries.push(entry)

      // Group by project (if task-related)
      if (entry.Task?.projectId) {
        report.byProject[entry.Task.projectId] = (report.byProject[entry.Task.projectId] || 0) + entry.hoursWorked
      }

      // Group by company (if ticket-related)
      if (entry.Ticket?.companyId) {
        report.byCompany[entry.Ticket.companyId] = (report.byCompany[entry.Ticket.companyId] || 0) + entry.hoursWorked
      }
    }

    console.log('Time Report Summary:')
    console.log(`Total Hours: ${report.totalHours}`)
    console.log(`Billable Hours: ${report.billableHours}`)
    console.log(`Non-Billable Hours: ${report.nonBillableHours}`)
    console.log(`Utilization Rate: ${((report.billableHours / report.totalHours) * 100).toFixed(1)}%`)

    return report
  } catch (error) {
    console.error('Failed to generate time report:', error)
    throw error
  }
}

// Generate weekly report for all resources
const weeklyReport = await generateTimeReport(
  '2024-01-15',
  '2024-01-21'
)

// Generate report for specific resource
const resourceReport = await generateTimeReport(
  '2024-01-01',
  '2024-01-31',
  123 // Resource ID
)
```

### Configuration Item Management

```typescript
async function auditConfigurationItems(companyId: number) {
  // Get all active configuration items for the company
  const configItems = await client.configurationItems.query()
    .where('companyId', 'eq', companyId)
    .where('isActive', 'eq', true)
    .include('ConfigurationItemType', ['name'])
    .include('ConfigurationItemCategory', ['name'])
    .orderBy('configurationItemName', 'asc')
    .execute()

  const audit = {
    totalItems: configItems.items.length,
    byType: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    expiredWarranties: [] as any[],
    missingSerialNumbers: [] as any[],
    upcomingWarrantyExpirations: [] as any[]
  }

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  for (const item of configItems.items) {
    // Count by type
    const typeName = item.ConfigurationItemType?.name || 'Unknown'
    audit.byType[typeName] = (audit.byType[typeName] || 0) + 1

    // Count by category
    const categoryName = item.ConfigurationItemCategory?.name || 'Uncategorized'
    audit.byCategory[categoryName] = (audit.byCategory[categoryName] || 0) + 1

    // Check for expired warranties
    if (item.warrantyExpirationDate) {
      const warrantyDate = new Date(item.warrantyExpirationDate)
      if (warrantyDate < new Date()) {
        audit.expiredWarranties.push(item)
      } else if (warrantyDate < thirtyDaysFromNow) {
        audit.upcomingWarrantyExpirations.push(item)
      }
    }

    // Check for missing serial numbers
    if (!item.serialNumber || item.serialNumber.trim() === '') {
      audit.missingSerialNumbers.push(item)
    }
  }

  console.log('Configuration Item Audit Results:')
  console.log(`Total Active Items: ${audit.totalItems}`)
  console.log(`Expired Warranties: ${audit.expiredWarranties.length}`)
  console.log(`Warranties Expiring Soon: ${audit.upcomingWarrantyExpirations.length}`)
  console.log(`Missing Serial Numbers: ${audit.missingSerialNumbers.length}`)

  // Create tickets for items needing attention
  if (audit.expiredWarranties.length > 0) {
    const expiredWarrantyTicket = await client.tickets.create({
      title: 'Configuration Items with Expired Warranties - Review Required',
      description: `${audit.expiredWarranties.length} configuration items have expired warranties that need review.`,
      companyId,
      status: 1, // New
      priority: 3, // Medium
      ticketType: 4 // Internal
    })

    // Add note with details
    await client.ticketNotes.create({
      ticketId: expiredWarrantyTicket.id,
      title: 'Expired Warranty Details',
      description: audit.expiredWarranties
        .map(item => `• ${item.configurationItemName} (Serial: ${item.serialNumber || 'N/A'}) - Expired: ${item.warrantyExpirationDate}`)
        .join('\n'),
      noteType: 1,
      publish: 2
    })
  }

  return audit
}

// Run audit for a specific company
const auditResults = await auditConfigurationItems(123)
```

## Integration Patterns

### Webhook Integration

```typescript
import express from 'express'
import crypto from 'crypto'

const app = express()
app.use(express.json())

// Webhook endpoint for Autotask notifications
app.post('/webhook/autotask', async (req, res) => {
  try {
    // Verify webhook signature (if configured)
    const signature = req.headers['x-autotask-signature']
    const payload = JSON.stringify(req.body)
    
    // Process different event types
    switch (req.body.eventType) {
      case 'ticket.created':
        await handleNewTicket(req.body.data)
        break
      
      case 'ticket.updated':
        await handleTicketUpdate(req.body.data)
        break
      
      case 'time.entry.created':
        await handleNewTimeEntry(req.body.data)
        break
      
      default:
        console.log('Unhandled event type:', req.body.eventType)
    }

    res.status(200).send('OK')
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).send('Error processing webhook')
  }
})

async function handleNewTicket(ticketData: any) {
  console.log('New ticket created:', ticketData.id)
  
  // Get full ticket details
  const ticket = await client.tickets.query()
    .where('id', 'eq', ticketData.id)
    .include('Company', ['companyName'])
    .include('Contact', ['firstName', 'lastName', 'emailAddress'])
    .first()

  if (ticket && ticket.priority <= 2) { // High or Critical
    // Send notification to Slack, Teams, etc.
    await sendNotification({
      title: `High Priority Ticket Created`,
      message: `${ticket.title} - ${ticket.Company?.companyName}`,
      ticketId: ticket.id
    })
  }
}

async function sendNotification(notification: any) {
  // Implementation for your notification system
  console.log('Sending notification:', notification)
}

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000')
})
```

### Batch Processing with Queue

```typescript
import Bull from 'bull'

// Create job queue
const ticketProcessingQueue = new Bull('ticket processing', {
  redis: { host: 'localhost', port: 6379 }
})

// Process tickets in batches
ticketProcessingQueue.process('update-tickets', async (job) => {
  const { ticketIds, updates } = job.data
  
  console.log(`Processing ${ticketIds.length} tickets`)
  
  const results = []
  for (const ticketId of ticketIds) {
    try {
      const updatedTicket = await client.tickets.update(ticketId, updates)
      results.push({ ticketId, success: true, ticket: updatedTicket })
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      results.push({ ticketId, success: false, error: error.message })
    }
  }
  
  return results
})

// Add jobs to queue
async function bulkUpdateTickets(ticketIds: number[], updates: any) {
  // Split into smaller batches
  const batchSize = 50
  const batches = []
  
  for (let i = 0; i < ticketIds.length; i += batchSize) {
    batches.push(ticketIds.slice(i, i + batchSize))
  }
  
  // Queue each batch
  const jobs = await Promise.all(
    batches.map(batch => 
      ticketProcessingQueue.add('update-tickets', {
        ticketIds: batch,
        updates
      })
    )
  )
  
  return jobs
}

// Usage
const ticketIds = [1001, 1002, 1003, 1004, 1005] // ... many more
await bulkUpdateTickets(ticketIds, {
  status: 5, // In Progress
  lastActivityPersonType: 1
})
```

## Error Handling Examples

### Comprehensive Error Handling

```typescript
import { 
  ConfigurationError, 
  ValidationError, 
  RateLimitError, 
  AuthenticationError,
  AutotaskError 
} from 'autotask-node'

async function safeTicketOperation(ticketData: any) {
  try {
    return await client.tickets.create(ticketData)
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation Error:', error.message)
      console.error('Field Errors:', error.fieldErrors)
      
      // Handle specific field errors
      for (const fieldError of error.fieldErrors) {
        console.error(`Field "${fieldError.field}": ${fieldError.message}`)
      }
      
      // Return user-friendly error
      throw new Error('Ticket data validation failed. Please check required fields.')
      
    } else if (error instanceof RateLimitError) {
      console.warn('Rate limit exceeded, retrying after delay...')
      console.warn(`Retry after: ${error.retryAfter} seconds`)
      
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000))
      return safeTicketOperation(ticketData)
      
    } else if (error instanceof AuthenticationError) {
      console.error('Authentication failed:', error.message)
      
      // Attempt to refresh credentials or notify admin
      await notifyAdminOfAuthError(error)
      throw new Error('Authentication failed. Please check API credentials.')
      
    } else if (error instanceof ConfigurationError) {
      console.error('Configuration error:', error.message)
      throw new Error('SDK configuration is invalid. Please check setup.')
      
    } else if (error instanceof AutotaskError) {
      console.error('Autotask API error:', error.message)
      console.error('Error code:', error.code)
      console.error('Details:', error.details)
      
      throw new Error(`Autotask API error: ${error.message}`)
      
    } else {
      console.error('Unexpected error:', error)
      throw new Error('An unexpected error occurred')
    }
  }
}

async function notifyAdminOfAuthError(error: AuthenticationError) {
  // Implementation to notify admin of authentication issues
  console.log('Notifying admin of authentication error')
}

// Usage with error handling
try {
  const ticket = await safeTicketOperation({
    title: 'Test ticket',
    companyId: 123,
    status: 1,
    priority: 3
  })
  console.log('Ticket created successfully:', ticket.id)
} catch (error) {
  console.error('Failed to create ticket:', error.message)
}
```

### Retry with Exponential Backoff

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (error instanceof RateLimitError) {
        // Use the specific retry delay from rate limit error
        const delay = error.retryAfter * 1000
        console.log(`Rate limited. Waiting ${delay}ms before retry ${attempt}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Exponential backoff for other errors
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`Operation failed. Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Usage
const ticket = await withRetry(async () => {
  return client.tickets.create({
    title: 'Test ticket with retry logic',
    companyId: 123,
    status: 1,
    priority: 3
  })
}, 5, 1000)
```

## Performance Optimization

### Efficient Data Retrieval

```typescript
// Bad: Multiple individual requests
async function getTicketsBadWay(companyId: number) {
  const tickets = await client.tickets.query()
    .where('companyId', 'eq', companyId)
    .execute()
  
  const ticketsWithNotes = []
  for (const ticket of tickets.items) {
    const notes = await client.ticketNotes.query()
      .where('ticketId', 'eq', ticket.id)
      .execute()
    ticketsWithNotes.push({ ...ticket, notes: notes.items })
  }
  
  return ticketsWithNotes
}

// Good: Efficient batch retrieval
async function getTicketsGoodWay(companyId: number) {
  // Get tickets with related data in one query
  const tickets = await client.tickets.query()
    .where('companyId', 'eq', companyId)
    .select('id', 'title', 'status', 'priority', 'createDate') // Only needed fields
    .include('AssignedResource', ['firstName', 'lastName'])
    .include('Contact', ['firstName', 'lastName', 'emailAddress'])
    .execute()
  
  if (tickets.items.length === 0) {
    return []
  }
  
  // Get all notes in one batch query
  const ticketIds = tickets.items.map(t => t.id)
  const allNotes = await client.ticketNotes.query()
    .where('ticketId', 'in', ticketIds)
    .select('id', 'ticketId', 'title', 'description', 'createDateTime')
    .execute()
  
  // Group notes by ticket ID
  const notesByTicketId = allNotes.items.reduce((acc, note) => {
    acc[note.ticketId] = acc[note.ticketId] || []
    acc[note.ticketId].push(note)
    return acc
  }, {} as Record<number, any[]>)
  
  // Combine tickets with their notes
  return tickets.items.map(ticket => ({
    ...ticket,
    notes: notesByTicketId[ticket.id] || []
  }))
}
```

### Caching Strategy

```typescript
import NodeCache from 'node-cache'

// Create cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 })

async function getCachedCompanies(): Promise<any[]> {
  const cacheKey = 'active-companies'
  
  // Try to get from cache first
  let companies = cache.get<any[]>(cacheKey)
  if (companies) {
    console.log('Retrieved companies from cache')
    return companies
  }
  
  // Fetch from API if not in cache
  console.log('Fetching companies from API')
  const result = await client.companies.query()
    .where('isActive', 'eq', true)
    .select('id', 'companyName', 'companyType', 'phone')
    .orderBy('companyName', 'asc')
    .execute()
  
  companies = result.items
  
  // Store in cache
  cache.set(cacheKey, companies)
  console.log(`Cached ${companies.length} companies`)
  
  return companies
}

// Invalidate cache when companies are modified
async function updateCompanyWithCacheInvalidation(companyId: number, updates: any) {
  const company = await client.companies.update(companyId, updates)
  
  // Invalidate relevant cache entries
  cache.del('active-companies')
  cache.del(`company-${companyId}`)
  
  return company
}
```

## CLI Usage Examples

### Basic CLI Operations

```bash
# List all open tickets
npx autotask-node tickets list '{"status": 1}'

# Get a specific ticket
npx autotask-node tickets get 12345

# Create a new ticket
npx autotask-node tickets create '{
  "title": "Network connectivity issue",
  "description": "User unable to access shared drives",
  "companyId": 123,
  "status": 1,
  "priority": 2
}'

# Update ticket status
npx autotask-node tickets update 12345 '{"status": 5, "assignedResourceId": 456}'

# List companies with filtering
npx autotask-node companies list '{"companyType": 1, "isActive": true}'

# Create a new company
npx autotask-node companies create '{
  "companyName": "New Customer Corp",
  "companyType": 1,
  "isActive": true,
  "phone": "555-123-4567"
}'
```

### Advanced CLI Usage

```bash
# Complex filtering with multiple conditions
npx autotask-node tickets list '{
  "status": {"in": [1, 5, 8]},
  "priority": {"lte": 2},
  "createDate": {"gte": "2024-01-01"}
}'

# Export data to JSON file
npx autotask-node tickets list '{"status": 1}' > open-tickets.json

# Pipe output through jq for processing
npx autotask-node companies list '{"isActive": true}' | jq '.items[] | {id, name: .companyName, type: .companyType}'

# Batch operations using shell scripting
#!/bin/bash
# Update all tickets for a specific company to assigned status
COMPANY_ID=123
RESOURCE_ID=456

# Get ticket IDs
TICKET_IDS=$(npx autotask-node tickets list "{\"companyId\": $COMPANY_ID, \"status\": 1}" | jq -r '.items[].id')

# Update each ticket
for TICKET_ID in $TICKET_IDS; do
  echo "Updating ticket $TICKET_ID"
  npx autotask-node tickets update $TICKET_ID "{\"status\": 5, \"assignedResourceId\": $RESOURCE_ID}"
done
```

### Environment Configuration

```bash
# Set environment variables
export AUTOTASK_USERNAME="api-user@yourcompany.com"
export AUTOTASK_INTEGRATION_CODE="ABC123DEF456"
export AUTOTASK_SECRET="your-secret-key"

# Or use a .env file
echo "AUTOTASK_USERNAME=api-user@yourcompany.com" > .env
echo "AUTOTASK_INTEGRATION_CODE=ABC123DEF456" >> .env
echo "AUTOTASK_SECRET=your-secret-key" >> .env

# CLI will automatically load credentials
npx autotask-node tickets list '{"status": 1}'
```

---

These examples demonstrate the power and flexibility of the Autotask Node SDK. Each pattern can be adapted to your specific use cases and integrated into your existing workflows and systems.