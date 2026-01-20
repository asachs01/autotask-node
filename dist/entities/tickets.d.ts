import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITickets {
    id?: number;
    [key: string]: any;
}
export interface ITicketsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Tickets entity class for Autotask API
 *
 * Service tickets and support requests
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketsEntity.htm}
 */
export declare class Tickets extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new tickets
     * @param tickets - The tickets data to create
     * @returns Promise with the created tickets
     */
    create(tickets: ITickets): Promise<ApiResponse<ITickets>>;
    /**
     * Get a tickets by ID
     * @param id - The tickets ID
     * @returns Promise with the tickets data
     */
    get(id: number): Promise<ApiResponse<ITickets>>;
    /**
     * Update a tickets
     * @param id - The tickets ID
     * @param tickets - The updated tickets data
     * @returns Promise with the updated tickets
     */
    update(id: number, tickets: Partial<ITickets>): Promise<ApiResponse<ITickets>>;
    /**
     * Partially update a tickets
     * @param id - The tickets ID
     * @param tickets - The partial tickets data to update
     * @returns Promise with the updated tickets
     */
    patch(id: number, tickets: Partial<ITickets>): Promise<ApiResponse<ITickets>>;
    /**
     * Delete a tickets
     * @param id - The tickets ID to delete
     * @returns Promise with void response
     */
    delete(id: number): Promise<void>;
    /**
     * List tickets with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of tickets
     */
    list(query?: ITicketsQuery): Promise<ApiResponse<ITickets[]>>;
}
//# sourceMappingURL=tickets.d.ts.map