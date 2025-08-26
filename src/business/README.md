# Autotask Business Logic Layer

This comprehensive business logic layer transforms the Autotask SDK from a simple API wrapper into a production-ready tool that understands Autotask's business domain and enforces business rules.

## Overview

The business logic layer provides:

- **Entity-specific validations** (e.g., ticket status transitions, required fields)
- **Business rules enforcement** (e.g., time entry constraints, billing validations)
- **Data relationships and cascade operations**
- **Field dependencies and auto-calculations**
- **Workflow automation** for common business processes
- **Enhanced error handling** with business context and recovery suggestions

## Key Components

### 1. Core Engines

- **BusinessLogicEngine**: Main orchestrator for all business logic operations
- **ValidationEngine**: Handles field, entity, and cross-entity validation
- **WorkflowEngine**: Manages automated business processes and workflows

### 2. Entity Business Logic

Each major Autotask entity has specialized business logic:

- **TicketBusinessLogic**: Status workflows, SLA tracking, escalation rules
- **TimeEntryBusinessLogic**: Billing validation, approval workflows, budget constraints
- **ContractBusinessLogic**: Service validation, renewal tracking, billing rules
- **ProjectBusinessLogic**: Resource allocation, milestone tracking, budget monitoring
- **CompanyBusinessLogic**: Hierarchy validation, location management, compliance
- **ContactBusinessLogic**: Role permissions, multi-company associations

### 3. Validation Framework

Three levels of validation:

- **Field-level**: Required fields, format validation, range checks, dependencies
- **Entity-level**: Business rules, state consistency, workflow validation
- **Cross-entity**: Relationships, referential integrity, data consistency

### 4. Error System

Enhanced error handling with:

- **Business context**: Detailed error information with entity and operation context
- **Recovery suggestions**: Actionable steps to fix validation errors
- **Error aggregation**: Collect and categorize multiple errors
- **Severity classification**: Distinguish between errors, warnings, and info

## Quick Start

### Basic Usage

```typescript
import { BusinessLogicEngine, TicketBusinessLogic } from './business';

// Initialize the business logic engine
const businessEngine = new BusinessLogicEngine();
businessEngine.initialize();

// Use entity-specific business logic
const ticketLogic = new TicketBusinessLogic(businessEngine);

// Validate and process ticket creation
const result = await ticketLogic.createTicket({
  title: "Critical system outage",
  priority: 4,
  companyID: 123,
  contactID: 456
}, {
  user: currentUser,
  relatedEntities: { 
    Companies: company, 
    Contacts: contact 
  }
});

if (result.isValid) {
  // Process the validated and enhanced ticket
  const processedTicket = result.processedTicket;
  console.log('SLA due date:', processedTicket.dueDateTime);
} else {
  // Handle validation errors
  result.validationResult.errors.forEach(error => {
    console.log(`${error.field}: ${error.message}`);
    if (error.suggestedFix) {
      console.log(`Suggestion: ${error.suggestedFix}`);
    }
  });
}
```

### Complete System Setup

```typescript
import { AutotaskBusinessLogicSetup } from './business';

// Initialize complete business logic system
const system = AutotaskBusinessLogicSetup.createBusinessLogicSystem();

// Access entity-specific logic
const ticketResult = await system.entityLogic.tickets.createTicket(ticketData);
const timeResult = await system.entityLogic.timeEntries.createTimeEntry(timeData);
const contractResult = await system.entityLogic.contracts.createContract(contractData);
```

## Entity-Specific Examples

### Ticket Management

```typescript
const ticketLogic = new TicketBusinessLogic(businessEngine);

// Create ticket with automatic SLA calculation
const createResult = await ticketLogic.createTicket({
  title: "Server maintenance required",
  priority: 3,
  companyID: 123
});

// Update ticket status with validation
const statusResult = await ticketLogic.updateTicketStatus(
  ticketId,
  5, // Complete status
  currentTicket,
  { 
    resolution: "Server maintenance completed successfully" 
  }
);

// Check escalation requirements
const escalation = ticketLogic.checkEscalationRules(ticket);
if (escalation.requiresEscalation) {
  console.log('Escalation required:', escalation.reasons);
}

// Generate metrics
const metrics = ticketLogic.calculateTicketMetrics(tickets);
console.log('SLA Compliance:', metrics.slaCompliance + '%');
```

### Time Entry Management

```typescript
const timeLogic = new TimeEntryBusinessLogic(businessEngine);

// Create time entry with automatic billing calculation
const result = await timeLogic.createTimeEntry({
  dateWorked: '2025-08-26',
  hoursWorked: 8.5,
  resourceID: 123,
  ticketID: 456,
  isBillable: true
}, {
  billingRates: { '123': 150 }, // $150/hour for resource 123
  contractInfo: { hourlyRate: 175 }
});

console.log('Billing amount:', result.billingCalculation.billingAmount);
console.log('Approval required:', result.approvalRequired);

// Process approval workflow
if (result.approvalRequired) {
  const approvalResult = await timeLogic.processApproval(
    timeEntryId,
    'submit',
    timeEntry,
    { approver: manager }
  );
}

// Generate analytics
const analytics = timeLogic.generateTimeAnalytics(timeEntries, 'resource');
console.log('Utilization rate:', analytics.utilizationRate + '%');
```

### Contract Management

```typescript
const contractLogic = new ContractBusinessLogic(businessEngine);

// Create contract with service validation
const result = await contractLogic.createContract({
  companyID: 123,
  startDate: '2025-09-01',
  contractPeriodMonths: 12,
  contractValue: 120000
}, {
  services: [
    { name: 'Monitoring', type: 'recurring', rate: 5000 },
    { name: 'Support', type: 'hourly', rate: 150 }
  ]
});

// Process contract renewal
const renewalResult = await contractLogic.processContractRenewal(
  contractId,
  currentContract,
  {
    proposedStartDate: '2026-09-01',
    proposedEndDate: '2027-08-31',
    priceAdjustment: 0.05 // 5% increase
  },
  {
    usageAnalytics: { utilizationRate: 85 },
    performanceMetrics: { customerSatisfaction: 4.2 }
  }
);

// Calculate contract metrics
const metrics = contractLogic.calculateContractMetrics(contract, {
  timeEntries: entries,
  billingData: billing
});
console.log('Contract health score:', metrics.healthScore);
```

### Project Management

```typescript
const projectLogic = new ProjectBusinessLogic(businessEngine);

// Create project with resource analysis
const result = await projectLogic.createProject({
  projectName: 'System Migration',
  startDateTime: '2025-09-01',
  endDateTime: '2025-12-01',
  budget: 250000
}, {
  resources: availableResources,
  phases: projectPhases
});

// Optimize resource allocation
const optimization = projectLogic.optimizeResourceAllocation(
  project,
  phases,
  resources,
  {
    maxHoursPerResource: 40,
    skillRequirements: { 'backend': ['node.js', 'database'] }
  }
);

console.log('Allocation efficiency:', optimization.efficiency + '%');
console.log('Recommendations:', optimization.recommendations);

// Generate project status
const status = projectLogic.generateProjectStatus(
  project,
  phases,
  tasks,
  timeEntries,
  expenses
);

console.log('Project health:', status.overallProgress.health);
console.log('Budget status:', status.budgetAnalysis.budgetStatus);
```

## Validation Examples

### Field Validation

```typescript
import { RequiredValidator, EmailValidator, NumericRangeValidator } from './business';

const validationEngine = new ValidationEngine();

// Register field validators
validationEngine.registerFieldValidator(
  'Contacts', 'emailAddress', 
  new EmailValidator()
);

validationEngine.registerFieldValidator(
  'Tickets', 'priority',
  new NumericRangeValidator({ min: 1, max: 4 })
);

// Validate field
const result = validationEngine.validateField(
  'Contacts', 'emailAddress', 'invalid-email'
);

if (!result.isValid) {
  result.errors.forEach(error => {
    console.log(error.message); // "Please enter a valid email address"
    console.log(error.suggestedFix); // "Ensure email follows format: user@domain.com"
  });
}
```

### Custom Business Rules

```typescript
import { AutotaskBusinessRules } from './business';

// Register custom business rule
AutotaskBusinessRules.registerRule({
  id: 'custom_ticket_validation',
  name: 'Custom Ticket Validation',
  description: 'Custom validation for high-value customer tickets',
  entityType: 'Tickets',
  ruleType: 'validation',
  enabled: true,
  priority: 95,
  conditions: [
    { field: 'companyID', operator: 'in', value: [123, 456, 789] }, // High-value customers
    { field: 'priority', operator: 'greater_than', value: 2, logicalOperator: 'AND' }
  ],
  actions: [
    { type: 'validate', target: 'assignedResourceID', formula: 'required(assignedResourceID)' },
    { type: 'set_field', target: 'escalationLevel', value: 1 }
  ]
});
```

### Workflow Automation

```typescript
import { AutotaskWorkflows } from './business';

const workflowEngine = new WorkflowEngine();

// Register predefined workflows
AutotaskWorkflows.getAllWorkflows().forEach(workflow => {
  workflowEngine.registerWorkflow(workflow);
});

// Execute workflow
const workflowResult = await workflowEngine.executeWorkflow(
  'advanced_ticket_escalation',
  {
    entityType: 'Tickets',
    entity: overdueTicket,
    operation: 'update',
    user: currentUser
  }
);

if (workflowResult.success) {
  console.log('Workflow completed:', workflowResult.message);
} else {
  console.error('Workflow failed:', workflowResult.error);
}
```

## Advanced Features

### Error Aggregation

```typescript
import { ErrorAggregator, ErrorFactory } from './business';

const errorAggregator = new ErrorAggregator();

// Collect multiple validation errors
errorAggregator.addError(
  ErrorFactory.createValidationError(
    'title', 'Tickets', 'field', 'required',
    'Title is required for all tickets'
  )
);

errorAggregator.addError(
  ErrorFactory.createBusinessRuleViolationError(
    'Tickets', 'create', 'sla_assignment', 'workflow',
    { priority: 4, assignedResource: null },
    'High priority tickets must have assigned resources'
  )
);

// Get error summary
const summary = errorAggregator.getSummary();
console.log('Total errors:', summary.totalErrors);
console.log('Recoverable errors:', summary.recoverableErrors);

// Get specific error types
const validationErrors = errorAggregator.getErrorsByEntity('Tickets');
```

### Custom Workflows

```typescript
import { WorkflowDefinition } from './business';

const customWorkflow: WorkflowDefinition = {
  id: 'custom_approval_process',
  name: 'Custom Approval Process',
  description: 'Multi-tier approval for large expenses',
  entityType: 'ExpenseItems',
  trigger: {
    type: 'field_change',
    condition: (context) => context.entity.amount > 1000
  },
  steps: [
    {
      id: 'manager_approval',
      name: 'Manager Approval',
      description: 'Route to direct manager',
      action: async (context) => {
        // Custom approval logic
        return { success: true, message: 'Sent to manager' };
      }
    },
    {
      id: 'finance_approval',
      name: 'Finance Approval',
      description: 'Route to finance team for large amounts',
      condition: (context) => context.entity.amount > 5000,
      action: async (context) => {
        // Custom finance approval logic
        return { success: true, message: 'Sent to finance team' };
      }
    }
  ]
};

workflowEngine.registerWorkflow(customWorkflow);
```

## Configuration

### Environment Variables

The business logic layer can be configured using environment variables:

```bash
# Validation settings
AUTOTASK_BL_STRICT_VALIDATION=true
AUTOTASK_BL_ENABLE_WARNINGS=true

# Workflow settings
AUTOTASK_BL_ENABLE_WORKFLOWS=true
AUTOTASK_BL_WORKFLOW_TIMEOUT=300000

# Error handling
AUTOTASK_BL_ERROR_LOGGING=true
AUTOTASK_BL_INCLUDE_STACK_TRACES=false
```

### Custom Configuration

```typescript
import { BusinessLogicEngine } from './business';

const businessEngine = new BusinessLogicEngine();

// Configure validation strictness
businessEngine.getValidationEngine().setStrictMode(true);

// Configure workflow timeouts
businessEngine.getWorkflowEngine().setDefaultTimeout(300000);

// Add custom error handlers
businessEngine.addErrorHandler((error) => {
  // Custom error logging or reporting
  console.error('Business logic error:', error.toObject());
});
```

## Best Practices

### 1. Always Use Business Logic Layer

```typescript
// ✅ Good: Use business logic layer
const result = await ticketLogic.createTicket(ticketData, context);
if (result.isValid) {
  await autotaskClient.tickets.create(result.processedTicket);
}

// ❌ Bad: Direct API call without validation
await autotaskClient.tickets.create(ticketData);
```

### 2. Handle Validation Results Properly

```typescript
// ✅ Good: Comprehensive error handling
const result = await ticketLogic.updateTicketStatus(id, newStatus, currentTicket);

if (!result.isValid) {
  // Show specific field errors to user
  result.validationResult.errors.forEach(error => {
    showFieldError(error.field, error.message, error.suggestedFix);
  });
  
  // Log business context
  console.error('Ticket status update failed:', {
    ticketId: id,
    fromStatus: currentTicket.status,
    toStatus: newStatus,
    errors: result.validationResult.errors
  });
  
  return;
}

// Process successful result
await updateTicketInDatabase(result.processedUpdate);
```

### 3. Leverage Entity Analytics

```typescript
// ✅ Good: Use business metrics for decision making
const metrics = ticketLogic.calculateTicketMetrics(customerTickets);

if (metrics.slaCompliance < 90) {
  console.warn('SLA compliance below threshold:', metrics.slaCompliance);
  
  // Take corrective action
  await escalateToManagement(metrics);
}

if (metrics.averageResolutionTime > 48) {
  console.warn('Resolution time exceeding target');
  
  // Recommend resource allocation changes
  const recommendations = await analyzeResourceNeeds(metrics);
}
```

### 4. Use Workflow Automation

```typescript
// ✅ Good: Let workflows handle business processes
const workflowResults = await workflowEngine.executeTriggeredWorkflows({
  entityType: 'Tickets',
  entity: newTicket,
  operation: 'create',
  user: currentUser
});

// Check workflow results
workflowResults.forEach(result => {
  if (result.success) {
    console.log('Workflow completed:', result.message);
  } else {
    console.error('Workflow failed:', result.error);
  }
});
```

## Testing

The business logic layer includes comprehensive test coverage. Run tests with:

```bash
npm test -- --grep "business-logic"
```

Example test:

```typescript
describe('TicketBusinessLogic', () => {
  it('should enforce status transition rules', async () => {
    const ticketLogic = new TicketBusinessLogic(businessEngine);
    
    const result = await ticketLogic.updateTicketStatus(
      123,
      5, // Complete
      { id: 123, status: 1, resolution: null }, // New ticket without resolution
      { resolution: 'Fixed the issue' }
    );
    
    expect(result.isValid).toBe(true);
    expect(result.processedUpdate.resolution).toBe('Fixed the issue');
  });
  
  it('should prevent invalid status transitions', async () => {
    const result = await ticketLogic.updateTicketStatus(
      123,
      5, // Complete
      { id: 123, status: 1, resolution: null }, // New ticket without resolution
      {} // No resolution provided
    );
    
    expect(result.isValid).toBe(false);
    expect(result.validationResult.errors).toHaveLength(1);
    expect(result.validationResult.errors[0].code).toBe('TICKET_COMPLETE_REQUIRES_RESOLUTION');
  });
});
```

## Support

For questions or issues with the business logic layer:

1. Check the validation error messages and suggested fixes
2. Review the entity-specific business logic documentation
3. Examine the predefined workflows and business rules
4. Consult the error aggregator for comprehensive error analysis

The business logic layer is designed to be self-documenting through detailed error messages and suggested remediation actions.