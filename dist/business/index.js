"use strict";
/**
 * Autotask Business Logic Layer
 *
 * This comprehensive business logic layer transforms the Autotask SDK from a simple
 * API wrapper into a production-ready tool that understands Autotask business domain,
 * enforces business rules, validates data integrity, and manages complex workflows.
 *
 * ## Key Features
 *
 * ### 1. Comprehensive Validation Framework
 * - **Field-level validators**: Required fields, format validation, range checks
 * - **Entity-level validators**: Business rules, state consistency
 * - **Cross-entity validators**: Relationships, referential integrity
 * - **Custom validation rules**: Extensible validation system
 *
 * ### 2. Business Logic Enforcement
 * - **Ticket workflows**: Status transitions, SLA tracking, escalation rules
 * - **Time entry logic**: Billing validation, approval workflows, budget constraints
 * - **Contract management**: Service validation, renewal tracking, billing rules
 * - **Project management**: Resource allocation, milestone tracking, budget monitoring
 * - **Company hierarchy**: Parent-child relationships, location management
 * - **Contact permissions**: Role-based access, multi-company associations
 *
 * ### 3. Workflow Management
 * - **Automated workflows**: Trigger-based business process automation
 * - **Approval processes**: Multi-level approval routing
 * - **Escalation management**: SLA-based escalations with notifications
 * - **State transitions**: Controlled entity state changes
 *
 * ### 4. Enhanced Error Handling
 * - **Business-aware errors**: Context-rich error messages
 * - **Recovery suggestions**: Actionable remediation steps
 * - **Error aggregation**: Comprehensive error reporting
 * - **Severity classification**: Error prioritization and handling
 *
 * ### 5. Production-Ready Features
 * - **Data transformations**: Auto-calculations, default values, normalization
 * - **Compliance validation**: GDPR, CCPA, industry-specific requirements
 * - **Analytics and metrics**: Performance tracking, utilization analysis
 * - **Security enforcement**: Permission validation, data access controls
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutotaskBusinessLogicSetup = exports.AutotaskWorkflows = exports.AutotaskBusinessRules = exports.ErrorAggregator = exports.ErrorFactory = exports.ConfigurationError = exports.DataIntegrityError = exports.BusinessRuleViolationError = exports.PermissionError = exports.WorkflowError = exports.BusinessValidationError = exports.BusinessLogicError = exports.ProjectBusinessLogic = exports.ContractBusinessLogic = exports.TimeEntryBusinessLogic = exports.ContactBusinessLogic = exports.CompanyBusinessLogic = exports.TicketBusinessLogic = exports.WorkflowEngine = exports.ValidationEngine = exports.BusinessLogicEngine = void 0;
// Core business logic components
__exportStar(require("./core"), exports);
__exportStar(require("./validation"), exports);
__exportStar(require("./rules"), exports);
__exportStar(require("./workflows"), exports);
__exportStar(require("./entities"), exports);
// Import the classes first
const BusinessLogicEngine_1 = require("./core/BusinessLogicEngine");
const TicketBusinessLogic_1 = require("./entities/TicketBusinessLogic");
const CompanyBusinessLogic_1 = require("./entities/CompanyBusinessLogic");
const ContactBusinessLogic_1 = require("./entities/ContactBusinessLogic");
const TimeEntryBusinessLogic_1 = require("./entities/TimeEntryBusinessLogic");
const ContractBusinessLogic_1 = require("./entities/ContractBusinessLogic");
const ProjectBusinessLogic_1 = require("./entities/ProjectBusinessLogic");
// Main orchestration classes
var BusinessLogicEngine_2 = require("./core/BusinessLogicEngine");
Object.defineProperty(exports, "BusinessLogicEngine", { enumerable: true, get: function () { return BusinessLogicEngine_2.BusinessLogicEngine; } });
var ValidationEngine_1 = require("./core/ValidationEngine");
Object.defineProperty(exports, "ValidationEngine", { enumerable: true, get: function () { return ValidationEngine_1.ValidationEngine; } });
var WorkflowEngine_1 = require("./core/WorkflowEngine");
Object.defineProperty(exports, "WorkflowEngine", { enumerable: true, get: function () { return WorkflowEngine_1.WorkflowEngine; } });
// Entity-specific business logic classes
var TicketBusinessLogic_2 = require("./entities/TicketBusinessLogic");
Object.defineProperty(exports, "TicketBusinessLogic", { enumerable: true, get: function () { return TicketBusinessLogic_2.TicketBusinessLogic; } });
var CompanyBusinessLogic_2 = require("./entities/CompanyBusinessLogic");
Object.defineProperty(exports, "CompanyBusinessLogic", { enumerable: true, get: function () { return CompanyBusinessLogic_2.CompanyBusinessLogic; } });
var ContactBusinessLogic_2 = require("./entities/ContactBusinessLogic");
Object.defineProperty(exports, "ContactBusinessLogic", { enumerable: true, get: function () { return ContactBusinessLogic_2.ContactBusinessLogic; } });
var TimeEntryBusinessLogic_2 = require("./entities/TimeEntryBusinessLogic");
Object.defineProperty(exports, "TimeEntryBusinessLogic", { enumerable: true, get: function () { return TimeEntryBusinessLogic_2.TimeEntryBusinessLogic; } });
var ContractBusinessLogic_2 = require("./entities/ContractBusinessLogic");
Object.defineProperty(exports, "ContractBusinessLogic", { enumerable: true, get: function () { return ContractBusinessLogic_2.ContractBusinessLogic; } });
var ProjectBusinessLogic_2 = require("./entities/ProjectBusinessLogic");
Object.defineProperty(exports, "ProjectBusinessLogic", { enumerable: true, get: function () { return ProjectBusinessLogic_2.ProjectBusinessLogic; } });
// Error handling system
var errors_1 = require("./validation/errors");
Object.defineProperty(exports, "BusinessLogicError", { enumerable: true, get: function () { return errors_1.BusinessLogicError; } });
Object.defineProperty(exports, "BusinessValidationError", { enumerable: true, get: function () { return errors_1.ValidationError; } });
Object.defineProperty(exports, "WorkflowError", { enumerable: true, get: function () { return errors_1.WorkflowError; } });
Object.defineProperty(exports, "PermissionError", { enumerable: true, get: function () { return errors_1.PermissionError; } });
Object.defineProperty(exports, "BusinessRuleViolationError", { enumerable: true, get: function () { return errors_1.BusinessRuleViolationError; } });
Object.defineProperty(exports, "DataIntegrityError", { enumerable: true, get: function () { return errors_1.DataIntegrityError; } });
Object.defineProperty(exports, "ConfigurationError", { enumerable: true, get: function () { return errors_1.ConfigurationError; } });
Object.defineProperty(exports, "ErrorFactory", { enumerable: true, get: function () { return errors_1.ErrorFactory; } });
Object.defineProperty(exports, "ErrorAggregator", { enumerable: true, get: function () { return errors_1.ErrorAggregator; } });
// Business rules and workflows
var AutotaskBusinessRules_1 = require("./rules/AutotaskBusinessRules");
Object.defineProperty(exports, "AutotaskBusinessRules", { enumerable: true, get: function () { return AutotaskBusinessRules_1.AutotaskBusinessRules; } });
var AutotaskWorkflows_1 = require("./workflows/AutotaskWorkflows");
Object.defineProperty(exports, "AutotaskWorkflows", { enumerable: true, get: function () { return AutotaskWorkflows_1.AutotaskWorkflows; } });
/**
 * Quick setup helper for initializing the complete business logic system
 */
class AutotaskBusinessLogicSetup {
    /**
     * Initialize a complete business logic system with default configuration
     */
    static createBusinessLogicSystem() {
        const businessEngine = new BusinessLogicEngine_1.BusinessLogicEngine();
        businessEngine.initialize();
        return {
            businessEngine,
            entityLogic: {
                tickets: new TicketBusinessLogic_1.TicketBusinessLogic(businessEngine),
                companies: new CompanyBusinessLogic_1.CompanyBusinessLogic(businessEngine),
                contacts: new ContactBusinessLogic_1.ContactBusinessLogic(businessEngine),
                timeEntries: new TimeEntryBusinessLogic_1.TimeEntryBusinessLogic(businessEngine),
                contracts: new ContractBusinessLogic_1.ContractBusinessLogic(businessEngine),
                projects: new ProjectBusinessLogic_1.ProjectBusinessLogic(businessEngine)
            }
        };
    }
    /**
     * Create a business logic system with custom configuration
     */
    static createCustomBusinessLogicSystem(config) {
        const system = this.createBusinessLogicSystem();
        // Apply custom configuration
        if (config.customRules) {
            config.customRules.forEach(rule => {
                // Would register custom rules
            });
        }
        if (config.customWorkflows) {
            config.customWorkflows.forEach(workflow => {
                system.businessEngine.getWorkflowEngine().registerWorkflow(workflow);
            });
        }
        return system;
    }
}
exports.AutotaskBusinessLogicSetup = AutotaskBusinessLogicSetup;
//# sourceMappingURL=index.js.map