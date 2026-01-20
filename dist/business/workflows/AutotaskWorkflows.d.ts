/**
 * Predefined Autotask workflows for common business processes
 *
 * This module contains workflow definitions that can be registered
 * with the WorkflowEngine to handle common Autotask business scenarios.
 */
import { WorkflowDefinition } from '../core/WorkflowEngine';
/**
 * Collection of predefined Autotask workflows
 */
export declare class AutotaskWorkflows {
    /**
     * Get all predefined workflows
     */
    static getAllWorkflows(): WorkflowDefinition[];
    /**
     * Advanced ticket escalation workflow
     */
    static getTicketEscalationWorkflow(): WorkflowDefinition;
    /**
     * Comprehensive time entry approval workflow
     */
    static getTimeEntryApprovalWorkflow(): WorkflowDefinition;
    /**
     * Contract renewal workflow with intelligent analysis
     */
    static getContractRenewalWorkflow(): WorkflowDefinition;
    /**
     * Project milestone tracking workflow
     */
    static getProjectMilestoneWorkflow(): WorkflowDefinition;
    /**
     * Customer onboarding workflow
     */
    static getCustomerOnboardingWorkflow(): WorkflowDefinition;
    /**
     * Incident response workflow
     */
    static getIncidentResponseWorkflow(): WorkflowDefinition;
    /**
     * Company setup workflow
     */
    static getCompanySetupWorkflow(): WorkflowDefinition;
    /**
     * Resource allocation optimization workflow
     */
    static getResourceAllocationWorkflow(): WorkflowDefinition;
    /**
     * Helper method to check if work is on weekend
     */
    private static isWeekendWork;
}
//# sourceMappingURL=AutotaskWorkflows.d.ts.map