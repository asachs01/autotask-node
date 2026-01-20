import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItemBillingProductAssociations {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemBillingProductAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItemBillingProductAssociations entity class for Autotask API
 *
 * Associations between configuration items and billing products
 * Supported Operations: GET, POST, DELETE
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemBillingProductAssociationsEntity.htm}
 */
export declare class ConfigurationItemBillingProductAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new configurationitembillingproductassociations
     * @param configurationItemBillingProductAssociations - The configurationitembillingproductassociations data to create
     * @returns Promise with the created configurationitembillingproductassociations
     */
    create(configurationItemBillingProductAssociations: IConfigurationItemBillingProductAssociations): Promise<ApiResponse<IConfigurationItemBillingProductAssociations>>;
    /**
     * Get a configurationitembillingproductassociations by ID
     * @param id - The configurationitembillingproductassociations ID
     * @returns Promise with the configurationitembillingproductassociations data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItemBillingProductAssociations>>;
    /**
     * Delete a configurationitembillingproductassociations
     * @param id - The configurationitembillingproductassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List configurationitembillingproductassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitembillingproductassociations
     */
    list(query?: IConfigurationItemBillingProductAssociationsQuery): Promise<ApiResponse<IConfigurationItemBillingProductAssociations[]>>;
}
//# sourceMappingURL=configurationitembillingproductassociations.d.ts.map