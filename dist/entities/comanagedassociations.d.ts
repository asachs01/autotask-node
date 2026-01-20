import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IComanagedAssociations {
    id?: number;
    [key: string]: any;
}
export interface IComanagedAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ComanagedAssociations entity class for Autotask API
 *
 * Co-managed service associations
 * Supported Operations: GET, POST, DELETE
 * Category: associations
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ComanagedAssociationsEntity.htm}
 */
export declare class ComanagedAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new comanagedassociations
     * @param comanagedAssociations - The comanagedassociations data to create
     * @returns Promise with the created comanagedassociations
     */
    create(comanagedAssociations: IComanagedAssociations): Promise<ApiResponse<IComanagedAssociations>>;
    /**
     * Get a comanagedassociations by ID
     * @param id - The comanagedassociations ID
     * @returns Promise with the comanagedassociations data
     */
    get(id: number): Promise<ApiResponse<IComanagedAssociations>>;
    /**
     * Delete a comanagedassociations
     * @param id - The comanagedassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List comanagedassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of comanagedassociations
     */
    list(query?: IComanagedAssociationsQuery): Promise<ApiResponse<IComanagedAssociations[]>>;
}
//# sourceMappingURL=comanagedassociations.d.ts.map