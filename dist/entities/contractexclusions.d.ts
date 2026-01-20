import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ContractExclusion {
    id?: number;
    [key: string]: any;
}
export interface ContractExclusionQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractExclusions entity class for Autotask API
 *
 * Provides CRUD operations for contractexclusions
 * Supported Operations: GET, POST, PUT, PATCH
 *
 * Capabilities:
 * - UDFs: Not supported
 * - Webhooks: Not supported
 * - Child Collections: No
 * - Impersonation: Not supported
 *
 * @see {@link https://autotask.net/help/developerhelp/content/apis/rest/Entities/ContractExclusionsEntity.htm}
 */
export declare class ContractExclusions extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractexclusion
     * @param contractExclusion - The contractexclusion data to create
     * @returns Promise with the created contractexclusion
     */
    create(contractExclusion: ContractExclusion): Promise<ApiResponse<ContractExclusion>>;
    /**
     * Get a contractexclusion by ID
     * @param id - The contractexclusion ID
     * @returns Promise with the contractexclusion data
     */
    get(id: number): Promise<ApiResponse<ContractExclusion>>;
    /**
     * Update a contractexclusion
     * @param id - The contractexclusion ID
     * @param contractExclusion - The updated contractexclusion data
     * @returns Promise with the updated contractexclusion
     */
    update(id: number, contractExclusion: Partial<ContractExclusion>): Promise<ApiResponse<ContractExclusion>>;
    /**
     * Partially update a contractexclusion
     * @param id - The contractexclusion ID
     * @param contractExclusion - The partial contractexclusion data to update
     * @returns Promise with the updated contractexclusion
     */
    patch(id: number, contractExclusion: Partial<ContractExclusion>): Promise<ApiResponse<ContractExclusion>>;
    /**
     * List contractexclusions with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractexclusions
     */
    list(query?: ContractExclusionQuery): Promise<ApiResponse<ContractExclusion[]>>;
}
//# sourceMappingURL=contractexclusions.d.ts.map