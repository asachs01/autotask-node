import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractServiceAdjustments {
    id?: number;
    [key: string]: any;
}
export interface IContractServiceAdjustmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractServiceAdjustments entity class for Autotask API
 *
 * Adjustments to contract services
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceAdjustmentsEntity.htm}
 */
export declare class ContractServiceAdjustments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractserviceadjustments
     * @param contractServiceAdjustments - The contractserviceadjustments data to create
     * @returns Promise with the created contractserviceadjustments
     */
    create(contractServiceAdjustments: IContractServiceAdjustments): Promise<ApiResponse<IContractServiceAdjustments>>;
    /**
     * Get a contractserviceadjustments by ID
     * @param id - The contractserviceadjustments ID
     * @returns Promise with the contractserviceadjustments data
     */
    get(id: number): Promise<ApiResponse<IContractServiceAdjustments>>;
    /**
     * Update a contractserviceadjustments
     * @param id - The contractserviceadjustments ID
     * @param contractServiceAdjustments - The updated contractserviceadjustments data
     * @returns Promise with the updated contractserviceadjustments
     */
    update(id: number, contractServiceAdjustments: Partial<IContractServiceAdjustments>): Promise<ApiResponse<IContractServiceAdjustments>>;
    /**
     * Partially update a contractserviceadjustments
     * @param id - The contractserviceadjustments ID
     * @param contractServiceAdjustments - The partial contractserviceadjustments data to update
     * @returns Promise with the updated contractserviceadjustments
     */
    patch(id: number, contractServiceAdjustments: Partial<IContractServiceAdjustments>): Promise<ApiResponse<IContractServiceAdjustments>>;
    /**
     * Delete a contractserviceadjustments
     * @param id - The contractserviceadjustments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractserviceadjustments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractserviceadjustments
     */
    list(query?: IContractServiceAdjustmentsQuery): Promise<ApiResponse<IContractServiceAdjustments[]>>;
}
//# sourceMappingURL=contractserviceadjustments.d.ts.map