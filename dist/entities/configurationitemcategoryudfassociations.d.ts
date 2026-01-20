import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItemCategoryUdfAssociations {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemCategoryUdfAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItemCategoryUdfAssociations entity class for Autotask API
 *
 * UDF associations for configuration item categories
 * Supported Operations: GET
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemCategoryUdfAssociationsEntity.htm}
 */
export declare class ConfigurationItemCategoryUdfAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a configurationitemcategoryudfassociations by ID
     * @param id - The configurationitemcategoryudfassociations ID
     * @returns Promise with the configurationitemcategoryudfassociations data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItemCategoryUdfAssociations>>;
    /**
     * List configurationitemcategoryudfassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemcategoryudfassociations
     */
    list(query?: IConfigurationItemCategoryUdfAssociationsQuery): Promise<ApiResponse<IConfigurationItemCategoryUdfAssociations[]>>;
}
//# sourceMappingURL=configurationitemcategoryudfassociations.d.ts.map