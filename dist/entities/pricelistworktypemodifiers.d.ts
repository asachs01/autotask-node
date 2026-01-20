import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPriceListWorkTypeModifiers {
    id?: number;
    [key: string]: any;
}
export interface IPriceListWorkTypeModifiersQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PriceListWorkTypeModifiers entity class for Autotask API
 *
 * Work type modifiers in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListWorkTypeModifiersEntity.htm}
 */
export declare class PriceListWorkTypeModifiers extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new pricelistworktypemodifiers
     * @param priceListWorkTypeModifiers - The pricelistworktypemodifiers data to create
     * @returns Promise with the created pricelistworktypemodifiers
     */
    create(priceListWorkTypeModifiers: IPriceListWorkTypeModifiers): Promise<ApiResponse<IPriceListWorkTypeModifiers>>;
    /**
     * Get a pricelistworktypemodifiers by ID
     * @param id - The pricelistworktypemodifiers ID
     * @returns Promise with the pricelistworktypemodifiers data
     */
    get(id: number): Promise<ApiResponse<IPriceListWorkTypeModifiers>>;
    /**
     * Update a pricelistworktypemodifiers
     * @param id - The pricelistworktypemodifiers ID
     * @param priceListWorkTypeModifiers - The updated pricelistworktypemodifiers data
     * @returns Promise with the updated pricelistworktypemodifiers
     */
    update(id: number, priceListWorkTypeModifiers: Partial<IPriceListWorkTypeModifiers>): Promise<ApiResponse<IPriceListWorkTypeModifiers>>;
    /**
     * Partially update a pricelistworktypemodifiers
     * @param id - The pricelistworktypemodifiers ID
     * @param priceListWorkTypeModifiers - The partial pricelistworktypemodifiers data to update
     * @returns Promise with the updated pricelistworktypemodifiers
     */
    patch(id: number, priceListWorkTypeModifiers: Partial<IPriceListWorkTypeModifiers>): Promise<ApiResponse<IPriceListWorkTypeModifiers>>;
    /**
     * Delete a pricelistworktypemodifiers
     * @param id - The pricelistworktypemodifiers ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List pricelistworktypemodifiers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of pricelistworktypemodifiers
     */
    list(query?: IPriceListWorkTypeModifiersQuery): Promise<ApiResponse<IPriceListWorkTypeModifiers[]>>;
}
//# sourceMappingURL=pricelistworktypemodifiers.d.ts.map