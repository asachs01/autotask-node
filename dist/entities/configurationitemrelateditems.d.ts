import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItemRelatedItems {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemRelatedItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItemRelatedItems entity class for Autotask API
 *
 * Related items for configuration items
 * Supported Operations: GET, POST, DELETE
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemRelatedItemsEntity.htm}
 */
export declare class ConfigurationItemRelatedItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new configurationitemrelateditems
     * @param configurationItemRelatedItems - The configurationitemrelateditems data to create
     * @returns Promise with the created configurationitemrelateditems
     */
    create(configurationItemRelatedItems: IConfigurationItemRelatedItems): Promise<ApiResponse<IConfigurationItemRelatedItems>>;
    /**
     * Get a configurationitemrelateditems by ID
     * @param id - The configurationitemrelateditems ID
     * @returns Promise with the configurationitemrelateditems data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItemRelatedItems>>;
    /**
     * Delete a configurationitemrelateditems
     * @param id - The configurationitemrelateditems ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List configurationitemrelateditems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemrelateditems
     */
    list(query?: IConfigurationItemRelatedItemsQuery): Promise<ApiResponse<IConfigurationItemRelatedItems[]>>;
}
//# sourceMappingURL=configurationitemrelateditems.d.ts.map