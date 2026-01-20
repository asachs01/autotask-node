import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IClassificationIcons {
    id?: number;
    [key: string]: any;
}
export interface IClassificationIconsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ClassificationIcons entity class for Autotask API
 *
 * Icons for classification purposes
 * Supported Operations: GET
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ClassificationIconsEntity.htm}
 */
export declare class ClassificationIcons extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a classificationicons by ID
     * @param id - The classificationicons ID
     * @returns Promise with the classificationicons data
     */
    get(id: number): Promise<ApiResponse<IClassificationIcons>>;
    /**
     * List classificationicons with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of classificationicons
     */
    list(query?: IClassificationIconsQuery): Promise<ApiResponse<IClassificationIcons[]>>;
}
//# sourceMappingURL=classificationicons.d.ts.map