import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICompanies {
    id?: number;
    [key: string]: any;
}
export interface ICompaniesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Companies entity class for Autotask API
 *
 * Organizations and companies in Autotask
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompaniesEntity.htm}
 */
export declare class Companies extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new companies
     * @param companies - The companies data to create
     * @returns Promise with the created companies
     */
    create(companies: ICompanies): Promise<ApiResponse<ICompanies>>;
    /**
     * Get a companies by ID
     * @param id - The companies ID
     * @returns Promise with the companies data
     */
    get(id: number): Promise<ApiResponse<ICompanies>>;
    /**
     * Update a companies
     * @param id - The companies ID
     * @param companies - The updated companies data
     * @returns Promise with the updated companies
     */
    update(id: number, companies: Partial<ICompanies>): Promise<ApiResponse<ICompanies>>;
    /**
     * Partially update a companies
     * @param id - The companies ID
     * @param companies - The partial companies data to update
     * @returns Promise with the updated companies
     */
    patch(id: number, companies: Partial<ICompanies>): Promise<ApiResponse<ICompanies>>;
    /**
     * List companies with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companies
     */
    list(query?: ICompaniesQuery): Promise<ApiResponse<ICompanies[]>>;
}
//# sourceMappingURL=companies.d.ts.map