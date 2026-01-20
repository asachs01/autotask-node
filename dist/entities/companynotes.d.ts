import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICompanyNotes {
    id?: number;
    [key: string]: any;
}
export interface ICompanyNotesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * CompanyNotes entity class for Autotask API
 *
 * Notes associated with companies
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyNotesEntity.htm}
 */
export declare class CompanyNotes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new companynotes
     * @param companyNotes - The companynotes data to create
     * @returns Promise with the created companynotes
     */
    create(companyNotes: ICompanyNotes): Promise<ApiResponse<ICompanyNotes>>;
    /**
     * Get a companynotes by ID
     * @param id - The companynotes ID
     * @returns Promise with the companynotes data
     */
    get(id: number): Promise<ApiResponse<ICompanyNotes>>;
    /**
     * Update a companynotes
     * @param id - The companynotes ID
     * @param companyNotes - The updated companynotes data
     * @returns Promise with the updated companynotes
     */
    update(id: number, companyNotes: Partial<ICompanyNotes>): Promise<ApiResponse<ICompanyNotes>>;
    /**
     * Partially update a companynotes
     * @param id - The companynotes ID
     * @param companyNotes - The partial companynotes data to update
     * @returns Promise with the updated companynotes
     */
    patch(id: number, companyNotes: Partial<ICompanyNotes>): Promise<ApiResponse<ICompanyNotes>>;
    /**
     * List companynotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companynotes
     */
    list(query?: ICompanyNotesQuery): Promise<ApiResponse<ICompanyNotes[]>>;
}
//# sourceMappingURL=companynotes.d.ts.map