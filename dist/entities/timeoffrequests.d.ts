import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITimeOffRequests {
    id?: number;
    [key: string]: any;
}
export interface ITimeOffRequestsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TimeOffRequests entity class for Autotask API
 *
 * Requests for time off
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeOffRequestsEntity.htm}
 */
export declare class TimeOffRequests extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new timeoffrequests
     * @param timeOffRequests - The timeoffrequests data to create
     * @returns Promise with the created timeoffrequests
     */
    create(timeOffRequests: ITimeOffRequests): Promise<ApiResponse<ITimeOffRequests>>;
    /**
     * Get a timeoffrequests by ID
     * @param id - The timeoffrequests ID
     * @returns Promise with the timeoffrequests data
     */
    get(id: number): Promise<ApiResponse<ITimeOffRequests>>;
    /**
     * Update a timeoffrequests
     * @param id - The timeoffrequests ID
     * @param timeOffRequests - The updated timeoffrequests data
     * @returns Promise with the updated timeoffrequests
     */
    update(id: number, timeOffRequests: Partial<ITimeOffRequests>): Promise<ApiResponse<ITimeOffRequests>>;
    /**
     * Partially update a timeoffrequests
     * @param id - The timeoffrequests ID
     * @param timeOffRequests - The partial timeoffrequests data to update
     * @returns Promise with the updated timeoffrequests
     */
    patch(id: number, timeOffRequests: Partial<ITimeOffRequests>): Promise<ApiResponse<ITimeOffRequests>>;
    /**
     * Delete a timeoffrequests
     * @param id - The timeoffrequests ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List timeoffrequests with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of timeoffrequests
     */
    list(query?: ITimeOffRequestsQuery): Promise<ApiResponse<ITimeOffRequests[]>>;
}
//# sourceMappingURL=timeoffrequests.d.ts.map