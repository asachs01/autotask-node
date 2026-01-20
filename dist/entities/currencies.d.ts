import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICurrencies {
    id?: number;
    [key: string]: any;
}
export interface ICurrenciesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Currencies entity class for Autotask API
 *
 * Available currencies for financial transactions
 * Supported Operations: GET
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CurrenciesEntity.htm}
 */
export declare class Currencies extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a currencies by ID
     * @param id - The currencies ID
     * @returns Promise with the currencies data
     */
    get(id: number): Promise<ApiResponse<ICurrencies>>;
    /**
     * List currencies with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of currencies
     */
    list(query?: ICurrenciesQuery): Promise<ApiResponse<ICurrencies[]>>;
}
//# sourceMappingURL=currencies.d.ts.map