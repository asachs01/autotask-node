import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketCategories {
    id?: number;
    [key: string]: any;
}
export interface ITicketCategoriesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketCategories entity class for Autotask API
 *
 * Categories for organizing tickets
 * Supported Operations: GET
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketCategoriesEntity.htm}
 */
export declare class TicketCategories extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a ticketcategories by ID
     * @param id - The ticketcategories ID
     * @returns Promise with the ticketcategories data
     */
    get(id: number): Promise<ApiResponse<ITicketCategories>>;
    /**
     * List ticketcategories with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketcategories
     */
    list(query?: ITicketCategoriesQuery): Promise<ApiResponse<ITicketCategories[]>>;
}
//# sourceMappingURL=ticketcategories.d.ts.map