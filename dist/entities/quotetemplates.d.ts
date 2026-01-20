import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IQuoteTemplates {
    id?: number;
    [key: string]: any;
}
export interface IQuoteTemplatesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * QuoteTemplates entity class for Autotask API
 *
 * Templates for generating quotes
 * Supported Operations: GET
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/QuoteTemplatesEntity.htm}
 */
export declare class QuoteTemplates extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a quotetemplates by ID
     * @param id - The quotetemplates ID
     * @returns Promise with the quotetemplates data
     */
    get(id: number): Promise<ApiResponse<IQuoteTemplates>>;
    /**
     * List quotetemplates with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of quotetemplates
     */
    list(query?: IQuoteTemplatesQuery): Promise<ApiResponse<IQuoteTemplates[]>>;
}
//# sourceMappingURL=quotetemplates.d.ts.map