"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeEntryBusinessLogic = void 0;
/**
 * Time entry-specific business logic for billing, approval workflows, and time tracking
 */
class TimeEntryBusinessLogic {
    constructor(businessEngine) {
        this.businessEngine = businessEngine;
        /**
         * Time entry approval statuses
         */
        this.APPROVAL_STATUSES = {
            DRAFT: 0,
            SUBMITTED: 1,
            APPROVED: 2,
            REJECTED: 3
        };
    }
    /**
     * Validate and process time entry creation
     */
    async createTimeEntry(timeEntryData, context) {
        // Validate the time entry data
        const result = await this.businessEngine.processBusinessRules('create', 'TimeEntries', timeEntryData, context);
        // Apply time entry-specific business logic
        const processedTimeEntry = this.applyTimeEntryCreationLogic(timeEntryData, context);
        // Calculate billing information
        const billingCalculation = this.calculateBilling(processedTimeEntry, context);
        // Determine if approval is required
        const approvalRequired = this.requiresApproval(processedTimeEntry, context);
        return {
            isValid: result.isAllowed,
            validationResult: result.validationResult,
            processedTimeEntry: result.transformedEntity || processedTimeEntry,
            billingCalculation,
            approvalRequired,
            suggestedActions: result.suggestedActions || []
        };
    }
    /**
     * Process time entry approval workflow
     */
    async processApproval(timeEntryId, action, currentTimeEntry, context) {
        const approvalUpdate = this.buildApprovalUpdate(action, currentTimeEntry, context);
        const result = await this.businessEngine.processBusinessRules('update', 'TimeEntries', approvalUpdate, {
            previousEntity: currentTimeEntry,
            user: context?.approver
        });
        const notifications = this.generateApprovalNotifications(action, currentTimeEntry, context);
        const nextSteps = this.getApprovalNextSteps(action, approvalUpdate);
        return {
            isValid: result.isAllowed,
            validationResult: result.validationResult,
            newStatus: approvalUpdate.approvalStatus,
            nextSteps,
            notifications
        };
    }
    /**
     * Calculate comprehensive billing information
     */
    calculateBilling(timeEntry, context) {
        const hours = timeEntry.hoursWorked || 0;
        // Determine if billable
        const isBillable = this.determineBillability(timeEntry, context);
        if (!isBillable) {
            return { isBillable: false };
        }
        // Get billing rate
        const billingRate = this.getBillingRate(timeEntry, context);
        const billingAmount = billingRate ? hours * billingRate : 0;
        // Get cost rate (internal cost)
        const costRate = this.getCostRate(timeEntry, context);
        const costAmount = costRate ? hours * costRate : 0;
        // Calculate markup and profit
        const markup = billingRate && costRate ? ((billingRate - costRate) / costRate) * 100 : 0;
        const profitAmount = billingAmount - costAmount;
        return {
            isBillable,
            billingRate,
            billingAmount: Math.round(billingAmount * 100) / 100,
            costRate,
            costAmount: Math.round(costAmount * 100) / 100,
            markup: Math.round(markup * 100) / 100,
            profitAmount: Math.round(profitAmount * 100) / 100
        };
    }
    /**
     * Validate time entry against project budget and contract limits
     */
    validateAgainstBudgets(timeEntry, context) {
        const warnings = [];
        const violations = [];
        const recommendations = [];
        const hours = timeEntry.hoursWorked || 0;
        // Check project budget
        if (context?.projectBudget) {
            const budget = context.projectBudget;
            const newTotalHours = budget.usedHours + hours;
            if (newTotalHours > budget.totalHours * 0.9) {
                warnings.push(`Project is at ${Math.round((newTotalHours / budget.totalHours) * 100)}% of hour budget`);
            }
            if (newTotalHours > budget.totalHours) {
                violations.push('Time entry exceeds project hour budget');
                recommendations.push('Contact project manager before proceeding');
            }
        }
        // Check contract limits
        if (context?.contractLimits) {
            const limits = context.contractLimits;
            const newMonthlyHours = limits.usedMonthlyHours + hours;
            const newTotalHours = limits.usedTotalHours + hours;
            if (newMonthlyHours > limits.monthlyHours * 0.9) {
                warnings.push(`Contract is at ${Math.round((newMonthlyHours / limits.monthlyHours) * 100)}% of monthly limit`);
            }
            if (newMonthlyHours > limits.monthlyHours) {
                violations.push('Time entry exceeds contract monthly hour limit');
                recommendations.push('Consider creating overage billing or get approval');
            }
            if (newTotalHours > limits.totalHours) {
                violations.push('Time entry exceeds contract total hour limit');
                recommendations.push('Contract renewal or amendment may be required');
            }
        }
        return {
            isValid: violations.length === 0,
            budgetWarnings: warnings,
            budgetViolations: violations,
            recommendations
        };
    }
    /**
     * Generate time tracking analytics and reports
     */
    generateTimeAnalytics(timeEntries, groupBy) {
        if (timeEntries.length === 0) {
            return {
                totalHours: 0,
                billableHours: 0,
                nonBillableHours: 0,
                utilizationRate: 0,
                averageHoursPerEntry: 0,
                groupedData: {},
                trends: []
            };
        }
        let totalHours = 0;
        let billableHours = 0;
        let totalBillingAmount = 0;
        const groupedData = {};
        timeEntries.forEach(entry => {
            const hours = entry.hoursWorked || 0;
            totalHours += hours;
            if (entry.isBillable) {
                billableHours += hours;
                totalBillingAmount += entry.billingAmount || 0;
            }
            // Group data
            let groupKey;
            switch (groupBy) {
                case 'resource':
                    groupKey = entry.resourceName || `Resource ${entry.resourceID}`;
                    break;
                case 'project':
                    groupKey = entry.projectTitle || `Project ${entry.projectID}`;
                    break;
                case 'ticket':
                    groupKey = entry.ticketTitle || `Ticket ${entry.ticketID}`;
                    break;
                case 'date':
                    groupKey = entry.dateWorked ? new Date(entry.dateWorked).toDateString() : 'Unknown';
                    break;
                default:
                    groupKey = 'All';
            }
            if (!groupedData[groupKey]) {
                groupedData[groupKey] = {
                    hours: 0,
                    billableHours: 0,
                    entries: 0,
                    billingAmount: 0
                };
            }
            groupedData[groupKey].hours += hours;
            groupedData[groupKey].entries += 1;
            if (entry.isBillable) {
                groupedData[groupKey].billableHours += hours;
                groupedData[groupKey].billingAmount += entry.billingAmount || 0;
            }
        });
        const nonBillableHours = totalHours - billableHours;
        const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
        const averageHoursPerEntry = timeEntries.length > 0 ? totalHours / timeEntries.length : 0;
        // Generate trends (simplified daily aggregation)
        const trends = this.calculateTimeTrends(timeEntries);
        return {
            totalHours: Math.round(totalHours * 100) / 100,
            billableHours: Math.round(billableHours * 100) / 100,
            nonBillableHours: Math.round(nonBillableHours * 100) / 100,
            utilizationRate: Math.round(utilizationRate * 100) / 100,
            averageHoursPerEntry: Math.round(averageHoursPerEntry * 100) / 100,
            groupedData,
            trends
        };
    }
    /**
     * Apply business logic during time entry creation
     */
    applyTimeEntryCreationLogic(timeEntryData, context) {
        const processed = { ...timeEntryData };
        // Round hours to nearest quarter hour if not already precise
        if (processed.hoursWorked) {
            processed.hoursWorked = Math.round(processed.hoursWorked * 4) / 4;
        }
        // Set default date if not provided
        if (!processed.dateWorked) {
            processed.dateWorked = new Date().toISOString().split('T')[0];
        }
        // Auto-determine billability if not set
        if (processed.isBillable === undefined) {
            processed.isBillable = this.determineBillability(processed, context);
        }
        // Set initial approval status
        if (!processed.approvalStatus) {
            processed.approvalStatus = this.APPROVAL_STATUSES.DRAFT;
        }
        return processed;
    }
    /**
     * Determine if time entry is billable based on business rules
     */
    determineBillability(timeEntry, context) {
        // Billable if explicitly set
        if (timeEntry.isBillable !== undefined) {
            return timeEntry.isBillable;
        }
        // Check billing code
        if (timeEntry.billingCodeID && context?.billingCodes) {
            const billingCode = context.billingCodes[timeEntry.billingCodeID];
            if (billingCode && !billingCode.isBillable) {
                return false;
            }
        }
        // Check contract terms
        if (context?.contractInfo?.includesTimeAndMaterials === false) {
            return false;
        }
        // Default to billable for client work
        if (timeEntry.ticketID || timeEntry.projectID) {
            return true;
        }
        // Default to non-billable for internal work
        return false;
    }
    /**
     * Get billing rate for time entry
     */
    getBillingRate(timeEntry, context) {
        // Check contract rates first
        if (context?.contractInfo?.hourlyRate) {
            return context.contractInfo.hourlyRate;
        }
        // Check resource-specific rates
        if (context?.billingRates && timeEntry.resourceID) {
            return context.billingRates[timeEntry.resourceID] || 0;
        }
        // Check role-based rates
        if (context?.billingRates && timeEntry.roleID) {
            return context.billingRates[`role_${timeEntry.roleID}`] || 0;
        }
        // Default rate
        return 0;
    }
    /**
     * Get cost rate for time entry
     */
    getCostRate(timeEntry, context) {
        // This would typically come from resource cost data
        const billingRate = this.getBillingRate(timeEntry, context);
        // Assume 70% of billing rate as cost (simplified)
        return billingRate * 0.7;
    }
    /**
     * Check if time entry requires approval
     */
    requiresApproval(timeEntry, context) {
        // Always require approval for billable time
        if (timeEntry.isBillable) {
            return true;
        }
        // Require approval for entries over 8 hours
        if (timeEntry.hoursWorked > 8) {
            return true;
        }
        // Require approval for weekend work
        if (timeEntry.dateWorked) {
            const date = new Date(timeEntry.dateWorked);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                return true;
            }
        }
        return false;
    }
    /**
     * Build approval update object
     */
    buildApprovalUpdate(action, currentTimeEntry, context) {
        const update = { ...currentTimeEntry };
        switch (action) {
            case 'submit':
                update.approvalStatus = this.APPROVAL_STATUSES.SUBMITTED;
                update.submittedDate = new Date().toISOString();
                break;
            case 'approve':
                update.approvalStatus = this.APPROVAL_STATUSES.APPROVED;
                update.approvedDate = new Date().toISOString();
                update.approvedBy = context?.approver?.id;
                break;
            case 'reject':
                update.approvalStatus = this.APPROVAL_STATUSES.REJECTED;
                update.rejectedDate = new Date().toISOString();
                update.rejectedBy = context?.approver?.id;
                update.rejectionReason = context?.reason;
                break;
        }
        if (context?.comments) {
            update.approvalComments = context.comments;
        }
        return update;
    }
    /**
     * Generate approval notifications
     */
    generateApprovalNotifications(action, timeEntry, context) {
        const notifications = [];
        switch (action) {
            case 'submit':
                notifications.push({
                    recipients: [timeEntry.managerEmail],
                    message: `Time entry for ${timeEntry.hoursWorked} hours submitted for approval`
                });
                break;
            case 'approve':
                notifications.push({
                    recipients: [timeEntry.resourceEmail],
                    message: `Your time entry for ${timeEntry.hoursWorked} hours has been approved`
                });
                break;
            case 'reject':
                notifications.push({
                    recipients: [timeEntry.resourceEmail],
                    message: `Your time entry for ${timeEntry.hoursWorked} hours has been rejected. Reason: ${context?.reason}`
                });
                break;
        }
        return notifications;
    }
    /**
     * Get next steps after approval action
     */
    getApprovalNextSteps(action, timeEntry) {
        const steps = [];
        switch (action) {
            case 'approve':
                if (timeEntry.isBillable) {
                    steps.push('Time entry will be included in next billing cycle');
                }
                steps.push('Resource will be notified of approval');
                break;
            case 'reject':
                steps.push('Resource can edit and resubmit time entry');
                steps.push('Consider providing guidance for resubmission');
                break;
            case 'submit':
                steps.push('Manager will receive approval notification');
                steps.push('Time entry is locked until approved or rejected');
                break;
        }
        return steps;
    }
    /**
     * Calculate time trends
     */
    calculateTimeTrends(timeEntries) {
        const trendData = {};
        timeEntries.forEach(entry => {
            const date = entry.dateWorked ? new Date(entry.dateWorked).toDateString() : 'Unknown';
            if (!trendData[date]) {
                trendData[date] = { hours: 0, billingAmount: 0 };
            }
            trendData[date].hours += entry.hoursWorked || 0;
            if (entry.isBillable) {
                trendData[date].billingAmount += entry.billingAmount || 0;
            }
        });
        return Object.entries(trendData)
            .map(([period, data]) => ({
            period,
            hours: Math.round(data.hours * 100) / 100,
            billingAmount: Math.round(data.billingAmount * 100) / 100
        }))
            .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
    }
}
exports.TimeEntryBusinessLogic = TimeEntryBusinessLogic;
//# sourceMappingURL=TimeEntryBusinessLogic.js.map