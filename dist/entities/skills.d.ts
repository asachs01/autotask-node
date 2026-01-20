import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ISkills {
    id?: number;
    [key: string]: any;
}
export interface ISkillsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Skills entity class for Autotask API
 *
 * Available skills for resource assignment
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SkillsEntity.htm}
 */
export declare class Skills extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new skills
     * @param skills - The skills data to create
     * @returns Promise with the created skills
     */
    create(skills: ISkills): Promise<ApiResponse<ISkills>>;
    /**
     * Get a skills by ID
     * @param id - The skills ID
     * @returns Promise with the skills data
     */
    get(id: number): Promise<ApiResponse<ISkills>>;
    /**
     * Update a skills
     * @param id - The skills ID
     * @param skills - The updated skills data
     * @returns Promise with the updated skills
     */
    update(id: number, skills: Partial<ISkills>): Promise<ApiResponse<ISkills>>;
    /**
     * Partially update a skills
     * @param id - The skills ID
     * @param skills - The partial skills data to update
     * @returns Promise with the updated skills
     */
    patch(id: number, skills: Partial<ISkills>): Promise<ApiResponse<ISkills>>;
    /**
     * Delete a skills
     * @param id - The skills ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List skills with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of skills
     */
    list(query?: ISkillsQuery): Promise<ApiResponse<ISkills[]>>;
}
//# sourceMappingURL=skills.d.ts.map