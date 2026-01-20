import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResourceSkills {
    id?: number;
    [key: string]: any;
}
export interface IResourceSkillsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ResourceSkills entity class for Autotask API
 *
 * Skills associated with resources
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceSkillsEntity.htm}
 */
export declare class ResourceSkills extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new resourceskills
     * @param resourceSkills - The resourceskills data to create
     * @returns Promise with the created resourceskills
     */
    create(resourceSkills: IResourceSkills): Promise<ApiResponse<IResourceSkills>>;
    /**
     * Get a resourceskills by ID
     * @param id - The resourceskills ID
     * @returns Promise with the resourceskills data
     */
    get(id: number): Promise<ApiResponse<IResourceSkills>>;
    /**
     * Update a resourceskills
     * @param id - The resourceskills ID
     * @param resourceSkills - The updated resourceskills data
     * @returns Promise with the updated resourceskills
     */
    update(id: number, resourceSkills: Partial<IResourceSkills>): Promise<ApiResponse<IResourceSkills>>;
    /**
     * Partially update a resourceskills
     * @param id - The resourceskills ID
     * @param resourceSkills - The partial resourceskills data to update
     * @returns Promise with the updated resourceskills
     */
    patch(id: number, resourceSkills: Partial<IResourceSkills>): Promise<ApiResponse<IResourceSkills>>;
    /**
     * Delete a resourceskills
     * @param id - The resourceskills ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List resourceskills with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourceskills
     */
    list(query?: IResourceSkillsQuery): Promise<ApiResponse<IResourceSkills[]>>;
}
//# sourceMappingURL=resourceskills.d.ts.map