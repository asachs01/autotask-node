import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IOrganizationalLevel1 {
    id?: number;
    [key: string]: any;
}
export interface IOrganizationalLevel1Query {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * OrganizationalLevel1 entity class for Autotask API
 *
 * First level of organizational hierarchy
 * Supported Operations: GET
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OrganizationalLevel1Entity.htm}
 */
export declare class OrganizationalLevel1 extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a organizationallevel1 by ID
     * @param id - The organizationallevel1 ID
     * @returns Promise with the organizationallevel1 data
     */
    get(id: number): Promise<ApiResponse<IOrganizationalLevel1>>;
    /**
     * List organizationallevel1 with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of organizationallevel1
     */
    list(query?: IOrganizationalLevel1Query): Promise<ApiResponse<IOrganizationalLevel1[]>>;
}
//# sourceMappingURL=organizationallevel1.d.ts.map