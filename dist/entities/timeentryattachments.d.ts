import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITimeEntryAttachments {
    id?: number;
    [key: string]: any;
}
export interface ITimeEntryAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TimeEntryAttachments entity class for Autotask API
 *
 * File attachments for time entries
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeEntryAttachmentsEntity.htm}
 */
export declare class TimeEntryAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new timeentryattachments
     * @param timeEntryAttachments - The timeentryattachments data to create
     * @returns Promise with the created timeentryattachments
     */
    create(timeEntryAttachments: ITimeEntryAttachments): Promise<ApiResponse<ITimeEntryAttachments>>;
    /**
     * Get a timeentryattachments by ID
     * @param id - The timeentryattachments ID
     * @returns Promise with the timeentryattachments data
     */
    get(id: number): Promise<ApiResponse<ITimeEntryAttachments>>;
    /**
     * Delete a timeentryattachments
     * @param id - The timeentryattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List timeentryattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of timeentryattachments
     */
    list(query?: ITimeEntryAttachmentsQuery): Promise<ApiResponse<ITimeEntryAttachments[]>>;
}
//# sourceMappingURL=timeentryattachments.d.ts.map