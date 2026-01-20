import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITimeEntries {
    id?: number;
    [key: string]: any;
}
export interface ITimeEntriesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TimeEntries entity class for Autotask API
 *
 * Time tracking entries for billing
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeEntriesEntity.htm}
 */
export declare class TimeEntries extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new timeentries
     * @param timeEntries - The timeentries data to create
     * @returns Promise with the created timeentries
     */
    create(timeEntries: ITimeEntries): Promise<ApiResponse<ITimeEntries>>;
    /**
     * Get a timeentries by ID
     * @param id - The timeentries ID
     * @returns Promise with the timeentries data
     */
    get(id: number): Promise<ApiResponse<ITimeEntries>>;
    /**
     * Update a timeentries
     * @param id - The timeentries ID
     * @param timeEntries - The updated timeentries data
     * @returns Promise with the updated timeentries
     */
    update(id: number, timeEntries: Partial<ITimeEntries>): Promise<ApiResponse<ITimeEntries>>;
    /**
     * Partially update a timeentries
     * @param id - The timeentries ID
     * @param timeEntries - The partial timeentries data to update
     * @returns Promise with the updated timeentries
     */
    patch(id: number, timeEntries: Partial<ITimeEntries>): Promise<ApiResponse<ITimeEntries>>;
    /**
     * Delete a timeentries
     * @param id - The timeentries ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List timeentries with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of timeentries
     */
    list(query?: ITimeEntriesQuery): Promise<ApiResponse<ITimeEntries[]>>;
}
//# sourceMappingURL=timeentries.d.ts.map