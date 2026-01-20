import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICompanyCategories {
    id?: number;
    [key: string]: any;
}
export interface ICompanyCategoriesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * CompanyCategories entity class for Autotask API
 *
 * Categories for organizing companies
 * Supported Operations: GET
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyCategoriesEntity.htm}
 */
export declare class CompanyCategories extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a companycategories by ID
     * @param id - The companycategories ID
     * @returns Promise with the companycategories data
     */
    get(id: number): Promise<ApiResponse<ICompanyCategories>>;
    /**
     * List companycategories with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companycategories
     */
    list(query?: ICompanyCategoriesQuery): Promise<ApiResponse<ICompanyCategories[]>>;
}
//# sourceMappingURL=companycategories.d.ts.map