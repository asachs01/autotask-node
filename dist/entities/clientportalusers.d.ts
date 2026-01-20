import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IClientPortalUsers {
    id?: number;
    [key: string]: any;
}
export interface IClientPortalUsersQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ClientPortalUsers entity class for Autotask API
 *
 * Users with access to the client portal
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: portal
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ClientPortalUsersEntity.htm}
 */
export declare class ClientPortalUsers extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new clientportalusers
     * @param clientPortalUsers - The clientportalusers data to create
     * @returns Promise with the created clientportalusers
     */
    create(clientPortalUsers: IClientPortalUsers): Promise<ApiResponse<IClientPortalUsers>>;
    /**
     * Get a clientportalusers by ID
     * @param id - The clientportalusers ID
     * @returns Promise with the clientportalusers data
     */
    get(id: number): Promise<ApiResponse<IClientPortalUsers>>;
    /**
     * Update a clientportalusers
     * @param id - The clientportalusers ID
     * @param clientPortalUsers - The updated clientportalusers data
     * @returns Promise with the updated clientportalusers
     */
    update(id: number, clientPortalUsers: Partial<IClientPortalUsers>): Promise<ApiResponse<IClientPortalUsers>>;
    /**
     * Partially update a clientportalusers
     * @param id - The clientportalusers ID
     * @param clientPortalUsers - The partial clientportalusers data to update
     * @returns Promise with the updated clientportalusers
     */
    patch(id: number, clientPortalUsers: Partial<IClientPortalUsers>): Promise<ApiResponse<IClientPortalUsers>>;
    /**
     * Delete a clientportalusers
     * @param id - The clientportalusers ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List clientportalusers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of clientportalusers
     */
    list(query?: IClientPortalUsersQuery): Promise<ApiResponse<IClientPortalUsers[]>>;
}
//# sourceMappingURL=clientportalusers.d.ts.map