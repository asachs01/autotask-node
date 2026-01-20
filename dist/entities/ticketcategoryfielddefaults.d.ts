import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketCategoryFieldDefaults {
    id?: number;
    [key: string]: any;
}
export interface ITicketCategoryFieldDefaultsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketCategoryFieldDefaults entity class for Autotask API
 *
 * Default field values for ticket categories
 * Supported Operations: GET
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketCategoryFieldDefaultsEntity.htm}
 */
export declare class TicketCategoryFieldDefaults extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a ticketcategoryfielddefaults by ID
     * @param id - The ticketcategoryfielddefaults ID
     * @returns Promise with the ticketcategoryfielddefaults data
     */
    get(id: number): Promise<ApiResponse<ITicketCategoryFieldDefaults>>;
    /**
     * List ticketcategoryfielddefaults with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketcategoryfielddefaults
     */
    list(query?: ITicketCategoryFieldDefaultsQuery): Promise<ApiResponse<ITicketCategoryFieldDefaults[]>>;
}
//# sourceMappingURL=ticketcategoryfielddefaults.d.ts.map