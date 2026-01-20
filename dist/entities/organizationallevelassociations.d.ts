import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IOrganizationalLevelAssociations {
    id?: number;
    [key: string]: any;
}
export interface IOrganizationalLevelAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * OrganizationalLevelAssociations entity class for Autotask API
 *
 * Associations between organizational levels
 * Supported Operations: GET, POST, DELETE
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OrganizationalLevelAssociationsEntity.htm}
 */
export declare class OrganizationalLevelAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new organizationallevelassociations
     * @param organizationalLevelAssociations - The organizationallevelassociations data to create
     * @returns Promise with the created organizationallevelassociations
     */
    create(organizationalLevelAssociations: IOrganizationalLevelAssociations): Promise<ApiResponse<IOrganizationalLevelAssociations>>;
    /**
     * Get a organizationallevelassociations by ID
     * @param id - The organizationallevelassociations ID
     * @returns Promise with the organizationallevelassociations data
     */
    get(id: number): Promise<ApiResponse<IOrganizationalLevelAssociations>>;
    /**
     * Delete a organizationallevelassociations
     * @param id - The organizationallevelassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List organizationallevelassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of organizationallevelassociations
     */
    list(query?: IOrganizationalLevelAssociationsQuery): Promise<ApiResponse<IOrganizationalLevelAssociations[]>>;
}
//# sourceMappingURL=organizationallevelassociations.d.ts.map