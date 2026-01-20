import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IOrganizatonalResources {
    id?: number;
    [key: string]: any;
}
export interface IOrganizatonalResourcesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * OrganizatonalResources entity class for Autotask API
 *
 * Resources organized by organizational structure
 * Supported Operations: GET
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OrganizatonalResourcesEntity.htm}
 */
export declare class OrganizatonalResources extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a organizatonalresources by ID
     * @param id - The organizatonalresources ID
     * @returns Promise with the organizatonalresources data
     */
    get(id: number): Promise<ApiResponse<IOrganizatonalResources>>;
    /**
     * List organizatonalresources with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of organizatonalresources
     */
    list(query?: IOrganizatonalResourcesQuery): Promise<ApiResponse<IOrganizatonalResources[]>>;
}
//# sourceMappingURL=organizatonalresources.d.ts.map