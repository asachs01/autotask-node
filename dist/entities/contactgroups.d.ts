import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContactGroups {
    id?: number;
    [key: string]: any;
}
export interface IContactGroupsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContactGroups entity class for Autotask API
 *
 * Groups for organizing contacts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: associations
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContactGroupsEntity.htm}
 */
export declare class ContactGroups extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contactgroups
     * @param contactGroups - The contactgroups data to create
     * @returns Promise with the created contactgroups
     */
    create(contactGroups: IContactGroups): Promise<ApiResponse<IContactGroups>>;
    /**
     * Get a contactgroups by ID
     * @param id - The contactgroups ID
     * @returns Promise with the contactgroups data
     */
    get(id: number): Promise<ApiResponse<IContactGroups>>;
    /**
     * Update a contactgroups
     * @param id - The contactgroups ID
     * @param contactGroups - The updated contactgroups data
     * @returns Promise with the updated contactgroups
     */
    update(id: number, contactGroups: Partial<IContactGroups>): Promise<ApiResponse<IContactGroups>>;
    /**
     * Partially update a contactgroups
     * @param id - The contactgroups ID
     * @param contactGroups - The partial contactgroups data to update
     * @returns Promise with the updated contactgroups
     */
    patch(id: number, contactGroups: Partial<IContactGroups>): Promise<ApiResponse<IContactGroups>>;
    /**
     * Delete a contactgroups
     * @param id - The contactgroups ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contactgroups with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contactgroups
     */
    list(query?: IContactGroupsQuery): Promise<ApiResponse<IContactGroups[]>>;
}
//# sourceMappingURL=contactgroups.d.ts.map