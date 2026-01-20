import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITagGroups {
    id?: number;
    [key: string]: any;
}
export interface ITagGroupsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TagGroups entity class for Autotask API
 *
 * Groups for organizing tags
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: tags
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TagGroupsEntity.htm}
 */
export declare class TagGroups extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new taggroups
     * @param tagGroups - The taggroups data to create
     * @returns Promise with the created taggroups
     */
    create(tagGroups: ITagGroups): Promise<ApiResponse<ITagGroups>>;
    /**
     * Get a taggroups by ID
     * @param id - The taggroups ID
     * @returns Promise with the taggroups data
     */
    get(id: number): Promise<ApiResponse<ITagGroups>>;
    /**
     * Update a taggroups
     * @param id - The taggroups ID
     * @param tagGroups - The updated taggroups data
     * @returns Promise with the updated taggroups
     */
    update(id: number, tagGroups: Partial<ITagGroups>): Promise<ApiResponse<ITagGroups>>;
    /**
     * Partially update a taggroups
     * @param id - The taggroups ID
     * @param tagGroups - The partial taggroups data to update
     * @returns Promise with the updated taggroups
     */
    patch(id: number, tagGroups: Partial<ITagGroups>): Promise<ApiResponse<ITagGroups>>;
    /**
     * Delete a taggroups
     * @param id - The taggroups ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List taggroups with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of taggroups
     */
    list(query?: ITagGroupsQuery): Promise<ApiResponse<ITagGroups[]>>;
}
//# sourceMappingURL=taggroups.d.ts.map