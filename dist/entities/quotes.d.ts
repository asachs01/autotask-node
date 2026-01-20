import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IQuotes {
    id?: number;
    [key: string]: any;
}
export interface IQuotesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Quotes entity class for Autotask API
 *
 * Customer quotes and estimates
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/QuotesEntity.htm}
 */
export declare class Quotes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new quotes
     * @param quotes - The quotes data to create
     * @returns Promise with the created quotes
     */
    create(quotes: IQuotes): Promise<ApiResponse<IQuotes>>;
    /**
     * Get a quotes by ID
     * @param id - The quotes ID
     * @returns Promise with the quotes data
     */
    get(id: number): Promise<ApiResponse<IQuotes>>;
    /**
     * Update a quotes
     * @param id - The quotes ID
     * @param quotes - The updated quotes data
     * @returns Promise with the updated quotes
     */
    update(id: number, quotes: Partial<IQuotes>): Promise<ApiResponse<IQuotes>>;
    /**
     * Partially update a quotes
     * @param id - The quotes ID
     * @param quotes - The partial quotes data to update
     * @returns Promise with the updated quotes
     */
    patch(id: number, quotes: Partial<IQuotes>): Promise<ApiResponse<IQuotes>>;
    /**
     * List quotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of quotes
     */
    list(query?: IQuotesQuery): Promise<ApiResponse<IQuotes[]>>;
}
//# sourceMappingURL=quotes.d.ts.map