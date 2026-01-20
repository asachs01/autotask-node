import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketTagAssociations {
    id?: number;
    [key: string]: any;
}
export interface ITicketTagAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketTagAssociations entity class for Autotask API
 *
 * Tag associations for tickets
 * Supported Operations: GET, POST, DELETE
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketTagAssociationsEntity.htm}
 */
export declare class TicketTagAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new tickettagassociations
     * @param ticketTagAssociations - The tickettagassociations data to create
     * @returns Promise with the created tickettagassociations
     */
    create(ticketTagAssociations: ITicketTagAssociations): Promise<ApiResponse<ITicketTagAssociations>>;
    /**
     * Get a tickettagassociations by ID
     * @param id - The tickettagassociations ID
     * @returns Promise with the tickettagassociations data
     */
    get(id: number): Promise<ApiResponse<ITicketTagAssociations>>;
    /**
     * Delete a tickettagassociations
     * @param id - The tickettagassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List tickettagassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of tickettagassociations
     */
    list(query?: ITicketTagAssociationsQuery): Promise<ApiResponse<ITicketTagAssociations[]>>;
}
//# sourceMappingURL=tickettagassociations.d.ts.map