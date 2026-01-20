import { BusinessLogicEngine } from '../core/BusinessLogicEngine';
import { ValidationResult } from '../validation';
/**
 * Ticket-specific business logic and workflow management
 */
export declare class TicketBusinessLogic {
    private businessEngine;
    constructor(businessEngine: BusinessLogicEngine);
    /**
     * Autotask ticket statuses with their business meanings
     */
    private readonly TICKET_STATUSES;
    /**
     * Ticket priorities with SLA implications
     */
    private readonly TICKET_PRIORITIES;
    /**
     * Validate and process ticket creation
     */
    createTicket(ticketData: any, context?: {
        user?: any;
        relatedEntities?: Record<string, any>;
    }): Promise<{
        isValid: boolean;
        validationResult: ValidationResult;
        processedTicket: any;
        suggestedActions: string[];
    }>;
    /**
     * Validate and process ticket status changes
     */
    updateTicketStatus(ticketId: number, newStatus: number, currentTicket: any, context?: {
        user?: any;
        resolution?: string;
        timeEntries?: any[];
    }): Promise<{
        isValid: boolean;
        validationResult: ValidationResult;
        processedUpdate: any;
        requiredFields: string[];
        warnings: string[];
    }>;
    /**
     * Calculate SLA due dates based on ticket priority and type
     */
    calculateSLADueDate(ticket: any, contractSLA?: {
        responseTimeHours: number;
        resolutionTimeHours: number;
    }): {
        responseBy: Date;
        resolveBy: Date;
        businessHoursOnly: boolean;
    };
    /**
     * Check if ticket requires escalation
     */
    checkEscalationRules(ticket: any): {
        requiresEscalation: boolean;
        escalationLevel: number;
        reasons: string[];
        suggestedActions: string[];
    };
    /**
     * Get ticket metrics and KPIs
     */
    calculateTicketMetrics(tickets: any[]): {
        totalTickets: number;
        averageResolutionTime: number;
        slaCompliance: number;
        statusDistribution: Record<string, number>;
        priorityDistribution: Record<string, number>;
        escalatedTickets: number;
    };
    /**
     * Apply business logic during ticket creation
     */
    private applyTicketCreationLogic;
    /**
     * Get requirements for specific status transitions
     */
    private getStatusRequirements;
}
//# sourceMappingURL=TicketBusinessLogic.d.ts.map