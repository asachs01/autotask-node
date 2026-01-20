import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItemNotes {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemNotesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItemNotes entity class for Autotask API
 *
 * Notes for configuration items
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemNotesEntity.htm}
 */
export declare class ConfigurationItemNotes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new configurationitemnotes
     * @param configurationItemNotes - The configurationitemnotes data to create
     * @returns Promise with the created configurationitemnotes
     */
    create(configurationItemNotes: IConfigurationItemNotes): Promise<ApiResponse<IConfigurationItemNotes>>;
    /**
     * Get a configurationitemnotes by ID
     * @param id - The configurationitemnotes ID
     * @returns Promise with the configurationitemnotes data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItemNotes>>;
    /**
     * Update a configurationitemnotes
     * @param id - The configurationitemnotes ID
     * @param configurationItemNotes - The updated configurationitemnotes data
     * @returns Promise with the updated configurationitemnotes
     */
    update(id: number, configurationItemNotes: Partial<IConfigurationItemNotes>): Promise<ApiResponse<IConfigurationItemNotes>>;
    /**
     * Partially update a configurationitemnotes
     * @param id - The configurationitemnotes ID
     * @param configurationItemNotes - The partial configurationitemnotes data to update
     * @returns Promise with the updated configurationitemnotes
     */
    patch(id: number, configurationItemNotes: Partial<IConfigurationItemNotes>): Promise<ApiResponse<IConfigurationItemNotes>>;
    /**
     * List configurationitemnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemnotes
     */
    list(query?: IConfigurationItemNotesQuery): Promise<ApiResponse<IConfigurationItemNotes[]>>;
}
//# sourceMappingURL=configurationitemnotes.d.ts.map