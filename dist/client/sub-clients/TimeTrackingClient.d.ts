import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import { TimeEntries, TimeEntryAttachments, Appointments, ResourceDailyAvailabilities, ResourceTimeOffAdditional, ResourceTimeOffApprovers, ResourceTimeOffBalances, TimeOffRequests, TimeOffRequestsApprove, TimeOffRequestsReject, Holidays, HolidaySets } from '../../entities';
/**
 * TimeTrackingClient handles all time tracking and scheduling entities:
 * - Time entries and time tracking
 * - Appointments and scheduling
 * - Resource availability and time off management
 * - Holiday calendars
 */
export declare class TimeTrackingClient extends BaseSubClient {
    readonly timeEntries: TimeEntries;
    readonly timeEntryAttachments: TimeEntryAttachments;
    readonly appointments: Appointments;
    readonly resourceDailyAvailabilities: ResourceDailyAvailabilities;
    readonly resourceTimeOffAdditional: ResourceTimeOffAdditional;
    readonly resourceTimeOffApprovers: ResourceTimeOffApprovers;
    readonly resourceTimeOffBalances: ResourceTimeOffBalances;
    readonly timeOffRequests: TimeOffRequests;
    readonly timeOffRequestsApprove: TimeOffRequestsApprove;
    readonly timeOffRequestsReject: TimeOffRequestsReject;
    readonly holidays: Holidays;
    readonly holidaySets: HolidaySets;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    getName(): string;
    protected doConnectionTest(): Promise<void>;
    /**
     * Get recent time entries within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent time entries
     */
    getRecentTimeEntries(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/timeentries").ITimeEntries[]>>;
    /**
     * Get time entries by resource (employee)
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource time entries
     */
    getTimeEntriesByResource(resourceId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/timeentries").ITimeEntries[]>>;
    /**
     * Get time entries by ticket
     * @param ticketId - Ticket ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with ticket time entries
     */
    getTimeEntriesByTicket(ticketId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/timeentries").ITimeEntries[]>>;
    /**
     * Get time entries by project
     * @param projectId - Project ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with project time entries
     */
    getTimeEntriesByProject(projectId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/timeentries").ITimeEntries[]>>;
    /**
     * Get upcoming appointments within specified days
     * @param days - Number of days to look ahead (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with upcoming appointments
     */
    getUpcomingAppointments(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/appointments").IAppointments[]>>;
    /**
     * Get appointments by resource
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource appointments
     */
    getAppointmentsByResource(resourceId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/appointments").IAppointments[]>>;
    /**
     * Get pending time off requests
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with pending time off requests
     */
    getPendingTimeOffRequests(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/timeoffrequests").ITimeOffRequests[]>>;
    /**
     * Get time off requests by resource
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource time off requests
     */
    getTimeOffRequestsByResource(resourceId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/timeoffrequests").ITimeOffRequests[]>>;
    /**
     * Get approved time off requests within date range
     * @param days - Number of days to look ahead (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with approved time off requests
     */
    getApprovedTimeOffRequests(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/timeoffrequests").ITimeOffRequests[]>>;
    /**
     * Get upcoming holidays within specified days
     * @param days - Number of days to look ahead (default: 90)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with upcoming holidays
     */
    getUpcomingHolidays(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/holidays").IHolidays[]>>;
    /**
     * Get resource daily availability
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource availability
     */
    getResourceAvailability(resourceId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/resourcedailyavailabilities").IResourceDailyAvailabilities[]>>;
    /**
     * Get billable time entries within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with billable time entries
     */
    getBillableTimeEntries(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/timeentries").ITimeEntries[]>>;
    /**
     * Search time entries by summary or internal notes
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['summaryNotes', 'internalNotes'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching time entries
     */
    searchTimeEntries(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/timeentries").ITimeEntries[]>>;
}
//# sourceMappingURL=TimeTrackingClient.d.ts.map