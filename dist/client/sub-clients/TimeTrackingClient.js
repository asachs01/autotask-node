"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeTrackingClient = void 0;
const BaseSubClient_1 = require("../base/BaseSubClient");
const entities_1 = require("../../entities");
/**
 * TimeTrackingClient handles all time tracking and scheduling entities:
 * - Time entries and time tracking
 * - Appointments and scheduling
 * - Resource availability and time off management
 * - Holiday calendars
 */
class TimeTrackingClient extends BaseSubClient_1.BaseSubClient {
    constructor(axios, logger) {
        super(axios, logger, 'TimeTrackingClient');
        // Time tracking
        this.timeEntries = new entities_1.TimeEntries(this.axios, this.logger);
        this.timeEntryAttachments = new entities_1.TimeEntryAttachments(this.axios, this.logger);
        // Appointments and scheduling
        this.appointments = new entities_1.Appointments(this.axios, this.logger);
        // Resource availability and time off
        this.resourceDailyAvailabilities = new entities_1.ResourceDailyAvailabilities(this.axios, this.logger);
        this.resourceTimeOffAdditional = new entities_1.ResourceTimeOffAdditional(this.axios, this.logger);
        this.resourceTimeOffApprovers = new entities_1.ResourceTimeOffApprovers(this.axios, this.logger);
        this.resourceTimeOffBalances = new entities_1.ResourceTimeOffBalances(this.axios, this.logger);
        this.timeOffRequests = new entities_1.TimeOffRequests(this.axios, this.logger);
        this.timeOffRequestsApprove = new entities_1.TimeOffRequestsApprove(this.axios, this.logger);
        this.timeOffRequestsReject = new entities_1.TimeOffRequestsReject(this.axios, this.logger);
        // Holiday management
        this.holidays = new entities_1.Holidays(this.axios, this.logger);
        this.holidaySets = new entities_1.HolidaySets(this.axios, this.logger);
    }
    getName() {
        return 'TimeTrackingClient';
    }
    async doConnectionTest() {
        // Test connection with a simple time entries query
        await this.axios.get('/TimeEntries?$select=id&$top=1');
    }
    // Convenience methods for common operations
    /**
     * Get recent time entries within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent time entries
     */
    async getRecentTimeEntries(days = 7, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.timeEntries.list({
            filter: [
                {
                    op: 'gte',
                    field: 'dateWorked',
                    value: cutoffDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'dateWorked desc',
        });
    }
    /**
     * Get time entries by resource (employee)
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource time entries
     */
    async getTimeEntriesByResource(resourceId, pageSize = 500) {
        return this.timeEntries.list({
            filter: [
                {
                    op: 'eq',
                    field: 'resourceID',
                    value: resourceId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get time entries by ticket
     * @param ticketId - Ticket ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with ticket time entries
     */
    async getTimeEntriesByTicket(ticketId, pageSize = 500) {
        return this.timeEntries.list({
            filter: [
                {
                    op: 'eq',
                    field: 'ticketID',
                    value: ticketId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get time entries by project
     * @param projectId - Project ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with project time entries
     */
    async getTimeEntriesByProject(projectId, pageSize = 500) {
        return this.timeEntries.list({
            filter: [
                {
                    op: 'eq',
                    field: 'projectID',
                    value: projectId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get upcoming appointments within specified days
     * @param days - Number of days to look ahead (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with upcoming appointments
     */
    async getUpcomingAppointments(days = 7, pageSize = 500) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.appointments.list({
            filter: [
                {
                    op: 'gte',
                    field: 'startDateTime',
                    value: today.toISOString(),
                },
                {
                    op: 'lte',
                    field: 'startDateTime',
                    value: futureDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'startDateTime asc',
        });
    }
    /**
     * Get appointments by resource
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource appointments
     */
    async getAppointmentsByResource(resourceId, pageSize = 500) {
        return this.appointments.list({
            filter: [
                {
                    op: 'eq',
                    field: 'resourceID',
                    value: resourceId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get pending time off requests
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with pending time off requests
     */
    async getPendingTimeOffRequests(pageSize = 500) {
        return this.timeOffRequests.list({
            filter: [
                {
                    op: 'eq',
                    field: 'status',
                    value: 1, // Pending status
                },
            ],
            pageSize,
        });
    }
    /**
     * Get time off requests by resource
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource time off requests
     */
    async getTimeOffRequestsByResource(resourceId, pageSize = 500) {
        return this.timeOffRequests.list({
            filter: [
                {
                    op: 'eq',
                    field: 'resourceID',
                    value: resourceId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get approved time off requests within date range
     * @param days - Number of days to look ahead (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with approved time off requests
     */
    async getApprovedTimeOffRequests(days = 30, pageSize = 500) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.timeOffRequests.list({
            filter: [
                {
                    op: 'eq',
                    field: 'status',
                    value: 2, // Approved status
                },
                {
                    op: 'lte',
                    field: 'startDate',
                    value: futureDate.toISOString(),
                },
                {
                    op: 'gte',
                    field: 'endDate',
                    value: today.toISOString(),
                },
            ],
            pageSize,
            sort: 'startDate asc',
        });
    }
    /**
     * Get upcoming holidays within specified days
     * @param days - Number of days to look ahead (default: 90)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with upcoming holidays
     */
    async getUpcomingHolidays(days = 90, pageSize = 500) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.holidays.list({
            filter: [
                {
                    op: 'gte',
                    field: 'holidayDate',
                    value: today.toISOString(),
                },
                {
                    op: 'lte',
                    field: 'holidayDate',
                    value: futureDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'holidayDate asc',
        });
    }
    /**
     * Get resource daily availability
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource availability
     */
    async getResourceAvailability(resourceId, pageSize = 500) {
        return this.resourceDailyAvailabilities.list({
            filter: [
                {
                    op: 'eq',
                    field: 'resourceID',
                    value: resourceId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get billable time entries within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with billable time entries
     */
    async getBillableTimeEntries(days = 30, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.timeEntries.list({
            filter: [
                {
                    op: 'gte',
                    field: 'dateWorked',
                    value: cutoffDate.toISOString(),
                },
                {
                    op: 'eq',
                    field: 'billableToAccount',
                    value: true,
                },
            ],
            pageSize,
            sort: 'dateWorked desc',
        });
    }
    /**
     * Search time entries by summary or internal notes
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['summaryNotes', 'internalNotes'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching time entries
     */
    async searchTimeEntries(query, searchFields = ['summaryNotes', 'internalNotes'], pageSize = 100) {
        const filters = searchFields.map(field => ({
            op: 'contains',
            field,
            value: query,
        }));
        return this.timeEntries.list({
            filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
            pageSize,
            sort: 'dateWorked desc',
        });
    }
}
exports.TimeTrackingClient = TimeTrackingClient;
//# sourceMappingURL=TimeTrackingClient.js.map