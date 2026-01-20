import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItemAttachments {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItemAttachments entity class for Autotask API
 *
 * File attachments for configuration items
 * Supported Operations: GET, POST, DELETE
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemAttachmentsEntity.htm}
 */
export declare class ConfigurationItemAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new configurationitemattachments
     * @param configurationItemAttachments - The configurationitemattachments data to create
     * @returns Promise with the created configurationitemattachments
     */
    create(configurationItemAttachments: IConfigurationItemAttachments): Promise<ApiResponse<IConfigurationItemAttachments>>;
    /**
     * Get a configurationitemattachments by ID
     * @param id - The configurationitemattachments ID
     * @returns Promise with the configurationitemattachments data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItemAttachments>>;
    /**
     * Delete a configurationitemattachments
     * @param id - The configurationitemattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List configurationitemattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemattachments
     */
    list(query?: IConfigurationItemAttachmentsQuery): Promise<ApiResponse<IConfigurationItemAttachments[]>>;
}
//# sourceMappingURL=configurationitemattachments.d.ts.map