"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessLogicEngine = void 0;
const ValidationEngine_1 = require("./ValidationEngine");
const WorkflowEngine_1 = require("./WorkflowEngine");
const validation_1 = require("../validation");
/**
 * Central business logic engine that coordinates validation, workflows, and business rules
 */
class BusinessLogicEngine {
    constructor() {
        this.initialized = false;
        this.validationEngine = new ValidationEngine_1.ValidationEngine();
        this.workflowEngine = new WorkflowEngine_1.WorkflowEngine();
    }
    /**
     * Initialize the business logic engine with default validators and rules
     */
    initialize() {
        if (this.initialized)
            return;
        this.setupFieldValidators();
        this.setupEntityValidators();
        this.setupCrossEntityValidators();
        this.setupWorkflows();
        this.initialized = true;
    }
    /**
     * Setup field-level validators for common fields
     */
    setupFieldValidators() {
        // Email validations
        this.validationEngine.registerFieldValidator('Contacts', 'emailAddress', new validation_1.EmailValidator());
        this.validationEngine.registerFieldValidator('Resources', 'emailAddress', new validation_1.EmailValidator());
        // Phone validations
        this.validationEngine.registerFieldValidator('Contacts', 'phone', new validation_1.PhoneValidator());
        this.validationEngine.registerFieldValidator('Companies', 'phone', new validation_1.PhoneValidator());
        // Required field validations
        this.validationEngine.registerFieldValidator('Tickets', 'title', new validation_1.RequiredValidator());
        this.validationEngine.registerFieldValidator('Companies', 'companyName', new validation_1.RequiredValidator());
        this.validationEngine.registerFieldValidator('Contacts', 'firstName', new validation_1.RequiredValidator());
        this.validationEngine.registerFieldValidator('Contacts', 'lastName', new validation_1.RequiredValidator());
        this.validationEngine.registerFieldValidator('TimeEntries', 'hoursWorked', new validation_1.RequiredValidator());
        this.validationEngine.registerFieldValidator('TimeEntries', 'dateWorked', new validation_1.RequiredValidator());
        // Numeric range validations
        this.validationEngine.registerFieldValidator('TimeEntries', 'hoursWorked', new validation_1.NumericRangeValidator({ min: 0, max: 24 }));
        this.validationEngine.registerFieldValidator('Tickets', 'priority', new validation_1.NumericRangeValidator({ min: 1, max: 4 }));
        // Date range validations
        const today = new Date();
        const futureLimit = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate());
        this.validationEngine.registerFieldValidator('Contracts', 'endDate', new validation_1.DateRangeValidator({ minDate: today, maxDate: futureLimit }));
        this.validationEngine.registerFieldValidator('Projects', 'endDateTime', new validation_1.DateRangeValidator({ minDate: today, maxDate: futureLimit }));
    }
    /**
     * Setup entity-level validators
     */
    setupEntityValidators() {
        // Ticket validators
        this.validationEngine.registerEntityValidator(new validation_1.TicketStatusWorkflowValidator());
        this.validationEngine.registerEntityValidator(new validation_1.TicketSLAValidator());
        // Company validators
        this.validationEngine.registerEntityValidator(new validation_1.CompanyHierarchyValidator());
        // Contact validators
        this.validationEngine.registerEntityValidator(new validation_1.ContactMultiCompanyValidator());
        // Time entry validators
        this.validationEngine.registerEntityValidator(new validation_1.TimeEntryBillingValidator());
        // Contract validators
        this.validationEngine.registerEntityValidator(new validation_1.ContractServiceValidator());
        // Project validators
        this.validationEngine.registerEntityValidator(new validation_1.ProjectResourceValidator());
    }
    /**
     * Setup cross-entity validators
     */
    setupCrossEntityValidators() {
        this.validationEngine.registerCrossEntityValidator(new validation_1.TicketCompanyContactValidator());
        this.validationEngine.registerCrossEntityValidator(new validation_1.TimeEntryProjectTicketValidator());
        this.validationEngine.registerCrossEntityValidator(new validation_1.ContractCompanyServiceValidator());
        this.validationEngine.registerCrossEntityValidator(new validation_1.ProjectCompanyResourceValidator());
    }
    /**
     * Setup business workflows
     */
    setupWorkflows() {
        // This will be implemented when we create the WorkflowEngine
        // For now, just placeholder
    }
    /**
     * Validate an entity operation (create, update, delete)
     */
    async validateOperation(operation, entityType, entity, context) {
        this.initialize();
        const operationContext = {
            ...context,
            operation,
            [`isNew${entityType}`]: operation === 'create'
        };
        return this.validationEngine.validateComplete(entityType, entity, context?.relatedEntities || {}, operationContext);
    }
    /**
     * Process business rules for an entity operation
     */
    async processBusinessRules(operation, entityType, entity, context) {
        const validationResult = await this.validateOperation(operation, entityType, entity, context);
        // Apply business transformations
        const transformedEntity = await this.applyBusinessTransformations(entityType, entity, context);
        // Generate suggested actions based on validation results
        const suggestedActions = this.generateSuggestedActions(validationResult);
        return {
            isAllowed: validationResult.isValid,
            validationResult,
            transformedEntity,
            suggestedActions
        };
    }
    /**
     * Apply business-specific transformations to entities
     */
    async applyBusinessTransformations(entityType, entity, context) {
        const transformed = { ...entity };
        switch (entityType) {
            case 'Tickets':
                return this.transformTicket(transformed, context);
            case 'TimeEntries':
                return this.transformTimeEntry(transformed, context);
            case 'Contracts':
                return this.transformContract(transformed, context);
            default:
                return transformed;
        }
    }
    /**
     * Apply ticket-specific business transformations
     */
    transformTicket(ticket, context) {
        const transformed = { ...ticket };
        // Auto-set create date if not provided
        if (!transformed.createDate) {
            transformed.createDate = new Date().toISOString();
        }
        // Auto-assign based on queue rules (simplified)
        if (!transformed.assignedResourceID && transformed.queueID) {
            // This would typically query available resources
            // For now, just flag for manual assignment
            transformed._needsResourceAssignment = true;
        }
        // Set SLA due date for high priority tickets
        if (transformed.priority >= 3 && !transformed.dueDateTime) {
            const now = new Date();
            const slaHours = transformed.priority === 4 ? 2 : 8; // Critical: 2hrs, High: 8hrs
            const dueDate = new Date(now.getTime() + slaHours * 60 * 60 * 1000);
            transformed.dueDateTime = dueDate.toISOString();
        }
        return transformed;
    }
    /**
     * Apply time entry-specific business transformations
     */
    transformTimeEntry(timeEntry, context) {
        const transformed = { ...timeEntry };
        // Auto-calculate billing amounts if rates are available
        if (transformed.isBillable && transformed.hoursWorked && context?.billingRate) {
            transformed.billingAmount = transformed.hoursWorked * context.billingRate;
        }
        // Round hours to nearest quarter hour
        if (transformed.hoursWorked) {
            transformed.hoursWorked = Math.round(transformed.hoursWorked * 4) / 4;
        }
        return transformed;
    }
    /**
     * Apply contract-specific business transformations
     */
    transformContract(contract, context) {
        const transformed = { ...contract };
        // Auto-calculate end date if contract period is specified
        if (transformed.startDate && transformed.contractPeriodMonths && !transformed.endDate) {
            const startDate = new Date(transformed.startDate);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + transformed.contractPeriodMonths);
            transformed.endDate = endDate.toISOString();
        }
        return transformed;
    }
    /**
     * Generate suggested actions based on validation results
     */
    generateSuggestedActions(validationResult) {
        const actions = [];
        // Add actions based on error types
        validationResult.errors.forEach(error => {
            if (error.suggestedFix) {
                actions.push(error.suggestedFix);
            }
        });
        // Add actions based on warning types
        validationResult.warnings.forEach(warning => {
            if (warning.suggestedAction) {
                actions.push(warning.suggestedAction);
            }
        });
        return [...new Set(actions)]; // Remove duplicates
    }
    /**
     * Get validation engine instance for custom validation
     */
    getValidationEngine() {
        this.initialize();
        return this.validationEngine;
    }
    /**
     * Get workflow engine instance for custom workflows
     */
    getWorkflowEngine() {
        this.initialize();
        return this.workflowEngine;
    }
}
exports.BusinessLogicEngine = BusinessLogicEngine;
//# sourceMappingURL=BusinessLogicEngine.js.map