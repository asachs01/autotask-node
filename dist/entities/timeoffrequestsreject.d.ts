import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITimeOffRequestsReject {
    id?: number;
    [key: string]: any;
}
export interface ITimeOffRequestsRejectQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TimeOffRequestsReject entity class for Autotask API
 *
 * Reject time off requests
 * Supported Operations: POST
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeOffRequestsRejectEntity.htm}
 */
export declare class TimeOffRequestsReject extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new timeoffrequestsreject
     * @param timeOffRequestsReject - The timeoffrequestsreject data to create
     * @returns Promise with the created timeoffrequestsreject
     */
    create(timeOffRequestsReject: ITimeOffRequestsReject): Promise<ApiResponse<ITimeOffRequestsReject>>;
    /**
     * List timeoffrequestsreject with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of timeoffrequestsreject
     */
    list(query?: ITimeOffRequestsRejectQuery): Promise<ApiResponse<ITimeOffRequestsReject[]>>;
}
//# sourceMappingURL=timeoffrequestsreject.d.ts.map