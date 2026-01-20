import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ISurveys {
    id?: number;
    [key: string]: any;
}
export interface ISurveysQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Surveys entity class for Autotask API
 *
 * Customer satisfaction surveys
 * Supported Operations: GET
 * Category: surveys
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SurveysEntity.htm}
 */
export declare class Surveys extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a surveys by ID
     * @param id - The surveys ID
     * @returns Promise with the surveys data
     */
    get(id: number): Promise<ApiResponse<ISurveys>>;
    /**
     * List surveys with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of surveys
     */
    list(query?: ISurveysQuery): Promise<ApiResponse<ISurveys[]>>;
}
//# sourceMappingURL=surveys.d.ts.map