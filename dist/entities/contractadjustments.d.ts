import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ContractAdjustment {
    id?: number;
    [key: string]: any;
}
export interface ContractAdjustmentQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractAdjustments entity class for Autotask API
 *
 * Provides CRUD operations for contractadjustments
 * Supported Operations: GET, POST, PUT, PATCH
 *
 * Capabilities:
 * - UDFs: Not supported
 * - Webhooks: Not supported
 * - Child Collections: No
 * - Impersonation: Not supported
 *
 * @see {@link https://autotask.net/help/developerhelp/content/apis/rest/Entities/ContractAdjustmentsEntity.htm}
 */
export declare class ContractAdjustments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractadjustment
     * @param contractAdjustment - The contractadjustment data to create
     * @returns Promise with the created contractadjustment
     */
    create(contractAdjustment: ContractAdjustment): Promise<ApiResponse<ContractAdjustment>>;
    /**
     * Get a contractadjustment by ID
     * @param id - The contractadjustment ID
     * @returns Promise with the contractadjustment data
     */
    get(id: number): Promise<ApiResponse<ContractAdjustment>>;
    /**
     * Update a contractadjustment
     * @param id - The contractadjustment ID
     * @param contractAdjustment - The updated contractadjustment data
     * @returns Promise with the updated contractadjustment
     */
    update(id: number, contractAdjustment: Partial<ContractAdjustment>): Promise<ApiResponse<ContractAdjustment>>;
    /**
     * Partially update a contractadjustment
     * @param id - The contractadjustment ID
     * @param contractAdjustment - The partial contractadjustment data to update
     * @returns Promise with the updated contractadjustment
     */
    patch(id: number, contractAdjustment: Partial<ContractAdjustment>): Promise<ApiResponse<ContractAdjustment>>;
    /**
     * List contractadjustments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractadjustments
     */
    list(query?: ContractAdjustmentQuery): Promise<ApiResponse<ContractAdjustment[]>>;
}
//# sourceMappingURL=contractadjustments.d.ts.map