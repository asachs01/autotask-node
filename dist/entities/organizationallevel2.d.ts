import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IOrganizationalLevel2 {
    id?: number;
    [key: string]: any;
}
export interface IOrganizationalLevel2Query {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * OrganizationalLevel2 entity class for Autotask API
 *
 * Second level of organizational hierarchy
 * Supported Operations: GET
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OrganizationalLevel2Entity.htm}
 */
export declare class OrganizationalLevel2 extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a organizationallevel2 by ID
     * @param id - The organizationallevel2 ID
     * @returns Promise with the organizationallevel2 data
     */
    get(id: number): Promise<ApiResponse<IOrganizationalLevel2>>;
    /**
     * List organizationallevel2 with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of organizationallevel2
     */
    list(query?: IOrganizationalLevel2Query): Promise<ApiResponse<IOrganizationalLevel2[]>>;
}
//# sourceMappingURL=organizationallevel2.d.ts.map