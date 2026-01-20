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
export * from './core';
export * from './validation';
export * from './rules';
export * from './workflows';
export * from './entities';
import { BusinessLogicEngine } from './core/BusinessLogicEngine';
import { TicketBusinessLogic } from './entities/TicketBusinessLogic';
import { CompanyBusinessLogic } from './entities/CompanyBusinessLogic';
import { ContactBusinessLogic } from './entities/ContactBusinessLogic';
import { TimeEntryBusinessLogic } from './entities/TimeEntryBusinessLogic';
import { ContractBusinessLogic } from './entities/ContractBusinessLogic';
import { ProjectBusinessLogic } from './entities/ProjectBusinessLogic';
export { BusinessLogicEngine } from './core/BusinessLogicEngine';
export { ValidationEngine } from './core/ValidationEngine';
export { WorkflowEngine } from './core/WorkflowEngine';
export { TicketBusinessLogic } from './entities/TicketBusinessLogic';
export { CompanyBusinessLogic } from './entities/CompanyBusinessLogic';
export { ContactBusinessLogic } from './entities/ContactBusinessLogic';
export { TimeEntryBusinessLogic } from './entities/TimeEntryBusinessLogic';
export { ContractBusinessLogic } from './entities/ContractBusinessLogic';
export { ProjectBusinessLogic } from './entities/ProjectBusinessLogic';
export type { ValidationResult, ValidationError, ValidationWarning, FieldValidator, EntityValidator, CrossEntityValidator } from './validation';
export { BusinessLogicError, ValidationError as BusinessValidationError, WorkflowError, PermissionError, BusinessRuleViolationError, DataIntegrityError, ConfigurationError, ErrorFactory, ErrorAggregator } from './validation/errors';
export { AutotaskBusinessRules } from './rules/AutotaskBusinessRules';
export { AutotaskWorkflows } from './workflows/AutotaskWorkflows';
/**
 * Quick setup helper for initializing the complete business logic system
 */
export declare class AutotaskBusinessLogicSetup {
    /**
     * Initialize a complete business logic system with default configuration
     */
    static createBusinessLogicSystem(): {
        businessEngine: BusinessLogicEngine;
        entityLogic: {
            tickets: TicketBusinessLogic;
            companies: CompanyBusinessLogic;
            contacts: ContactBusinessLogic;
            timeEntries: TimeEntryBusinessLogic;
            contracts: ContractBusinessLogic;
            projects: ProjectBusinessLogic;
        };
    };
    /**
     * Create a business logic system with custom configuration
     */
    static createCustomBusinessLogicSystem(config: {
        enabledValidators?: string[];
        customRules?: any[];
        customWorkflows?: any[];
    }): {
        businessEngine: BusinessLogicEngine;
        entityLogic: {
            tickets: TicketBusinessLogic;
            companies: CompanyBusinessLogic;
            contacts: ContactBusinessLogic;
            timeEntries: TimeEntryBusinessLogic;
            contracts: ContractBusinessLogic;
            projects: ProjectBusinessLogic;
        };
    };
}
//# sourceMappingURL=index.d.ts.map