import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItemSslSubjectAlternativeName {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemSslSubjectAlternativeNameQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItemSslSubjectAlternativeName entity class for Autotask API
 *
 * SSL subject alternative names for configuration items
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemSslSubjectAlternativeNameEntity.htm}
 */
export declare class ConfigurationItemSslSubjectAlternativeName extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new configurationitemsslsubjectalternativename
     * @param configurationItemSslSubjectAlternativeName - The configurationitemsslsubjectalternativename data to create
     * @returns Promise with the created configurationitemsslsubjectalternativename
     */
    create(configurationItemSslSubjectAlternativeName: IConfigurationItemSslSubjectAlternativeName): Promise<ApiResponse<IConfigurationItemSslSubjectAlternativeName>>;
    /**
     * Get a configurationitemsslsubjectalternativename by ID
     * @param id - The configurationitemsslsubjectalternativename ID
     * @returns Promise with the configurationitemsslsubjectalternativename data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItemSslSubjectAlternativeName>>;
    /**
     * Update a configurationitemsslsubjectalternativename
     * @param id - The configurationitemsslsubjectalternativename ID
     * @param configurationItemSslSubjectAlternativeName - The updated configurationitemsslsubjectalternativename data
     * @returns Promise with the updated configurationitemsslsubjectalternativename
     */
    update(id: number, configurationItemSslSubjectAlternativeName: Partial<IConfigurationItemSslSubjectAlternativeName>): Promise<ApiResponse<IConfigurationItemSslSubjectAlternativeName>>;
    /**
     * Partially update a configurationitemsslsubjectalternativename
     * @param id - The configurationitemsslsubjectalternativename ID
     * @param configurationItemSslSubjectAlternativeName - The partial configurationitemsslsubjectalternativename data to update
     * @returns Promise with the updated configurationitemsslsubjectalternativename
     */
    patch(id: number, configurationItemSslSubjectAlternativeName: Partial<IConfigurationItemSslSubjectAlternativeName>): Promise<ApiResponse<IConfigurationItemSslSubjectAlternativeName>>;
    /**
     * Delete a configurationitemsslsubjectalternativename
     * @param id - The configurationitemsslsubjectalternativename ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List configurationitemsslsubjectalternativename with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemsslsubjectalternativename
     */
    list(query?: IConfigurationItemSslSubjectAlternativeNameQuery): Promise<ApiResponse<IConfigurationItemSslSubjectAlternativeName[]>>;
}
//# sourceMappingURL=configurationitemsslsubjectalternativename.d.ts.map