import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITags {
    id?: number;
    [key: string]: any;
}
export interface ITagsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Tags entity class for Autotask API
 *
 * Tags for categorizing and organizing data
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: tags
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TagsEntity.htm}
 */
export declare class Tags extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new tags
     * @param tags - The tags data to create
     * @returns Promise with the created tags
     */
    create(tags: ITags): Promise<ApiResponse<ITags>>;
    /**
     * Get a tags by ID
     * @param id - The tags ID
     * @returns Promise with the tags data
     */
    get(id: number): Promise<ApiResponse<ITags>>;
    /**
     * Update a tags
     * @param id - The tags ID
     * @param tags - The updated tags data
     * @returns Promise with the updated tags
     */
    update(id: number, tags: Partial<ITags>): Promise<ApiResponse<ITags>>;
    /**
     * Partially update a tags
     * @param id - The tags ID
     * @param tags - The partial tags data to update
     * @returns Promise with the updated tags
     */
    patch(id: number, tags: Partial<ITags>): Promise<ApiResponse<ITags>>;
    /**
     * Delete a tags
     * @param id - The tags ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List tags with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of tags
     */
    list(query?: ITagsQuery): Promise<ApiResponse<ITags[]>>;
}
//# sourceMappingURL=tags.d.ts.map