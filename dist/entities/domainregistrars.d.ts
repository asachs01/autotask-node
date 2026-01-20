import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDomainRegistrars {
    id?: number;
    [key: string]: any;
}
export interface IDomainRegistrarsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DomainRegistrars entity class for Autotask API
 *
 * Domain registrar information
 * Supported Operations: GET
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DomainRegistrarsEntity.htm}
 */
export declare class DomainRegistrars extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a domainregistrars by ID
     * @param id - The domainregistrars ID
     * @returns Promise with the domainregistrars data
     */
    get(id: number): Promise<ApiResponse<IDomainRegistrars>>;
    /**
     * List domainregistrars with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of domainregistrars
     */
    list(query?: IDomainRegistrarsQuery): Promise<ApiResponse<IDomainRegistrars[]>>;
}
//# sourceMappingURL=domainregistrars.d.ts.map