"use strict";
/**
 * Comprehensive webhook type definitions for Autotask webhook system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookAction = exports.WebhookEventType = void 0;
// Enums and constants
var WebhookEventType;
(function (WebhookEventType) {
    WebhookEventType["ENTITY_CREATED"] = "entity.created";
    WebhookEventType["ENTITY_UPDATED"] = "entity.updated";
    WebhookEventType["ENTITY_DELETED"] = "entity.deleted";
    WebhookEventType["ENTITY_RESTORED"] = "entity.restored";
    WebhookEventType["SYSTEM_EVENT"] = "system.event";
    WebhookEventType["BATCH_OPERATION"] = "batch.operation";
    WebhookEventType["CUSTOM_EVENT"] = "custom.event";
})(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
var WebhookAction;
(function (WebhookAction) {
    WebhookAction["CREATE"] = "create";
    WebhookAction["UPDATE"] = "update";
    WebhookAction["DELETE"] = "delete";
    WebhookAction["RESTORE"] = "restore";
    WebhookAction["BATCH_CREATE"] = "batch_create";
    WebhookAction["BATCH_UPDATE"] = "batch_update";
    WebhookAction["BATCH_DELETE"] = "batch_delete";
    WebhookAction["STATUS_CHANGE"] = "status_change";
    WebhookAction["ASSIGNMENT_CHANGE"] = "assignment_change";
    WebhookAction["CUSTOM"] = "custom";
})(WebhookAction || (exports.WebhookAction = WebhookAction = {}));
//# sourceMappingURL=WebhookTypes.js.map