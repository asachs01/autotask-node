import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItems {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItems entity class for Autotask API
 *
 * Configuration items and assets
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemsEntity.htm}
 */
export declare class ConfigurationItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new configurationitems
     * @param configurationItems - The configurationitems data to create
     * @returns Promise with the created configurationitems
     */
    create(configurationItems: IConfigurationItems): Promise<ApiResponse<IConfigurationItems>>;
    /**
     * Get a configurationitems by ID
     * @param id - The configurationitems ID
     * @returns Promise with the configurationitems data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItems>>;
    /**
     * Update a configurationitems
     * @param id - The configurationitems ID
     * @param configurationItems - The updated configurationitems data
     * @returns Promise with the updated configurationitems
     */
    update(id: number, configurationItems: Partial<IConfigurationItems>): Promise<ApiResponse<IConfigurationItems>>;
    /**
     * Partially update a configurationitems
     * @param id - The configurationitems ID
     * @param configurationItems - The partial configurationitems data to update
     * @returns Promise with the updated configurationitems
     */
    patch(id: number, configurationItems: Partial<IConfigurationItems>): Promise<ApiResponse<IConfigurationItems>>;
    /**
     * List configurationitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitems
     */
    list(query?: IConfigurationItemsQuery): Promise<ApiResponse<IConfigurationItems[]>>;
}
//# sourceMappingURL=configurationitems.d.ts.map