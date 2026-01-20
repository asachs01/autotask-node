import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResourceTimeOffAdditional {
    id?: number;
    [key: string]: any;
}
export interface IResourceTimeOffAdditionalQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ResourceTimeOffAdditional entity class for Autotask API
 *
 * Additional time off information for resources
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceTimeOffAdditionalEntity.htm}
 */
export declare class ResourceTimeOffAdditional extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new resourcetimeoffadditional
     * @param resourceTimeOffAdditional - The resourcetimeoffadditional data to create
     * @returns Promise with the created resourcetimeoffadditional
     */
    create(resourceTimeOffAdditional: IResourceTimeOffAdditional): Promise<ApiResponse<IResourceTimeOffAdditional>>;
    /**
     * Get a resourcetimeoffadditional by ID
     * @param id - The resourcetimeoffadditional ID
     * @returns Promise with the resourcetimeoffadditional data
     */
    get(id: number): Promise<ApiResponse<IResourceTimeOffAdditional>>;
    /**
     * Update a resourcetimeoffadditional
     * @param id - The resourcetimeoffadditional ID
     * @param resourceTimeOffAdditional - The updated resourcetimeoffadditional data
     * @returns Promise with the updated resourcetimeoffadditional
     */
    update(id: number, resourceTimeOffAdditional: Partial<IResourceTimeOffAdditional>): Promise<ApiResponse<IResourceTimeOffAdditional>>;
    /**
     * Partially update a resourcetimeoffadditional
     * @param id - The resourcetimeoffadditional ID
     * @param resourceTimeOffAdditional - The partial resourcetimeoffadditional data to update
     * @returns Promise with the updated resourcetimeoffadditional
     */
    patch(id: number, resourceTimeOffAdditional: Partial<IResourceTimeOffAdditional>): Promise<ApiResponse<IResourceTimeOffAdditional>>;
    /**
     * Delete a resourcetimeoffadditional
     * @param id - The resourcetimeoffadditional ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List resourcetimeoffadditional with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourcetimeoffadditional
     */
    list(query?: IResourceTimeOffAdditionalQuery): Promise<ApiResponse<IResourceTimeOffAdditional[]>>;
}
//# sourceMappingURL=resourcetimeoffadditional.d.ts.map