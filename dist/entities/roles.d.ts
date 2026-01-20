import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IRoles {
    id?: number;
    [key: string]: any;
}
export interface IRolesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Roles entity class for Autotask API
 *
 * System roles and permissions
 * Supported Operations: GET
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/RolesEntity.htm}
 */
export declare class Roles extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a roles by ID
     * @param id - The roles ID
     * @returns Promise with the roles data
     */
    get(id: number): Promise<ApiResponse<IRoles>>;
    /**
     * List roles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of roles
     */
    list(query?: IRolesQuery): Promise<ApiResponse<IRoles[]>>;
}
//# sourceMappingURL=roles.d.ts.map