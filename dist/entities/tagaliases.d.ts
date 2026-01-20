import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITagAliases {
    id?: number;
    [key: string]: any;
}
export interface ITagAliasesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TagAliases entity class for Autotask API
 *
 * Alternative names for tags
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: tags
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TagAliasesEntity.htm}
 */
export declare class TagAliases extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new tagaliases
     * @param tagAliases - The tagaliases data to create
     * @returns Promise with the created tagaliases
     */
    create(tagAliases: ITagAliases): Promise<ApiResponse<ITagAliases>>;
    /**
     * Get a tagaliases by ID
     * @param id - The tagaliases ID
     * @returns Promise with the tagaliases data
     */
    get(id: number): Promise<ApiResponse<ITagAliases>>;
    /**
     * Update a tagaliases
     * @param id - The tagaliases ID
     * @param tagAliases - The updated tagaliases data
     * @returns Promise with the updated tagaliases
     */
    update(id: number, tagAliases: Partial<ITagAliases>): Promise<ApiResponse<ITagAliases>>;
    /**
     * Partially update a tagaliases
     * @param id - The tagaliases ID
     * @param tagAliases - The partial tagaliases data to update
     * @returns Promise with the updated tagaliases
     */
    patch(id: number, tagAliases: Partial<ITagAliases>): Promise<ApiResponse<ITagAliases>>;
    /**
     * Delete a tagaliases
     * @param id - The tagaliases ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List tagaliases with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of tagaliases
     */
    list(query?: ITagAliasesQuery): Promise<ApiResponse<ITagAliases[]>>;
}
//# sourceMappingURL=tagaliases.d.ts.map