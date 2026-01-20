/**
 * Workflow engine for managing Autotask business processes
 *
 * Handles state transitions, approval workflows, escalation rules,
 * and automated business processes
 */
export interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    condition?: (context: WorkflowContext) => boolean;
    action: (context: WorkflowContext) => Promise<WorkflowResult>;
    nextSteps?: string[];
    errorHandling?: 'stop' | 'continue' | 'retry';
}
export interface WorkflowContext {
    entityType: string;
    entity: any;
    previousEntity?: any;
    user?: any;
    operation: 'create' | 'update' | 'delete';
    metadata?: Record<string, any>;
}
export interface WorkflowResult {
    success: boolean;
    message?: string;
    data?: any;
    nextStep?: string;
    error?: Error;
}
export interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    entityType: string;
    trigger: WorkflowTrigger;
    steps: WorkflowStep[];
    errorHandling?: 'stop' | 'continue';
}
export interface WorkflowTrigger {
    type: 'field_change' | 'status_change' | 'time_based' | 'manual';
    condition: (context: WorkflowContext) => boolean;
}
/**
 * Workflow engine implementation
 */
export declare class WorkflowEngine {
    private workflows;
    private activeWorkflows;
    constructor();
    /**
     * Register a workflow definition
     */
    registerWorkflow(workflow: WorkflowDefinition): void;
    /**
     * Execute workflows triggered by an entity operation
     */
    executeTriggeredWorkflows(context: WorkflowContext): Promise<WorkflowResult[]>;
    /**
     * Execute a specific workflow
     */
    executeWorkflow(workflowId: string, context: WorkflowContext): Promise<WorkflowResult>;
    /**
     * Run workflow steps sequentially
     */
    private runWorkflowSteps;
    /**
     * Initialize default Autotask workflows
     */
    private initializeDefaultWorkflows;
    /**
     * Ticket escalation workflow
     */
    private createTicketEscalationWorkflow;
    /**
     * Contract renewal workflow
     */
    private createContractRenewalWorkflow;
    /**
     * Project milestone workflow
     */
    private createProjectMilestoneWorkflow;
    /**
     * Time entry approval workflow
     */
    private createTimeEntryApprovalWorkflow;
    /**
     * Get active workflow executions
     */
    getActiveWorkflows(): WorkflowExecution[];
    /**
     * Get workflow definition by ID
     */
    getWorkflow(workflowId: string): WorkflowDefinition | undefined;
    /**
     * Get all registered workflows
     */
    getAllWorkflows(): WorkflowDefinition[];
}
interface WorkflowExecution {
    id: string;
    workflowId: string;
    context: WorkflowContext;
    currentStep: number;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    steps: (WorkflowStep & {
        status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    })[];
}
export {};
//# sourceMappingURL=WorkflowEngine.d.ts.map