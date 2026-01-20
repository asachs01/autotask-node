import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItemTypes {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemTypesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItemTypes entity class for Autotask API
 *
 * Types of configuration items
 * Supported Operations: GET
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemTypesEntity.htm}
 */
export declare class ConfigurationItemTypes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a configurationitemtypes by ID
     * @param id - The configurationitemtypes ID
     * @returns Promise with the configurationitemtypes data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItemTypes>>;
    /**
     * List configurationitemtypes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemtypes
     */
    list(query?: IConfigurationItemTypesQuery): Promise<ApiResponse<IConfigurationItemTypes[]>>;
}
//# sourceMappingURL=configurationitemtypes.d.ts.map