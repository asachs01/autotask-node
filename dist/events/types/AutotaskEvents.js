"use strict";
/**
 * Autotask-specific event types and interfaces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutotaskSystemEventType = exports.AutotaskEntityType = void 0;
// Autotask entity types
var AutotaskEntityType;
(function (AutotaskEntityType) {
    // Core entities
    AutotaskEntityType["ACCOUNT"] = "Account";
    AutotaskEntityType["CONTACT"] = "Contact";
    AutotaskEntityType["TICKET"] = "Ticket";
    AutotaskEntityType["PROJECT"] = "Project";
    AutotaskEntityType["TASK"] = "Task";
    AutotaskEntityType["TIME_ENTRY"] = "TimeEntry";
    AutotaskEntityType["EXPENSE_ITEM"] = "ExpenseItem";
    AutotaskEntityType["CONTRACT"] = "Contract";
    // Configuration
    AutotaskEntityType["CONFIGURATION_ITEM"] = "ConfigurationItem";
    AutotaskEntityType["COMPANY"] = "Company";
    AutotaskEntityType["RESOURCE"] = "Resource";
    AutotaskEntityType["ROLE"] = "Role";
    AutotaskEntityType["DEPARTMENT"] = "Department";
    // Financial
    AutotaskEntityType["INVOICE"] = "Invoice";
    AutotaskEntityType["QUOTE"] = "Quote";
    AutotaskEntityType["PURCHASE_ORDER"] = "PurchaseOrder";
    AutotaskEntityType["BILLING_ITEM"] = "BillingItem";
    AutotaskEntityType["EXPENSE_REPORT"] = "ExpenseReport";
    // Inventory
    AutotaskEntityType["INVENTORY_ITEM"] = "InventoryItem";
    AutotaskEntityType["PRODUCT"] = "Product";
    AutotaskEntityType["SERVICE"] = "Service";
    // Knowledge Base
    AutotaskEntityType["KNOWLEDGE_BASE_ARTICLE"] = "KnowledgeBaseArticle";
    AutotaskEntityType["DOCUMENT"] = "Document";
    // Other
    AutotaskEntityType["OPPORTUNITY"] = "Opportunity";
    AutotaskEntityType["APPOINTMENT"] = "Appointment";
    AutotaskEntityType["NOTE"] = "Note";
    AutotaskEntityType["ATTACHMENT"] = "Attachment";
})(AutotaskEntityType || (exports.AutotaskEntityType = AutotaskEntityType = {}));
var AutotaskSystemEventType;
(function (AutotaskSystemEventType) {
    AutotaskSystemEventType["USER_LOGIN"] = "user.login";
    AutotaskSystemEventType["USER_LOGOUT"] = "user.logout";
    AutotaskSystemEventType["USER_CREATED"] = "user.created";
    AutotaskSystemEventType["USER_UPDATED"] = "user.updated";
    AutotaskSystemEventType["USER_DEACTIVATED"] = "user.deactivated";
    AutotaskSystemEventType["CONFIGURATION_CHANGED"] = "configuration.changed";
    AutotaskSystemEventType["INTEGRATION_ERROR"] = "integration.error";
    AutotaskSystemEventType["BACKUP_COMPLETED"] = "backup.completed";
    AutotaskSystemEventType["MAINTENANCE_STARTED"] = "maintenance.started";
    AutotaskSystemEventType["MAINTENANCE_COMPLETED"] = "maintenance.completed";
    AutotaskSystemEventType["ZONE_STATUS_CHANGED"] = "zone.status.changed";
})(AutotaskSystemEventType || (exports.AutotaskSystemEventType = AutotaskSystemEventType = {}));
//# sourceMappingURL=AutotaskEvents.js.map