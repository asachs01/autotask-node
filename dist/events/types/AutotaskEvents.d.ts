/**
 * Autotask-specific event types and interfaces
 */
import { WebhookEvent, WebhookAction, WebhookEventType } from '../../webhooks/types/WebhookTypes';
export declare enum AutotaskEntityType {
    ACCOUNT = "Account",
    CONTACT = "Contact",
    TICKET = "Ticket",
    PROJECT = "Project",
    TASK = "Task",
    TIME_ENTRY = "TimeEntry",
    EXPENSE_ITEM = "ExpenseItem",
    CONTRACT = "Contract",
    CONFIGURATION_ITEM = "ConfigurationItem",
    COMPANY = "Company",
    RESOURCE = "Resource",
    ROLE = "Role",
    DEPARTMENT = "Department",
    INVOICE = "Invoice",
    QUOTE = "Quote",
    PURCHASE_ORDER = "PurchaseOrder",
    BILLING_ITEM = "BillingItem",
    EXPENSE_REPORT = "ExpenseReport",
    INVENTORY_ITEM = "InventoryItem",
    PRODUCT = "Product",
    SERVICE = "Service",
    KNOWLEDGE_BASE_ARTICLE = "KnowledgeBaseArticle",
    DOCUMENT = "Document",
    OPPORTUNITY = "Opportunity",
    APPOINTMENT = "Appointment",
    NOTE = "Note",
    ATTACHMENT = "Attachment"
}
export interface AutotaskWebhookEvent<T = any> extends WebhookEvent<T> {
    entityType: AutotaskEntityType;
    autotaskData: {
        zoneId: string;
        companyId?: number;
        resourceId?: number;
        userDefinedFields?: Record<string, any>;
        customFields?: Record<string, any>;
    };
}
export interface TicketWebhookEvent extends AutotaskWebhookEvent<TicketEventData> {
    entityType: AutotaskEntityType.TICKET;
}
export interface TicketEventData {
    id: number;
    ticketNumber: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    queue: string;
    assignedResourceID?: number;
    accountID: number;
    contactID?: number;
    projectID?: number;
    createdDate: string;
    lastModifiedDate: string;
    dueDateTime?: string;
    estimatedHours?: number;
    hoursWorked?: number;
    category?: string;
    subCategory?: string;
    issueType?: string;
    source?: string;
    resolution?: string;
    userDefinedFields?: Record<string, any>;
}
export interface ProjectWebhookEvent extends AutotaskWebhookEvent<ProjectEventData> {
    entityType: AutotaskEntityType.PROJECT;
}
export interface ProjectEventData {
    id: number;
    projectNumber: string;
    projectName: string;
    description?: string;
    status: string;
    type: string;
    accountID: number;
    contractID?: number;
    projectLeadResourceID?: number;
    startDateTime: string;
    endDateTime?: string;
    estimatedTime?: number;
    laborEstimatedRevenue?: number;
    laborEstimatedCosts?: number;
    materialEstimatedRevenue?: number;
    materialEstimatedCosts?: number;
    budget?: number;
    actualHours?: number;
    actualBilledHours?: number;
    userDefinedFields?: Record<string, any>;
}
export interface ContactWebhookEvent extends AutotaskWebhookEvent<ContactEventData> {
    entityType: AutotaskEntityType.CONTACT;
}
export interface ContactEventData {
    id: number;
    firstName: string;
    lastName: string;
    emailAddress?: string;
    phone?: string;
    mobilePhone?: string;
    accountID: number;
    isActive: boolean;
    title?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    lastModifiedDate: string;
    userDefinedFields?: Record<string, any>;
}
export interface CompanyWebhookEvent extends AutotaskWebhookEvent<CompanyEventData> {
    entityType: AutotaskEntityType.COMPANY;
}
export interface CompanyEventData {
    id: number;
    companyName: string;
    companyNumber?: string;
    accountType: string;
    isActive: boolean;
    phone?: string;
    fax?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    webAddress?: string;
    marketSegmentID?: number;
    territoryID?: number;
    ownerResourceID?: number;
    lastModifiedDate: string;
    userDefinedFields?: Record<string, any>;
}
export interface TimeEntryWebhookEvent extends AutotaskWebhookEvent<TimeEntryEventData> {
    entityType: AutotaskEntityType.TIME_ENTRY;
}
export interface TimeEntryEventData {
    id: number;
    resourceID: number;
    ticketID?: number;
    taskID?: number;
    projectID?: number;
    dateWorked: string;
    startDateTime?: string;
    endDateTime?: string;
    hoursWorked: number;
    hoursToBill?: number;
    billableToAccount?: boolean;
    nonBillable?: boolean;
    summaryNotes?: string;
    internalNotes?: string;
    roleID?: number;
    allocationCodeID?: number;
    contractID?: number;
    type: string;
    lastModifiedDate: string;
    userDefinedFields?: Record<string, any>;
}
export interface TaskWebhookEvent extends AutotaskWebhookEvent<TaskEventData> {
    entityType: AutotaskEntityType.TASK;
}
export interface TaskEventData {
    id: number;
    title: string;
    description?: string;
    projectID: number;
    phaseID?: number;
    status: string;
    priority: string;
    assignedResourceID?: number;
    estimatedHours?: number;
    remainingHours?: number;
    hoursWorked?: number;
    percentComplete?: number;
    startDate?: string;
    endDate?: string;
    dueDate?: string;
    createdDate: string;
    lastModifiedDate: string;
    isVisibleInClientPortal?: boolean;
    departmentID?: number;
    allocationCodeID?: number;
    userDefinedFields?: Record<string, any>;
}
export interface AutotaskSystemEvent extends AutotaskWebhookEvent {
    type: WebhookEventType.SYSTEM_EVENT;
    systemEventType: AutotaskSystemEventType;
}
export declare enum AutotaskSystemEventType {
    USER_LOGIN = "user.login",
    USER_LOGOUT = "user.logout",
    USER_CREATED = "user.created",
    USER_UPDATED = "user.updated",
    USER_DEACTIVATED = "user.deactivated",
    CONFIGURATION_CHANGED = "configuration.changed",
    INTEGRATION_ERROR = "integration.error",
    BACKUP_COMPLETED = "backup.completed",
    MAINTENANCE_STARTED = "maintenance.started",
    MAINTENANCE_COMPLETED = "maintenance.completed",
    ZONE_STATUS_CHANGED = "zone.status.changed"
}
export interface AutotaskBatchEvent extends AutotaskWebhookEvent {
    type: WebhookEventType.BATCH_OPERATION;
    batchInfo: {
        batchId: string;
        totalRecords: number;
        processedRecords: number;
        failedRecords: number;
        operation: WebhookAction;
        entityType: AutotaskEntityType;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        startedAt: Date;
        completedAt?: Date;
        errors?: BatchError[];
    };
}
export interface BatchError {
    recordId: string;
    error: string;
    details?: any;
}
export interface AutotaskEventFilter {
    entityTypes?: AutotaskEntityType[];
    actions?: WebhookAction[];
    zoneId?: string;
    companyIds?: number[];
    resourceIds?: number[];
    customConditions?: AutotaskCustomCondition[];
}
export interface AutotaskCustomCondition {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
    value: any;
    entityType?: AutotaskEntityType;
}
export interface AutotaskEventTransformation {
    id: string;
    name: string;
    description?: string;
    entityType: AutotaskEntityType;
    transformations: FieldTransformation[];
    enrichments?: EnrichmentRule[];
}
export interface FieldTransformation {
    sourceField: string;
    targetField?: string;
    transform: (value: any, event: AutotaskWebhookEvent) => any;
    condition?: (event: AutotaskWebhookEvent) => boolean;
}
export interface EnrichmentRule {
    name: string;
    condition?: (event: AutotaskWebhookEvent) => boolean;
    enrich: (event: AutotaskWebhookEvent) => Promise<any>;
    targetField: string;
}
export interface AutotaskSyncPattern {
    id: string;
    name: string;
    description?: string;
    sourceEntity: AutotaskEntityType;
    targetSystem: string;
    direction: 'one_way' | 'two_way';
    mappings: AutotaskFieldMapping[];
    filters?: AutotaskEventFilter[];
    transformations?: AutotaskEventTransformation[];
    conflictResolution?: {
        strategy: 'autotask_wins' | 'external_wins' | 'timestamp' | 'manual';
        customResolver?: (autotaskData: any, externalData: any) => any;
    };
}
export interface AutotaskFieldMapping {
    autotaskField: string;
    externalField: string;
    direction: 'to_external' | 'from_external' | 'both';
    transform?: {
        toExternal?: (value: any) => any;
        fromExternal?: (value: any) => any;
    };
    required?: boolean;
    defaultValue?: any;
}
export interface AutotaskEventStore {
    saveEvent(event: AutotaskWebhookEvent): Promise<void>;
    getEvents(filter: AutotaskEventStoreFilter): Promise<AutotaskWebhookEvent[]>;
    getEventHistory(entityType: AutotaskEntityType, entityId: string): Promise<AutotaskWebhookEvent[]>;
    getSnapshot(entityType: AutotaskEntityType, entityId: string, timestamp?: Date): Promise<any>;
    replay(fromTimestamp: Date, toTimestamp?: Date, filter?: AutotaskEventFilter): AsyncIterableIterator<AutotaskWebhookEvent>;
}
export interface AutotaskEventStoreFilter {
    entityType?: AutotaskEntityType;
    entityIds?: string[];
    actions?: WebhookAction[];
    fromDate?: Date;
    toDate?: Date;
    zoneId?: string;
    companyIds?: number[];
    limit?: number;
    offset?: number;
    orderBy?: 'timestamp' | 'entityType' | 'action';
    orderDirection?: 'asc' | 'desc';
}
export interface AutotaskWorkflow {
    id: string;
    name: string;
    description?: string;
    enabled: boolean;
    trigger: AutotaskWorkflowTrigger;
    conditions?: AutotaskWorkflowCondition[];
    actions: AutotaskWorkflowAction[];
    errorHandling?: WorkflowErrorHandling;
}
export interface AutotaskWorkflowTrigger {
    entityType: AutotaskEntityType;
    action: WebhookAction;
    filters?: AutotaskEventFilter[];
}
export interface AutotaskWorkflowCondition {
    field: string;
    operator: string;
    value: any;
    entityType?: AutotaskEntityType;
}
export interface AutotaskWorkflowAction {
    id: string;
    type: 'create_entity' | 'update_entity' | 'send_email' | 'call_webhook' | 'execute_script' | 'wait' | 'condition';
    config: any;
    retryPolicy?: {
        maxAttempts: number;
        delayMs: number;
        backoffMultiplier?: number;
    };
}
export interface WorkflowErrorHandling {
    strategy: 'continue' | 'stop' | 'retry';
    notificationChannels?: string[];
    customHandler?: (error: Error, context: any) => Promise<void>;
}
export interface AutotaskNotification {
    id: string;
    event: AutotaskWebhookEvent;
    channels: NotificationChannel[];
    template?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: Date;
    sentAt?: Date;
    deliveredAt?: Date;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
}
export interface NotificationChannel {
    type: 'email' | 'sms' | 'slack' | 'teams' | 'webhook' | 'push';
    config: any;
    recipients: string[];
}
export interface AutotaskEventMetrics {
    entityType: AutotaskEntityType;
    totalEvents: number;
    eventsPerHour: number;
    averageProcessingTime: number;
    errorRate: number;
    lastEventAt?: Date;
    topErrors: Array<{
        error: string;
        count: number;
        lastOccurred: Date;
    }>;
}
export interface AutotaskWebhookHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    averageLatency: number;
    queueBacklog: number;
    lastEventAt?: Date;
    errors: Array<{
        timestamp: Date;
        error: string;
        context?: any;
    }>;
}
//# sourceMappingURL=AutotaskEvents.d.ts.map