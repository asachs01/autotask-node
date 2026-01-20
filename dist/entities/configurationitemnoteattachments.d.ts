import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItemNoteAttachments {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemNoteAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItemNoteAttachments entity class for Autotask API
 *
 * File attachments for configuration item notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemNoteAttachmentsEntity.htm}
 */
export declare class ConfigurationItemNoteAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new configurationitemnoteattachments
     * @param configurationItemNoteAttachments - The configurationitemnoteattachments data to create
     * @returns Promise with the created configurationitemnoteattachments
     */
    create(configurationItemNoteAttachments: IConfigurationItemNoteAttachments): Promise<ApiResponse<IConfigurationItemNoteAttachments>>;
    /**
     * Get a configurationitemnoteattachments by ID
     * @param id - The configurationitemnoteattachments ID
     * @returns Promise with the configurationitemnoteattachments data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItemNoteAttachments>>;
    /**
     * Delete a configurationitemnoteattachments
     * @param id - The configurationitemnoteattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List configurationitemnoteattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemnoteattachments
     */
    list(query?: IConfigurationItemNoteAttachmentsQuery): Promise<ApiResponse<IConfigurationItemNoteAttachments[]>>;
}
//# sourceMappingURL=configurationitemnoteattachments.d.ts.map