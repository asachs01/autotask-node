import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketAdditionalContacts {
    id?: number;
    [key: string]: any;
}
export interface ITicketAdditionalContactsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketAdditionalContacts entity class for Autotask API
 *
 * Additional contacts associated with tickets
 * Supported Operations: GET, POST, DELETE
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketAdditionalContactsEntity.htm}
 */
export declare class TicketAdditionalContacts extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new ticketadditionalcontacts
     * @param ticketAdditionalContacts - The ticketadditionalcontacts data to create
     * @returns Promise with the created ticketadditionalcontacts
     */
    create(ticketAdditionalContacts: ITicketAdditionalContacts): Promise<ApiResponse<ITicketAdditionalContacts>>;
    /**
     * Get a ticketadditionalcontacts by ID
     * @param id - The ticketadditionalcontacts ID
     * @returns Promise with the ticketadditionalcontacts data
     */
    get(id: number): Promise<ApiResponse<ITicketAdditionalContacts>>;
    /**
     * Delete a ticketadditionalcontacts
     * @param id - The ticketadditionalcontacts ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List ticketadditionalcontacts with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketadditionalcontacts
     */
    list(query?: ITicketAdditionalContactsQuery): Promise<ApiResponse<ITicketAdditionalContacts[]>>;
}
//# sourceMappingURL=ticketadditionalcontacts.d.ts.map