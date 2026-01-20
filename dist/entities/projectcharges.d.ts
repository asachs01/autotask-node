import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IProjectCharges {
    id?: number;
    [key: string]: any;
}
export interface IProjectChargesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ProjectCharges entity class for Autotask API
 *
 * Charges associated with projects
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: tasks
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectChargesEntity.htm}
 */
export declare class ProjectCharges extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new projectcharges
     * @param projectCharges - The projectcharges data to create
     * @returns Promise with the created projectcharges
     */
    create(projectCharges: IProjectCharges): Promise<ApiResponse<IProjectCharges>>;
    /**
     * Get a projectcharges by ID
     * @param id - The projectcharges ID
     * @returns Promise with the projectcharges data
     */
    get(id: number): Promise<ApiResponse<IProjectCharges>>;
    /**
     * Update a projectcharges
     * @param id - The projectcharges ID
     * @param projectCharges - The updated projectcharges data
     * @returns Promise with the updated projectcharges
     */
    update(id: number, projectCharges: Partial<IProjectCharges>): Promise<ApiResponse<IProjectCharges>>;
    /**
     * Partially update a projectcharges
     * @param id - The projectcharges ID
     * @param projectCharges - The partial projectcharges data to update
     * @returns Promise with the updated projectcharges
     */
    patch(id: number, projectCharges: Partial<IProjectCharges>): Promise<ApiResponse<IProjectCharges>>;
    /**
     * Delete a projectcharges
     * @param id - The projectcharges ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List projectcharges with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of projectcharges
     */
    list(query?: IProjectChargesQuery): Promise<ApiResponse<IProjectCharges[]>>;
}
//# sourceMappingURL=projectcharges.d.ts.map