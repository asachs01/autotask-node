import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICompanySiteConfigurations {
    id?: number;
    [key: string]: any;
}
export interface ICompanySiteConfigurationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * CompanySiteConfigurations entity class for Autotask API
 *
 * Site configurations for companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanySiteConfigurationsEntity.htm}
 */
export declare class CompanySiteConfigurations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new companysiteconfigurations
     * @param companySiteConfigurations - The companysiteconfigurations data to create
     * @returns Promise with the created companysiteconfigurations
     */
    create(companySiteConfigurations: ICompanySiteConfigurations): Promise<ApiResponse<ICompanySiteConfigurations>>;
    /**
     * Get a companysiteconfigurations by ID
     * @param id - The companysiteconfigurations ID
     * @returns Promise with the companysiteconfigurations data
     */
    get(id: number): Promise<ApiResponse<ICompanySiteConfigurations>>;
    /**
     * Update a companysiteconfigurations
     * @param id - The companysiteconfigurations ID
     * @param companySiteConfigurations - The updated companysiteconfigurations data
     * @returns Promise with the updated companysiteconfigurations
     */
    update(id: number, companySiteConfigurations: Partial<ICompanySiteConfigurations>): Promise<ApiResponse<ICompanySiteConfigurations>>;
    /**
     * Partially update a companysiteconfigurations
     * @param id - The companysiteconfigurations ID
     * @param companySiteConfigurations - The partial companysiteconfigurations data to update
     * @returns Promise with the updated companysiteconfigurations
     */
    patch(id: number, companySiteConfigurations: Partial<ICompanySiteConfigurations>): Promise<ApiResponse<ICompanySiteConfigurations>>;
    /**
     * Delete a companysiteconfigurations
     * @param id - The companysiteconfigurations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List companysiteconfigurations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companysiteconfigurations
     */
    list(query?: ICompanySiteConfigurationsQuery): Promise<ApiResponse<ICompanySiteConfigurations[]>>;
}
//# sourceMappingURL=companysiteconfigurations.d.ts.map