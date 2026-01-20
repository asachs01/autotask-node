import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICompanyAlerts {
    id?: number;
    [key: string]: any;
}
export interface ICompanyAlertsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * CompanyAlerts entity class for Autotask API
 *
 * Alerts associated with companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: notifications
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyAlertsEntity.htm}
 */
export declare class CompanyAlerts extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new companyalerts
     * @param companyAlerts - The companyalerts data to create
     * @returns Promise with the created companyalerts
     */
    create(companyAlerts: ICompanyAlerts): Promise<ApiResponse<ICompanyAlerts>>;
    /**
     * Get a companyalerts by ID
     * @param id - The companyalerts ID
     * @returns Promise with the companyalerts data
     */
    get(id: number): Promise<ApiResponse<ICompanyAlerts>>;
    /**
     * Update a companyalerts
     * @param id - The companyalerts ID
     * @param companyAlerts - The updated companyalerts data
     * @returns Promise with the updated companyalerts
     */
    update(id: number, companyAlerts: Partial<ICompanyAlerts>): Promise<ApiResponse<ICompanyAlerts>>;
    /**
     * Partially update a companyalerts
     * @param id - The companyalerts ID
     * @param companyAlerts - The partial companyalerts data to update
     * @returns Promise with the updated companyalerts
     */
    patch(id: number, companyAlerts: Partial<ICompanyAlerts>): Promise<ApiResponse<ICompanyAlerts>>;
    /**
     * Delete a companyalerts
     * @param id - The companyalerts ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List companyalerts with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companyalerts
     */
    list(query?: ICompanyAlertsQuery): Promise<ApiResponse<ICompanyAlerts[]>>;
}
//# sourceMappingURL=companyalerts.d.ts.map