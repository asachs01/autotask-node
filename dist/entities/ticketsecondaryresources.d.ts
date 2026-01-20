import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketSecondaryResources {
    id?: number;
    [key: string]: any;
}
export interface ITicketSecondaryResourcesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketSecondaryResources entity class for Autotask API
 *
 * Secondary resource assignments for tickets
 * Supported Operations: GET, POST, DELETE
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketSecondaryResourcesEntity.htm}
 */
export declare class TicketSecondaryResources extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new ticketsecondaryresources
     * @param ticketSecondaryResources - The ticketsecondaryresources data to create
     * @returns Promise with the created ticketsecondaryresources
     */
    create(ticketSecondaryResources: ITicketSecondaryResources): Promise<ApiResponse<ITicketSecondaryResources>>;
    /**
     * Get a ticketsecondaryresources by ID
     * @param id - The ticketsecondaryresources ID
     * @returns Promise with the ticketsecondaryresources data
     */
    get(id: number): Promise<ApiResponse<ITicketSecondaryResources>>;
    /**
     * Delete a ticketsecondaryresources
     * @param id - The ticketsecondaryresources ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List ticketsecondaryresources with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketsecondaryresources
     */
    list(query?: ITicketSecondaryResourcesQuery): Promise<ApiResponse<ITicketSecondaryResources[]>>;
}
//# sourceMappingURL=ticketsecondaryresources.d.ts.map