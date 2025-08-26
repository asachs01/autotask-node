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
export class WorkflowEngine {
  private workflows = new Map<string, WorkflowDefinition>();
  private activeWorkflows = new Map<string, WorkflowExecution>();
  
  constructor() {
    this.initializeDefaultWorkflows();
  }
  
  /**
   * Register a workflow definition
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
  }
  
  /**
   * Execute workflows triggered by an entity operation
   */
  async executeTriggeredWorkflows(context: WorkflowContext): Promise<WorkflowResult[]> {
    const results: WorkflowResult[] = [];
    
    // Find matching workflows
    const matchingWorkflows = Array.from(this.workflows.values())
      .filter(workflow => 
        workflow.entityType === context.entityType &&
        workflow.trigger.condition(context)
      );
    
    // Execute each matching workflow
    for (const workflow of matchingWorkflows) {
      try {
        const result = await this.executeWorkflow(workflow.id, context);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          message: `Workflow ${workflow.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error : new Error('Unknown error')
        });
      }
    }
    
    return results;
  }
  
  /**
   * Execute a specific workflow
   */
  async executeWorkflow(workflowId: string, context: WorkflowContext): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    const execution: WorkflowExecution = {
      id: `${workflowId}-${Date.now()}`,
      workflowId,
      context,
      currentStep: 0,
      status: 'running',
      startTime: new Date(),
      steps: workflow.steps.map(step => ({ ...step, status: 'pending' }))
    };
    
    this.activeWorkflows.set(execution.id, execution);
    
    try {
      return await this.runWorkflowSteps(execution);
    } finally {
      this.activeWorkflows.delete(execution.id);
    }
  }
  
  /**
   * Run workflow steps sequentially
   */
  private async runWorkflowSteps(execution: WorkflowExecution): Promise<WorkflowResult> {
    const workflow = this.workflows.get(execution.workflowId)!;
    
    while (execution.currentStep < execution.steps.length) {
      const step = execution.steps[execution.currentStep];
      step.status = 'running';
      
      try {
        // Check step condition if present
        if (step.condition && !step.condition(execution.context)) {
          step.status = 'skipped';
          execution.currentStep++;
          continue;
        }
        
        // Execute step action
        const stepResult = await step.action(execution.context);
        
        if (stepResult.success) {
          step.status = 'completed';
          
          // Update context with step data if provided
          if (stepResult.data) {
            execution.context.metadata = {
              ...execution.context.metadata,
              ...stepResult.data
            };
          }
          
          // Determine next step
          if (stepResult.nextStep) {
            const nextStepIndex = execution.steps.findIndex(s => s.id === stepResult.nextStep);
            if (nextStepIndex >= 0) {
              execution.currentStep = nextStepIndex;
            } else {
              execution.currentStep++;
            }
          } else {
            execution.currentStep++;
          }
        } else {
          step.status = 'failed';
          
          // Handle step failure based on error handling strategy
          if (step.errorHandling === 'continue' || workflow.errorHandling === 'continue') {
            execution.currentStep++;
            continue;
          } else {
            execution.status = 'failed';
            return {
              success: false,
              message: stepResult.message || `Step ${step.name} failed`,
              error: stepResult.error
            };
          }
        }
      } catch (error) {
        step.status = 'failed';
        execution.status = 'failed';
        
        return {
          success: false,
          message: `Step ${step.name} threw an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error : new Error('Unknown error')
        };
      }
    }
    
    execution.status = 'completed';
    execution.endTime = new Date();
    
    return {
      success: true,
      message: `Workflow ${execution.workflowId} completed successfully`,
      data: execution.context.metadata
    };
  }
  
  /**
   * Initialize default Autotask workflows
   */
  private initializeDefaultWorkflows(): void {
    this.registerWorkflow(this.createTicketEscalationWorkflow());
    this.registerWorkflow(this.createContractRenewalWorkflow());
    this.registerWorkflow(this.createProjectMilestoneWorkflow());
    this.registerWorkflow(this.createTimeEntryApprovalWorkflow());
  }
  
  /**
   * Ticket escalation workflow
   */
  private createTicketEscalationWorkflow(): WorkflowDefinition {
    return {
      id: 'ticket_escalation',
      name: 'Ticket Escalation Workflow',
      description: 'Automatically escalate tickets based on SLA violations',
      entityType: 'Tickets',
      trigger: {
        type: 'field_change',
        condition: (context) => {
          // Trigger on ticket updates or time-based checks
          return context.operation === 'update' || 
                 (context.entity.dueDateTime && new Date(context.entity.dueDateTime) < new Date());
        }
      },
      steps: [
        {
          id: 'check_sla_violation',
          name: 'Check SLA Violation',
          description: 'Determine if ticket violates SLA',
          condition: (context) => {
            return context.entity.dueDateTime && 
                   new Date(context.entity.dueDateTime) < new Date() &&
                   context.entity.status !== 5; // Not completed
          },
          action: async (context) => {
            const hoursOverdue = Math.floor(
              (new Date().getTime() - new Date(context.entity.dueDateTime).getTime()) / (1000 * 60 * 60)
            );
            
            return {
              success: true,
              message: `Ticket is ${hoursOverdue} hours overdue`,
              data: { hoursOverdue }
            };
          }
        },
        {
          id: 'escalate_to_manager',
          name: 'Escalate to Manager',
          description: 'Notify manager of SLA violation',
          condition: (context) => context.metadata?.hoursOverdue > 2,
          action: async (context) => {
            // This would typically send notifications, create tasks, etc.
            return {
              success: true,
              message: 'Manager notified of SLA violation',
              data: { escalated: true, escalationLevel: 1 }
            };
          }
        }
      ]
    };
  }
  
  /**
   * Contract renewal workflow
   */
  private createContractRenewalWorkflow(): WorkflowDefinition {
    return {
      id: 'contract_renewal',
      name: 'Contract Renewal Workflow',
      description: 'Manage contract renewal process',
      entityType: 'Contracts',
      trigger: {
        type: 'time_based',
        condition: (context) => {
          if (!context.entity.endDate) return false;
          
          const endDate = new Date(context.entity.endDate);
          const now = new Date();
          const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          return daysUntilExpiry <= 60 && daysUntilExpiry > 0; // 60 days before expiry
        }
      },
      steps: [
        {
          id: 'create_renewal_opportunity',
          name: 'Create Renewal Opportunity',
          description: 'Create opportunity for contract renewal',
          action: async (context) => {
            // This would create an opportunity record
            return {
              success: true,
              message: 'Renewal opportunity created',
              data: { opportunityId: 'new-opportunity-id' }
            };
          }
        },
        {
          id: 'notify_account_manager',
          name: 'Notify Account Manager',
          description: 'Alert account manager of upcoming renewal',
          action: async (context) => {
            return {
              success: true,
              message: 'Account manager notified',
              data: { notificationSent: true }
            };
          }
        }
      ]
    };
  }
  
  /**
   * Project milestone workflow
   */
  private createProjectMilestoneWorkflow(): WorkflowDefinition {
    return {
      id: 'project_milestone',
      name: 'Project Milestone Workflow',
      description: 'Handle project milestone completions',
      entityType: 'Projects',
      trigger: {
        type: 'field_change',
        condition: (context) => {
          return context.operation === 'update' && 
                 context.entity.percentComplete !== context.previousEntity?.percentComplete;
        }
      },
      steps: [
        {
          id: 'check_milestone_completion',
          name: 'Check Milestone Completion',
          description: 'Check if project milestone is completed',
          condition: (context) => context.entity.percentComplete >= 25,
          action: async (context) => {
            const milestones = [25, 50, 75, 100];
            const currentMilestone = milestones.find(m => 
              context.entity.percentComplete >= m && 
              (context.previousEntity?.percentComplete || 0) < m
            );
            
            return {
              success: true,
              message: `Milestone ${currentMilestone}% reached`,
              data: { milestone: currentMilestone }
            };
          }
        },
        {
          id: 'notify_stakeholders',
          name: 'Notify Stakeholders',
          description: 'Notify project stakeholders of milestone completion',
          action: async (context) => {
            return {
              success: true,
              message: 'Stakeholders notified of milestone completion',
              data: { stakeholdersNotified: true }
            };
          }
        }
      ]
    };
  }
  
  /**
   * Time entry approval workflow
   */
  private createTimeEntryApprovalWorkflow(): WorkflowDefinition {
    return {
      id: 'time_entry_approval',
      name: 'Time Entry Approval Workflow',
      description: 'Handle time entry approval process',
      entityType: 'TimeEntries',
      trigger: {
        type: 'field_change',
        condition: (context) => {
          return context.operation === 'create' || 
                 (context.operation === 'update' && context.entity.hoursWorked > 8);
        }
      },
      steps: [
        {
          id: 'check_approval_required',
          name: 'Check if Approval Required',
          description: 'Determine if time entry needs approval',
          condition: (context) => context.entity.hoursWorked > 8 || context.entity.isBillable,
          action: async (context) => {
            return {
              success: true,
              message: 'Time entry requires approval',
              data: { requiresApproval: true }
            };
          }
        },
        {
          id: 'submit_for_approval',
          name: 'Submit for Approval',
          description: 'Submit time entry for manager approval',
          action: async (context) => {
            return {
              success: true,
              message: 'Time entry submitted for approval',
              data: { approvalStatus: 'pending' }
            };
          }
        }
      ]
    };
  }
  
  /**
   * Get active workflow executions
   */
  getActiveWorkflows(): WorkflowExecution[] {
    return Array.from(this.activeWorkflows.values());
  }
  
  /**
   * Get workflow definition by ID
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }
  
  /**
   * Get all registered workflows
   */
  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  context: WorkflowContext;
  currentStep: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  steps: (WorkflowStep & { status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' })[];
}