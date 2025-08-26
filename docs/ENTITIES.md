# Autotask Entities Reference

This document provides detailed information about all 178 supported Autotask REST API entities, organized by category and functionality.

## Table of Contents

- [Entity Overview](#entity-overview)
- [Core Business Entities](#core-business-entities)
- [Contract Management](#contract-management)
- [Financial Management](#financial-management)
- [Configuration Management](#configuration-management)
- [Time Tracking & Scheduling](#time-tracking--scheduling)
- [Inventory Management](#inventory-management)
- [Knowledge Management](#knowledge-management)
- [Attachment Management](#attachment-management)
- [Note Management](#note-management)
- [Service Call Management](#service-call-management)
- [Ticketing Extensions](#ticketing-extensions)
- [Organizational Structure](#organizational-structure)
- [Complete Entity List](#complete-entity-list)

## Entity Overview

Each entity in the Autotask Node SDK supports a consistent set of operations based on the Autotask API capabilities:

### Supported Operations

| Operation | HTTP Method | Description |
|-----------|-------------|-------------|
| `GET` | GET | Retrieve entities with filtering and sorting |
| `POST` | POST | Create new entities |
| `PATCH` | PATCH | Update specific fields of existing entities |
| `PUT` | PUT | Replace entire entity (full update) |
| `DELETE` | DELETE | Remove entities from the system |

### Operation Availability

Not all entities support all operations. The availability depends on business logic and data integrity requirements:

- **Read-only entities**: Only support GET operations (e.g., lookup tables, system information)
- **Create-only entities**: Support GET and POST operations (e.g., certain log entries)
- **Full CRUD entities**: Support all operations (e.g., tickets, companies, contacts)

## Core Business Entities

The primary entities used in daily PSA operations.

### Companies
**Endpoint**: `/v1.0/Companies`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Customer organizations and accounts

```typescript
interface Company {
  id: number
  companyName: string
  companyNumber?: string
  companyType: number // 1=Customer, 2=Lead, 3=Prospect, etc.
  isActive: boolean
  phone?: string
  fax?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  webAddress?: string
  // ... additional fields
}

// Usage examples
const company = await client.companies.create({
  companyName: 'Acme Corporation',
  companyType: 1, // Customer
  isActive: true
})

const customers = await client.companies.query()
  .where('companyType', 'eq', 1)
  .where('isActive', 'eq', true)
  .execute()
```

### Contacts
**Endpoint**: `/v1.0/Contacts`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Individual contacts within companies

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
  // ... additional fields
}

// Find primary contacts for companies
const primaryContacts = await client.contacts.query()
  .where('isPrimaryContact', 'eq', true)
  .where('isActive', 'eq', true)
  .include('Company', ['companyName'])
  .execute()
```

### Tickets
**Endpoint**: `/v1.0/Tickets`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Service tickets and support requests

```typescript
interface Ticket {
  id: number
  title: string
  description?: string
  status: number // 1=New, 5=In Progress, 8=Waiting Customer, etc.
  priority: number // 1=Critical, 2=High, 3=Medium, 4=Low
  ticketType: number
  companyId: number
  contactId?: number
  assignedResourceId?: number
  dueDateTime?: string
  estimatedHours?: number
  completedDateTime?: string
  // ... additional fields
}

// Create escalated ticket
const urgentTicket = await client.tickets.create({
  title: 'Critical server outage',
  description: 'Production server is down, immediate attention required',
  companyId: 123,
  status: 1, // New
  priority: 1, // Critical
  ticketType: 1 // Service Request
})
```

### Projects
**Endpoint**: `/v1.0/Projects`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Client projects and work orders

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
  status: number // 1=Active, 2=Complete, etc.
  type: number // 1=Fixed Price, 2=Time & Materials, etc.
  estimatedHours?: number
  actualHours?: number
  // ... additional fields
}
```

### Tasks
**Endpoint**: `/v1.0/Tasks`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Project tasks and work items

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
  // ... additional fields
}
```

### Resources
**Endpoint**: `/v1.0/Resources`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Human resources and staff members

```typescript
interface Resource {
  id: number
  firstName: string
  lastName: string
  userName: string
  email: string
  isActive: boolean
  resourceType: number // 1=Employee, 2=Contractor, etc.
  title?: string
  phone?: string
  mobilePhone?: string
  // ... additional fields
}
```

### Opportunities
**Endpoint**: `/v1.0/Opportunities`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Sales opportunities and pipeline management

```typescript
interface Opportunity {
  id: number
  title: string
  companyId: number
  amount?: number
  cost?: number
  closeDate?: string
  stage: number // 1=Qualification, 2=Needs Analysis, etc.
  status: number // 1=Open, 2=Won, 3=Lost, etc.
  probability?: number
  contactId?: number
  ownerResourceId?: number
  // ... additional fields
}
```

## Contract Management

Entities for managing service contracts and agreements.

### Contracts
**Endpoint**: `/v1.0/Contracts`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Service contracts and agreements

```typescript
interface Contract {
  id: number
  accountId: number
  contractName: string
  contractType: number
  startDate: string
  endDate?: string
  serviceDate?: string
  status: number
  billingPreference: number
  // ... additional fields
}
```

### ContractServices
**Endpoint**: `/v1.0/ContractServices`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Services included in contracts

### ContractBillingRules
**Endpoint**: `/v1.0/ContractBillingRules`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Billing rules for contracts

### ContractRates
**Endpoint**: `/v1.0/ContractRates`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Billing rates for contracts

## Financial Management

Entities for billing, invoicing, and financial operations.

### Invoices
**Endpoint**: `/v1.0/Invoices`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Customer invoices and billing

```typescript
interface Invoice {
  id: number
  accountId: number
  invoiceNumber?: string
  invoiceDate: string
  dueDate?: string
  totalAmount?: number
  paidAmount?: number
  balanceAmount?: number
  status: number
  // ... additional fields
}
```

### Quotes
**Endpoint**: `/v1.0/Quotes`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Customer quotes and estimates

### PurchaseOrders
**Endpoint**: `/v1.0/PurchaseOrders`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Purchase orders for procurement

### BillingItems
**Endpoint**: `/v1.0/BillingItems`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Billing items for invoicing

### BillingCodes
**Endpoint**: `/v1.0/BillingCodes`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Billing codes for time and expense tracking

## Configuration Management

Entities for IT asset and configuration management.

### ConfigurationItems
**Endpoint**: `/v1.0/ConfigurationItems`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Configuration items and assets

```typescript
interface ConfigurationItem {
  id: number
  companyId: number
  configurationItemName: string
  configurationItemType: number
  configurationItemCategoryId?: number
  isActive: boolean
  serialNumber?: string
  installDate?: string
  warrantyExpirationDate?: string
  // ... additional fields
}
```

### ConfigurationItemTypes
**Endpoint**: `/v1.0/ConfigurationItemTypes`  
**Operations**: GET  
**Description**: Types of configuration items

### ConfigurationItemCategories
**Endpoint**: `/v1.0/ConfigurationItemCategories`  
**Operations**: GET  
**Description**: Categories for configuration items

## Time Tracking & Scheduling

Entities for time management and scheduling.

### TimeEntries
**Endpoint**: `/v1.0/TimeEntries`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Time tracking entries for billing

```typescript
interface TimeEntry {
  id: number
  resourceId: number
  taskId?: number
  ticketId?: number
  dateWorked: string
  hoursWorked: number
  billingCodeId?: number
  internalAllocationCodeId?: number
  hoursToBill?: number
  summary?: string
  internalNotes?: string
  // ... additional fields
}
```

### Appointments
**Endpoint**: `/v1.0/Appointments`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Calendar appointments and scheduling

### Holidays
**Endpoint**: `/v1.0/Holidays`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Holiday calendar entries

### TimeOffRequests
**Endpoint**: `/v1.0/TimeOffRequests`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Requests for time off

## Inventory Management

Entities for product and inventory management.

### Products
**Endpoint**: `/v1.0/Products`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Products and services offered

### InventoryItems
**Endpoint**: `/v1.0/InventoryItems`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Items in inventory

### InventoryLocations
**Endpoint**: `/v1.0/InventoryLocations`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Physical locations for inventory storage

## Knowledge Management

Entities for documentation and knowledge base.

### Documents
**Endpoint**: `/v1.0/Documents`  
**Operations**: GET, POST, PATCH, PUT  
**Description**: Documents and files in the system

### KnowledgeBaseArticles
**Endpoint**: `/v1.0/KnowledgeBaseArticles`  
**Operations**: GET, POST, PATCH, PUT, DELETE  
**Description**: Knowledge base articles and documentation

### Articles (Legacy)
**Endpoint**: `/v1.0/Articles`  
**Operations**: Various  
**Description**: Legacy article system (use KnowledgeBaseArticles for new implementations)

## Complete Entity List

Here's the complete list of all 178 supported entities organized alphabetically within categories:

### Core Business (7)
- Companies
- Contacts
- Opportunities
- Projects
- Resources
- Tasks
- Tickets

### Contract Management (24)
- Contracts
- ContractBillingRules
- ContractBlockHourFactors
- ContractBlocks
- ContractCharges
- ContractExclusionBillingCodes
- ContractExclusionRoles
- ContractExclusionSetExcludedRoles
- ContractExclusionSetExcludedWorkTypes
- ContractExclusionSets
- ContractMilestones
- ContractRates
- ContractRetainers
- ContractRoleCosts
- ContractServiceAdjustments
- ContractServiceBundleAdjustments
- ContractServiceBundleUnits
- ContractServiceBundles
- ContractServices
- ContractServiceUnits
- ContractTicketPurchases
- ServiceBundles
- ServiceBundleServices
- Services

### Financial Management (19)
- BillingCodes
- BillingItemApprovalLevels
- BillingItems
- ChangeOrderCharges
- Currencies
- Invoices
- InvoiceTemplates
- PaymentTerms
- PurchaseApprovals
- PurchaseOrderItemReceiving
- PurchaseOrderItems
- PurchaseOrders
- QuoteItems
- QuoteLocations
- Quotes
- QuoteTemplates
- TaxCategories
- TaxRegions
- Taxes

### Configuration Management (9)
- ConfigurationItemAttachments
- ConfigurationItemBillingProductAssociations
- ConfigurationItemCategories
- ConfigurationItemCategoryUdfAssociations
- ConfigurationItemDnsRecords
- ConfigurationItemRelatedItems
- ConfigurationItems
- ConfigurationItemSslSubjectAlternativeName
- ConfigurationItemTypes

### Time Tracking & Scheduling (11)
- Appointments
- Holidays
- HolidaySets
- ResourceDailyAvailabilities
- ResourceTimeOffAdditional
- ResourceTimeOffApprovers
- ResourceTimeOffBalances
- TimeEntries
- TimeOffRequests
- TimeOffRequestsApprove
- TimeOffRequestsReject

### Inventory Management (12)
- InventoryItems
- InventoryItemSerialNumbers
- InventoryLocations
- InventoryProducts
- InventoryStockedItems
- InventoryStockedItemsAdd
- InventoryStockedItemsRemove
- InventoryStockedItemsTransfer
- InventoryTransfers
- Products
- ProductTiers
- ProductVendors

### Knowledge Management (19)
- Articles
- ArticleAttachments
- ArticleConfigurationItemCategoryAssociations
- ArticlePlainTextContent
- ArticleTagAssociations
- ArticleTicketAssociations
- ArticleToArticleAssociations
- ArticleToDocumentAssociations
- DocumentCategories
- DocumentChecklistItems
- DocumentChecklistLibraries
- DocumentConfigurationItemAssociations
- DocumentConfigurationItemCategoryAssociations
- Documents
- DocumentTagAssociations
- DocumentTicketAssociations
- DocumentToArticleAssociations
- KnowledgeBaseArticles
- KnowledgeBaseCategories

### Attachment Management (12)
- ArticleAttachments
- AttachmentInfo
- CompanyAttachments
- DocumentAttachments
- ExpenseItemAttachments
- ExpenseReportAttachments
- OpportunityAttachments
- ProjectAttachments
- ResourceAttachments
- SalesOrderAttachments
- TaskAttachments
- TicketAttachments
- TimeEntryAttachments

### Note Management (14)
- ArticleNotes
- CompanyNoteAttachments
- CompanyNotes
- ConfigurationItemNoteAttachments
- ConfigurationItemNotes
- ContractNoteAttachments
- ContractNotes
- DocumentNotes
- ProductNotes
- ProjectNoteAttachments
- ProjectNotes
- TaskNoteAttachments
- TaskNotes
- TicketNoteAttachments
- TicketNotes

### Service Call Management (5)
- ServiceCallTaskResources
- ServiceCallTasks
- ServiceCallTicketResources
- ServiceCallTickets
- ServiceCalls

### Ticketing Extensions (12)
- TicketAdditionalConfigurationItems
- TicketAdditionalContacts
- TicketCategories
- TicketCategoryFieldDefaults
- TicketChangeRequestApprovals
- TicketCharges
- TicketChecklistItems
- TicketChecklistLibraries
- TicketHistory
- TicketRmaCredits
- TicketSecondaryResources
- TicketTagAssociations

### Organizational Structure (9)
- CompanyCategories
- CompanyLocations
- CompanySiteConfigurations
- CompanyTeams
- CompanyToDos
- Departments
- InternalLocations
- InternalLocationWithBusinessHours
- OrganizationalLevel1
- OrganizationalLevel2
- OrganizationalLevelAssociations
- OrganizatonalResources

### Expense Management (3)
- ExpenseItemAttachment
- ExpenseItems
- ExpenseReports

### Sales Management (2)
- OpportunityCategories
- SalesOrders

### Pricing Management (7)
- PriceListMaterialCodes
- PriceListProducts
- PriceListProductTiers
- PriceListRoles
- PriceListServiceBundles
- PriceListServices
- PriceListWorkTypeModifiers

### Associations & Relationships (7)
- AdditionalInvoiceFieldValues
- ChangeRequestLinks
- ComanagedAssociations
- ContactBillingProductAssociations
- ContactGroupContacts
- ContactGroups
- ServiceLevelAgreementResults

### Portal Management (1)
- ClientPortalUsers

### Tags & Classification (4)
- TagAliases
- TagGroups
- Tags
- TaskPredecessors
- TaskSecondaryResources

### Surveys & Feedback (2)
- SurveyResults
- Surveys

### Notifications & Alerts (2)
- CompanyAlerts
- NotificationHistory

### Checklists & Templates (2)
- ChecklistLibraries
- ChecklistLibraryChecklistItems

### User-Defined Fields (2)
- UserDefinedFieldDefinitions
- UserDefinedFieldListItems

### System & Lookup Tables (15)
- ActionTypes
- ClassificationIcons
- Countries
- DomainRegistrars
- Modules
- OrganizationalLevel1
- OrganizationalLevel2
- Phases
- ResourceRoleDepartments
- ResourceRoleQueues
- ResourceRoles
- ResourceServiceDeskRoles
- ResourceSkills
- Roles
- ShippingTypes
- Skills
- SubscriptionPeriods
- Subscriptions
- Version
- WorkTypeModifiers

### Audit & Logging (3)
- DeletedTaskActivityLogs
- DeletedTicketActivityLogs
- DeletedTicketLogs

### Project Management (2)
- ProjectCharges
- TaskPredecessors
- TaskSecondaryResources

### Special Purpose (1)
- RecurringSerContractEntityRelation

## Usage Patterns

### Common Query Patterns

```typescript
// Find all active tickets for a company
const companyTickets = await client.tickets.query()
  .where('companyId', 'eq', 123)
  .where('status', 'in', [1, 5, 8]) // New, In Progress, Waiting Customer
  .orderBy('priority', 'asc')
  .orderBy('dueDateTime', 'asc')
  .execute()

// Get project progress
const projectTasks = await client.tasks.query()
  .where('projectId', 'eq', 456)
  .select('id', 'title', 'status', 'estimatedHours', 'actualHours')
  .orderBy('startDateTime', 'asc')
  .execute()

// Find overdue time entries
const overdueEntries = await client.timeEntries.query()
  .where('dateWorked', 'lt', '2024-01-01')
  .where('billableToAccount', 'eq', true)
  .where('isNonBillable', 'eq', false)
  .include('Resource', ['firstName', 'lastName'])
  .execute()
```

### Batch Operations

```typescript
// Create multiple contacts for a company
const contacts = [
  { companyId: 123, firstName: 'John', lastName: 'Doe' },
  { companyId: 123, firstName: 'Jane', lastName: 'Smith' }
]

const createdContacts = await Promise.all(
  contacts.map(contact => client.contacts.create(contact))
)

// Update multiple tickets
const ticketUpdates = [
  { id: 1001, status: 5, assignedResourceId: 456 },
  { id: 1002, status: 8, estimatedHours: 4 }
]

const updatedTickets = await Promise.all(
  ticketUpdates.map(update => 
    client.tickets.update(update.id, update)
  )
)
```

---

This entity reference provides comprehensive coverage of all 178 Autotask entities available through the SDK. Each entity follows consistent patterns for CRUD operations and query building, making the API predictable and easy to use.