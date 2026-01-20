import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICountries {
    id?: number;
    [key: string]: any;
}
export interface ICountriesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Countries entity class for Autotask API
 *
 * List of countries for localization
 * Supported Operations: GET
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CountriesEntity.htm}
 */
export declare class Countries extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a countries by ID
     * @param id - The countries ID
     * @returns Promise with the countries data
     */
    get(id: number): Promise<ApiResponse<ICountries>>;
    /**
     * List countries with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of countries
     */
    list(query?: ICountriesQuery): Promise<ApiResponse<ICountries[]>>;
}
//# sourceMappingURL=countries.d.ts.map