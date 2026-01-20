import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketAdditionalConfigurationItems {
    id?: number;
    [key: string]: any;
}
export interface ITicketAdditionalConfigurationItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketAdditionalConfigurationItems entity class for Autotask API
 *
 * Additional configuration items associated with tickets
 * Supported Operations: GET, POST, DELETE
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketAdditionalConfigurationItemsEntity.htm}
 */
export declare class TicketAdditionalConfigurationItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new ticketadditionalconfigurationitems
     * @param ticketAdditionalConfigurationItems - The ticketadditionalconfigurationitems data to create
     * @returns Promise with the created ticketadditionalconfigurationitems
     */
    create(ticketAdditionalConfigurationItems: ITicketAdditionalConfigurationItems): Promise<ApiResponse<ITicketAdditionalConfigurationItems>>;
    /**
     * Get a ticketadditionalconfigurationitems by ID
     * @param id - The ticketadditionalconfigurationitems ID
     * @returns Promise with the ticketadditionalconfigurationitems data
     */
    get(id: number): Promise<ApiResponse<ITicketAdditionalConfigurationItems>>;
    /**
     * Delete a ticketadditionalconfigurationitems
     * @param id - The ticketadditionalconfigurationitems ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List ticketadditionalconfigurationitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketadditionalconfigurationitems
     */
    list(query?: ITicketAdditionalConfigurationItemsQuery): Promise<ApiResponse<ITicketAdditionalConfigurationItems[]>>;
}
//# sourceMappingURL=ticketadditionalconfigurationitems.d.ts.map