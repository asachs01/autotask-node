import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItemCategories {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemCategoriesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItemCategories entity class for Autotask API
 *
 * Categories for configuration items
 * Supported Operations: GET
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemCategoriesEntity.htm}
 */
export declare class ConfigurationItemCategories extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a configurationitemcategories by ID
     * @param id - The configurationitemcategories ID
     * @returns Promise with the configurationitemcategories data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItemCategories>>;
    /**
     * List configurationitemcategories with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemcategories
     */
    list(query?: IConfigurationItemCategoriesQuery): Promise<ApiResponse<IConfigurationItemCategories[]>>;
}
//# sourceMappingURL=configurationitemcategories.d.ts.map