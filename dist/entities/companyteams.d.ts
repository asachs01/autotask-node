import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICompanyTeams {
    id?: number;
    [key: string]: any;
}
export interface ICompanyTeamsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * CompanyTeams entity class for Autotask API
 *
 * Teams associated with companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyTeamsEntity.htm}
 */
export declare class CompanyTeams extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new companyteams
     * @param companyTeams - The companyteams data to create
     * @returns Promise with the created companyteams
     */
    create(companyTeams: ICompanyTeams): Promise<ApiResponse<ICompanyTeams>>;
    /**
     * Get a companyteams by ID
     * @param id - The companyteams ID
     * @returns Promise with the companyteams data
     */
    get(id: number): Promise<ApiResponse<ICompanyTeams>>;
    /**
     * Update a companyteams
     * @param id - The companyteams ID
     * @param companyTeams - The updated companyteams data
     * @returns Promise with the updated companyteams
     */
    update(id: number, companyTeams: Partial<ICompanyTeams>): Promise<ApiResponse<ICompanyTeams>>;
    /**
     * Partially update a companyteams
     * @param id - The companyteams ID
     * @param companyTeams - The partial companyteams data to update
     * @returns Promise with the updated companyteams
     */
    patch(id: number, companyTeams: Partial<ICompanyTeams>): Promise<ApiResponse<ICompanyTeams>>;
    /**
     * Delete a companyteams
     * @param id - The companyteams ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List companyteams with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companyteams
     */
    list(query?: ICompanyTeamsQuery): Promise<ApiResponse<ICompanyTeams[]>>;
}
//# sourceMappingURL=companyteams.d.ts.map