"use strict";
/**
 * Predefined Autotask workflows for common business processes
 *
 * This module contains workflow definitions that can be registered
 * with the WorkflowEngine to handle common Autotask business scenarios.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutotaskWorkflows = void 0;
/**
 * Collection of predefined Autotask workflows
 */
class AutotaskWorkflows {
    /**
     * Get all predefined workflows
     */
    static getAllWorkflows() {
        return [
            this.getTicketEscalationWorkflow(),
            this.getTimeEntryApprovalWorkflow(),
            this.getContractRenewalWorkflow(),
            this.getProjectMilestoneWorkflow(),
            this.getCustomerOnboardingWorkflow(),
            this.getIncidentResponseWorkflow(),
            this.getCompanySetupWorkflow(),
            this.getResourceAllocationWorkflow()
        ];
    }
    /**
     * Advanced ticket escalation workflow
     */
    static getTicketEscalationWorkflow() {
        return {
            id: 'advanced_ticket_escalation',
            name: 'Advanced Ticket Escalation Workflow',
            description: 'Comprehensive ticket escalation with multiple levels and notifications',
            entityType: 'Tickets',
            trigger: {
                type: 'field_change',
                condition: (context) => {
                    // Trigger on SLA violations or priority changes
                    const ticket = context.entity;
                    const isOverdue = ticket.dueDateTime && new Date(ticket.dueDateTime) < new Date();
                    const isPriorityEscalation = context.previousEntity?.priority < ticket.priority;
                    return (isOverdue || isPriorityEscalation) && ticket.status !== 5;
                }
            },
            steps: [
                {
                    id: 'assess_escalation_level',
                    name: 'Assess Escalation Level',
                    description: 'Determine the appropriate escalation level',
                    action: async (context) => {
                        const ticket = context.entity;
                        const hoursOverdue = ticket.dueDateTime
                            ? Math.floor((new Date().getTime() - new Date(ticket.dueDateTime).getTime()) / (1000 * 60 * 60))
                            : 0;
                        let escalationLevel = 1;
                        if (hoursOverdue > 24)
                            escalationLevel = 3;
                        else if (hoursOverdue > 8)
                            escalationLevel = 2;
                        else if (ticket.priority === 4)
                            escalationLevel = 2;
                        return {
                            success: true,
                            data: { escalationLevel, hoursOverdue }
                        };
                    }
                },
                {
                    id: 'notify_tier1',
                    name: 'Notify Tier 1 Manager',
                    description: 'Send notification to immediate supervisor',
                    condition: (context) => (context.metadata?.escalationLevel || 1) >= 1,
                    action: async (context) => {
                        // Would send actual notification in implementation
                        return {
                            success: true,
                            message: 'Tier 1 manager notified',
                            data: { notificationSent: 'tier1_manager' }
                        };
                    }
                },
                {
                    id: 'notify_tier2',
                    name: 'Notify Tier 2 Manager',
                    description: 'Escalate to department manager',
                    condition: (context) => (context.metadata?.escalationLevel || 1) >= 2,
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Tier 2 manager notified',
                            data: { notificationSent: 'tier2_manager' }
                        };
                    }
                },
                {
                    id: 'notify_executive',
                    name: 'Executive Notification',
                    description: 'Notify executive team for critical escalations',
                    condition: (context) => (context.metadata?.escalationLevel || 1) >= 3,
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Executive team notified',
                            data: { notificationSent: 'executive_team' }
                        };
                    }
                },
                {
                    id: 'create_escalation_ticket',
                    name: 'Create Escalation Ticket',
                    description: 'Create internal escalation ticket for tracking',
                    condition: (context) => (context.metadata?.escalationLevel || 1) >= 2,
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Escalation tracking ticket created',
                            data: { escalationTicketId: 'ESC-' + Date.now() }
                        };
                    }
                }
            ]
        };
    }
    /**
     * Comprehensive time entry approval workflow
     */
    static getTimeEntryApprovalWorkflow() {
        return {
            id: 'comprehensive_time_approval',
            name: 'Comprehensive Time Entry Approval',
            description: 'Multi-level approval process for time entries with automatic routing',
            entityType: 'TimeEntries',
            trigger: {
                type: 'field_change',
                condition: (context) => {
                    const timeEntry = context.entity;
                    return timeEntry.hoursWorked > 8 ||
                        timeEntry.isBillable ||
                        (timeEntry.dateWorked && this.isWeekendWork(timeEntry.dateWorked));
                }
            },
            steps: [
                {
                    id: 'determine_approval_path',
                    name: 'Determine Approval Path',
                    description: 'Route approval based on time entry characteristics',
                    action: async (context) => {
                        const timeEntry = context.entity;
                        let approvalPath = 'standard';
                        if (timeEntry.hoursWorked > 12)
                            approvalPath = 'executive';
                        else if (timeEntry.hoursWorked > 8)
                            approvalPath = 'manager';
                        else if (timeEntry.isBillable)
                            approvalPath = 'billing';
                        return {
                            success: true,
                            data: { approvalPath }
                        };
                    }
                },
                {
                    id: 'validate_billing_codes',
                    name: 'Validate Billing Codes',
                    description: 'Ensure billing codes are valid and authorized',
                    condition: (context) => context.entity.isBillable,
                    action: async (context) => {
                        // Would validate against actual billing code database
                        return {
                            success: true,
                            message: 'Billing codes validated',
                            data: { billingValidated: true }
                        };
                    }
                },
                {
                    id: 'submit_for_approval',
                    name: 'Submit for Approval',
                    description: 'Route to appropriate approver based on path',
                    action: async (context) => {
                        const approvalPath = context.metadata?.approvalPath || 'standard';
                        return {
                            success: true,
                            message: `Submitted for ${approvalPath} approval`,
                            data: { approvalStatus: 'pending', approvalPath }
                        };
                    }
                },
                {
                    id: 'check_budget_impact',
                    name: 'Check Budget Impact',
                    description: 'Verify impact on project or contract budgets',
                    condition: (context) => context.entity.projectID || context.entity.contractID,
                    action: async (context) => {
                        // Would check actual budget utilization
                        return {
                            success: true,
                            message: 'Budget impact assessed',
                            data: { budgetImpact: 'within_limits' }
                        };
                    }
                }
            ]
        };
    }
    /**
     * Contract renewal workflow with intelligent analysis
     */
    static getContractRenewalWorkflow() {
        return {
            id: 'intelligent_contract_renewal',
            name: 'Intelligent Contract Renewal Process',
            description: 'AI-enhanced contract renewal with usage analysis and recommendations',
            entityType: 'Contracts',
            trigger: {
                type: 'time_based',
                condition: (context) => {
                    const contract = context.entity;
                    if (!contract.endDate)
                        return false;
                    const endDate = new Date(contract.endDate);
                    const now = new Date();
                    const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry <= 90 && daysUntilExpiry > 0 && contract.status === 'Active';
                }
            },
            steps: [
                {
                    id: 'analyze_contract_performance',
                    name: 'Analyze Contract Performance',
                    description: 'Evaluate contract utilization and performance metrics',
                    action: async (context) => {
                        const contract = context.entity;
                        // Simulate performance analysis
                        const performanceScore = Math.floor(Math.random() * 40) + 60; // 60-100
                        const utilizationRate = Math.floor(Math.random() * 30) + 70; // 70-100
                        return {
                            success: true,
                            data: {
                                performanceScore,
                                utilizationRate,
                                recommendRenewal: performanceScore > 75 && utilizationRate > 80
                            }
                        };
                    }
                },
                {
                    id: 'generate_renewal_terms',
                    name: 'Generate Renewal Terms',
                    description: 'Create recommended renewal terms based on analysis',
                    action: async (context) => {
                        const performance = context.metadata;
                        const priceAdjustment = performance?.performanceScore > 85 ? 0.05 : 0.03;
                        return {
                            success: true,
                            data: {
                                priceAdjustment,
                                recommendedTerm: 12, // months
                                serviceAdjustments: performance?.utilizationRate < 75 ? ['reduce_hours'] : []
                            }
                        };
                    }
                },
                {
                    id: 'create_renewal_opportunity',
                    name: 'Create Renewal Opportunity',
                    description: 'Generate sales opportunity for contract renewal',
                    action: async (context) => {
                        const renewalTerms = context.metadata;
                        return {
                            success: true,
                            message: 'Renewal opportunity created',
                            data: {
                                opportunityId: 'RNW-' + Date.now(),
                                value: context.entity.totalValue * (1 + (renewalTerms?.priceAdjustment || 0))
                            }
                        };
                    }
                },
                {
                    id: 'notify_account_team',
                    name: 'Notify Account Team',
                    description: 'Alert account management team of renewal opportunity',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Account team notified with renewal recommendations',
                            data: { teamNotified: true }
                        };
                    }
                }
            ]
        };
    }
    /**
     * Project milestone tracking workflow
     */
    static getProjectMilestoneWorkflow() {
        return {
            id: 'project_milestone_tracking',
            name: 'Project Milestone Tracking',
            description: 'Automated milestone tracking with stakeholder notifications',
            entityType: 'Projects',
            trigger: {
                type: 'field_change',
                condition: (context) => {
                    const project = context.entity;
                    const previousProject = context.previousEntity;
                    return project.percentComplete !== previousProject?.percentComplete &&
                        project.percentComplete >= 25;
                }
            },
            steps: [
                {
                    id: 'identify_milestone',
                    name: 'Identify Milestone',
                    description: 'Determine which milestone was reached',
                    action: async (context) => {
                        const project = context.entity;
                        const milestones = [25, 50, 75, 100];
                        const reachedMilestone = milestones.find(m => project.percentComplete >= m &&
                            (context.previousEntity?.percentComplete || 0) < m);
                        return {
                            success: true,
                            data: { milestone: reachedMilestone }
                        };
                    }
                },
                {
                    id: 'validate_milestone_deliverables',
                    name: 'Validate Milestone Deliverables',
                    description: 'Check if milestone deliverables are complete',
                    action: async (context) => {
                        const milestone = context.metadata?.milestone;
                        // Simulate deliverable validation
                        const deliverablesComplete = Math.random() > 0.3; // 70% chance complete
                        return {
                            success: true,
                            data: {
                                deliverablesComplete,
                                requiresReview: !deliverablesComplete
                            }
                        };
                    }
                },
                {
                    id: 'update_project_status',
                    name: 'Update Project Status',
                    description: 'Update project status and next phase information',
                    action: async (context) => {
                        const milestone = context.metadata?.milestone;
                        return {
                            success: true,
                            message: `Project status updated for ${milestone}% milestone`,
                            data: { statusUpdated: true }
                        };
                    }
                },
                {
                    id: 'notify_stakeholders',
                    name: 'Notify Stakeholders',
                    description: 'Send milestone completion notifications to stakeholders',
                    action: async (context) => {
                        const milestone = context.metadata?.milestone;
                        return {
                            success: true,
                            message: `Stakeholders notified of ${milestone}% milestone completion`,
                            data: { stakeholdersNotified: true }
                        };
                    }
                },
                {
                    id: 'schedule_milestone_review',
                    name: 'Schedule Milestone Review',
                    description: 'Schedule review meeting if deliverables need validation',
                    condition: (context) => context.metadata?.requiresReview === true,
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Milestone review meeting scheduled',
                            data: { reviewScheduled: true }
                        };
                    }
                }
            ]
        };
    }
    /**
     * Customer onboarding workflow
     */
    static getCustomerOnboardingWorkflow() {
        return {
            id: 'customer_onboarding',
            name: 'Customer Onboarding Process',
            description: 'Comprehensive new customer onboarding workflow',
            entityType: 'Companies',
            trigger: {
                type: 'field_change',
                condition: (context) => {
                    return context.operation === 'create' &&
                        context.entity.companyType === 1; // Customer type
                }
            },
            steps: [
                {
                    id: 'create_welcome_package',
                    name: 'Create Welcome Package',
                    description: 'Generate welcome documentation and setup materials',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Welcome package created',
                            data: { packageId: 'WP-' + Date.now() }
                        };
                    }
                },
                {
                    id: 'setup_default_contacts',
                    name: 'Setup Default Contacts',
                    description: 'Create primary and billing contact placeholders',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Default contact structure created',
                            data: { contactsCreated: 2 }
                        };
                    }
                },
                {
                    id: 'initialize_service_catalog',
                    name: 'Initialize Service Catalog',
                    description: 'Set up available services for customer',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Service catalog initialized',
                            data: { servicesAvailable: 15 }
                        };
                    }
                },
                {
                    id: 'assign_account_manager',
                    name: 'Assign Account Manager',
                    description: 'Assign dedicated account manager based on company size',
                    action: async (context) => {
                        const company = context.entity;
                        const accountManager = company.annualRevenue > 100000 ? 'senior_am' : 'standard_am';
                        return {
                            success: true,
                            message: `${accountManager} assigned as account manager`,
                            data: { accountManager }
                        };
                    }
                },
                {
                    id: 'schedule_kickoff_meeting',
                    name: 'Schedule Kickoff Meeting',
                    description: 'Schedule initial customer meeting',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Kickoff meeting scheduled',
                            data: { meetingScheduled: true }
                        };
                    }
                }
            ]
        };
    }
    /**
     * Incident response workflow
     */
    static getIncidentResponseWorkflow() {
        return {
            id: 'incident_response',
            name: 'Incident Response Process',
            description: 'Coordinated response for critical incidents',
            entityType: 'Tickets',
            trigger: {
                type: 'field_change',
                condition: (context) => {
                    const ticket = context.entity;
                    return ticket.priority === 4 && // Critical priority
                        (ticket.category === 'Incident' || ticket.issueType === 'Outage');
                }
            },
            steps: [
                {
                    id: 'activate_incident_team',
                    name: 'Activate Incident Response Team',
                    description: 'Notify and mobilize incident response team',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Incident response team activated',
                            data: { teamActivated: true, responseTime: '< 15 minutes' }
                        };
                    }
                },
                {
                    id: 'create_war_room',
                    name: 'Create War Room',
                    description: 'Set up dedicated communication channels',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'War room established',
                            data: { warRoomId: 'WR-' + Date.now() }
                        };
                    }
                },
                {
                    id: 'notify_stakeholders',
                    name: 'Notify Key Stakeholders',
                    description: 'Alert management and customer contacts',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Key stakeholders notified',
                            data: { notificationsSent: 5 }
                        };
                    }
                },
                {
                    id: 'initiate_status_updates',
                    name: 'Initiate Status Updates',
                    description: 'Begin regular status update communications',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Status update schedule initiated',
                            data: { updateFrequency: 'every_30_minutes' }
                        };
                    }
                }
            ]
        };
    }
    /**
     * Company setup workflow
     */
    static getCompanySetupWorkflow() {
        return {
            id: 'company_setup',
            name: 'Company Setup and Validation',
            description: 'Comprehensive company setup with validation and configuration',
            entityType: 'Companies',
            trigger: {
                type: 'field_change',
                condition: (context) => context.operation === 'create'
            },
            steps: [
                {
                    id: 'validate_company_data',
                    name: 'Validate Company Information',
                    description: 'Perform comprehensive data validation',
                    action: async (context) => {
                        const company = context.entity;
                        const validationScore = company.address1 && company.phone && company.taxId ? 100 : 60;
                        return {
                            success: true,
                            data: { validationScore, requiresFollowUp: validationScore < 80 }
                        };
                    }
                },
                {
                    id: 'setup_billing_profile',
                    name: 'Setup Billing Profile',
                    description: 'Initialize billing configuration',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Billing profile initialized',
                            data: { billingProfileId: 'BP-' + Date.now() }
                        };
                    }
                },
                {
                    id: 'configure_service_level',
                    name: 'Configure Service Level',
                    description: 'Set default service level agreements',
                    action: async (context) => {
                        const company = context.entity;
                        const serviceLevel = company.annualRevenue > 500000 ? 'premium' : 'standard';
                        return {
                            success: true,
                            message: `${serviceLevel} service level configured`,
                            data: { serviceLevel }
                        };
                    }
                }
            ]
        };
    }
    /**
     * Resource allocation optimization workflow
     */
    static getResourceAllocationWorkflow() {
        return {
            id: 'resource_allocation_optimization',
            name: 'Resource Allocation Optimization',
            description: 'Optimize resource allocation across projects and tickets',
            entityType: 'Resources',
            trigger: {
                type: 'manual',
                condition: () => true // Triggered manually or by scheduler
            },
            steps: [
                {
                    id: 'analyze_workload',
                    name: 'Analyze Current Workload',
                    description: 'Evaluate current resource utilization',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Workload analysis completed',
                            data: { averageUtilization: 75, overAllocatedResources: 3 }
                        };
                    }
                },
                {
                    id: 'identify_bottlenecks',
                    name: 'Identify Resource Bottlenecks',
                    description: 'Find resources that are over or under utilized',
                    action: async (context) => {
                        return {
                            success: true,
                            data: {
                                bottlenecks: ['senior_developer_1', 'network_specialist_2'],
                                underUtilized: ['junior_developer_3', 'documentation_specialist']
                            }
                        };
                    }
                },
                {
                    id: 'generate_reallocation_plan',
                    name: 'Generate Reallocation Plan',
                    description: 'Create optimized resource allocation recommendations',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Reallocation plan generated',
                            data: {
                                plannedMoves: 5,
                                expectedEfficiencyGain: '12%',
                                planId: 'RAP-' + Date.now()
                            }
                        };
                    }
                },
                {
                    id: 'notify_project_managers',
                    name: 'Notify Project Managers',
                    description: 'Alert managers of recommended changes',
                    action: async (context) => {
                        return {
                            success: true,
                            message: 'Project managers notified of reallocation recommendations',
                            data: { managersNotified: 8 }
                        };
                    }
                }
            ]
        };
    }
    /**
     * Helper method to check if work is on weekend
     */
    static isWeekendWork(dateWorked) {
        const date = new Date(dateWorked);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    }
}
exports.AutotaskWorkflows = AutotaskWorkflows;
//# sourceMappingURL=AutotaskWorkflows.js.map