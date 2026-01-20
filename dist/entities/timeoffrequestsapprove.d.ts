import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITimeOffRequestsApprove {
    id?: number;
    [key: string]: any;
}
export interface ITimeOffRequestsApproveQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TimeOffRequestsApprove entity class for Autotask API
 *
 * Approve time off requests
 * Supported Operations: POST
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeOffRequestsApproveEntity.htm}
 */
export declare class TimeOffRequestsApprove extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new timeoffrequestsapprove
     * @param timeOffRequestsApprove - The timeoffrequestsapprove data to create
     * @returns Promise with the created timeoffrequestsapprove
     */
    create(timeOffRequestsApprove: ITimeOffRequestsApprove): Promise<ApiResponse<ITimeOffRequestsApprove>>;
    /**
     * List timeoffrequestsapprove with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of timeoffrequestsapprove
     */
    list(query?: ITimeOffRequestsApproveQuery): Promise<ApiResponse<ITimeOffRequestsApprove[]>>;
}
//# sourceMappingURL=timeoffrequestsapprove.d.ts.map