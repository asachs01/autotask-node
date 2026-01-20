import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IProjectNotes {
    id?: number;
    [key: string]: any;
}
export interface IProjectNotesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ProjectNotes entity class for Autotask API
 *
 * Notes for projects
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectNotesEntity.htm}
 */
export declare class ProjectNotes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new projectnotes
     * @param projectNotes - The projectnotes data to create
     * @returns Promise with the created projectnotes
     */
    create(projectNotes: IProjectNotes): Promise<ApiResponse<IProjectNotes>>;
    /**
     * Get a projectnotes by ID
     * @param id - The projectnotes ID
     * @returns Promise with the projectnotes data
     */
    get(id: number): Promise<ApiResponse<IProjectNotes>>;
    /**
     * Update a projectnotes
     * @param id - The projectnotes ID
     * @param projectNotes - The updated projectnotes data
     * @returns Promise with the updated projectnotes
     */
    update(id: number, projectNotes: Partial<IProjectNotes>): Promise<ApiResponse<IProjectNotes>>;
    /**
     * Partially update a projectnotes
     * @param id - The projectnotes ID
     * @param projectNotes - The partial projectnotes data to update
     * @returns Promise with the updated projectnotes
     */
    patch(id: number, projectNotes: Partial<IProjectNotes>): Promise<ApiResponse<IProjectNotes>>;
    /**
     * List projectnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of projectnotes
     */
    list(query?: IProjectNotesQuery): Promise<ApiResponse<IProjectNotes[]>>;
}
//# sourceMappingURL=projectnotes.d.ts.map