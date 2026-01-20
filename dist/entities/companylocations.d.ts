import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICompanyLocations {
    id?: number;
    [key: string]: any;
}
export interface ICompanyLocationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * CompanyLocations entity class for Autotask API
 *
 * Physical locations associated with companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyLocationsEntity.htm}
 */
export declare class CompanyLocations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new companylocations
     * @param companyLocations - The companylocations data to create
     * @returns Promise with the created companylocations
     */
    create(companyLocations: ICompanyLocations): Promise<ApiResponse<ICompanyLocations>>;
    /**
     * Get a companylocations by ID
     * @param id - The companylocations ID
     * @returns Promise with the companylocations data
     */
    get(id: number): Promise<ApiResponse<ICompanyLocations>>;
    /**
     * Update a companylocations
     * @param id - The companylocations ID
     * @param companyLocations - The updated companylocations data
     * @returns Promise with the updated companylocations
     */
    update(id: number, companyLocations: Partial<ICompanyLocations>): Promise<ApiResponse<ICompanyLocations>>;
    /**
     * Partially update a companylocations
     * @param id - The companylocations ID
     * @param companyLocations - The partial companylocations data to update
     * @returns Promise with the updated companylocations
     */
    patch(id: number, companyLocations: Partial<ICompanyLocations>): Promise<ApiResponse<ICompanyLocations>>;
    /**
     * Delete a companylocations
     * @param id - The companylocations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List companylocations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companylocations
     */
    list(query?: ICompanyLocationsQuery): Promise<ApiResponse<ICompanyLocations[]>>;
}
//# sourceMappingURL=companylocations.d.ts.map