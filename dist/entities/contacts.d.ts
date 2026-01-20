import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContacts {
    id?: number;
    [key: string]: any;
}
export interface IContactsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Contacts entity class for Autotask API
 *
 * Individual contacts within companies
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContactsEntity.htm}
 */
export declare class Contacts extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contacts
     * @param contacts - The contacts data to create
     * @returns Promise with the created contacts
     */
    create(contacts: IContacts): Promise<ApiResponse<IContacts>>;
    /**
     * Get a contacts by ID
     * @param id - The contacts ID
     * @returns Promise with the contacts data
     */
    get(id: number): Promise<ApiResponse<IContacts>>;
    /**
     * Update a contacts
     * @param id - The contacts ID
     * @param contacts - The updated contacts data
     * @returns Promise with the updated contacts
     */
    update(id: number, contacts: Partial<IContacts>): Promise<ApiResponse<IContacts>>;
    /**
     * Partially update a contacts
     * @param id - The contacts ID
     * @param contacts - The partial contacts data to update
     * @returns Promise with the updated contacts
     */
    patch(id: number, contacts: Partial<IContacts>): Promise<ApiResponse<IContacts>>;
    /**
     * Delete a contacts
     * @param id - The contacts ID to delete
     * @returns Promise with void response
     */
    delete(id: number): Promise<void>;
    /**
     * List contacts with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contacts
     */
    list(query?: IContactsQuery): Promise<ApiResponse<IContacts[]>>;
}
//# sourceMappingURL=contacts.d.ts.map