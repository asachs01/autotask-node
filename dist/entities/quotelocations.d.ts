import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IQuoteLocations {
    id?: number;
    [key: string]: any;
}
export interface IQuoteLocationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * QuoteLocations entity class for Autotask API
 *
 * Location information for quotes
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/QuoteLocationsEntity.htm}
 */
export declare class QuoteLocations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new quotelocations
     * @param quoteLocations - The quotelocations data to create
     * @returns Promise with the created quotelocations
     */
    create(quoteLocations: IQuoteLocations): Promise<ApiResponse<IQuoteLocations>>;
    /**
     * Get a quotelocations by ID
     * @param id - The quotelocations ID
     * @returns Promise with the quotelocations data
     */
    get(id: number): Promise<ApiResponse<IQuoteLocations>>;
    /**
     * Update a quotelocations
     * @param id - The quotelocations ID
     * @param quoteLocations - The updated quotelocations data
     * @returns Promise with the updated quotelocations
     */
    update(id: number, quoteLocations: Partial<IQuoteLocations>): Promise<ApiResponse<IQuoteLocations>>;
    /**
     * Partially update a quotelocations
     * @param id - The quotelocations ID
     * @param quoteLocations - The partial quotelocations data to update
     * @returns Promise with the updated quotelocations
     */
    patch(id: number, quoteLocations: Partial<IQuoteLocations>): Promise<ApiResponse<IQuoteLocations>>;
    /**
     * Delete a quotelocations
     * @param id - The quotelocations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List quotelocations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of quotelocations
     */
    list(query?: IQuoteLocationsQuery): Promise<ApiResponse<IQuoteLocations[]>>;
}
//# sourceMappingURL=quotelocations.d.ts.map