import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import {
  // Time tracking
  TimeEntries,
  TimeEntryAttachments,
  // Appointments and scheduling
  Appointments,
  // Resource availability and time off
  ResourceDailyAvailabilities,
  ResourceTimeOffAdditional,
  ResourceTimeOffApprovers,
  ResourceTimeOffBalances,
  TimeOffRequests,
  TimeOffRequestsApprove,
  TimeOffRequestsReject,
  // Holiday management
  Holidays,
  HolidaySets,
} from '../../entities';

/**
 * TimeTrackingClient handles all time tracking and scheduling entities:
 * - Time entries and time tracking
 * - Appointments and scheduling
 * - Resource availability and time off management
 * - Holiday calendars
 */
export class TimeTrackingClient extends BaseSubClient {
  // Time tracking
  public readonly timeEntries: TimeEntries;
  public readonly timeEntryAttachments: TimeEntryAttachments;

  // Appointments and scheduling
  public readonly appointments: Appointments;

  // Resource availability and time off
  public readonly resourceDailyAvailabilities: ResourceDailyAvailabilities;
  public readonly resourceTimeOffAdditional: ResourceTimeOffAdditional;
  public readonly resourceTimeOffApprovers: ResourceTimeOffApprovers;
  public readonly resourceTimeOffBalances: ResourceTimeOffBalances;
  public readonly timeOffRequests: TimeOffRequests;
  public readonly timeOffRequestsApprove: TimeOffRequestsApprove;
  public readonly timeOffRequestsReject: TimeOffRequestsReject;

  // Holiday management
  public readonly holidays: Holidays;
  public readonly holidaySets: HolidaySets;

  constructor(axios: AxiosInstance, logger: winston.Logger) {
    super(axios, logger, 'TimeTrackingClient');

    // Time tracking
    this.timeEntries = new TimeEntries(this.axios, this.logger);
    this.timeEntryAttachments = new TimeEntryAttachments(this.axios, this.logger);

    // Appointments and scheduling
    this.appointments = new Appointments(this.axios, this.logger);

    // Resource availability and time off
    this.resourceDailyAvailabilities = new ResourceDailyAvailabilities(this.axios, this.logger);
    this.resourceTimeOffAdditional = new ResourceTimeOffAdditional(this.axios, this.logger);
    this.resourceTimeOffApprovers = new ResourceTimeOffApprovers(this.axios, this.logger);
    this.resourceTimeOffBalances = new ResourceTimeOffBalances(this.axios, this.logger);
    this.timeOffRequests = new TimeOffRequests(this.axios, this.logger);
    this.timeOffRequestsApprove = new TimeOffRequestsApprove(this.axios, this.logger);
    this.timeOffRequestsReject = new TimeOffRequestsReject(this.axios, this.logger);

    // Holiday management
    this.holidays = new Holidays(this.axios, this.logger);
    this.holidaySets = new HolidaySets(this.axios, this.logger);
  }

  getName(): string {
    return 'TimeTrackingClient';
  }

  protected async doConnectionTest(): Promise<void> {
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
  async getRecentTimeEntries(days: number = 7, pageSize: number = 500) {
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
  async getTimeEntriesByResource(resourceId: number, pageSize: number = 500) {
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
  async getTimeEntriesByTicket(ticketId: number, pageSize: number = 500) {
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
  async getTimeEntriesByProject(projectId: number, pageSize: number = 500) {
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
  async getUpcomingAppointments(days: number = 7, pageSize: number = 500) {
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
  async getAppointmentsByResource(resourceId: number, pageSize: number = 500) {
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
  async getPendingTimeOffRequests(pageSize: number = 500) {
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
  async getTimeOffRequestsByResource(resourceId: number, pageSize: number = 500) {
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
  async getApprovedTimeOffRequests(days: number = 30, pageSize: number = 500) {
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
  async getUpcomingHolidays(days: number = 90, pageSize: number = 500) {
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
  async getResourceAvailability(resourceId: number, pageSize: number = 500) {
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
  async getBillableTimeEntries(days: number = 30, pageSize: number = 500) {
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
  async searchTimeEntries(
    query: string,
    searchFields: string[] = ['summaryNotes', 'internalNotes'],
    pageSize: number = 100
  ) {
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
