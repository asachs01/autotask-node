import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ISurveyResults {
    id?: number;
    [key: string]: any;
}
export interface ISurveyResultsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * SurveyResults entity class for Autotask API
 *
 * Results from customer satisfaction surveys
 * Supported Operations: GET
 * Category: surveys
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SurveyResultsEntity.htm}
 */
export declare class SurveyResults extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a surveyresults by ID
     * @param id - The surveyresults ID
     * @returns Promise with the surveyresults data
     */
    get(id: number): Promise<ApiResponse<ISurveyResults>>;
    /**
     * List surveyresults with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of surveyresults
     */
    list(query?: ISurveyResultsQuery): Promise<ApiResponse<ISurveyResults[]>>;
}
//# sourceMappingURL=surveyresults.d.ts.map