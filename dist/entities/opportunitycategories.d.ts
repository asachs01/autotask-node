import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IOpportunityCategories {
    id?: number;
    [key: string]: any;
}
export interface IOpportunityCategoriesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * OpportunityCategories entity class for Autotask API
 *
 * Categories for organizing opportunities
 * Supported Operations: GET
 * Category: sales
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OpportunityCategories.htm}
 */
export declare class OpportunityCategories extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a opportunitycategories by ID
     * @param id - The opportunitycategories ID
     * @returns Promise with the opportunitycategories data
     */
    get(id: number): Promise<ApiResponse<IOpportunityCategories>>;
    /**
     * List opportunitycategories with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of opportunitycategories
     */
    list(query?: IOpportunityCategoriesQuery): Promise<ApiResponse<IOpportunityCategories[]>>;
}
//# sourceMappingURL=opportunitycategories.d.ts.map