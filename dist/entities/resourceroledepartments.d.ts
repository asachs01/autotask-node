import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResourceRoleDepartments {
    id?: number;
    [key: string]: any;
}
export interface IResourceRoleDepartmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ResourceRoleDepartments entity class for Autotask API
 *
 * Department assignments for resource roles
 * Supported Operations: GET, POST, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceRoleDepartmentsEntity.htm}
 */
export declare class ResourceRoleDepartments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new resourceroledepartments
     * @param resourceRoleDepartments - The resourceroledepartments data to create
     * @returns Promise with the created resourceroledepartments
     */
    create(resourceRoleDepartments: IResourceRoleDepartments): Promise<ApiResponse<IResourceRoleDepartments>>;
    /**
     * Get a resourceroledepartments by ID
     * @param id - The resourceroledepartments ID
     * @returns Promise with the resourceroledepartments data
     */
    get(id: number): Promise<ApiResponse<IResourceRoleDepartments>>;
    /**
     * Delete a resourceroledepartments
     * @param id - The resourceroledepartments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List resourceroledepartments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourceroledepartments
     */
    list(query?: IResourceRoleDepartmentsQuery): Promise<ApiResponse<IResourceRoleDepartments[]>>;
}
//# sourceMappingURL=resourceroledepartments.d.ts.map