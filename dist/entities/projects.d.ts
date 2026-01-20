import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IProjects {
    id?: number;
    [key: string]: any;
}
export interface IProjectsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Projects entity class for Autotask API
 *
 * Client projects and work orders
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectsEntity.htm}
 */
export declare class Projects extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new projects
     * @param projects - The projects data to create
     * @returns Promise with the created projects
     */
    create(projects: IProjects): Promise<ApiResponse<IProjects>>;
    /**
     * Get a projects by ID
     * @param id - The projects ID
     * @returns Promise with the projects data
     */
    get(id: number): Promise<ApiResponse<IProjects>>;
    /**
     * Update a projects
     * @param id - The projects ID
     * @param projects - The updated projects data
     * @returns Promise with the updated projects
     */
    update(id: number, projects: Partial<IProjects>): Promise<ApiResponse<IProjects>>;
    /**
     * Partially update a projects
     * @param id - The projects ID
     * @param projects - The partial projects data to update
     * @returns Promise with the updated projects
     */
    patch(id: number, projects: Partial<IProjects>): Promise<ApiResponse<IProjects>>;
    /**
     * Delete a projects
     * @param id - The projects ID to delete
     * @returns Promise with void response
     */
    delete(id: number): Promise<void>;
    /**
     * List projects with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of projects
     */
    list(query?: IProjectsQuery): Promise<ApiResponse<IProjects[]>>;
}
//# sourceMappingURL=projects.d.ts.map