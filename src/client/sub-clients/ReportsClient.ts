import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import {
  // Audit and logging entities
  DeletedTaskActivityLogs,
  DeletedTicketActivityLogs,
  DeletedTicketLogs,
  NotificationHistory,
  // Survey and feedback
  Surveys,
  SurveyResults,
  // Portal users
  ClientPortalUsers,
  // Change management
  ChangeRequestLinks,
  // Co-managed services
  ComanagedAssociations,
} from '../../entities';

/**
 * ReportsClient handles specialized reporting and audit entities:
 * - Audit logs and deleted record tracking
 * - Survey results and feedback
 * - System notifications and history
 * - Portal user activity
 * - Change management tracking
 */
export class ReportsClient extends BaseSubClient {
  // Audit and logging entities
  public readonly deletedTaskActivityLogs: DeletedTaskActivityLogs;
  public readonly deletedTicketActivityLogs: DeletedTicketActivityLogs;
  public readonly deletedTicketLogs: DeletedTicketLogs;
  public readonly notificationHistory: NotificationHistory;

  // Survey and feedback
  public readonly surveys: Surveys;
  public readonly surveyResults: SurveyResults;

  // Portal users
  public readonly clientPortalUsers: ClientPortalUsers;

  // Change management
  public readonly changeRequestLinks: ChangeRequestLinks;

  // Co-managed services
  public readonly comanagedAssociations: ComanagedAssociations;

  constructor(axios: AxiosInstance, logger: winston.Logger) {
    super(axios, logger, 'ReportsClient');

    // Audit and logging entities
    this.deletedTaskActivityLogs = new DeletedTaskActivityLogs(this.axios, this.logger);
    this.deletedTicketActivityLogs = new DeletedTicketActivityLogs(this.axios, this.logger);
    this.deletedTicketLogs = new DeletedTicketLogs(this.axios, this.logger);
    this.notificationHistory = new NotificationHistory(this.axios, this.logger);

    // Survey and feedback
    this.surveys = new Surveys(this.axios, this.logger);
    this.surveyResults = new SurveyResults(this.axios, this.logger);

    // Portal users
    this.clientPortalUsers = new ClientPortalUsers(this.axios, this.logger);

    // Change management
    this.changeRequestLinks = new ChangeRequestLinks(this.axios, this.logger);

    // Co-managed services
    this.comanagedAssociations = new ComanagedAssociations(this.axios, this.logger);
  }

  getName(): string {
    return 'ReportsClient';
  }

  protected async doConnectionTest(): Promise<void> {
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
  async getRecentDeletedTicketLogs(days: number = 7, pageSize: number = 500) {
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
  async getRecentDeletedTaskLogs(days: number = 7, pageSize: number = 500) {
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
  async getRecentNotificationHistory(days: number = 30, pageSize: number = 500) {
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
  async getActiveSurveys(pageSize: number = 500) {
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
  async getSurveyResultsBySurvey(surveyId: number, pageSize: number = 500) {
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
  async getSurveyResultsByCompany(companyId: number, pageSize: number = 500) {
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
  async getActivePortalUsers(pageSize: number = 500) {
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
  async getPortalUsersByCompany(companyId: number, pageSize: number = 500) {
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
  async getRecentSurveyResults(days: number = 30, pageSize: number = 500) {
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
  async searchNotificationHistory(query: string, pageSize: number = 100) {
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
  async getComanagedAssociationsByCompany(companyId: number, pageSize: number = 500) {
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
  async getChangeRequestLinksByTicket(ticketId: number, pageSize: number = 500) {
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
  async getDeletedTicketActivityLogsByCompany(companyId: number, pageSize: number = 500) {
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
