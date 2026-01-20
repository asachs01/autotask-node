import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResourceTimeOffApprovers {
    id?: number;
    [key: string]: any;
}
export interface IResourceTimeOffApproversQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ResourceTimeOffApprovers entity class for Autotask API
 *
 * Approvers for resource time off requests
 * Supported Operations: GET, POST, DELETE
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceTimeOffApproversEntity.htm}
 */
export declare class ResourceTimeOffApprovers extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new resourcetimeoffapprovers
     * @param resourceTimeOffApprovers - The resourcetimeoffapprovers data to create
     * @returns Promise with the created resourcetimeoffapprovers
     */
    create(resourceTimeOffApprovers: IResourceTimeOffApprovers): Promise<ApiResponse<IResourceTimeOffApprovers>>;
    /**
     * Get a resourcetimeoffapprovers by ID
     * @param id - The resourcetimeoffapprovers ID
     * @returns Promise with the resourcetimeoffapprovers data
     */
    get(id: number): Promise<ApiResponse<IResourceTimeOffApprovers>>;
    /**
     * Delete a resourcetimeoffapprovers
     * @param id - The resourcetimeoffapprovers ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List resourcetimeoffapprovers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourcetimeoffapprovers
     */
    list(query?: IResourceTimeOffApproversQuery): Promise<ApiResponse<IResourceTimeOffApprovers[]>>;
}
//# sourceMappingURL=resourcetimeoffapprovers.d.ts.map