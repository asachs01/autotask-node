import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICompanyToDos {
    id?: number;
    [key: string]: any;
}
export interface ICompanyToDosQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * CompanyToDos entity class for Autotask API
 *
 * To-do items associated with companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyToDosEntity.htm}
 */
export declare class CompanyToDos extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new companytodos
     * @param companyToDos - The companytodos data to create
     * @returns Promise with the created companytodos
     */
    create(companyToDos: ICompanyToDos): Promise<ApiResponse<ICompanyToDos>>;
    /**
     * Get a companytodos by ID
     * @param id - The companytodos ID
     * @returns Promise with the companytodos data
     */
    get(id: number): Promise<ApiResponse<ICompanyToDos>>;
    /**
     * Update a companytodos
     * @param id - The companytodos ID
     * @param companyToDos - The updated companytodos data
     * @returns Promise with the updated companytodos
     */
    update(id: number, companyToDos: Partial<ICompanyToDos>): Promise<ApiResponse<ICompanyToDos>>;
    /**
     * Partially update a companytodos
     * @param id - The companytodos ID
     * @param companyToDos - The partial companytodos data to update
     * @returns Promise with the updated companytodos
     */
    patch(id: number, companyToDos: Partial<ICompanyToDos>): Promise<ApiResponse<ICompanyToDos>>;
    /**
     * Delete a companytodos
     * @param id - The companytodos ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List companytodos with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companytodos
     */
    list(query?: ICompanyToDosQuery): Promise<ApiResponse<ICompanyToDos[]>>;
}
//# sourceMappingURL=companytodos.d.ts.map