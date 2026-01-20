import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITaxCategories {
    id?: number;
    [key: string]: any;
}
export interface ITaxCategoriesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TaxCategories entity class for Autotask API
 *
 * Categories for tax calculations
 * Supported Operations: GET
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaxCategoriesEntity.htm}
 */
export declare class TaxCategories extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a taxcategories by ID
     * @param id - The taxcategories ID
     * @returns Promise with the taxcategories data
     */
    get(id: number): Promise<ApiResponse<ITaxCategories>>;
    /**
     * List taxcategories with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of taxcategories
     */
    list(query?: ITaxCategoriesQuery): Promise<ApiResponse<ITaxCategories[]>>;
}
//# sourceMappingURL=taxcategories.d.ts.map