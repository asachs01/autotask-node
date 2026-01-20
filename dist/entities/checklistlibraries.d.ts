import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IChecklistLibraries {
    id?: number;
    [key: string]: any;
}
export interface IChecklistLibrariesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ChecklistLibraries entity class for Autotask API
 *
 * Libraries of reusable checklists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: checklists
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ChecklistLibrariesEntity.htm}
 */
export declare class ChecklistLibraries extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new checklistlibraries
     * @param checklistLibraries - The checklistlibraries data to create
     * @returns Promise with the created checklistlibraries
     */
    create(checklistLibraries: IChecklistLibraries): Promise<ApiResponse<IChecklistLibraries>>;
    /**
     * Get a checklistlibraries by ID
     * @param id - The checklistlibraries ID
     * @returns Promise with the checklistlibraries data
     */
    get(id: number): Promise<ApiResponse<IChecklistLibraries>>;
    /**
     * Update a checklistlibraries
     * @param id - The checklistlibraries ID
     * @param checklistLibraries - The updated checklistlibraries data
     * @returns Promise with the updated checklistlibraries
     */
    update(id: number, checklistLibraries: Partial<IChecklistLibraries>): Promise<ApiResponse<IChecklistLibraries>>;
    /**
     * Partially update a checklistlibraries
     * @param id - The checklistlibraries ID
     * @param checklistLibraries - The partial checklistlibraries data to update
     * @returns Promise with the updated checklistlibraries
     */
    patch(id: number, checklistLibraries: Partial<IChecklistLibraries>): Promise<ApiResponse<IChecklistLibraries>>;
    /**
     * Delete a checklistlibraries
     * @param id - The checklistlibraries ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List checklistlibraries with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of checklistlibraries
     */
    list(query?: IChecklistLibrariesQuery): Promise<ApiResponse<IChecklistLibraries[]>>;
}
//# sourceMappingURL=checklistlibraries.d.ts.map