import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import { DeletedTaskActivityLogs, DeletedTicketActivityLogs, DeletedTicketLogs, NotificationHistory, Surveys, SurveyResults, ClientPortalUsers, ChangeRequestLinks, ComanagedAssociations } from '../../entities';
/**
 * ReportsClient handles specialized reporting and audit entities:
 * - Audit logs and deleted record tracking
 * - Survey results and feedback
 * - System notifications and history
 * - Portal user activity
 * - Change management tracking
 */
export declare class ReportsClient extends BaseSubClient {
    readonly deletedTaskActivityLogs: DeletedTaskActivityLogs;
    readonly deletedTicketActivityLogs: DeletedTicketActivityLogs;
    readonly deletedTicketLogs: DeletedTicketLogs;
    readonly notificationHistory: NotificationHistory;
    readonly surveys: Surveys;
    readonly surveyResults: SurveyResults;
    readonly clientPortalUsers: ClientPortalUsers;
    readonly changeRequestLinks: ChangeRequestLinks;
    readonly comanagedAssociations: ComanagedAssociations;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    getName(): string;
    protected doConnectionTest(): Promise<void>;
    /**
     * Get recent deleted ticket logs within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent deleted ticket logs
     */
    getRecentDeletedTicketLogs(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/deletedticketlogs").IDeletedTicketLogs[]>>;
    /**
     * Get recent deleted task activity logs within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent deleted task logs
     */
    getRecentDeletedTaskLogs(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/deletedtaskactivitylogs").IDeletedTaskActivityLogs[]>>;
    /**
     * Get recent notification history within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent notifications
     */
    getRecentNotificationHistory(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/notificationhistory").INotificationHistory[]>>;
    /**
     * Get active surveys
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active surveys
     */
    getActiveSurveys(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/surveys").ISurveys[]>>;
    /**
     * Get survey results by survey
     * @param surveyId - Survey ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with survey results
     */
    getSurveyResultsBySurvey(surveyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/surveyresults").ISurveyResults[]>>;
    /**
     * Get survey results by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company survey results
     */
    getSurveyResultsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/surveyresults").ISurveyResults[]>>;
    /**
     * Get active client portal users
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active portal users
     */
    getActivePortalUsers(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/clientportalusers").IClientPortalUsers[]>>;
    /**
     * Get portal users by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company portal users
     */
    getPortalUsersByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/clientportalusers").IClientPortalUsers[]>>;
    /**
     * Get recent survey results within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent survey results
     */
    getRecentSurveyResults(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/surveyresults").ISurveyResults[]>>;
    /**
     * Search notification history by message content
     * @param query - Search query string
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching notifications
     */
    searchNotificationHistory(query: string, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/notificationhistory").INotificationHistory[]>>;
    /**
     * Get co-managed associations by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company co-managed associations
     */
    getComanagedAssociationsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/comanagedassociations").IComanagedAssociations[]>>;
    /**
     * Get change request links by ticket
     * @param ticketId - Ticket ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with ticket change request links
     */
    getChangeRequestLinksByTicket(ticketId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/changerequestlinks").IChangeRequestLinks[]>>;
    /**
     * Get deleted ticket activity logs by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company deleted ticket activity logs
     */
    getDeletedTicketActivityLogsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/deletedticketactivitylogs").IDeletedTicketActivityLogs[]>>;
}
//# sourceMappingURL=ReportsClient.d.ts.map