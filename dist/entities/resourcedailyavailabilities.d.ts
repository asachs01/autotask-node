import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResourceDailyAvailabilities {
    id?: number;
    [key: string]: any;
}
export interface IResourceDailyAvailabilitiesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ResourceDailyAvailabilities entity class for Autotask API
 *
 * Daily availability schedules for resources
 * Supported Operations: GET
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceDailyAvailability.htm}
 */
export declare class ResourceDailyAvailabilities extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a resourcedailyavailabilities by ID
     * @param id - The resourcedailyavailabilities ID
     * @returns Promise with the resourcedailyavailabilities data
     */
    get(id: number): Promise<ApiResponse<IResourceDailyAvailabilities>>;
    /**
     * List resourcedailyavailabilities with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourcedailyavailabilities
     */
    list(query?: IResourceDailyAvailabilitiesQuery): Promise<ApiResponse<IResourceDailyAvailabilities[]>>;
}
//# sourceMappingURL=resourcedailyavailabilities.d.ts.map