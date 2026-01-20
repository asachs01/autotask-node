"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketBusinessLogic = void 0;
/**
 * Ticket-specific business logic and workflow management
 */
class TicketBusinessLogic {
    constructor(businessEngine) {
        this.businessEngine = businessEngine;
        /**
         * Autotask ticket statuses with their business meanings
         */
        this.TICKET_STATUSES = {
            NEW: 1,
            IN_PROGRESS: 2,
            COMPLETE: 5,
            WAITING_CUSTOMER: 6,
            WAITING_MATERIALS: 13,
            ESCALATED: 14
        };
        /**
         * Ticket priorities with SLA implications
         */
        this.TICKET_PRIORITIES = {
            LOW: 1,
            MEDIUM: 2,
            HIGH: 3,
            CRITICAL: 4
        };
    }
    /**
     * Validate and process ticket creation
     */
    async createTicket(ticketData, context) {
        // Validate the ticket data
        const result = await this.businessEngine.processBusinessRules('create', 'Tickets', ticketData, context);
        // Apply ticket-specific business logic
        const processedTicket = this.applyTicketCreationLogic(ticketData, context);
        return {
            isValid: result.isAllowed,
            validationResult: result.validationResult,
            processedTicket: result.transformedEntity || processedTicket,
            suggestedActions: result.suggestedActions || []
        };
    }
    /**
     * Validate and process ticket status changes
     */
    async updateTicketStatus(ticketId, newStatus, currentTicket, context) {
        const updatedTicket = {
            ...currentTicket,
            status: newStatus,
            resolution: context?.resolution
        };
        const result = await this.businessEngine.processBusinessRules('update', 'Tickets', updatedTicket, {
            previousEntity: currentTicket,
            user: context?.user
        });
        // Get status-specific requirements
        const requirements = this.getStatusRequirements(newStatus, currentTicket);
        return {
            isValid: result.isAllowed && requirements.canTransition,
            validationResult: result.validationResult,
            processedUpdate: result.transformedEntity || updatedTicket,
            requiredFields: requirements.requiredFields,
            warnings: requirements.warnings
        };
    }
    /**
     * Calculate SLA due dates based on ticket priority and type
     */
    calculateSLADueDate(ticket, contractSLA) {
        const now = new Date();
        const priority = ticket.priority || this.TICKET_PRIORITIES.MEDIUM;
        // Default SLA times based on priority (in hours)
        const defaultSLA = {
            [this.TICKET_PRIORITIES.CRITICAL]: { response: 1, resolution: 4 },
            [this.TICKET_PRIORITIES.HIGH]: { response: 2, resolution: 8 },
            [this.TICKET_PRIORITIES.MEDIUM]: { response: 4, resolution: 24 },
            [this.TICKET_PRIORITIES.LOW]: { response: 8, resolution: 72 }
        };
        const defaultSlaForPriority = defaultSLA[priority] || defaultSLA[this.TICKET_PRIORITIES.MEDIUM];
        // Calculate due dates (simplified - would use business hours in production)
        const responseHours = contractSLA ? contractSLA.responseTimeHours : defaultSlaForPriority.response;
        const resolutionHours = contractSLA ? contractSLA.resolutionTimeHours : defaultSlaForPriority.resolution;
        const responseBy = new Date(now.getTime() + responseHours * 60 * 60 * 1000);
        const resolveBy = new Date(now.getTime() + resolutionHours * 60 * 60 * 1000);
        return {
            responseBy,
            resolveBy,
            businessHoursOnly: true
        };
    }
    /**
     * Check if ticket requires escalation
     */
    checkEscalationRules(ticket) {
        const reasons = [];
        const suggestedActions = [];
        let escalationLevel = 0;
        const now = new Date();
        // Check SLA violations
        if (ticket.dueDateTime && new Date(ticket.dueDateTime) < now) {
            const hoursOverdue = Math.floor((now.getTime() - new Date(ticket.dueDateTime).getTime()) / (1000 * 60 * 60));
            reasons.push(`SLA violated by ${hoursOverdue} hours`);
            escalationLevel = Math.min(3, Math.floor(hoursOverdue / 4) + 1);
            suggestedActions.push('Notify manager', 'Review resource allocation');
        }
        // Check if ticket has been in waiting status too long
        if (ticket.status === this.TICKET_STATUSES.WAITING_CUSTOMER && ticket.lastActivityDate) {
            const daysSinceActivity = Math.floor((now.getTime() - new Date(ticket.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceActivity > 7) {
                reasons.push(`No customer response for ${daysSinceActivity} days`);
                escalationLevel = Math.max(escalationLevel, 1);
                suggestedActions.push('Contact customer', 'Consider closing ticket');
            }
        }
        // Check for critical priority without assignment
        if (ticket.priority === this.TICKET_PRIORITIES.CRITICAL && !ticket.assignedResourceID) {
            reasons.push('Critical ticket without assigned resource');
            escalationLevel = Math.max(escalationLevel, 2);
            suggestedActions.push('Assign senior technician immediately');
        }
        return {
            requiresEscalation: reasons.length > 0,
            escalationLevel,
            reasons,
            suggestedActions
        };
    }
    /**
     * Get ticket metrics and KPIs
     */
    calculateTicketMetrics(tickets) {
        if (tickets.length === 0) {
            return {
                totalTickets: 0,
                averageResolutionTime: 0,
                slaCompliance: 0,
                statusDistribution: {},
                priorityDistribution: {},
                escalatedTickets: 0
            };
        }
        const completedTickets = tickets.filter(t => t.status === this.TICKET_STATUSES.COMPLETE);
        // Calculate average resolution time
        let totalResolutionTime = 0;
        completedTickets.forEach(ticket => {
            if (ticket.createDate && ticket.completedDate) {
                const resolutionTime = new Date(ticket.completedDate).getTime() -
                    new Date(ticket.createDate).getTime();
                totalResolutionTime += resolutionTime;
            }
        });
        const averageResolutionTime = completedTickets.length > 0
            ? totalResolutionTime / completedTickets.length / (1000 * 60 * 60) // Convert to hours
            : 0;
        // Calculate SLA compliance
        const ticketsWithSLA = tickets.filter(t => t.dueDateTime);
        const slaCompliant = ticketsWithSLA.filter(t => {
            if (t.status === this.TICKET_STATUSES.COMPLETE) {
                return t.completedDate && new Date(t.completedDate) <= new Date(t.dueDateTime);
            }
            return new Date() <= new Date(t.dueDateTime);
        }).length;
        const slaCompliance = ticketsWithSLA.length > 0
            ? (slaCompliant / ticketsWithSLA.length) * 100
            : 100;
        // Status distribution
        const statusDistribution = {};
        tickets.forEach(ticket => {
            const statusKey = Object.keys(this.TICKET_STATUSES).find(key => this.TICKET_STATUSES[key] === ticket.status) || 'UNKNOWN';
            statusDistribution[statusKey] = (statusDistribution[statusKey] || 0) + 1;
        });
        // Priority distribution
        const priorityDistribution = {};
        tickets.forEach(ticket => {
            const priorityKey = Object.keys(this.TICKET_PRIORITIES).find(key => this.TICKET_PRIORITIES[key] === ticket.priority) || 'UNKNOWN';
            priorityDistribution[priorityKey] = (priorityDistribution[priorityKey] || 0) + 1;
        });
        // Count escalated tickets
        const escalatedTickets = tickets.filter(t => t.status === this.TICKET_STATUSES.ESCALATED).length;
        return {
            totalTickets: tickets.length,
            averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
            slaCompliance: Math.round(slaCompliance * 100) / 100,
            statusDistribution,
            priorityDistribution,
            escalatedTickets
        };
    }
    /**
     * Apply business logic during ticket creation
     */
    applyTicketCreationLogic(ticketData, context) {
        const processed = { ...ticketData };
        // Auto-set priority if not specified
        if (!processed.priority) {
            processed.priority = this.TICKET_PRIORITIES.MEDIUM;
        }
        // Auto-set status if not specified
        if (!processed.status) {
            processed.status = this.TICKET_STATUSES.NEW;
        }
        // Calculate SLA dates if priority is set
        if (processed.priority) {
            const sla = this.calculateSLADueDate(processed);
            processed.dueDateTime = processed.dueDateTime || sla.resolveBy.toISOString();
            processed._slaResponseBy = sla.responseBy.toISOString();
        }
        // Auto-assign based on queue or category (simplified)
        if (processed.queueID && !processed.assignedResourceID) {
            processed._requiresAssignment = true;
        }
        return processed;
    }
    /**
     * Get requirements for specific status transitions
     */
    getStatusRequirements(newStatus, currentTicket) {
        const requiredFields = [];
        const warnings = [];
        const canTransition = true;
        switch (newStatus) {
            case this.TICKET_STATUSES.COMPLETE:
                if (!currentTicket.resolution) {
                    requiredFields.push('resolution');
                }
                if (currentTicket.status === this.TICKET_STATUSES.NEW) {
                    warnings.push('Completing ticket without setting to In Progress first');
                }
                break;
            case this.TICKET_STATUSES.IN_PROGRESS:
                if (!currentTicket.assignedResourceID) {
                    warnings.push('Consider assigning a resource when setting to In Progress');
                }
                break;
            case this.TICKET_STATUSES.WAITING_CUSTOMER:
                if (!currentTicket.lastCustomerNotification) {
                    warnings.push('Consider logging customer communication');
                }
                break;
            case this.TICKET_STATUSES.ESCALATED:
                if (!currentTicket.escalationReason) {
                    requiredFields.push('escalationReason');
                }
                break;
        }
        return {
            canTransition: canTransition && requiredFields.length === 0,
            requiredFields,
            warnings
        };
    }
}
exports.TicketBusinessLogic = TicketBusinessLogic;
//# sourceMappingURL=TicketBusinessLogic.js.map