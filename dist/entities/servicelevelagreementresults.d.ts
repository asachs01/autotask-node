import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IServiceLevelAgreementResults {
    id?: number;
    [key: string]: any;
}
export interface IServiceLevelAgreementResultsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ServiceLevelAgreementResults entity class for Autotask API
 *
 * Results and performance metrics for SLAs
 * Supported Operations: GET
 * Category: associations
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceLevelAgreementResultsEntity.htm}
 */
export declare class ServiceLevelAgreementResults extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a servicelevelagreementresults by ID
     * @param id - The servicelevelagreementresults ID
     * @returns Promise with the servicelevelagreementresults data
     */
    get(id: number): Promise<ApiResponse<IServiceLevelAgreementResults>>;
    /**
     * List servicelevelagreementresults with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicelevelagreementresults
     */
    list(query?: IServiceLevelAgreementResultsQuery): Promise<ApiResponse<IServiceLevelAgreementResults[]>>;
}
//# sourceMappingURL=servicelevelagreementresults.d.ts.map