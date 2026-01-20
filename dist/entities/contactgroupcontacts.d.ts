import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContactGroupContacts {
    id?: number;
    [key: string]: any;
}
export interface IContactGroupContactsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContactGroupContacts entity class for Autotask API
 *
 * Contacts within contact groups
 * Supported Operations: GET, POST, DELETE
 * Category: associations
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContactGroupContactsEntity.htm}
 */
export declare class ContactGroupContacts extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contactgroupcontacts
     * @param contactGroupContacts - The contactgroupcontacts data to create
     * @returns Promise with the created contactgroupcontacts
     */
    create(contactGroupContacts: IContactGroupContacts): Promise<ApiResponse<IContactGroupContacts>>;
    /**
     * Get a contactgroupcontacts by ID
     * @param id - The contactgroupcontacts ID
     * @returns Promise with the contactgroupcontacts data
     */
    get(id: number): Promise<ApiResponse<IContactGroupContacts>>;
    /**
     * Delete a contactgroupcontacts
     * @param id - The contactgroupcontacts ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contactgroupcontacts with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contactgroupcontacts
     */
    list(query?: IContactGroupContactsQuery): Promise<ApiResponse<IContactGroupContacts[]>>;
}
//# sourceMappingURL=contactgroupcontacts.d.ts.map