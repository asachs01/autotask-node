import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IQuoteItems {
    id?: number;
    [key: string]: any;
}
export interface IQuoteItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * QuoteItems entity class for Autotask API
 *
 * Line items within quotes
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/QuoteItemsEntity.htm}
 */
export declare class QuoteItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new quoteitems
     * @param quoteItems - The quoteitems data to create
     * @returns Promise with the created quoteitems
     */
    create(quoteItems: IQuoteItems): Promise<ApiResponse<IQuoteItems>>;
    /**
     * Get a quoteitems by ID
     * @param id - The quoteitems ID
     * @returns Promise with the quoteitems data
     */
    get(id: number): Promise<ApiResponse<IQuoteItems>>;
    /**
     * Update a quoteitems
     * @param id - The quoteitems ID
     * @param quoteItems - The updated quoteitems data
     * @returns Promise with the updated quoteitems
     */
    update(id: number, quoteItems: Partial<IQuoteItems>): Promise<ApiResponse<IQuoteItems>>;
    /**
     * Partially update a quoteitems
     * @param id - The quoteitems ID
     * @param quoteItems - The partial quoteitems data to update
     * @returns Promise with the updated quoteitems
     */
    patch(id: number, quoteItems: Partial<IQuoteItems>): Promise<ApiResponse<IQuoteItems>>;
    /**
     * Delete a quoteitems
     * @param id - The quoteitems ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List quoteitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of quoteitems
     */
    list(query?: IQuoteItemsQuery): Promise<ApiResponse<IQuoteItems[]>>;
}
//# sourceMappingURL=quoteitems.d.ts.map