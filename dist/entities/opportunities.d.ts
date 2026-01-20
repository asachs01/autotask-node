import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IOpportunities {
    id?: number;
    [key: string]: any;
}
export interface IOpportunitiesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Opportunities entity class for Autotask API
 *
 * Sales opportunities and pipeline
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OpportunitiesEntity.htm}
 */
export declare class Opportunities extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new opportunities
     * @param opportunities - The opportunities data to create
     * @returns Promise with the created opportunities
     */
    create(opportunities: IOpportunities): Promise<ApiResponse<IOpportunities>>;
    /**
     * Get a opportunities by ID
     * @param id - The opportunities ID
     * @returns Promise with the opportunities data
     */
    get(id: number): Promise<ApiResponse<IOpportunities>>;
    /**
     * Update a opportunities
     * @param id - The opportunities ID
     * @param opportunities - The updated opportunities data
     * @returns Promise with the updated opportunities
     */
    update(id: number, opportunities: Partial<IOpportunities>): Promise<ApiResponse<IOpportunities>>;
    /**
     * Partially update a opportunities
     * @param id - The opportunities ID
     * @param opportunities - The partial opportunities data to update
     * @returns Promise with the updated opportunities
     */
    patch(id: number, opportunities: Partial<IOpportunities>): Promise<ApiResponse<IOpportunities>>;
    /**
     * List opportunities with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of opportunities
     */
    list(query?: IOpportunitiesQuery): Promise<ApiResponse<IOpportunities[]>>;
}
//# sourceMappingURL=opportunities.d.ts.map