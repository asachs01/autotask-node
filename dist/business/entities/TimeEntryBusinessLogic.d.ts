import { BusinessLogicEngine } from '../core/BusinessLogicEngine';
import { ValidationResult } from '../validation';
/**
 * Time entry-specific business logic for billing, approval workflows, and time tracking
 */
export declare class TimeEntryBusinessLogic {
    private businessEngine;
    constructor(businessEngine: BusinessLogicEngine);
    /**
     * Time entry approval statuses
     */
    private readonly APPROVAL_STATUSES;
    /**
     * Validate and process time entry creation
     */
    createTimeEntry(timeEntryData: any, context?: {
        user?: any;
        billingRates?: Record<string, number>;
        contractInfo?: any;
        projectInfo?: any;
        ticketInfo?: any;
    }): Promise<{
        isValid: boolean;
        validationResult: ValidationResult;
        processedTimeEntry: any;
        billingCalculation: {
            isBillable: boolean;
            billingRate?: number;
            billingAmount?: number;
            costRate?: number;
            costAmount?: number;
        };
        approvalRequired: boolean;
        suggestedActions: string[];
    }>;
    /**
     * Process time entry approval workflow
     */
    processApproval(timeEntryId: number, action: 'submit' | 'approve' | 'reject', currentTimeEntry: any, context?: {
        approver?: any;
        comments?: string;
        reason?: string;
    }): Promise<{
        isValid: boolean;
        validationResult: ValidationResult;
        newStatus: number;
        nextSteps: string[];
        notifications: {
            recipients: string[];
            message: string;
        }[];
    }>;
    /**
     * Calculate comprehensive billing information
     */
    calculateBilling(timeEntry: any, context?: {
        billingRates?: Record<string, number>;
        contractInfo?: any;
        projectInfo?: any;
    }): {
        isBillable: boolean;
        billingRate?: number;
        billingAmount?: number;
        costRate?: number;
        costAmount?: number;
        markup?: number;
        profitAmount?: number;
    };
    /**
     * Validate time entry against project budget and contract limits
     */
    validateAgainstBudgets(timeEntry: any, context?: {
        projectBudget?: {
            totalHours: number;
            usedHours: number;
            totalAmount: number;
            usedAmount: number;
        };
        contractLimits?: {
            monthlyHours: number;
            usedMonthlyHours: number;
            totalHours: number;
            usedTotalHours: number;
        };
    }): {
        isValid: boolean;
        budgetWarnings: string[];
        budgetViolations: string[];
        recommendations: string[];
    };
    /**
     * Generate time tracking analytics and reports
     */
    generateTimeAnalytics(timeEntries: any[], groupBy: 'resource' | 'project' | 'ticket' | 'date'): {
        totalHours: number;
        billableHours: number;
        nonBillableHours: number;
        utilizationRate: number;
        averageHoursPerEntry: number;
        groupedData: Record<string, {
            hours: number;
            billableHours: number;
            entries: number;
            billingAmount: number;
        }>;
        trends: {
            period: string;
            hours: number;
            billingAmount: number;
        }[];
    };
    /**
     * Apply business logic during time entry creation
     */
    private applyTimeEntryCreationLogic;
    /**
     * Determine if time entry is billable based on business rules
     */
    private determineBillability;
    /**
     * Get billing rate for time entry
     */
    private getBillingRate;
    /**
     * Get cost rate for time entry
     */
    private getCostRate;
    /**
     * Check if time entry requires approval
     */
    private requiresApproval;
    /**
     * Build approval update object
     */
    private buildApprovalUpdate;
    /**
     * Generate approval notifications
     */
    private generateApprovalNotifications;
    /**
     * Get next steps after approval action
     */
    private getApprovalNextSteps;
    /**
     * Calculate time trends
     */
    private calculateTimeTrends;
}
//# sourceMappingURL=TimeEntryBusinessLogic.d.ts.map