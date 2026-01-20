"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsClient = void 0;
const BaseSubClient_1 = require("../base/BaseSubClient");
const entities_1 = require("../../entities");
/**
 * ReportsClient handles specialized reporting and audit entities:
 * - Audit logs and deleted record tracking
 * - Survey results and feedback
 * - System notifications and history
 * - Portal user activity
 * - Change management tracking
 */
class ReportsClient extends BaseSubClient_1.BaseSubClient {
    constructor(axios, logger) {
        super(axios, logger, 'ReportsClient');
        // Audit and logging entities
        this.deletedTaskActivityLogs = new entities_1.DeletedTaskActivityLogs(this.axios, this.logger);
        this.deletedTicketActivityLogs = new entities_1.DeletedTicketActivityLogs(this.axios, this.logger);
        this.deletedTicketLogs = new entities_1.DeletedTicketLogs(this.axios, this.logger);
        this.notificationHistory = new entities_1.NotificationHistory(this.axios, this.logger);
        // Survey and feedback
        this.surveys = new entities_1.Surveys(this.axios, this.logger);
        this.surveyResults = new entities_1.SurveyResults(this.axios, this.logger);
        // Portal users
        this.clientPortalUsers = new entities_1.ClientPortalUsers(this.axios, this.logger);
        // Change management
        this.changeRequestLinks = new entities_1.ChangeRequestLinks(this.axios, this.logger);
        // Co-managed services
        this.comanagedAssociations = new entities_1.ComanagedAssociations(this.axios, this.logger);
    }
    getName() {
        return 'ReportsClient';
    }
    async doConnectionTest() {
        // Test connection with a simple notification history query
        await this.axios.get('/NotificationHistory?$select=id&$top=1');
    }
    // Convenience methods for common operations
    /**
     * Get recent deleted ticket logs within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent deleted ticket logs
     */
    async getRecentDeletedTicketLogs(days = 7, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.deletedTicketLogs.list({
            filter: [
                {
                    op: 'gte',
                    field: 'deleteDate',
                    value: cutoffDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'deleteDate desc',
        });
    }
    /**
     * Get recent deleted task activity logs within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent deleted task logs
     */
    async getRecentDeletedTaskLogs(days = 7, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.deletedTaskActivityLogs.list({
            filter: [
                {
                    op: 'gte',
                    field: 'deleteDate',
                    value: cutoffDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'deleteDate desc',
        });
    }
    /**
     * Get recent notification history within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent notifications
     */
    async getRecentNotificationHistory(days = 30, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.notificationHistory.list({
            filter: [
                {
                    op: 'gte',
                    field: 'sentDate',
                    value: cutoffDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'sentDate desc',
        });
    }
    /**
     * Get active surveys
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active surveys
     */
    async getActiveSurveys(pageSize = 500) {
        return this.surveys.list({
            filter: [
                {
                    op: 'eq',
                    field: 'isActive',
                    value: true,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get survey results by survey
     * @param surveyId - Survey ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with survey results
     */
    async getSurveyResultsBySurvey(surveyId, pageSize = 500) {
        return this.surveyResults.list({
            filter: [
                {
                    op: 'eq',
                    field: 'surveyID',
                    value: surveyId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get survey results by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company survey results
     */
    async getSurveyResultsByCompany(companyId, pageSize = 500) {
        return this.surveyResults.list({
            filter: [
                {
                    op: 'eq',
                    field: 'accountID',
                    value: companyId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get active client portal users
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active portal users
     */
    async getActivePortalUsers(pageSize = 500) {
        return this.clientPortalUsers.list({
            filter: [
                {
                    op: 'eq',
                    field: 'isActive',
                    value: true,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get portal users by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company portal users
     */
    async getPortalUsersByCompany(companyId, pageSize = 500) {
        return this.clientPortalUsers.list({
            filter: [
                {
                    op: 'eq',
                    field: 'accountID',
                    value: companyId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get recent survey results within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent survey results
     */
    async getRecentSurveyResults(days = 30, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.surveyResults.list({
            filter: [
                {
                    op: 'gte',
                    field: 'dateReceived',
                    value: cutoffDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'dateReceived desc',
        });
    }
    /**
     * Search notification history by message content
     * @param query - Search query string
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching notifications
     */
    async searchNotificationHistory(query, pageSize = 100) {
        return this.notificationHistory.list({
            filter: [
                {
                    op: 'contains',
                    field: 'notificationMessage',
                    value: query,
                },
            ],
            pageSize,
            sort: 'sentDate desc',
        });
    }
    /**
     * Get co-managed associations by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company co-managed associations
     */
    async getComanagedAssociationsByCompany(companyId, pageSize = 500) {
        return this.comanagedAssociations.list({
            filter: [
                {
                    op: 'eq',
                    field: 'accountID',
                    value: companyId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get change request links by ticket
     * @param ticketId - Ticket ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with ticket change request links
     */
    async getChangeRequestLinksByTicket(ticketId, pageSize = 500) {
        return this.changeRequestLinks.list({
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
     * Get deleted ticket activity logs by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company deleted ticket activity logs
     */
    async getDeletedTicketActivityLogsByCompany(companyId, pageSize = 500) {
        return this.deletedTicketActivityLogs.list({
            filter: [
                {
                    op: 'eq',
                    field: 'accountID',
                    value: companyId,
                },
            ],
            pageSize,
        });
    }
}
exports.ReportsClient = ReportsClient;
//# sourceMappingURL=ReportsClient.js.map